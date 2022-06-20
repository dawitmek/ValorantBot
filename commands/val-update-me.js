const { SlashCommandBuilder } = require('@discordjs/builders');
const lib = require('../get-puid.js');
const { MessageEmbed } = require('discord.js');
const objStorage = require('../storage.json');
const fs = require('node:fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('val-update-me')
        .setDescription('Update your existing username.'),
    async execute(interaction) {
        // prompts for username then returns rank, kd and winrate
        // console.log(interaction);

        interaction.reply('Please enter your new Valorant username with tag ex. Example#1234.').then(() => {
            const filter = m => interaction.user.id === m.author.id;

            interaction.channel.awaitMessages({ filter, time: 60000, max: 1, errors: ['time'] })
                .then(messages => {
                    // let currData = objStorage[interaction.guildId][interaction.user.id]['username'];
                    let currKey = Object.keys(objStorage[interaction.guildId][interaction.user.id]['username'])[0];
                    if (currKey !== messages.first().content) {
                        Object.defineProperty(objStorage[interaction.guildId][interaction.user.id]['username'], messages.first().content,
                        Object.getOwnPropertyDescriptor(objStorage[interaction.guildId][interaction.user.id]['username'], currKey));
                      
                        delete objStorage[interaction.guildId][interaction.user.id]['username'][currKey];
                        lib.getPuid(messages.first().content).then((response) => {
                            objStorage[interaction.guildId][interaction.user.id]['username'][messages.first().content] = response;
                          fs.writeFileSync('./storage.json', JSON.stringify(objStorage, null, 2));
                          
                        })
                    }
                          
                    const exampleEmbed = new MessageEmbed()
                        .setColor('#FDDA0D')
                        .setTitle(`Stats for ${messages.first().content}`)
                        .setDescription('For the past 5 games.')
                        // .setAuthor({ name: 'Valorant Bot', iconURL: `https://cdn.discordapp.com/avatars/${avatarURL.botID}/${avatarURL.avatarURL}.png` })
                        .addFields(
                            { name: 'Your username has now been updated to: ', value: `${messages.first().content}` }
                        )
                        .setTimestamp()
                    // .setFooter({ text: 'Some footer text here', iconURL: `https://cdn.discordapp.com/avatars/${avatarURL.botID}/${avatarURL.avatarURL}.png` });
                    interaction.followUp({ embeds: [exampleEmbed] });
                  
                    // interaction.followUp(`User's Information (Past 5 Games): \n\nRank: ${userInfo.tier} \nWinrate: ${userInfo.wr} \nKDA: ${userInfo.kda}`);

                }).catch((error) => {
                    console.log(`There was an error with fetch. ${error}`);
                })
        })
            .catch(() => {
                interaction.followUp('You did not enter any input!');
            });
    }
}

