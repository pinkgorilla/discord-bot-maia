const NUM_OF_STEPS = 5;
var Session = require("./session");

module.exports = class AttendanceSession extends Session {

    constructor(dmChannel) {
        super(dmChannel, "Attendance Session");
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
