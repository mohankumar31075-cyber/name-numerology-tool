# Jyotish One — Birth Horoscope · Name Numerology · Panchang

A conversion-focused Vedic astrology product: a free, genuinely computed preview
for each report type, backed by a paid full-report flow (UPI / WhatsApp hand-off)
and lead capture in Supabase.

## What's inside

**Home (`/`)** — dark "cosmic" landing page with:

1. Three report cards (Birth Horoscope · Name Numerology · Daily Panchang)
2. Birth-details form (name, DOB, time, place, language, gender)
3. A real, instant free preview computed by the in-repo engines
4. "Unlock full report" checkout: contact details → coupon → UPI/WhatsApp
5. Other services grid linking to the existing tool pages

**Preview engines** (`src/lib/`)

| Report | Preview source | Full report source |
| --- | --- | --- |
| Numerology | `chaldean.ts` (Chaldean name/life-path numbers) | `premium.ts` |
| Horoscope | `horoscope.ts` + approximate nakshatra | `fullReport.ts` via hinducalendar MCP |
| Panchang | `panchang.ts` (rule-based) | `panchang-report` MCP, local fallback |

**Existing tools** keep working and are linked from the new home:
`/result`, `/horoscope`, `/panchang`, `/navagraha`, `/matchmaking`, `/consult`.

## API

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/leads` | POST | Validate a submission, recompute the preview server-side, store the lead in `report_orders` |
| `/api/report` | POST | `action: "quote"` → price + UPI/WhatsApp links; `action: "generate"` → full report once paid/free; `orderId` → order status |
| `/api/coupon/check` | POST | Guest-safe validation of a single coupon code |
| `/api/orders/[id]` | GET | Payment status for a customer's own order link |

## Database (Supabase)

Project: **jyotish-one** (`kqqemwmuhkahhakhjxxe`), tables in `public`:

- `report_orders` — one row per preview/order. Includes `report_type`, birth
  details, `language`, `gender`, `name_number`, `life_path`, `psychic_number`,
  `payment_status` (`preview` → `pending` → `paid`), `coupon_code`, `source`.
- `coupons` — `code`, `label`, `discount_percent`, `expires_at`, `active`.
  Create or deactivate codes directly in the table; the UI never lists them.

RLS is enabled on both tables with no public policies, so all access goes through
server routes using the service-role key.

## Environment variables

| Variable | Where | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel (plain) | `https://kqqemwmuhkahhakhjxxe.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Vercel (plain) | Fallback client key; safe to expose |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel (sensitive, server only) | Required to write leads/orders past RLS — never prefix with `NEXT_PUBLIC_` |
| `WHATSAPP_NUMBER` | optional | Digits with country code; defaults to `919008831075` |
| `UPI_ID` | optional | Enables the direct UPI payment button |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | optional | Existing `/api/razorpay/*` endpoints |

Without the Supabase variables the preview still works; leads are simply not
stored. Without `UPI_ID` the checkout hands off to WhatsApp for payment.

## Live

Production: <https://name-numerology-tool.vercel.app>
Pull-request previews deploy from `arena/5efb10f3-name-numerology-tool`.

## Local development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Notes

- Previews are rule-based and labelled as such; full reports require the Vedic
  chart engine and (for horoscope) a birth time.
- Traditional astrology content is for reflection and cultural interest — not
  medical, legal or financial advice.
