const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Bot Running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Server running on ${PORT}`));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on('ready', () => {
  console.log(`✅ Bot Online: ${client.user.tag}`);
});

// ⚠️ CHECK TOKEN
if (!process.env.TOKEN) {
  console.error("❌ TOKEN missing!");
  process.exit(1);
}

const WELCOME_CHANNEL_ID = "1489323909860950219";

// ✅ SIMPLE WELCOME (no canvas = no crash)
function sendWelcome(member, channel) {
  const embed = new EmbedBuilder()
    .setColor("#00ffcc")
    .setTitle("✨ Welcome to DARK EAGLE 🦅 ✨")
    .setDescription(`👋 Hey <@${member.id}> welcome!`)
    .setFooter({ text: `Member #${member.guild.memberCount}` });

  channel.send({ embeds: [embed] });
}

client.on('guildMemberAdd', member => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!channel) return;
  sendWelcome(member, channel);
});

client.on('messageCreate', message => {
  if (message.content === '!welcome') {
    sendWelcome(message.member, message.channel);
  }
});

client.login(process.env.TOKEN);
