import crypto from 'node:crypto';
import NotoSansJP from '@/assets/server/NotoSansJP-Light.ttf';
import Article from '@/components/OgImage/Article.vue';
import sharp from 'sharp';
import { satori } from 'v-satori';

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

type WebhookBody = {
  service: string;
  api: string;
  id: string;
  type: string;
  contents: Contents | null;
};

type Contents = {
  old: ContentInfo | null;
  new: ContentInfo | null;
};

type ContentInfo = {
  id: string;
  status: Array<string>;
  draftKey: string | null;
  publishValue: {
    id: string;
    title: string;
  };
  draftValue: null;
};

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const signature = getRequestHeader(event, 'X-MICROCMS-Signature');
  const body = await readBody<WebhookBody>(event);

  if (validateSignature(signature, body, config.webhookSignature)) {
    setResponseStatus(event, 401);
    return;
  }

  const title = body.contents?.new?.publishValue.title ?? '';
  const png = await generateImageWithTitle(title);

  const s3 = new S3Client({
    region: 'auto',
    endpoint: config.r2Endpoint,
    credentials: {
      accessKeyId: config.r2AccessKeyId,
      secretAccessKey: config.r2AccessKeySecret,
    },
  });

  const id = body.contents?.new?.id;
  const fileName = `${id}/og-image.png`;
  await sendImage(s3, fileName, png);
});

const validateSignature = (
  signature: string,
  body: WebhookBody,
  webhookSignature: string,
): boolean => {
  const expectedSignature = crypto
    .createHmac('sha256', webhookSignature)
    .update(JSON.stringify(body))
    .digest('hex');

  if (
    !crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    )
  ) {
    console.log(`invalid signature ${signature}`);
    return false;
  }
  return true;
};

const sendImage = async (
  client: S3Client,
  fileName: string,
  buffer: Buffer,
) => {
  const command = new PutObjectCommand({
    Bucket: 'oomori-ogp',
    Key: fileName,
    Body: buffer,
    ContentType: 'image/png',
  });
  const res = await client.send(command);
  console.log(res);
};

const generateImageWithTitle = async (title: string): Promise<Buffer> => {
  const svg = await satori(Article, {
    props: {
      title: title,
    },
    width: 1200,
    height: 600,
    fonts: [
      {
        name: 'NotoSansJP-Light',
        data: NotoSansJP,
        style: 'normal',
      },
    ],
  });

  return await sharp(Buffer.from(svg)).png().toBuffer();
};
