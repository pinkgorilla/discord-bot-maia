"use strict";
const Discord = require('discord.js');
var CollectorCommand = require("./collector-command");
const constants = require("./constants");

module.exports = class AttendanceCommand extends CollectorCommand {

    constructor() {
        super({
            name: "absen",
            desc: "An example command",
            INITIATE_CHANNEL: constants.CHANNEL.GUILD,
            INTERACTION_CHANNEL: constants.CHANNEL.DIRECT
        });
    }

    beforeCollectMessage(context) {
        var user = context.user;
        var channel = context.channel;
        context.reply(`Hi ${user}, yuk kita isi absen.\nApakah anda menghadiri pertemuan DATE?`);

        context.attendance = {};
        context.step = 1;
        return super.beforeCollectMessage(context);
    }

    onCollectMessage(element, collector, context) {
        var step = context.step;
        var attendance = context.attendance;
        var user = context.user;
        var channel = element.channel;
        var complete = context.complete;

        if (element.author.id === user.id) {
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
                        context.reply("Hal apakah yang Anda dapatkan?");
                    else
                        context.reply("Apakah alasan Anda tidak menghadiri pertemuan DATE?");
                    break;
                case 3:
                    context.reply("Hal apakah yang Anda bagikan?");
                    break;
            }

            if (complete)
                collector.stop(`:ok: Pengisian absen selesai\nTerima kasih ${user} atas kesediaannya mengisi absen.`);
        }

        context.step = step;
        context.attendance = attendance;
        context.complete = complete;
    }

    afterCollectMessage(context) {
        return new Promise((resolve, reject) => {

            var attendance = context.attendance;
            var amqp = require('amqplib/callback_api');
            amqp.connect(process.env.AMQP_URI, function (err, conn) {
                conn.createChannel(function (err, ch) {
                    var exchangeName = process.env.AMQP_EXCHANGE;
                    attendance.serverId = context.guild.id;
                    attendance.userId = context.user.id;
                    var msg = JSON.stringify(attendance);

                    ch.assertExchange(exchangeName, 'direct', { durable: false });
                    var published = ch.publish(exchangeName, 'attendance', new Buffer(msg));
                    if (published)
                        resolve(context);
                    else
                        reject("failed to save attendance");
                });
            });

        })
    }
};
