let Song = require('./song.js');
let websocket = require('ws');
class Radio extends Song {
    constructor (options) {
        super(options);
        this.options = options;
        this.ws = null;
        this.ended = false;
    }

    updateTitle (title) {
        this.title = title;
    }

    connect () {
        this.ended = false;
        this.ws = new websocket(this.options.wsUrl);
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
module.exports = Radio;