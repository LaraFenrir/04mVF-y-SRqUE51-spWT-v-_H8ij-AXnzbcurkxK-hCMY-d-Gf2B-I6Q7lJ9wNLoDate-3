'use strict';
const Discord = require('discord.js');
var token = process.env.TOKEN

const config = require('./config.json');
const cmds = require('./commands.js');
const Music = require('./musichelper.js');
const tool = require('./tool.js');

const prompt = require('prompt');
const colors = require('colors');
prompt.message = '';
prompt.delimiter = '';

const bot = new Discord.Client();

bot.on('ready', () => {
    console.log(`${bot.user.username}  starting.`);
    console.log(`Serving ${bot.guilds.size} guilds.`);

    bot.user.setPresence("Être dev par SCP_One_Zero_Six [+help]");


    //Internal bot commands.
});

bot.on('message', msg => {
    if (msg.author.bot || msg.channel.type != 'text')
        return; // Do not respond to messages from bots or messages that are not from guilds.

    if (!msg.content.startsWith(config.prefix))
        return; //Not a command.

    let cmd = msg.content.split(/\s+/)[0].slice(config.prefix.length).toLowerCase();
    getCmdFunction(cmd)(msg);
});

bot.on('error', (e) => console.error(e));
bot.on('warn', (e) => console.warn(e));
// bot.on('debug', (e) => console.info(e));

bot.login(token);

function getCmdFunction(cmd) {
    const COMMANDS = {
	    'ban': cmds.ban,
        'choose': cmds.choose,
        'help': cmds.help,
        'debug': cmds.debug,
        'kick': cmds.kick,
        'prune': cmds.prune,
    }
    return COMMANDS[cmd] ? COMMANDS[cmd] : () => {};
}

bot.on('message', msg => {
	var prefix = "+"
let content   = msg.content;
let cmdName   = content.split(' ')[0].toLowerCase();
let cmdParams = content.substring(cmdName.length + 1).split(' ');
let params  = cmdParams;
    if (msg.content === (prefix+"ping")) {
     var startTime = Date.now();
  msg.channel.sendMessage("Calcul en cours...").then((message) => {
   var endTime = Date.now();
     message.edit("Bot : " + Math.round(endTime - startTime) + " ms\nAPI : "+Math.round(bot.ping)+" ms");
    })
}
if(msg.content === prefix + "play"){
    if(params.join(" ").length === 0) return msg.channel.send("Please include a title or link");
Music.cmdMusic("play", msg, params.join(" "), bot);
}
if(msg.content === prefix + "join"){
Music.cmdMusic("join", msg, params.join(""), bot)
}
if(msg.content === prefix + "leave"){
Music.cmdMusic("leave", msg, params.join(""), bot)
}
});


