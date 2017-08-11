"use strict";

const Clapp = require("clapp");
var CollectorCommand = require("./collector-command");
const constants = require("./constants");

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
        "```"
    ].join("\n")
].join("\n");
const DAYS = ["", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

module.exports = class GuildCommand extends CollectorCommand {

    constructor() {
        super({
            name: "date",
            desc: "Date management command",
            args: [
                new Clapp.Argument({
                    name: "action",
                    desc: "Action to perform",
                    type: "string",
                    required: false,
                    default: "info",
                    validations: [{
                        errorMessage: "This argument must be a valid email",
                        validate: value => {
                            var regexp = /(info|config|schedule)/i;
                            return value.match(regexp) !== null;
                        }
                    }]
                })
            ],
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
                    desc: "date info",
                    alias: 'i',
                    type: "boolean",
                    default: true
                })
            ],
            INITIATE_CHANNEL: constants.CHANNEL.GUILD,
            INTERACTION_CHANNEL: constants.CHANNEL.DIRECT
        });
    }

    beforeCollectMessage(context) {
        var argv = context.argv;
        var args = argv.args;
        var action = args.action;

        context.data = null;
        switch (action) {
            case "config":
                context.step = 1;
                context.reply(`Konfigurasi DATE\n${QUESTION_SETUP_1}`);
                return super.beforeCollectMessage(context);

            case "info":
            default:
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
                    });
        }
    }

    onCollectMessage(element, collector, context) { 
        var argv = context.argv;
        var args = argv.args;
        var action = args.action;
        switch (action) {
            case "config": 
                var step = context.step;
                var guildData = context.data || { id: context.guild.id, name: context.guild.name, schedule: 1 };
                var response = element.content;

                switch (step) {
                    case 1:
                        guildData.name = response;
                        step++;
                        break;
                    case 2:
                        var pattern = /[1-7]/i;
                        var match = response.match(pattern) || [];
                        var schedule = match.length > 0 ? parseInt(match[0], 10) : 0;
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
                break;

        } 
    }

    afterCollectMessage(context) {
        var argv = context.argv; 
        var args = argv.args;
        var action = args.action;

        switch (action) {
            case "config":
                return this.saveConfig(context);
            case "info":
            default:
                return super.afterCollectMessage(context);

        }
    }

    saveConfig(context) {
        return new Promise((resolve, reject) => {

            var guildData = context.data;
            var amqp = require('amqplib/callback_api');
            amqp.connect(process.env.AMQP_URI, function(err, conn) {
                if (err)
                    reject("amqp failed to connect");
                conn.createChannel(function(err, ch) {
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

        });
    }
};
