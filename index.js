const { Client, GatewayIntentBits, Partials, EmbedBuilder, AttachmentBuilder, REST, Routes, SlashCommandBuilder } = require('discord.js');
const express = require('express');
const translate = require('@iamtraction/google-translate');
const db = require('./database');
const { generateRankCard, createWelcomeImage, createGoodbyeImage } = require('./canvasUtils');

// Render Server
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Ultimate Bot is Online! 🦅'));
app.listen(port, () => console.log(`Server is running on port ${port}`));

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// ==========================================
// CONFIGURATION
// ==========================================
const COOLDOWN_MS = 60000; 
const ACHIEVEMENT_CHANNEL_ID = '1489692155101577248';
const WELCOME_CHANNEL_ID = '1489323909860950219';
const GOODBYE_CHANNEL_ID = '1489686354420830248';
const AUTO_ROLE_ID = process.env.AUTO_ROLE_ID; // Apne env me daalein ya direct string daalein

const RANKS = [
    { name: 'GRAND', level: 50, roleId: process.env.ROLE_GRAND },
    { name: 'KING', level: 30, roleId: process.env.ROLE_KING },
    { name: 'DIAMOND', level: 20, roleId: process.env.ROLE_DIAMOND },
    { name: 'GOLD', level: 10, roleId: process.env.ROLE_GOLD },
    { name: 'SILVER', level: 5, roleId: process.env.ROLE_SILVER },
];

const getXpRequired = (level) => Math.floor(100 * Math.pow(level, 1.5));
const userLanguages = new Map(); // Translator memory

// Slash Commands
const commands = [
    new SlashCommandBuilder().setName('rank').setDescription('Check your rank').addUserOption(opt => opt.setName('user').setDescription('User to check')),
    new SlashCommandBuilder().setName('leaderboard').setDescription('View top users'),
    new SlashCommandBuilder().setName('daily').setDescription('Daily XP reward')
].map(c => c.toJSON());

client.once('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
    try {
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
        console.log('✅ Commands registered.');
    } catch (error) { console.error(error); }
});

// ==========================================
// WELCOME & GOODBYE EVENTS
// ==========================================
client.on('guildMemberAdd', async member => {
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;
    
    try {
        if (AUTO_ROLE_ID) {
            const role = member.guild.roles.cache.get(AUTO_ROLE_ID);
            if (role) await member.roles.add(role);
        }
    } catch (err) { console.log(err.message); }

    try {
        const buffer = await createWelcomeImage(member);
        const attachment = new AttachmentBuilder(buffer, { name: 'welcome-royal.png' });

        const embed = new EmbedBuilder()
            .setColor("#FFD700") 
            .setDescription(`💢============================💢\n     **WELCOME TO ${member.guild.name.toUpperCase()}** \n💢============================💢\n\n👑 Hey <@${member.id}>! You have just joined the most elite family. Enjoy your stay!\n\n💢========================💢\n      **WELCOME BACK FAMILY** \n💢========================💢`)
            .setImage("attachment://welcome-royal.png")
            .setTimestamp();

        await channel.send({ content: `Hello <@${member.id}>!`, embeds: [embed], files: [attachment] });
    } catch (err) { console.error(err); }
});

client.on('guildMemberRemove', async member => {
    const channel = member.guild.channels.cache.get(GOODBYE_CHANNEL_ID);
    if (!channel) return;
    
    try {
        const buffer = await createGoodbyeImage(member);
        const attachment = new AttachmentBuilder(buffer, { name: 'goodbye-royal.png' });

        const embed = new EmbedBuilder()
            .setColor("#FF0000") 
            .setDescription(`💢============================💢\n     **FAREWELL FROM ${member.guild.name.toUpperCase()}** \n💢============================💢\n\n🥀 <@${member.id}> (**${member.user.username}**) has left the server.\n\n💢========================💢\n      **WE WILL MISS YOU** \n💢========================💢`)
            .setImage("attachment://goodbye-royal.png")
            .setTimestamp();

        await channel.send({ content: `Goodbye **${member.user.username}**!`, embeds: [embed], files: [attachment] });
    } catch (err) { console.error(err); }
});

// ==========================================
// MESSAGE EVENTS (XP, Translator, Tests)
// ==========================================
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    // --- PREFIX COMMANDS ---
    if (message.content.startsWith('!')) {
        const args = message.content.split(' ');
        const command = args[0].toLowerCase();

        if (command === '!welcome' && message.member.permissions.has('Administrator')) {
            client.emit('guildMemberAdd', message.member);
            return;
        }
        if (command === '!goodbye' && message.member.permissions.has('Administrator')) {
            client.emit('guildMemberRemove', message.member);
            return;
        }
        if (command === '!setlang') {
            const langCode = args[1];
            if (!langCode) return message.reply("❌ Please provide a language code! Example: `!setlang hi`");
            userLanguages.set(message.author.id, langCode.toLowerCase());
            return message.reply(`✅ Aapki language **${langCode.toUpperCase()}** set ho gayi hai!`);
        }
        return; // Stop processing further for commands
    }

    // --- LEVELING & XP SYSTEM ---
    const userId = message.author.id;
    const userRef = db.ref(`users/${userId}`);
    const snapshot = await userRef.once('value');
    let userData = snapshot.val() || { xp: 0, level: 0, messages: 0, lastMessageTime: 0, achievements: {} };

    const now = Date.now();
    if (now - userData.lastMessageTime >= COOLDOWN_MS) {
        userData.xp += Math.floor(Math.random() * 11) + 5;
        userData.messages += 1;
        userData.lastMessageTime = now;

        const notifyChannel = client.channels.cache.get(ACHIEVEMENT_CHANNEL_ID);

        // Achievements
        if (!userData.achievements) userData.achievements = {};
        if (userData.messages === 1 && !userData.achievements['first_message']) {
            userData.achievements['first_message'] = true;
            if (notifyChannel) notifyChannel.send(`🎉 **${message.author.username}** unlocked: **First Message!**`);
        }
        if (userData.messages === 100 && !userData.achievements['100_messages']) {
            userData.achievements['100_messages'] = true;
            if (notifyChannel) notifyChannel.send(`🎉 **${message.author.username}** unlocked: **Chatterbox (100 Messages)!**`);
        }

        // Level Up Logic
        const requiredXp = getXpRequired(userData.level + 1);
        if (userData.xp >= requiredXp) {
            userData.level += 1;
            
            let newRank = 'UNRANKED', newRoleId = null;
            for (const rank of RANKS) {
                if (userData.level >= rank.level) { newRank = rank.name; newRoleId = rank.roleId; break; }
            }

            if (newRoleId) {
                const member = message.member;
                for (const r of RANKS) {
                    if (r.roleId !== newRoleId && member.roles.cache.has(r.roleId)) {
                        await member.roles.remove(r.roleId).catch(console.error);
                    }
                }
                if (!member.roles.cache.has(newRoleId)) await member.roles.add(newRoleId).catch(console.error);
            }

            const buffer = await generateRankCard(message.author, newRank, userData.level);
            const attachment = new AttachmentBuilder(buffer, { name: 'levelup.png' });
            if (notifyChannel) await notifyChannel.send({ content: `🎉 Congratulations <@${userId}>, `, files: [attachment] });
        }
        await userRef.set(userData);
    }

    // --- AUTO TRANSLATOR SYSTEM ---
    if (message.content.length > 0) {
        try {
            let engTrans = await translate(message.content, { to: 'en' });
            let detectedLang = engTrans.from.language.iso; 

            let targetLangs = new Set(['en']); 
            userLanguages.forEach(lang => targetLangs.add(lang));
            targetLangs.delete(detectedLang);

            if (targetLangs.size === 0) return; 

            let desc = "";
            for (let lang of targetLangs) {
                if (lang === 'en') desc += `**🇬🇧 English:** ${engTrans.text}\n\n`;
                else {
                    let customTrans = await translate(message.content, { to: lang });
                    desc += `**🌐 ${lang.toUpperCase()}:** ${customTrans.text}\n\n`;
                }
            }

            const embed = new EmbedBuilder()
                .setColor("#00FFFF")
                .setAuthor({ name: `Translation for ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
                .setDescription(desc);

            await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        } catch (err) { /* silent error to not spam chat */ }
    }
});

// ==========================================
// SLASH COMMANDS INTERACTION
// ==========================================
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'rank') {
        const target = interaction.options.getUser('user') || interaction.user;
        const data = (await db.ref(`users/${target.id}`).once('value')).val();
        if (!data) return interaction.reply({ content: 'No data yet.', ephemeral: true });

        const embed = new EmbedBuilder().setColor('#00bfff').setAuthor({ name: target.username, iconURL: target.displayAvatarURL() })
            .setDescription(`**Level:** ${data.level}\n**XP:** ${data.xp} / ${getXpRequired(data.level + 1)}\n**Messages:** ${data.messages}`);
        await interaction.reply({ embeds: [embed] });
    }

    if (interaction.commandName === 'daily') {
        const userId = interaction.user.id;
        const userRef = db.ref(`users/${userId}`);
        let data = (await userRef.once('value')).val() || { xp: 0, level: 0, messages: 0 };
        const now = Date.now(), dailyCooldown = 24 * 60 * 60 * 1000;

        if (data.lastDaily && (now - data.lastDaily < dailyCooldown)) {
            const timeLeft = Math.floor((dailyCooldown - (now - data.lastDaily)) / 3600000);
            return interaction.reply({ content: `⏳ Try again in ${timeLeft} hours.`, ephemeral: true });
        }
        data.xp += 100;
        data.lastDaily = now;
        await userRef.set(data);
        interaction.reply(`🎁 You claimed your daily reward of **100 XP**!`);
    }

    if (interaction.commandName === 'leaderboard') {
        const users = (await db.ref('users').once('value')).val();
        if (!users) return interaction.reply('No data available.');
        const sorted = Object.keys(users).map(id => ({ id, xp: users[id].xp, level: users[id].level }))
            .sort((a, b) => b.xp - a.xp).slice(0, 10);

        const embed = new EmbedBuilder().setTitle('🏆 Global Leaderboard').setColor('#ffdf00');
        let desc = '';
        for (let i = 0; i < sorted.length; i++) desc += `**#${i + 1}** <@${sorted[i].id}> - Level ${sorted[i].level} (${sorted[i].xp} XP)\n`;
        embed.setDescription(desc || 'No users found.');
        await interaction.reply({ embeds: [embed] });
    }
});

client.login(process.env.BOT_TOKEN);
