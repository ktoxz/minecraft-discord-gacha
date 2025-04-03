const { SlashCommandBuilder } = require('discord.js');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('setmc')
      .setDescription('Thiết lập server Minecraft cần kiểm tra')
      .addStringOption(option =>
         option.setName('host')
            .setDescription('IP hoặc tên miền server Minecraft')
            .setRequired(true))
      .addIntegerOption(option =>
         option.setName('port')
            .setDescription('Cổng (port) server (mặc định là 25565)')
            .setRequired(false)),

   async execute(interaction, ctx) {
      const host = interaction.options.getString('host');
      const port = interaction.options.getInteger('port') || 25565;

      ctx.setServer(host, port);

      await interaction.reply(`✅ Đã lưu server Minecraft: \`${host}:${port}\``);
   }
};
