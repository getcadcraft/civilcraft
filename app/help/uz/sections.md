---
title: Namuna chiziqlari va koʻndalang kesimlar
summary: Kesimlarni trassaga perpendikulyar kesing, har bir piketda yerni, loyihani va kesish hamda toʻldirishni koʻring, oʻrtacha uchli yuzalar boʻyicha hajmlarni oling.
keywords: massa diagrammasi, massa egri chizigʻi, balans nuqtasi, qisqarish, shishish, tashish masofasi, qarz, chiqindi, kesim varaqlari, koʻndalang kesim varaqlari, kesimlar pdf, kesimlar, koʻndalang kesimlar, namuna chiziqlari, kesim koʻrinishi, kesish, toʻldirish, maydonlar, oʻrtacha uchli maydon, uchli maydon hajmlari, yer ishlari, piket, siljish, csv
from: 09639ce2
---

Koʻndalang kesim yoʻlni qanday qurilishini koʻrsatadi: trassaga koʻndalang bitta piketda mavjud yer, loyiha (koridor yoki maydoncha tekislangan holda) va ular orasidagi kesish va toʻldirish.

## Namuna chiziqlarini qoʻshish

1. Trassani tanlang. **Xususiyatlar** ichida, **Namuna chiziqlari** ostida {{ui:Namuna chiziqlarini qoʻshish}} ni bosing.
2. **Har** (oraliq: boshida 50 ft yoki 20 m), **Chap kenglik** va **Oʻng kenglik** ni belgilang (har bir kesim markaziy chiziqdan qancha masofaga boradi).
3. Aniq piketda kesim olish uchun uni **Piket qoʻshish** ga kiriting (masalan `2+35`) va {{key:Enter}} ni bosing.

Kesimlar oraliqning har bir butun karralisida, trassaning ikki uchida, har bir egri chiziqning boshida va oxirida (PC va PT) hamda siz qoʻshgan piketlarda kesiladi. Namuna chiziqlari rejada trassa boʻylab kulrang chiziqlar sifatida koʻrinadi; ular shuningdek DXF, DWG va PDF da C-ROAD-SCTN qatlamida chiqadi. Har bir oʻzgarish bitta qadam: {{key:Mod+Z}} uni bekor qiladi.

## Kesim koʻrinishi

Uni trassaning **Xususiyatlari** boʻlimidagi {{ui:Kesim koʻrinishi}}, **Yuza** › {{ui:Yana}} ostidagi {{ui:Kesimlar}} yoki {{key:X}} bilan oching. U reja ostidagi profil koʻrinishining oʻrnini egallaydi.

- Kesimlar boʻylab uning panelidagi tugmalar, piketlar roʻyxati yoki kesim koʻrinishi tanlanganda {{key:Left}} va {{key:Right}} yordamida yuring ({{key:Home}} va {{key:End}} birinchi va oxirgisi uchun).
- Kulrang chiziq mavjud yer, qizil chiziq loyiha. Kesish toʻq sariq, toʻldirish yashil rangda boʻyaladi. Koridor nuqtalari belgilanadi: CL (markaziy chiziq), EOP (qoplama chekkasi), SH (chekka) va DL (yer bilan tutashuv).
- Sarlavhada piket, shu kesimning kesish va toʻldirish maydonlari hamda vertikal kattalashtirish koʻrsatiladi. {{ui:Moslash}} panelni toʻldiradi; kesimni haqiqiy masshtabda koʻrish uchun 1× ni tanlang.
- Rejadagi qalin chiziq ekranda qaysi kesim borligini koʻrsatadi.
- **Kattalashtirish va surish:** gʻildirak koʻrsatkich atrofida kattalashtiradi, sudrash koʻrinishni siljitadi. {{ui:Moslash}} (yoki {{key:F}}, yoki ikki marta bosish) butun kesimni yana moslaydi.

## Kesimda oʻlchash

1. Kesim panelidagi {{ui:Oʻlchash}} ni bosing yoki {{key:M}} ni bosing. Maslahat: "Birinchi nuqtani, soʻng ikkinchisini bosing."
2. Ikki nuqtani bosing. Har biri chiziq uchiga yoki koridor nuqtasiga (CL, EOP, SH, DL) tutib olinadi; erkin nuqta uchun {{key:Alt}} ni bosib turing.
3. Oʻqish gorizontal masofani (ΔH), vertikal masofani (ΔV), foizdagi qiyalikni nisbati bilan va toʻgʻri uzunlikni loyiha birliklarida beradi.

Yangi oʻlchovni boshlash uchun yana bosing. {{key:Esc}} uni tozalaydi, {{key:M}} esa Oʻlchashni oʻchiradi.

## Kesim varaqlari

**Namuna chiziqlari** ostidagi {{ui:Kesim varaqlari (PDF)}} har bir kesimni PDF sahifalariga joylashtiradi: piketlar tartibida chapdan oʻngga va yuqoridan pastga qatorlarga. **Qogʻoz**, **Reja masshtabi** (kesimlarning gorizontal masshtabi) va **Profil kattalashtirishi** (1×, 2×, 5× yoki 10×) ni tanlang; dialogda sahifaga nechta kesim sigʻishi va shundan nechta sahifa chiqishi koʻrsatiladi.

Har bir kesimda siljishlar va balandliklar setkasi, yer (shtrixli), loyiha, kesish va toʻldirish (toʻq sariq va yashil) bilan soyalangan, koridor nuqtalari va uning ostida piketi hamda kesish va toʻldirish maydonlari koʻrsatiladi. Varaqdagi har bir kesim bir xil oʻlchamda chiziladi, eng kattasiga yetadigan balandlikda; buning kattaligi bilan sahifaga sigʻmasa, CivilCraft sigʻadigan eng kattasidan foydalanadi va buni aytadi. Sarlavha chizigʻida trassa nomi, shu sahifadagi piketlar, masshtablar va "Varaq 1 (jami 3)" yoziladi.

## Kesish va toʻldirish nimaga qarab oʻlchanadi

Koridorda qoplama ostida qatlamlar boʻlishi mumkin: qoplama qatlamlari, shablon tarkibiy qismlari, iz. Kesim panelidagi **Hajmlar oʻlchanadigan** tanlovi kesish va toʻldirish qayergacha borishini belgilaydi:

- **Pastki yuza** (boshlangʻich): bu tarkibiy qismlarning pastigacha, shuning uchun kesishga qoplama qatlamlarining chuqurligi kiradi.
- **Yuqori yuza**: faqat loyihaning yuqorisigacha, avvalgidek tarkibiy qismlar hisobga olinmasdan.

Sarlavhadagi maydonlar, pastdagi hajmlar, CSV va massa tashish shu tanlovga amal qiladi va u loyiha bilan saqlanadi.

## Oʻrtacha uchli maydonlar boʻyicha hajmlar

Ikki qoʻshni kesim orasida hajm ularning ikki maydoni oʻrtachasi va piketlar orasidagi masofa koʻpaytmasiga teng. Panelda trassa boʻyicha jami koʻrsatiladi, {{ui:CSV}} esa har bir kesimning maydonlari va hajmlarini jamgʻarma yigʻindilari bilan yuklab oladi (futli loyihalar uchun kubik yard, metrik loyihalar uchun kubik metr).

**Xususiyatlar** [Yer ishlari hajmlari](topic:volumes) dagi setka usuli hajmlari yonida xuddi shu jami natijalarni koʻrsatadi. Ikkalasi turli taxminlar: kesimlar yaqinlashsa, ular ham yaqinlashadi, tekis yerdagi toʻgʻri yoʻlda esa bir xil boʻladi.

:::note
Kesish va toʻldirish faqat tekislangan maydonlar (koridor yoki maydonchaning yer bilan tutashuv chiziqlari) ichida hisoblanadi, xuddi setka usulidagidek. Koridor yoki maydonchasiz loyiha yer boʻladi, shuning uchun kesim kesish yoki toʻldirishni koʻrsatmaydi.
:::

## Massa tashish

**Namuna chiziqlari** ostidagi **Massa tashish** xuddi shu uchli maydon hajmlaridan massa tashish diagrammasini chizadi: piketlar boʻylab kesish minus toʻldirishning jamgʻarma yigʻindisi.

- **Kesishning qisqarishi (−) yoki shishishi (+)** bir kubik yard kesish toʻldirish sifatida joylashtirilgandan keyin nimaga aylanishini bildiradi: −10 % (boshlangʻich qiymat, vaqtinchalik) u 0.9 gacha qisqarishini bildiradi; shishadigan tosh +5 % boʻlishi mumkin. Geotexnik hisobotingizdagi raqamdan foydalaning.
- Chiziq koʻtarilgan joyda yoʻl kesishda; pastga tushgan joyda toʻldirishda. Nol dan yuqorida (toʻq sariq soya) yer katta piketlar tomon, nol dan pastda (yashil) kichik piketlar tomon harakatlanadi.
- **Balans nuqtalari** — chiziq nolni kesib oʻtgan joylar: ikkitasi orasida kesish va toʻldirish muvozanatda. Jadvalda har bir muvozanatlangan oraliq, koʻchirilgan hajm (uning eng yuqori yoki eng past nuqtasi) va oʻrtacha tashish masofasi (soyali maydon shu hajmga boʻlingan) koʻrsatiladi.
- Chiziq nolda tugamagan joyda ortib qolgani **chiqindi** (yuqorida) yoki **qarz** (pastda) boʻladi. Oxirgi oraliqda faqat u tugagan sathdan tashqari yer koʻchirilgan hisoblanadi.

**CSV** har bir kesimdagi massa ordinatasi, oraliqlar va koeffitsiyentni saqlaydi.
