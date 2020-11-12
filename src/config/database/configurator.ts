import mongoose from 'mongoose';

/**
 * Database configurator.
 */
class Configurator {
  /**
   * Connect the app to the default database.
   */
  async connectToDatabase() {
    try {
      await mongoose.connect(
        this._retrieveDatabaseURI(),
        {
          useNewUrlParser: true,
          useCreateIndex: true,
          useFindAndModify: false,
          useUnifiedTopology: true
        }
      );
      console.log('> \u001b[90mConnected to database\u001b[0m');
    } catch (err) {
      console.log('> \u001b[31mFailed to connect to database\u001b[0m');
      console.error(err);
    }
  }

  /**
   * Assembles the right database URI according to environment variables.
   */
  private _retrieveDatabaseURI() {
    if (!process.env.DB_URI || !process.env.DB_NAME || !process.env.DB_PASSWORD)
      throw new Error('Couldn\'t retrieve either database URI, user or password from .env file.')
  
    return process.env.DB_URI
      .replace('<password>', process.env.DB_PASSWORD)
      .replace('<dbname>', process.env.DB_NAME);

  }
}

export = new Configurator();