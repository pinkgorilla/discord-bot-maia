const Discord = require('discord.js');
const client = new Discord.Client();

const direct = require("./channels/direct-message");
const guild = require("./channels/guild-text");

client.on('ready', () => {
  console.log('I am ready!');
});

client.on('disconnect', function (msg, code) {
  if (code === 0)
    return console.error(msg);
  client.login(process.env.token);
});

client.on('message', message => {
  if (message.author.bot)
    return;

  var channel;
  switch (message.channel.type) {
    case "text":
      channel = guild;
      break;
    case "dm":
    default:
      channel = direct;
  }
  if (channel)
    channel.evaluate(message);
});

client.login(process.env.token)
  .catch(e => {
    console.log(e);
  });
