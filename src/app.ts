import { create } from 'domain';
import dotenv from 'dotenv';
import express from 'express';

import dbConfigurator from './config/database/configurator';
import { UserModel } from './config/models/data/user/user.model';

import User from './config/models/data/user/user.schema';

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
      console.log('> \u001b[36mConnecting to database...\u001b[0m');
      
      await dbConfigurator.connectToDatabase();

      console.log('> Ready to handle requests!\n');
  });
})();