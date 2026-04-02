const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} = require('discord.js');

const express = require('express');

const app = express();
app.get('/', (req, res) => {
  res.send('Bot is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
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
  console.log(`✅ Bot Online: ${client.user.tag}`);
});

const WELCOME_CHANNEL_ID = "1489323909860950219";

async function sendWelcome(member, channel) {

  // 👇 Typing animation feel
  channel.sendTyping();

  const embed = new EmbedBuilder()
    .setColor("#2b2d31")
    .setTitle("👑 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗧𝗢 𝗗𝗔𝗥𝗞 𝗘𝗔𝗚𝗟𝗘 🦅")
    .setDescription(
`✨ **Hello <@${member.id}>!**

💠 Welcome to **${member.guild.name}**

🔥 You are now part of something **LEGENDARY**

📜 Read rules & enjoy your stay!

━━━━━━━━━━━━━━━━━━━━━━
💎 Stay Active | Respect All | Have Fun
━━━━━━━━━━━━━━━━━━━━━━`
    )
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
    .setImage("https://i.imgur.com/AfFp7pu.png") // banner (change kar sakte ho)
    .setFooter({ text: `👥 Member #${member.guild.memberCount}` })
    .setTimestamp();

  // 👇 Buttons (Premium look)
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("📜 Rules")
      .setStyle(ButtonStyle.Link)
      .setURL("https://discord.com"), // apna link daalo

    new ButtonBuilder()
      .setLabel("🌐 Invite Friends")
      .setStyle(ButtonStyle.Link)
      .setURL("https://discord.com")
  );

  channel.send({
    content: "🎉 **New Member Joined!**",
    embeds: [embed],
    components: [row]
  });
}

// 👇 Join Event
client.on('guildMemberAdd', member => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!channel) return;
  sendWelcome(member, channel);
});

// 👇 Test Command
client.on('messageCreate', message => {
  if (message.content === '!welcome') {
    sendWelcome(message.member, message.channel);
  }
});

client.login(process.env.TOKEN);
