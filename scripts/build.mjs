import { copyFile, mkdir } from 'node:fs/promises';
import { build } from 'esbuild';

await mkdir('dist', { recursive: true });
await Promise.all([
  ...['index.html', 'style.css', 'app.js', 'data.js', 'source-status.json', 'golf-handicap.json']
    .map(file => copyFile(file, 'dist/' + file)),
  copyFile('node_modules/three/LICENSE', 'dist/three-license.txt'),
  build({ entryPoints: ['scene.js'], bundle: true, minify: true, format: 'esm', outfile: 'dist/scene.bundle.js' })
]);
