import { ModuleOptions } from '@/ConfigManager'

export class SmtpOptions extends ModuleOptions {
  host = "smtp.timeweb.ru";
  port = 25;
  from = "inbox@ekoset.ru";
  secure = false;
  pool = true;
  maxConnections = 1;
  maxMessages = 100;
  auth = {
    "user": "inbox@ekoset.ru",
    "pass": "xiUF7g7t"
  }
}