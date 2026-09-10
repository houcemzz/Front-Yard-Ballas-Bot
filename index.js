const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const http = require('http');

// 1. Keep-Alive HTTP Server (Prevents hosting health-check timeouts)
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Roster Bot Status: Online\n');
}).listen(7860, () => {
    console.log('[Server] HTTP Health-Check server listening on port 7860');
});

// 2. Initialize Discord Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers // Requires GUILD_MEMBERS intent in Dev Portal
    ]
});

// Configuration - Pulled from Environment Variables or hardcoded fallback strings
const GUILD_ID = process.env.GUILD_ID || '1547361151774625883';
const CHANNEL_ID = process.env.CHANNEL_ID || '1547361152470745221';

// Enter your 6 Role IDs in order
const ROLE_IDS = [
    '1547361151799795811',
    '1547361151799795810',
    '1547361151799795809',
    '1547361151799795807',
    '1547361151799795806',
    '1547361151799795805'
];

let rosterMessage = null; // Caches the message reference in memory

// 3. Main Roster Update Function
async function updateRosterEmbed() {
    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        await guild.members.fetch(); // Cache all server members

        const channel = await client.channels.fetch(CHANNEL_ID);

        // Auto-detect existing roster message in recent channel history
        if (!rosterMessage) {
            const recentMessages = await channel.messages.fetch({ limit: 10 });
            rosterMessage = recentMessages.find(m => m.author.id === client.user.id && m.embeds.length > 0);
        }

        const embed = new EmbedBuilder()
            .setTitle('Family Roster (Auto-Update)')
            .setColor(0x313338)
            .setFooter({ text: 'Auto-refreshes every 30 minutes' })
            .setTimestamp();

        for (const roleId of ROLE_IDS) {
            const role = guild.roles.cache.get(roleId);
            
            if (role) {
                // Mentions members as bullets (• @Member)
                const memberList = role.members.size > 0 
                    ? role.members.map(m => `• ${m.toString()}`).join('\n') 
                    : '*None*';

                // Truncate safely if role contains too many members for field limit
                const trimmedList = memberList.length > 1024 
                    ? memberList.substring(0, 1020) + '...' 
                    : memberList;

                embed.addFields({
                    name: `${role.name} (${role.members.size})`,
                    value: trimmedList,
                    inline: true
                });
            }
        }

        // Edit existing message or send a new one
        if (rosterMessage) {
            await rosterMessage.edit({ embeds: [embed] });
            console.log('[Roster] Updated existing roster message.');
        } else {
            rosterMessage = await channel.send({ embeds: [embed] });
            console.log('[Roster] Sent new roster message.');
        }
    } catch (err) {
        console.error('[Roster] Error updating roster embed:', err);
    }
}

// 4. Bot Ready Event
client.once('ready', () => {
    console.log(`[Bot] Successfully logged in as ${client.user.tag}`);
    
    // Run immediately on boot
    updateRosterEmbed();
    
    // Auto-refresh loop every 30 minutes (1,800,000 ms)
    setInterval(updateRosterEmbed, 30 * 60 * 1000);
});

// 5. Connect to Discord
client.login(process.env.MTU0NzQ0MjU3ODAyNTA4Njk3Ng.G5v1n1.xa9UrqQTKV3A3QxToz0ZUXxg1y4oNJ3rRthsG8);
