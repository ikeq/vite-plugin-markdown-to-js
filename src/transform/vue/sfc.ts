const tagOpeningRe = /\<((?:[a-z]+)(?:-[a-z]+)?)\s?/;

function parseTag(content: string, tag: string) {
  const matcher = {
    openingRe: new RegExp(`\\<${tag}([\\s\\S]*?)\\>`),
    closingRe: new RegExp(`\\<\\/${tag}\\>`)
  };
  let remaining = content;
  let pointer = -1;
  let indics = [];
  let attrs = '';

  while (remaining) {
    const opening = matcher.openingRe.exec(remaining);
    // none matching of open tag
    if (pointer < 0) {
      // malformed
      if (!opening) return null;
      // opening
      pointer += 1;
      indics[0] = opening.index + opening[0].length;
      attrs = opening[1];

      remaining = remaining.slice(opening.index + opening[0].length);
      continue;
    }

    // nesting
    if (opening && !matcher.closingRe.test(remaining.slice(0, opening.index))) {
      pointer += 1;

      remaining = remaining.slice(opening.index + opening[0].length);
      continue;
    } else {
      const closing = matcher.closingRe.exec(remaining);
      // malformed
      if (!closing) return null;

      pointer -= 1;
      remaining = remaining.slice(closing.index + closing[0].length);

      // closing
      if (pointer === -1) {
        indics[1] = content.length - remaining.length - closing[0].length;
        break;
      }
    }
  }

  return {
    code: content.slice(...indics),
    tag,
    attrs,
    remaining
  };
}

export function parseSFC<T>(raw: string): { code: string; tag: string & T; attrs: string }[] {
  const fn = (raw: string, ret: any = []) => {
    const group = tagOpeningRe.exec(raw);
    if (!group || !group[1]) return [];

    const block = parseTag(raw, group[1] as any);
    if (block) {
      ret.push({
        tag: block.tag,
        code: block.code,
        attrs: block.attrs
      });
      if (block.remaining) {
        fn(block.remaining, ret);
      }
    }

    return ret;
  }
  const blocks = fn(raw) as ReturnType<typeof parseSFC>;

  // merging
  const ret: Record<string, any> = {};

  blocks.forEach((i) => {
    if (!ret[i.tag]) {
      const attrs = i.attrs.trim();
      ret[i.tag] = {
        tag: i.tag,
        attrs: attrs ? ` ${attrs}` : '',
        code: ''
      };
    }
    ret[i.tag].code = ret[i.tag].code + '\n' + i.code.trim();
  });

  return Object.values(ret);
}
