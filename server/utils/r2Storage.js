const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

/**
 * Cloudflare R2 Storage Utility
 * R2 is S3-compatible, so we use the AWS SDK
 */

// Initialize R2 client
const r2Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = process.env.R2_PUBLIC_URL; // Your R2 public URL or custom domain

/**
 * Upload a file to Cloudflare R2
 * @param {string} filePath - Local path to the file
 * @param {string} fileName - Name to save the file as in R2
 * @returns {Promise<object>} Upload result with URL
 */
const uploadToR2 = async (filePath, fileName) => {
    try {
        // Read the file
        const fileContent = fs.readFileSync(filePath);
        
        // Get content type based on extension
        const ext = path.extname(fileName).toLowerCase();
        const contentTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
        };
        const contentType = contentTypes[ext] || 'application/octet-stream';

        // Generate unique key for the file
        const key = `uploads/${Date.now()}-${fileName}`;

        // Upload to R2
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: fileContent,
            ContentType: contentType,
        });

        await r2Client.send(command);

        // Construct the public URL
        const publicUrl = `${PUBLIC_URL}/${key}`;

        console.log(`✅ Uploaded to R2: ${publicUrl}`);

        return {
            success: true,
            key: key,
            url: publicUrl,
            fileName: fileName,
        };
    } catch (error) {
        console.error('R2 upload error:', error);
        throw new Error(`Failed to upload to R2: ${error.message}`);
    }
};

/**
 * Delete a file from Cloudflare R2
 * @param {string} key - The key/path of the file in R2
 * @returns {Promise<boolean>} Success status
 */
const deleteFromR2 = async (key) => {
    try {
        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        await r2Client.send(command);
        console.log(`🗑️ Deleted from R2: ${key}`);
        return true;
    } catch (error) {
        console.error('R2 delete error:', error);
        return false;
    }
};

/**
 * Check if R2 is configured
 * @returns {boolean}
 */
const isR2Configured = () => {
    return !!(
        process.env.R2_ENDPOINT &&
        process.env.R2_ACCESS_KEY_ID &&
        process.env.R2_SECRET_ACCESS_KEY &&
        process.env.R2_BUCKET_NAME &&
        process.env.R2_PUBLIC_URL
    );
};

module.exports = {
    uploadToR2,
    deleteFromR2,
    isR2Configured,
};
