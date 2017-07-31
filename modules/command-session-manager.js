class CommandSessionManager {
    constructor() {
        this.sessions = new Map();
    }

    setSession(userId, session) {
        this.sessions.set(userId, session);
    }
    
    remove(userId) {
        this.sessions.delete(userId);
    }

    getActiveSession(userId) {
        return this.sessions.has(userId) ? this.sessions.get(userId) : null;
    }
}
var sessionManager = new CommandSessionManager();
module.exports = sessionManager;