---
title: Xususiyat chiziqlari
summary: Har bir uchi boʻyicha qiyalik beriladigan 3D chiziqlar chizing, ularning pogʻonali siljishlarini yarating va ularni yerning sinuvchi chiziqlari yoki loyihadagi qiyalikli platformalar sifatida ishlating.
keywords: yoy, egri, radius, 3d yoy, spiral, egri bordyur, qiyalik qoplamasi, balandlik qoplamasi, qiyalik strelkalari, xususiyat chizigʻi, qiyalik, balandlik, pogʻonali siljish, siljish, sinuvchi chiziq, bordyur, ariq, berma, qiyalikli platforma, yerga chiqish, 3d polichiziq
from: d55b25fb
---

Xususiyat chizigʻi har bir uchida balandligi bor chiziq: bordyur, ariq oqim chizigʻi, berma yuqori qismi yoki qiyalikli platformaning chegarasi. Balandliklarni raqam bilan yoki qiyalik bilan belgilaysiz, uni pogʻona bilan yon tomonga nusxalaysiz va sirtlar unga nima qilishini tanlaysiz.

## Chizish

1. **Sirt** › {{ui:More}} › {{ui:Feature line}} ni tanlang yoki {{key:L}} ni bosing.
2. Uning uchlarini rejada bosing. Geodezik nuqtani bosish nuqtaning oʻrnini va balandligini oladi; boshqa joyda uchi oʻsha joydagi mavjud yerning balandligini oladi.
3. Ochiq chiziqni tugatish uchun {{key:Enter}} ni bosing, yoki birinchi uchni yana bosib yoping.

Yangi chiziq tanlanadi va mavjud yerning sinuvchi chizigʻi sifatida boshlanadi, yer ustida yotadi.

## Yoylar

Segment rejada yoy boʻlishi mumkin, uning uchlari turli balandliklarda: bordyur burilishi, egri ariq yoki burilayotgan pandus. Uning qiyaligi yoy boʻylab bir tekis oʻzgaradi, uzunligi esa egri chiziq boʻylab oʻlchanadi.

- **Chizish paytida:** yoylarni yoqish uchun {{key:C}} ni bosing (sensorli ekranda: rejadagi panelda {{ui:Arc}}). Uchdan keyin egri chiziqdagi nuqtani bosing, soʻng yoy tugaydigan joyni bosing. Toʻgʻri segmentlar uchun yana {{key:C}} ni bosing. {{key:Backspace}} avval egri chiziqdagi nuqtani oʻchiradi.
- **Keyin:** **Xususiyatlar** da uchning **Yoy** katagiga radiusni va burilish yoʻnalishini kiriting, masalan `50 L` yoki `50 R` (chiziq boʻylab yurganingizda chapga yoki oʻngga), soʻng {{key:Enter}} ni bosing. Segmentni yana toʻgʻri qilish uchun katakni boʻshating. Segment yarmidan kichik radius rad etiladi.

Tanlangan chiziq har bir yoyning radiusini qiyaligi yonida koʻrsatadi. **Uzunlik** rejadagi yoylar boʻylab; **3D uzunlik** esa koʻtarilish va pasayishni ham hisobga oladi. Pogʻonali siljishlar yoylarni saqlaydi: burilishning tashqi tomonidagi yoy kattalashadi, ichkaridagisi kichrayadi, yoy markazidan oʻtgan siljish esa rad etiladi.

Sirtlar, 3D koʻrinish, DXF va DWG yoylarni 0.01 aniqlik bilan egri chiziqqa yaqin qisqa toʻgʻri boʻlaklar sifatida oladi. LandXML esa ularni yoy sifatida saqlaydi (qarang: quyidagi **Boshqa fayllardagi yoylar**).

## Balandlik va qiyalikni belgilash

**Xususiyatlar** uchlarni chiziq boʻylab masofasi bilan, ularning **Balandlik** va **Keyingigacha qiyalik** (foizda) qiymatlari bilan koʻrsatadi. Ularning birini kiriting va {{key:Enter}} ni bosing:

- Balandlik faqat oʻsha uchni siljitadi.
- Qiyalik segmentining uzoq uchidagi balandlikni belgilaydi; undan keyingi uchlar oʻz joyida qoladi, shuning uchun keyingi segmentning qiyaligi oʻzgaradi.

Shuningdek **Xususiyatlar** da:

| Harakat | Nima qiladi |
|---|---|
| **Hammasini shuncha koʻtarish yoki tushirish** | Har bir uchga kiritgan balandligingizni qoʻshadi. |
| {{ui:Elevations from the ground}} | Har bir uchni mavjud yer ustiga qaytaradi (sirtdan tashqaridagi uchlar oʻz balandligini saqlaydi va roʻyxatga olinadi). |
| {{ui:One grade, first to last}} | Birinchi va oxirgi balandliklarni saqlaydi, ular orasidagi uchlarni esa bir tekis qiyalikka joylaydi. |

Tanlangan chiziq rejada uchlardagi balandliklarini va segmentlar boʻylab qiyaliklarini koʻrsatadi. Uchni siljitish uchun {{ui:Select}} bilan torting; uning balandligi oʻzgarmaydi.

## Pogʻonali siljishlar

**Pogʻonali siljish** ostida **Masofa** ni kiriting (chiziq yoʻnalishining oʻng tomoniga musbat, chap tomoniga manfiy), soʻng balandlik (koʻtarish yoki tushirish) yoki foizdagi qiyalikni kiriting va {{ui:Make the offset line}} ni bosing. Nusxa yangi xususiyat chizigʻi boʻladi: masalan, bordyurning orqa tomoni 0.5 ft yon tomonda va 0.5 ft balandroq, yoki ariqning chekkasi 6 ft tashqarida 2 % qiyalikda. Tor burilishda nusxa oʻzi ustiga oʻralib qolsa, masofa rad etiladi.

## Ekrandagi qiyaliklar va balandliklar

{{key:E}} ni bosing yoki **Koʻrinish** ostida **Xususiyat chiziqlaridagi qiyaliklar va balandliklar** ni belgilang: har bir xususiyat chizigʻining har bir segmenti boʻylab qiyaligini (pastga qaragan kichik strelka bilan) va uchlardagi balandligini koʻrasiz. Ular faqat ekranda koʻrinadi: chizmaga hech narsa qoʻshilmaydi va PDF, DXF hamda DWG oʻzgarishsiz qoladi. Qisqa segmentlar va zich uchlar siz kattalashtirguncha belgisiz qoladi. Tanlangan chiziq doim oʻz qiyaliklari va balandliklarini koʻrsatadi.

## Profil koʻrinishida

Trassani kesib oʻtadigan xususiyat chizigʻi oʻsha trassaning profil koʻrinishida, kesishmadagi nomi va balandligi bilan koʻrinadi; yonidan oʻtadigan chiziqlarni ham koʻrsatish mumkin. Qarang: [Vertikal profilni loyihalash](topic:profile).

## Sirtlar unga nima qiladi

**Foydalanish** ni tanlang:

| Foydalanish | Nima boʻladi |
|---|---|
| Mavjud yerning sinuvchi chizigʻi | Mavjud yer chiziq orqali oʻz balandliklarida oʻtadi, chizilgan sinuvchi chiziq kabi. |
| Loyihaga tekislangan | **Yopiq** chiziq qiyalikli platformaga aylanadi: uning ichidagi loyihalangan sirt chetigacha tekislanadi. Platforma kabi chiziqdan yerga kesish va toʻldirish qiyaliklarini (gorizontal boʻyicha 1 vertikal) yerga qadar oʻtkazish uchun **Yerga chiqish** ni yoqing; har bir qiyalik oʻsha yerda chetning oʻz balandligidan boshlanadi. |
| Faqat chizilgan | Rejada qoladi va DXF, DWG hamda PDF da chiqadi (qatlam C-GRAD-FEAT, 3D polichiziqlar), lekin sirtlar uni e'tiborsiz qoldiradi. |

Hajmlar, kesimlar va 3D koʻrinish loyihaga tekislangan xususiyat chiziqlarini platformalar kabi oʻz ichiga oladi. Har bir oʻzgarish bitta qadam: {{key:Mod+Z}} uni bekor qiladi.

## Jamoa bilan chiziqlarni ulashish

CadCraft Studio da bulutdagi fayllaringizdan ochilgan chizmada, jamoa tarifida, loyihaning **Xususiyatlari** (hech narsa tanlanmagan holda) da **Jamoa** boʻlimi bor, unda {{ui:Team lines…}} tugmasi mavjud: jamoangiz ulashgan chiziqlar, har biri oʻz revizisiyasi bilan, avval xususiyat chizigʻini tanlamasdan. Chiziqni ulashish uchun uni tanlang, yangi revizisiyani yuboring, jamoaniki ni olish yoki ulashishni toʻxtatish mumkin. Bu sozlamadan tashqarida boʻlim nima kerakligini aytadi.

## Boshqa fayllardagi yoylar

| Fayl | Yoylari bor xususiyat chizigʻiga nima boʻladi |
|---|---|
| CivilCraft loyihasi | Aynan saqlanadi. |
| LandXML | Yoylari va balandliklari bilan chiziqlar va yoylardan iborat reja xususiyati sifatida yoziladi va yoylari bilan qayta oʻqiladi. Boshqa dasturdan kelgan xususiyat chizigʻi **Faqat chizilgan** sifatida keladi: uni sirtga qoʻyish uchun **Foydalanish** ni tanlang. |
| DWG va DXF | 3D polichiziq yoyni saqlay olmaydi, shuning uchun chiziq har bir yoyga 0.01 aniqlikda yaqin qisqa boʻlaklar sifatida yoziladi. CivilCraft chizmada qaysi boʻlaklar yoy boʻlganini ham qayd etadi: chizmani chiziqlar sifatida ochganingizda {{ui:Feature lines}} chiziqlarni yoylari bilan xususiyat chiziqlari sifatida qaytaradi. Boshqa dasturlar esa oddiy 3D polichiziqni koʻradi. |
