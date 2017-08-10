const Clapp = require("clapp");
const Discord = require('discord.js');
const CommandSessionManager = require("./modules/command-session-manager");

const client = new Discord.Client();
var AttendanceCommand = require("./modules/commands/attendance-command");
var GuildCommand = require("./modules/commands/date-command"); 
var PingCommand = require("./modules/commands/ping-command");

class Maia extends Discord.Client {
    constructor() {
        super();
        var app = new Clapp.App({
            name: "Maia",
            desc: "DATE servant bot.",
            prefix: "!",
            version: "1.0",
            onReply: function(msg, context) {
                context.reply(msg);
            }
        });
        app.addCommand(new AttendanceCommand());
        app.addCommand(new GuildCommand());
        app.addCommand(new PingCommand());
        this.app = app;
    }

    evaluate(message) {
        var messageContent = message.content;
        if (this.app.isCliSentence(messageContent)) {
            if (!CommandSessionManager.getActiveSession(message.author.id))
                this.app.parseInput(messageContent, message);
        }
    }

    start() {
        this.on('ready', function() {
            console.log('I am ready!');
        });

        this.on('disconnect', function(msg, code) {
            if (code === 0)
                return console.error(msg);
            this.login(process.env.token);
        });

        this.on('message', function(message) {
            if (message.author.id === this.user.id)
                return;
            this.evaluate(message);
        });

        this.login(process.env.token)
            .catch(e => {
                console.log(e);
            });
    }
}

var maia = new Maia();
module.exports = maia;
