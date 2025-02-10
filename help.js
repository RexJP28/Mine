
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Display help information',
    async execute(message, args) {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🏏 Cricket Bot Commands')
            .setDescription('Select a command from the dropdown menu below for detailed information.')
            .addFields(
                { name: '🎮 Game Commands', value: '`!play`, `!bowl`, `!bat`, `!ready`, `!quit`' },
                { name: '⚙️ Setup Commands', value: '`!overs`, `!league`, `!team`, `!swap`' },
                { name: '📊 Info Commands', value: '`!squad`, `!profile`, `!help`' }
            )
            .setFooter({ text: 'Use the dropdown menu below for detailed information about each command' });

        const commandDetails = {
            play: {
                name: '🎮 Play Command',
                value: '**Usage:** `!play @user`\nChallenge another user to a cricket match. You\'ll need to set overs and choose a league after the challenge is accepted.'
            },
            bowl: {
                name: '🎳 Bowl Command',
                value: '**Usage:** `!bowl`\nBowl a delivery when it\'s your turn to bowl. The game will simulate the outcome based on bowler and batsman ratings.'
            },
            bat: {
                name: '🏏 Bat Command',
                value: '**Usage:** `!bat`\nPlay a shot when it\'s your turn to bat. The game will simulate the outcome based on bowler and batsman ratings.'
            },
            overs: {
                name: '🕒 Overs Command',
                value: '**Usage:** `!overs <number>`\nSet the number of overs for the match (1-20). Must be set before the match starts.'
            },
            league: {
                name: '🌍 League Command',
                value: '**Usage:** `!league <name>`\nSelect a cricket league (international/ipl/psl/bbl). Different leagues have different teams available.'
            },
            team: {
                name: '👥 Team Command',
                value: '**Usage:** `!team <name>`\nSelect your team from the chosen league. Each team has unique players with different skill ratings.'
            },
            squad: {
                name: '📋 Squad Command',
                value: '**Usage:** `!squad`\nView your current team lineup and player positions. Use this to plan your strategy.'
            },
            swap: {
                name: '🔄 Swap Command',
                value: '**Usage:** `!swap <player1> <player2>`\nSwap positions of two players in your squad. Used to optimize your batting order.'
            },
            profile: {
                name: '👤 Profile Command',
                value: '**Usage:** `!profile [@user]`\nView cricket statistics for yourself or another user. Shows match history and performance.'
            },
            ready: {
                name: '✅ Ready Command',
                value: '**Usage:** `!ready`\nMark yourself as ready to start the match after selecting your team.'
            },
            quit: {
                name: '❌ Quit Command',
                value: '**Usage:** `!quit`\nQuit the current match. Both players must agree to end the match early.'
            }
        };

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('help_menu')
                    .setPlaceholder('Select a command for more information')
                    .addOptions(
                        Object.entries(commandDetails).map(([key, value]) => ({
                            label: value.name.split(' ')[1],
                            description: value.value.split('\n')[0].substring(0, 100),
                            value: key,
                            emoji: value.name.split(' ')[0]
                        }))
                    )
            );

        const response = await message.reply({ embeds: [embed], components: [row] });

        // Create collector for dropdown menu interactions
        const collector = response.createMessageComponentCollector({ 
            time: 60000 
        });

        collector.on('collect', async interaction => {
            if (interaction.customId === 'help_menu') {
                const selectedCommand = commandDetails[interaction.values[0]];
                const detailEmbed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle(selectedCommand.name)
                    .setDescription(selectedCommand.value)
                    .setFooter({ text: 'Menu will expire in 60 seconds' });

                await interaction.reply({ embeds: [detailEmbed], ephemeral: true });
            }
        });

        collector.on('end', () => {
            row.components[0].setDisabled(true);
            response.edit({ components: [row] });
        });
    },
};
