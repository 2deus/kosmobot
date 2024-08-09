# kosmobot

source code 4 kosmolit bot used in 629 discord . done with [discordjs](https://discord.js.org/) .

note: this repo uses [.env](https://www.npmjs.com/package/dotenv) 4 configuration . check the .env.example file 4 more information

# join the discord

https://discord.gg/qurEuscrnn

# how to launch:

NOTE:
**Node 18** version or above required 2 launch

docker commands should be launched in app folder

command 4 launching locally:

```
node src/index.js
```
note: i personally run the bot with [nodemon](https://www.npmjs.com/package/nodemon) 4 easy run-time edits . it restarts the bot automatically after any file is saved

with docker compose:

```
docker-compose build
docker-compose up -d
```

2 shut down

```
docker-compose down
```

How 2 get logs

```
docker-compose logs
```
