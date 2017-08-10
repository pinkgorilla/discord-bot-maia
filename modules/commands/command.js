"use strict";
const fetch = require("node-fetch");
const Clapp = require("clapp");
const Discord = require('discord.js');
const constants = require("./constants");
const EventEmitter = require("events");

module.exports = class Command extends Clapp.Command {
    constructor(options) {
        options.fn = (argv, context) => {
            var func = this.run;
            return func.call(this, argv, context);
        };
        super(options);
        this.options = options;
        this.options.INITIATE_CHANNEL = this.options.INITIATE_CHANNEL || (constants.CHANNEL.DIRECT | constants.CHANNEL.GUILD);
        this.options.INTERACTION_CHANNEL = this.options.INTERACTION_CHANNEL || constants.CHANNEL.ORIGIN;
        this.event = new EventEmitter();
    }

    _getInteractionChannel(discordMessage) {
        switch (this.options.INTERACTION_CHANNEL) {
            case constants.CHANNEL.ORIGIN:
                return Promise.resolve(discordMessage.channel);
            case constants.CHANNEL.DIRECT:
                var user = discordMessage.author || discordMessage.recipient;
                return discordMessage.channel.type === "dm" ? Promise.resolve(discordMessage.channel) : user.createDM();
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
                user: user,
                cancel: false
            };

            var callerChannel = context.source.channel.type === "dm" ? constants.CHANNEL.DIRECT : constants.CHANNEL.GUILD;
            if (!(this.options.INITIATE_CHANNEL & callerChannel)) {
                context.reply = function(message) {
                    var _reply = discordMessage.reply;
                    discordMessage.channel.startTyping();
                    _reply.call(discordMessage, message);
                    discordMessage.channel.stopTyping();
                };
                reject({
                    message: `Cannot execute command in this channel`,
                    context: context
                });
            }
            else {
                this._getInteractionChannel(discordMessage)
                    .then(channel => {
                        context.channel = channel;
                        context.reply = function(message) {
                            var _reply = channel.reply || channel.send;
                            channel.reply = _reply;
                            channel.startTyping();
                            _reply.call(channel, message);
                            channel.stopTyping();
                        };
                        context.guild = discordMessage.channel.guild;
                        resolve(context);
                    });
            }
        });
    }

    run(argv, discordMessage) {
        return this
            ._createContext(argv, discordMessage)
            .then(context => {
                return this._onCommandBegin(context)
                    .then(context => this.execute(context))
                    .then(context => this._onCommandComplete(context))
                    .catch(e => {
                        var messages = [e];
                        return Promise.reject({
                            message: messages.join(" "),
                            context: context
                        });
                    });
            })
            .catch(e => {
                var messages = [`\n:exclamation: failed executing command: \`${this.name}\` - `, `*${e.message || e}* .`];
                return Promise.resolve({
                    message: messages.join(" "),
                    context: e.context
                });
            });
    }

    // resolve object to be used on execute
    _onCommandBegin(context) {
        return this.onCommandBegin(context);
    }
    onCommandBegin(context) {
        return Promise.resolve(context);
    }

    execute(context) {
        return Promise.reject("Method is not implemented : execute");
    }

    _onCommandComplete(context) {
        if (context.cancel)
            return Promise.reject(context.output);
        else
            return this.onCommandComplete(context);
    }
    // resolve object
    onCommandComplete(context) {
        return Promise.resolve({
            message: context.output,
            context: context
        });
    }
    
    cancel(context, reason) {
        context.cancel = true;
        context.output = reason;
    }

    complete(context, reason) {
        context.complete = true;
        context.output = reason;
    }
    
    getGuildData(context) {
        if (context.guild && context.guild.id)
            return fetch(`https://maia-loopback-pinkgorilla.c9users.io/api/Guilds/${context.guild.id}`)
                .then(response => response.json())
                .then(result => {
                    if (result.error)
                        return Promise.resolve(null);
                    else
                        return Promise.resolve(result);
                });
        else
            return Promise.resolve(null);
    }
};
