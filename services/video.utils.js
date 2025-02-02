const path = require('path');
const config = require('../config');
const fs = require('fs');

const validateFileSize = (fileSize) => {
    const maxFileSize = config.fileUpload.maxFileSize || 1024 * 1024 * 5; // 5 MB
    if (fileSize > maxFileSize) {
        throw new Error('File size is too large');
    }
};

const validateFileType = (mimeType) => {
    // encoding, mime 
    const allowedMimeTtype = config.fileUpload.allowedMimes || [];
    if (!allowedMimeTtype.includes(mimeType)) {
        throw new Error('File type is not allowed');
    }
};

const validateFile = async (fileObj) => {
    validateFileSize(fileObj.size);
    validateFileType(fileObj.mimetype);

    return {
        fileSize: fileObj.size,
        fileType: fileObj.mimetype
    };
};

const deleteFile = async (filePath) => {
    if (fs.existsSync(path)) {
        await fs.promises.unlink(filePath);
    }
}

module.exports = {
    validateFile,
    deleteFile,
};
