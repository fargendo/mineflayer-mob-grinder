const restart = require('../actions/restart')
const sendChat = require('../chat/sendChat')
const stop = require('../actions/stop')

const handleMessage = (data, bot, ws) => {
	const payload = JSON.parse(data)
	const type = payload.type

	if (type == 'na_chat') {
		const chatMessage = payload.message
		sendChat(bot, chatMessage)
	} else if (type === 'status') {
		let onlineAccounts = []
		//console.log(bot.players)
		if (bot.players[process.env.BOT_ONE]) {
			onlineAccounts.push(process.env.BOT_ONE)
		}
		if (bot.players[process.env.BOT_TWO]) {
			onlineAccounts.push(process.env.BOT_TWO)
		}
		if (bot.players[process.env.BOT_THREE]) {
			onlineAccounts.push(process.env.BOT_THREE)
		}
		if (bot.players[process.env.BOT_FOUR]) {
			onlineAccounts.push(process.env.BOT_FOUR)
		}
		const payloadOut = {
			activeBots: onlineAccounts,
			type: 'status_response',
		}

		console.log('online accounts: ' + onlineAccounts)
		ws.send(JSON.stringify(payloadOut))
	} else if (type === 'restart') {
		const payloadOut = {
			type: 'status',
		}
		ws.send(JSON.stringify(payloadOut))

		restart(payload.botName)
	} else if (type === 'player_check') {
		let playerName = payload.playerName
		let payloadOut = {}
		let players = bot.players
		//	console.log(bot.players)
		for (key in players) {
			if (key.toLowerCase() == playerName) {
				playerName = key
			}
		}
		console.log(playerName)
		console.log(bot.players[playerName])
		if (bot.players[playerName]) {
			const chat = '/ignore ' + playerName
			sendChat(bot, chat)
			payloadOut = {
				type: 'player_ignored',
				playerName: playerName,
			}
		} else {
			payloadOut = {
				type: 'player_not_ignored',
				playerName: playerName,
			}
		}
		ws.send(JSON.stringify(payloadOut))
	} else if (type === 'xp_level') {
		console.log('xp level')
		let botName = payload.botName
		let payloadOut = {}
		let players = bot.players
		let xp_level = 0
		//	console.log(bot.players)
		let onlineAccounts = []
		if (botName == process.env.PM2) {
			xp_level = bot.experience.level
			for (key in players) {
				if (key.toLowerCase() == botName) {
					botName = key
				}
			}
			payloadOut = {
				type: 'bot_xp',
				botName: botName,
				level: xp_level,
			}
			console.log(botName + ' is level ' + xp_level)
			ws.send(JSON.stringify(payloadOut))
		}
	} else {
	}
	// if (type === 'stop') {
	// 	stop(payload.botName)
	// }
}

module.exports = handleMessage
