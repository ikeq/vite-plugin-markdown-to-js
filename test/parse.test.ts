import { parse } from '../src/parse';
import { transformImports } from '../src/transform/imports';
import { transformVue } from '../src/transform/vue';

const md = `
# title

asdasdasd

asdasdasdasd
`;

const mdWithMatter = `---
foo: bar
---

# title

asdasdasd

asdasdasdasd
`;

const mdWithImports = `
# title

\`\`\`imports
a, b, c
\`\`\`

asdasdasdasd
`;

const mdWithVue = `
# title

\`\`\`vue
<template>
<div>
<template>{{ name }}</template>
</div>
</template>
<script>
export default {
  name: 'test',
  data() {
    return {
      name: 'foo'
    }
  }
}
</script>
<style>
.test { color: red; }
</style>
\`\`\`

asdasdasdasd
`;

const mdWithImportsVue = `
# title

\`\`\`imports
a, b, c
\`\`\`

\`\`\`vue
<template>
<div>
<template>asd</template>
</div>
</template>
<script lang="ts">
export default { name: 'test' }
</script>
<style lang="less" scoped>
.test { color: red; }
</style>
\`\`\`

asdasdasdasd
`;

describe('parse', () => {
  it('basic', () => {
    expect(parse(md)).toMatchSnapshot();
  });

  it('with matter', () => {
    expect(parse(mdWithMatter)).toMatchSnapshot();
  });

  it('transform imports', () => {
    expect(parse(mdWithImports, [
      transformImports()
    ])).toMatchSnapshot();
  });

  it('transform vue', () => {
    expect(parse(mdWithVue, [
      transformVue()
    ])).toMatchSnapshot();
  });

  it('transform imports & vue & importsAsComponents:true', () => {
    expect(parse(mdWithImportsVue, [
      transformImports(),
      transformVue({ importsAsComponents: true })
    ])).toMatchSnapshot();
  });
});
