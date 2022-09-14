const { SlashCommandBuilder } = require("@discordjs/builders"),
	fetch = require("node-fetch"),
	fs = require("node:fs"),
	lib = require("../external-functions.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("val-me")
		.setDescription("Search for your Valorant stats."),
	async execute(interaction, client) {
		try {
			await lib.dbclient.connect();
			let userData = await lib.getUserDB(
				interaction.guildId,
				interaction.user.id
			);

			if (userData) {
				lib.returnUserData(userData.puid).then(async (userInfo) => {
					let name = userData.valUsername,
						fields = [
							{ name: "Rank: ", value: `${userInfo.tier}` },
							{ name: "Winrate: ", value: `${userInfo.wr}` },
							{ name: `KDA: `, value: `${userInfo.kda}` },
						];
					let embed = lib.createEmbed(name, fields, true);
					try {
						await lib.editInteraction(interaction, embed, false);
						await lib.closeDB();
					} catch (err) {
						console.error('There was an error responding/embeding response ', err);
						lib.editInteraction(interaction, err, true);
					}
				}).catch(err => {
					console.error('Eror was rejected: ', err);
					lib.editInteraction(interaction, err.toString());
				});

			} else {
				try {
					let response = "You don't have a profile! Create one using /val-update-me";
					lib.editInteraction(interaction, response);
					await lib.closeDB();
				} catch (err) {
					console.error('There was an error responding (No user name found ', err);
				}

			}
		} catch (err) {
			console.error('An error occured while fetching data', err);
			lib.editInteraction(interaction, err.toString());
		}
	},
};

