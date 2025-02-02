const middleware = require('../middleware');

module.exports = (app, router) => {
    
    app.get('/test', (req, res) => res.send("test"));

    router.use(middleware.auth);
    router.get('/auth', (req, res) => res.send("Auth Route"));

    return router;
};

