var sessionManager = require("../modules/session/session-manager");
var Clapp = require("clapp"); 

const MOD_SU = "SU";
const MOD_USER = "USER";

class DirectChannel {
    constructor() {
        this.channel = new Clapp.App({
            name: "Test App",
            desc: "An app that does the thing",
            prefix: "!",
            version: "1.0",
            onReply: function (msg, context) {
                var channel = context.channel;
                channel.send(msg);
            }
        });
        this.channel.addCommand(new Clapp.Command({
            name: "foo",
            desc: "An example command",
            fn: function (argv, context) {
                return "Foo was executed!"
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
