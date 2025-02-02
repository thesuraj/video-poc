
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./dump/videos.db');


db.serialize(() => {
    db.run("CREATE TABLE videos (id INTEGER PRIMARY KEY AUTOINCREMENT, filename text NOT NULL, filepath text, filetype text, filesize text, duration text, created_at Date)");
});

// db.serialize(() => {
//     db.run("drop TABLE expiry_link");
// });

db.serialize(() => {
    db.run("CREATE TABLE expiry_link (id INTEGER PRIMARY KEY AUTOINCREMENT, video_id text NOT NULL, expiry_in_secs text, hash text, created_at Date)");
});


