const restart = require('../actions/restart')
const sendChat = require('../sendChat')
const stop = require('../actions/stop')

const handleMessage = (data, bot, ws) => {
	const payload = JSON.parse(data)
	const type = payload.type

	if (type == 'na_chat') {
		const chatMessage = payload.message
		sendChat(bot, chatMessage)
	}
	if (type === 'status') {
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
	}
	if (type === 'restart') {
		const payloadOut = {
			type: 'status',
		}
		ws.send(JSON.stringify(payloadOut))

		restart(payload.botName)
	}
	// if (type === 'stop') {
	// 	stop(payload.botName)
	// }
}

module.exports = handleMessage
