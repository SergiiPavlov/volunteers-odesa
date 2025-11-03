import crypto from 'node:crypto';
import {NextResponse} from 'next/server';
import {z} from 'zod';

const BodySchema = z
  .object({
    amount: z.number().min(10),
    isPublic: z.boolean(),
    name: z.string().optional(),
    locale: z.enum(['uk', 'en']),
  })
  .superRefine((value, ctx) => {
    if (value.isPublic) {
      const name = value.name?.trim() ?? '';
      if (!name) {
        ctx.addIssue({code: z.ZodIssueCode.custom, message: 'Name is required', path: ['name']});
      } else if (name.length > 60) {
        ctx.addIssue({code: z.ZodIssueCode.custom, message: 'Name is too long', path: ['name']});
      }
    }
  });

const DESCRIPTIONS = {
  uk: 'Пожертва для Благодійного фонду «Волонтери Одеса»',
  en: 'Donation for Volunteers Odesa Charity Foundation',
} as const satisfies Record<'uk'|'en', string>;

const LIQPAY_VERSION = '3';

const CURRENCY = 'UAH';

function buildOrderId(locale: 'uk'|'en') {
  return `${locale}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = BodySchema.parse(json);

    const amount = Number(parsed.amount.toFixed(2));
    const origin = new URL(request.url).origin;
    const publicKey = process.env.LIQPAY_PUBLIC_KEY ?? '';
    const privateKey = process.env.LIQPAY_PRIVATE_KEY ?? '';

    const payload = {
      public_key: publicKey || '__LIQPAY_PUBLIC_KEY__',
      version: LIQPAY_VERSION,
      action: 'pay',
      amount,
      currency: CURRENCY,
      description: DESCRIPTIONS[parsed.locale],
      order_id: buildOrderId(parsed.locale),
      result_url: `${origin}/${parsed.locale}/donate/thank-you`,
      server_url: `${origin}/api/payments/liqpay/callback`,
      language: parsed.locale,
      sandbox: 1,
      metadata: {
        isPublic: parsed.isPublic,
        name: parsed.isPublic ? parsed.name?.trim() : undefined,
      },
    } satisfies Record<string, unknown>;

    const data = Buffer.from(JSON.stringify(payload)).toString('base64');

    let signature: string | undefined;
    if (publicKey && privateKey) {
      signature = crypto.createHmac('sha1', privateKey).update(`${data}${privateKey}`).digest('base64');
    }

    const payloadPreview = {
      ...payload,
      data,
      signature,
    };

    console.log('[payments/liqpay] preview', payloadPreview);

    return NextResponse.json({ok: true, payloadPreview});
  } catch (error) {
    console.error('[payments/liqpay] error', error);
    const message = error instanceof z.ZodError ? error.issues[0]?.message ?? 'Invalid payload' : 'Invalid payload';
    return NextResponse.json({ok: false, error: message}, {status: 400});
  }
}
