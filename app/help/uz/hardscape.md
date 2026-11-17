---
title: Qoplama, devorlar va zinalar
summary: Drenajga yoki koʻndalang qiyalikka nishablikli qoplama, naqsh va uning qatlamlari; relyefga ergashadigan yoʻlkalar; poydevorli tutib turuvchi va erkin turgan devorlar; bordyurlar; chegaralari bilan tekshirilgan pandus va zinalar; IFC ga eksport.
keywords: qattiq qoplama, qoplama, qoplama plitalari, hovli, teras, nishablik, drenaj, koʻndalang qiyalik, baliqsuyak, yotiq terish, yoʻlka, piyodalar yoʻlagi, tutib turuvchi devor, bogʻ devori, poydevor, tepa qoplamasi, bordyur, chegaralash, pandus, qulaylik, zinalar, pogʻonalar, pogʻona balandligi, pogʻona yuzasi, oraliq sahn
from: 51475877
---

Qattiq qoplama har safar yer asosida qayta hisoblanadi, shuning uchun u relyefga moslashadi va yer yoki uning chizigʻi siljiganda qayta yaratiladi. Rejada uning burchaklarini boshqa chiziqlar kabi sudrang. Uni Landshaft guruhida joylashgan {{ui:Qattiq qoplamalar}} orqali oching.

## Qoplama

Burchaklarini bosing va {{key:Enter}} ni bosing. **Xususiyatlar**da:

- **Sath**: boʻsh = ostidagi yerning oʻrtacha sathi.
- **Nishablik**: sath, **koʻndalang qiyalik** (yoʻnalish tomon foizda) yoki **drenajga**: CivilCraft drenaj qayerga joylashishini bosib koʻrsatishni soʻraydi, soʻng har bir burchak drenajdan belgilangan nishablik bilan koʻtariladi. Rejadagi strelkalar nishablikni koʻrsatadi.
- **Naqsh** (toʻr, yotiq terish, baliqsuyak) birlik oʻlchami, chok va burchak bilan; **Chegaralash** kengligi. Varaqda bir millimetrdan yaqinroq choklar hisobga olinmaydi.
- Qoplama loyihaviy yuzaning bir qismidir. Uning qatlamlari (qoplama plitalari, yotqizish qatlami, asos) IFC va miqdorlarga kiradi.

## Yoʻlkalar

Yoʻl boʻylab bosing va {{key:Enter}} ni bosing. U yer boʻylab kuzatadi, oʻzining **koʻndalang qiyaligi** oʻng tomoniga qaratiladi. **Ruxsat etilgan eng tik qiyalik**dan tikroq yoʻl rejada oʻsha joyda `!` belgisi bilan qayd etiladi, va **Xususiyatlar** uning qanchalik tik boʻlishini koʻrsatadi.

## Devorlar

Devor boʻylab bosing va {{key:Enter}} ni bosing. Devor **tutib turuvchi** yoki **erkin turgan** boʻladi. **Tepa** kiritilmasa, u butun uzunligi boʻylab yerdan **Balandlik** masofasida turadi; tepani kiritsangiz, u shu sathda ushlab turiladi. Uning **poydevori** yerdan belgilangan chuqurlikda joylashadi va butun pogʻonalarda pastga tushadi, shuning uchun ular orasida sath saqlanadi. **Xususiyatlar** devorning uzunligi, balandliklari, old yuza maydoni va poydevor pogʻonalarini koʻrsatadi; reja har bir uchida devorning yuqori va past nuqtalarini (TW / BW) belgilaydi.

:::warning
1.2 m (4 ft) dan baland tutib turuvchi devor belgilanadi: uni muhandis loyihalaydi.
:::

## Bordyurlar

Bordyur boʻylab bosing va {{key:Enter}} ni bosing; uning kengligi va koʻtarilish balandligini belgilang.

## Pandus

Pastdan yuqoriga bosing va {{key:Enter}} ni bosing. Sathlar oxirgi nuqtalardagi yerdan olinadi, agar siz ularni kiritmasangiz. Pandus har 750 mm (2.5 ft) koʻtarilishda oraliq sahn oladi va **Ruxsat etilgan eng tik qiyalik** (dastlab 1:12) hamda eng kichik kengligi boʻyicha tekshiriladi; **Xususiyatlar** unga qanchalik uzun boʻlishi kerakligini koʻrsatadi.

## Zinalar

Pastki zinaning old qirrasini, soʻng zinalar yuqoriga yetgan joyni bosing va {{key:Enter}} ni bosing. Pogʻonalar soni balandlikdan va **Eng baland pogʻona**dan olinadi; tekislik chuqurligi (G) qulaylik qoidasi 2R + G ≈ 630 mm dan olinadi, lekin **Eng kichik pogʻona chuqurligi**dan kam boʻlmaydi; har bir **Bir marshdagi pogʻonalar soni eng koʻpi bilan** pogʻonadan keyin oraliq sahn boʻladi. **Xususiyatlar** zinalar ikki nuqta orasiga sigʻishini yoki qancha uzun boʻlishi kerakligini koʻrsatadi.

:::note
Pandus va zinalarning chegaralari belgilangan standart qiymatlardir. Qurilish kodingiz talab qiladigan qiymatlarni oʻrnating.
:::

## CivilCraft dan tashqari

- Yana › {{ui:Export landscape IFC}}: qoplama va yoʻllar `IfcPavement` sifatida, devorlar `IfcWall` sifatida (tutib turuvchi devorlar RETAININGWALL bilan) ularning qatlamlari bilan, bordyurlar `IfcKerb` sifatida, pandus `IfcRamp` sifatida, zinalar esa pogʻonalari va tekisliklari bilan `IfcStair` sifatida eksport qilinadi.
- O'simliklar jadvalidagi **TakeoffCraft**ga yuborish qoplama maydonlarini va qatlam hajmlarini, devorlarning old yuza maydonlari va uzunliklarini, bordyur uzunliklarini va zinalar sonini olib boradi.
- Batafsil varaq har bir tutib turuvchi devorning kesimini, har bir qoplamaning tuzilishini va zinalarning har bir marshini chizadi. Qarang: [Landshaft varaqlari](topic:landscape-sheets).
