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
const AUTO_ROLE_ID = "YOUR_ROLE_ID_HERE"; // Yahan Role ID daalein
const BANNER_URL = "https://cdn.discordapp.com/attachments/1489323909860950219/1489340921496473762/golden-radial-sunburst-background-animation-warm-abstract-sunshine-burst-motion-graphic-free-video.jpg?ex=69d01052&is=69cebed2&hm=0f9b49211ae735968fb000ee559b035a13515703b98159a97b1a82812ff1a484&";

// 🎨 ADVANCED ROYAL CANVAS FUNCTION
async function createWelcomeImage(member) {
  const canvas = createCanvas(1024, 500);
  const ctx = canvas.getContext('2d');

  // 1. Background Image Load karein
  const background = await loadImage(BANNER_URL);
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // 2. Add a Subtle Vignette (Sides thoda dark taki focus center mein rahe)
  const vignette = ctx.createRadialGradient(512, 250, 100, 512, 250, 600);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 3. User Avatar with Golden Glow & Border
  const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 512 }));
  
  // Avatar Glow
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 20;
  
  ctx.save();
  ctx.beginPath();
  ctx.arc(512, 160, 100, 0, Math.PI * 2, true); // Avatar circle
  ctx.closePath();
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#D4AF37'; // Golden Border
  ctx.stroke();
  ctx.clip();
  ctx.drawImage(avatar, 412, 60, 200, 200);
  ctx.restore();

  // Reset Shadow for Text
  ctx.shadowBlur = 5;
  ctx.shadowColor = 'rgba(0,0,0,0.5)';

  // 4. Text Styling
  ctx.textAlign = "center";

  // Create Golden Gradient for "WELCOME"
  const goldGradient = ctx.createLinearGradient(0, 300, 0, 350);
  goldGradient.addColorStop(0, '#8B4513'); // Dark Gold/Bronze
  goldGradient.addColorStop(0.5, '#FFD700'); // Shiny Gold
  goldGradient.addColorStop(1, '#8B4513');

  // "WELCOME" Text
  ctx.font = 'bold 70px sans-serif';
  ctx.fillStyle = goldGradient;
  ctx.fillText("WELCOME", 512, 340);

  // Username Text (With White & Gold Stroke)
  ctx.font = 'bold 90px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#000000';
  ctx.strokeText(member.user.username.toUpperCase(), 512, 420);
  ctx.fillText(member.user.username.toUpperCase(), 512, 420);

  // Member Count Text
  ctx.font = '35px sans-serif';
  ctx.fillStyle = '#FFD700';
  ctx.fillText(`MEMBER #${member.guild.memberCount}`, 512, 470);

  // Final Golden Frame
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 15;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  return canvas.toBuffer();
}

// 🎯 SEND FUNCTION WITH REQUESTED FORMAT
async function sendWelcome(member, channel) {
  try {
    const buffer = await createWelcomeImage(member);
    const attachment = new AttachmentBuilder(buffer, { name: 'welcome-royal.png' });

    // Formatting as per your request
    const header = `💢============================💢\n     **WELCOME TO ${member.guild.name.toUpperCase()}** \n💢============================💢`;
    const footer = `💢========================💢\n      **WELCOME BACK FAMILY** \n💢========================💢`;

    const embed = new EmbedBuilder()
      .setColor("#FFD700") // Gold Color
      .setDescription(`${header}\n\n👑 Hey <@${member.id}>! You have just joined the most elite family. Enjoy your stay!\n\n${footer}`)
      .setImage("attachment://welcome-royal.png")
      .setTimestamp();

    await channel.send({ 
      content: `Welcome <@${member.id}> **${member.guild.name}**!`, 
      embeds: [embed], 
      files: [attachment] 
    });
  } catch (err) {
    console.error("Error creating welcome image:", err);
  }
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
    console.log("Role assignment error:", err.message);
  }

  sendWelcome(member, channel);
});

// 👇 TEST COMMAND (!welcome)
client.on('messageCreate', async message => {
  if (message.content === '!welcome') {
    // Permission check (Optional)
    if (!message.member.permissions.has('Administrator')) return;
    sendWelcome(message.member, message.channel);
  }
});

client.on('ready', () => {
  console.log(`✅ Royal Bot Online: ${client.user.tag}`);
});

client.login(process.env.TOKEN);
