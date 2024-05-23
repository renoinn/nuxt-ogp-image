import crypto from 'crypto'
import { satori } from 'v-satori'
import sharp from 'sharp'
import Article from '@/components/OgImage/Article.vue'
import NotoSansJP from '@/assets/server/NotoSansJP-Light.ttf'

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

type WebhookBody = {
  service: string,
  api: string,
  id: string,
  type: string,
  contents: Contents | null,
}

type Contents = {
  old: ContentInfo | null,
  new: ContentInfo | null,
}

type ContentInfo = {
  id: string,
  status: Array<String>,
  draftKey: string | null,
  publishValue: {
    id: string,
    title: string
  },
  draftValue: null,
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const signature = getRequestHeader(event, 'X-MICROCMS-Signature')
  const body = await readBody<WebhookBody>(event)
  const expectedSignature = crypto.createHmac('sha256', config.webhookSignature).update(JSON.stringify(body)).digest('hex')

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    console.log(`invalid signature ${signature}`)
    setResponseStatus(event, 401)
    return
  }

  console.log(body.contents)

  const title = body.contents?.new?.publishValue.title ?? ''
  const png = await generateImageWithTitle(title)

  const s3 = new S3Client({
    region: 'auto',
    endpoint: config.r2Endpoint,
    credentials: {
      accessKeyId: config.r2AccessKeyId,
      secretAccessKey: config.r2AccessKeySecret,
    }
  })

  const id = body.contents?.new?.id
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
