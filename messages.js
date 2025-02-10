\nBatter          R    B   4s  6s  SR  \n' + '-'.repeat(45) + '\n```',
                        inline: false 
                    }
                );

            if (game.battingStats) {
                Object.entries(game.battingStats).forEach(([name, stats]) => {
                    const sr = ((stats.runs / stats.balls) * 100).toFixed(1);
                    embed.addFields({
                        name: '\u200B',
                        value: `\`\`\`${name.padEnd(15)} ${stats.runs.toString().padStart(4)} ${stats.balls.toString().padStart(4)} ${stats.fours.toString().padStart(4)} ${stats.sixes.toString().padStart(4)} ${sr.padStart(6)}\`\`\``,
                        inline: false
                    });
                });
            }
            break;

        case 'bowling':
            embed.setTitle('⚾ PSL BOWLING CARD')
                .addFields(
                    { 
                        name: 'BOWLERS', 
                        value: '```\nBowler          O    M    R    W   ER  \n' + '-'.repeat(45) + '\n```',
                        inline: false 
                    }
                );

            if (game.bowlingStats) {
                Object.entries(game.bowlingStats).forEach(([name, stats]) => {
                    const er = (stats.runs / stats.overs).toFixed(1);
                    embed.addFields({
                        name: '\u200B',
                        value: `\`\`\`${name.padEnd(15)} ${stats.overs.toString().padStart(4)} ${stats.maidens.toString().padStart(4)} ${stats.runs.toString().padStart(4)} ${stats.wickets.toString().padStart(4)} ${er.padStart(6)}\`\`\``,
                        inline: false
                    });
                });
            }
            break;
    }

    return embed;
}

function createIPLScorecard(game, type = 'summary') {
    const embed = new EmbedBuilder()
        .setColor('#004BA0') // IPL Blue
        .setTimestamp();

    switch(type) {
        case 'summary':
            embed.setTitle('🏆 TATA IPL 2024')
                .addFields(
                    { name: '📊 MATCH SUMMARY', value: `${'-'.repeat(30)}`, inline: false },
                    { 
                        name: 'Score', 
                        value: `\`\`\`${game.score.innings1.runs}/${game.score.innings1.wickets} (${game.score.innings1.overs}.${game.score.innings1.balls})\`\`\``,
                        inline: false 
                    },
                    { 
                        name: 'Impact Player', 
                        value: `\`\`\`diff\n${game.impactPlayerAvailable ? '+ Available' : '- Used'}\`\`\``,
                        inline: true 
                    },
                    { 
                        name: 'Strategic Timeout', 
                        value: `\`\`\`diff\n${game.timeoutAvailable ? '+ Available' : '- Used'}\`\`\``,
                        inline: true 
                    },
                    { 
                        name: 'DRS Remaining', 
                        value: `\`\`\`diff\n${game.drsAvailable ? '+ Available' : '- Used'}\`\`\``,
                        inline: true 
                    }
                );
            break;

        case 'batting':
            embed.setTitle('🏏 TATA IPL BATTING')
                .addFields(
                    { 
                        name: 'BATTERS', 
                        value: '```\nBatter          R    B   4s  6s  SR    Phase\n' + '-'.repeat(55) + '\n```',
                        inline: false 
                    }
                );

            if (game.battingStats) {
                Object.entries(game.battingStats).forEach(([name, stats]) => {
                    const sr = ((stats.runs / stats.balls) * 100).toFixed(1);
                    embed.addFields({
                        name: '\u200B',
                        value: `\`\`\`${name.padEnd(15)} ${stats.runs.toString().padStart(4)} ${stats.balls.toString().padStart(4)} ${stats.fours.toString().padStart(4)} ${stats.sixes.toString().padStart(4)} ${sr.padStart(6)} ${stats.phase.padStart(8)}\`\`\``,
                        inline: false
                    });
                });
            }
            break;

        case 'bowling':
            embed.setTitle('⚾ TATA IPL BOWLING')
                .addFields(
                    { 
                        name: 'BOWLERS', 
                        value: '```\nBowler          O    M    R    W   ER   DOT%\n' + '-'.repeat(55) + '\n