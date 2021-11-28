import { transformImports } from '../../src/transform/imports';

describe('transformImports', () => {
  it('basic', () => {
    const { transform } = transformImports();
    const raw = `a,a,b c \nd \nd`;
    expect(transform(raw, '```imports\na,b c \nd\n```', { matter: {} })).toMatchSnapshot();
  });

  it('basic', () => {
    const { transform } = transformImports({ base: 'path/to/path', defaultPrefix: 'module' });
    const raw = `a,b c \nd`;
    expect(transform(raw, '```imports\na,b c \nd\n```', { matter: {} })).toMatchSnapshot();
  });
});
