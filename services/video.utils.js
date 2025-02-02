const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const config = require('../config');
const fs = require('fs');
const databaseService = require('./database.service');


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

    const duration = await getVideoDuration(fileObj.path);
    validateMaxDuration(duration);

    return {
        duration,
        fileSize: fileObj.size,
        fileType: fileObj.mimetype
    };
};

const deleteFile = async (filePath) => {
    if (fs.existsSync(path)) {
        await fs.promises.unlink(filePath);
    }
};

const cutAndReturnNewPath = async (videoObj, startTime, durationToTrim) => {

    const videoDuration = videoObj.duration;
    
    if (startTime > videoDuration || (startTime + durationToTrim) > videoDuration) {
        throw new Error('Invalid start time or end time');
    }

    return new Promise((resolve, reject) => {
        const filepathArray = videoObj.filepath.split("/");
        const filename = filepathArray.pop();

        const newFilePath = path.join(
            filepathArray.join("/") + 
            '/trimmed_' + String(Math.ceil(Math.random(100, 999) * 10000)) + '_' + filename);
        const actualFilePath = path.join(videoObj.filepath);

        ffmpeg(actualFilePath)
        .setStartTime(startTime)
        .setDuration(durationToTrim)
        .output(newFilePath)
        .on('end', function (err) {
            if (!err) {
                console.log('successfully converted');
                return resolve(newFilePath);
            }
        })
        .on('error', function (err) {
            console.log('conversion error: ', +err);
            return reject(err);
        }).run();
    });
};

const trimVideo = async (videoId, startTime, durationToTrim) => {
    const videoObj = await databaseService.getVideo({videoId});

    if (!videoObj) {
        throw new Error('Invalid video ID');
    }
    
    let newFilePath = '';
    try {
        const newFilePath = await cutAndReturnNewPath(videoObj, startTime, durationToTrim);

        await databaseService.addVideo({
            duration: durationToTrim,
            fileSize: videoObj.filesize,
            fileType: videoObj.filetype,
            filepath: newFilePath,
            filename: newFilePath.split('/').pop(),            
        });
    } catch (err) {
        if (newFilePath) {
            if (fs.existsSync(newFilePath)) {
                await fs.unlink(newFilePath);
            }
        }
        throw err;
    }
}

module.exports = {
    validateFile,
    deleteFile,
    trimVideo,
};
