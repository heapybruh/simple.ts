import { Client, ClientOptions } from "npm:discordx"
import { Manager } from "npm:moonlink.js"

export class DiscordClient extends Client {
  moon: Manager

  constructor(options: ClientOptions, nodeManager: Manager) {
    super(options)
    this.moon = nodeManager
  }
}
