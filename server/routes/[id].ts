import { satori } from 'v-satori'
import { html } from 'satori-html'
import sharp from 'sharp'
import Article from '@/components/OgImage/Article.vue'
import NotoSansJP from '@/assets/server/NotoSansJP-Light.ttf'

import { createClient } from "microcms-js-sdk"
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

export type Blog = {
  title?: string;
  content?: string;
};


export default defineEventHandler(async (event) => {
  const id: string | undefined = getRouterParam(event, 'id')

  if (id == undefined) {
    return;
  }

  const config = useRuntimeConfig(event)
  const client = createClient({
    apiKey: config.apiKey,
    serviceDomain: config.serviceDomain,
  })

  const data = await client.getListDetail<Blog>({
    endpoint: "blogs",
    contentId: String(id),
  })

  const title = data.title ?? ''
  const png = await generateImageWithTitle(title)

  const s3 = new S3Client({
    region: 'auto',
    endpoint: config.r2Endpoint,
    credentials: {
      accessKeyId: config.r2AccessKeyId,
      secretAccessKey: config.r2AccessKeySecret,
    }
  })

  const fileName = `${id}/og-image.png`
  await sendImage(s3, fileName, png)
})

const sendImage = async (client: S3Client, fileName: string, buffer: Buffer) => {
  const command = new PutObjectCommand({
    Bucket: 'oomori-ogp',
    Key: fileName,
    Body: buffer,
  })
  const res = await client.send(command)
  console.log(res)
}

const generateImageWithTitle = async (title: String): Promise<Buffer> => {
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

  return await sharp(Buffer.from(svg)).png().toBuffer()
}
