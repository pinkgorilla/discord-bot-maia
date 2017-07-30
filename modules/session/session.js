module.exports = class Session {
    constructor(name, context) {
        this.name = name || "UNKNOWN-SESSION";
        this.context = context;
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
