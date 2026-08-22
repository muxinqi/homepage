import type { APIRoute } from "astro";
import { render } from "astro:content";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { fromHtml } from "hast-util-from-html";
import { toHtml } from "hast-util-to-html";
import { visit } from "unist-util-visit";
import { getNotes } from "@lib/content";
import { isoStamp } from "@lib/date";

/**
 * Atom rather than RSS, for three reasons that all matter here: its dates are
 * RFC 3339 (the same spelling as `<time datetime>`), `xml:lang` is native so a
 * Chinese note can declare itself, and `summary` and `content` are separate
 * fields rather than one overloaded `description`.
 *
 * Two invariants: an entry id never changes, even if its URL does, and `updated`
 * moves only when the text actually changed.
 */

/**
 * Root-relative URLs in entry content resolve against the feed document per RFC
 * 4287, but plenty of readers render the HTML without resolving anything and
 * show a dead link or a missing image.
 *
 * This walks the HTML tree rather than running a regex over the string, because
 * a regex cannot tell an attribute from text that looks like one: a note showing
 * `<a href="/projects/">` inside backticks had its example rewritten, so the feed
 * disagreed with the page about what the author had typed. Attributes only exist
 * on element nodes, so visiting elements cannot make that mistake.
 */
const URL_ATTRIBUTES = ["href", "src", "poster"] as const;

const toAbsolute = (value: string, site: URL) =>
  value.startsWith("/") && !value.startsWith("//") ? new URL(value, site).href : value;

function absolutise(html: string, site: URL): string {
  const tree = fromHtml(html, { fragment: true });

  visit(tree, "element", (node) => {
    const props = node.properties;
    if (!props) return;

    for (const attribute of URL_ATTRIBUTES) {
      const value = props[attribute];
      if (typeof value === "string") props[attribute] = toAbsolute(value, site);
    }

    // srcset is a comma-separated list of "url descriptor" candidates. hast
    // hands it back as a plain string; the array form is handled too, because
    // property-information can classify it either way depending on version.
    const srcSet = props.srcSet;
    const candidates =
      typeof srcSet === "string"
        ? srcSet.split(",")
        : Array.isArray(srcSet)
          ? srcSet.map(String)
          : undefined;

    if (candidates) {
      const rewritten = candidates
        .map((candidate) => {
          const [url, ...descriptor] = candidate.trim().split(/\s+/);
          return url ? [toAbsolute(url, site), ...descriptor].join(" ") : "";
        })
        .filter(Boolean);
      props.srcSet = typeof srcSet === "string" ? rewritten.join(", ") : rewritten;
    }
  });

  return toHtml(tree);
}

const escape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const GET: APIRoute = async (context) => {
  const site = context.site;
  if (!site) throw new Error("`site` must be set in astro.config.mjs to build the feed.");

  const notes = await getNotes();
  const container = await AstroContainer.create();

  const entries = await Promise.all(
    notes.map(async (note) => {
      const { Content } = await render(note);
      const html = absolutise(await container.renderToString(Content), site);
      const url = new URL(`/notes/${note.id}/`, site).href;
      const updated = note.data.updated ?? note.data.created;

      return [
        `  <entry xml:lang="${note.data.lang}">`,
        `    <title>${escape(note.data.title)}</title>`,
        `    <link rel="alternate" type="text/html" href="${escape(url)}"/>`,
        `    <id>tag:muxinqi.com,2026:note/${escape(note.id)}</id>`,
        `    <published>${isoStamp(note.data.created)}</published>`,
        `    <updated>${isoStamp(updated)}</updated>`,
        note.data.summary
          ? `    <summary>${escape(note.data.summary)}</summary>`
          : undefined,
        `    <content type="html">${escape(html)}</content>`,
        `  </entry>`,
      ]
        .filter(Boolean)
        .join("\n");
    }),
  );

  // The last time anything here changed — not the newest note's creation date.
  // A revision to an old note has to move this, or readers have no reason to
  // refetch. An empty feed is still a valid feed: subscribers keep working and
  // the first note appears without anyone re-subscribing.
  const updated = notes.reduce(
    (latest, note) => {
      const touched = note.data.updated ?? note.data.created;
      return touched > latest ? touched : latest;
    },
    new Date(0),
  );

  const feed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">
  <title>muxinqi — Notes</title>
  <subtitle>Short pieces on the decisions behind the things I build.</subtitle>
  <link rel="self" type="application/atom+xml" href="${new URL("/notes/feed.xml", site).href}"/>
  <link rel="alternate" type="text/html" href="${new URL("/notes/", site).href}"/>
  <id>tag:muxinqi.com,2026:notes</id>
  <updated>${isoStamp(updated)}</updated>
  <author><name>Xinqi Mu</name></author>
${entries.join("\n")}
</feed>
`;

  // A static build writes only the body to dist/, so these headers apply in
  // `astro dev` and nowhere else. What production actually sends is set in
  // public/_headers — change both together.
  return new Response(feed, {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
  });
};
