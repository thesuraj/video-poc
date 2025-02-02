const crypto = require('crypto');
const config = require('../config');
const videoUtils = require('../services/video.utils');
const videoJoiner = require('../services/video.joiner');
const databaseService = require('../services/database.service');

const uploadVideo = async (req, res) => {

    try {
        if (!req.file) {
            throw new Error('File not uploaded');
        }
        const { fileSize, fileType, duration } = await videoUtils.validateFile(req.file);

        await databaseService.addVideo({
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
    const videoList = await databaseService.getVideoes(req.query);
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
        const video = await databaseService.getVideo({ videoId });
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

        return res.json({ status: 'OK', data: { newFilePath, message: 'Video trimmed successfully' } });

    } catch (err) {
        return res.status(400).json({ status: 'ERROR', message: err.message });
    }
};

const handleVideoJoining = async (req, res) => {

    try {
        const { videoId1, videoId2 } = req.body;

        const videoList = await databaseService.getVideoes({ ids: [videoId1, videoId2] });

        const newFilePath = await videoJoiner.joinVideos(videoList);

        await databaseService.addVideo({
            duration: videoList.reduce((acc, video) => acc + video.duration, 0),
            fileSize: videoList.reduce((acc, video) => acc + video.filesize, 0),
            fileType: videoList[0].filetype,
            filepath: newFilePath,
            filename: newFilePath.split('/').pop(),
        });

        return res.json({ status: 'OK', data: { newFilePath, message: 'Video Added successfully' } });

    } catch (err) {
        return res.status(400).json({ status: 'ERROR', message: err.message });
    }

};

const getExpiryLinkForVideo = async (req, res) => {
    const videoId = req.body.videoId;

    if (!videoId || isNaN(videoId)) {
        return res.status(400).json({
            status: 'ERROR',
            message: 'Invalid Video ID',
        });
    }

    try {
        const videoObj = await databaseService.getVideo({ videoId });
        if (!videoObj) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Video not found',
            });
        }

        const expiryTime = config.fileUpload.fileExpiryLinkInSeconds || 3600;

        const uniqueHash = crypto.createHash('sha256').update(videoId + new Date().toISOString()).digest('hex');
        const lastId = await databaseService.addExpiryLink({
            videoId,
            seconds: expiryTime,
            hash: uniqueHash,
        });

        const expiryLink = await databaseService.getExpiryLink({ expiryLinkId: lastId });

        return res.json({
            status: 'OK',
            data: {
                publicUrl: `/public/video/${expiryLink.id}/${expiryLink.hash}`,
            },
        });

    } catch (err) {
        return res.status(400).json({ status: 'ERROR', message: err.message });
    }

};

const getExpiryLinkData = async (req, res) => {

    try {
        const { id, hash } = req.params;

        if (!id || isNaN(id) || !hash) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Invalid Link',
            });
        }

        const expiryLink = await databaseService.getExpiryLink({ expiryLinkId: id });

        if (!expiryLink || expiryLink.id !== Number(id) || expiryLink.hash !== hash) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Invalid Link',
            });
        }

        const expiryLinkDate = new Date(expiryLink.created_at);
        expiryLinkDate.setSeconds(expiryLinkDate.getSeconds() + Number(expiryLink.expiry_in_secs));
        if (expiryLinkDate > new Date()) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Link expired',
            });
        }

        const videoObj = await databaseService.getVideo({ videoId: expiryLink.video_id });

        if (!videoObj) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Video not found',
            });
        }

        return res.json({
            status: 'OK',
            data: {
                video: videoObj,
            },
        });
    } catch (err) {
        return res.status(400).json({ status: 'ERROR', message: err.message });
    }
}

module.exports = {
    uploadVideo,
    getVideos,
    getVideo,
    handleVideoTrimming,
    handleVideoJoining,
    getExpiryLinkForVideo,
    getExpiryLinkData,
};
