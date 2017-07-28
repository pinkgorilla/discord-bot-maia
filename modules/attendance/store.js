const NUM_OF_STEPS = 5;
module.exports = class Attendance {

    constructor(user) {
        this.user = user;
        this.date = Date.now;
        this.attend = false;
        this.gained = "";
        this.shared = "";
        this.reason = "";
        this.step = 1;
        this.messages = ["",
            `Hallo ${user}, yuk kita isi absen.\nApakah anda menghadiri pertemuan DATE?`,
            "Apakah hal yang anda dapatkan di pertemuan DATE kemarin?",
            "Apakah hal yang anda bagikan di pertemuan DATE kemarin?",
            "Apakah alasan anda tidak menghadiri pertemuan DATE?",
            "Selesai, Terima kasih sudah meluangkan waktu untuk mengisi absen."];
    }

    isComplete() {
        return this.step === NUM_OF_STEPS;
    }

    reply() {
        return this.messages[this.step];
    }

    validate(answer) {
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

    setDate(date) {
        this.date = date;
    }

    setAttend(attend) {
        this.attend = attend;
    }

    setReason(reason) {
        this.reason = reason;
    }

    setGained(gained) {
        this.gained = gained;
    }

    setShared(shared) {
        this.shared = shared;
    }

}