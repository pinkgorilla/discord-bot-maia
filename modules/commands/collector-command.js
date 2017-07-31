const Clapp = require("clapp");
const Discord = require('discord.js');
const MOD_ORIGIN_CHANNEL = 1;
const MOD_DM_CHANNEL = 2;
const MOD_TEXT_CHANNEL = 4;

class Command extends Clapp.Command {
    constructor(options) {
        options.fn = (argv, context) => {
            return this.run(argv, context);
        };

        super(options);
        this.options = options;
        this.options.CHANNEL_MOD = this.options.CHANNEL_MOD || MOD_ORIGIN_CHANNEL;
    }

    _getChannel(message) {
        switch (this.options.CHANNEL_MOD) {
            case MOD_ORIGIN_CHANNEL:
                return Promise.resolve(message.channel);
                break;
            case MOD_DM_CHANNEL:
                return context.channel.type === "dm" ? Promise.resolve(context.channel) : user.createDM();
                break;
            case MOD_TEXT_CHANNEL:
                return context.channel.type === "text" ? Promise.resolve(context.channel) : Promise.reject("invalid channel");
        }
    }

    run(argv, context) {
        return new Promise((resolve, reject) => {
            var user = context.author || context.recipient;
            this._getChannel(context)
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