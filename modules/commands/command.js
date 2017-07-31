const Clapp = require("clapp");
const Discord = require('discord.js');

class Command extends Clapp.Command {
    constructor(options) {
        options.fn = (argv, context) => {
            return this.run(argv, context);
        };
        
        super(options);
        this.options = options;
    }

    run(argv, context) {
        return new Promise((resolve, reject) => {
            var user = context.author;
            (context.channel.type === "dm" ? Promise.resolve(context.channel) : user.createDM())
                .then(channel => {
                    var collector = new Discord.MessageCollector(channel, (message) => true, {});
                    var ctx = {
                        user: user,
                        step: 1,
                        data: {},
                        complete: false
                    };

                    this.beforeCollectMessage(channel);

                    collector.on("collect", (element, collector) => {
                        this.onCollectMessage(element, collector, ctx);
                    });

                    this.afterCollectMessage(channel);

                    context.channel = channel;
                    collector.on("end", function (collected, reason) {
                        resolve({
                            message: reason,
                            context: context
                        });
                    })
                });
        });
    }

    beforeCollectMessage(channel) {

    }

    onCollectMessage(element, collector, context) {
        throw "Method is not implemented";
    }

    afterCollectMessage(channel) {

    }
};

module.exports = Command;