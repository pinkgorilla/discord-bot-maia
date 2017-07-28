var session = require("../modules/session");
var Attendance = require("../modules/attendance/store");

const attend_commands = ["attendance", "attend", "absen"];
const COMMAND_ATTENDANCE = "ATTENDANCE";

module.exports = function (message) {
    var command = message.content.substr(1, message.content.length - 1);

    command = attend_commands.indexOf(command) !== -1 ? COMMAND_ATTENDANCE : "";
    switch (command) {
        case COMMAND_ATTENDANCE:
            var user = message.author;
            user.createDM()
                .then(dmChannel => {
                    var activeSession = session.getActiveSession(user.id)
                    if (!activeSession) {
                        activeSession = new Attendance(user);
                        session.setSession(user.id, activeSession);
                        dmChannel.send(activeSession.reply());
                    }
                    else
                        dmChannel.send(`sorry ${message.author}, you have an active session.`);
                });
            break;
        default:
            message.reply('unknown command');
    }
}