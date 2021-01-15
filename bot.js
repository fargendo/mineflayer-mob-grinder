const mineflayer = require('mineflayer')
const autoeat = require('mineflayer-auto-eat')
const pm2 = require('pm2')

require('dotenv').config()

const connectToServer = () => {
	let options = {
		host: 'netheranarchy.org',
		port: 25565,
		username: process.env.MC_USER,
		password: process.env.MC_PASS,
		version: '1.16.4',
	}

	// connect bot to server
	let bot = mineflayer.createBot(options)

	bindEvents(bot)

	// Attempts to relog 60s after being called
	function relog() {
		console.log('Attempting to reconnect...')

		setTimeout(() => {
			pm2.restart('app', () => {})
		}, 60000)

		// bot.end()

		// setTimeout(() => {
		// 	bot = mineflayer.createBot(options)
		// 	bindEvents(bot)
		// }, 60000)
	}

	function bindEvents(bot) {
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
			relog()
		})

		// Once bot spawns, attack mobType every 626ms
		bot.ssonce('spawn', () => {
			console.log('bot spawned')

			// For Testing
			// bot.on('chat', function (username, message) {
			// 	if ((username = 'Fargendo')) {
			// 		if (message === 'quit') {
			// 			bot.end()
			// 		}
			// 	}
			// })

			setInterval(() => {
				// detect wither skeleton
				const skeletonFilter = e => e.mobType === 'Wither Skeleton'

				// detect enderman
				const endermanFilter = e =>
					e.position.y <= 178.5 && e.position.y >= 177 && e.mobType === 'Enderman'

				// Mob is either enderman or wither skeleton, only true for eman if in eman farm
				const mob = bot.nearestEntity(endermanFilter) || bot.nearestEntity(skeletonFilter)

				if (!mob) return

				// position of mob
				const pos = mob.position

				// attack mob
				bot.lookAt(pos, true, () => {
					bot.attack(mob)
				})
			}, 626)
		})
	}
}

module.exports = connectToServer
