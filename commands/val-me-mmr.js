const { SlashCommandBuilder } = require('@discordjs/builders');
const lib = require('../external-functions.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('val-me-mmr')
		.setDescription('Replies with your Valorant user data'),
	async execute(interaction, client) {
		await lib.dbclient.connect();

		let user = await lib.getUserDB(interaction.guildId, interaction.user.id);

		if (user) {
			console.log(user.puid);
			lib.getMMR(user.puid).then((userInfo) => {
				console.log(typeof userInfo);
				const embed = lib.createEmbed(user.valUsername,
					[
						{ name: 'Rank: ', value: `${userInfo.current_rank}` },
						{ name: 'MMR Change: ', value: `${userInfo.mmr_change}` },
						{ name: `Current Elo: `, value: `${userInfo.current_elo}` },
					],
					true)
				lib.editInteraction(interaction, embed);
			}).catch((error) => {
				console.error('Error Occured In Me-MMR');
				console.log(typeof error.toString());
				lib.editInteraction(interaction, error.toString());
			})
		} else {
			let response = 'No user name found! Update username using /val-update-me or search for user using /val-user-mmr';
			lib.editInteraction(interaction, response)
		}

	}
}
