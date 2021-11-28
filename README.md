# vite-plugin-markdown-to-js [![npm](https://img.shields.io/npm/v/vite-plugin-markdown-to-js.svg)](https://npmjs.com/package/vite-plugin-markdown-to-js)

Markdown to script.

```js
// vite.config.js
import markdownToJs, { transformImports, transformVue } from 'vite-plugin-markdown-to-js';

export default {
  plugins: [
    markdownToJs({
      transforms: [
        transformImports({ defaultPrefix: 'demo', base: './' }),
        transformVue({
          importsAsComponents: true,
        }),
      ],
      render(output, env) {
        return [
          `<template><div>${output.html}</div></template>`,
          output.script,
          output.style
        ].join('\n');
      },
      markedOptions: {},
    }),
  ],
};
```

## License

MIT
