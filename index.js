const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.on('ready', () => {
  console.log(`✅ Bot Online: ${client.user.tag}`);
});

// ✅ Tumhara Channel ID already add kar diya
const WELCOME_CHANNEL_ID = "1489323909860950219";

client.on('guildMemberAdd', member => {

  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor("#00ffcc")
    .setTitle("✨ Welcome to DARK EAGLE 🦅 ✨")
    .setDescription(`👋 Hey <@${member.id}>\n\n🔥 Welcome to **${member.guild.name}**!\n💎 Tum ab hamare elite squad ka part ho!\n\n📜 Rules check karo aur enjoy karo!`)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setImage("https://i.imgur.com/4M34hi2.png")
    .setFooter({ text: `Member #${member.guild.memberCount}` })
    .setTimestamp();

  channel.send({ embeds: [embed] });
});

client.login(process.env.TOKEN);
