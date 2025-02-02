const videoUtils = require('../services/video.utils');

const uploadVideo = async (req, res) => {

    try {
        await videoUtils.validateFile(req.file);

        return res.json({
            status: 'OK',
            message: 'File uploaded successfully'
        });
    } catch (err) {
        await videoUtils.deleteFile(req.file.path);
        return res.status(400).json({
            status: 'ERROR',
            message: err.message
        });
    } finally {
    }

};


module.exports = {
    uploadVideo,
};
