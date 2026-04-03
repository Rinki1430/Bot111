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

// 🔧 CONFIGURATION
const WELCOME_CHANNEL_ID = "1489323909860950219";
const AUTO_ROLE_ID = "YOUR_ROLE_ID_HERE"; 
const BANNER_URL = "https://cdn.discordapp.com/attachments/1489323909860950219/1489340921496473762/golden-radial-sunburst-background-animation-warm-abstract-sunshine-burst-motion-graphic-free-video.jpg?ex=69d01052&is=69cebed2&hm=0f9b49211ae735968fb000ee559b035a13515703b98159a97b1a82812ff1a484&";

// 🎨 CANVAS FUNCTION WITH GLOW EFFECT
async function createWelcomeImage(member) {
  const canvas = createCanvas(1024, 500);
  const ctx = canvas.getContext('2d');

  // 1. Background
  const background = await loadImage(BANNER_URL);
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // Dark Overlay for better text visibility
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. User Avatar with Glow
  const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 512 }));
  
  ctx.save();
  ctx.shadowBlur = 30;
  ctx.shadowColor = '#FFD700'; // Golden Glow
  ctx.beginPath();
  ctx.arc(512, 140, 90, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#D4AF37';
  ctx.stroke();
  ctx.clip();
  ctx.drawImage(avatar, 422, 50, 180, 180);
  ctx.restore();

  // 3. GLOWING TEXT: "WELCOME"
  ctx.textAlign = "center";
  ctx.shadowBlur = 15;
  ctx.shadowColor = "#FFD700";
  ctx.font = 'bold 60px sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText("WELCOME", 512, 290);

  // 4. GLOWING TEXT: "TO SERVER NAME" (Requested)
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#FFD700";
  ctx.font = 'bold 45px sans-serif';
  const serverName = member.guild.name.toUpperCase();
  
  // Golden Gradient for Server Name
  const grad = ctx.createLinearGradient(0, 310, 0, 360);
  grad.addColorStop(0, '#FFF5CC');
  grad.addColorStop(1, '#FFD700');
  ctx.fillStyle = grad;
  ctx.fillText(`TO ${serverName}`, 512, 350);

  // 5. USERNAME WITH GLOW
  ctx.shadowBlur = 10;
  ctx.shadowColor = "rgba(255, 215, 0, 0.8)";
  ctx.font = 'bold 80px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(member.user.username.toUpperCase(), 512, 435);

  // Reset shadow for small text
  ctx.shadowBlur = 0;
  ctx.font = '30px sans-serif';
  ctx.fillStyle = '#FFD700';
  ctx.fillText(`MEMBER #${member.guild.memberCount}`, 512, 480);

  // Border
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

  return canvas.toBuffer();
}

// 🎯 SEND FUNCTION
async function sendWelcome(member, channel) {
  try {
    const buffer = await createWelcomeImage(member);
    const attachment = new AttachmentBuilder(buffer, { name: 'welcome-royal.png' });

    // ANSI Color Code Hack for Embed Header (Gold-ish effect)
    const header = "```ansi\n\u001b[1;33m💢============================💢\n     WELCOME TO " + member.guild.name.toUpperCase() + "\n💢============================💢\u001b[0m\n```";
    
    const footer = "```ansi\n\u001b[1;33m💢========================💢\n      WELCOME BACK FAMILY\n💢========================💢\u001b[0m\n```";

    const embed = new EmbedBuilder()
      .setColor("#FFD700")
      .setDescription(`${header}\n👑 Hey <@${member.id}>! You have just joined the most elite family. Enjoy your stay!\n\n${footer}`)
      .setImage("attachment://welcome-royal.png")
      .setTimestamp();

    await channel.send({ 
      content: `Hello <@${member.id}>! Welcome to **${member.guild.name}**!`, 
      embeds: [embed], 
      files: [attachment] 
    });
  } catch (err) {
    console.error("Error:", err);
  }
}

// MEMBER JOIN EVENT
client.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!channel) return;

  try {
    const role = member.guild.roles.cache.get(AUTO_ROLE_ID);
    if (role) await member.roles.add(role);
  } catch (err) { console.log("Role Error:", err.message); }

  sendWelcome(member, channel);
});

// TEST COMMAND
client.on('messageCreate', async message => {
  if (message.content === '!welcome') {
    if (!message.member.permissions.has('Administrator')) return;
    sendWelcome(message.member, message.channel);
  }
});

client.on('ready', () => {
  console.log(`✅ Royal Bot Online: ${client.user.tag}`);
});

client.login(process.env.TOKEN);
