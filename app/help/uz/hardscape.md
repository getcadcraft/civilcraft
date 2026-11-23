---
title: Plitkali qoplamalar, devorlar va pogʻonalar
summary: Drenajga yoki koʻndalang ogʻishga ega plitkali qoplama, uning naqshi va qatlamlari; relyefga ergashadigan yoʻlkalar; poydevor pogʻonalari bilan tutib turuvchi va erkin turgan devorlar; bordyurlar; pandus va pogʻonalar chegaralar boʻyicha tekshirilgan; IFC chiqarish.
keywords: qattiq qoplama, plitkalar, plitkali qoplama, patio, terassa, ogʻishlar, drenaj, koʻndalang ogʻish, baliqsuyagi, yotiq terish, yoʻlka, piyodalar yoʻlagi, tutib turuvchi devor, bogʻ devori, poydevor, devor qopqogʻi, bordyur, chegaralash, pandus, qulaylik, pogʻonalar, zinalar, pogʻona balandligi, yurish kengligi, sahn
from: d34b4466
---

Qattiq qoplama har safar yerdan qayta hisoblanadi, shuning uchun u relyefga ergashadi va yer yoki uning chizigʻi siljiganda qayta yaratiladi. Uning burchaklarini rejada boshqa chiziqlar kabi sudrang. Uni Landshaft guruhidagi {{ui:Qattiq qoplamalar}} dan oching.

## Plitkali qoplama

Burchaklarni bosing va {{key:Enter}} ni bosing. Xususiyatlarda:

- **Sath**: boʻsh = uning ostidagi yerning oʻrtacha sathi.
- **Ogʻishlar**: tekis, **koʻndalang ogʻish** (yoʻnalish tomon foizda) yoki **drenajga**: CivilCraft drenaj qayerga borishini bosishingizni soʻraydi, soʻng har bir burchak drenajdan ogʻish bilan koʻtariladi. Rejadagi koʻrsatkichlar ogʻishlarni koʻrsatadi.
- **Naqsh** (setka, yotiq terish, baliqsuyagi) birlik oʻlchami, chok va burchak bilan; **Chegaralash** kengligi. Varaqda 1 millimetrdan yaqinroq choklar chiqarib tashlanadi.
- Plitkali qoplama loyihalangan yuzaning bir qismi. Uning qatlamlari (plitkalar, yotqizish qatlami, asos) IFC va miqdorlarga kiradi.

## Yoʻlkalar

Yoʻlka boʻylab bosing va {{key:Enter}} ni bosing. U yerga ergashadi, **Koʻndalang ogʻish** oʻng tomonida. **Ruxsat etilgan eng katta qiyalik** dan tik yoʻlka rejada shu joyda `!` bilan belgilanadi, va Xususiyatlar u qanchalik tikligini aytadi.

Yoʻlka koridor qurgan yoʻlga yetganda, u yoʻlning tashqi chetida toʻxtaydi, oʻsha yerdagi piyodalar yoʻlagi yoki chekka bilan bir sathda, loyihalangan yuzada va 3D koʻrinishda. Yoʻlni kesib oʻtgan yoʻlka tekislanadi va ikki boʻlak sifatida koʻrsatiladi; yoʻldan yoʻlka kengligining ikki barobarigacha qisqa chizilgan uchi chetigacha davom ettiriladi. Reja yoʻlkani siz chizganingizdek koʻrsatadi, uning uzunligi va maydoni esa butun chiziqni hisoblaydi. Qarang: [Yoʻl koridorini trassa boʻylab yaratish](topic:corridor).

## Devorlar

Devor boʻylab bosing va {{key:Enter}} ni bosing. Devor **tutib turuvchi** yoki **erkin turuvchi** boʻladi. **Yuqori qismi** kiritilmasa, u butun uzunligi boʻylab yerdan **Balandlik** bilan turadi; uni tekis ushlash uchun yuqori qismni kiriting. Uning **poydevori** yerdan belgilangan chuqurlikda joylashadi va butun pogʻonalarda pastga pogʻonalanadi, shuning uchun ular orasida tekis qoladi. Xususiyatlar uning uzunligi, balandliklari, old yuzasi maydoni va poydevor pogʻonalarini beradi; reja har bir uchida devor yuqori va pastki qismini (TW / BW) belgilaydi.

:::warning
Balandligi 1.2 m (4 ft) dan katta tutib turuvchi devor belgilanadi: uni muhandis loyihalaydi.
:::

## Bordyurlar

Bordyur boʻylab bosing va {{key:Enter}} ni bosing; uning kengligi va koʻtarilish balandligini belgilang.

## Pandus

Pastdan yuqorigacha bosing va {{key:Enter}} ni bosing. Sathlar siz kiritmasangiz, har bir uchidagi yerdan olinadi. Pandusda har 750 mm (2.5 ft) koʻtarilishda sahn boʻladi va **Ruxsat etilgan eng katta qiyalik** (boshida 1:12) hamda eng kichik kengligi boʻyicha tekshiriladi; Xususiyatlar uning qancha uzun boʻlishi kerakligini aytadi.

## Pogʻonalar

Pastki pogʻonaning old qirrasini bosing, soʻng pogʻonalar yuqoriga yetgan joyni bosing va {{key:Enter}} ni bosing. Pogʻonalar soni balandlik va **Eng katta pogʻona balandligi** dan chiqadi; yurish kengligi qulaylik qoidasidan 2R + G ≈ 630 mm, hech qachon **Eng kichik yurish kengligi** dan kam emas; **Bir marshda eng koʻp pogʻona** boʻyicha har bir marshda sahn boʻladi. Xususiyatlar ularning ikki nuqta orasiga sigʻishini yoki qancha uzun boʻlishi kerakligini aytadi.

:::note
Pandus va pogʻonalar uchun chegaralar belgilangan standart qiymatlar. Bino kodeksingiz talab qiladigan qiymatlarni belgilang.
:::

## CivilCraft dan tashqari

- Yana › {{ui:Landshaft IFC ni eksport qilish}}: plitkali qoplama va yoʻlkalar `IfcPavement` sifatida, devorlar `IfcWall` sifatida (tutib turuvchi devorlar RETAININGWALL sifatida) ularning qatlamlari bilan, bordyurlar `IfcKerb` sifatida, pandus `IfcRamp` sifatida, pogʻonalar `IfcStair` sifatida ularning pogʻonalari va yuzalari bilan.
- Oʻsimliklar jadvalining **TakeoffCraftʼga yuborish** funksiyasi plitkali qoplama maydonlari va qatlam hajmlari, devor old yuzalari maydoni va uzunliklari, bordyur uzunliklari hamda pogʻonalar sonini olib boradi.
- Tafsilotlar varagi har bir devor kesimini, har bir plitkali qoplama tuzilishini va har bir pogʻonalar marshini chizadi. Qarang: [Landshaft varaqlari](topic:landscape-sheets).
