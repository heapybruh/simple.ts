import { Client, ClientOptions } from "discordx"
import { Manager } from "moonlink.js"

export class DiscordClient extends Client {
  moon: Manager

  constructor(options: ClientOptions, nodeManager: Manager) {
    super(options)
    this.moon = nodeManager
  }
}
