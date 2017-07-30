var sessionManager = require("../modules/session/session-manager");
var AttendanceSession = require("../modules/session/attendance-session");
const Clapp = require("clapp");
const Discord = require('discord.js');

const MOD_SU = "SU";
const MOD_USER = "USER";

class DirectChannel {
    constructor() {
        this.channel = new Clapp.App({
            name: "Maia",
            desc: "DATE servant bot.",
            prefix: "!",
            version: "1.0",
            onReply: function (msg, context) {
                var channel = context.channel;
                channel.send(msg);
            }
        });
        this.channel.addCommand(new Clapp.Command({
            name: "absen",
            desc: "An example command",
            fn: function (argv, context) {
                var session = new AttendanceSession(context);
                return session.run();
            }
        }));
    }

    evaluate(message) {
        var messageContent = message.content;
        if (this.channel.isCliSentence(messageContent)) {
            this.channel.parseInput(messageContent, message);
        }
    }
};

var directChannel = new DirectChannel();
module.exports = directChannel;
