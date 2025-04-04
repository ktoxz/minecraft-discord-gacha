require('dotenv').config();
const fs = require('fs');
const path = require('path');
require('./db'); // Kết nối Mongo
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const connectToDatabase = require('./db');

connectToDatabase();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// === LOAD PREFIX COMMANDS ===
client.prefixCommands = new Collection();
const prefixPath = path.join(__dirname, 'commands/prefix');
const prefixFiles = fs.readdirSync(prefixPath).filter(file => file.endsWith('.js'));
for (const file of prefixFiles) {
  const command = require(path.join(prefixPath, file));
  client.prefixCommands.set(command.name, command);
}

// === LOAD SLASH COMMANDS ===
client.slashCommands = new Collection();
const slashPath = path.join(__dirname, 'commands/slash');
const slashFiles = fs.readdirSync(slashPath).filter(file => file.endsWith('.js'));
for (const file of slashFiles) {
  const command = require(path.join(slashPath, file));
  client.slashCommands.set(command.data.name, command);
}

// === GLOBAL STATE (tạm thời) ===
let mcHost = null;
let mcPort = 25565;

// === READY EVENT ===
client.once('ready', () => {
  console.log(`✅ Bot đã online với tên: ${client.user.tag}`);
});

// === PREFIX COMMAND HANDLER (!) ===
client.on('messageCreate', async (msg) => {
  if (msg.author.bot || !msg.content.startsWith('!')) return;

  const args = msg.content.slice(1).trim().split(/\s+/);
  const cmdName = args.shift().toLowerCase();
  const command = client.prefixCommands.get(cmdName);
  if (!command) return;

  try {
    await command.execute(msg, args, {
      mcHost,
      mcPort,
      setServer: (h, p) => {
        mcHost = h;
        mcPort = p;
      },
      client,
    });
  } catch (err) {
    console.error(err);
    msg.reply('❌ Có lỗi xảy ra khi xử lý lệnh.');
  }
});

// === SLASH COMMAND HANDLER (/) ===
client.on('interactionCreate', async (interaction) => {
  // === AUTOCOMPLETE ===
  if (interaction.isAutocomplete()) {
    const command = client.slashCommands.get(interaction.commandName);
    if (command && command.autocomplete) {
      try {
        await command.autocomplete(interaction);
      } catch (err) {
        console.error('❌ Lỗi trong autocomplete:', err);
      }
    }
    return;
  }

  // === SLASH COMMAND ===
  if (interaction.isChatInputCommand()) {
    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, {
        mcHost,
        mcPort,
        setServer: (h, p) => {
          mcHost = h;
          mcPort = p;
        },
        client,
      });
    } catch (err) {
      console.error('❌ Lỗi khi xử lý slash command:', err);
      // Nếu chưa reply thì reply, nếu đã reply thì log lỗi
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '❌ Lỗi khi xử lý lệnh.', ephemeral: true });
      } else {
        console.error('❌ Không thể reply vì interaction đã được trả lời trước đó.');
      }
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
