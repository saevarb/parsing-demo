import P from "parsimmon";

export const parser = P.createLanguage({
  text: () =>
    P.regexp(/[^{}]+/)
      .desc("text")
      .map((text) => ({ type: "text", text })),
  tagName: () => P.regexp(/[^:{}]+/).desc("tagName"),
  tag: (r) =>
    P.seqMap(
      P.string("{").desc("tag open start"),
      r.tagName,
      r.prop
        .many()
        .or(P.succeed([]))
        .map((props) =>
          props.reduce((acc, prop) => ({ ...acc, [prop.key]: prop.value }), {}),
        ),
      P.string("}").desc("tag open end"),
      r.text,
      P.string("{").desc("tag close start"),
      P.string("/"),
      r.tagName,
      P.string("}").desc("tag close end"),
      (_start, tagName, props, _end, children) => ({
        type: "tag",
        tagName,
        props,
        children,
      }),
    ),
  prop: (r) =>
    P.seqMap(
      P.string(":").desc("prop start"),
      P.regexp(/[a-zA-Z]+/).desc("prop name"),
      P.string("="),
      P.regexp(/[^:{}]+/).desc("prop value"),
      (_start, key, _, value) => ({ key, value }),
    ),
  expr: (r) =>
    P.seqMap(P.alt(r.tag, r.text).atLeast(1), P.eof, (res, _) => res),
});
