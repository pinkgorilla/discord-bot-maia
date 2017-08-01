"use strict";
const Discord = require('discord.js');
var Command = require("./command");

module.exports = class CollectorCommand extends Command {
    constructor(options) {
        super(options);
        this.fn = (argv, context) => {
            return this.run(argv, context);
        };
    }

    execute(context) {
        context.data = {};
        context.step = 1;
        return this.createCollector(context)
            .then(context => this.beforeCollectMessage(context))
            .then(context => this.collectMessage(context))
            .then(context => this.afterCollectMessage(context));
    }

    createCollector(context) {
        var channel = context.channel;
        var collector = new Discord.MessageCollector(channel, (message) => true, {});
        context.collector = collector;
        return Promise.resolve(context);
    }

    collectMessage(context) {
        return new Promise((resolve, reject) => {
            var collector = context.collector;
            collector.on("collect", (element, collector) => {
                this.onCollectMessage(element, collector, context);
            });

            collector.on("end", (collected, reason) => {
                context.output = reason;
                resolve(context);
            })
        });
    }

    beforeCollectMessage(context) {
        return Promise.resolve(context);
    }

    // should call collector.stop method to complete collecting
    onCollectMessage(element, collector, context) {
        throw "Method is not implemented";
    }

    afterCollectMessage(context) {
        return Promise.resolve(context);
    }
};