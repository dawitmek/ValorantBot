const { SlashCommandBuilder } = require("@discordjs/builders");
const lib = require("../external-functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("val-update-me")
        .setDescription("Update your existing username.")
        .addStringOption((option) =>
            option
                .setName("set-user")
                .setDescription("Set new username with identifier (ex. Username#NA1).")
                .setRequired(true)
        ),
    async execute(interaction, client) {
        let newUsername = interaction.options._hoistedOptions[0].value;
        await lib.connectDB();
        // prompts for username then returns rank, kd and winrate
        let userData = await lib.getUserDB(
            interaction.guildId,
            interaction.user.id
        );
        console.log("User data: ", userData);
        if (userData) {
            let PUID = await lib.getPuid(newUsername);
            let updated = await lib.dbclient
                .db("Valorant-Bot")
                .collection(interaction.guildId)
                .updateOne(
                    {
                        id: interaction.user.id,
                    },
                    {
                        $set: {
                            valUsername: newUsername,
                            puid: PUID,
                        },
                    }
                );
            console.log("updated: ", updated);
            if (updated) {
                lib.editInteraction(interaction, `User ${newUsername} been updated!`, true)
                lib.closeDB();
            }
        } else {
            let PUID = await lib.getPuid(newUsername);
            let inserted = await lib.dbclient
                .db("Valorant-Bot")
                .collection(interaction.guildId)
                .insertOne({
                    id: interaction.user.id,
                    valUsername: newUsername,
                    puid: PUID,
                });
            console.log("inserted: ", inserted);
            if (inserted) {
                lib.editInteraction(interaction, `User ${newUsername} been created!`, true)
                lib.closeDB();
            }
        }
    },
};
