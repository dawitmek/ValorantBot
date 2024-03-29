// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Intents } = require('discord.js');
const token = process.env.VALTOKEN;
// Create a new client instance Discord.js
const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"] });
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

client.commands = new Collection();

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}


// When the client is ready, run this code (only once) Discord.js
client.once('ready', () => {
	console.log('Ready from discord.js!');
	client.user.setActivity("Your mother", { type: "PLAYING" })
});

client.on("messageCreate", (message) => {
	if (message.author.bot) return false;

});
//	Discord.js
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		client.api.interactions(interaction.id, interaction.token).callback.post({
			data: {
				type: 5,
			},
		})
		await command.execute(interaction, client);
	} catch (err) {
		console.error(error);
		//interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});




// Login to Discord with your client's token
client.login(token);
