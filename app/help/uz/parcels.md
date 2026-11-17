---
title: Uchastkalarni chizish va ularning huquqiy tavsifini yozish
summary: Uchastkani burchaklari boʻyicha chizing yoki shartnoma yoki kadastr planidagi chiziqlarni kiriting, chiziqlar qanchalik yopilishini tekshiring, rejada yoʻnalish va masofalarni belgilang, har qanday yoʻnalishni egri chiziqqa aylantiring va huquqiy tavsif qoralamasini nusxalang.
keywords: uchastkalar, lotlar, mulk chegaralari, chegara, shartnoma, kadastr, chiziqlar boʻyicha tavsif, yoʻnalish, masofa, yopilish, nomuvofiqlik, aniqlik, huquqiy tavsif, boshlangʻich nuqta, egri chiziq, radius, maydon, akr
from: 6793d6ce
---

Uchastkalar rejada har bir toʻgʻri yoʻnalish boʻyicha yoʻnalish va masofa bilan turadi (egri chiziq radiusini, uzunligini va markaziy burchagini koʻrsatadi), oʻrtasida esa nomi va maydoni. Ular PDF chop etishga va DWG va DXF eksportlariga kiradi, `V-PROP` (chiziqlar) va `V-PROP-TEXT` (yozuvlar) qatlamlarida. Hech narsa tanlanmagan boʻlsa, hammasi oʻng panelda **Uchastkalar** ostida turadi.

## Uchastkani chizish

1. **Uchastka chizish** ni bosing.
2. Burchaklarni bosing, boshlangʻich nuqtadan boshlab. Geodezik nuqtaga yaqin bosish shu nuqtaning aniq joyini oladi.
3. Tugatish uchun birinchi burchakni yana bosing yoki {{key:Enter}} ni bosing. {{key:Backspace}} oxirgi burchakni qaytaradi; {{key:Esc}} hozirgacha boʻlgan burchaklarni tashlaydi; asbobdan chiqish uchun uni yana bosing.

## Shartnomadan chiziqlarni kiritish

1. **Shartnoma chiziqlarini kiritish** ni bosing.
2. Chiziqlar qayerdan boshlanishini koʻrsating: geodezik nuqtaning raqami yoki shimoliy va sharqiy koordinatalar.
3. Chiziqlarni yozing yoki joylashtiring, har satrda bittadan:
   - chiziq: yoʻnalish va masofa, masalan `N 45°30'15" E 125.50`. `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` va azimutlar (`AZ 45°30'15"`) ham ishlaydi; "thence", vergul va "feet" soʻzlari eʼtiborga olinmaydi.
   - egri chiziq: `C R 300 L 52.36 right` (radius va yoy uzunligi), yoki `C R 300 D 10°00'00" left` (radius va markaziy burchak). Egri chiziq oldingi yoʻnalishdan keyin keladi; aks holda uning vatar yoʻnalishini qoʻshing: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` izoh satrini boshlaydi.
4. Yozganingizda dialog chiziqlar uzunligini, **nomuvofiqlikni** (boshlangʻichdan qancha uzoqlashishi va qaysi tomonga), **aniqlikni** (uzunlikning nomuvofiqlikka boʻlinmasi, masalan 1 : 10,000 va hokazo) va maydonni koʻrsatadi. Oʻqib boʻlmaydigan satrlar satr raqamlari bilan roʻyxatlanadi.
5. **Uchastkani qoʻshish**. Chiziqlar yopilmasa, uchastka boʻshliq boʻylab toʻgʻri yoʻnalish bilan yopiladi: chiziqlarni shartnoma bilan tekshiring. Dala poligonining xatosini uning yoʻnalishlari boʻylab taqsimlash uchun avval uni tuzating.

## Egri chiziqlar

Uchastkaning **Xususiyatlari** da har bir yoʻnalishda **Radius** bor. Uni yozsangiz, oʻsha yoʻnalish bir xil ikki burchak orqali egri chiziqqa aylanadi (burchaklar orasidagi masofaning yarmidan kichik radius yetmaydi va rad etiladi). **Egri chiziqlar** da **Oʻngga** yoki **Chapga** ni tanlang: oʻngga egri chiziqning markazi harakat yoʻnalishining oʻng tomonida boʻladi, shartnomadagidek. Uni yana toʻgʻri qilish uchun radiusni tozalang. Har bir oʻzgarish bitta qadam: {{key:Mod+Z}} uni bekor qiladi.

## Huquqiy tavsif

Uchastkaning Xususiyatlari oxirida uning huquqiy tavsifi turadi, chizmadan yozilgan:

- "Boshlanadi" — siz yozgan **Boshlangʻich nuqta** (masalan "4-lotning shimoli-sharqiy burchagi"), aks holda birinchi burchakning shimoliy va sharqiy koordinatalari yoki hisoblar boshlangan geodezik nuqta.
- "keyin" har bir yoʻnalish: yoʻnalish va masofa, yoki radius, yoy uzunligi, markaziy burchak va vatar yoʻnalishi hamda masofasi bilan egri chiziq.
- "Oʻz ichiga oladi" — maydoni kvadrat futlarda va akrlarda (metr loyihada kvadrat metrlarda va gektarlarda).

**Nusxalash** uni buferga qoʻyadi; **Matn sifatida yuklab olish** uni `.txt` fayl sifatida saqlaydi.

:::warning
Huquqiy tavsif chizmadan olingan qoralama, geodezik xulosa emas. Unga tayanishdan oldin litsenziyali geodezist uni yozuv bilan tekshirib, imzolashi kerak.
:::

Rejada uchastka ichini bosib uni tanlang; {{key:Delete}} uni oʻchiradi. Uchastkalar loyiha faylida saqlanadi.
