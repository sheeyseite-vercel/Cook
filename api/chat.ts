/**
 * دالة Vercel للمساعد الذكي. تخفي مفتاح الـ API عن المتصفح.
 * أضف ANTHROPIC_API_KEY في Project Settings > Environment Variables.
 */

const MODEL = 'claude-haiku-5-5';
const MAX_MESSAGES = 12;
const MAX_CHARS = 600;
const DAILY_LIMIT = 40; // عدد الرسائل لكل عنوان IP يومياً (حد تقريبي داخل الذاكرة)

const SYSTEM = `أنت "شيف نكهة"، مساعد طبخ ودود داخل تطبيق وصفات عربي.
- أجب بالعربية الفصحى المبسّطة، وبإيجاز (حتى 150 كلمة ما لم يُطلب أكثر).
- اهتم بالمطبخ الجزائري والمغاربي والعربي، واذكر المقادير والأوقات بوحدات واضحة.
- عند اقتراح وصفة اذكر المكوّنات والخطوات باختصار. وعند سؤال عن بديل مكوّن اذكر البديل ونسبته.
- نبّه إلى الحساسيات الشائعة وسلامة الغذاء عند الحاجة.
- إذا كان السؤال خارج الطبخ والغذاء، اعتذر بلطف ووجّه الحديث إلى الطبخ.`;

const hits = new Map<string, { day: string; n: number }>();

function allow(ip: string): boolean {
  const day = new Date().toISOString().slice(0, 10);
  const h = hits.get(ip);
  if (!h || h.day !== day) {
    hits.set(ip, { day, n: 1 });
    return true;
  }
  if (h.n >= DAILY_LIMIT) return false;
  h.n++;
  return true;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'الطريقة غير مسموحة' });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return res.status(503).json({ error: 'المساعد الذكي غير مفعّل بعد. أضف ANTHROPIC_API_KEY في إعدادات Vercel.' });
  }

  const ip = String(req.headers['x-forwarded-for'] ?? 'unknown').split(',')[0].trim();
  if (!allow(ip)) {
    return res.status(429).json({ error: 'وصلت إلى الحد اليومي للأسئلة. عُد غداً.' });
  }

  const raw = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const messages = raw
    .slice(-MAX_MESSAGES)
    .filter((m: any) => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string')
    .map((m: any) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

  // يجب أن تبدأ المحادثة برسالة من المستخدم
  while (messages.length && messages[0].role !== 'user') messages.shift();
  if (!messages.length) return res.status(400).json({ error: 'لا توجد رسالة' });

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model: MODEL, max_tokens: 700, system: SYSTEM, messages }),
    });
    const data: any = await r.json();
    if (!r.ok) {
      console.error('anthropic error', r.status, data?.error);
      return res.status(502).json({ error: 'تعذّر الاتصال بالمساعد. حاول لاحقاً.' });
    }
    const text = (data.content ?? []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n');
    return res.status(200).json({ text: text || 'لم أستطع الرد. أعد صياغة السؤال.' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'حدث خطأ غير متوقع.' });
  }
}
