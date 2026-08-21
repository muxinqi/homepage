import type { APIRoute } from "astro";
import { render } from "astro:content";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
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
      const html = await container.renderToString(Content);
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

  // An empty feed is still a valid feed. Readers that already subscribed keep
  // working, and the first note appears without anyone re-subscribing.
  const updated = notes.length > 0 ? notes[0].data.created : new Date(0);

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

  return new Response(feed, {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
  });
};
