'use strict';
let Statustype = require('./constant').STATUS; 
const { MessageEmbed } = require('discord.js');
const ytdl = require('ytdl-core');

/*
The music player for a guild.
Handles the queuing, and streaming of Songs.
*/
class MusicPlayer {
    constructor() {
        this.queue = [];
        this.musicChannel = null;
        this.voiceConnection = null;
        this.dispatch = null;
        this.volume = 0.5;
        this.status = Statustype.OFFLINE; //States: offline, playing, stopped, paused
        this.inactivityTimer = 300;
    }

    /*
    Adds the song to the queue.
    If an index argument is included, insert the song at that index instead of pushing it to the queue.

    @param {Object} song The song to queue.
    @param {Number} [index] The index to insert the song at.
    */
    queueSong(song, index = null) {
        if (index != null) {
            this.queue[index] = song;
        } else {
            this.queue.push(song);
        }
    }

    /*
    A recursive function that plays the queue.
    */
    async playSong(msg, bot, lang) {
        if (this.queue.length === 0) {
            this.musicChannel.send(bot.I18n.translate`Queue complete.`);
            this.changeStatus(Statustype.STOPPED);
        } else if (this.voiceConnection) {
            let song = this.queue[0];
            console.log(song);
            try {
                let stream = await song.getStream();
                /*
                const streamOptions = { seek: 0, volume: 1 };

                msg.member.voiceChannel.join()
  .then(connection => {
    const stream = ytdl('https://www.youtube.com/watch?v=XAWgeLF9EVQ', { filter : 'audioonly' });
    const dispatcher = connection.playStream(stream, streamOptions);
  })
                 */
                this.dispatch = this.voiceConnection.playStream(stream, {
                    passes: 2,
                    volume: this.volume
                });
            } catch (error) {
                console.log(error);
                this.dispatch = null;
                this.queue.shift();
                return this.playSong(msg, bot, lang);
            }

            this.dispatch.once('start', () => {
                this.musicChannel.send(
                    new MessageEmbed()
                    .setTitle(bot.I18n.translate`🎵 \`${song.title}\``)
                    .setURL(song.url)
                    .addField(bot.I18n.translate`Time`, `${song.time}`, true)
                    .addField(bot.I18n.translate`Request by`, `${song.author}`, true)
                    .setThumbnail(song.thumbnail)
                );
                this.changeStatus(Statustype.PLAYING);
                song.startTime = this.getUnixTime();
            });

            this.dispatch.on('error', error => {
                console.log(error);
                this.dispatch = null;
                this.queue.shift();
                setTimeout(() => { this.playSong(msg, bot, lang) }, 100);
            });

            this.dispatch.once('end', reason => {
                this.dispatch = null;
                this.queue.shift();
                if (reason != 'leave') {
                    setTimeout(() => this.playSong(msg, bot, lang), 100);
                }
            });

            this.dispatch.on('debug', info => {
                console.log(info);
            });
        } else {
            msg.channel.send(bot.I18n.translate
                `Please summon me using \`join\` to start playing the queue.`
            );
        }
    }


    /*
    Skips the current song.
    */
    skipSong(msg, bot, lang) {
        if (this.dispatch && this.status === Statustype.PLAYING) {
            this.musicChannel.send(
                new MessageEmbed().setDescription(bot.I18n.translate`⏩ \`${this.queue[0].title}\``)
            );
            this.dispatch.end();
        } else {
            this.musicChannel.send(bot.I18n.translate`There's nothing to skip !`);
        }
    }

    /*
    Pauses the dispatcher.
    */
    pauseSong(bot, lang) {
        if (this.dispatch)
            this.dispatch.pause();
        else
            this.musicChannel.send(
                bot.I18n.translate`Nothing is playing right now.`
            );
    }

    /*
    Resumes the dispatcher.
    */
    resumeSong(bot, lang) {
        if (this.dispatch)
            this.dispatch.resume();
        else
            this.musicChannel.send(
                bot.I18n.translate`Nothing is playing right now.`
            );

    }

    /*
    Prints the queue.
    */
    printQueue(msg, bot, lang) {
        if (this.queue.length > 0) {
            try {
                let queueString = '';
                for (let i = 0; i < this.queue.length && i < 15; i++)
                    queueString += `[${i + 1}]. ${this.queue[i].title}\n`;
                if (this.queue.length > 15)
                    queueString += `\nand ${this.queue.length - 15} more.`;
                msg.channel.send(queueString, { 'code': true });
            } catch (err) {
                console.log('ERROR CAUGHT:\n' + err);
                msg.channel.send(
                    bot.I18n.translate`Gomen, I can't display the queue right now. Try again in a few moments onegai.`
                );
            }
        } else {
            msg.channel.send(bot.I18n.translate`There are no songs in the queue!`);
        }
    }

    /*
    Clears the queue.
    */
    purgeQueue(msg, bot, lang) {
        if (this.status === Statustype.PLAYING || this.status === Statustype.PAUSED) {
            this.queue = [this.queue[0]];
        } else {
            this.queue = [];
        }
        msg.channel.send(bot.I18n.translate`The queue has been cleared.`);
    }

    /*
    Shuffles the queue.
    */
    shuffleQueue(msg, bot, lang) {
        if (this.status === Statustype.PLAYING || this.status === Statustype.PAUSED) {
            this.queue = [this.queue[0]].concat(this.shuffle(
                this.queue.slice(1)));
        } else {
            this.queue = this.shuffle(this.queue);
        }
        msg.channel.send(new MessageEmbed().setDescription(bot.I18n.translate`🔀 Queue shuffled!`));
    }

    /*
    Displays the currently playing song and elapsed time.
    */
    nowPlaying(msg, bot, lang) {
        if (this.queue.length > 0) {
            let elapsedTime = this.formatTime(this.getUnixTime() -
                this.queue[0].startTime);
            msg.channel.send(
                new MessageEmbed()
                .setTitle(bot.I18n.translate`🎵 \`${this.queue[0].title}\``)
                //.setDescription(`
                   // \```)
                .setURL(this.queue[0].url)
                .addField(bot.I18n.translate`Time`, `\`${elapsedTime}/${this.queue[0].time}\``, true)
                .addField(bot.I18n.translate`Request by`, `${this.queue[0].author}`, true)
                .setThumbnail(this.queue[0].thumbnail)
            );
        } else {
            msg.channel.send(
                bot.I18n.translate`Nothing is playing right now.`);
        }
    }

    /*
    Sets the volume of the dispatcher.
    */
    setVolume(msg, msgrep, bot, lang) {
        let vol = parseInt(msgrep) /
            100;
        if (vol && (vol >= 0 && vol <= 1)) {
            if (this.dispatch) {
                this.dispatch.setVolume(vol);
                this.volume = Math.ceil(vol);
                msg.channel.send(
                    new MessageEmbed().setDescription(bot.I18n.translate`🔈 \`${vol * 100}/100\`` ));
            } else {
                msg.channel.send(bot.I18n.translate`Nothing is playing right now.`);
            }
        } else {
            msg.channel.send(bot.I18n.translate`Use a number between 0 and 100 !`);
        }
    }

    /*
    Current song of the bot
     */
    contentVolume(msg, bot, lang){
        var vol = this.volume;
        msg.channel.send(
                    new MessageEmbed().setDescription(bot.I18n.translate`🔈 \`${vol * 100}/100\``));
    }
    /*
    Summons the bot to the user's voice channel.
    */
    joinVc(msg, bot, lang) {
        if (msg.member.voiceChannel) {
            if (this.voiceConnection === null) {
                this.musicChannel = msg.channel;
                this.musicChannel.send(
                    new MessageEmbed().setDescription(bot.I18n.translate`Joined and bound to 🔈**${msg.member.voiceChannel.name}** and #**${this.musicChannel.name}**.`)
                );
                /*const streamOptions = { seek: 0, volume: 1 };

                msg.member.voiceChannel.join()
  .then(connection => {
    const stream = ytdl('https://www.youtube.com/watch?v=XAWgeLF9EVQ', { filter : 'audioonly' });
    const dispatcher = connection.playStream(stream, streamOptions);
  })*/
                msg.member.voiceChannel.join().then(
                    connection => {
                        this.voiceConnection = connection;
                        this.changeStatus(Statustype.STOPPED);
                        if (this.queue.length > 0) {
                            this.playSong(msg, bot, lang);
                        }
                    });
            }
        } else {
            msg.channel.send(
                bot.I18n.translate`You're not in a voice channel! `
            );
        }
    }

    /*
    Disconnects from the voice channel.
    */
    leaveVc(msg, bot, lang) {
        if (this.voiceConnection) {
            this.musicChannel.send(
                new MessageEmbed().setDescription(bot.I18n.translate`⛔ Leaving **${this.voiceConnection.channel.name}**.`)
            );

            this.musicChannel = null;
            if (this.dispatch) this.dispatch.end('leave');
            this.voiceConnection.disconnect();
            this.voiceConnection.removeAllListeners();

            this.changeStatus(Statustype.OFFLINE);

            this.voiceConnection = null;
            this.dispatch = null;
        } else {
            msg.channel.send(
                bot.I18n.translate`I'm not in a voice channel! `
            );
        }
    }

    /*
    Changes the status of the bot.
    @param {String} status The status to set the bot to.
    */
    changeStatus(status) {
        this.status = status;
        this.inactivityTimer = status === Statustype.PAUSED ?
            600 :
            300;
    }
    /*
    Time for this vidéo
    @param {Number} return this time for vidéo
     */
    formatTime(seconds) {
        let d = Number(seconds);
        let h = Math.floor(d / 3600);
        let m = Math.floor(d % 3600 / 60);
        let s = Math.floor(d % 3600 % 60);
        return seconds !== 'N/A' ? ((h > 0 ? h + ':' + (m < 10 ? '0' : '') : '') + m + ':' + (s < 10 ? '0' : '') + s) : 'N/A';
    }
    /*
    Returns the current unix time in seconds.
    @return {Number} the unix time in seconds.
    */
    getUnixTime() {
        return Math.round((new Date()).getTime() / 1000);
    }
    /*
    Random for the shuffle 
    @return {Upper} the random for shuffle
     */
    randInt(upper) {
        return Math.floor(Math.random() * (upper));
    }
    /*
    Shuffles the given array, returning it.
    */
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let e = this.randInt(i + 1);
            let t = array[i];
            array[i] = array[e];
            array[e] = t;
        }
        return array;
    }
}

module.exports = MusicPlayer;