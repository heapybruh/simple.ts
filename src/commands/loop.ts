import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
} from "npm:discord.js"
import { Discord, Slash, SlashChoice, SlashOption } from "npm:discordx"
import { bot, color } from "../index.ts"
import process from "node:process"

enum LoopMode {
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
    @SlashChoice({ name: "Current Track", value: LoopMode.CURRENT_TRACK })
    @SlashChoice({ name: "Queue", value: LoopMode.QUEUE })
    @SlashChoice({ name: "Disabled", value: LoopMode.DISABLED })
    @SlashOption({
      name: "mode",
      description: "Select loop mode",
      required: true,
      type: ApplicationCommandOptionType.Number,
    })
    mode: number,
    interaction: CommandInteraction
  ): Promise<void> {
    if (bot.moon.nodes.cache.get("socket")) {
      await interaction.reply({
        content: "Not connected to NodeLink",
        ephemeral: true,
      })

      return
    }

    await interaction.deferReply()

    const player = bot.moon.players.get(interaction.guildId!)

    if (!player) {
      await interaction.editReply({
        content: "Not connected to a voice channel",
      })

      return
    }

    let modeName

    switch (mode) {
      case LoopMode.CURRENT_TRACK:
        player.setLoop("track")
        modeName = "Current Track :notes:"
        break
      case LoopMode.QUEUE:
        player.setLoop("queue")
        modeName = "Queue :notepad_spiral:"
        break
      case LoopMode.DISABLED:
        player.setLoop("off")
        modeName = "Disabled :red_circle:"
        break
    }

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: "Changed loop mode",
            iconURL: process.env.LOOP_PATH,
          })
          .setColor(color)
          .setDescription(`Successfully changed loop mode to: **${modeName}**`)
          .setFooter({
            text: process.env.FOOTER_CONTENT!,
            iconURL: process.env.LOGO_PATH,
          })
          .setTimestamp(Date.now()),
      ],
    })
  }
}
