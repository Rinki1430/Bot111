const { createCanvas, loadImage } = require('@napi-rs/canvas');

const BACKGROUND_TEMPLATES = {
    'UNRANKED': 'https://i.ibb.co/svGCGJDD/Silver.jpg',
    'SILVER':   'https://i.ibb.co/svGCGJDD/Silver.jpg',
    'GOLD':     'https://i.ibb.co/wZzbdbfV/Gold.jpg',
    'DIAMOND':  'https://i.ibb.co/TMKrDBDz/Diamond.jpg',
    'KING':     'https://i.ibb.co/9HdTgqNM/King.jpg',
    'GRAND':    'https://i.ibb.co/SDTxmX3c/Grand.jpg'
};

const BANNER_URL = "https://i.ibb.co/4Z6fPdT2/777777.jpg";

// --- RANK CARD GENERATOR ---
async function generateRankCard(user, rankName, level) {
    const canvas = createCanvas(1000, 250);
    const ctx = canvas.getContext('2d');

    const bgUrl = BACKGROUND_TEMPLATES[rankName] || BACKGROUND_TEMPLATES['UNRANKED'];
    try {
        const background = await loadImage(bgUrl);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    } catch (e) {
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const bannerGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bannerGradient.addColorStop(0, '#FFD700'); 
    bannerGradient.addColorStop(0.5, '#FF0000'); 
    bannerGradient.addColorStop(1, '#FFD700'); 

    ctx.lineWidth = 12; 
    ctx.strokeStyle = bannerGradient;
    ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

    const avatarSize = 140; 
    const avatarX = 80;     
    const avatarY = 55;     
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    
    const avatarUrl = user.displayAvatarURL({ extension: 'png', size: 256 });
    const avatar = await loadImage(avatarUrl);
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore(); 

    const avatarGradient = ctx.createLinearGradient(avatarX, avatarY, avatarX + avatarSize, avatarY + avatarSize);
    avatarGradient.addColorStop(0, '#FF0000'); 
    avatarGradient.addColorStop(1, '#FFD700'); 

    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.lineWidth = 8; 
    ctx.strokeStyle = avatarGradient;
    ctx.stroke();

    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#ffffff'; 
    ctx.textAlign = 'center';
    
    const textX = avatarX + (avatarSize / 2);
    const textY = avatarY + avatarSize + 30; 
    
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 10;
    ctx.fillText(user.username, textX, textY);
    ctx.shadowBlur = 0; 

    return canvas.toBuffer('image/png');
}

// --- WELCOME CARD GENERATOR ---
async function createWelcomeImage(member) {
  const canvas = createCanvas(1024, 500);
  const ctx = canvas.getContext('2d');

  try {
      const background = await loadImage(BANNER_URL);
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  } catch(e) {
      ctx.fillStyle = '#111';
      ctx.fillRect(0,0, canvas.width, canvas.height);
  }

  const vignette = ctx.createRadialGradient(512, 250, 100, 512, 250, 600);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 512 });
  const avatar = await loadImage(avatarUrl);
  
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

  return canvas.toBuffer('image/png');
}

// --- GOODBYE CARD GENERATOR ---
async function createGoodbyeImage(member) {
  const canvas = createCanvas(1024, 500);
  const ctx = canvas.getContext('2d');

  try {
      const background = await loadImage(BANNER_URL);
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  } catch(e) {
      ctx.fillStyle = '#111';
      ctx.fillRect(0,0, canvas.width, canvas.height);
  }

  const vignette = ctx.createRadialGradient(512, 250, 100, 512, 250, 600);
  vignette.addColorStop(0, 'rgba(0,0,0,0.2)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.7)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 512 });
  const avatar = await loadImage(avatarUrl);
  
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

  return canvas.toBuffer('image/png');
}

module.exports = { generateRankCard, createWelcomeImage, createGoodbyeImage };
