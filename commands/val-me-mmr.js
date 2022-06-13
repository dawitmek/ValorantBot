const { SlashCommandBuilder } = require('@discordjs/builders');
const lib = require('C:/Users/dawit/Desktop/ValorantBot/get-puid.js');
const objStorage = require('../storage.json');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('val-me-mmr')
		.setDescription('Replies with information about Apex Legends current map!'),
	async execute(interaction) {

		let guildID = objStorage[interaction.guildId];

		if (!guildID) { // Check if we have a guildID
			objStorage[interaction.guildId] = {}
		}

		let discordUID = objStorage[interaction.guildId][interaction.user.id];

		if (!discordUID) {// Check if we have a discordUID
			objStorage[interaction.guildId][interaction.user.id] = {};
		}

		let valUID = objStorage[interaction.guildId][interaction.user.id]['username'];

		if (!valUID) { // If empty string
			objStorage[interaction.guildId][interaction.user.id]['username'] = {};
			valUID = objStorage[interaction.guildId][interaction.user.id]['username']
		}


		if (Object.keys(objStorage[interaction.guildId][interaction.user.id]['username']).length) {
			let userPUID = valUID[Object.keys(valUID)];
			console.log("username: ", userPUID);
			getMMR(userPUID).then((userInfo) => {
				const exampleEmbed = new MessageEmbed()
					.setColor('#fc2403')
					.setTitle(`Stats for ${Object.keys(valUID)}`)
					.setDescription(`MMR for user ${Object.keys(valUID)}`)
					// .setAuthor({ name: 'Valorant Bot', iconURL: `https://cdn.discordapp.com/avatars/${avatarURL.botID}/${avatarURL.avatarURL}.png` })
					.addFields(
						{ name: 'Rank: ', value: `${userInfo.current_rank}` },
						{ name: 'MMR Change:: ', value: `${userInfo.mmr_change}` },
						{ name: `Current Elo: `, value: `${userInfo.current_elo}` },
					)
					.setTimestamp()
				// .setFooter({ text: 'Some footer text here', iconURL: `https://cdn.discordapp.com/avatars/${avatarURL.botID}/${avatarURL.avatarURL}.png` });
				interaction.reply({ embeds: [exampleEmbed] });

			})

		} else {
			interaction.reply('Enter your Valorant username (First Use Only)\nex. Example#1234').then(() => {
				const filter = m => interaction.user.id === m.author.id;

				interaction.channel.awaitMessages({ filter, time: 60000, max: 1, errors: ['time'] })
					.then(messages => { // returns UserName
						objStorage[interaction.guildId][interaction.user.id]['username'][messages.first().content] = '';
						lib.getPuid(messages.first().content).then((response) => { // returns PUID

							objStorage[interaction.guildId][interaction.user.id]['username'][messages.first().content] = response;
							getMMR(response).then((userInfo) => {
								const exampleEmbed = new MessageEmbed()
									.setColor('#fc2403')
									.setTitle(`Stats for ${Object.keys(valUID)}`)
									.setDescription(`MMR for user ${Object.keys(valUID)}`)
									// .setAuthor({ name: 'Valorant Bot', iconURL: `https://cdn.discordapp.com/avatars/${avatarURL.botID}/${avatarURL.avatarURL}.png` })
									.addFields(
										{ name: 'Rank: ', value: `${userInfo.current_rank}` },
										{ name: 'MMR Change:: ', value: `${userInfo.mmr_change}` },
										{ name: `Current Elo: `, value: `${userInfo.current_elo}` },
									)
									.setTimestamp()
								// .setFooter({ text: 'Some footer text here', iconURL: `https://cdn.discordapp.com/avatars/${avatarURL.botID}/${avatarURL.avatarURL}.png` });
								interaction.followUp({ embeds: [exampleEmbed] });


							})
						}).catch((error) => {
							interaction.followUp(`There was an error with fetch. ${error}`);
						})
					})
					.catch(() => {
						interaction.followUp('You did not enter any input!');
					});
			});
		}

	}
}

function getMMR(PUID) {
	return new Promise((resolve, reject) => {
		fetch(`https://api.henrikdev.xyz/valorant/v2/by-puuid/mmr/na/${PUID}`)
			.then((response) => response.json())
			.then((data) => {
				var log = data.data.current_data;
				// console.log(log);
				resolve({ 'current_rank': log.currenttierpatched, 'mmr_change': log.mmr_change_to_last_game, 'current_elo': log.elo });
			})
	})
}