
const sqlite3 = require('sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, '../', 'dump/videos.db');
const db = new sqlite3.Database(dbPath);

const addVideo = async (params={}) => {
    const {
        duration,
        fileSize,
        fileType,
        filepath,
        filename,
    } = params;
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            try {
                const statement = db.prepare('INSERT into videos (filename, filepath, filesize, filetype, duration ,created_at) values (?, ? , ?, ?, ?, ?)');
                statement.run(filename, filepath, fileSize, fileType, duration, new Date().toISOString());
                statement.finalize();
                return resolve();
            } catch (err) {
                return reject(err);
            }
        });
    })
};

const getVideoes = async (params = []) => {
    let sql = 'SELECT * from videos';
    const whereParams = [];

    if ((params.ids || []).length) {
        sql += ' where id in (' + params.ids.map(i => '?').join(",") + ')';
        whereParams.push(...params.ids);
    }

    return new Promise((resolve, reject) => {
        db.all(sql, whereParams, (err, rows) => {
            if (err) {
                return reject(err);
            }
            return resolve(rows);
        });
    });
};

const getVideo = async (params = {}) => {
    const sql = 'SELECT * from videos where id=?';
    return new Promise((resolve, reject) => {
        db.get(sql, [params.videoId], (err, row) => {
            if (err) {
                return reject(err);
            }
            return resolve(row);
        });
    });
};

const deleteAllRecord = async (params = []) => {
    const sql = 'DELETE from videos';
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                return reject(err);
            }
            return resolve(rows);
        });
    });
}

const deleteRecord = async (params = []) => {
    const sql = 'DELETE from videos where id=?';
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                return reject(err);
            }
            return resolve(rows);
        });
    });
};

const addExpiryLink = async (params={}) => {
    const {
        videoId,
        seconds,
        hash,
    } = params;
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            try {
                const statement = db.run(
                    'INSERT into expiry_link (video_id, expiry_in_secs, hash, created_at) values (?, ? , ?, ?); SELECT last_insert_rowid();',
                    [videoId, seconds, hash, new Date().toISOString()],
                    function(err) {
                        if (err) {
                            return reject(err);
                        }
                        return resolve(this.lastID);
                    }
                );
                // const a = statement.run();
                // const b = statement.finalize();
                // return resolve(statement);
            } catch (err) {
                return reject(err);
            }
        });
    });
};

const getExpiryLink = async (params = {}) => {
    const sql = 'SELECT * from expiry_link where id=?';
    return new Promise((resolve, reject) => {
        db.get(sql, [params.expiryLinkId], (err, row) => {
            if (err) {
                return reject(err);
            }
            return resolve(row);
        });
    });
};

module.exports = {
    addVideo,
    getVideoes,
    getVideo,
    deleteRecord,
    deleteAllRecord,
    addExpiryLink,
    getExpiryLink,
};
