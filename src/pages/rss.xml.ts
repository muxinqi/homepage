import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getPosts } from "@lib/content";

export async function GET(context: APIContext) {
  const posts = await getPosts();

  return rss({
    title: "Xinqi Mu — Posts",
    description: "一些心得、踩过的坑，和我以后还想再找回来的结论。",
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.summary,
      pubDate: post.data.created,
      link: `/posts/${post.id}/`,
    })),
    customData: "<language>zh-cn</language>",
  });
}
