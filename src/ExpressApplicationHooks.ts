import { ExpressApplication } from './ExpressApplication';

export class ExpressApplicationHooks {

  public beforInitialize (rsnApplication: ExpressApplication): ExpressApplication {
    return rsnApplication;
  }

  public beforExpressAppInitialize (rsnApplication: ExpressApplication): ExpressApplication {
    return rsnApplication;
  }

  public afterExpressAppInitialize (rsnApplication: ExpressApplication): ExpressApplication {
    return rsnApplication;
  }

  public beforTypeOrmInitialize (rsnApplication: ExpressApplication): ExpressApplication {
    return rsnApplication;
  }

  public afterTypeOrmInitialize (rsnApplication: ExpressApplication): ExpressApplication {
    return rsnApplication;
  }

  public beforPassportInitialize (rsnApplication: ExpressApplication): ExpressApplication {
    return rsnApplication;
  }

  public afterPassportInitialize (rsnApplication: ExpressApplication): ExpressApplication {
    return rsnApplication;
  }

  public beforRoutingControllersInitialize (rsnApplication: ExpressApplication): ExpressApplication {
    return rsnApplication;
  }

  public afterRoutingControllersInitialize (rsnApplication: ExpressApplication): ExpressApplication {
    return rsnApplication;
  }

  public initialized (rsnApplication: ExpressApplication): ExpressApplication {
    return rsnApplication;
  }

  public beforListen (rsnApplication: ExpressApplication): ExpressApplication {
    return rsnApplication;
  }

  public afterListen (rsnApplication: ExpressApplication): ExpressApplication {
    return rsnApplication;
  }

  public onListenError (rsnApplication: ExpressApplication, error): ExpressApplication {
    return rsnApplication;
  }

  public onProcessStop (rsnApplication: ExpressApplication): ExpressApplication {
    return rsnApplication;
  }
}
