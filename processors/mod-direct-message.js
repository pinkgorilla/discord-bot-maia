var sessionManager = require("../modules/session/session-manager");

module.exports = function(message) {
    var user = message.author;
    var activeSession = sessionManager.getActiveSession(user.id);
    if (activeSession) {

        activeSession.process(message.content);

        if (activeSession.isComplete())
            sessionManager.remove(user.id);

        message.reply(activeSession.response());
    }
};
