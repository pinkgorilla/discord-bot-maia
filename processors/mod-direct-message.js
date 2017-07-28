var session = require("../modules/session");

module.exports = function (message) {
    var user = message.author;
    var activeSession = session.getActiveSession(user.id);
    if (activeSession) {
        activeSession.validate(message.content);

        if (activeSession.isComplete()) {
            message.reply(activeSession.reply());
            session.remove(user.id);
        }
        else
            message.reply(activeSession.reply());
    }
}