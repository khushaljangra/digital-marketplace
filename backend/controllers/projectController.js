import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Project from '../models/Project.js';
import Subscriber from '../models/Subscriber.js';
import { sendNewProjectEmail } from '../config/mail.js';
import Order from '../models/Order.js';
import DownloadLog from '../models/DownloadLog.js';
import {
  saveFileToStorage,
  generateSignedDownloadUrl,
  getSecureFilePath,
  deleteFileFromStorage,
} from '../config/storage.js';
import { isDbConnected, mockDb } from '../config/mockDb.js';

/**
 * @desc    Get all projects (search, filter, paginate)
 * @route   GET /api/projects
 * @access  Public
 */
export const getProjects = async (req, res) => {
  const { search, category, minPrice, maxPrice, sort } = req.query;

  try {
    if (!isDbConnected()) {
      let filtered = [...mockDb.projects];
      if (category && category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
      }
      if (search) {
        filtered = filtered.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()));
      }
      if (minPrice) {
        filtered = filtered.filter(p => p.price >= Number(minPrice));
      }
      if (maxPrice) {
        filtered = filtered.filter(p => p.price <= Number(maxPrice));
      }
      // Apply simple mock sorting
      if (sort === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sort === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sort === 'rating') {
        filtered.sort((a, b) => b.ratings.average - a.ratings.average);
      } else if (sort === 'popular') {
        filtered.sort((a, b) => b.downloadCount - a.downloadCount);
      }
      return res.json({ success: true, count: filtered.length, projects: filtered });
    }
    let query = {};

    // Search query
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let apiQuery = Project.find(query);

    // Sorting
    if (sort) {
      if (sort === 'price-low') {
        apiQuery = apiQuery.sort({ price: 1 });
      } else if (sort === 'price-high') {
        apiQuery = apiQuery.sort({ price: -1 });
      } else if (sort === 'rating') {
        apiQuery = apiQuery.sort({ 'ratings.average': -1 });
      } else if (sort === 'popular') {
        apiQuery = apiQuery.sort({ downloadCount: -1 });
      } else {
        apiQuery = apiQuery.sort({ createdAt: -1 });
      }
    } else {
      apiQuery = apiQuery.sort({ createdAt: -1 });
    }

    const projects = await apiQuery.populate('createdBy', 'name');
    res.json({ success: true, count: projects.length, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get single project details
 * @route   GET /api/projects/:id
 * @access  Public
 */
export const getProjectById = async (req, res) => {
  try {
    if (!isDbConnected()) {
      const project = mockDb.projects.find(p => p._id === req.params.id);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }
      return res.json({ success: true, project });
    }
    const project = await Project.findById(req.params.id).populate('createdBy', 'name');
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create a project (Admin only)
 * @route   POST /api/projects
 * @access  Private/Admin
 */
export const createProject = async (req, res) => {
  try {
    const { title, description, price, category, techStack, previewUrls, externalDownloadUrl, upiId } = req.body;

    if (!req.file && !externalDownloadUrl) {
      return res.status(400).json({ success: false, message: 'Please upload a project file or provide a Google Drive / external download link.' });
    }

    let fileData = { fileKey: '', fileName: 'external-link', fileSize: '0 MB' };
    if (req.file) {
      fileData = await saveFileToStorage(req.file);
    }

    // Parse tech stack (assumed sent as comma-separated or JSON string)
    let processedTechStack = [];
    if (techStack) {
      processedTechStack = typeof techStack === 'string'
        ? techStack.split(',').map((s) => s.trim())
        : techStack;
    }

    // Parse preview urls
    let processedPreviewUrls = [];
    if (previewUrls) {
      processedPreviewUrls = typeof previewUrls === 'string'
        ? JSON.parse(previewUrls)
        : previewUrls;
    }

    if (!isDbConnected()) {
      const mockProject = {
        _id: `proj_mock_${Date.now()}`,
        title,
        description,
        price: Number(price),
        category,
        techStack: processedTechStack,
        previewUrls: processedPreviewUrls,
        fileKey: fileData.fileKey,
        fileName: fileData.fileName,
        fileSize: fileData.fileSize,
        externalDownloadUrl: externalDownloadUrl || '',
        upiId: upiId || '',
        createdBy: req.user?._id || 'mock_admin_id',
        ratings: { average: 5, count: 1 },
        downloadCount: 0,
        versions: [
          {
            version: 'v1.0.0',
            fileKey: fileData.fileKey,
            fileName: fileData.fileName,
            releaseNotes: 'Initial release',
          },
        ],
      };
      mockDb.projects.unshift(mockProject);
      return res.status(201).json({ success: true, project: mockProject });
    }

    // DB Mode: Ensure createdBy is a valid ObjectId
    let creatorId = req.user._id;
    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      const User = mongoose.model('User');
      const adminUser = await User.findOne({ role: 'admin' });
      if (adminUser) {
        creatorId = adminUser._id;
      }
    }

    const project = await Project.create({
      title,
      description,
      price: Number(price),
      category,
      techStack: processedTechStack,
      previewUrls: processedPreviewUrls,
      fileKey: fileData.fileKey,
      fileName: fileData.fileName,
      fileSize: fileData.fileSize,
      externalDownloadUrl: externalDownloadUrl || '',
      upiId: upiId || '',
      createdBy: creatorId,
      versions: [
        {
          version: 'v1.0.0',
          fileKey: fileData.fileKey,
          fileName: fileData.fileName,
          releaseNotes: 'Initial release',
        },
      ],
    });

    // Fetch all subscribers and broadcast in background
    if (isDbConnected()) {
      Subscriber.find({}).then((subs) => {
        sendNewProjectEmail(subs, project);
      }).catch((err) => {
        console.error('Error fetching subscribers for project broadcast:', err.message);
      });
    } else {
      const subs = mockDb.subscribers || [];
      sendNewProjectEmail(subs, project);
    }

    res.status(201).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update project (Admin only)
 * @route   PUT /api/projects/:id
 * @access  Private/Admin
 */
export const updateProject = async (req, res) => {
  try {
    const { title, description, price, category, techStack, previewUrls, externalDownloadUrl, upiId } = req.body;

    if (!isDbConnected()) {
      const project = mockDb.projects.find(p => p._id === req.params.id);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }

      project.title = title || project.title;
      project.description = description || project.description;
      project.price = price !== undefined ? Number(price) : project.price;
      project.category = category || project.category;
      project.externalDownloadUrl = externalDownloadUrl !== undefined ? externalDownloadUrl : (project.externalDownloadUrl || '');
      project.upiId = upiId !== undefined ? upiId : (project.upiId || '');

      if (techStack) {
        project.techStack = typeof techStack === 'string'
          ? techStack.split(',').map((s) => s.trim())
          : techStack;
      }

      if (previewUrls) {
        project.previewUrls = typeof previewUrls === 'string'
          ? JSON.parse(previewUrls)
          : previewUrls;
      }

      if (req.file) {
        const fileData = await saveFileToStorage(req.file);
        project.fileKey = fileData.fileKey;
        project.fileName = fileData.fileName;
        project.fileSize = fileData.fileSize;
      }

      return res.json({ success: true, project });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.title = title || project.title;
    project.description = description || project.description;
    project.price = price !== undefined ? Number(price) : project.price;
    project.category = category || project.category;
    project.externalDownloadUrl = externalDownloadUrl !== undefined ? externalDownloadUrl : (project.externalDownloadUrl || '');
    project.upiId = upiId !== undefined ? upiId : (project.upiId || '');

    if (techStack) {
      project.techStack = typeof techStack === 'string'
        ? techStack.split(',').map((s) => s.trim())
        : techStack;
    }

    if (previewUrls) {
      project.previewUrls = typeof previewUrls === 'string'
        ? JSON.parse(previewUrls)
        : previewUrls;
    }

    // If a new file is uploaded
    if (req.file) {
      // Clean up old file (optional, or we keep it since it is in version history)
      // await deleteFileFromStorage(project.fileKey);

      const fileData = await saveFileToStorage(req.file);
      project.fileKey = fileData.fileKey;
      project.fileName = fileData.fileName;
      project.fileSize = fileData.fileSize;

      // Automatically add new version
      const nextVerNum = project.versions.length + 1;
      project.versions.push({
        version: `v1.${nextVerNum}.0`,
        fileKey: fileData.fileKey,
        fileName: fileData.fileName,
        releaseNotes: 'File updated via management panel',
      });
    }

    const updatedProject = await project.save();
    res.json({ success: true, project: updatedProject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete project (Admin only)
 * @route   DELETE /api/projects/:id
 * @access  Private/Admin
 */
export const deleteProject = async (req, res) => {
  try {
    if (!isDbConnected()) {
      const index = mockDb.projects.findIndex(p => p._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }
      mockDb.projects.splice(index, 1);
      return res.json({ success: true, message: 'Project deleted from mock database' });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Delete all associated files in versions, wrap in try-catch to avoid blocking database deletion
    if (project.versions) {
      for (const ver of project.versions) {
        try {
          await deleteFileFromStorage(ver.fileKey);
        } catch (err) {
          console.error(`Failed to delete physical file ${ver.fileKey}:`, err.message);
        }
      }
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Project and associated files deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Add project version update (Admin only)
 * @route   POST /api/projects/:id/versions
 * @access  Private/Admin
 */
export const addProjectVersion = async (req, res) => {
  try {
    const { version, releaseNotes } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload the version file' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const fileData = await saveFileToStorage(req.file);

    project.fileKey = fileData.fileKey;
    project.fileName = fileData.fileName;
    project.fileSize = fileData.fileSize;
    project.versions.push({
      version,
      fileKey: fileData.fileKey,
      fileName: fileData.fileName,
      releaseNotes,
    });

    await project.save();
    res.status(201).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get secure download link for a project
 * @route   GET /api/projects/:id/download-link
 * @access  Private
 */
export const getDownloadLink = async (req, res) => {
  const { versionIndex } = req.query; // optional specific version index

  try {
    const projectId = req.params.id;
    const userId = req.user._id;
    const hostUrl = `${req.protocol}://${req.get('host')}`;

    if (!isDbConnected()) {
      const isOwner = req.user.email === 'user@marketplace.com' || mockDb.orders.some(o => o.user === userId && o.paymentStatus === 'paid' && o.items.some(i => i.project === projectId));
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You must purchase this project before downloading.',
        });
      }
      const project = mockDb.projects.find(p => p._id === projectId);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }
      if (project.externalDownloadUrl) {
        const finalUrl = convertGoogleDriveLink(project.externalDownloadUrl);
        return res.json({ success: true, downloadUrl: finalUrl });
      }
      const downloadUrl = `${hostUrl}/api/projects/download-secure?token=mock_download_token_${projectId}`;
      return res.json({ success: true, downloadUrl });
    }

    // Verify user has purchased this project
    const order = await Order.findOne({
      user: userId,
      paymentStatus: 'paid',
      'items.project': projectId,
    });

    if (!order) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You must purchase this project before downloading.',
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.externalDownloadUrl) {
      const finalUrl = convertGoogleDriveLink(project.externalDownloadUrl);
      return res.json({ success: true, downloadUrl: finalUrl });
    }

    let fileKey = project.fileKey;
    let fileName = project.fileName;

    if (versionIndex !== undefined) {
      const idx = Number(versionIndex);
      if (idx >= 0 && idx < project.versions.length) {
        fileKey = project.versions[idx].fileKey;
        fileName = project.versions[idx].fileName;
      }
    }

    // Generate signed link
    const downloadUrl = generateSignedDownloadUrl(
      fileKey,
      fileName,
      userId.toString(),
      projectId.toString(),
      order._id.toString(),
      hostUrl
    );

    res.json({ success: true, downloadUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Secure file download (Stream file from local/cloud based on JWT)
 * @route   GET /api/projects/download-secure
 * @access  Public (Token verified inside)
 */
export const downloadProjectSecure = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send('Download token is required');
  }

  if (token.startsWith('mock_download_token_')) {
    const projectId = token.replace('mock_download_token_', '');
    const project = mockDb.projects.find(p => p._id === projectId);
    
    if (project && project.fileKey) {
      const filePath = getSecureFilePath(project.fileKey);
      if (fs.existsSync(filePath)) {
        return res.download(filePath, project.fileName);
      }
    }

    res.setHeader('Content-Disposition', `attachment; filename="${project ? project.fileName : 'project-source.zip'}"`);
    return res.send(`Mock cloud download content for project file: ${project ? project.title : 'Project Asset'}`);
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_for_jwt_tokens';
    const decoded = jwt.verify(token, jwtSecret);

    const { fileKey, originalName, userId, projectId, orderId } = decoded;

    // Check if project has Google Drive / external download URL, and redirect directly
    if (!isDbConnected()) {
      const project = mockDb.projects.find(p => p._id === projectId);
      if (project && project.externalDownloadUrl) {
        const finalUrl = convertGoogleDriveLink(project.externalDownloadUrl);
        return res.redirect(finalUrl);
      }
    } else {
      const project = await Project.findById(projectId);
      if (project && project.externalDownloadUrl) {
        const finalUrl = convertGoogleDriveLink(project.externalDownloadUrl);
        return res.redirect(finalUrl);
      }
    }

    // Check if order exists and is paid
    const order = await Order.findById(orderId).populate('user');
    if (!order || order.paymentStatus !== 'paid' || order.user._id.toString() !== userId) {
      return res.status(403).send('Invalid transaction context');
    }

    // Manage download counts / limits
    let log = await DownloadLog.findOne({
      user: userId,
      project: projectId,
      order: orderId,
    });

    if (!log) {
      log = new DownloadLog({
        user: userId,
        project: projectId,
        order: orderId,
        downloadCount: 0,
        maxDownloadsAllowed: 3,
      });
    }

    if (log.downloadCount >= log.maxDownloadsAllowed) {
      return res.status(429).send('Download limit exceeded (Max 3 attempts allowed)');
    }

    // IP-based restriction (Max 2 unique IPs allowed)
    const clientIpRaw = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const clientIp = clientIpRaw ? clientIpRaw.split(',')[0].trim() : 'Unknown IP';

    if (clientIp && clientIp !== 'Unknown IP') {
      const isNewIp = !log.ipAddresses.includes(clientIp);
      if (isNewIp) {
        if (log.ipAddresses.length >= 2) {
          return res.status(403).send('Download blocked: Link accessed from too many different IP locations. Link sharing is prohibited.');
        }
        log.ipAddresses.push(clientIp);
      }
    }

    // Increment downloads
    log.downloadCount += 1;
    log.lastDownloadedAt = new Date();
    await log.save();

    // Increment global download count on the project
    await Project.findByIdAndUpdate(projectId, { $inc: { downloadCount: 1 } });

    // Stream file
    const filePath = getSecureFilePath(fileKey);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Physical file not found on server storage');
    }

    // Watermarking ZIP files dynamically using adm-zip
    if (originalName.toLowerCase().endsWith('.zip')) {
      try {
        const AdmZip = (await import('adm-zip')).default;
        const zip = new AdmZip(filePath);

        const licenseContent = `--------------------------------------------------
APEXMARKET SECURE DIGITAL LICENSE & WATERMARK
--------------------------------------------------
Product ID: ${projectId}
Product Name: ${originalName}
Buyer Name: ${order.user?.name || 'Verified Customer'}
Buyer Email: ${order.user?.email || 'N/A'}
Purchase UTR/Order: ${order.transactionRef || order._id}
Purchase Date: ${order.createdAt}
License Verification IP: ${clientIp}

This file is digitally watermarked. Distribution or sharing of this source code or document is strictly prohibited and subject to legal actions under DMCA / Copyright laws.
--------------------------------------------------`;

        zip.addFile('LICENSE_VERIFICATION.txt', Buffer.from(licenseContent, 'utf-8'), 'Secure license information');
        const zipBuffer = zip.toBuffer();

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${originalName}"`);
        return res.send(zipBuffer);
      } catch (zipError) {
        console.error('ZIP Watermarking failed, falling back to standard download:', zipError.message);
        // Fallback to standard download below
      }
    }

    res.download(filePath, originalName);
  } catch (error) {
    console.error('Download Verification Error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).send('Download link expired. Please generate a new link.');
    }
    return res.status(401).send('Invalid download credentials');
  }
};

export const convertGoogleDriveLink = (url) => {
  if (!url) return '';
  const fileIdRegex = /\/file\/d\/([a-zA-Z0-9_-]+)\b/;
  const openIdRegex = /[?&]id=([a-zA-Z0-9_-]+)\b/;
  const docsIdRegex = /\/d\/([a-zA-Z0-9_-]+)\/(?:edit|view)/;

  let fileId = null;
  
  if (url.includes('drive.google.com/file/d/')) {
    const match = url.match(fileIdRegex);
    if (match) fileId = match[1];
  } else if (url.includes('drive.google.com/open') || url.includes('drive.google.com/uc')) {
    const match = url.match(openIdRegex);
    if (match) fileId = match[1];
  } else if (url.includes('docs.google.com') && url.includes('/d/')) {
    const match = url.match(docsIdRegex);
    if (match) fileId = match[1];
  }

  if (fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  
  return url;
};
