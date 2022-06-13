const { SlashCommandBuilder } = require('@discordjs/builders');
const lib = require('C:/Users/dawit/Desktop/ValorantBot/get-puid.js');
const objStorage = require('../storage.json');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('val-me')
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
			returnUser(userPUID).then((userInfo) => {
				const exampleEmbed = new MessageEmbed()
					.setColor('#fc2403')
					.setTitle(`Stats for ${Object.keys(valUID)}`)
					.setDescription('For the past 5 games.')
					// .setAuthor({ name: 'Valorant Bot', iconURL: `https://cdn.discordapp.com/avatars/${avatarURL.botID}/${avatarURL.avatarURL}.png` })
					.addFields(
						{ name: 'Rank: ', value: `${userInfo.tier}` },
						{ name: 'Winrate: ', value: `${userInfo.wr}` },
						{ name: `KDA: `, value: `${userInfo.kda}` },
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
							returnUser(response).then((userInfo) => {
								const exampleEmbed = new MessageEmbed()
									.setColor('#fc2403')
									.setTitle(`Stats for ${messages.first().content}`)
									.setDescription('For the past 5 games.')
									// .setAuthor({ name: 'Valorant Bot', iconURL: `https://cdn.discordapp.com/avatars/${avatarURL.botID}/${avatarURL.avatarURL}.png` })
									.addFields(
										{ name: 'Rank: ', value: `${userInfo.tier}` },
										{ name: 'Winrate: ', value: `${userInfo.wr}` },
										{ name: `KDA: `, value: `${userInfo.kda}` },
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

function returnUser(PUID) {
	return new Promise((resolve, reject) => {
		let kills = 0, assists = 0, deaths = 0, winRate, finalKDA, currentTier;
		fetch(`https://api.henrikdev.xyz/valorant/v3/by-puuid/matches/na/${PUID}`)
			.then((response) => response.json())
			.then((data) => {
				let totalWon = 0;

				data.data.forEach((element) => {
					element.kills.forEach((kill) => {
						// Runs through every assist array
						kill.assistants.forEach((assist) => {
							if (assist.assistant_puuid === PUID) {
								assists++;
							}
						});
						if (kill.victim_puuid === PUID) {
							deaths++;
						}
						if (kill.killer_puuid === PUID) {
							kills++;
						}
					});
					// KDA
					element.players.all_players.forEach((element) => {
						//      Runs through every kill array
						if (element.puuid === PUID) {
							team = element.team;
							currentTier = element.currenttier_patched;
						}
					});
					if (element.teams[`${team.toLowerCase()}`].has_won) {
						totalWon++;
					}
				});
				winRate = totalWon / data.data.length;
				finalKDA = (kills + assists) / deaths;
				resolve({ 'wr': winRate, 'kda': Number(finalKDA.toFixed(2)), 'tier': currentTier });
			})
			.catch((error) => {
				console.log("Had error fetching matches:", error);
			});
	})
}