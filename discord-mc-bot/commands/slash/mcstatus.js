const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ServerStatus } = require('@hardxploit/mc-status');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('mcstatus')
      .setDescription('Kiểm tra trạng thái server Minecraft đã lưu'),

   async execute(interaction, ctx) {
      const { mcHost, mcPort } = ctx;

      if (!mcHost) {
         return interaction.reply({
            content: '⚠️ Bạn chưa thiết lập server. Dùng lệnh `/setmc` trước.',
            ephemeral: true
         });
      }

      await interaction.deferReply(); // loading indicator

      try {
         const server = new ServerStatus('java', mcHost, mcPort);
         const status = await server.get();

         const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('🌐 Minecraft Server Status')
            .addFields(
               { name: 'IP', value: `\`${mcHost}:${mcPort}\`` },
               { name: 'Người chơi', value: `${status.players.online} / ${status.players.max}`, inline: true },
               { name: 'MOTD', value: status.motd.clean || 'Không có' }
            )
            .setTimestamp()
            .setFooter({ text: 'Dữ liệu từ mcstatus.io' });

         await interaction.editReply({ embeds: [embed] });
      } catch (err) {
         console.error(err);
         await interaction.editReply('❌ Không thể kết nối tới server Minecraft.');
      }
   }
};
