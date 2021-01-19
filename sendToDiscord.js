const fetch = require('node-fetch')

const sendMessage = (username, message, ws) => {
	let combinedMessage
	if (
		!username.includes('Discord') &&
		!message.includes('@everyone') &&
		!message.includes('@here')
	) {
		if (
			(username.startsWith('_') && username.endsWith('_')) ||
			(username.startsWith('__') && username.endsWith('__'))
		) {
			combinedMessage = `<**\\${username}**> ${message}`
		} else {
			combinedMessage = `<**${username}**> ${message}`
		}
		const body = {
			username: username,
			message: message,
			type: 'chat',
		}
		ws.send(JSON.stringify(body))
		// const body = {
		// 	username: 'NA Chat Bot',
		// 	avatar_url: '',
		// 	content: combinedMessage,
		// }

		// fetch(
		// 	'https://discordapp.com/api/webhooks/800076529257938975/COPdBWFXaUm-x_le42Xa5_skgl_K60D9ylKGSv6oOy-RdJtSq8cJtgDfWK4b0xCFrjt6',
		// 	{
		// 		method: 'post',
		// 		body: JSON.stringify(body),
		// 		headers: { 'Content-Type': 'application/json' },
		// 	}
		// ).catch(err => console.log(err))
	}
}

module.exports = sendMessage
