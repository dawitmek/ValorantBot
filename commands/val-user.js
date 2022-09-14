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
    async execute(interaction, client) {
        // prompts for username then returns rank, kd and winrate
        // console.log(interaction);
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
            }).catch((error) => {
                console.error(error);
                lib.editInteraction(interaction, error, true);
            })
        }).catch((error) => {
            console.error(error);
            lib.editInteraction(interaction, error, true);
        })
    }
}