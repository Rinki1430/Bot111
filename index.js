const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const express = require('express');

const app = express();
app.get('/', (req, res) => {
res.send('Bot is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(🌐 Web server running on port ${PORT});
});

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent
]
});

client.on('ready', () => {
console.log(✅ Bot Online: ${client.user.tag});
});

const WELCOME_CHANNEL_ID = "1489323909860950219";

// 🎯 Welcome Function (reuse karne ke liye)
function sendWelcome(member, channel) {
const embed = new EmbedBuilder()
.setColor("#00ffcc")
.setTitle("✨ Welcome to DARK EAGLE 🦅 ✨")
.setDescription(👋 Hey <@${member.id}>\n\n🔥 Welcome to ${member.guild.name}!\n💎 Enjoy your stay!)
.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
.setFooter({ text: Member #${member.guild.memberCount} })
.setTimestamp();

channel.send({ embeds: [embed] });
}

// 👇 Real join event
client.on('guildMemberAdd', member => {
const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
if (!channel) return;
sendWelcome(member, channel);
});

// 👇 TEST COMMAND (!welcome)
client.on('messageCreate', message => {
if (message.content === '!welcome') {
sendWelcome(message.member, message.channel);
}
});

client.login(process.env.TOKEN);
