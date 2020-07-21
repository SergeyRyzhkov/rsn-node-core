import { ExpressApplication } from './ExpressApplication';
import { AppConfig } from './utils/Config';
import { fetchPromise } from './FetchPromise';

class ExampleApp {

  public async start () {

    const app: ExpressApplication = new ExpressApplication();


    await app.start();

    const domainName = 'baltros';
    const apiKey = '745263557ffc2116bca0667d327bbf2b';
    const uri = `http://${domainName}.intrumnet.com:81/sharedapi/stock/filter`;

    const body = `apikey=${apiKey}&params%5Btype%5D=1`

    const options = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    const ss = await fetchPromise.post(uri, options, body);


    try {
      const ss1 = await fetchPromise.post(`http://${domainName}uuuuu`, options, body);
    } catch (err) {
      const rr1 = ''
    }

    const rr13 = ''


  }
}

(async () => {
  new ExampleApp().start();
}
)()


