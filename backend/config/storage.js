import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure local secure upload directory exists (as fallback)
const SECURE_UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'secure');
if (!fs.existsSync(SECURE_UPLOAD_DIR)) {
  fs.mkdirSync(SECURE_UPLOAD_DIR, { recursive: true });
}

// AWS S3 Configuration
const s3Configured = 
  process.env.AWS_ACCESS_KEY_ID && 
  process.env.AWS_SECRET_ACCESS_KEY && 
  process.env.AWS_S3_BUCKET;

let s3Client = null;
if (s3Configured) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  console.log('AWS S3 Storage Client Initialized');
} else {
  console.log('AWS S3 credentials missing in .env. Falling back to local secure storage.');
}

/**
 * Save file to secure storage (local or S3 cloud)
 * @param {Object} file - Express multer file object
 * @returns {Promise<Object>} File metadata (key, name, size)
 */
export const saveFileToStorage = async (file) => {
  const fileKey = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}${path.extname(file.originalname)}`;
  const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
  const fileSizeStr = `${sizeInMB} MB`;

  if (s3Configured && s3Client) {
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      await s3Client.send(new PutObjectCommand(uploadParams));
      console.log(`File successfully uploaded to S3: ${fileKey}`);
      return {
        fileKey,
        fileName: file.originalname,
        fileSize: fileSizeStr,
      };
    } catch (error) {
      console.error('Error uploading file to S3, trying local fallback:', error.message);
      // Fail over to local upload if S3 upload fails
    }
  }

  // Local Secure Storage Fallback
  const destinationPath = path.join(SECURE_UPLOAD_DIR, fileKey);
  await fs.promises.writeFile(destinationPath, file.buffer);

  return {
    fileKey,
    fileName: file.originalname,
    fileSize: fileSizeStr,
  };
};

/**
 * Generate a secure, temporary download URL
 * @param {string} fileKey - Secure key of the file
 * @param {string} originalName - Original filename to send in download headers
 * @param {string} userId - User requesting download
 * @param {string} projectId - Project being downloaded
 * @param {string} orderId - Verified purchase order ID
 * @returns {Promise<string>|string} Secure URL
 */
export const generateSignedDownloadUrl = (fileKey, originalName, userId, projectId, orderId, host = null) => {
  // If S3 is configured, generate a direct temporary pre-signed URL from S3 (15 min expiry)
  if (s3Configured && s3Client) {
    try {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileKey,
        ResponseContentDisposition: `attachment; filename="${originalName}"`,
      });
      // getSignedUrl is synchronous/asynchronous depending on usage, but usually we resolve it
      // Let's create a wrapper or just use standard pre-signed URL generation.
      // S3 pre-signed URL generation doesn't need network request, it is generated instantly
      const s3UrlPromise = getSignedUrl(s3Client, command, { expiresIn: 900 }); // 15 minutes
      return s3UrlPromise; // Returns Promise<string>
    } catch (error) {
      console.error('Error generating S3 pre-signed URL, falling back to local sign:', error.message);
    }
  }

  // Local download token fallback
  const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_for_jwt_tokens';
  const token = jwt.sign(
    {
      fileKey,
      originalName,
      userId,
      projectId,
      orderId,
    },
    jwtSecret,
    { expiresIn: '15m' }
  );

  const serverUrl = host || process.env.SERVER_URL || 'http://localhost:5000';
  return `${serverUrl}/api/projects/download-secure?token=${token}`;
};

/**
 * Resolve local path for secure file download (only for local storage fallback)
 * @param {string} fileKey 
 * @returns {string} Absolute file path
 */
export const getSecureFilePath = (fileKey) => {
  return path.join(SECURE_UPLOAD_DIR, fileKey);
};

/**
 * Delete a file from secure storage
 * @param {string} fileKey 
 */
export const deleteFileFromStorage = async (fileKey) => {
  if (s3Configured && s3Client) {
    try {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileKey,
      }));
      console.log(`File deleted from S3: ${fileKey}`);
      return;
    } catch (error) {
      console.error('Error deleting file from S3:', error.message);
    }
  }

  // Local delete fallback
  const filePath = path.join(SECURE_UPLOAD_DIR, fileKey);
  if (fs.existsSync(filePath)) {
    await fs.promises.unlink(filePath);
  }
};
