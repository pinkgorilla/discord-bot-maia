const Discord = require('discord.js');
const client = new Discord.Client();
const maia = require("./maia");

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
  maia.evaluate(message);
});

client.login(process.env.token)
  .catch(e => {
    console.log(e);
  });
