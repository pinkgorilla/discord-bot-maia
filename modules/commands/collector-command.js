"use strict";
const Discord = require('discord.js');
var Command = require("./command");

module.exports = class CollectorCommand extends Command {
    constructor(options) {
        super(options);
    }

    execute(context) {
        return this.createCollector(context)
            .then(context => this._beforeCollectMessage(context))
            .then(context => this._collectMessage(context))
            .then(context => this._afterCollectMessage(context));
    }

    createCollector(context) {
        var channel = context.channel;
        var collector = new Discord.MessageCollector(channel, (message) => true, {});
        context.collector = collector;
        return Promise.resolve(context);
    }

    _collectMessage(context) {
        if (context.complete)
            return Promise.resolve(context);
        else if (context.cancel)
            return Promise.reject(context.output);
        else
            return new Promise((resolve, reject) => {
                var collector = context.collector;
                collector.on("collect", (element, collector) => {
                    if (element.author.id === context.source.client.user.id)
                        return;

                    if (!context.complete) {
                        var cancelRegExp = /(cancel|abort|quit)/i;
                        var content = element.content;
                        var match = content.match(cancelRegExp);
                        if (match && match.lenth > 0) {
                            context.cancel = true;
                            collector.stop("command cancelled");
                        }
                        else
                            this.onCollectMessage(element, collector, context);
                    }

                    if (context.complete)
                        collector.stop(context.output);
                });

                collector.on("end", (collected, reason) => {
                    context.output = reason;
                    resolve(context);
                });
            });
    }

    _beforeCollectMessage(context) {
        return this.beforeCollectMessage(context);
    }
    beforeCollectMessage(context) {
        return Promise.resolve(context);
    }

    // should call collector.stop method to complete collecting
    onCollectMessage(element, collector, context) {
        return Promise.reject("Method is not implemented");
    }

    _afterCollectMessage(context) {
        if (context.cancel)
            return Promise.reject(context.output);

        return this.afterCollectMessage(context);
    }
    afterCollectMessage(context) {
        return Promise.resolve(context);
    }
};
