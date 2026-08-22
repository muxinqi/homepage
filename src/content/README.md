# Writing content

Everything on the site comes from the Markdown files in this folder. There is no
CMS and no database — you edit a file, commit, and push.

> **A push to `main` deploys.** Cloudflare Workers Builds is connected to this
> repository from the dashboard side, so there is no CI file in the repo that
> would tell you this. Anything merged to `main` is public within a minute.

**The branch is the draft.** There is no `draft` flag: this repository is public,
so a file marked as a draft was already readable as Markdown on github.com the
moment it was pushed. The flag only ever closed one of the two doors, while
reading as though it had closed both.

So unfinished work lives on a branch. `npm run dev` renders it locally, and the
Cloudflare build for that branch gives it a preview URL. Merging to `main` is
what publishes — there is no second switch to forget.

Anything committed here is public the moment it is pushed, on any branch. That is
the rule to hold in your head; it was true before and the flag was hiding it.

**Never put an HTML comment (`<!-- … -->`) in a Markdown body.** It survives into
the built HTML. Frontmatter comments (`#`) are safe — they never reach output.

---

## Adding a note

Create `notes/some-slug.md`. The filename becomes the URL: `/notes/some-slug/`.

```markdown
---
title: Why the status sits next to the title
summary: Optional. A row without one is simply shorter.
created: 2026-08-21
updated: 2026-09-02   # optional; only when the text really changed
tags: []
lang: en              # or zh
---

Body starts at `##` — the page title is already the `h1`.
```

Write in whichever language you were thinking in and set `lang` to match. That
attribute drives the Chinese typesetting rules (line-height, `line-break`) and
the per-entry `xml:lang` in the Atom feed. There is no translation duty: an
English note and a Chinese note sit next to each other in the same list.

`updated` moves only when the text actually changed — feed readers use it to
decide whether to re-surface an entry.

## Adding a project

Create `projects/some-slug.md` → `/projects/some-slug/`.

```markdown
---
title: CoSplit
summary: One sentence. It is the list row and the page lede.
status: live          # active | live | offline
created: 2026-03-25
updated: 2026-08-18
closed: 2027-02-01    # offline only — when it stopped working
url: https://cosplit.net
repo: https://github.com/muxinqi/cosplit   # omit for a private repo
stack: React · Cloudflare Workers          # detail page only, never a list row
featured: true        # the homepage shows up to three featured projects
lang: en
---
```

The body is optional. A project page with a summary and a metadata table is a
complete page — better a short honest one than a padded one.

### Choosing a status

Two facts decide it, and neither of them is how you feel about the project:

| Status    | Means                                              |
| --------- | -------------------------------------------------- |
| `active`  | Usable, and you are still adding to it              |
| `live`    | Usable, but you have stopped changing it            |
| `offline` | No longer usable; the page stays as a record        |

`live` is where most finished things end up, and that is not a failure. An
`offline` row dims its whole line but keeps its links clickable.

## The Now block

`now/current.md` feeds the homepage's Now section. It shows the first two items;
the file allows up to four. With no file there the section disappears rather
than showing an empty box — Now is optional in a way Projects and Notes are not.

```markdown
---
updated: 2026-08-21
items:
  - label: Making
    text: One sentence.
  - label: Off screen
    text: One sentence.
---
```

The homepage prints `Updated Aug 2026` from that date. It is deliberately
absolute rather than "2 mo ago": the site is a static build, so a relative label
freezes at build time and quietly becomes wrong.

---

## Still waiting on you

Nothing invented was published, so these are the gaps that remain:

- [ ] **Project bodies.** CoSplit and Menu have real titles, summaries, dates,
      links and statuses, but no prose. Both detail pages currently end at the
      metadata table.
- [ ] **CoSplit vs Menu status.** CoSplit is marked `live` and Menu `active`,
      carried over from what you said earlier. Note that the `cosplit` repo was
      pushed to on 2026-08-18 and `menu` on 2026-07-01 — if CoSplit is still
      moving, flip the two words.
- [ ] **Dates.** `created` and `updated` come from the GitHub repositories'
      creation and last-push timestamps. Change them if the project started
      somewhere else.
- [ ] **The Now block.** There is no `now/` file, so the homepage renders no Now
      section at all. Write one from the template above when you want it.
- [ ] **Email.** The About page has no contact address. `hi@muxinqi.com` was
      never published because you have not said whether you want it public —
      worth deciding, since the site is going on a résumé.
- [ ] **Location.** About says `Ottawa, Canada`, taken from your public GitHub
      profile. Remove the row if you would rather not have it on the site.
- [ ] **The first note.** `notes/` is empty, so `/notes` and the homepage show
      their empty state — a designed component, not a fallback. Until then the
      build prints "collection … is empty" warnings; they are accurate and they
      go away with the first file.
