'use strict';
const tool = require('./tool.js');

/*
The music player for a guild.
Handles the queuing, and streaming of Songs.
*/
class MusicPlayer {
    constructor(guild) {
        this.queue = [];
        this.musicChannel = null;
        this.voiceConnection = null;
        this.dispatch = null;
        this.volume = 1;
        this.status = 'offline'; //States: offline, playing, stopped
        this.inactivityTimer = 60;
    }

    /*
    Adds the song to the queue.
    If an index argument is included, insert the song at that index instead of pushing it to the queue.

    @param {Object} song The song to queue.
    @param {Number} [index] The index to insert the song at.
    */
    queueSong(song) {
        let index;
        if (arguments.length == 2)
            index = arguments[1];
        if (index != undefined) {
            this.queue[index] = song;
        } else {
            this.queue.push(song);
        }
    }

    /*
    A recursive function that plays the queue.
    */
    playSong(msg) {
        if (this.queue.length === 0) {
            this.musicChannel.send('Queue complete.');
            this.changeStatus('stopped');
        } else {
            resolveVoiceChannel.call(this).then(() => {
                let song = this.queue[0];
                let stream = song.getStream();
                console.log(song.thumbnail);
                this.musicChannel.send({embed: {
                    color: 3447003,
                    fields: [{
                        name: `:notes: Now playing `,
                        value: `[${song.title}]`+`(${song.url}) (\`${song.time}\`) requested by **${song.author}**`
                      }],
                    thumbnail: {
                        url: `${song.thumbnail}`
                    },
                    timestamp: new Date(),
                    footer: {
                      icon_url: msg.author.avatarURL,
                      text: "© SCP_One_Zero_Six pour Hartanoce RP"
                    }
                  }
                });
                this.changeStatus('playing');
                this.dispatch = this.voiceConnection.playStream(stream, {
                    passes: 2,
                    volume: this.volume
                });

                this.dispatch.on('error', error => {
                    this.dispatch = null;
                    this.queue.shift();
                    this.playSong(msg);
                });

                this.dispatch.on('end', reason => {
                    this.dispatch = null;
                    this.queue.shift();
                    if (reason != 'leave') {
                        this.playSong(msg);
                    }
                });

                this.dispatch.on('debug', info => {
                    console.log(info);
                });
            }).catch(err => {
                if (err != 'novoice') console.log(err);
            });
        }

        /*
        Resolves the voice channel.
        @return Promise - resolved if the bot is connected to a voice channel, and rejected if not.
        */
        function resolveVoiceChannel() {
            return new Promise((resolve, reject) => {
                if (this.voiceConnection)
                    resolve();
                else {
                    msg.channel.send(
                        `Fait moi venir en utilisant ${tool.wrap('+music join')} que je puisse jouer ta musique`
                    );
                    reject('novoice');
                }
            });
        }
    }

    /*
    Skips the current song.
    */
    skipSong() {
        if (this.dispatch && this.status == 'playing') {
            this.musicChannel.send(`:fast_forward: On skip ! ${tool.wrap(this.queue[0].title)}`);
            this.dispatch.end();
        } else {
            this.musicChannel.send(`Y'as rien a skip !`);
        }
    }

    /*
    Pauses the dispatcher.
    */
    pauseSong() {
        if (this.dispatch)
            this.dispatch.pause();
        else
            this.musicChannel.send(`Pour l'instant, je joue pas de musique..`);
    }

    /*
    Resumes the dispatcher.
    */
    resumeSong() {
        if (this.dispatch)
            this.dispatch.resume();
        else
            this.musicChannel.send(`Pour l'instant, je joue pas de musique..`);

    }

    /*
    Prints the queue.
    */
    printQueue(msg) {
        if (this.queue.length > 0) {
            try {
                let queueString = '';
                for (let i = 0; i < this.queue.length && i < 15; i++)
                    queueString += `${i + 1}. ${this.queue[i].title} (\`${this.queue[i].time}\`) requested by ${this.queue[i].author}\n`;
                if (this.queue.length > 15)
                    queueString += `\nand ${this.queue.length - 15} more.`;
                msg.channel.send(queueString, {
                    'code': true
                });
            } catch (err) {
                console.log('ERROR CAUGHT:\n' + err);
                msg.channel.send(
                    `${tool.inaError} Je peux pas te l'afficher, désolé... Reessaie plus tard fréro :'(`
                );
            }
        } else {
            msg.channel.send(`C'est vide..`);
        }
    }

    /*
    Clears the queue.
    */
    purgeQueue(msg) {
        this.queue = [];
        msg.channel.send('La queue est désormais vide !');
    }

    /*
    Displays the currently playing song.
    */
    nowPlaying(msg) {
        if (this.queue.length > 0){
            msg.channel.send({embed: {
                    color: 3447003,
                    fields: [{
                        name: `:notes: En coure `,
                        value: `[${this.queue[0].title}]`+`(${this.queue[0].url}) (\`${this.queue[0].time}\`) requested by **${this.queue[0].author}**`
                      }],
                    thumbnail: {
                        url: `${this.queue[0].thumbnail}`
                    },
                    timestamp: new Date(),
                    footer: {
                      icon_url: msg.author.avatarURL,
                      text: "© SCP_One_Zero_Six pour HartanoceRP"
                    }
                  }
                });
        }else{
            msg.channel.send('Nothing is playing right now.');
        }
    }

    /*
    Sets the volume of the dispatcher.
    */
    setVolume(msg) {
        let vol = parseInt(msg.content.split(/\s+/)[2]) / 100;
        if (vol && (vol >= 0 && vol <= 1)) {
            if (this.dispatch) {
                this.dispatch.setVolume(vol);
                this.volume = vol;
                msg.channel.send(`:speaker:Volume set to ${tool.wrap(vol * 100)}`);
            } else {
                msg.channel.send(`Pour l'instant, je joue pas de musique..`);
            }
        } else {
            msg.channel.send(`Utilise un chiffre entre 0 et 100 !`);
        }
    }

    /*
    Summons the bot to the user's voice channel.
    */
    joinVc(msg) {
        if (msg.member.voiceChannel) {
            this.musicChannel = msg.channel;
            msg.member.voiceChannel.join().then(connection => {
                this.voiceConnection = connection;
                this.musicChannel.send(
                    `Joined and bound to :speaker: **${msg.member.voiceChannel.name}** and #**${this.musicChannel.name}**.`
                );
                this.changeStatus('stopped');
                if (this.queue.length > 0)
                    this.playSong(msg);
            })
        } else {
            msg.channel.send(`Je peux pas te rejoindre si t'as pas dans un vocal.. Kilékon..`);
        }
    }

    /*
    Disconnects from the voice channel.
    */
    leaveVc(msg) {
        if (this.voiceConnection) {
            this.musicChannel.send(`Leaving **${this.voiceConnection.channel.name}**.`);
            this.musicChannel = null;
            if (this.dispatch)
                this.dispatch.end('leave');
            this.voiceConnection.disconnect();

            this.changeStatus('offline');

            this.voiceConnection = null;
            this.dispatch = null;
        } else {
            msg.channel.send(`Je suis pas dans un vocal !`);
        }
    }

    /*
    Changes the status of the bot.
    @param {String} status The status to set the bot to.
    */
    changeStatus(status) {
        this.status = status;
        this.inactivityTimer = status == 'paused' ?
            600 :
            120;
    }
}

module.exports = MusicPlayer;



