const pm2 = require('pm2')

const stop = botName => {
	console.log('Stopping process: ' + botName)
	if (botName === process.env.PM2) {
		pm2.stop(process.env.PM2)
	}
}

module.exports = stop
