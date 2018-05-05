'use strict';
const ytdl = require('ytdl-core');
let Songtype = require('./constant').SONG; 
let websocket = require('ws');

/*
    Class Song
    An object representing a song.
    @id {String} id de la video
    @url {String} lien de la video
    @local {String} lang/type de la video
    @time {String} temps de la video
    @stream {String} stream de la video
    @startTime {String} le temps
    @author {String} auteur
 */

class Song {
    constructor(title, url, type, author, time = null, stream = null, thumbnail = null) {
        this.title = title;
        this.url = url;
        this.time = this.formatTime(time);
        this.type = type; //youtube, soundcloud, search, radio, YoutubePl, twitch
        this.stream = stream;
        this.thumbnail = thumbnail;
        this.startTime = null;
        this.author = author;
    }
    async getStream() {

        if (this.type === Songtype.SEARCH) {
            return ytdl(this.url,{
                retries: 7,
                highWaterMark: 32768
            });
        }
        if (this.type === Songtype.YOUTUBE) {
            this.stream = ytdl(this.url, {
                retries: 7,
                highWaterMark: 32768
            });
            return this.stream;
        }
        if (this.type === Songtype.YOUTUBEPL) {
            //Get duration first.
            let info = await ytdl.getInfo(this.url);
            this.time = this.formatTime(info.length_seconds);
            this.thumbnail = `https://img.youtube.com/vi/${info.video_id}/mqdefault.jpg`;

            this.stream = ytdl.downloadFromInfo(info, {
                retries: 7,
                highWaterMark: 32768
            });
            return this.stream;
        }if(this.type === Songtype.TWITCH){
            this.stream = this.url;
            return this.stream;
            //this.time = 
        }
                if (this.type === 'soundcloud') {
            return null; //need api key.
        }if(this.type === Songtype.RADIOMOE){
            this.url = "http://listen.moe:9999/stream";
            this.stream = this.url;
            
            return this.stream;
        }
    }
    /*
    Formats time in seconds to minutes:seconds.
    */
    formatTime(seconds) {
        let d = Number(seconds);
        let h = Math.floor(d / 3600);
        let m = Math.floor(d % 3600 / 60);
        let s = Math.floor(d % 3600 % 60);
        return seconds !== 'N/A' ? ((h > 0 ? h + ':' + (m < 10 ? '0' : '') : '') + m + ':' + (s < 10 ? '0' : '') + s) : 'N/A';
    }
    filterFormats(info) {
        for (let i = 0; i < info.formats.length; i++) {
            // console.log(formats[i].itag);
            if (info.formats[i].format_id.toLowerCase() === 'audio_only') {
                return info.formats[i].url;
            }
        }
        for (let i = 0; i < info.formats.length; i++) {
            // console.log(formats[i].itag);
            if (info.formats[i].format_id === '480p' || info.formats[i].format_id === '720p') {
                return info.formats[i].url;
            }
        }
        return info.formats[0].url;
    }


    /*RADIO*/
    updateTitle (title) {
        this.title = title;
    }

    connect () {
        this.ended = false;
        this.ws = new websocket("wss://listen.moe/api/v2/socket");
        this.ws.on('open', () => {
            this.connectionAttempts = 1;
        });
        this.ws.on('message', (msg, flags) => {
            this.onMessage(msg, flags)
        });
        this.ws.on('error', (err) => this.onError(err));
        this.ws.on('close', (code, number) => this.onDisconnect(code, number));
    }


    onError (err) {
        console.error(err);
        console.log(`ws error!`);
        // this.reconnect(); si on veux la reco auto
    }

    end () {
        this.ended = true;
        try {
            this.ws.close(4000, 'Pas plus');
        } catch (e) {

        }
        this.ws = null;
    }

/*
    Class radio extends
    @ended {String} si non fini
    return connection
 */
    onDisconnect (code, number) {
        console.error(code);
        console.error(number);
        if (!this.ended) {
            this.connect();
        }
    }

    /*
        //Verif de la radio et music*
     */
    onMessage (msg, flags) {
        try {
            let actualMessage = JSON.parse(msg);
            if (actualMessage.song_name && actualMessage.artist_name) {
                this.updateTitle(`${actualMessage.artist_name} - ${actualMessage.song_name} (${this.options.radio})`);
            }
        } catch (e) {
            if (msg !== '') {
                console.error(e);
            }
        }
    }
}

module.exports = Song;