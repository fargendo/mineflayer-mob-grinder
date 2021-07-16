const mineflayer = require('mineflayer')
const pm2 = require('pm2')
require('dotenv').config()
const WebSocket = require('ws')

const ws = new WebSocket('ws://localhost:9000')
const handlePayload = require('./ws/handlePayload')

const connectToServer = () => {
	const pm2Process = process.env.PM2
	let options = {
		host: 'destroymc.net',
		port: 25565,
		username: process.env.MC_USER,
		password: process.env.MC_PASS,
		version: '1.16.4',
	}
	// connect bot to server
	const bot = mineflayer.createBot(options)
	bindEvents(bot)
	connectWS()

	function connectWS() {
		ws.on('message', function incoming(data) {
			handlePayload(data, bot, ws)
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

			setInterval(() => {
				//console.log(bot.entity.position.y)
				// detect wither skeletonf
				const skeletonFilter = e => e.mobType === 'Wither Skeleton'

				//const ignoreMobs = 'Drowned' && 'Phantom'

				const mobber = e =>
					e.kind === 'Hostile mobs' &&
					e.mobType !== 'Drowned' &&
					e.mobType !== 'Phantom' &&
					e.position.y <= 179 &&
					e.position.y >= 176

				const mob = bot.nearestEntity(mobber)

				// detect enderman
				const endermanFilter = e =>
					e.position.y <= 178.5 && e.position.y >= 177 && e.mobType === 'Enderman'

				// Mob is either enderman or wither skeleton, only true for eman if in eman farm
				//const mob = bot.nearestEntity(endermanFilter) || bot.nearestEntity(skeletonFilter)

				if (!mob) return

				console.log(mob.mobType)
				// position of mob
				const pos = mob.position

				// attack mob
				bot.lookAt(pos, true, () => {
					bot.attack(mob)
					console.log('sword swung')
				})
			}, 626)
		})
	}
}

module.exports = connectToServer
