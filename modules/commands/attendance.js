"use strict";
const Discord = require('discord.js');
var CollectorCommand = require("./collector-command");

module.exports = class AttendanceCommand extends CollectorCommand {

    constructor() {
        super({
            name: "absen",
            desc: "An example command",
            INITIATE_CHANNEL: 4,
            INTERACTION_CHANNEL: 2
        });
    }

    beforeCollectMessage(context) {
        var user = context.user;
        var channel = context.channel;
        channel.reply(`Hi ${user}, yuk kita isi absen.\nApakah anda menghadiri pertemuan DATE?`);
        return super.beforeCollectMessage(context);
        // channel.send(`Hi ${user}, yuk kita isi absen.\nApakah anda menghadiri pertemuan DATE?`);
    }

    onCollectMessage(element, collector, context) {
        var step = context.step;
        var attendance = context.data;
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
        }

        context.step = step;
        context.data = attendance;
        context.complete = complete;
    }

    afterCollectMessage(context) {
        return new Promise((resolve, reject) => {

            var attendance = context.data;
            var amqp = require('amqplib/callback_api');
            amqp.connect('amqp://rxzpfahs:ZJYk0DscAJTu8Oxda3Vf_skus_PpV9qw@fish.rmq.cloudamqp.com/rxzpfahs', function (err, conn) {
                conn.createChannel(function (err, ch) {
                    var exchangeName = 'ex-date-attendance-dev';
                    attendance.serverId = context.guild.id;
                    attendance.userId = context.user.id;
                    var msg = JSON.stringify(attendance);

                    ch.assertExchange(exchangeName, 'direct', { durable: false });
                    ch.publish(exchangeName, '', new Buffer(msg));

                    resolve(context);
                    console.log(" [x] Sent %s", msg);
                });
            });

        })
    }
};
