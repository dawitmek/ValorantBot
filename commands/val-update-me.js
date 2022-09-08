const { SlashCommandBuilder } = require('@discordjs/builders');
const lib = require('../get-puid.js');
const { MessageEmbed } = require('discord.js');
const objStorage = require('../storage.json');
const fs = require('node:fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('val-update-me')
        .setDescription('Update your existing username.')
        .addStringOption(option =>
            option.setName('set user')
                .setDescription('Set username to bot.')
                .setRequired(true)),
    async execute(interaction) {
        // prompts for username then returns rank, kd and winrate
        console.log(interaction);
        // lib.getPuid()

    }
}

