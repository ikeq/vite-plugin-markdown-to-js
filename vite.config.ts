import { defineConfig } from 'vite';
import { omit } from 'lodash';
import pkg from './package.json';
import { readFileSync } from 'fs';
import { join } from 'path';

export default defineConfig({
  plugins: [
    {
      name: 'doc',
      buildEnd() {
        this.emitFile({
          type: 'asset',
          fileName: 'package.json',
          source: JSON.stringify(omit(pkg, ['devDependencies', 'scripts']), null, 2),
        });

        this.emitFile({
          type: 'asset',
          fileName: 'README.md',
          source: readFileSync(join(__dirname, 'README.md')),
        });
      },
    },
  ],
  build: {
    minify: false,
    emptyOutDir: true,
    lib: {
      fileName: 'index',
      entry: 'src/index.ts',
      formats: ['cjs', 'es'],
    },
    rollupOptions: {
      external: Object.keys(pkg.dependencies),
    },
  },
});
