require("dotenv/config");

const Discord = require("discord.js");
const { Client, Intents } = require("discord.js");
const { Configuration, OpenAIApi } = require("openai");

const client = new Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
  intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES],
});

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
const Cooldown = new Set();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
  const msg = message.content;
  if (message.author.bot) return;
  if (!msg.toLowerCase().startsWith("marv")) return;
  if (msg.split(" ").length > 2 && msg.length > 10) {
    if (!Cooldown.has(message.author.id)) {
      const response = await openai.createCompletion({
        model: "text-davinci-002",
        prompt: `Marv is a chatbot that reluctantly answers questions with sarcastic responses:\n\nYou: ${msg}`,
        temperature: 0.5,
        max_tokens: 60,
        top_p: 0.3,
        frequency_penalty: 0.5,
        presence_penalty: 0.0,
      });
      try {
        message.reply(
          response.data.choices[0].text
            .replace(/(\r\n|\n|\r)/gm, "")
            .replace("Marv:", "")
        );
      } catch {
        message.reply("Sorry, I didn't understand that.");
      }
    }
  }

  Cooldown.add(message.author.id);
  setTimeout(() => {
    Cooldown.delete(message.author.id);
  }, 5);
});

client.login(process.env.TOKEN);
