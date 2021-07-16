import { parseSFC } from '../../src/transform/vue/sfc';
import { transformVue } from '../../src/transform/vue';

const sfc = `
<template>
<div>
<template>asd</template>
</div>
</template>
<script>
export default { name: 'test' }
</script>
<style>
.test { color: red; }
</style>`;

const sfcWithAttrs = `
<template lang="html">
<div>
  <template
  a="1">asd</template>
</div>
</template>
<script lang="ts">
export default { name: 'test' }
</script>
<style lang="less" scoped>
.test { color: red; }
</style>`;

const sfcTemplateNesting = `
<template>
<div>
<template>
  <template>
    <template>asd</template>
  </template>
  <template>
    <template>asd</template>
  </template>
</template>
<template>
  <template>
    <template>asd</template>
  </template>
  <template>
    <template>asd</template>
  </template>
</template>
</div>
</template>
<style>
.test { color: red; }
</style>`;

const sfcMerging = `
<template foo>
<template>1</template>
</template>
<template bar>
<template>2</template>
</template>
<script lang="ts">
export const a = 1;
</script>
<script lang="js">
export default { name: 'test' };
</script>
<style lang="scss">
.test { color: red; }
</style>
<style lang="less">
.test { color: blue; }
</style>`;

const sfcSansScript = `
<template>
<div>
  <template>asd</template>
</div>
</template>
<style>
.test { color: red; }
</style>`;

describe('parseSFC', () => {
  it('basic', () => {
    expect(parseSFC(sfc)).toMatchSnapshot();
  });

  it('with attrs', () => {
    expect(parseSFC(sfcWithAttrs)).toMatchSnapshot();
  });

  it('template nesting', () => {
    expect(parseSFC(sfcTemplateNesting)).toMatchSnapshot();
  });

  it('merging', () => {
    expect(parseSFC(sfcMerging)).toMatchSnapshot();
  });
});

describe('transformVue', () => {
  it('basic', () => {
    const { transform } = transformVue();

    expect(transform(sfcMerging, '```vue\n```')).toMatchSnapshot();
  });

  it('sans script', () => {
    const { transform } = transformVue();

    expect(transform(sfcSansScript, '```vue\n```')).toMatchSnapshot();
  });

  it('importsAsComponents: true', () => {
    const { transform } = transformVue({ importsAsComponents: true });

    expect(transform(sfcMerging, '```vue\n```')).toMatchSnapshot();
  });

  it('importsAsComponents: Function', () => {
    const { transform } = transformVue({
      importsAsComponents(a) {
        return 'a'
      }
    });

    expect(transform(sfcMerging, '```vue\n```')).toMatchSnapshot();
  });
});
