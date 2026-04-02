const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

const WELCOME_CHANNEL_ID = "1489323909860950219";

client.on('ready', () => {
  console.log(`✅ Bot Ready: ${client.user.tag}`);
});

client.on('guildMemberAdd', async (member) => {

  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!channel) return;

  // 🎨 Canvas setup
  const canvas = Canvas.createCanvas(1024, 500);
  const ctx = canvas.getContext('2d');

  // 🖼️ Background load (golden)
  const background = await Canvas.loadImage('https://i.imgur.com/6Iej2c3.png'); // change if needed
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // 👤 Avatar load
  const avatar = await Canvas.loadImage(
    member.user.displayAvatarURL({ extension: 'png', size: 256 })
  );

  // 👑 Avatar box (left side)
  ctx.drawImage(avatar, 50, 150, 200, 200);

  // ✨ Text Style
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 50px Sans';
  ctx.fillText('WELCOME', 300, 200);

  ctx.fillStyle = '#ff00cc';
  ctx.font = 'bold 40px Sans';
  ctx.fillText(member.user.username, 300, 260);

  ctx.fillStyle = '#00ffcc';
  ctx.font = 'bold 30px Sans';
  ctx.fillText(`TO ${member.guild.name}`, 300, 320);

  // 📦 Convert to attachment
  const attachment = new AttachmentBuilder(canvas.toBuffer(), {
    name: 'welcome.png'
  });

  // 🚀 Send
  channel.send({
    content: `👑 Welcome <@${member.id}>`,
    files: [attachment]
  });

});

client.login(process.env.TOKEN);
