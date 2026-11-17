---
title: Namuna chiziqlari va kundalang kesimlar
summary: Kesimlarni trassaga perpendikulyar kesing, har bir stansiyada yer, loyiha va kesma-toʻldirmani koʻring, hajmlarni oʻrtacha uchki maydonlar boʻyicha oling.
keywords: massa tashish, massa diagrammasi, muvozanat nuqtasi, qisqarish, kengayish, tashish masofasi, qarz olish, chiqindi, kesim varaqlari, kundalang kesim varaqlari, kesimlar pdf, kesimlar, kundalang kesimlar, namuna chiziqlari, kesim koʻrinishi, kesma, toʻldirma, maydonlar, oʻrtacha uchki maydon, uchki maydon hajmlari, yer ishlari, stansiya, ofset, csv
from: 5060173c
---

Kundalang kesim yoʻlni qurilganidek koʻrsatadi: bitta stansiyada trassaga koʻndalang, mavjud yer, loyiha (koridor yoki maydoncha tekislangan holda) va ular orasidagi kesma va toʻldirma.

## Namuna chiziqlarini qoʻshish

1. Trassani tanlang. **Xossalar** da, **Namuna chiziqlari** ostida {{ui:Namuna chiziqlarini qoʻshish}} tugmasini bosing.
2. **Har** (oraliq: boshida 50 ft yoki 20 m), **Chap kenglik** va **Oʻng kenglik** (har bir kesim oʻq chizigʻidan qancha uzoqlashishini) ni belgilang.
3. Aniq stansiyada kesim kesish uchun uni **Stansiya qoʻshish** ga yozing (masalan, `2+35`) va {{key:Enter}} ni bosing.

Kesimlar oraliqning har bir butun karralisida, trassaning ikki uchida, har bir egri chiziqning boshi va oxirida (PC va PT) hamda siz qoʻshgan stansiyalarda kesiladi. Namuna chiziqlari rejada trassani kesib oʻtuvchi kulrang chiziqlar sifatida koʻrinadi; ular DXF, DWG va PDF formatlarida C-ROAD-SCTN qatlamida ham chiqadi. Har bir oʻzgarish bitta qadam: {{key:Mod+Z}} uni bekor qiladi.

## Kesim koʻrinishi

Uni trassaning **Xossalar** ida {{ui:Kesim koʻrinishi}} bilan, **Yuza** › {{ui:Yana}} ostidagi {{ui:Kesimlar}} bilan yoki {{key:X}} bilan oching. U rejaning ostidagi profil koʻrinishi oʻrnini egallaydi.

- Kesimlar orasida oʻtish uchun uning panelidagi strelkalar, stansiyalar roʻyxati yoki kesim koʻrinishi fokusda boʻlganda {{key:Left}} va {{key:Right}} dan foydalaning ({{key:Home}} va {{key:End}} birinchi va oxirgisi uchun).
- Kulrang chiziq mavjud yer, qizil chiziq loyiha. Kesma toʻq sariq, toʻldirma yashil rangda soyalangan. Koridor nuqtalari belgilanadi: CL (oʻq chizigʻi), EOP (yoʻl chekkasi), SH (yelka) va DL (ochiq yer).
- Sarlavhada stansiya, shu kesimning kesma va toʻldirma maydonlari va vertikal oshirish koʻrsatiladi. **Moslash** panelni toʻldiradi; 1× ni tanlasangiz, kesim haqiqiy masshtabda koʻrinadi.
- Rejadagi qalin chiziq ekranda qaysi kesim borligini koʻrsatadi.

## Kesim varaqlari

{{ui:Kesim varaqlari (PDF)}} **Namuna chiziqlari** ostida har bir kesimni PDF sahifalarida stansiya tartibida chapdan oʻngga va yuqoridan pastga qatorlarga joylaydi. **Qogʻoz**, **Reja masshtabi** (kesimlarning gorizontal masshtabi) va **Profil oshirilishi** (1×, 2×, 5× yoki 10×) ni tanlang; dialog bir sahifaga nechta kesim sigʻishini va buning nechta sahifa boʻlishini koʻrsatadi.

Har bir kesimda offset va balandliklar toʻri, yer (punktir), loyiha, kesma va toʻldirma (toʻq sariq va yashil), koridor nuqtalari va uning pastida stansiya hamda kesma va toʻldirma maydonlari koʻrsatiladi. Varaqlardagi har bir kesim bir xil oʻlchamda chiziladi, eng kattasiga yetadigan balandlikda; agar bu sahifaga tanlangan oshirishda sigʻmasa, CivilCraft sigʻadigan eng kattasini qoʻllaydi va buni aytadi. Sarlavha qatorida trassa nomi, shu sahifadagi stansiyalar, masshtablar va "1-varaq (jami 3)" yoziladi.

## Oʻrtacha uchki maydonlar boʻyicha hajmlar

Ikki qoʻshni kesim orasida hajm — ularning ikki maydonining oʻrtachasi, ularning stansiyalari orasidagi masofaga koʻpaytirilgan. Panelda trassa uchun jami koʻrsatiladi, va {{ui:CSV}} har bir kesimning maydonlari va hajmlarini yugurma yigʻindilar bilan yuklab oladi (futli loyihalarda kub yard, metrlida kub metr).

**Xossalar** [Yer ishlari hajmlari](topic:volumes) dagi panjara usuli hajmlari bilan yonma-yon bir xil jamini koʻrsatadi. Ikkalasi turli taxminlar: yaqinroq kesimlar ularni yaqinlashtiradi, tekis yerdagi toʻgʻri yoʻlda ular bir xil.

:::note
Kesma va toʻldirma faqat chizilgan hududlarda hisoblanadi (koridor yoki maydonchaning ochiq yer chiziqlari), panjara usuli kabi. Koridor yoki maydoncha boʻlmasa, loyiha yer bilan bir xil boʻladi, shuning uchun kesim kesma yoki toʻldirma koʻrsatmaydi.
:::

## Massa tashish

**Namuna chiziqlari** ostidagi **Massa tashish** xuddi shu oʻrtacha uchki maydon hajmlaridan massa tashish diagrammasini chizadi: stansiyalar boʻylab, kesma minus toʻldirmaning yugurma yigʻindisi.

- **Kesmaning qisqarishi (−) yoki kengayishi (+)** bir kub yard kesma joylashtirilgandan keyin toʻldirma sifatida nima berishini koʻrsatadi: −10 % (boshlangʻich, vaqtinchalik qiymat) u 0.9 gacha qisqarishini bildiradi; kengayadigan tosh +5 % boʻlishi mumkin. Geotexnik hisobotingizdagi raqamdan foydalaning.
- Chiziq koʻtarilgan joyda yoʻl kesmada; pasaygan joyda toʻldirmada. Nol ustida (toʻq sariq soyalangan) yer stansiya ortishi tomon koʻchadi; nol ostida (yashil) esa stansiya kamayishi tomon.
- **Muvozanat nuqtalari** — chiziq nolni kesib oʻtgan joylar: ikkitasi orasida kesma va toʻldirma muvozanatda. Jadvalda har bir muvozanatlashgan uchastka, koʻchirilgan hajm (uning eng yuqori yoki eng past nuqtasi) va oʻrtacha tashish masofasi (soyalangan maydon shu hajmga boʻlinadi) koʻrsatiladi.
- Chiziq nolga teng boʻlmagan joyda tugasa, qolgan narsa **chiqindi** (yuqorida) yoki **qarz** (pastda) boʻladi. Oxirgi uchastkada faqat tugagan darajadan tashqari yer koʻchirilgan hisoblanadi.

**CSV** har bir kesimdagi massa ordinatasi, uchastkalar va koeffitsiyentni saqlaydi.
