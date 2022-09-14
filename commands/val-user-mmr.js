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
    async execute(interaction, client) {
        let message = interaction.options._hoistedOptions[0].value;
        lib.getPuid(message).then((PUID) => {
            lib.getMMR(PUID).then((userInfo) => {
                const embed = lib.createEmbed(message,
                    [
                        { name: 'Rank: ', value: `${userInfo.current_rank}` },
                        { name: 'MMR Change:: ', value: `${userInfo.mmr_change}` },
                        { name: `Current Elo: `, value: `${userInfo.current_elo}` },
                    ],
                    true)
                lib.editInteraction(interaction, embed, false);

            }).catch((err) => {
                lib.editInteraction(interaction, err, true);
            })
        }).catch((err) => {
            interaction.reply({ content: `Error fetching Valorant ID. ${err}`, ephemeral: true });
            console.error(err);
        })
    }
};