import camelCase from 'lodash/camelCase';
import { LangTransform } from "../parse";

const rSplit = /[\n\s,]/;
const rExt = /\.\w+$/;

/**
 * @example
 * ```md
 * ```imports
 * module1, module2, module3
 * module4
 * ```
 * ```
 */
export function transformImports({ base, defaultPrefix }: { base?: string; defaultPrefix?: string } = {}): LangTransform {
  if (base && !base.endsWith('/')) {
    base = `${base}/`;
  }
  return {
    lang: 'imports',
    transform(src) {
      const imports = [...new Set(src.split(rSplit).filter((i) => i))];
      const importNames = imports.map((i) => defaultPrefix ? camelCase(`${defaultPrefix} ${i}`) : i);

      return [
        {
          type: 'imports',
          imports: importNames,
          code: ''
        },
        {
          type: 'script',
          imports: importNames,
          code: imports.map((i, index) =>
            `import ${importNames[index]} from "${base || ''}${i}${rExt.test(i) ? '' : '.md'}";`).join('\n')
        }
      ];
    },
  };
};
