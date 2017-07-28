module.exports = function (message) {
    var command = message.content.substr(1, message.content.length - 1);
    if (content === 'ping') {
        message.reply('pong');
    }
}