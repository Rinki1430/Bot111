const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const express = require('express');
const Canvas = require('canvas');

const app = express();
app.get('/', (req, res) => res.send('Bot is running!'));
app.listen(process.env.PORT || 3000);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ]
});

const WELCOME_CHANNEL_ID = "1489323909860950219";

client.on('ready', () => {
  console.log(`✅ Bot Online: ${client.user.tag}`);
});

// 🎨 PREMIUM WELCOME CARD FUNCTION
async function createWelcomeImage(member) {

  const canvas = Canvas.createCanvas(1024, 500);
  const ctx = canvas.getContext('2d');

  // 🌟 Background image
  const background = await Canvas.loadImage(
    'https://cdn.discordapp.com/attachments/1489323909860950219/1489340921496473762/golden-radial-sunburst-background-animation-warm-abstract-sunshine-burst-motion-graphic-free-video.jpg'
  );
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // 🔲 Glow box for avatar
  ctx.strokeStyle = "#FFD700";
  ctx.lineWidth = 6;
  ctx.strokeRect(50, 100, 250, 250);

  // 👤 Avatar
  const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ extension: 'png' }));
  ctx.drawImage(avatar, 50, 100, 250, 250);

  // 🌈 Gradient text (WELCOME TO SERVERNAME)
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, "#ff00cc");
  gradient.addColorStop(1, "#00ffff");

  ctx.font = "bold 50px Sans";
  ctx.fillStyle = gradient;
  ctx.fillText(`WELCOME TO`, 350, 120);

  ctx.font = "bold 60px Sans";
  ctx.fillText(member.guild.name.toUpperCase(), 350, 180);

  // 👤 Username
  ctx.font = "bold 55px Sans";
  ctx.fillStyle = "#ff3399";
  ctx.fillText(member.user.username, 350, 280);

  // ✨ Footer text
  ctx.font = "bold 45px Sans";
  ctx.fillStyle = "#ff00cc";
  ctx.fillText("WELCOME BACK FAMILY", 200, 450);

  return new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome.png' });
}

// 🎯 JOIN EVENT
client.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!channel) return;

  const attachment = await createWelcomeImage(member);

  channel.send({
    content: `👋 Welcome <@${member.id}>`,
    files: [attachment]
  });
});

// 🧪 TEST COMMAND
client.on('messageCreate', async message => {
  if (message.content === '!welcome') {
    const attachment = await createWelcomeImage(message.member);

    message.channel.send({
      content: `👋 Welcome <@${message.member.id}>`,
      files: [attachment]
    });
  }
});

client.login(process.env.TOKEN);
