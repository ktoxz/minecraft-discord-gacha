module.exports = {
   name: 'setmc',
   description: 'Thiết lập server Minecraft: !setmc <host> [port]',
   execute(msg, args, ctx) {
      if (!args[1]) {
         return msg.reply('❗ Cú pháp đúng: `!setmc <host> [port]`');
      }
      const host = args[1];
      const port = args[2] ? parseInt(args[2]) : 25565;
      ctx.setServer(host, port);
      msg.reply(`✅ Đã lưu server Minecraft: \`${host}:${port}\``);
   }
};
