import { Client, ClientOptions } from "discordx"
import { MoonlinkManager } from "moonlink.js"

export class DiscordClient extends Client {
  moon: MoonlinkClient

  constructor(options: ClientOptions, nodeManager: MoonlinkClient) {
    super(options)
    this.moon = nodeManager
  }
}

export class MoonlinkClient extends MoonlinkManager {
  isConnected: boolean = false
}
