const { EmbedBuilder } = require('discord.js');
const { getServerPrefix, setServerPrefix } = require('../utils/cache');

module.exports = {
    name: 'prefix',
    description: 'Change or view the server prefix',
    async execute(message, args) {
        // Check if user has admin/mod permissions
        if (!message.member.permissions.has('MANAGE_GUILD')) {
            return message.reply('You need administrator or moderator permissions to change the prefix.');
        }

        const currentPrefix = getServerPrefix(message.guild.id);

        // If no args, show current prefix
        if (!args.length) {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Server Prefix')
                .setDescription(`Current prefix: \`${currentPrefix}\``)
                .addFields({
                    name: 'Change Prefix',
                    value: `Use \`${currentPrefix}prefix <new_prefix>\` to change it.`
                });
            return message.reply({ embeds: [embed] });
        }

        const newPrefix = args[0];
        
        // Validate prefix
        if (newPrefix.length > 3) {
            return message.reply('Prefix must be 3 or fewer characters long.');
        }

        // Set new prefix
        setServerPrefix(message.guild.id, newPrefix);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('Prefix Changed!')
            .setDescription(`Server prefix has been changed to: \`${newPrefix}\``)
            .addFields({
                name: 'Example Usage',
                value: `${newPrefix}play @user\n${newPrefix}profile\n${newPrefix}help`
            });

        return message.reply({ embeds: [embed] });
    }
};
