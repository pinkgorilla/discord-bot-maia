const Discord = require('discord.js');
const client = new Discord.Client();

const utilProcessor = require("./processors/mod-util");
const dmProcessor = require("./processors/mod-direct-message");

const MOD_ADMIN = "ADMIN";
const MOD_UTIL = "UTIL";

client.on('ready', () => {
  console.log('I am ready!');
});

client.on('disconnect', function(msg, code) {
  if (code === 0)
    return console.error(msg);
  client.login(process.env.token);
});

client.on('message', message => {
  if (message.author.bot)
    return;

  var content = message.content;
  var module = content.indexOf("$") == 0 ? MOD_ADMIN : content.indexOf("!") == 0 ? MOD_UTIL : "";

  var processor;
  switch (module) {
    case MOD_UTIL:
      processor = utilProcessor;
      break;
    default:
      processor = dmProcessor;
  }
  if (processor)
    processor(message);
});

client.login(process.env.token)
  .catch(e => {
    console.log(e);
  });
