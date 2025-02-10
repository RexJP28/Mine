const { Client, GatewayIntentBits, Collection, PermissionsBitField } = require('discord.js');
const { getServerPrefix, setServerPrefix } = require('./utils/cache');
const cricket = require('./commands/cricket');
const help = require('./commands/help');
const profile = require('./commands/profile');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();

// Register commands
client.commands.set('cricket', cricket);
client.commands.set('help', help);
client.commands.set('profile', profile);

client.once('ready', () => {
    console.log('Cricket Bot is ready! 🏏');
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const prefix = getServerPrefix(message.guild.id);
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Handle prefix command
    if (command === 'prefix') {
        // Check if user has admin/mod permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.MANAGE_GUILD)) {
            return message.reply('You need admin/mod permissions to change the prefix!');
        }

        const newPrefix = args[0];
        if (!newPrefix) {
            return message.reply(`Current prefix is: \`${prefix}\``);
        }

        if (newPrefix.length > 3) {
            return message.reply('Prefix must be 3 characters or less!');
        }

        setServerPrefix(message.guild.id, newPrefix);
        return message.reply(`Prefix has been updated to: \`${newPrefix}\``);
    }

    if (!client.commands.has(command)) return;

    try {
        await client.commands.get(command).execute(message, args);
    } catch (error) {
        console.error(error);
        await message.reply('There was an error executing that command!');
    }
});

client.login(process.env.DISCORD_TOKEN);