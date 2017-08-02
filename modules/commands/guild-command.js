"use strict";
const Discord = require('discord.js');
const Clapp = require("clapp");
var CollectorCommand = require("./collector-command");

module.exports = class GuildCommand extends CollectorCommand {

    constructor() {
        super({
            name: "guild",
            desc: "guild command",
            flags: [
                new Clapp.Flag({
                    name: "setup",
                    desc: "setup guild",
                    alias: 's',
                    type: "boolean",
                    default: false
                }),

                new Clapp.Flag({
                    name: "info",
                    desc: "guild info",
                    alias: 'i',
                    type: "boolean",
                    default: true
                })
            ],
            INITIATE_CHANNEL: 4,
            INTERACTION_CHANNEL: 2
        });
    }

    beforeCollectMessage(context) {
        var user = context.user;
        var channel = context.channel;

        var argv = context.argv;
        var setup = argv.flags.setup;
        var info = argv.flags.info;

        context.data = null;
        if (info) {
            context.step = -1;
            var output = !context.data ? `:exclamation: tidak terdaftar` : `:ok: terdaftar`;
            this.cancel(context, output)
        }
        else if (setup) {
            context.step = 1;
            channel.reply(`Hi ${user}, yuk kita isi absen.\nApakah anda menghadiri pertemuan DATE?`);
        }

        return super.beforeCollectMessage(context);
    }

    onCollectMessage(element, collector, context) {
        var user = context.user;
        var argv = context.argv;
        var setup = argv.flags.setup;
        var info = argv.flags.info;

        if (element.author.id === user.id) {
            if (setup) {
                var step = context.step;
                var attendance = context.data;
                var channel = element.channel;
                var complete = context.complete;
                var response = element.content;

                switch (step) {
                    case 1:
                        var pattern = /(ya|iya|yes|hadir|datang)/i;
                        attendance.attend = (response.match(pattern) || []).length > 0;
                        step++;
                        break;
                    case 2:
                        if (attendance.attend) {
                            attendance.gained = response;
                            step++;
                        }
                        else {
                            attendance.reason = response;
                            step = 0;
                            complete = true;
                        }
                        break;
                    case 3:
                        attendance.shared = response;
                        complete = true;
                        step = 0;
                        break;
                }

                switch (step) {
                    case 2:
                        if (attendance.attend)
                            channel.send("Hal apakah yang Anda dapatkan?");
                        else
                            channel.send("Apakah alasan Anda tidak menghadiri pertemuan DATE?");
                        break;
                    case 3:
                        channel.send("Hal apakah yang Anda bagikan?");
                        break;
                }

                if (complete)
                    collector.stop(`:ok: Pengisian absen selesai\nTerima kasih ${user} atas kesediaannya mengisi absen.`);

                context.step = step;
                context.data = attendance;
                context.complete = complete;
            }
        }
    }

    afterCollectMessage(context) {
        return Promise.resolve(context);
    }
};
