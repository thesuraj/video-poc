const middleware = require('../middleware');
const fileUploadRoutes = require('./file-upload.route');
const videosRoutes = require('./videos.route');

module.exports = (app, router) => {
    
    app.get('/test', (req, res) => res.send("This is public test route"));

    router.use(middleware.auth);
    router.use('/auth', [
        fileUploadRoutes(app, router),
        videosRoutes(router),
    ]);

    return router;
};

