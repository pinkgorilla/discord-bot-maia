"use strict";
const Clapp = require("clapp");
const Discord = require('discord.js');
const CHANNEL_ORIGIN = 1;
const CHANNEL_DIRECT = 2;
const CHANNEL_TEXT = 4;

module.exports = class Command extends Clapp.Command {
    constructor(options) {
        options.fn = (argv, context) => {
            return this.run(argv, context);
        };
        super(options);
        this.options = options;
        this.options.INITIATE_CHANNEL = this.options.INITIATE_CHANNEL || (CHANNEL_DIRECT | CHANNEL_TEXT);
        this.options.INTERACTION_CHANNEL = this.options.INTERACTION_CHANNEL || CHANNEL_ORIGIN;
    }

    _getInteractionChannel(discordMessage) {
        switch (this.options.INTERACTION_CHANNEL) {
            case CHANNEL_ORIGIN:
                return Promise.resolve(message.channel);
                break;
            case CHANNEL_DIRECT:
                var user = discordMessage.author || discordMessage.recipient;
                return discordMessage.channel.type === "dm" ? Promise.resolve(discordMessage.channel) : user.createDM();
                break;
            case CHANNEL_TEXT:
                return discordMessage.channel.type === "text" ? Promise.resolve(discordMessage.channel) : Promise.reject("invalid channel");
        }
    }

    _createContext(argv, discordMessage) {
        var initChannel = discordMessage.channel;

        if ((this.options.INITIATE_CHANNEL & CHANNEL_DIRECT) && initChannel.type !== "db")
            return Promise.reject("Cannot execute command in this channel");
        else if ((this.options.INITIATE_CHANNEL & CHANNEL_TEXT) && initChannel.type !== "text")
            return Promise.reject("Cannot execute command in this channel");


        return this._getInteractionChannel(discordMessage)
            .then(channel => {
                var user = discordMessage.author || discordMessage.recipient;
                var _reply = channel.reply || channel.send;
                channel.reply = _reply;
                //  function (message) {
                //     channel.startTyping();
                //     _reply.bind(channel);
                //     _reply(message);
                //     channel.stopTyping();
                // };
                var context = {
                    argv: argv,
                    user: user,
                    source: discordMessage,                    
                    channel: channel,
                    command: this
                };
                if ((this.options.INITIATE_CHANNEL & CHANNEL_TEXT) && initChannel.type === "text")
                    context.guild = initChannel.guild;
                return context;
            })
    }

    run(argv, discordMessage) {
        return this
            ._createContext(argv, discordMessage)
            .then(context => this.onCommandBegin(context))
            .then(context => this.execute(context))
            .then(context => this.onCommandComplete(context))
            .catch(e => {
                var channel = discordMessage.channel;
                var user = channel.type === "text" ? discordMessage.author : null;
                var messages = [":exclamation:", user, e];
                // channel.reply = channel.reply || channel.send;
                return Promise.resolve({
                    message: messages.join(" "),
                    context: {
                        channel: channel
                    }
                });
            });
    }

    // resolve object to be used on execute
    onCommandBegin(context) {
        return Promise.resolve(context)
    }

    execute(context) {
        throw "Method is not implemented";
    }

    // resolve object
    onCommandComplete(context) {
        return Promise.resolve({
            message: context.output,
            context: context
        });
    }
};

