const commands = module.exports = {
    'help': `
~help [command]
   Brings up the command page. Pass a command for further information.`,

    'choose': `
~choose <arg1> | [arg2] ...
   Randomly chooses between the provided choice(s).`,

    'prune': `
~prune <amount> [options]
   Prunes the last <amount> messages.

   Options:
      [--bots]            : Only prunes bot messages.
      [--user <name>]     : Only prunes messages by the specified user.
      [--filter <string>] : Only prunes messages with the specified string.

      [--pinned | -p]     : Also prunes pinned messages.
      [--silent | -s]     : Deletes command and doesn't display results.`,

    'role': `[Role Help]

~role give <role[,...]>  : Gives role(s).
~role take <role[,...]>  : Removes role(s).
~role modify <role>      : Modifies a role.

#Options
give|take
   [--bots]              : Only change roles for bots.
   [--users]             : Only change roles for users.
   [--user <user[,...]>] : Only change roles for specified users.

   [--inrole <role>]     : Change roles for everyone with the role.
   [--notinrole <role>]  : Change roles for everyone without the role.
   [--noroles]           : Change roles for everyone with no roles.

modify
   [--name <name>]       : Rename role.
   [--color <color>]     : Change role color. (6 digit HEX)`,

    'music': `
[Music Help]

   play <url>            : Ajouter une musique a la liste d'attente.
   skip                  : Passer a la musique suivante
   pause                 : Mettre en pause la musique.
   resume                : Remettre la musique.

   queue                 : Voir les musiques en attente.
   purge                 : Effacer la liste d'attente.
   np                    : Regarder le nom de la musique actuelle.

   vol | v <0-100>       : Ajuster le volume. (cassé/20 en cour de fix lel.)

   stop                  : Arréter la musique.`,

    'ban': `
~ban <mention> [options]
   Bans the mentioned user.
   You cannot ban users in a role higher.

   Options:
      [--days <number>]   : Deletes the message history of the user.
      [--reason <reason>] : Specifies a reason for banning the user.`,

    'kick': `
~kick <mention> [options]
   Kicks the mentioned user.
   You cannot kick users in a role higher.

   Options:
      [--reason <reason>] : Specifies a reason for kicking the user.`
}

