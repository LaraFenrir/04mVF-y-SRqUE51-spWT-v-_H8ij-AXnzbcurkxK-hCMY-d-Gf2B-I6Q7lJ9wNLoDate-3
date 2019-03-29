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

bot.login(token);

bot.on('ready', () => {
    console.log(`${bot.user.username}  starting.`);
    console.log(`Serving ${bot.guilds.size} guilds.`);

    bot.user.setActivity("Être dev par 𝓢𝓷𝓾𝓻𝒇𝓵 ℒ𝓪𝓻𝓪#0195 [+help]/[+help music]");

});

bot.on('message', msg => {
    if (msg.author.bot || msg.channel.type != 'text')
        return; 

    if (!msg.content.startsWith(config.prefix))
        return; 

    let cmd = msg.content.split(/\s+/)[0].slice(config.prefix.length).toLowerCase();
    getCmdFunction(cmd)(msg);
});

bot.on('error', (e) => console.error(e));
bot.on('warn', (e) => console.warn(e));




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

if (msg.content === (prefix + "ping")) {
    var startTime = Date.now();
  msg.channel.send("Calcul en cours...").then((message) => {
    var endTime = Date.now();
     message.edit("Bot : " + Math.round(endTime - startTime) + " ms\nAPI : "+Math.round(bot.ping)+" ms");
	  console.log("test")
    })
}
if(msg.content.startsWith(prefix + "play")){
	if (!msg.member.voiceChannel) { 
    msg.channel.send("Veuillez aller dans un channel vocal pour éxécuter cette commande.")
    }else {
    if(cmdParams.join(" ").length === 0) return msg.channel.send("Veuillez insérer un lien ou un titre de musique.");
Music.cmdMusic("play", msg, cmdParams.join(""), bot);
Music.cmdMusic("join", msg, cmdParams.join(""), bot)
}}
if(msg.content === prefix + "stop"){
	if (!msg.member.voiceChannel) { 
    msg.channel.send("Veuillez aller dans un channel vocal pour éxécuter cette commande.")
    }else {
Music.cmdMusic("leave", msg, cmdParams.join(""), bot);
Music.cmdMusic("purge2", msg, cmdParams.join(""), bot)
}}

if(msg.content.startsWith(prefix + "vol")){
Music.cmdMusic("vol", msg, cmdParams.join(""), bot)
}
if(msg.content === prefix + "purge"){
Music.cmdMusic("purge", msg, cmdParams.join(""), bot)
}
if(msg.content === prefix + "join"){
Music.cmdMusic("join", msg, cmdParams.join(""), bot)
}
if(msg.content === prefix + "currentvol"){
Music.cmdMusic("currentvol", msg, cmdParams.join(""), bot)
}
if(msg.content === prefix + "shuffle"){
Music.cmdMusic("shuffle", msg, cmdParams.join(""), bot)
}
if(msg.content === prefix + "np"){
Music.cmdMusic("np", msg, cmdParams.join(""), bot)
}
if(msg.content === prefix + "queue"){
Music.cmdMusic("queue", msg, cmdParams.join(""), bot)
}
if(msg.content === prefix + "pause"){
Music.cmdMusic("pause", msg, cmdParams.join(""), bot)
	msg.channel.send("Musique mise en pause")
}
if(msg.content === prefix + "resume"){
Music.cmdMusic("resume", msg, cmdParams.join(""), bot)
	msg.channel.send("Je joue de nouveau ^^")
}
if(msg.content === prefix + "skip"){
Music.cmdMusic("skip", msg, cmdParams.join(""), bot)
}
if(msg.content === prefix + "self"){           
        msg.channel.send("```Je suis un bot développé sous Discord.js par ℒ𝓪𝓻𝓪 ℱ𝒆𝓷𝓻𝓲𝓻#0195. Pour toutes demandes, ou reports de bugs, contactez le, il est là pour vous aider. Je suis programmé pour jouer de la musique, et dans le futur pourquoi pas modérer. Mon créateur possède également un tipee ! Va voir par là ! :D https://en.tipeee.com/larafenrir```"),
{
            'code': 'css'
        }
}
if(msg.content === prefix + "self-e"){           
        msg.channel.send("```I'm a bot created with Discord.js by ℒ𝓪𝓻𝓪 ℱ𝒆𝓷𝓻𝓲𝓻#0195. For bugs reports, or simple question, ask him, it's his job. I'm a music bot for now, but in the future, i think i'll moderate. My creator also own a Tipee check it out ! :D https://en.tipeee.com/larafenrir```"),
{
            'code': 'css'
        }
}

if (msg.content === prefix + "ping") {
     var startTime = Date.now();
  msg.channel.sendMessage("Calcul en cours...").then((message) => {
   var endTime = Date.now();
     message.edit("Bot : " + Math.round(endTime - startTime) + " ms\nAPI : "+Math.round(bot.ping)+" ms");
    })
}
});


