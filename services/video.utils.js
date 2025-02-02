const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
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

const getVideoDuration = async (filePath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, function (err, metadata) {
            if (!err) 
              return resolve(Math.ceil(metadata.format.duration));
            return reject(err);
        });
    });
};

const validateMaxDuration = (durationInSeconds) => {
    const allowedDurationMax = config.fileUpload.maxDurationInSeconds || 30;
    const allowedDurationMin = config.fileUpload.minDurationInSeconds || 5;
    if (durationInSeconds > allowedDurationMax) {
        throw new Error('File duration is too large');
    }

    if (durationInSeconds < allowedDurationMin) {
        throw new Error('File duration is too small');
    }
};

const validateFile = async (fileObj) => {
    validateFileSize(fileObj.size);
    validateFileType(fileObj.mimetype);

    const duration = await getVideoDuration(req.file.path);
    validateMaxDuration(duration);

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
