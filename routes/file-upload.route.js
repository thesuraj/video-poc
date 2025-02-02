const multer = require('multer');
const path = require('path');
const videoController = require('../controllers/video.controller');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../', '/uploads/videos'))
    },
    filename: function (req, file, cb) {
        const mimeType = (file.mimetype || '').split('/')[1] || 'mp4';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.' + mimeType;
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
});

const upload = multer({ storage: storage });

module.exports = (app, router) => {
    router.post('/uploadVideo', upload.single('videoFile'), videoController.uploadVideo);   
    return router;
};
