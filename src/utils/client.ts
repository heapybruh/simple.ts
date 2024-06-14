import { Client, ClientOptions } from "discordx"
import { MoonlinkManager } from "moonlink.js"

export class DiscordClient extends Client {
  moon: MoonlinkManager | undefined

  constructor(options: ClientOptions) {
    super(options)
  }
}
