const concat = require('ffmpeg-concat');
const path = require('path');

const joinVideos = async (videoList) => {

    const videoPaths = videoList.map(video => video.filepath);

    if (videoPaths.length < 2) {
        throw new Error('Need at least two videos to join');
    }

    const filepathArray = videoList[0].filepath.split("/");
    const filename = filepathArray.pop();

    const newFilePath = path.join(
        filepathArray.join("/") +
        '/joined_' + String(Math.ceil(Math.random(100, 999) * 10000)) + '_' + filename);

    try {
        await concat({
            output: newFilePath,
            videos: videoPaths,
            transition: {
                name: 'directionalWipe',
                duration: 500
            }
        });
        return newFilePath;
    } catch(err) {
        throw new Error('Error joining videos');
    }
};

module.exports = {
    joinVideos,
};
