const { EmbedBuilder } = require('discord.js');
const { getUserStats } = require('../utils/cache');

module.exports = {
    name: 'profile',
    description: 'Display user cricket statistics',
    async execute(message, args) {
        const targetUser = message.mentions.users.first() || message.author;
        const stats = getUserStats(targetUser.id);

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`${targetUser.username}'s Cricket Profile`)
            .setThumbnail(targetUser.displayAvatarURL())
            .addFields(
                { 
                    name: '📊 Match Statistics', 
                    value: `Matches: ${stats.matches}\nWins: ${stats.wins}\nLosses: ${stats.losses}\nWin Rate: ${stats.matches > 0 ? ((stats.wins / stats.matches) * 100).toFixed(1) : 0}%`,
                    inline: true 
                },
                {
                    name: '🏆 Best Team',
                    value: stats.mostUsedTeam ? `${stats.mostUsedTeam}\nWin Rate: ${((stats.teamStats[stats.mostUsedTeam].wins / stats.teamStats[stats.mostUsedTeam].matches) * 100).toFixed(1)}%` : 'No matches played',
                    inline: true
                }
            )
            .setTimestamp();

        // Add recent results with colored backgrounds
        if (stats.recentResults.length > 0) {
            const results = stats.recentResults.map(result => {
                return result === 'W' ? '🟩' : '🟥';
            }).join(' ');
            embed.addFields({ name: '🎯 Recent Results', value: results, inline: false });
        }

        // Add team statistics if available
        if (Object.keys(stats.teamStats).length > 0) {
            const topTeams = Object.entries(stats.teamStats)
                .sort((a, b) => b[1].matches - a[1].matches)
                .slice(0, 3)
                .map(([team, stats]) => {
                    const winRate = ((stats.wins / stats.matches) * 100).toFixed(1);
                    return `${team}: ${stats.matches} matches (${winRate}% wins)`;
                })
                .join('\n');

            embed.addFields({ name: '👥 Most Used Teams', value: topTeams, inline: false });
        }

        return message.reply({ embeds: [embed] });
    },
};
