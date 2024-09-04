"use client";
import { useState, useMemo } from "react";
import { parser } from "~/parser";

export default function Home() {
  const [markup, setMarkup] = useState(
    "You are getting {ResourceDelta}+37{/ResourceDelta} {Link:type=resource:id=stone}Stone blocks{/Link} per day.",
  );

  const parseResult = useMemo(() => {
    const res = parser.expr.parse(markup);
    if (!res.status) {
      return undefined;
    }
    return res.value;
  }, [markup]);

  return (
    <main className="p-10">
      Enter your markup
      <input
        type="text"
        value={markup}
        className="w-full border border-black"
        onChange={(e) => setMarkup(e.target.value)}
      />
      {parseResult && (
        <Renderer
          parsed={parseResult}
          tags={{
            ResourceDelta: ResourceDelta,
            Link: MyLink,
          }}
        />
      )}
      {!parseResult && <span className="text-red-500">Invalid markup</span>}
    </main>
  );
}

export interface RendererProps {
  parsed: any;
  tags: Record<string, any>;
}

export function Renderer({ parsed, tags }: RendererProps) {
  if (Array.isArray(parsed)) {
    return parsed.map((item, i) => (
      <Renderer key={i} parsed={item} tags={tags} />
    ));
  }

  if (parsed.type === "text") {
    return <span>{parsed.text}</span>;
  }
  if (parsed.type === "tag") {
    const { tagName, props, children } = parsed;
    const Tag = tags[tagName];
    if (!Tag) {
      return <span className="text-red-500">Unknown tag {tagName}</span>;
    }
    return (
      <Tag {...props}>
        <Renderer parsed={children} tags={tags} />
      </Tag>
    );
  }
}

export interface ResourceDeltaProps {
  children: string;
}

export function ResourceDelta(props: ResourceDeltaProps) {
  const { children } = props;
  const cls = useMemo(() => {
    if (typeof children !== "object") {
      return "";
    }
    if (children.type === "text") {
      return children.text.startsWith("+") ? "text-green-500" : "text-red-500";
    }
  }, [children]);

  return <span className={cls}>{children}</span>;
}

export interface MyLinkProps {
  type: string;
  id: string;
}

export function MyLink(props: MyLinkProps) {
  const { type, id } = props;
  return (
    <a href="#" className="text-blue-500 underline">
      {type}-{id}
    </a>
  );
}
