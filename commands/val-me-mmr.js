const { SlashCommandBuilder } = require('@discordjs/builders');
const lib = require('../external-functions.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('val-me-mmr')
		.setDescription('Replies with your Valorant user data'),
	async execute(interaction) {
		let user = await lib.getUserDB(interaction.guildId, interaction.user.id);

		if (user) {
			lib.getMMR(userPUID).then((userInfo) => {
				const response = lib.createEmbed(userInfo.userName,
					{ name: 'Rank: ', value: `${userInfo.current_rank}` },
					{ name: 'MMR Change:: ', value: `${userInfo.mmr_change}` },
					{ name: `Current Elo: `, value: `${userInfo.current_elo}` },
					true)
				interaction.reply({ embeds: [response] });

			})
		} else {
			interaction.reply(
				{
					content: 'No user name found! Update username using /val-update-me or search for user using /val-user-mmr',
					ephemeral: true
				})
		}

	}
}
