const fetch = require('node-fetch')

const sendMessage = (username, message, ws) => {
	let combinedMessage
	if (
		!username.includes('Discord') &&
		!message.includes('@everyone') &&
		!message.includes('@here') &&
		!username.includes('me]')
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
		const body = {
			username: 'LS Chat Bot',
			avatar_url: '',
			content: combinedMessage,
		}

		fetch(
			'https://discord.com/api/webhooks/831409823950176257/TRfDzVn6NU7ITAzXvClL2eo4uMHop0kifWUoNEb4Q7zWsdLtR6mKHdt1gXOlE8mod0pt',
			{
				method: 'post',
				body: JSON.stringify(body),
				headers: { 'Content-Type': 'application/json' },
			}
		).catch(err => console.log(err))
	}
}

module.exports = sendMessage
