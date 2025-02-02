const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const routes = require('./routes')(app, express.Router());
app.use(routes);

app.listen(port, () => {
    console.log(`Video POC app listening on port ${port}`)
});
