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
    GatewayIntentBits.MessageContent // 👈 Ye zaroori hai
  ]
});

const WELCOME_CHANNEL_ID = "1489323909860950219";
const AUTO_ROLE_ID = "YOUR_ROLE_ID_HERE"; 
const BANNER_URL = "https://cdn.discordapp.com/attachments/1489323909860950219/1489340921496473762/golden-radial-sunburst-background-animation-warm-abstract-sunshine-burst-motion-graphic-free-video.jpg?ex=69d01052&is=69cebed2&hm=0f9b49211ae735968fb000ee559b035a13515703b98159a97b1a82812ff1a484&";

async function createWelcomeImage(member) {
  const canvas = createCanvas(1024, 500);
  const ctx = canvas.getContext('2d');

  try {
    const background = await loadImage(BANNER_URL);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Avatar with Glow
    const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 512 }));
    ctx.save();
    ctx.shadowBlur = 40;
    ctx.shadowColor = '#FFD700';
    ctx.beginPath();
    ctx.arc(512, 150, 100, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#D4AF37';
    ctx.stroke();
    ctx.clip();
    ctx.drawImage(avatar, 412, 50, 200, 200);
    ctx.restore();

    // Glowing Text: WELCOME TO [SERVER]
    ctx.textAlign = "center";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#FFD700";
    ctx.font = 'bold 50px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText("WELCOME TO", 512, 320);

    ctx.font = 'bold 60px sans-serif';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(member.guild.name.toUpperCase(), 512, 385);

    // Username
    ctx.font = 'bold 80px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 0; // Reset for username
    ctx.fillText(member.user.username.toUpperCase(), 512, 460);

    return canvas.toBuffer();
  } catch (e) {
    console.error("Image Error:", e);
  }
}

async function sendWelcome(member, channel) {
  const buffer = await createWelcomeImage(member);
  if (!buffer) return;
  const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });

  const embed = new EmbedBuilder()
    .setColor("#FFD700")
    .setDescription(`💢============================💢\n**WELCOME TO ${member.guild.name.toUpperCase()}**\n💢============================💢\n\n👑 Hey <@${member.id}>! Enjoy your stay!\n\n💢========================💢\n**WELCOME BACK FAMILY**\n💢========================💢`)
    .setImage("attachment://welcome.png")
    .setTimestamp();

  await channel.send({ content: `Hello <@${member.id}>!`, embeds: [embed], files: [attachment] });
}

client.on('messageCreate', async message => {
  // Debugging: Ye Render ke logs mein dikhayega ki bot ne message dekha ya nahi
  console.log(`Log: Message received - ${message.content}`);

  if (message.author.bot) return;

  if (message.content === '!welcome') {
    console.log("Command detected!");
    sendWelcome(message.member, message.channel);
  }
});

client.on('guildMemberAdd', member => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (channel) sendWelcome(member, channel);
});

client.on('ready', () => {
  console.log(`✅ Royal Bot Online: ${client.user.tag}`);
});

client.login(process.env.TOKEN);
