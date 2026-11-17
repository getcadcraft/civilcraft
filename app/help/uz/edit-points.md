---
title: Geodezik nuqtani tahrirlash
summary: Bitta nuqtaning raqamini, koordinatalarini, balandligini yoki tavsifini oʻzgartiring yoki uni rejadagi yangi joyga torting.
keywords: nuqtani tahrirlash, nuqtani siljitish, balandlikni oʻzgartirish, qayta raqamlash, nuqta raqami, tavsif, torting, northing, easting, nuqtani tuzatish, xato oʻlchov
from: 375ae2e9
---

Xato oʻlchangan nuqta, notoʻgʻri reyka balandligi yoki notoʻgʻri terilgan tavsif boʻlsa: bitta nuqtani tuzating, sirt esa oʻzi unga ergashadi.

## Nuqta qiymatlarini oʻzgartirish

1. {{ui:Select}} bilan rejadagi nuqtani bosing. **Xususiyatlar** uning raqamini, easting, northing, balandligini va tavsifini katakchalarda koʻrsatadi.
2. Yangi qiymatni kiriting va {{key:Enter}} tugmasini bosing (yoki boshqa joyni bosing). Balandligi boʻlmagan nuqta uchun **Balandlik** ni boʻsh qoldiring.
3. Sirt, konturlar va ular asosida qurilgan hamma narsa bir vaqtda yangilanadi.

Har bir oʻzgarish bitta qadam: {{key:Mod+Z}} uni bekor qiladi, {{key:Mod+Y}} esa qayta bajaradi. CivilCraft ishlata olmaydigan qiymat (boshqa nuqtada allaqachon bor raqam, koordinatada harf) qabul qilinmaydi: katak konturlanadi va holat paneli sababini koʻrsatadi.

Yangi tavsif kodi import qilganda boʻlgani kabi yangi nuqtalar guruhini yaratadi (qarang: [Sirt yaratish](topic:build-surface)).

## Nuqtani rejada siljitish

1. Nuqtani tanlang (u halqa oladi).
2. Halqani torting. Holat paneli nuqta boradigan easting va northing ni koʻrsatadi.
3. Qoʻyib yuboring: nuqta siljiydi, balandligi oʻzgarmaydi. Qoʻyib yuborishdan oldin nuqtani asl joyiga qaytarish uchun {{key:Esc}} tugmasini bosing.

## Sinuvchi chiziqlar nuqtaga ergashadi

{{ui:Breakline}} asbobi bilan chizilgan sinuvchi chiziq oʻtadigan nuqtalardan nusxa oladi. Nuqtani siljitganingizda yoki uning balandligini oʻzgartirganingizda, unga tegishli sinuvchi chiziq burchaklari ham xuddi shu qadamda birga siljiydi. Tavsiflardan yaratilgan sinuvchi chiziqlar guruhlari har doim nuqtalardan qayta quriladi.

:::note
LandXML fayldan oʻqilgan sirt oʻz uchburchaklarini saqlaydi: nuqta tahrirlari uni faqat {{ui:Rebuild the surface from the points}} dan keyin oʻzgartiradi.
:::
