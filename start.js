var pm2 = require('pm2');

var pm2config = undefined;

try {
  pm2config = require('./pm2.json');
} catch(e) {
  pm2config = require('./pm2.example.json');
}

if (pm2config.apps) {
  pm2config = pm2config.apps[0];
}

pm2.connect(function(err) {
  if (err) {
    console.error(err);
    process.exit(2);
  }

  pm2.start(pm2config, function(err, apps) {
    pm2.disconnect();   // Disconnect from PM2
    if (err) {
      throw err
    } else {
      console.log('Do has been started via PM2!');
    }
  });
});
