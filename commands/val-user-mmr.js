const { SlashCommandBuilder } = require('@discordjs/builders');
const lib = require('../external-functions.js');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('val-user-mmr')
        .setDescription('Replies with information about Apex Legends current map!')
        .addStringOption((option) =>
            option
                .setName("search-user")
                .setDescription("Search for username with identifier (ex. Username#NA1).")
                .setRequired(true)),
    async execute(interaction) {
        let message = interaction.options._hoistedOptions[0].value;

        lib.getPuid(message).then((PUID) => {
            lib.getMMR(PUID).then((userInfo) => {
                const exampleEmbed = lib.createEmbed(message,
                    { name: 'Rank: ', value: `${userInfo.current_rank}` },
                    { name: 'MMR Change:: ', value: `${userInfo.mmr_change}` },
                    { name: `Current Elo: `, value: `${userInfo.current_elo}` },
                    true)
                // .setFooter({ text: 'Some footer text here', iconURL: `https://cdn.discordapp.com/avatars/${avatarURL.botID}/${avatarURL.avatarURL}.png` });
                interaction.reply({ embeds: [exampleEmbed] });
            }).catch((err) => {
                interaction.reply({content: `Error: ${err}`, ephemeral: true});
            })
        }).catch((err) => {
            interaction.reply({content: `Error fetching Valorant ID. ${err}`, ephemeral: true});
            console.error(err);
        })
    }
};