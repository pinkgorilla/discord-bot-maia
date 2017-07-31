const Discord = require('discord.js');
const Command = require("./command");

module.exports = class AttendanceCommand extends Command {

    constructor() {
        super({
            name: "absen",
            desc: "An example command"
        });
    }

    beforeCollectMessage(channel) {
        var user = channel.author || channel.recipient;
        channel.send(`Hi ${user}, yuk kita isi absen.\nApakah anda menghadiri pertemuan DATE?`);
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
                collector.stop(`Pengisian absen selesai\nTerima kasih ${user} atas kesediaannya mengisi absen.`);
        }

        context.step = step;
        context.data = attendance;
        context.complete = complete;
    }
};
