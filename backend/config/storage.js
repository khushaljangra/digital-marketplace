import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure local secure upload directory exists
const SECURE_UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'secure');
if (!fs.existsSync(SECURE_UPLOAD_DIR)) {
  fs.mkdirSync(SECURE_UPLOAD_DIR, { recursive: true });
}

/**
 * Save file to secure storage (local or cloud)
 * @param {Object} file - Express multer file object
 * @returns {Promise<Object>} File metadata (key, name, size)
 */
export const saveFileToStorage = async (file) => {
  // If S3 is configured, we would upload to S3 here.
  // For standard/local setup, we move/save the file in the secure uploads directory.
  const fileKey = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}${path.extname(file.originalname)}`;
  const destinationPath = path.join(SECURE_UPLOAD_DIR, fileKey);

  // Write file from buffer
  await fs.promises.writeFile(destinationPath, file.buffer);

  // Format file size
  const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
  const fileSizeStr = `${sizeInMB} MB`;

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
 * @returns {string} Secure URL
 */
export const generateSignedDownloadUrl = (fileKey, originalName, userId, projectId, orderId, host = null) => {
  // Use a secret to sign a temporary token for the file download
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
    { expiresIn: '15m' } // Token expires in 15 minutes
  );

  const serverUrl = host || process.env.SERVER_URL || 'http://localhost:5000';
  return `${serverUrl}/api/projects/download-secure?token=${token}`;
};

/**
 * Resolve local path for secure file download
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
  const filePath = path.join(SECURE_UPLOAD_DIR, fileKey);
  if (fs.existsSync(filePath)) {
    await fs.promises.unlink(filePath);
  }
};
