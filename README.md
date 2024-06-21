<div align="center">
 <h1>simple.ts</h1>
 <p>Simple and Easy-to-use Discord Bot written in TypeScript for music playback with multiple platform support.</p>
</div>

![YouTube is Supported](https://img.shields.io/badge/YouTube-Supported-Green?logo=youtube)
![SoundCloud is Supported](https://img.shields.io/badge/SoundCloud-Supported-Green?logo=soundcloud)
![Spotify is Supported](https://img.shields.io/badge/Spotify-Supported-Green?logo=spotify)

## Tested with Lavalink

- Version: `4.0.6 HEAD 8a8ff75`
- Plugins:
  - [LavaSrc](https://github.com/topi314/LavaSrc) `4.1.1`
  - [youtube-source](https://github.com/lavalink-devs/youtube-source) `1.3.0`

## Packages

- [@discordx/importer](https://www.npmjs.com/package/@discordx/importer)
- [@discordx/pagination](https://www.npmjs.com/package/@discordx/pagination)
- [chalk](https://www.npmjs.com/package/chalk)
- [cron](https://www.npmjs.com/package/cron)
- [discord.js](https://www.npmjs.com/package/discord.js)
- [discordx](https://www.npmjs.com/package/discordx)
- [genius-lyrics](https://www.npmjs.com/package/genius-lyrics)
- [moonlink.js (fork)](https://github.com/heapybruh/moonlink.js)

## Installation & Usage

1. Clone the repository.

```
$ git clone https://github.com/heapybruh/simple.ts
```

2. Go to [Discord Developer Portal](https://discord.com/developers/applications/) and create a Bot there.
3. Rename `.env.example` to `.env`.
4. Copy your Bot's token and paste it into `.env`.
5. Run commands below to install packages, compile and then start the Bot.

```
$ npm install
$ npm start build
$ npm start run
```
