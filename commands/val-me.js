const { SlashCommandBuilder } = require("@discordjs/builders"),
	fetch = require("node-fetch"),
	fs = require("node:fs"),
	lib = require("../external-functions.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("val-me")
		.setDescription("Search for your Valorant stats."),
	async execute(interaction) {
		try {
			await lib.dbclient.connect();
			let userData = await lib.getUserDB(
				interaction.guildId,
				interaction.user.id
			);
			// console.log(userData);
			if (userData) {
				lib.returnUser(userData.puid).then(async (userInfo) => {
					let name = userData.valUsername,
						fields = [
							{ name: "Rank: ", value: `${userInfo.tier}` },
							{ name: "Winrate: ", value: `${userInfo.wr}` },
							{ name: `KDA: `, value: `${userInfo.kda}` },
						];
					interaction.reply({ embeds: [lib.createEmbed(name, fields, true)] });
					await lib.closeDB();

				});
			} else {
				interaction.reply({
					content: "You don't have a profile! Create one using /val-update-me",
					ephemeral: true,
				});
				lib.closeDB();

			}
		} catch (error) {
			console.error('An error occured while fetching data', error)
		}
	},
};

