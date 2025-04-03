const { SlashCommandBuilder } = require('discord.js');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('ping')
      .setDescription('Kiểm tra bot còn sống không'),
   async execute(interaction) {
      await interaction.reply('🏓 Pong (slash)!');
   },
};
