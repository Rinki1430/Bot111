const { Client, GatewayIntentBits, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const express = require('express');
const { createCanvas, loadImage } = require('canvas');
const translate = require('@iamtraction/google-translate'); // 👈 Naya Free Translator API

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
const GOODBYE_CHANNEL_ID = "1489686354420830248"; 
const AUTO_ROLE_ID = "YOUR_ROLE_ID_HERE"; 
const TRANSLATOR_CHANNEL_ID = "YOUR_CHAT_CHANNEL_ID"; // 👇 Yahan us channel ka ID dalein jisme translation karni hai
const BANNER_URL = "https://i.ibb.co/4Z6fPdT2/777777.jpg";

// 🌍 USER TRANSLATION DATABASE (Memory mein save hoga)
const userLanguages = new Map(); // Format: userId -> langCode

// ==========================================
// 🎨 1. ADVANCED ROYAL CANVAS FOR WELCOME
// ==========================================
async function createWelcomeImage(member) {
  const canvas = createCanvas(1024, 500);
  const ctx = canvas.getContext('2d');

  const background = await loadImage(BANNER_URL);
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  const vignette = ctx.createRadialGradient(512, 250, 100, 512, 250, 600);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 512 }));
  
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 20;
  
  ctx.save();
  ctx.beginPath();
  ctx.arc(512, 160, 100, 0, Math.PI * 2, true); 
  ctx.closePath();
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#D4AF37'; 
  ctx.stroke();
  ctx.clip();
  ctx.drawImage(avatar, 412, 60, 200, 200);
  ctx.restore();

  ctx.shadowBlur = 5;
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.textAlign = "center";

  const blueGoldGradient = ctx.createLinearGradient(0, 300, 0, 350);
  blueGoldGradient.addColorStop(0, '#1E90FF'); 
  blueGoldGradient.addColorStop(0.5, '#FFD700'); 
  blueGoldGradient.addColorStop(1, '#FFD700'); 

  ctx.font = 'bold 70px sans-serif';
  ctx.fillStyle = blueGoldGradient;
  ctx.fillText("WELCOME", 512, 340);

  ctx.font = 'bold 45px sans-serif'; 
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#000000';
  ctx.strokeText(member.user.username.toUpperCase(), 512, 430);
  ctx.fillText(member.user.username.toUpperCase(), 512, 430);

  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 15;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  return canvas.toBuffer();
}

// ==========================================
// 🎨 2. ADVANCED ROYAL CANVAS FOR GOODBYE
// ==========================================
async function createGoodbyeImage(member) {
  const canvas = createCanvas(1024, 500);
  const ctx = canvas.getContext('2d');

  const background = await loadImage(BANNER_URL);
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  const vignette = ctx.createRadialGradient(512, 250, 100, 512, 250, 600);
  vignette.addColorStop(0, 'rgba(0,0,0,0.2)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.7)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 512 }));
  
  ctx.shadowColor = '#FF4500'; 
  ctx.shadowBlur = 20;
  
  ctx.save();
  ctx.beginPath();
  ctx.arc(512, 160, 100, 0, Math.PI * 2, true); 
  ctx.closePath();
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#C0C0C0'; 
  ctx.stroke();
  ctx.clip();
  ctx.drawImage(avatar, 412, 60, 200, 200);
  ctx.restore();

  ctx.shadowBlur = 5;
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.textAlign = "center";

  const redSilverGradient = ctx.createLinearGradient(0, 300, 0, 350);
  redSilverGradient.addColorStop(0, '#FF4500'); 
  redSilverGradient.addColorStop(0.5, '#C0C0C0'); 
  redSilverGradient.addColorStop(1, '#FF4500'); 

  ctx.font = 'bold 70px sans-serif';
  ctx.fillStyle = redSilverGradient;
  ctx.fillText("GOODBYE", 512, 340);

  ctx.font = 'bold 45px sans-serif'; 
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#000000';
  ctx.strokeText(member.user.username.toUpperCase(), 512, 430);
  ctx.fillText(member.user.username.toUpperCase(), 512, 430);

  ctx.strokeStyle = '#C0C0C0';
  ctx.lineWidth = 15;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  return canvas.toBuffer();
}

async function sendWelcome(member, channel) {
  try {
    const buffer = await createWelcomeImage(member);
    const attachment = new AttachmentBuilder(buffer, { name: 'welcome-royal.png' });

    const header = `💢============================💢\n     **WELCOME TO ${member.guild.name.toUpperCase()}** \n💢============================💢`;
    const footer = `💢========================💢\n      **WELCOME BACK FAMILY** \n💢========================💢`;

    const embed = new EmbedBuilder()
      .setColor("#FFD700") 
      .setDescription(`${header}\n\n👑 Hey <@${member.id}>! You have just joined the most elite family. Enjoy your stay!\n\n${footer}`)
      .setImage("attachment://welcome-royal.png")
      .setTimestamp();

    await channel.send({ content: `Hello <@${member.id}>!`, embeds: [embed], files: [attachment] });
  } catch (err) { console.error(err); }
}

async function sendGoodbye(member, channel) {
  try {
    const buffer = await createGoodbyeImage(member);
    const attachment = new AttachmentBuilder(buffer, { name: 'goodbye-royal.png' });

    const header = `💢============================💢\n     **FAREWELL FROM ${member.guild.name.toUpperCase()}** \n💢============================💢`;
    const footer = `💢========================💢\n      **WE WILL MISS YOU** \n💢========================💢`;

    const embed = new EmbedBuilder()
      .setColor("#FF0000") 
      .setDescription(`${header}\n\n🥀 <@${member.id}> (**${member.user.username}**) has left the server.\n\n${footer}`)
      .setImage("attachment://goodbye-royal.png")
      .setTimestamp();

    await channel.send({ content: `Goodbye **${member.user.username}**!`, embeds: [embed], files: [attachment] });
  } catch (err) { console.error(err); }
}

// ==========================================
// 👇 EVENTS & COMMANDS
// ==========================================

client.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!channel) return;
  try {
    const role = member.guild.roles.cache.get(AUTO_ROLE_ID);
    if (role) await member.roles.add(role);
  } catch (err) { console.log(err.message); }
  sendWelcome(member, channel);
});

client.on('guildMemberRemove', async member => {
  const channel = member.guild.channels.cache.get(GOODBYE_CHANNEL_ID);
  if (!channel) return;
  sendGoodbye(member, channel);
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // Test Commands
  if (message.content === '!welcome') {
    if (!message.member.permissions.has('Administrator')) return;
    sendWelcome(message.member, message.channel);
  }
  if (message.content === '!goodbye') {
    if (!message.member.permissions.has('Administrator')) return;
    sendGoodbye(message.member, message.channel);
  }

  // ==========================================
  // 🌐 TRANSLATOR COMMAND: !setlang <lang_code>
  // ==========================================
  if (message.content.startsWith('!setlang')) {
    const args = message.content.split(' ');
    const langCode = args[1];

    if (!langCode) {
      return message.reply("❌ Please provide a language code!\n*Example:* `!setlang hi` (Hindi), `!setlang es` (Spanish), `!setlang fr` (French)");
    }

    userLanguages.set(message.author.id, langCode.toLowerCase());
    return message.reply(`✅ Aapki custom language ab **${langCode.toUpperCase()}** set ho gayi hai!`);
  }

  // ==========================================
  // 🤖 AUTO TRANSLATOR LOGIC
  // ==========================================
  if (!message.content.startsWith('!') && message.content.length > 0) {
    // Agar specific channel mein chalana hai to isko uncomment karein:
    // if (message.channel.id !== TRANSLATOR_CHANNEL_ID) return;

    try {
      // 1. Pehle message ko Default English mein translate karein
      let engTrans = await translate(message.content, { to: 'en' });
      let detectedLang = engTrans.from.language.iso; // Original message ki language

      // Konsi languages mein translate karna hai? (Default English)
      let targetLangs = new Set(['en']); 
      
      // Agar server mein kisi ne apni custom language set ki hai, usko bhi add karo
      userLanguages.forEach(lang => targetLangs.add(lang));

      // Original message ki language ko hata do (taki Hindi se Hindi translate na ho)
      targetLangs.delete(detectedLang);

      // Agar convert karne ke liye kuch nahi bacha to return
      if (targetLangs.size === 0) return; 

      // 2. Translation ka Embed banayein
      let desc = "";

      for (let lang of targetLangs) {
        if (lang === 'en') {
          desc += `**🇬🇧 English:** ${engTrans.text}\n\n`;
        } else {
          // Custom language users ke liye extra translation
          let customTrans = await translate(message.content, { to: lang });
          desc += `**🌐 ${lang.toUpperCase()}:** ${customTrans.text}\n\n`;
        }
      }

      const embed = new EmbedBuilder()
        .setColor("#00FFFF")
        .setAuthor({ name: `Translation for ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
        .setDescription(desc);

      // Reply the translated message
      await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });

    } catch (err) {
      console.log("Translation Error: ", err.message);
    }
  }
});

client.on('ready', () => {
  console.log(`✅ Royal Bot & Translator Online: ${client.user.tag}`);
});

client.login(process.env.TOKEN);
