/*
    Class radio extends
    @Song {String} name of service (nom des services via constant)
    @Message {String} type de messages
        osu: 3,
 */
module.exports = {
    SONG: {
        YOUTUBE: 1,
        RADIO: 2,
        SEARCH: 3,
        SOUNDCLOUD: 4,
        YOUTUBEPL: 5,
        RADIOMOE: 6
    },
    MESSAGES: {
        "IDENTIFY": 1,
        "READY": 2,
        "RESUME": 3,
        "HEARTBEAT": 4,
        "MESSAGE": 5,
        "STATE_UPDATE": 6,
        "STATS_UPDATE": 7
    },
    STATUS: {
        "OFFLINE": 0,
        "STOPPED": 1,
        "PAUSED": 2,
        "PLAYING": 3
    }
};