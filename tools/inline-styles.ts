import { writeFileSync, readFileSync } from 'fs';

const libName: string = 'localization';

let resizable = readFileSync('lib/' + libName + '.component.ts').toString();
writeFileSync('lib/' + libName + '.component.ts.bak', resizable);

const styles = readFileSync('lib/' + libName + '.component.css');
resizable = resizable.replace(/styleUrls:\s*\[.*?\]/, `styles: [\`${styles}\`]`);

writeFileSync('lib/' + libName + '.component.ts', resizable);