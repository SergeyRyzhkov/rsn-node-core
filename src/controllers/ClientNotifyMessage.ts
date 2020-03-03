export  class ClientNotifyMessage {

  public static createAlert (title: string, text: string) {
    return new ClientNotifyMessage(true, title, text);
  }

  public static createNotify (text: string) {
    return new ClientNotifyMessage(false, text, '');
  }

  public alert: boolean;
  public title: string;
  public text: string;

  constructor (alert: boolean, title: string, text: string) {
    this.alert = alert;
    this.title = title;
    this.text = text;
  }
}
