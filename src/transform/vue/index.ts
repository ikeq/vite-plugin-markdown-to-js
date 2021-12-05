import kebabCase from 'lodash/kebabCase';
import { CodeBlock, LangTransform } from '../../parse';
import { parseSFC } from './sfc';


const defaultRenders: Record<'template' | 'script' | 'style', (code: string, meta: any, env: Parameters<LangTransform['transform']>[2]) => string> = {
  template: code => code.trim(),
  style: code => code.trim(),
  script: (code, { imports }) => {
    code = code.trim();
    if (!code) {
      return `export default { components: { ${imports || ''} } };`;
    }
    return code.replace('export default {', `export default {\n components: { ${imports || ''} },`);
  },
};

/**
 * @example
 * ```md
 * ```vue
 * <template>
 * </template>
 * <script>
 * export default {}
 * </script>
 * ```
 * ```
 */
export function transformVue(options: {
  importsAsComponents?: boolean | ((imports: string[]) => string);
  renders?: typeof defaultRenders
} = {}): LangTransform {
  return {
    lang: 'vue',
    tokenize(tokens) {
      if (!tokens.some((token) => token.type === 'code' && token.lang === 'vue')) {
        tokens.push({ type: 'code', lang: 'vue', text: '<script></script>', raw: '' });
      }

      return tokens;
    },
    transform(src, md, env) {
      const renders: typeof options.renders = {
        template: options.renders?.template || defaultRenders.template,
        style: options.renders?.style || defaultRenders.style,
        script: options.renders?.script || defaultRenders.script,
      };
      const blocks = parseSFC<'template' | 'script' | 'style'>(src);
      const ret: CodeBlock[] = [{
        type: 'html',
        code: md.replace('```vue', '```html'),
        transform: source => `<!-- langvue -->${source.replace(/^<pre>/, '<pre v-pre>')}<!-- endlangvue -->`,
      }];

      if (!blocks.length) return ret;

      const tags = blocks.reduce((map, i) => {
        return {
          ...map,
          [i.tag]: { ...i }
        };
      }, {} as Record<typeof blocks[0]['tag'], typeof blocks[0]>);

      if (!tags.script) {
        tags.script = {
          tag: 'script',
          code: '',
          attrs: '',
        };
      }
      if (!tags.template) {
        tags.template = {
          tag: 'template',
          code: '',
          attrs: '',
        };
      }
      if (!tags.style) {
        tags.style = {
          tag: 'style',
          code: '',
          attrs: '',
        };
      }

      Object.keys(tags).forEach((key) => {
        const tagName = key as keyof typeof tags;
        const block = tags[tagName];
        const renderer = renders[tagName];
        const code: CodeBlock['code'] = tagName === 'script' && options.importsAsComponents
          ? (scripts, html) => {
            const imports = scripts.map((i) => i.imports || []).flat(2);

            html.forEach((h) => {
              // consume imports block
              if (h.type === 'imports' && h.imports) {
                h.type = 'html';
                h.skipCompile = true;
                h.code =
                  typeof options.importsAsComponents === 'function'
                    ? options.importsAsComponents(h.imports)
                    : (h.imports.map((i: string) => `<${kebabCase(i)}/>`).join('') as string);
              }
            });

            return renderer(block.code, { imports }, env)
          }
          : renderer(block.code, {}, env);

        ret.unshift({ type: tagName, attrs: block.attrs, code, skipCompile: true });
      });

      return ret;
    },
  };
}
