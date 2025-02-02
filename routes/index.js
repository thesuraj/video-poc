
module.exports = (app, router) => {
    
    app.get('/test', (req, res) => res.send("test"));

    return router;
};

