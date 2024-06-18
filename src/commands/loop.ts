import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js"
import { Discord, Slash, SlashChoice, SlashOption } from "discordx"
import { bot, color } from "../index.js"

enum LoopOption {
  CURRENT_TRACK,
  QUEUE,
  DISABLED,
}

@Discord()
export class Loop {
  @Slash({
    description: "Manages loop",
    name: "loop",
  })
  async loop(
    @SlashChoice({ name: "Current Track", value: LoopOption.CURRENT_TRACK })
    @SlashChoice({ name: "Queue", value: LoopOption.QUEUE })
    @SlashChoice({ name: "Disabled", value: LoopOption.DISABLED })
    @SlashOption({
      name: "option",
      description: "Select loop option",
      required: true,
      type: ApplicationCommandOptionType.Number,
    })
    option: number,
    interaction: CommandInteraction
  ) {
    if (!bot.moon.isConnected) {
      await interaction.reply({
        content: "Not connected to Lavalink server",
        ephemeral: true,
      })

      return
    }

    var player = bot.moon.players.get(interaction.guildId!)

    if (!player) {
      await interaction.reply({
        content: "Not connected to a voice channel",
        ephemeral: true,
      })

      return
    }

    var optionName

    switch (option) {
      case LoopOption.CURRENT_TRACK:
        player.setLoop("track")
        optionName = "Current Track"
        break
      case LoopOption.QUEUE:
        player.setLoop("queue")
        optionName = "Queue"
        break
      case LoopOption.DISABLED:
        player.setLoop("off")
        optionName = "Disabled"
        break
    }

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: "Changed loop mode",
            iconURL: process.env.LOOP_PATH,
          })
          .setColor(color)
          .setDescription(
            `Successfully changed loop mode to: **${optionName}**`
          )
          .setFooter({
            text: `@${interaction.user.username} used /loop`,
            iconURL: process.env.LOGO_PATH,
          })
          .setTimestamp(Date.now()),
      ],
    })
  }
}
