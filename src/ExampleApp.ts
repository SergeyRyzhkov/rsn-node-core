import { ExpressApplication } from './ExpressApplication';
import { AppConfig } from './utils/Config';

class ExampleApp {

  public async start () {

    const app: ExpressApplication = new ExpressApplication();


    await app.start();

  }
}

(async () => {
  new ExampleApp().start();
}
)()


