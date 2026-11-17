---
title: "Iqlim kelajagi: 2050 va 2080 yil suv bosishi, issiqlik va oʻrmon yongʻini"
summary: Manzildan joyga ichida kelajakdagi iqlim uchun joyning suv bosish sathini oshiring, oʻrmon yongʻini xavfini baholang va ob-havo faylini morflang, hozirgi holat bilan yonma-yon, iqlim maʼlumotlar toʻplamidan (SSP2-4.5 va SSP5-8.5, 2050 va 2080).
keywords: iqlim, iqlim oʻzgarishi, kelajak, 2050, 2080, ssp, cmip6, stsenariy, dengiz sathi, suv bosish, asosiy suv bosish balandligi, bfe, fema, issiqlik, ob-havo fayli, epw, morf, oʻrmon yongʻini, buta yongʻini, bushfire
from: b0d2ee38
---

Iqlim raqamlari **maʼlumotlar toʻplamidan** keladi, ilovadan emas. Sozlamalar › Qoʻshimchalar bo'limida {{ui:Iqlim kelajagi}} qoʻshimchasini yoqing yoki {{ui:Iqlim kelajagi}} blokida oʻzingizning toʻplam faylingizni yuklang.

:::warning
Qoʻshimcha bilan keladigan toʻplam **namuna**: uch joy (Denver, Mayami, Yoxannesburg), bitta iqlim modeli va har bir 20 yillik davrda besh yil. U asboblarni sinab koʻrish uchun, **loyihalash uchun emas**. Toʻliq toʻplam `tools/climate/build-pack.mjs` bilan NASA NEX-GDDP-CMIP6 maʼlumotlaridan quriladi.
:::

## Qayerda

Sirt › Yana › Manzildan joyga. Nuqtani belgilang, qatlamlar qoʻshing (FEMA suv bosish qatlami asosiy suv bosish balandligini beradi) va saytni oʻqiydigan tugmani bosing. Sayt qatorlari ostida {{ui:Iqlim kelajagi}} bloki bor: **Stsenariy** (SSP2-4.5 yoki SSP5-8.5) va **Yil** (2050 = 2041-2060, 2080 = 2071-2090, ikkalasi ham 1995-2014 bilan solishtirilgan) ni tanlang. Nuqtaga eng yaqin toʻplam joyi ishlatiladi, yoki siz tanlagan; har bir joydan uzoqda boʻlsa, global oʻrtacha oʻzgarishlar ishlatiladi va panel buni aytadi.

## Loyihaviy suv bosish sathi

Hozirgi sath, agar suv bosish qatlamida boʻlsa, FEMA ning asosiy suv bosish balandligi (fut, NAVD 88), aks holda oʻzingiz yozing. Suv bosish turini tanlang (qirgʻoq, daryo yoki kuchli yomgʻir yoki ikkalasi), yomgʻir qismi uchun saytdagi suv bosish chuqurligini va xohlasangiz erkin balandlikni (freeboard). {{ui:Suv bosish sathini oshirish}} hozirgi va kelajakdagi sathni yonma-yon, dengiz sathi va yomgʻir qismlarini hamda taxminlarni koʻrsatadi: qirgʻoq sathiga dengiz sathining butun koʻtarilishi qoʻshiladi; daryo oqimi eng ho'l kundagi yomgʻir bilan bir xil koʻtariladi va chuqurlik oqimning 0.6 darajasi boʻyicha oʻzgaradi (Manning, keng kanal); qismlar qoʻshiladi.

:::warning
Bu oʻzgarishni baholash, suv bosish tadqiqoti emas. Loyihaviy suv bosish sathi vakolatli organ yoki muhandisingiz tomonidan belgilanadi.
:::

## Oʻrmon yongʻini xavfi (faqat skrining)

Eng yaqin oʻsimlik, undan koʻtarilgan nishab va masofa juda pastdan ekstremalgacha boʻlgan diapazonni beradi, hozirgi va kelajak uchun (kelajagi toʻplamning yongʻin ob-havo indeksidagi oʻzgarishiga koʻpaytiriladi). **Faqat skrining:** bu saytga toʻliq oʻrmon yongʻini baholash kerakligini aniqlash uchun bizning oʻz nisbiy shkalamiz; bu qurilish kodi reytingi emas.

## Issiqlik: kelajakdagi ob-havo fayli

Hozirgi kundagi `.epw` faylini tanlang va {{ui:Kelajakdagi ob-havo faylini yaratish}}: u nashr etilgan siljish va choʻzish usuli bilan morflanadi (Belcher, Hacker va Powell 2005) va issiqlik solishtiriladi (oʻrtacha va eng issiq harorat, loyiha haroratlari, 30 °C va 35 °C dan yuqori soatlar, daraja-kunlar). {{ui:Kelajakdagi ob-havo faylini saqlash}} uni Muhit paneli, BimCraftʼning energiya tekshiruvi yoki sizning vositalaringiz uchun saqlaydi.

## Raqamlar qayerdan

NASA NEX-GDDP-CMIP6 (kichraytirilgan CMIP6 model chiqishi, har bir model uchun CC BY 4.0) harorat, namlik, quyosh, yomgʻir va yongʻin ob-havosi uchun; dengiz sathi koʻtarilishi uchun esa IPCC AR6 global oʻrtachasi, agar toʻplamda mahalliy raqamlar boʻlmasa. Panelda toʻplamning manbai, litsenziyasi va sanasi koʻrsatiladi.
