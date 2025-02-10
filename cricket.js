const { Match } = require('../utils/match');
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { createScorecard } = require('../utils/scorecards');

module.exports = {
    name: 'cricket',
    description: 'Cricket game commands',
    async execute(message, args) {
        if (!args.length) {
            const helpEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Cricket Game Commands')
                .addFields(
                    { name: '🎮 Start a Game', value: 'c!play @player' },
                    { name: '🏏 Game Actions', value: 'c!bat, c!bowl' },
                    { name: '🔄 Team Management', value: 'c!team, c!swap <pos1> <pos2>' },
                    { name: '❌ Quit Game', value: 'c!quit, c!exit, c!leave' }
                );
            return message.reply({ embeds: [helpEmbed] });
        }

        const subCommand = args[0].toLowerCase();
        const match = Match.getMatch(message.author.id);

        switch (subCommand) {
            case 'quit':
            case 'exit':
            case 'leave':
                if (!match) {
                    return message.reply('No active match found!');
                }
                const quitResult = match.requestQuit(message.author.id);
                const quitEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('Match Quit Request')
                    .setDescription(quitResult.message);

                if (quitResult.type === 'request') {
                    quitEmbed.addFields({
                        name: 'Response Required',
                        value: 'Opponent must type c!accept or c!reject to respond to the quit request.'
                    });
                } else if (quitResult.type === 'forfeit') {
                    quitEmbed.addFields({
                        name: '🏆 Winner',
                        value: quitResult.winner.username
                    });
                }
                return message.reply({ embeds: [quitEmbed] });

            case 'accept':
                if (!match) {
                    return message.reply('No active match found!');
                }
                const acceptResult = match.respondToQuit(message.author.id, true);
                const acceptEmbed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('Match Ended')
                    .setDescription(acceptResult.message);
                return message.reply({ embeds: [acceptEmbed] });

            case 'reject':
                if (!match) {
                    return message.reply('No active match found!');
                }
                const rejectResult = match.respondToQuit(message.author.id, false);
                const rejectEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('Quit Request Rejected')
                    .setDescription(rejectResult.message);
                return message.reply({ embeds: [rejectEmbed] });

            case 'bat':
            case 'bowl':
                if (!match) {
                    return message.reply('No active match found!');
                }
                const result = match.simulateBall();
                match.updateScore(match.currentInnings, result);

                if (result.result === 'wicket') {
                    const availablePlayers = match.getRemainingBatsmen();
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('next_batter')
                                .setPlaceholder('Select next batter')
                                .addOptions(availablePlayers.map(player => ({
                                    label: player.name,
                                    description: `${player.role} | Rating: ${player.batting}`,
                                    value: player.id.toString(),
                                    emoji: player.role === 'Batsman' ? '🏏' : 
                                           player.role === 'All-Rounder' ? '🌟' : '👤'
                                })))
                        );
                    await message.channel.send({ 
                        content: '**Wicket! Select next batter:**',
                        components: [row]
                    });
                }

                if (match.isOverComplete()) {
                    const availableBowlers = match.getAvailableBowlers();
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('next_bowler')
                                .setPlaceholder('Select next bowler')
                                .addOptions(availableBowlers.map(bowler => ({
                                    label: bowler.name,
                                    description: `${bowler.bowlingStyle || 'Fast'} | Rating: ${bowler.bowling}`,
                                    value: bowler.id.toString(),
                                    emoji: getBowlingStyleEmoji(bowler.bowlingStyle)
                                })))
                        );
                    await message.channel.send({
                        content: '**Over Complete! Select next bowler:**',
                        components: [row]
                    });
                }

                // Create appropriate scorecard based on league
                const scorecard = createScorecard(match);
                return message.reply({ embeds: [scorecard.generate()] });

            case 'team':
                if (!match) {
                    return message.reply('No active match found!');
                }
                const teamName = args.slice(1).join(' ');
                if (match.setTeam(message.author.id, teamName)) {
                    const embed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('Team Selected!')
                        .setDescription(`You've selected: ${teamName}`)
                        .addFields(
                            { name: 'Players', value: 'Use c!squad to view your team\nUse c!swap <player1> <player2> to change player positions' }
                        );
                    return message.reply({ embeds: [embed] });
                }
                return message.reply('Invalid team selection! Make sure the league has been selected.');

            case 'swap':
                if (!match) {
                    return message.reply('No active match found!');
                }
                const pos1 = parseInt(args[1]) - 1;
                const pos2 = parseInt(args[2]) - 1;
                if (match.swapPlayers(message.author.id, pos1, pos2)) {
                    const embed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('Players Swapped!')
                        .setDescription('Players have been swapped successfully.');
                    return message.reply({ embeds: [embed] });
                }
                return message.reply('Invalid swap positions! Use numbers between 1 and 11.');

            default:
                return message.reply('Invalid cricket command! Type c!help for more info.');
        }
    },

    play: {
        name: 'play',
        description: 'Start a cricket match with another player',
        async execute(message, args) {
            if (!args.length || !message.mentions.users.size) {
                return message.reply('Please mention a player to challenge! Usage: c!play @player');
            }

            const challenger = message.author;
            const opponent = message.mentions.users.first();

            if (opponent.bot) {
                return message.reply('You cannot challenge a bot!');
            }

            if (opponent.id === challenger.id) {
                return message.reply('You cannot challenge yourself!');
            }

            const existingMatch = Match.getMatch(challenger.id) || Match.getMatch(opponent.id);
            if (existingMatch) {
                return message.reply('One of the players is already in a match!');
            }

            const match = Match.createMatch(challenger, opponent);
            const challengeEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Cricket Match Challenge!')
                .setDescription(`${challenger.username} has challenged ${opponent.username} to a cricket match!`)
                .addFields(
                    { name: 'To accept', value: 'React with ✅' },
                    { name: 'To decline', value: 'React with ❌' }
                );

            const challengeMessage = await message.channel.send({ embeds: [challengeEmbed] });
            await challengeMessage.react('✅');
            await challengeMessage.react('❌');

            const filter = (reaction, user) => {
                return ['✅', '❌'].includes(reaction.emoji.name) && user.id === opponent.id;
            };

            try {
                const collected = await challengeMessage.awaitReactions({ filter, max: 1, time: 30000, errors: ['time'] });
                const reaction = collected.first();

                if (reaction.emoji.name === '✅') {
                    const leagueSelectEmbed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('Match Setup')
                        .setDescription(`${challenger.username}, as the challenger:`)
                        .addFields(
                            { name: '1️⃣ Set Overs', value: 'Use c!overs <number> (1-20)' },
                            { name: '2️⃣ Select League', value: 'Choose from: ' + match.availableLeagues.join(', ') },
                            { name: '❗ Note', value: 'Only the challenger can set overs and league.' }
                        );
                    message.channel.send({ embeds: [leagueSelectEmbed] });
                } else {
                    Match.endMatch(challenger.id);
                    message.channel.send(`${opponent.username} declined the match challenge.`);
                }
            } catch (error) {
                Match.endMatch(challenger.id);
                message.channel.send('No response received, challenge expired.');
            }
        }
    }
};

function getBowlingStyleEmoji(style) {
    if (!style) return '⚾';
    switch (style.toLowerCase()) {
        case 'fast': return '🔥';
        case 'fast medium': return '💨';
        case 'medium fast': return '💨';
        case 'off spin': return '🌀';
        case 'leg spin': return '↪️';
        case 'left arm spin': return '↩️';
        case 'left arm fast': return '⚡';
        default: return '⚾';
    }
}