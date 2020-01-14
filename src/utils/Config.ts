import * as fs from 'fs';
import * as path from 'path';
// import { importSt, arr } from './TestGen';
const configDir = 'config';

const initConfig = () => {
  let config1;
  const fileName = process.env.NODE_ENV === 'development' ? 'dev.config.json' : 'prod.config.json';
  const filePath = path.resolve(configDir, fileName);
  if (fs.existsSync(filePath)) {
    const configContent = fs.readFileSync(filePath, 'utf8');
    config1 = JSON.parse(configContent);
  }

  //  const r = importSt;
  //  const g = arr;

  return config1;
};

const config = initConfig();

export default config;

