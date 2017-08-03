"use strict";
const Clapp = require("clapp");
const Discord = require('discord.js');
const constants = require("./constants");

module.exports = class Command extends Clapp.Command {
    constructor(options) {
        options.fn = (argv, context) => {
            return this.run(argv, context);
        };
        super(options);
        this.options = options;
        this.options.INITIATE_CHANNEL = this.options.INITIATE_CHANNEL || (constants.CHANNEL.DIRECT | constants.CHANNEL.GUILD);
        this.options.INTERACTION_CHANNEL = this.options.INTERACTION_CHANNEL || constants.CHANNEL.ORIGIN;
    }

    _getInteractionChannel(discordMessage) {
        switch (this.options.INTERACTION_CHANNEL) {
            case constants.CHANNEL.ORIGIN:
                return Promise.resolve(message.channel);
                break;
            case constants.CHANNEL.DIRECT:
                var user = discordMessage.author || discordMessage.recipient;
                return discordMessage.channel.type === "dm" ? Promise.resolve(discordMessage.channel) : user.createDM();
                break;
            case constants.CHANNEL.GUILD:
                return discordMessage.channel.type === "text" ? Promise.resolve(discordMessage.channel) : Promise.reject("invalid channel");
        }
    }

    _createContext(argv, discordMessage) {
        return new Promise((resolve, reject) => {
            var user = discordMessage.author || discordMessage.recipient;
            var context = {
                command: this,
                argv: argv,
                source: discordMessage,
                user: user
            };

            var callerChannel = context.source.channel.type === "dm" ? constants.CHANNEL.DIRECT : constants.CHANNEL.GUILD;
            if (!(this.options.INITIATE_CHANNEL & callerChannel)) {
                context.reply = function (message) {
                    var _reply = discordMessage.reply;
                    discordMessage.channel.startTyping();
                    _reply.call(discordMessage, message);
                    discordMessage.channel.stopTyping();
                };
                reject({
                    message: `Cannot execute command ${this.options.name} in this channel`,
                    context: context
                });
            }
            else {
                this._getInteractionChannel(discordMessage)
                    .then(channel => {
                        context.channel = channel;
                        context.reply = function (message) {
                            var _reply = channel.reply || channel.send;
                            channel.reply = _reply;
                            channel.startTyping();
                            _reply.call(channel, message);
                            channel.stopTyping();
                        }
                        context.guild = discordMessage.channel.guild;
                        resolve(context);
                    });
            } 
        });
    }

    run(argv, discordMessage) {
        return this
            ._createContext(argv, discordMessage)
            .then(context => this.onCommandBegin(context))
            .then(context => this.execute(context))
            .then(context => this.onCommandComplete(context))
            .catch(e => {
                var user = e.context.user
                var messages = [":exclamation:", user, e.message];
                return Promise.resolve({
                    message: messages.join(" "),
                    context: e.context
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

