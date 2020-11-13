import dotenv from 'dotenv';
import express from 'express';

import dbConfigurator from './config/database/configurator.database';

// load the environment variables from the .env file
dotenv.config({
  path: '.env'
});

/**
 * Express server application class.
 * @description Will later contain the routing system.
 */
class Server {
  public app = express();
}

// initialize server app
const server = new Server();

// make server listen on some port
((port = process.env.APP_PORT || 5000) => {
  server.app.listen(
    port,
    async () => {
      console.log(' ▄▄ •  ▄▄▄· ▄▄▄  ▄▄▄  ▪  .▄▄ ·        ▐ ▄ ');
      console.log('▐█ ▀ ▪▐█ ▀█ ▀▄ █·▀▄ █·██ ▐█ ▀. ▪     •█▌▐█');
      console.log('▄█ ▀█▄▄█▀▀█ ▐▀▀▄ ▐▀▀▄ ▐█·▄▀▀▀█▄ ▄█▀▄ ▐█▐▐▌');
      console.log('▐█▄▪▐█▐█ ▪▐▌▐█•█▌▐█•█▌▐█▌▐█▄▪▐█▐█▌.▐▌██▐█▌');
      console.log('·▀▀▀▀  ▀  ▀ .▀  ▀.▀  ▀▀▀▀ ▀▀▀▀  ▀█▄▀▪▀▀ █▪');
      console.log(`> Version: v${require('../package')?.version}`);
      console.log(`> Port: ${port}`);
      
      // connect to MongoDB Atlas database
      await dbConfigurator.connect();

      // insert database default static data
      await dbConfigurator.insertStaticData();
      
      // here we go baby, let them now!!
      console.log('> Ready to handle requests!\n');
  });
})();