const middleware = require('../middleware');
const fileUploadRoutes = require('./file-upload.route');

module.exports = (app, router) => {
    
    app.get('/test', (req, res) => res.send("test"));

    router.use(middleware.auth);
    router.use('/auth', [fileUploadRoutes(app, router)]);

    return router;
};

