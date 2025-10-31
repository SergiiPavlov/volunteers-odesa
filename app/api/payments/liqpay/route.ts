
import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * POST /api/payments/liqpay
 * Body: { amount:number, currency?: 'UAH', description?: string, orderId?: string, locale?: 'uk'|'en', resultUrl?: string }
 * Returns: { ok, actionUrl, data, signature } to be auto-submitted by client.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const amount = Number(body?.amount || 0);
    const currency = (body?.currency || 'UAH') as 'UAH';
    const description = String(body?.description || 'Пожертва до фонду');
    const orderId = String(body?.orderId || `order_${Date.now()}`);
    const locale = (body?.locale || 'uk') as 'uk'|'en';
    const origin = new URL(req.url).origin;

    const PUBLIC_KEY = process.env.LIQPAY_PUBLIC_KEY || '';
    const PRIVATE_KEY = process.env.LIQPAY_PRIVATE_KEY || '';
    const SANDBOX = process.env.LIQPAY_SANDBOX === '1' ? 1 : 0;

    if (!PUBLIC_KEY || !PRIVATE_KEY) {
      return NextResponse.json({ ok: false, error: 'LIQPAY_NOT_CONFIGURED' }, { status: 500 });
    }

    const result_url = body?.resultUrl || `${origin}/${locale}/donate/thank-you`;

    const payload = {
      public_key: PUBLIC_KEY,
      version: 3,
      action: 'pay',
      amount,
      currency,
      description,
      order_id: orderId,
      sandbox: SANDBOX,
      result_url
    };

    const json = JSON.stringify(payload);
    const data = Buffer.from(json).toString('base64');
    const signature = crypto.createHash('sha1')
      .update(PRIVATE_KEY + data + PRIVATE_KEY)
      .digest('base64');

    return NextResponse.json({ ok: true, actionUrl: 'https://www.liqpay.ua/api/3/checkout', data, signature });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'BAD_REQUEST' }, { status: 400 });
  }
}
