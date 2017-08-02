const Clapp = require("clapp");
const Discord = require('discord.js');
const CommandSessionManager = require("./modules/command-session-manager");

const client = new Discord.Client();
var AttendanceCommand = require("./modules/commands/attendance-command");
var GuildCommand = require("./modules/commands/guild-command");

class Maia extends Clapp.App {
    constructor() {
        super({
            name: "Maia",
            desc: "DATE servant bot.",
            prefix: "!",
            version: "1.0",
            onReply: function (msg, context) {
                var channel = context.channel;
                channel.reply = channel.reply || channel.send;
                context.reply(msg);
            }
        })
        // this.channel = new Clapp.App();
        this.addCommand(new AttendanceCommand());
        this.addCommand(new GuildCommand());
    }

    evaluate(message) {
        var messageContent = message.content;
        if (this.isCliSentence(messageContent)) {
            if (!CommandSessionManager.getActiveSession(message.author.id))
                this.parseInput(messageContent, message);
        }
    }

    start() {
        client.on('ready', () => {
            console.log('I am ready!');
        });

        client.on('disconnect', function (msg, code) {
            if (code === 0)
                return console.error(msg);
            client.login(process.env.token);
        });

        client.on('message', message => {
            if (message.author.bot)
                return;
            maia.evaluate(message);
        });

        client.login(process.env.token)
            .catch(e => {
                console.log(e);
            });
    }
};

var maia = new Maia();
module.exports = maia;