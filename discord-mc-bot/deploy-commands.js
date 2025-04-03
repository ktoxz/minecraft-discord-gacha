require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandFiles = fs.readdirSync('./commands/slash').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
   const command = require(`./commands/slash/${file}`);
   commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
   try {
      console.log('🚀 Đang đăng ký slash commands...');
      console.log('Lệnh được đăng ký: ', commands)
      await rest.put(
         Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
         { body: commands },
      );
      console.log('✅ Slash commands đã được đăng ký!');
   } catch (error) {
      console.error(error);
   }
})();
