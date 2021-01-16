const parseMessage = (username, message) => {
	let newMessage = message
	if (message.includes('@')) {
		newMessage = message.replace('@', '%')
	}
	if (message.includes('#')) {
		newMessage = message.replace('#', '%')
	}

	const data = {
		username,
		newMessage,
	}

	return data
}

module.exports = parseMessage
