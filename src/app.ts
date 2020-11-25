import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

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
      this.master = new MasterRouter(initService.ctService);
    }
  }

  // initialize server app
  const server = new Server();

  // configurate server app body parser
  server.app.use(bodyParser.json());
  server.app.use(bodyParser.urlencoded({
    extended: true
  }));

  // make server app use cors
  server.app.use(cors());
  
  // make server app handle any route starting with '/api'
  await server.configureRouter();
  server.app.use('/api', server.master.router);

  // make server app handle any error
  server.app.use((err: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
    // console.error(`Error ${err.statusCode || 500} at ${req.method} ${req.path}\n${err.message}`);
    console.error(err);
    res.status(err.statusCode || 500).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message
    });
  });

  // make server listen on some port
  ((port = process.env.APP_PORT || 5000) => {
    server.app.listen(
      port,
      () => {
        // here we go baby, let them now!!
        console.log(' ▄▄ •  ▄▄▄· ▄▄▄  ▄▄▄  ▪  .▄▄ ·        ▐ ▄ ');
        console.log('▐█ ▀ ▪▐█ ▀█ ▀▄ █·▀▄ █·██ ▐█ ▀. ▪     •█▌▐█');
        console.log('▄█ ▀█▄▄█▀▀█ ▐▀▀▄ ▐▀▀▄ ▐█·▄▀▀▀█▄ ▄█▀▄ ▐█▐▐▌');
        console.log('▐█▄▪▐█▐█ ▪▐▌▐█•█▌▐█•█▌▐█▌▐█▄▪▐█▐█▌.▐▌██▐█▌');
        console.log('·▀▀▀▀  ▀  ▀ .▀  ▀.▀  ▀▀▀▀ ▀▀▀▀  ▀█▄▀▪▀▀ █▪');
        console.log(`> Version: v${require('../package')?.version}`);
        console.log(`> Port: ${port}`);
        console.log('> Ready to handle requests!\n');
    });
  })();
})();