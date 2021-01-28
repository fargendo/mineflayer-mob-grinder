module.exports = {
  apps : [{
    name: 'mister',
    script: 'app.js',
    watch: true,
	 ignore_watch: ['node_modules', 'package.json', 'package-lock.json', '.env', 'launcher_profiles.json', 'app.js', 'Readme.md']
  }],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
