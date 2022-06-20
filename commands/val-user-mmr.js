const { SlashCommandBuilder } = require('@discordjs/builders');
const lib = require('C:/Users/dawit/Desktop/ValorantBot/get-puid.js');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('val-user-mmr')
        .setDescription('Replies with information about Apex Legends current map!'),
    async execute(interaction) {
        // prompts for username then returns rank, kd and winrate
        interaction.reply('Please enter Valorant username with tag ex. Example#1234.').then(() => {
            const filter = m => interaction.user.id === m.author.id;

            interaction.channel.awaitMessages({ filter, time: 60000, max: 1, errors: ['time'] })
                .then(messages => {
                    lib.getPuid(messages.first().content).then((response) => {
                        getMMR(response).then((userInfo) => {
                            const exampleEmbed = new MessageEmbed()
                                .setColor('#FDDA0D')
                                .setTitle(`Stats for ${messages.first().content}`)
                                .setDescription('For the past 5 games.')
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