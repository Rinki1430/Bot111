const { Client, GatewayIntentBits, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const express = require('express');
const { createCanvas, loadImage } = require('canvas');

const app = express();
app.get('/', (req, res) => res.send('Bot is Running 🦅'));
app.listen(process.env.PORT || 3000);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const WELCOME_CHANNEL_ID = "1489323909860950219";
const AUTO_ROLE_ID = "YOUR_ROLE_ID_HERE"; 
const BANNER_URL = "https://cdn.discordapp.com/attachments/1489323909860950219/1489340921496473762/golden-radial-sunburst-background-animation-warm-abstract-sunshine-burst-motion-graphic-free-video.jpg?ex=69d01052&is=69cebed2&hm=0f9b49211ae735968fb000ee559b035a13515703b98159a97b1a82812ff1a484&";

async function createWelcomeImage(member) {
  const canvas = createCanvas(1024, 500);
  const ctx = canvas.getContext('2d');

  const background = await loadImage(BANNER_URL);
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // Avatar with Gold Border
  const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 512 }));
  ctx.save();
  ctx.beginPath();
  ctx.arc(512, 160, 100, 0, Math.PI * 2, true);
  ctx.lineWidth = 12;
  ctx.strokeStyle = '#D4AF37';
  ctx.stroke();
  ctx.clip();
  ctx.drawImage(avatar, 412, 60, 200, 200);
  ctx.restore();

  // Welcome Text
  ctx.textAlign = "center";
  const goldGradient = ctx.createLinearGradient(0, 300, 0, 350);
  goldGradient.addColorStop(0, '#D4AF37');
  goldGradient.addColorStop(1, '#8B4513');

  ctx.font = 'bold 70px sans-serif';
  ctx.fillStyle = goldGradient;
  ctx.fillText("WELCOME", 512, 340);

  // Username
  ctx.font = 'bold 85px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(member.user.username.toUpperCase(), 512, 420);

  // Member Count (Adjusted Position to avoid overlap)
  ctx.font = '30px sans-serif';
  ctx.fillStyle = '#FFD700';
  ctx.fillText(`MEMBER #${member.guild.memberCount}`, 512, 470);

  return canvas.toBuffer();
}

async function sendWelcome(member, channel) {
  try {
    const buffer = await createWelcomeImage(member);
    const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });

    // 🎨 ROYAL ANSI COLOR FORMATTING
    // \u001b[1;33m = Bold Yellow/Gold
    const serverName = member.guild.name.toUpperCase();
    const royalHeader = "```ansi\n" + `\u001b[1;33m💢====================================💢\n      WELCOME TO ${serverName}\n💢====================================💢` + "\n```";
    const royalFooter = "```ansi\n" + `\u001b[1;33m💢====================================💢\n           WELCOME BACK FAMILY\n💢====================================💢` + "\n```";

    const embed = new EmbedBuilder()
      .setColor("#D4AF37")
      .setDescription(`${royalHeader}\n👑 **Hey <@${member.id}>! Welcome to the DARK EAGLE family.**\n${royalFooter}`)
      .setImage("attachment://welcome.png");

    // "content" hata diya gaya hai taaki extra line na aaye
    await channel.send({ 
      embeds: [embed], 
      files: [attachment] 
    });
  } catch (err) {
    console.error("Error:", err);
  }
}

client.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!channel) return;
  
  try {
    const role = member.guild.roles.cache.get(AUTO_ROLE_ID);
    if (role) await member.roles.add(role);
  } catch (e) {}

  sendWelcome(member, channel);
});

client.on('messageCreate', message => {
  if (message.content === '!welcome') {
    sendWelcome(message.member, message.channel);
  }
});

client.on('ready', () => console.log(`🦅 Bot Ready: ${client.user.tag}`));
client.login(process.env.TOKEN);
