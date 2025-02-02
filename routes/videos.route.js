const videoController = require('../controllers/video.controller');

module.exports = (router) => {
    router.get('/videos/:videoId', videoController.getVideo);
    router.get('/videos', videoController.getVideos);
    // router.post('/deleteRecords', videoController.deleteRecords);
    // router.post('/deleteRecord', videoController.deleteRecord);

    router.post('/trimVideo', videoController.handleVideoTrimming);
    router.post('/addVideo', videoController.handleVideoJoining);
    return router;
};