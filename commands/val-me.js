const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');
const fs = require('node:fs');

const { MongoClient } = require('mongodb');

const dbclient = MongoClient(process.env.DATABASECONNECTION);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('val-me')
		.setDescription('Search for your Valorant stats.'),
	async execute(interaction) {
		await dbclient.connect();
		let user = getUserDB(interaction.guildId, interaction.user.id);
		if (userPUID.puid) {
			returnUser(userPUID).then((userInfo) => {
				let name = user,
					fields = [
						{ name: 'Rank: ', value: `${userInfo.tier}` },
						{ name: 'Winrate: ', value: `${userInfo.wr}` },
						{ name: `KDA: `, value: `${userInfo.kda}` },
					]
				interaction.reply({ embeds: [createEmbed(name, fields, true)] });

			})
		} else {
			interaction.reply({
				content: "You don't have a profile! Create one using /val-update-me",
				ephemeral: true
			})
		}
		await dbclient.close()
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

function createEmbed(name, fields, timestamp) {
	const embed = new MessageEmbed()
		.setColor('#FDDA0D')
		.setTitle(`Stats for ${name}`)
		.setDescription('For the past 5 games.')
		// .setAuthor({ name: 'Valorant Bot', iconURL: `https://cdn.discordapp.com/avatars/${avatarURL.botID}/${avatarURL.avatarURL}.png` })
		.addFields(fields)
	if (timestamp) {
		embed.setTimestamp()
	}

	return embed
}
async function getUserDB(guild, user) {
	return await dbclient.db('val-user').collection(guild).find({
		user: user
	})
}

