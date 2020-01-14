import { logger } from './utils/Logger';
import Application from './app';
import AppConfig from './utils/Config';

const app = new Application();
app.initialize().
  then((expressApp) => {
    const port = process.env.PORT || AppConfig.serverConfig.port;
    expressApp.listen(port);

    logger.info(`Server running on port ${port} in ${process.env.NODE_ENV}`);
    process.send('ready');

  }).
  catch((error) => {
    logger.error(error);
  });
