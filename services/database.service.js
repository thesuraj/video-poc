
const sqlite3 = require('sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, '../', 'dump/videos.db');
const db = new sqlite3.Database(dbPath);

const createRecord = async (params={}) => {
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

const getRecords = async (params = []) => {
    const sql = 'SELECT * from videos';
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                return reject(err);
            }
            return resolve(rows);
        });
    });
};

const getRecord = async (params = {}) => {
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
}

module.exports = {
    createRecord,
    getRecords,
    getRecord,
    deleteRecord,
    deleteAllRecord,
};
