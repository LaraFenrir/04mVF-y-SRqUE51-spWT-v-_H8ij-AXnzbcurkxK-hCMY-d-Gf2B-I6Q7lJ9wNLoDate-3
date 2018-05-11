/*
Processes music commands. Constructs Songs and manages MusicPlayers.
*/
'use strict';
const config = require('./config.json');
let Statustype = require('./constant').STATUS; 
let Songtype = require('./constant').SONG; 

const Song = require('./song.js');
const MusicPlayer = require('./musicPlayer.js');
const Discord = require('discord.js');
const ySearch = require("youtube-search");
const youtubeDL = require('youtube-dl');
const ytdl = require('ytdl-core');
const rp = require('request-promise');
module.exports.cmdMusic = cmdMusic;


let guilds = {};


/*
The music command handler.
*/
async function cmdMusic(type, msg, msgrep, bot){
    if(!msg.guild.available) return;

    if (!guilds[msg.guild.id]){
        guilds[msg.guild.id] = new MusicPlayer();
    }

    let guild = guilds[msg.guild.id];
    if(type){
        type.toLowerCase();
        switch (type){
            case 'play': 
                return await processInput(msg, guild, msgrep, bot);//ok
                break;
            case 'skip':
                    return await guild.skipSong(msg, bot);//ok
                break;
            case 'pause':
                return await guild.pauseSong(bot);
                break;
            case 'resume':
                return await guild.resumeSong(bot);
                break;
            case 'queue':
                return await guild.printQueue(msg, bot);//ok
                break;
            case 'np':
                return await guild.nowPlaying(msg, bot);//ok
                break;
            case 'vol':
                return await guild.setVolume(msg, msgrep, bot);//ok
                break;
            case 'purge':
                return await guild.purgeQueue(msg, bot);//ok
                break;
            case 'currentvol':
                return await guild.contentVolume(msg, bot);//ok
                break;
            case 'shuffle':
                return await guild.shuffleQueue(msg, bot);
                break;
            case 'join':
                return await guild.joinVc(msg, bot);//ok
                break;
            case 'leave':
                return await guild.leaveVc(msg, bot);//ok
                break;
            case 'radio':
                return await processInputRadio(msg, guild, msgrep, bot);
                break;
            default:
                return await msg.channel.send(`Tu as fait n'imp, regarde en utilisant ${tool.wrap('~music')}.`);
                break;
        }
    }
}

/*
Processes user input for ~play command calls.
Determines what kind of input (search query, youtube video/playlist, soundcloud song/playlist) has been given, and proceeds accordingly.
*/
function processInput(msg, guild, msgrep, bot) {
    let url = msgrep;
    if (url && url !== '') {
        if (!url.startsWith('http')) { //Assume its a search.
            processSearch(msg, guild, msgrep, bot);

        }else if(url.search('twitch.tv') != -1){
            const regex = /(?:http(?:s|):\/\/|)(?:www\.|)twitch\.tv\/.+/;
            if (regex.test(url)){
            processTwitch.song(msg, guild, url, bot);
            }else{
            msg.channel.send(`Error please include valide link for twitch`);                
            }
        }else if(url.search('spotify.com') != -1){
            msg.channel.send(`Gomen, Soundcloud, Spotify isn\'nt functional right now.`);
       /* const regex = /(?:http(?:s|):\/\/|)(?:www\.|)open\.spotify\.com\/.+/;
         if (regex.test(url)){
          const path = url.split('/');
          console.log(path[3] === 'playlist');
          console.log(path[3] === 'track');
          if (path[3] === 'playlist') {
            const playlistOwner = path[2];
            const playlistId = path[4];
            console.log("playlist");
            //musicbot.queueSpotifyPlaylist(msg, playlistOwner, playlistId);
          } 
          if (path[3] === 'track') {
            const trackId = path[4];
            console.log("track"+ trackId);

            //processSpotify.song(msg, guild, url, bot);
          }
        }else{
            console.log("nop");
        }*/

           // processSpotify.song(msg, guild, url, bot, lang);
        } else if (url.search('youtube.com') != -1) { //Youtube.
            let playlist = url.match(/list=(\S+?)(&|\s|$|#)/); //Match playlist id.
            if (playlist) { //Playlist.
                processYoutube.playlist(msg, guild, playlist[1], bot);
            } else if (url.search(/v=(\S+?)(&|\s|$|#)/)) { //Video.
                processYoutube.song(msg, guild, url, bot);
            } else {
                msg.channel.send(`Invalid Youtube link`);
            }
        }else if (url.search('soundcloud.com') != -1) { //Soundcloud.
            msg.channel.send(`Gomen, Soundcloud music isn\'nt functional right now.`);
        } else {
            msg.channel.send(`Gomen, I only support Youtube right now.`);
        }
    }
}



function processInputRadio(msg, guild, msgrep, bot) {
    let url = msgrep;
    if(msgrep.length == 0){
        guild.queueSong(new Song(`listen.moe`, `https://listen.moe`, Songtype.RADIOMOE, msg.author.tag, 0,
                null,null, null));

        try{
            Song.connect();
            } catch (e) {
                console.error(e);
            }
        msg.channel.send(
            new MessageEmbed().setDescription(`Enqueued listen.moe requested by ${(msg.author.tag)}`)
        );
        if (guild.status != Statustype.PLAYING) {
            guild.playSong(msg, bot);
        }
       
    }
}



/*
SONG/PLAYLIST PROCESSING FUNCTIONS
*/
/*
Processes a search using youtube-dl, pushing the resulting song to the queue.
@param {String} seachQuery The search query.
*/

function processSearch(msg, guild, searchQuery, bot) {
const opts = {
    maxResults: 3,
    key: config.api.youtube
};
ySearch(searchQuery, opts, function (err, results) {
        if (err) {
            msg.channel.send(`Sorry, I couldn't find matching song.`);
            return console.error(err);
        }
        for (var y = 0; results[y].kind === 'youtube#channel'; y++);
        ytdl.getInfo(results[y].link, function (err, song) {
            if (err) {
                msg.channel.send(`Sorry, I couldn't find matching song.`);
                return console.error(err);
            }

        guild.queueSong(new Song(song.title, `https://youtube.com/watch?v=${song.video_id}`, Songtype.SEARCH, msg.author.tag, song.length_seconds ,
                null,`https://img.youtube.com/vi/${song.video_id}/mqdefault.jpg`, null));

        msg.channel.send(
            new MessageEmbed().setDescription(`Enqueued ${song.title.trim()} requested by ${(msg.author.tag)}`)
            .setThumbnail(`https://img.youtube.com/vi/${song.video_id}/mqdefault.jpg`)
        );
        if (guild.status != Statustype.PLAYING) {
            guild.playSong(msg, bot);
        }
    
        });
    });
}

/*Processing function for Twitch links*/
const processTwitch = {
    song(msg, guild, url, bot){
        youtubeDL.getInfo(url, (err, song) =>{
            if (err){

            console.log(err);
            msg.channel.send(`Gomen I couldn't queue your song.`);
                return;
            }
            var url2 = filterFormats(song);



            if (!song.is_live) {
            return msg.channel.send('Channel is not Live!');
            }
            guild.queueSong(new Song(song.uploader_id, url2, Songtype.TWITCH, msg.author.tag, 0, null,`https://www.seeklogo.net/wp-content/uploads/2016/08/twitch-logo-preview.png`,null));
            msg.channel.send(
                new MessageEmbed().setDescription(`Enqueued ${song.uploader_id.trim()} to position **${guild.queue.length}**`)
                .setThumbnail(`https://www.seeklogo.net/wp-content/uploads/2016/08/twitch-logo-preview.png`));
            if (guild.status != Statustype.PLAYING) {
                guild.playSong(msg, bot);
            }

        });
        
    }
}

/*Processing function for Twitch links*/
const processSpotify = {
    song(msg, guild, url, bot){
            guild.queueSong(new Song("tesst", url, Songtype.TWITCH, msg.author.tag, 0, null,`https://www.seeklogo.net/wp-content/uploads/2016/08/twitch-logo-preview.png`,null));
            msg.channel.send(
                new MessageEmbed().setDescription(`Enqueued ${"song.uploader_id.trim()"} to position **${guild.queue.length}**`)
                .setThumbnail(`https://www.seeklogo.net/wp-content/uploads/2016/08/twitch-logo-preview.png`));
            if (guild.status != Statustype.PLAYING) {
                guild.playSong(msg, bot);
            }

        
    }
}
/*
Processing functions for Youtube links.
*/
const processYoutube = {
    /*
    Processes a Youtube song, pushing it to the queue.
    @param {String} url The URL of the new song.
    */
    song(msg, guild, url, bot) {
        ytdl.getInfo(url, (err, song) => {
            if (err) {
                console.log(err);
                msg.channel.send(`Je peux pas mettre ta musique dans la file d'attente..`);
                return;
            }       
            
            guild.queueSong(new Song(song.title, url, Songtype.YOUTUBE, msg.author.tag, song.length_seconds,
                null,
                `https://img.youtube.com/vi/${song.video_id}/mqdefault.jpg`, null));
                console.log(`https://img.youtube.com/vi/${song.video_id}/mqdefault.jpg`);
            /*const embed =  new Discord.MessageEmbed().setDescription(`Enqueued ${song.title.trim()} to position **${guild.queue.length}**`)
            .setThumbnail(`https://img.youtube.com/vi/${song.video_id}/mqdefault.jpg`);*/
            console.log(`https://img.youtube.com/vi/${song.video_id}/mqdefault.jpg`)
            msg.channel.send({
                embed: {
                    type: 'rich',
                    description: `J'ai inclu la musique ${song.title.trim()} à la position **${guild.queue.length}**`,
                    thumbnail: {
                        "url": `https://img.youtube.com/vi/${song.video_id}/mqdefault.jpg`
                    },
                    color: 3447003
                  }
            });
            if (guild.status != Statustype.PLAYING) {
                guild.playSong(msg, bot);
            }
        });
    },

    /*
    Processes a Youtube playlist.
    @param {String} playlistId The ID of the Youtube playlist.
    */
    playlist(msg, guild, playlistId, bot) {
        const youtubeApiUrl = 'https://www.googleapis.com/youtube/v3';

        Promise.all([getPlaylistName(), getPlaylistSongs([], null)])
            .then(results => addToQueue(results[0], results[1], bot))
            .catch(err => {
                console.log(err);
                msg.channel.send(
                   `Désolé je ne peux pas mettre ta playlist pour le moment.. Essaie plus tard..Et si sa marche pas contacte SCP lel.`
                )
            });

        async function getPlaylistName() {
            let options = {
                url: `${youtubeApiUrl}/playlists?id=${playlistId}&part=snippet&key=${config.api.youtube}`
            }
            let body = await rp(options);
            let playlistTitle = JSON.parse(body).items[0].snippet.title;
            return playlistTitle;
        }

        /*
        A recursive function that retrieves the metadata (id and title) of each video in the playlist using the Youtube API.
        @param {Array} playlistItems Array storing metadata of each video in the playlist.
        @param {String} pageToken The next page token response for the playlist if applicable.
        @return {Promise} Resolved with playlist items if playlist metadata succesfully retrieved, rejected if not.
        */
        async function getPlaylistSongs(playlistItems, pageToken) {
            pageToken = pageToken ?
                `&pageToken=${pageToken}` :
                '';

            let options = {
                url: `${youtubeApiUrl}/playlistItems?playlistId=${playlistId}${pageToken}&part=snippet&fields=nextPageToken,items(snippet(title,resourceId/videoId))&maxResults=50&key=${config.api.youtube}`
            }

            let body = await rp(options);
            let playlist = JSON.parse(body);
            playlistItems = playlistItems.concat(playlist.items.filter( //Concat all non-deleted videos.
                item => item.snippet.title.search('Deleted video') == -1));

            if (playlist.hasOwnProperty('nextPageToken')) { //More videos in playlist.
                playlistItems = await getPlaylistSongs(playlistItems, playlist.nextPageToken);
            }

            return playlistItems;
        }

        /*
        Processes the playlist metadata, adding songs to the queue.
        @param {Array} playlistItems The metadata of each video in the playlist.
        */
        function addToQueue(playlistTitle, playlistItems, bot) {
            let queueLength = guild.queue.length;

            for (let i = 0; i < playlistItems.length; i++) {

                let song = new Song(
                    playlistItems[i].snippet.title,
                    `https://www.youtube.com/watch?v=${playlistItems[i].snippet.resourceId.videoId}`,
                    Songtype.YOUTUBEPL, msg.author.tag);
                guild.queueSong(song, i + queueLength);
            }

            msg.channel.send(
                `Inclu ${playlistItems.length} de la playlist ${playlistTitle} par ${(msg.author.tag)}`
                );

            if (guild.status != Statustype.PLAYING) {
                guild.playSong(msg, bot);
            }
        }
    },
}


/*
Timer for inactivity. Leave voice channel after inactivity timer expires.
*/
function timer(bot) {
    for (let guildId in guilds) {
        let guild = guilds[guildId];
        if (guild.status === Statustype.STOPPED || guild.status === Statustype.PAUSED)
            guild.inactivityTimer -= 10;
        if (guild.inactivityTimer <= 0) {
            guild.voiceConnection.disconnect();
            guild.voiceConnection = null;
            guild.musicChannel.send(
                new MessageEmbed().setDescription(`⛔ Leaving voice channel due to inactivity.`));

            guild.changeStatus(Statustype.OFFLINE);
        }
    }
}
function filterFormats(info) {
        for (let i = 0; i < info.formats.length; i++) {
            if (info.formats[i].format_id.toLowerCase() === 'audio_only') {
                return info.formats[i].url;
            }
        }
        for (let i = 0; i < info.formats.length; i++) {
            if (info.formats[i].format_id === '480p' || info.formats[i].format_id === '720p') {
                return info.formats[i].url;
            }
        }
        return info.formats[0].url;
    }
setInterval(timer, 10000);
