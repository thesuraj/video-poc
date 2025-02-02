const videoUtils = require('../services/video.utils');
const databaseService = require('../services/database.service');

const uploadVideo = async (req, res) => {

    try {
        if (!req.file) {
            throw new Error('File not uploaded');
        }
        const {fileSize, fileType, duration} = await videoUtils.validateFile(req.file);

        await databaseService.createRecord({
            duration,
            fileSize,
            fileType,
            filepath: req.file.path,
            filename: req.file.originalname,            
        });

        return res.json({
            status: 'OK',
            message: 'File uploaded successfully'
        });
    } catch (err) {
        await videoUtils.deleteFile(req.file?.path);
        return res.status(400).json({
            status: 'ERROR',
            message: err.message
        });
    }

};

const getVideos = async (req, res) => {
    const videoList = await databaseService.getRecords(req.query);
    return res.json({
        status: 'OK',
        data: videoList || [],
    });
};

const getVideo = async (req, res) => {
    const videoId = req.params.videoId;
    if (!videoId || isNaN(videoId)) {
        return res.status(400).json({
            status: 'ERROR',
            message: 'Invalid Video ID',
        });
    }
    try {
        const video = await databaseService.getRecord({videoId});
        if (!video) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Video not found',
            });
        }    
        return res.json({
            status: 'OK',
            video,
        });
    } catch (err) {
        return res.status(500).json({
            status: 'ERROR',
            message: err.message || 'Internal Server Error',
        });
    }
};

const handleVideoTrimming = async (req, res) => {

    try {
        const { startTime, durationToTrim, videoId } = req.body;

        const newFilePath = await videoUtils.trimVideo(videoId, Number(startTime), Number(durationToTrim));

        return res.json({ status: 'OK', data: {newFilePath, message: 'Video trimmed successfully'} });
    
    } catch (err) {
        return res.status(400).json({ status: 'ERROR', message: err.message});
    }
};

module.exports = {
    uploadVideo,
    getVideos,
    getVideo,
    handleVideoTrimming,
};
