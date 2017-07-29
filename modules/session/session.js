module.exports = class Session {
    constructor(dmChannel, name) {
        this.name = name || "UNKNOWN-SESSION";
        this.channel = dmChannel;
        this.user = dmChannel.recipient;
    }

    process(message) {
        throw "method is not implemented";
    }

    isComplete() {
        throw "method is not implemented";
    }

    response() {
        throw "method is not implemented";
    }
};
