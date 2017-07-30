const NUM_OF_STEPS = 5;
const Discord = require('discord.js');
const Session = require("./session");

module.exports = class AttendanceSession extends Session {

    constructor(context) {
        super("Attendance Session", context);
        this.user = context.author;

        this.data = {};
        this.data.date = Date.now;
        this.data.attend = false;
        this.data.gained = "";
        this.data.shared = "";
        this.data.reason = "";

        this.step = 1;
        this.messages = ["",
            `Hallo ${this.user}, yuk kita isi absen.\nApakah anda menghadiri pertemuan DATE?`,
            "Apakah hal yang anda dapatkan di pertemuan DATE kemarin?",
            "Apakah hal yang anda bagikan di pertemuan DATE kemarin?",
            "Apakah alasan anda tidak menghadiri pertemuan DATE?",
            "Selesai, Terima kasih sudah meluangkan waktu untuk mengisi absen."
        ];
    }

    run() {
        return new Promise((resolve, reject) => {
            var channel = this.context.channel;
            var collector = new Discord.MessageCollector(channel, (message) => true, {});
            channel.send(this.response());
            collector.on("collect", (element, collector) => {
                if (element.author.id === this.user.id) {

                    this.process(element.content);

                    if (this.isComplete()) {
                        collector.stop(this.response());
                    }
                    else
                        element.reply(this.response());
                }
            });

            collector.on("end", function (collected, reason) {
                resolve(reason);
            })
        });
    }


    isComplete() {
        return this.step === NUM_OF_STEPS;
    }

    response() {
        return this.messages[this.step];
    }

    process(answer) {
        switch (this.step) {
            case 1:
                this.attend = answer.toLowerCase() === "ya";
                this.step += this.attend ? 1 : 3;
                break;
            case 2:
                if (this.attend) {
                    this.gained = answer;
                    this.step++;
                }
                break;
            case 3:
                if (this.attend) {
                    this.shared = answer;
                    this.step = NUM_OF_STEPS;
                }
                break;
            case 4:
                this.reason = answer;
                this.step = NUM_OF_STEPS;
                break;
        }
    }
};
