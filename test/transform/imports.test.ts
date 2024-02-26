import { transformImports } from '../../src/transform/imports';

describe('transformImports', () => {
  const env = { matter: {}, path: '' };

  it('basic', () => {
    const { transform } = transformImports();
    const raw = `a,a,b c \nd \nd`;
    expect(transform(raw, '```imports\na,b c \nd\n```', env)).toMatchSnapshot();
  });

  it('basic', () => {
    const { transform } = transformImports({ base: 'path/to/path', defaultPrefix: 'module' });
    const raw = `a,b c \nd`;
    expect(transform(raw, '```imports\na,b c \nd\n```', env)).toMatchSnapshot();
  });
});
