"use strict";
const Discord = require('discord.js');
const Clapp = require("clapp");
var CollectorCommand = require("./collector-command");

const QUESTION_SETUP_1 = "```Nama DATE```";
const QUESTION_SETUP_2 = [
    ["```",
        "Hari pertemuan DATE?",
        "\t1 - Senin",
        "\t2 - Selasa",
        "\t3 - Rabu",
        "\t4 - Kamis",
        "\t5 - Jumat",
        "\t6 - Sabtu",
        "\t7 - Minggu",
        "(isi dengan angka)",
        "```"].join("\n")
].join("\n");

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
        if (setup) {
            context.step = 1;
            context.reply(`Konfigurasi DATE`);
            context.reply(QUESTION_SETUP_1);
        }
        else if (info) {
            context.step = -1;
            var output = !context.data ? `:exclamation: tidak terdaftar` : `:ok: terdaftar`;
            this.cancel(context, output)
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
                var guildData = context.data || { guildId: context.guild.id, name: context.guild.name, schedule: 1 };
                var channel = element.channel;
                var complete = context.complete;
                var response = element.content;

                switch (step) {
                    case 1:
                        guildData.name = response;
                        step++;
                        break;
                    case 2:
                        var pattern = /[1-7]/i;
                        var match = response.match(pattern) || [];
                        var schedule = match.length > 0 ? parseInt(match[0]) : 0;
                        if (schedule >= 1 && schedule <= 7) {
                            guildData.schedule = schedule;
                            complete = true;
                            step++;
                        }
                        else
                            context.reply("Invalid value");
                        break;
                    case 3:
                        guildData.shared = response;
                        complete = true;
                        step = 0;
                        break;
                }

                switch (step) {
                    case 2:
                        context.reply(QUESTION_SETUP_2);
                        break;
                }

                if (complete)
                    collector.stop(`:ok: Pengisian absen selesai\nTerima kasih ${user} atas kesediaannya mengisi absen.`);

                context.step = step;
                context.data = guildData;
                context.complete = complete;
            }
        }
    }

    afterCollectMessage(context) {
        return new Promise((resolve, reject) => {

            var guildData = context.data;
            var amqp = require('amqplib/callback_api');
            amqp.connect(process.env.AMQP_URI, function (err, conn) {
                conn.createChannel(function (err, ch) {
                    var exchangeName = process.env.AMQP_EXCHANGE;
                    var guildSetupKey = process.env.AMQP_GUILD_SETUP_KEY;
                    guildData.serverId = context.guild.id;
                    var msg = JSON.stringify(guildData);

                    ch.assertExchange(exchangeName, 'direct', { durable: false });
                    var published = ch.publish(exchangeName, guildSetupKey, new Buffer(msg));
                    if (published)
                        resolve(context);
                    else
                        reject("failed to save attendance");
                });
            });

        })
    }
};
