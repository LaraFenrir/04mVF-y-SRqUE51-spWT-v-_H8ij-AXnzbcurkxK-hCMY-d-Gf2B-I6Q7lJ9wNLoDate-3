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

    bot.user.setActivity("Être dev par ℒ𝓪𝓻𝓪 ℱ𝒆𝓷𝓻𝓲𝓻#1084 [+help]/[+help music]");

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

if (msg.content === (prefix+"ping")) {
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
    if(cmdParams.join(" ").length === 0) return msg.channel.send("Please include a title or link");
Music.cmdMusic("play", msg, cmdParams.join(""), bot);
Music.cmdMusic("join", msg, cmdParams.join(""), bot)
	    message.react("✅")
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
        msg.channel.send("```Je suis un bot développé sous Discord.js par ℒ𝓪𝓻𝓪 ℱ𝒆𝓷𝓻𝓲𝓻#1084. Pour toutes demandes, ou reports de bugs, contactez la, elle est là pour vous aider. Je suis programmé pour jouer de la musique, et dans le futur pourquoi pas modérer```"),
{
            'code': 'css'
        }
}
if(msg.content === prefix + "self-e"){           
        msg.channel.send("```I'm a bot created with Discord.js by ℒ𝓪𝓻𝓪 ℱ𝒆𝓷𝓻𝓲𝓻#1084. For bugs reports, or simple question, ask her, it's her job. Currently, I'm just a music bot, but in the future I will probably be able to moderate```"),
{
            'code': 'css'
        }
}
if(msg.content === prefix + "patreon"){
	msg.channel.send("Tu veux me soutenir ? Soutenir mon projet ? Devenir un dieu/déèsse vivant(e) ? Aide moi sur Patreon ! https://www.patreon.com/user?u=10764113&utm_medium=social&utm_source=facebook&utm_campaign=creatorshare2")
}
if(msg.content === prefix + "loop"){
Music.cmdMusic("loop", msg, cmdParams.join(""), bot)
}
if (msg.content === prefix + "ping") {
     var startTime = Date.now();
  msg.channel.sendMessage("Calcul en cours...").then((message) => {
   var endTime = Date.now();
     message.edit("Bot : " + Math.round(endTime - startTime) + " ms\nAPI : "+Math.round(bot.ping)+" ms");
    })
}
});


