import type { APIRoute } from "astro";
import { getNotes } from "@lib/content";
import { isoStamp } from "@lib/date";

/**
 * Atom rather than RSS, for three reasons that all matter here: its dates are
 * RFC 3339 (the same spelling as `<time datetime>`), `xml:lang` is native so a
 * Chinese note can declare itself, and `summary` is its own field rather than an
 * overloaded `description`.
 *
 * Two invariants: an entry id never changes, even if its URL does, and `updated`
 * moves only when the text actually changed.
 *
 * Entries carry no `<content>`. Inlining the rendered post cost three
 * dependencies, the container API and a tree walk to absolutise its URLs — more
 * than half this file — to save the reader one click. It also handed the piece to
 * a feed reader's own styles, and the typography is most of what this site is.
 * A title, a sentence and a link do the job; RFC 4287 §4.1.2 only requires a
 * summary when there *is* content, so omitting both on a note without one is
 * valid and simply makes that entry shorter, exactly as it is in the list.
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

  const entries = notes.map((note) => {
    const url = new URL(`/notes/${note.id}/`, site).href;
    const updated = note.data.updated ?? note.data.created;

    return [
      `  <entry xml:lang="${note.data.lang}">`,
      `    <title>${escape(note.data.title)}</title>`,
      `    <link rel="alternate" type="text/html" href="${escape(url)}"/>`,
      `    <id>tag:muxinqi.com,2026:note/${escape(note.id)}</id>`,
      `    <published>${isoStamp(note.data.created)}</published>`,
      `    <updated>${isoStamp(updated)}</updated>`,
      note.data.summary ? `    <summary>${escape(note.data.summary)}</summary>` : undefined,
      `  </entry>`,
    ]
      .filter(Boolean)
      .join("\n");
  });

  // The last time anything here changed — not the newest note's creation date.
  // A revision to an old note has to move this, or readers have no reason to
  // refetch. An empty feed is still a valid feed: subscribers keep working and
  // the first note appears without anyone re-subscribing.
  const updated = notes.reduce((latest, note) => {
    const touched = note.data.updated ?? note.data.created;
    return touched > latest ? touched : latest;
  }, new Date(0));

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
