import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';

import { initService } from './config/services/init.service';

import ErrorHandler from './config/models/error/error-handler.model';

import MasterRouter from './config/routers/master.router';

(async () => {
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
    public master = <MasterRouter>{};

    async configureRouter() {
      await initService.start();
      this.master = new MasterRouter(initService.controllerService);
    }
  }

  // initialize server app
  const server = new Server();

  // configurate server app body parser
  server.app.use(express.json());
  server.app.use(express.urlencoded({
    extended: true
  }));

  // make server app use cors
  server.app.use(cors());
  
  // make server app use morgan logging system with custom tokens
  morgan.token('angle-bracket', () => '>');
  morgan.token('timestamp', () => new Date().toISOString());
  server.app.use(
    morgan(':angle-bracket :timestamp :method :url :status :res[content-length] - :response-time ms')
  );
  
  // make server app handle any route starting with '/api'
  await server.configureRouter();
  server.app.use('/api', server.master.router);

  // make server app handle any error
  server.app.use((err: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    if (statusCode === 500) console.error(err.stack);
    else console.error(`↱ Error: "${err.message}"`);

    res.status(statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message
    });
  });

  // make server listen on some port
  (async (port = process.env.APP_PORT || 5000) => {
    server.app.listen(
      port,
      async () => {
        // console.log('  _____.__        _____   .___                 ');
        // console.log('_/ ____\\__| _____/ ____\\__| _/____   _____     ');
        // console.log('\\   __\\|  |/ __ \\   __\\/ __ |/  _ \\ /     \'   ');
        // console.log(' |  |  |  \\  ___/|  | / /_/ (  <_> )  Y Y  \\   ');
        // console.log(' |__|  |__|\\___  >__| \\____ |\\____/|__|_|  /   ');
        // console.log('               \\/          \\/            \\/    ');
        // console.log('                        .__  .__               ');
        // console.log('            ____   ____ |  | |__| ____   ____  ');
        // console.log('  ______   /  _ \\ /    \\|  | |  |/    \\_/ __ \\ ');
        // console.log(' /_____/  (  <_> )   |  \\  |_|  |   |  \\  ___/ ');
        // console.log('           \\____/|___|  /____/__|___|  /\\___  >');
        // console.log('                      \\/             \\/     \\/');

        // here we go baby, let them now!!
        console.log(' ▄▄ •  ▄▄▄· ▄▄▄  ▄▄▄  ▪  .▄▄ ·        ▐ ▄ ');
        console.log('▐█ ▀ ▪▐█ ▀█ ▀▄ █·▀▄ █·██ ▐█ ▀. ▪     •█▌▐█');
        console.log('▄█ ▀█▄▄█▀▀█ ▐▀▀▄ ▐▀▀▄ ▐█·▄▀▀▀█▄ ▄█▀▄ ▐█▐▐▌');
        console.log('▐█▄▪▐█▐█ ▪▐▌▐█•█▌▐█•█▌▐█▌▐█▄▪▐█▐█▌.▐▌██▐█▌');
        console.log('·▀▀▀▀  ▀  ▀ .▀  ▀.▀  ▀▀▀▀ ▀▀▀▀  ▀█▄▀▪▀▀ █▪');
        console.log(`> Version: v${require('../package')?.version}`);
        console.log(`> Port: ${port}`);
        console.log('> Ready to handle requests!');
    });
  })();
})();