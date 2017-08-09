"use strict";
const Discord = require('discord.js');
var CollectorCommand = require("./collector-command");
const constants = require("./constants");


const QUESTION_1 = "```1. Apakah anda menghadiri pertemuan DATE? (ya|tidak)```";
const QUESTION_2A = "```2. Hal apakah yang anda dapatkan?```";
const QUESTION_2B = "```2. Apakah alasan Anda tidak menghadiri pertemuan DATE?```";
const QUESTION_3 = "```3. Hal apakah yang anda bagikan?```";

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
        var self = this;
        var cancel = this.cancel;
        return this.getGuildData(context)
            .then(guild => {
                if (guild) {
                    var user = context.user;
                    var channel = context.channel;
                    context.reply(`Anda akan melakukan pengisian data absen.\nSilahkan jawab pertanyaan-pertanyaan berikut.\n${QUESTION_1}`);
                    context.attendance = {};
                    context.step = 1;
                }
                else {
                    context.step = -1;
                    this.cancel(context, `DATE tidak terdaftar`);
                }
                return super.beforeCollectMessage(context);
            })
    }

    onCollectMessage(element, collector, context) {
        var step = context.step;
        var attendance = context.attendance;
        var user = context.user;
        var channel = element.channel; 

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
                        this.complete(context, `:white_check_mark: Pengisian absen selesai\nTerima kasih ${user} atas kesediaannya mengisi absen.`);
                    }
                    break;
                case 3:
                    attendance.shared = response;
                    step = 0;
                    this.complete(context, `:white_check_mark: Pengisian absen selesai\nTerima kasih ${user} atas kesediaannya mengisi absen.`);
                    break;
            }

            switch (step) {
                case 2:
                    if (attendance.attend)
                        context.reply(QUESTION_2A);
                    else
                        context.reply(QUESTION_2B);
                    break;
                case 3:
                    context.reply(QUESTION_3);
                    break;
            }
        }

        context.step = step;
        context.attendance = attendance; 
    }

    afterCollectMessage(context) {
        return new Promise((resolve, reject) => {

            var attendance = context.attendance;
            var amqp = require('amqplib/callback_api');
            amqp.connect(process.env.AMQP_URI, function (err, conn) {
                if (err)
                    reject("amqp failed to connect");
                conn.createChannel(function (err, ch) {
                    if (err)
                        reject("amqp failed to connect");
                    var exchangeName = process.env.AMQP_EXCHANGE;
                    var attendanceKey = process.env.AMQP_ATTENDANCE_KEY;
                    attendance.serverId = context.guild.id;
                    attendance.userId = context.user.id;
                    var msg = JSON.stringify(attendance);

                    ch.assertExchange(exchangeName, 'direct', { durable: false });
                    var published = ch.publish(exchangeName, attendanceKey, new Buffer(msg));
                    if (published)
                        resolve(context);
                    else
                        reject("failed to save attendance");
                });
            });

        })
    }
};
