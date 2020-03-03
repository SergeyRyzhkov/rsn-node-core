import * as fs from 'fs';
import * as path from 'path';

const configDir = 'config';

const initConfig = () => {
  let configJson: any;
  const fileName = process.env.NODE_ENV === 'development' ? 'dev.config.json' : 'prod.config.json';
  const filePath = path.resolve(configDir, fileName);
  if (fs.existsSync(filePath)) {
    const configContent = fs.readFileSync(filePath, 'utf8');
    configJson = JSON.parse(configContent);
  }
  return configJson;
};

export const AppConfig = initConfig();


