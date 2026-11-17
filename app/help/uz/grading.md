---
title: Bino maydonchasini tekislash
summary: Tekis maydoncha chizing, uning balandligini va kesish hamda toʻldirish qiyaliklarini belgilang, CivilCraft esa uni mavjud yerga chiqarib, loyihalangan sirtga qoʻshadi.
keywords: tutib turuvchi devor, tutib turuvchi devorlar, vertikal tomon, devor qiyalik oʻrnida, har bir tomon uchun qiyalik, uyum, tekislash, maydoncha, bino maydonchasi, yerga chiqish, yerga chiqish chizigʻi, kesish qiyaligi, toʻldirish qiyaligi, yakuniy sath, loyihalangan sirt, saytni tekislash
from: 482319a6
---

Maydoncha bitta balandlikdagi tekis maydon. Uning chetidan CivilCraft kesish qiyaligingiz bilan tashqariga qarab tekislaydi, agar yer maydonchadan baland boʻlsa, va toʻldirish qiyaligingiz bilan, agar past boʻlsa, qiyalik mavjud yerga yetguncha. Bu uchrashish chizigʻi — yerga chiqish chizigʻi. Maydoncha va uning qiyaliklari yerga chiqish chizigʻi ichidagi mavjud yerni almashtirib, loyihalangan sirtni hosil qiladi.

## Maydonchani chizish

Avval mavjud yer sirti kerak.

1. {{key:G}} ni bosing yoki **Loyihalash** guruhida {{ui:Pad}} tugmasini bosing.
   Ishora shunday deydi: "Maydoncha: burchaklarini bosing. Enter yoki ikki marta bosish yakunlaydi, Backspace oxirgisini olib tashlaydi, Esc bekor qiladi."
2. Burchaklarni ketma-ket bosing, qaysi tomondan boʻlishidan qatʼiy nazar. Koʻk kontur kursorni kuzatadi.
3. Oxirgi burchakdan keyin {{key:Enter}} bosing (kamida uchta).
   Maydoncha chiziladi va tanlanadi. U maydonchaning oʻrtasidagi yer balandligida boshlanadi, 0.1 gacha yaxlitlangan, 2 : 1 kesish qiyaligi va 3 : 1 toʻldirish qiyaligi bilan. Holat satri masalan shuni aytadi: "Maydoncha 1 balandligi 254.3 (oʻrtadagi yer), kesish 2:1, toʻldirish 3:1. Ularni Xususiyatlarda oʻzgartiring."

:::warning
{{key:Enter}} bilan yakunlang. Ikki marta bosish ham yakunlaydi, lekin bu versiyada ikki marta bosgan burchagingizni tashlab yuboradi. Oxirgi burchakni bir marta bosing, soʻng {{key:Enter}} ni bosing.
:::

Maydonchaning konturi oʻz-oʻzini kesib oʻtmasligi kerak ("The pad outline crosses itself." — "Maydonchaning konturi oʻz-oʻzini kesib oʻtadi.").

## Balandlik va qiyaliklarni belgilash

Maydoncha tanlangan holda, oʻng panelda **Maydoncha** koʻrsatiladi:

1. **Nomi**.
2. **Balandlik**: maydonchaning tekis balandligi.
3. **Kesish qiyaligi** va **Toʻldirish qiyaligi**, H:V shaklida (2 — 2 : 1 degani). Ikkalasi ham 0 dan katta boʻlishi kerak.
4. **Maydoncha maydoni** va **Burchaklar** maʼlumot uchun koʻrsatiladi.

Har bir qiymatdan keyin {{key:Enter}} bosing. Yerga chiqish chizigʻi, loyihalangan sirt va hajmlar darhol yangilanadi.

Maydonlar ostida masalan shunday satr oʻqiladi: "Daylight line: 48 slope lines (20 in cut, 28 in fill), farthest 31.20 ft out." Reja yerga chiqish chizigʻini va qiyalik chiziqlarini magenta rangda koʻrsatadi.

## Yerga chiqish qanday topiladi

- Qiyalik chiziqlari har bir chetdan unga perpendikulyar chiqadi, maydoncha oʻlchamining taxminan yigirmadan bir qismida.
- Tashqi burchaklarda ular har 10° da yoyiladi, shunda qiyalik burchakni aylanib oʻtadi.
- Ichki burchaklarda bitta chiziq bissektrisa boʻylab yuradi, u yerda ikki chetdan qiyaliklar uchrashadi.
- Har bir chiziq kesish qiyaligi bilan koʻtariladi yoki toʻldirish qiyaligi bilan tushadi, yerga yetguncha.

## Har bir tomon uchun qiyaliklar va tutib turuvchi devorlar

Maydoncha, platforma yoki tepalikning **Xususiyatlari** dagi **Tomonlar va tutib turuvchi devorlar** ostida har bir tomonni oʻz usulida tekislash mumkin. 1-tomon birinchi bosgan burchakdan ikkinchisigacha, 2-tomon ikkinchidan uchinchigacha va hokazo.

- **Barcha tomonlar**: **Qiyalik** har bir tomonda yuqoridagi kesish va toʻldirish qiyaliklarini ishlatadi; **Vertikal: tutib turuvchi devorlar** har bir tomonga devor qoʻyadi.
- Har bir tomon uchun: **Yuqoridagi qiyaliklar**, **Oʻz qiyaliklari** (shu tomon uchun kesish va toʻldirish qiyaligini yozing) yoki **Vertikal (tutib turuvchi devor)**.
- Qiyalikni `3` yoki `3:1` (gorizontal 1 vertikalga), `33%` yoki `18.4°` shaklida yozing; u H:1 shaklida koʻrsatiladi. Maydonchaning oʻz **Kesish qiyaligi** va **Toʻldirish qiyaligi** ham shunday.
- Vertikal tomonda uyum yoʻq: tutib turuvchi devor chekka boʻylab yuradi, maydonchadan pastga mavjud yergacha (toʻldirishda) yoki yerdan maydonchagacha (kesishda). **Devor qalinligi** (dastlab 0.3 m yoki 1 ft) yer maydoncha chetidan mavjud yergacha qancha qadam bilan oʻtishini bildiradi. Kesish va toʻldirish hajmlari shu tomonda endi boʻlmagan uyumni hisobga olmaydi.
- Devor qiyalik tomonga uchrashgan joyda qiyalik devor uchini aylanib oʻtadi; ikki devor miter bilan uchrashadi.
- Maydonlar ostida: devorlarning uzunligi, ochiq yuzi (balandlik × uzunlik), eng baland va oʻrtacha balandligi.

Reja har bir devorning tashqi yuzini qisqa belgilar bilan va balandligini ikki uchida hamda eng balandida koʻrsatadi (tutib turuvchi devorlar qatlamida, u ham DXF va DWG ga kiradi). 3D koʻrinish devorlarni qattiq jism sifatida koʻrsatadi (Koʻrsatish › Tutib turuvchi devorlar), GLB, OBJ va USD eksportlari ularni oʻz ichiga oladi. Chekka boʻylab kesimlar pogʻonani koʻrsatadi.

**Ogohlantirishlar** (Xususiyatlarda va Muammolar panelida): **Devor balandligi ogohlantirish chegarasi** dan yuqori (dastlab 1.0 m yoki 3.3 ft) devor "may need an engineered wall or a permit; check local rules" — "muhandislik devori yoki ruxsatnoma kerak boʻlishi mumkin; mahalliy qoidalarni tekshiring" degan ogohlantirish oladi, va **Tuproqning turgʻun eng tik qiyaligi** ni kiritganingizda, kesish yoki toʻldirish qiyaligi undan tikroq boʻlgan har qanday tomon ogohlantirish oladi. Bular ogohlantirishlar: tekislash baribir quriladi. Har bir oʻzgarish {{key:Mod+Z}} uchun bitta qadam.

## Burchaklarni siljitish

Maydonchani tanlang, soʻng burchakdagi kvadrat tutqichni torting. Har bir torish bitta bekor qilish qadami. Burchak qoʻshish yoki olib tashlash hali mavjud emas: maydonchani oʻchirib, qayta chizing.

## Tekislanmasa

**Yer ishlari** ostidagi qizil quti maydonchani va muammoni nomlaydi:

| Xabar | Nima qilish kerak |
|---|---|
| "3 slope lines run off the surface before meeting it: the pad is too close to the surface's edge or too high/low." — "3 ta qiyalik chizigʻi yetib bormasdan sirt chetidan chiqib ketadi: maydoncha sirt chetiga juda yaqin yoki balandligi juda yuqori/past." | Maydonchani sirt chetidan ichkariga siljiting yoki balandligini yerga yaqinlashtiring. |
| "The daylight line crosses itself (slopes from different sides of the pad run into each other). Reshape the pad or change the slopes." — "Yerga chiqish chizigʻi oʻz-oʻzini kesib oʻtadi (maydonchaning turli tomonlaridagi qiyaliklar bir-biriga kirib ketadi). Maydonchani qayta shakllantiring yoki qiyaliklarni oʻzgartiring." | Odatda chuqur kesish yoki baland toʻldirishda tor yoki L shaklidagi maydonchalarda uchraydi. Maydonchani kengaytiring, farqni tekislang yoki qiyaliklarni tikroq qiling. |
| "The pad outline crosses itself." — "Maydonchaning konturi oʻz-oʻzini kesib oʻtadi." | Burchaklarni maydon atrofida tartib bilan qayta chizing. |

Muammosi bor maydoncha tuzatilguncha loyihalangan sirt va hajmlardan chiqarib tashlanadi.

## Natijani koʻrish

1. **Koʻrsatish** ostida **Sirt** ni {{ui:Proposed (graded)}} ga oʻrnating. Gorizontallar endi maydoncha boʻylab tekis oʻtadi va qiyaliklarni yerga chiqish chizigʻigacha kuzatadi.
2. Kursorni maydonchaning ustiga olib boring: holat satrida **Yer** va **Tekislangan** balandliklar koʻrinadi.
3. **Yer ishlari** ostida kesish va toʻldirishni oʻqing; qarang: [Yer ishlari hajmlari](topic:volumes).

Maydonchalar koridorlardan keyin, chizilgan tartibda tekislanadi. Keyingi maydoncha oʻz yerga chiqish chizigʻi ichidagi oldingi har qanday narsani almashtiradi.

## Maydonchani oʻchirish

Uni tanlang va {{key:Delete}} ni bosing (Mac da Fn va delete), yoki {{ui:Delete}} ni bosing.

## Hali qurilmagan

Maydonchalar tekis: qiyalikli maydonchalar, oʻzgaruvchan qiyalikli yoʻnalish chiziqlari, pogʻonalar va masofa yoki balandlik maqsadiga tekislash hali mavjud emas. Qarang: [Hali qurilmagan](topic:not-built-yet).
