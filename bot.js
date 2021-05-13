const mineflayer = require('mineflayer')
const pm2 = require('pm2')
require('dotenv').config()
const WebSocket = require('ws')

const ws = new WebSocket('ws://localhost:9000')

const connectToServer = () => {
	const pm2Process = process.env.PM2
	let options = {
		host: 'netheranarchy.org',
		port: 25565,
		username: process.env.MC_USER,
		password: process.env.MC_PASS,
		version: '1.16.5',
	}
	// connect bot to server
	const bot = mineflayer.createBot(options)
	bindEvents(bot)

	// Attempts to relog 60s after being called
	function relog(time = 60000, end = false) {
		console.log('relogging in ' + time + 'ms')
		if (end) {
			setTimeout(() => {
				console.log('Attempting to reconnect...')
				pm2.restart(pm2Process, () => {})
			}, time * 2)
		} else {
			setTimeout(() => {
				console.log('Attempting to reconnect...')
				pm2.restart(pm2Process, () => {})
			}, time)
		}
	}

	function bindEvents(bot) {
		function disconnect(time) {
			console.log('time: ' + time)
			bot.quit()
			relog(time)
		}
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
			console.log('Bot ended with error: ' + err)
			const payload = {
				type: 'bot_offline',
				name: bot.username,
			}
			ws.send(JSON.stringify(payload))
			relog(undefined, true)
		})

		// Once bot spawns, attack mobType every 626ms
		bot.once('spawn', () => {
			console.log('bot spawned')

			const payload = {
				type: 'bot_online',
				name: bot.username,
			}
			ws.send(JSON.stringify(payload))

			//Gold farm killswitch
			if (pm2Process === 'thejoyofgambling') {
				bot.on('whisper', function (username, message) {
					//console.log(jsonMsg)
					console.log(username)
					console.log(message)
					//relog(10000)
					if (message.includes('log')) {
						let words = message.split(' ')
						let minutes
						if ((minutes = parseInt(words[1]))) {
							if (minutes <= 360) {
								disconnect(60000 * minutes)
							}
						}
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
