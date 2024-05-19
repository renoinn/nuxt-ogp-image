import { satori } from 'v-satori'
import { html } from 'satori-html'
import sharp from 'sharp'
import Article from '@/components/OgImage/Article.vue'
import NotoSansJP from '@/assets/server/NotoSansJP-Light.ttf'

import { createClient } from "microcms-js-sdk";

export type Blog = {
  title?: string;
  content?: string;
};

const { API_KEY, SERVICE_DOMAIN } = process.env;
const client = createClient({
  serviceDomain: String(SERVICE_DOMAIN),
  apiKey: String(API_KEY),
})

export default defineEventHandler(async (event) => {
  const id: string | undefined = getRouterParam(event, 'id')

  if (id == undefined) {
    return;
  }

  const data = await client.getListDetail<Blog>({
    endpoint: "blogs",
    contentId: String(id),
  })

  const title = data.title

  const svg = await satori(
    Article,
    {
      props: {
        title: title,
      },
      width: 1200,
      height: 600,
      fonts: [
        {
          name: 'NotoSansJP-Light',
          data: NotoSansJP,
          style: 'normal'
        }
      ]
    },
  )

  const png = await sharp(Buffer.from(svg)).png().toBuffer()

  setHeader(event, "Content-Type", `image/png`)
  setHeader(event, "Cache-Control", "public, max-age=604800")

  return png
})
