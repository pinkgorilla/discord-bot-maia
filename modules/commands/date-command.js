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
const DAYS = ["", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

module.exports = class GuildCommand extends CollectorCommand {

    constructor() {
        super({
            name: "date",
            desc: "Date management command",
            flags: [
                new Clapp.Flag({
                    name: "config",
                    desc: "configure guild",
                    alias: 'c',
                    type: "boolean",
                    default: false
                }),
                new Clapp.Flag({
                    name: "add-schedule",
                    desc: "add data",
                    alias: 'a',
                    type: "string",
                    default: "schedule"
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
        var config = argv.flags.config;
        var info = argv.flags.info;

        context.data = null;
        if (config) {
            context.step = 1;
            context.reply(`Konfigurasi DATE\n${QUESTION_SETUP_1}`);
            return super.beforeCollectMessage(context);
        }
        else if (info) {
            return this.getGuildData(context)
                .then(guild => {
                    if (guild) {
                        context.data = guild;
                        this.complete(context, `\`\`\`Date Information:\n\n\tNama : ${guild.name}\n\tHari : ${DAYS[guild.schedule]}\`\`\``);
                    }
                    else {
                        context.step = -1;
                        this.cancel(context, `tidak terdaftar`);
                    }

                    return super.beforeCollectMessage(context);
                })
        }
    }

    onCollectMessage(element, collector, context) {
        var user = context.user;
        var argv = context.argv;
        var config = argv.flags.config;
        var info = argv.flags.info;

        if (element.author.id === user.id) {
            if (config) {
                var step = context.step;
                var guildData = context.data || { id: context.guild.id, name: context.guild.name, schedule: 1 };
                var channel = element.channel; 
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
                            step++;
                            this.complete(context, `:white_check_mark: Data DATE sudah tersimpan.`);
                        }
                        else
                            context.reply("Invalid value");
                        break;
                }

                switch (step) {
                    case 2:
                        context.reply(QUESTION_SETUP_2);
                        break;
                }

                context.step = step;
                context.data = guildData; 
            }
        }
    }

    afterCollectMessage(context) {
        var argv = context.argv;
        var config = argv.flags.config;
        var info = argv.flags.info;
        if (config)
            return new Promise((resolve, reject) => {

                var guildData = context.data;
                var amqp = require('amqplib/callback_api');
                amqp.connect(process.env.AMQP_URI, function (err, conn) {
                    if (err)
                        reject("amqp failed to connect");
                    conn.createChannel(function (err, ch) {
                        if (err)
                            reject("amqp failed to connect");
                        var exchangeName = process.env.AMQP_EXCHANGE;
                        var guildSetupKey = process.env.AMQP_GUILD_SETUP_KEY;
                        guildData.id = context.guild.id;
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
        else
            return super.afterCollectMessage(context);
    }
};
