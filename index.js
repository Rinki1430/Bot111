const { Client, GatewayIntentBits, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const express = require('express');
const { createCanvas, loadImage } = require('canvas');

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

// 🔧 CONFIG
const WELCOME_CHANNEL_ID = "1489323909860950219";
const AUTO_ROLE_ID = "PUT_ROLE_ID_HERE"; // 👈 yahan role ID daalna

// 🎨 Welcome Image Function
async function createWelcomeImage(member) {
  const canvas = createCanvas(800, 250);
  const ctx = canvas.getContext('2d');

  // background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // text
  ctx.fillStyle = '#ffffff';
  ctx.font = '30px sans-serif';
  ctx.fillText(`Welcome`, 250, 80);

  ctx.font = '25px sans-serif';
  ctx.fillText(member.user.username, 250, 130);

  // avatar
  const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png' }));
  ctx.drawImage(avatar, 50, 50, 150, 150);

  return canvas.toBuffer();
}

// 🎯 Welcome Send Function
async function sendWelcome(member, channel) {
  const buffer = await createWelcomeImage(member);
  const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });

  const embed = new EmbedBuilder()
    .setColor("#00ffcc")
    .setTitle("✨ Welcome to DARK EAGLE 🦅 ✨")
    .setDescription(`👋 Hey <@${member.id}> welcome!`)
    .setImage("attachment://welcome.png")
    .setFooter({ text: `Member #${member.guild.memberCount}` });

  channel.send({ embeds: [embed], files: [attachment] });
}

// 👇 MEMBER JOIN EVENT
client.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!channel) return;

  // Auto Role
  try {
    const role = member.guild.roles.cache.get(AUTO_ROLE_ID);
    if (role) await member.roles.add(role);
  } catch (err) {
    console.log("Role error:", err);
  }

  sendWelcome(member, channel);
});

// 👇 TEST COMMAND
client.on('messageCreate', message => {
  if (message.content === '!welcome') {
    sendWelcome(message.member, message.channel);
  }
});

client.login(process.env.TOKEN);
