const mineflayer = require('mineflayer')
const autoeat = require('mineflayer-auto-eat')
const pm2 = require('pm2')
const parseMessage = require('./parseMessage')
const sendToDiscord = require('./sendToDiscord')
const WebSocket = require('ws')
const sendChat = require('./sendChat')
const ws = new WebSocket('ws://localhost:9000')

require('dotenv').config()

const connectToServer = () => {
	const pm2Process = 'mister'
	let options = {
		host: 'anarchy.fit',
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
		const reconnectInterval = 3000

		ws.on('message', function incoming(data) {
			const message = JSON.parse(data)
			const chatMessage = message.message
			console.log(chatMessage)

			sendChat(bot, chatMessage)
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
				pm2.restart(pm2Process, () => {})
			}, 10000)
			// setTimeout(connectWS, reconnectInterval)
			// connectToServer.relog()
		})
	}

	// Attempts to relog 60s after being called
	function relog() {
		setTimeout(() => {
			console.log('Attempting to reconnect...')
			pm2.restart(pm2Process, () => {})
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
			if (err == undefined) {
				console.log('server closed, attempt reconnect in 2 minutes...')
				setTimeout(() => {
					console.log('Attempting to reconnect')
					pm2.restart(pm2Process, () => {})
				}, 60000 * 2)
			} else {
				relog()
			}
		})

		// Once bot spawns, attack mobType every 626ms
		bot.once('spawn', () => {
			let playersLength

			setInterval(() => {
				playersLength = Object.keys(bot.players).length
				console.log(playersLength)
				const body = {
					type: 'playersLength',
					playersLength: playersLength,
				}
				ws.send(JSON.stringify(body))
			}, 1000 * 30)

			console.log('bot spawned')
			console.log(playersLength)

			bot.on('chat', function (username, message) {
				sendToDiscord(username, message, ws)
			})

			setInterval(() => {
				// detect wither skeletonf
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
