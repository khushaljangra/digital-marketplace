import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure local secure upload directory exists (as fallback)
const SECURE_UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'secure');
if (!fs.existsSync(SECURE_UPLOAD_DIR)) {
  fs.mkdirSync(SECURE_UPLOAD_DIR, { recursive: true });
}

// Firebase Cloud Storage Configuration
const firebaseConfigured =
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY &&
  process.env.FIREBASE_STORAGE_BUCKET;

let bucket = null;

if (firebaseConfigured) {
  try {
    // Format private key (replace escaped newlines if any)
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

    bucket = admin.storage().bucket();
    console.log('Firebase Admin Storage Client Initialized');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error.message);
  }
} else {
  console.log('Firebase credentials missing in .env. Falling back to local secure storage.');
}

/**
 * Save file to secure storage (local or Firebase cloud)
 * @param {Object} file - Express multer file object
 * @returns {Promise<Object>} File metadata (key, name, size)
 */
export const saveFileToStorage = async (file) => {
  const fileKey = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}${path.extname(file.originalname)}`;
  const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
  const fileSizeStr = `${sizeInMB} MB`;

  if (firebaseConfigured && bucket) {
    try {
      const bucketFile = bucket.file(fileKey);
      
      // Save buffer directly to Firebase Storage
      await bucketFile.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
        },
        resumable: false,
      });

      console.log(`File successfully uploaded to Firebase Storage: ${fileKey}`);
      return {
        fileKey,
        fileName: file.originalname,
        fileSize: fileSizeStr,
      };
    } catch (error) {
      console.error('Error uploading file to Firebase, trying local fallback:', error.message);
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
export const generateSignedDownloadUrl = async (fileKey, originalName, userId, projectId, orderId, host = null) => {
  // If Firebase is configured, generate a direct temporary pre-signed URL from Firebase bucket (15 min expiry)
  if (firebaseConfigured && bucket) {
    try {
      const bucketFile = bucket.file(fileKey);
      
      // Generate a signed URL valid for 15 minutes (900 seconds)
      const [url] = await bucketFile.getSignedUrl({
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000, // 15 mins from now
        promptSaveAs: originalName,
      });

      console.log(`Generated Firebase signed URL for ${fileKey}`);
      return url;
    } catch (error) {
      console.error('Error generating Firebase signed URL, falling back to local sign:', error.message);
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
  if (firebaseConfigured && bucket) {
    try {
      const bucketFile = bucket.file(fileKey);
      await bucketFile.delete();
      console.log(`File deleted from Firebase Storage: ${fileKey}`);
      return;
    } catch (error) {
      console.error('Error deleting file from Firebase:', error.message);
    }
  }

  // Local delete fallback
  const filePath = path.join(SECURE_UPLOAD_DIR, fileKey);
  if (fs.existsSync(filePath)) {
    await fs.promises.unlink(filePath);
  }
};
