import marked, { MarkedOptions } from 'marked';
import parseMatter from 'gray-matter';

type CodeFn = (scripts: CodeBlock[], html: CodeBlock[]) => string;

export interface CodeBlock<T = string | CodeFn> {
  type: string;
  skipCompile?: true;
  code: T;
  attrs?: string;
  [name: string]: any;
}

export interface LangTransform {
  lang: string;
  tokenize?: (tokens: marked.TokensList) => marked.TokensList;
  transform: (code: string, md: string) => CodeBlock | CodeBlock[];
}

export function parse(raw: string, transforms?: LangTransform[], markedOptions?: MarkedOptions) {
  const { data: matter, content } = parseMatter(raw);
  const tokens = marked.lexer(content);
  const html: CodeBlock[] = [];
  const style: CodeBlock[] = [];
  const script: CodeBlock[] = [];
  // function type is delayed
  const scriptFn: CodeBlock<CodeFn>[] = [];

  transforms && transforms.forEach(tms => {
    if (tms.tokenize) {
      tms.tokenize(tokens);
    }
  });

  tokens.forEach(token => {
    if (token.type === 'space') return;
    if (token.type !== 'code' || !transforms) {
      html.push({ type: 'html', code: token.raw });
      return;
    }

    const transform = transforms.find(t => t.lang === token.lang);

    if (!transform) {
      html.push({ type: 'html', code: token.raw });
      return;
    }

    const transformed = transform.transform(token.text, token.raw);

    transformed.flat(2).forEach((td: CodeBlock) => {
      if (td.type !== 'script') {
        (td.type === 'style' ? style : html).push(td);
        return;
      }
      (typeof td.code === 'function' ? scriptFn : script).push(td);
    });
  });

  if (markedOptions) {
    marked.setOptions(markedOptions);
  }

  const getAttrs = (...args: CodeBlock[][]) => (args.flat(2).find(i => i.attrs) || {}).attrs || '';

  return {
    script: `<script${getAttrs(script, scriptFn)}>\n` + [
      ...script.map(i => i.code),
      ...scriptFn.map(i => i.code(script, html)),
      `export const matter = ${JSON.stringify(matter)};`
    ].join('\n') + `\n</script>`,

    // comes last so that it can be modified by script
    html: html.map(i => {
      if (!i.code) return '';
      if (i.skipCompile) return i.code;
      return marked(i.code as string);
    }).join(''),

    style: style.length ? `<style${getAttrs(style)}>\n${style.map(s => s.code).join('\n')}\n</style>` : undefined,
    matter,
  };
}
