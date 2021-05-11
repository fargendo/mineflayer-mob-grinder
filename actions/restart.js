const pm2 = require('pm2')

const restart = botName => {
	if (botName === process.env.PM2) pm2.restart(process.env.PM2)
}

module.exports = restart
