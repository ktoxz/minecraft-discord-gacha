const { SlashCommandBuilder } = require('discord.js');
const Rcon = require('rcon');
const fs = require('fs');
const path = require('path');

// ⚙️ Cấu hình RCON chung
const RCON_HOST = 'ktoxz.id.vn';
const RCON_PORT = 25575;
const RCON_PASSWORD = '123';

module.exports = {
   data: new SlashCommandBuilder()
      .setName('give')
      .setDescription('Tặng item cho người chơi Minecraft')
      .addStringOption(option =>
         option.setName('player')
            .setDescription('Tên người chơi đang online')
            .setRequired(true)
            .setAutocomplete(true))
      .addStringOption(option =>
         option.setName('item')
            .setDescription('Tên item (vd: minecraft:diamond)')
            .setRequired(true)
            .setAutocomplete(true))
      .addIntegerOption(option =>
         option.setName('amount')
            .setDescription('Số lượng')
            .setRequired(false)),

   // ✅ Thực thi lệnh /give
   async execute(interaction) {
      const player = interaction.options.getString('player');
      const item = interaction.options.getString('item');
      const amount = interaction.options.getInteger('amount') || 1;

      const rcon = new Rcon(RCON_HOST, RCON_PORT, RCON_PASSWORD);

      await interaction.deferReply();

      rcon.on('auth', () => {
         rcon.send(`give ${player} ${item} ${amount}`);
      });

      rcon.on('response', async (res) => {
         await interaction.editReply(`🎁 Đã gửi lệnh: \`give ${player} ${item} ${amount}\`\n📩 Phản hồi từ server: \`${res.trim()}\``);
         rcon.disconnect();
      });

      rcon.on('error', async (err) => {
         console.error('❌ Lỗi khi gửi RCON (give):', err);
         await interaction.editReply('❌ Không kết nối được tới RCON. Kiểm tra IP, port, password.');
      });

      rcon.connect();
   },

   // ✅ Autocomplete tên người chơi real-time
   async autocomplete(interaction) {
      const focused = interaction.options.getFocused();
      const focusedOption = interaction.options.getFocused(true);
      if (focusedOption.name === 'player') {
         const rcon = new Rcon(RCON_HOST, RCON_PORT, RCON_PASSWORD);

         return new Promise((resolve) => {
            rcon.on('auth', () => {
               rcon.send('list');
            });

            rcon.on('response', async (res) => {
               const match = res.match(/players online:\s*(.*)/i);
               if (match && match[1]) {
                  const players = match[1].split(',').map(p => p.trim()).filter(Boolean);
                  const filtered = players.filter(name =>
                     name.toLowerCase().startsWith(focused.toLowerCase())
                  );
                  await interaction.respond(filtered.map(name => ({ name, value: name })));
               } else {
                  await interaction.respond([]);
               }

               rcon.disconnect();
               resolve();
            });

            rcon.on('error', async (err) => {
               console.error('❌ Lỗi autocomplete RCON:', err);
               await interaction.respond([]);
               resolve();
            });

            rcon.connect();
         });
      }

      if (focusedOption.name === 'item') {
         // 🎯 Load từ file JSON
         const itemData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../static_data/minecraft_items.json')));
         const results = Object.entries(itemData)
            .filter(([id, name]) => id.includes(focused.toLowerCase()) || name.toLowerCase().includes(focused.toLowerCase()))
            .slice(0, 25)
            .map(([id, name]) => ({ name: `${id}`, value: `minecraft:${id}` }));

         await interaction.respond(results);
      }

   }
};
