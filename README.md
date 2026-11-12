# Name Numerology Tool — Complete Mini-Product

A clean, conversion-focused **Chaldean name numerology checker** inspired by popular name-correction funnels.

## What you get

1. **Landing page** with hero + form (name, DOB, gender)
2. **Instant results page** showing:
   - Name Number (Chaldean)
   - Birth Number (from full DOB)
   - Psychic Number (birth day)
   - Compatibility score + status
   - Number meanings (planet + keywords)
   - Letter-by-letter breakdown
3. **Strong CTA** → WhatsApp deep-link with pre-filled message (ready for paid report)
4. **Print / Save** button (basic PDF-ready via browser print)

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Important: Customise before going live

### 1. WhatsApp number
Open `src/app/result/page.tsx` and change:

```ts
const whatsappNumber = "919999999999"; // ← your number with country code, no +
```

### 2. Branding
- Header logo text in `src/app/page.tsx`
- Colours in `tailwind.config.ts`
- Metadata in `src/app/layout.tsx`

## Project Structure

```
src/
  app/
    page.tsx          → Landing + form
    result/page.tsx   → Analysis results + CTA
    layout.tsx
    globals.css
  components/
    NameForm.tsx
    ScrollToTopButton.tsx
  lib/
    chaldean.ts       → Full calculation engine
```

Built as a ready-to-customise mini-product. Replace the placeholder brand and WhatsApp number, then ship.
