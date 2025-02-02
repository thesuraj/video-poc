
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./dump/videos.db');


db.serialize(() => {
    db.run("CREATE TABLE videos (id INTEGER PRIMARY KEY AUTOINCREMENT, filename text NOT NULL, filepath text, filetype text, filesize text, duration text, created_at Date)");
});


