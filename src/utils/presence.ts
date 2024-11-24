import { ActivityType } from "npm:discord.js"
import { bot } from "../index.ts"

export class Presence {
  static async update(): Promise<void> {
    if (!bot || !bot?.user) return

    await bot.guilds.fetch()
    const serverCount = bot.guilds.cache.size

    bot.user.setPresence({
      status: "online",
      afk: false,
      activities: [
        {
          name: `${serverCount} ${serverCount == 1 ? "server" : "servers"}`,
          state: "Bot maintained by heapy",
          url: "https://github.com/heapybruh/simple.ts",
          type: ActivityType.Watching,
        },
      ],
    })
  }
}
