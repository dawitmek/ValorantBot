const { SlashCommandBuilder } = require('@discordjs/builders');
const lib = require('../external-functions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('val-user')
        .setDescription('Replies with information about a users current MMR!')
        .addStringOption((option) =>
            option
                .setName("search-user")
                .setDescription("Search for username with identifier (ex. Username#NA1).")
                .setRequired(true)),
    async execute(interaction) {
        // prompts for username then returns rank, kd and winrate
        // console.log(interaction);
        let message = interaction.options._hoistedOptions[0].value;

        lib.getPuid(message).then((PUID) => {
            lib.getMMR(PUID).then((userInfo) => {
                const response = lib.createEmbed(message,
                    { name: 'Rank: ', value: `${userInfo.current_rank}` },
                    { name: 'MMR Change:: ', value: `${userInfo.mmr_change}` },
                    { name: `Current Elo: `, value: `${userInfo.current_elo}` },
                    true)
                interaction.reply({ embeds: [response] });
            }).catch((error) => {
                console.error(error);
                interaction.reply(`Error: ${error}`);
            })
        }).catch((error) => {
            console.error(error);
            interaction.reply(`Error: ${error}`);
        })
    }
}