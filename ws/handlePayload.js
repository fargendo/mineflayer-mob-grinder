const handleMessage = (data, bot, ws) => {
	const payload = JSON.parse(data)
	const type = payload.type

	if (type === 'xp_level') {
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
	}
}

module.exports = handleMessage
