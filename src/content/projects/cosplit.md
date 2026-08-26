---
title: CoSplit
summary: Splits a grocery receipt item by item, so everyone pays for what they actually took home.
status: active
created: 2026-03-25
updated: 2026-08-18
url: https://cosplit.net
stack: React · Cloudflare Workers · D1 · Gemini
featured: true
---

Every week a few of us drive to Costco and come back with one carload. Corn comes
by the dozen, a cake feeds six, and the vegetables come in bags nobody finishes
alone — so most of it gets shared, and not always by the same people.

Not all of us have a membership, so one person pays for the whole cart and the
rest pay them back. That is the hard part: one long receipt, with tax and
discounts on it, and every line shared by a different group.

CoSplit reads the receipt for you. You fix anything it got wrong, mark who had
what, and it works out what each person owes. Getting the last cent to add up
took a few tries. It started as a weekend project at uOttaHack 8, a student
hackathon in Ottawa, and I rewrote it on my own afterwards into something we
could rely on.

We still use it every week, and that is where the changes come from: a real
receipt turns up a problem, so I fix it. That is most of what is in the
[changelog](https://cosplit.net/changelog). It is open to anyone, and other
people turned out to have the same problem.
