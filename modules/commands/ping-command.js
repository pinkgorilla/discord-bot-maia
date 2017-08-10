"use strict";
const Discord = require('discord.js');
var Command = require("./command");
const constants = require("./constants");

module.exports = class CollectorCommand extends Command {
    constructor() {
        super({
            name: "ping",
            desc: "Ping command",
            INITIATE_CHANNEL: constants.CHANNEL.GUILD | constants.CHANNEL.DIRECT,
            INTERACTION_CHANNEL: constants.CHANNEL.ORIGIN
        });
    }

    execute(context) {
        context.output = "pong";
        return Promise.resolve(context);
    } 
};
