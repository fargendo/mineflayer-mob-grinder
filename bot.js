const mineflayer = require('mineflayer')
const pm2 = require('pm2')
require('dotenv').config()

const connectToServer = () => {
	const pm2Process = 'mister'
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
	function relog(time) {
		setTimeout(() => {
			console.log('Attempting to reconnect...')
			pm2.restart(pm2Process, () => {})
		}, time)
	}

	function bindEvents(bot) {
		// On close, relog
		bot.on('close', () => {
			console.log("Bot's connection to server has closed.")
			relog(60000)
		})

		// On error, relog
		bot.on('kicked', reason => {
			console.log('Bot kicked for reason: ' + reason)
			relog(60000)
		})

		// On kick, relog
		bot.on('end', err => {
			console.log('Bot ended with error: ' + err)
			if (err == undefined) {
				console.log('server closed, attempt reconnect in 2 minutes...')
				relog(60000 * 2)
			} else {
				relog(60000)
			}
		})

		// Once bot spawns, attack mobType every 626ms
		bot.once('spawn', () => {
			console.log('bot spawned')

			//Gold farm killswitch
			if (pm2Process === 'mister') {
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
