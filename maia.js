const Clapp = require("clapp");
const Discord = require('discord.js');
const CommandSessionManager = require("./modules/command-session-manager");

var AttendanceCommand = require("./modules/commands/attendance");

class Maia extends Clapp.App {
    constructor() {
        super({
            name: "Maia",
            desc: "DATE servant bot.",
            prefix: "!",
            version: "1.0",
            onReply: function (msg, context) {
                var channel = context.channel;
                channel.send(msg);
            }
        })
        // this.channel = new Clapp.App();
        this.addCommand(new AttendanceCommand());
    }

    evaluate(message) {
        var messageContent = message.content;
        if (this.isCliSentence(messageContent)) {
            if (!CommandSessionManager.getActiveSession(message.author.id))
                this.parseInput(messageContent, message);
        }
    }
};

var maia = new Maia();
module.exports = maia;