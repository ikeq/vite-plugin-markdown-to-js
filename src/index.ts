import { MarkedOptions } from 'marked';
import { PluginOption } from 'vite';
import { LangTransform, parse } from './parse';

interface Options {
  transforms: LangTransform[];
  render?: (output: ReturnType<typeof parse>, env: { path: string }) => string;
  markedOptions?: MarkedOptions;
}

export * from './transform';

export { parse };

export default function vitePluginMarkdownToJs(options: Options): PluginOption {
  const transforms = options.transforms || [];
  const render = options.render
    || ((output) => `export default ${JSON.stringify(output.html + output.style + output.script)};`);

  function markdownToJs(raw: string, id: string) {
    return render(parse(raw, transforms, options.markedOptions), { path: id });
  }

  return {
    name: 'vite-plugin-markdown-to-js',
    enforce: 'pre',
    transform(raw, id) {
      if (id.endsWith('.md')) {
        try {
          return markdownToJs(raw, id);
        } catch (e) {
          this.error(e);
        }
      }
    },
    async handleHotUpdate(ctx) {
      if (ctx.file.endsWith('.md')) {
        const defaultRead = ctx.read;
        ctx.read = async function () {
          return markdownToJs(await defaultRead(), ctx.file);
        }
      }
    },
  }
};
