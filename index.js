const { createCanvas, loadImage } = require('canvas');

async function createWelcomeImage(member) {
  const canvas = createCanvas(900, 300);
  const ctx = canvas.getContext('2d');

  // 🌌 Background (dark premium)
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#0a0f1f");
  gradient.addColorStop(1, "#111827");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // ✨ Glow effect
  ctx.shadowColor = "#FFD700";
  ctx.shadowBlur = 25;

  // 🟡 TOP TEXT → WELCOME TO SERVER NAME
  ctx.fillStyle = "#FFD700";
  ctx.font = "bold 30px Sans";
  ctx.fillText(`WELCOME TO ${member.guild.name.toUpperCase()}`, 220, 50);

  // 🔥 BIG WELCOME TEXT (fake animation glow)
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 35;
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 60px Sans";
  ctx.fillText("WELCOME", 300, 140);

  // 👤 USERNAME (ROYAL BLUE)
  ctx.shadowBlur = 10;
  ctx.fillStyle = "#3b82f6"; // royal blue
  ctx.font = "bold 32px Sans";
  ctx.fillText(member.user.username, 320, 190);

  // 👑 BOTTOM TEXT
  ctx.fillStyle = "#FFD700";
  ctx.font = "bold 28px Sans";
  ctx.fillText("WELCOME BACK FAMILY", 260, 250);

  // 🖼️ Avatar load
  const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png' }));

  // 🔵 Animated style border (glow ring)
  const x = 60;
  const y = 75;
  const size = 150;

  ctx.beginPath();
  ctx.arc(x + size/2, y + size/2, size/2 + 8, 0, Math.PI * 2);
  ctx.strokeStyle = "#00ffff";
  ctx.lineWidth = 6;
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 20;
  ctx.stroke();

  // Avatar circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(avatar, x, y, size, size);
  ctx.restore();

  return canvas.toBuffer();
}
