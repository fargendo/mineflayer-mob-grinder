const mineflayer = require('mineflayer')
const pm2 = require('pm2')
const sendToDiscord = require('./discord/sendToDiscord')
const WebSocket = require('ws')

const ws = new WebSocket('ws://localhost:9000')
const handlePayload = require('./ws/handlePayload')

require('dotenv').config()

const connectToServer = () => {
	let options = {
		host: 'anarchy.fit',
		port: 25565,
		username: process.env.MC_USER,
		password: process.env.MC_PASS,
		version: '1.16.4',
	}
	// connect bot to server
	const bot = mineflayer.createBot(options)
	bindEvents()
	connectWS()

	function connectWS() {
		ws.on('message', function incoming(data) {
			handlePayload(data, bot, ws)
			// const message = JSON.parse(data)

			// const chatMessage = message.message
			// console.log(chatMessage)

			// sendChat(bot, chatMessage)
		})
		ws.on('open', function open() {
			console.log('WS re/connected')
		})

		ws.on('error', function (err) {
			console.log('WS error: ' + err)
		})

		ws.on('close', function () {
			console.log('WS connection closed.')
			setTimeout(() => {
				console.log('Restarting pm2 process...')
				pm2.restart(process.env.PM2, () => {})
			}, 10000)
		})
	}

	// Attempts to relog 60s after being called
	function relog(time = 60000, end = false) {
		console.log('relogging in ' + time + 'ms')
		if (end) {
			setTimeout(() => {
				console.log('Attempting to reconnect...')
				pm2.restart(process.env.PM2, () => {})
			}, time * 2)
		} else {
			setTimeout(() => {
				console.log('Attempting to reconnect...')
				pm2.restart(process.env.PM2, () => {})
			}, time)
		}
	}

	function isPlayerOnline() {}

	function bindEvents() {
		// On close, relog
		bot.on('close', () => {
			console.log("Bot's connection to server has closed.")
			relog()
		})

		// On error, relog
		bot.on('kicked', reason => {
			console.log('Bot kicked for reason: ' + reason)
			relog()
		})

		// On kick, relog
		bot.on('end', err => {
			console.log(err)
			const payload = {
				type: 'bot_offline',
				name: bot.username,
			}
			ws.send(JSON.stringify(payload))
			relog(undefined, true)
		})

		// Once bot spawns, attack mobType every 626ms
		bot.once('spawn', () => {
			let playersLength
			const payload = {
				type: 'bot_online',
				name: bot.username,
			}
			ws.send(JSON.stringify(payload))

			// setInterval(() => {
			// 	playersLength = Object.keys(bot.players).length
			// 	console.log(playersLength)
			// 	const body = {
			// 		type: 'playersLength',
			// 		playersLength: playersLength,
			// 	}
			// 	ws.send(JSON.stringify(body))
			// }, 1000 * 30)

			console.log('bot spawned')

			// bot.on('chat', function (username, message) {
			// 	sendToDiscord(username, message, ws)
			// })

			//Gold farm killswitch
			if (process.env.PM2 === 'thejoyofgambling') {
				bot.on('whisper', function (username, message) {
					console.log(username, message)
					if (message.includes('log')) {
						let words = message.split(' ')
						const minutes = parseInt(words[1])
						relog(60000 * minutes)
					}
				})
			}
			//Check for and attack mobs
			setInterval(() => {
				const skeletonFilter = e => e.mobType === 'Wither Skeleton' // wither skull farm

				const endermanFilter = e =>
					e.position.y <= 188 && e.position.y >= 186 && e.mobType === 'Enderman' // eman farm

				const pigmanFilter = e => e.position.y <= 90 && e.mobType === 'Zombified Piglin' // gold farm

				const mob =
					bot.nearestEntity(endermanFilter) ||
					bot.nearestEntity(skeletonFilter) ||
					bot.nearestEntity(pigmanFilter)

				if (!mob) return

				const pos = mob.position
				// look at and attack mob
				bot.lookAt(pos, true, () => {
					bot.attack(mob)
				})
			}, 626)
		})
	}
}

module.exports = connectToServer
