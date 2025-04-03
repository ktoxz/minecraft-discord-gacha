const { ServerStatus } = require('@hardxploit/mc-status');
const { EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'mcstatus',
	description: 'Kiểm tra trạng thái server Minecraft đã lưu',
	async execute(msg, args, ctx) {
		const { mcHost, mcPort } = ctx;

		if (!mcHost) {
			return msg.reply('⚠️ Bạn chưa thiết lập server. Dùng `!setmc <host> [port]`');
		}

		// Gửi tin nhắn đang kiểm tra
		const checkingMessage = await msg.reply('⏳ Đang kiểm tra trạng thái server...');

		const server = new ServerStatus('java', mcHost, mcPort);
		try {
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
				.setFooter({ text: 'Thông tin được cập nhật' });

			await checkingMessage.edit({ content: null, embeds: [embed] });
		} catch (err) {
			console.error(err);
			await checkingMessage.edit('❌ Không thể kết nối tới server Minecraft.');
		}
	}
};
