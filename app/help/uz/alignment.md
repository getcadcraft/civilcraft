---
title: Gorizontal trassani tuzish
summary: Trassani uning PI nuqtalari boʻyicha chizish, egri radiuslarini va boshlangʻich pikketni oʻrnatish, PI larni surish hamda egri maʼlumotlari va pikket va ofsetni oʻqish.
keywords: trassa, yechim yoʻq, egri sigʻmaydi, eng katta radius, eng kichik radius, minimal radius, loyihaviy tezlik, kesishish, oʻq chiziq, pi, gorizontal egri, radius, pikketlash, tangens, trassa yaratish, trassa joylashuvi, pc, pt, pikket ofset
from: 8c5df4aa
---

Loyihada trassa — bu kesishish nuqtalari (PI) orqali oʻtuvchi tangenslar zanjiri, har bir ichki PI da radiusi boʻlsa, aylana egri bilan. U siz tanlagan boshlangʻich pikketdan pikketlanadi. Loyihada bir nechta trassa boʻlishi mumkin.

## Trassani chizish

1. {{key:A}} tugmasini bosing yoki **Loyihalash** guruhidagi {{ui:Trassa}} ni bosing.
   Maslahatda yozilgan: "Trassa: PI larni ketma-ket bosing. Enter yoki ikki marta bosish yakunlaydi, Backspace oxirgisini olib tashlaydi, Esc bekor qiladi."
2. Birinchi PI ni bosing (trassaning boshlanishi).
3. Har bir keyingi PI ni tartib bilan bosing. Qizil chiziq koʻrsatkichni kuzatadi va chizayotgan tangensning uzunligi hamda yoʻnalishini koʻrsatadi, masalan "212.40 ft  N 63°12'05" E".
4. Oxirgi PI ni bosing (trassaning oxiri).
5. {{key:Enter}} tugmasini bosing.
   Trassa pikketlar bilan chiziladi va tanlanadi. Holat satrida masalan yoziladi: "Trassa 1: 386.36 ft, sigʻadigan joylarda radiusi 100 ft boʻlgan egrilar. Radiuslarni Xossalarda tahrirlang; Profil (R) bilan uning nishabligini loyihalang."

Chizish paytida: {{key:Backspace}} oxirgi PI ni olib tashlaydi, {{key:Esc}} bekor qiladi, boʻsh joyda sudrash esa PI qoʻshmasdan koʻrinishni suradi.

:::warning
{{key:Enter}} bilan yakunlang. Ikki marta bosish ham yakunlaydi, lekin bu versiyada ikki marta bosgan PI ni tashlab yuboradi. Oxirgi PI ni bir marta bosing, keyin {{key:Enter}} tugmasini bosing.
:::

Har bir ichki PI ga 100 ft (metrli loyihada 30 m) egri beriladi, yoki agar 100 ft sigʻmasa, har bir tangensning yarmiga sigʻadigan eng katta butun radius. Juda oʻtkir yoki toʻgʻri oʻtuvchi PI larga egri berilmaydi.

## Radiuslar va koordinatalarni oʻrnatish

Trassa tanlanganda oʻng panelda **Trassa** koʻrinadi:

1. **Nomi** va **Boshlangʻich pikket**. Pikketni `10+00` (fut) yoki `0+500` (metr) koʻrinishida yozing, yoki oddiy son sifatida. Qarang: [Birliklar, pikketlar va son formatlari](topic:units-and-stations).
2. **Uzunlik** va **Oxirgi pikket** siz uchun hisoblanadi.
3. **PI lar** jadvalida har bir PI ning **Sharqiy** va **Shimoliy** koordinatalari hamda har bir ichki PI uchun **Radius** koʻrsatiladi. Yangi qiymat yozing va {{key:Enter}} ni bosing.
   - Radius 0 boʻlsa, egrisiz burchak nuqtasi hosil boʻladi.
   - Birinchi va oxirgi PI hech qachon radiusga ega emas.
   - Satr oxiridagi kichik x shu PI ni olib tashlaydi (trassada kamida ikkita PI boʻladi).
4. **Egrilar** roʻyxatini oʻqing: har bir egri uchun uning PC va PT pikketlari, radius R, burilish Δ va yoʻnalish (chapga yoki oʻngga), uzunlik L, tangens T, tashqi E va vatar.
5. Egrilar ostidagi chiziq birinchi tangensning yoʻnalishini beradi.

## Egri sigʻmasa

Agar egrilar PI lar orasidagi tangensdan koʻproq joy talab qilsa, trassada yechim yoʻq: u tuzatilmagunicha toʻgʻri chizilmaydi va LandXML eksportidan chiqariladi. Qizil quti sababini raqamlarda aytadi va nima sigʻishini taklif qiladi:

- "PI 2 va PI 3 dagi egrilar ular orasida 240.00 ft tangens talab qiladi (130.00 + 110.00), lekin PI lar 180.00 ft uzoqlikda." — yoki faqat bittasida egri boʻlsa: "PI 2 dagi egri PI 1 tomonga 240.00 ft tangens talab qiladi …".
- Har bir PI uchun tugma shu yerda **sigʻadigan eng katta radiusni** oʻrnatadi, boshqa egri oʻz holicha qoladi (u PI ning boshqa tangensiga ham sigʻishi kerak). Ikkala PI da egri boʻlsa, **Ikkalasi** tugmasi ikki radiusni mutanosib kichraytiradi, toki ular aynan tutashsin.
- Bitta egri oʻzi tangensdan uzunroq boʻlsa, qutida boshqa PI da hech qanday egri shu kattalikda sigʻmasligi aytiladi.
- Orqaga keskin buriladigan PI ga egri berib boʻlmaydi; quti **n-PI da egri yoʻq** tugmasini taklif qiladi.

Har bir tugma bitta qadam: {{key:Mod+Z}} radiuslarni qaytaradi. Taklif qilingan radiuslar 0.01 gacha pastga yaxlitlanadi, shunda ular doim sigʻadi.

### Loyihaviy minimal radius

**Loyihaviy minimal radius** maydoniga radiusni yozing (masalan loyihaviy tezligingizdan) — har bir egri shu bilan tekshiriladi; boʻsh qoldiring — hech narsa tekshirilmaydi. Undan kichik egri roʻyxatda koʻrsatiladi, yonida **minimal talabga javob beradigan eng kichik radius** tugmasi bor, agar u sigʻsa. Sigʻmasa, quti buni aytadi va tangenslar ruxsat beradigan eng katta radiusni koʻrsatadi, shunda PI ni surishingiz yoki minimumni pasaytirishingiz kerakligini bilasiz.

## Planda PI larni surish

1. {{ui:Tanlash}} faol boʻlganda, uni tanlash uchun trassani bosing. Uning PI larida kvadrat tutqichlar paydo boʻladi.
2. Tutqichni torting. Trassa, uning pikketlari, profili va koridori ergashadi.
3. Qoʻyib yuboring. Surish bitta bekor qilish qadami boʻladi.

Ikki mavjud PI orasiga yangi PI qoʻshish hozircha mavjud emas: trassani oʻchirib, qayta chizing yoki mavjud PI lar uchun yangi koordinatalar yozing.

## Pikket va ofsetni oʻqish

Koʻrsatkichni planga olib boring. Holat satrida eng yaqin trassa (yoki tanlangani) pikket va ofset bilan koʻrsatiladi, **L** yoki **R** pikket yoʻnalishiga qarab, masalan "Trassa 1: Sta 2+15.30, ofset 18.42 R". Har ikki uchidan tashqarida "(uchidan tashqarida)" qoʻshiladi.

## Nimalar chizilgan

Planda, DXF da va PDF da: oʻq chiziq (tangenslar chiziq sifatida, egrilar haqiqiy yoylar sifatida), har 50 ft (20 m) da belgi, har 100 birlikda uzunroq belgi va pikket yozuvi, hamda PC va PT belgilari ularning pikketlari bilan.

## Trassani oʻchirish

Uni tanlang va {{key:Delete}} tugmasini bosing, yoki asboblar panelidagi yoki oʻng panel pastidagi {{ui:Oʻchirish}} tugmasini bosing. Uning profili va koridori u bilan birga ketadi. {{key:Mod+Z}} uni qaytaradi.

:::mac
Mac klaviaturasida "delete" deb belgilangan tugma brauzerda {{key:Backspace}} boʻlib, tanlovni oʻchirmaydi. {{key:Delete}} ni bosing (Fn va delete), yoki {{ui:Oʻchirish}} tugmasidan foydalaning.
:::

## Keyingisi

- [Vertikal profilni loyihalash](topic:profile).

## Loyihaviy tezlik va sinf

Trassaning Xossalari ostida **Loyihaviy tezlik** (km/soat yoki mil/soat) va **Loyihaviy sinf** trassa bilan birga saqlanadi, loyihada saqlanadi va IFC ga yoziladi (Pset_RoadDesignCriteriaCommon). CivilCraftda tezlikni minimal radius bilan bogʻlaydigan jadval yoʻq, shuning uchun ulardan hech narsa tekshirilmaydi: **Minimal radius** ni oʻz loyihaviy standartingizdan oʻrnating.

## Spirallar

Egri ikki uchidan birida klotoid spiral boʻlishi mumkin: tangens, spiral, egri, spiral, tangens. Radiusga ega PI uchun PI jadvalida **Kirish spirali** va **Chiqish spirali** ga uzunlik yozing. PI oʻz joyida qoladi; egri joy ochish uchun ichkariga siljiydi, shuning uchun tangens masofasi spiral ofsetiga oshadi. Ikki uzunlik farq qilishi mumkin, va faqat bitta uzunligi bor PI faqat oʻsha uchida spiral oladi.

Egri roʻyxati endi TS, SC, CS va ST ni (tangensdan spiralga, spiraldan egriga, egridan spiralga, spiraldan tangensga) spiral burchagi θs, tangens masofalari va tashqi masofa bilan koʻrsatadi. Pikketlar spirallar boʻylab xuddi boshqa joylardagi kabi oʻtadi. Birgalikda egridan koʻproq buriladigan spirallar PI nomi bilan rad etiladi; tangens ruxsat beradigandan uzunroq spiral esa boshqa egri kabi ustma-ust tushish sanaladi. Superelevatsiya spiralni oʻtish zonasi sifatida ishlatadi (qarang: [Koridor](topic:corridor)).
