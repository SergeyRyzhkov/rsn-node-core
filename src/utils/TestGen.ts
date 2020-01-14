import * as fs from 'fs';


const path = 'src/entities/legalEntity';

const files: string[] = fs.readdirSync(path);

let importSt: string = '';

files.forEach((element) => {
  importSt = importSt + `import { ${element} } from './legalEntity/${element}'` + '\n';
});

importSt = importSt.replace('.ts', '');
const arr = `const entityModelMetadata = [${files.join(',')}]`.replace('.ts', '');

export { importSt, arr };


