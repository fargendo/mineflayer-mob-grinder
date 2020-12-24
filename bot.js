const mineflayer = require('mineflayer')
const autoeat = require('mineflayer-auto-eat')

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
		bot.end()

		console.log('Attempting to reconnect...')

		setTimeout(() => {
			bot = mineflayer.createBot(options)
			bindEvents(bot)
		}, 60000)
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

		// Once bot spawns, attack mobType (wither skeleton) every 1 second
		bot.once('spawn', () => {
			setInterval(() => {
				const mobFilter = e => e.mobType === 'Wither Skeleton'

				const mob = bot.nearestEntity(mobFilter)

				if (!mob) return

				const pos = mob.position
				bot.lookAt(pos, true, () => {
					bot.attack(mob)
				})
			}, 1000)
		})
	}
}

module.exports = connectToServer
