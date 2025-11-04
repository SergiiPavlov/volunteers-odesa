# Волонтерський фонд — Stage v2 (Next 14, «Швидкі цілі», «Оголошення», «Відгуки», фавікони/логотип)

## Що всередині
- Next 14 + TS + Tailwind + next-intl@3.
- Підключені плейсхолдери і реальні фавікони/логотип (з бандла).
- Новий розділ **Швидкі цілі** (головна) з прогрес-барами (дані з `content/active_campaigns.*.json`).
- **Оголошення**: `/[locale]/announcements` з формою і лістингом (API у памʼяті).
- **Відгуки**: `/[locale]/reviews` з формою і лістингом (API у памʼяті).
- Маніфест, robots, sitemap (простий заглушковий).

## Запуск
```bash
npm i
npm run dev
# http://localhost:3000 → редирект на /uk
```

## SEO / OG setup

- Оновіть `NEXT_PUBLIC_SITE_URL` у `.env.local`, щоб вказати продакшн-домен (наприклад, https://volunteers-odesa.vercel.app).
- Динамічна OG-картка генерується маршрутом `/opengraph-image` (без зображень у репозиторії). За потреби відредагуйте компонент `app/opengraph-image.tsx`.
- Після оновлення шаблону перезапустіть `npm run build`, щоб переконатися, що Next.js підхопив нові метадані.

## LiqPay sandbox

Додайте у `.env.local` (на основі `.env.local.example`) ключі для LiqPay sandbox:

```bash
LIQPAY_PUBLIC_KEY=... # тестовий public key
LIQPAY_PRIVATE_KEY=... # тестовий private key
```

У production-оточення значення задаються через секрети Vercel.

## Подальші кроки за DOCS v2
- Етап 3: підключення CMS (Sanity/Strapi), перенесення даних «Швидких цілей» і контенту.
- Етап 4: інтеграція платежів (LiqPay/WayForPay/PayPal) + сторінка «Дякуємо».
- Етап 6: антиспам (hCaptcha/Turnstile), email-нотифікації (Resend).

## Packaging fix
ZIP теперь содержит файлы проекта **без** вложенной папки-обёртки (root clean).
Если ранее видели папку вроде `volunteers-odesa-main/` внутри архива — это исправлено.

## Sanity CMS setup (Stage 3 — Step 1)

1. **Створіть Sanity-проєкт**
   - Зареєструйтесь на [sanity.io](https://www.sanity.io/) (free tier достатньо).
   - Встановіть CLI (одноразово): `npm install -g @sanity/cli` або використовуйте `npx`.
   - Запустіть ініціалізацію в корені репозиторію:
     ```bash
     npx sanity init --env .env.local
     ```
     Оберіть існуючий проєкт або створіть новий, dataset залиште `production` (можна створити іншу назву, але за замовчуванням README і конфіг очікують `production`).

2. **Оновіть локальне оточення**
   - Після ініціалізації Sanity CLI виведе `projectId`. Скопіюйте його у `.env.local` (на основі `.env.local.example`).
   - Якщо використовуєте інший dataset, замініть значення `SANITY_DATASET` у `.env.local`.
   - Згенеруйте токени у [Manage → API](https://www.sanity.io/manage) вашого проєкту:
     - `SANITY_READ_TOKEN` (Viewer, Read)
     - `SANITY_WRITE_TOKEN` (Editor, Read + Write)
   - **Не** додавайте реальні значення в git: лише локальний `.env.local`.

3. **Перевірте схеми**
   - Локально встановіть залежності для Studio: `npm install --save-dev sanity` (вже додано до `package.json`).
   - Запустіть Studio, щоб переконатися, що схеми підхопились:
     ```bash
     npx sanity dev
     ```
     В браузері має відобразитися Studio з документами `Quick Goal`, `Announcement`, `Review`.

4. **Додаткові ролі**
   - Для редакторів: надайте роль `Editor` (write) або створіть кастомну, якщо потрібно розділити права.
   - Для перегляду тільки читанням (наприклад, CI/preview) — роль `Viewer`.

Наступні кроки етапу 3 підключать ці схеми до Next.js API та UI. Поточний крок лише готує Studio та структуру даних.
