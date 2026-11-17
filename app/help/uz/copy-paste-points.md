---
title: Geodezik nuqtalarni tanlash, nusxalash va qoʻyish
summary: Nuqtalarni bosish, Shift va oyna bilan yoki hammasini bir vaqtda tanlang; ularni yangi, hech qachon toʻqnashmaydigan nuqta raqamlari bilan nusxalang, kesing, qoʻying, joyida qoʻying, takrorlang va oʻchiring; nuqta qatorlarini elektron jadvalga va undan qoʻying.
keywords: nusxalash, qoʻyish, kesish, takrorlash, nuqtalarni oʻchirish, nuqtalarni tanlash, hammasini tanlash, oyna tanlash, window, bufer, elektron jadval, csv, raqamlarni qayta belgilash, nuqta raqamlari, joyida qoʻyish, klon, stakeout
from: 78a6aea7
---

Geodezik nuqtalarni loyiha ichida, ikki brauzer yorligʻi orasida va elektron jadvalga hamda undan nusxalash va qoʻyish mumkin. Har bir oʻzgarish bitta ortga qaytarish qadami, va yuza yangi nuqtalardan darhol qayta quriladi.

## Nuqtalarni tanlash

{{ui:Tanlash}} ({{key:V}}) bilan:

- Nuqtani tanlash uchun **bosing** (faqat uni). Uning raqamlari **Xususiyatlar** ostida koʻrsatiladi.
- {{key:Shift}} va **bosish** nuqtani tanlovga qoʻshadi yoki undan chiqaradi.
- {{key:Shift}} va **sudrash** quti chizadi: undagi nuqtalar tanlovga qoʻshiladi. Nuqtalar atrofida sudrasangiz, u lasso boʻladi; qarang: [Geodezik nuqtalarni lasso bilan tanlash](topic:lasso-selection). {{key:Shift}} siz sudrash, odatdagidek, surishdir.
- {{key:Mod+A}} (yoki {{ui:Yana}} › {{ui:Barcha nuqtalarni tanlash}}) har bir nuqtani tanlaydi.
- {{key:Esc}} (yoki {{ui:Yana}} › {{ui:Hech birini tanlamaslik}}) tanlovni tozalaydi.

Tanlangan nuqtalarda halqa boʻladi. Bir nechta tanlanganda **Xususiyatlar** ularning sonini, raqamlarini, balandlik diapazonini va guruhlarini koʻrsatadi.

## Nusxalash, kesish va oʻchirish

- {{ui:Nusxalash}} yoki {{key:Mod+C}} tanlangan nuqtalarni nusxalaydi. CivilCraft nusxani saqlaydi va uni tizim buferiga ham nuqta qatorlari sifatida qoʻyadi, shuning uchun uni toʻgʻridan-toʻgʻri elektron jadvalga yoki matn faylga qoʻyishingiz mumkin.
- {{ui:Yana}} › {{ui:Kesish}} yoki {{key:Mod+X}} ularni nusxalaydi va bir qadamda oʻchiradi.
- {{ui:Yana}} › {{ui:Oʻchirish}} yoki {{key:Delete}} ularni oʻchiradi. {{key:Mod+Z}} ularni qaytaradi.

Qatorlar nuqta, shimoliy koordinata, sharqiy koordinata, balandlik, tavsif (P,N,E,Z,D) tarzida, vergul bilan ajratilgan, uch oʻnlik xonali. Avval sharqiy, keyin shimoliy koordinata olish uchun [CivilCraft sozlamalari](topic:settings) da **Nuqta qatorlari** ni sozlang. Elektron jadval formula deb biladigan tavsif (=, +, - yoki @ bilan boshlanadigan) oldiga apostrof qoʻyiladi, shuning uchun u matn boʻlib qoladi.

## Qoʻyish

1. {{key:Mod+V}} ni bosing yoki {{ui:Qoʻyish}} ni tanlang. Nuqtalar koʻrsatkichni kuzatib kichik krestlar koʻrinishida boradi, ular kelgan joyga nuqtali chiziq bilan bogʻlangan.
2. Ular borishi kerak boʻlgan joyni bosing. Nusxalangan nuqtalarning oʻrtasi bosilgan joyga tushadi.
3. Yoki ularni oʻz koordinatalariga qoʻyish uchun {{key:Enter}} ni bosing, yoki bekor qilish uchun {{key:Esc}} ni bosing.

{{ui:Yana}} › {{ui:Joyida qoʻyish}} yoki {{key:Mod+Shift+V}} nuqtalarni darhol ularning oʻz koordinatalariga qoʻyadi. Qoʻyilgan nuqtalar keyin tanlanadi, shuning uchun ularni yana nusxalashingiz, koʻchirishingiz yoki oʻchirishingiz mumkin.

:::note
Asboblar panelidagi {{ui:Qoʻyish}} ni bosish tizim buferini oʻqiydi. Birinchi marta brauzer CivilCraft buferni koʻrishi mumkinmi, deb soʻrashi mumkin. Rad etsangiz, asboblar paneli tugmasi faqat CivilCraft ning oʻz nusxasini qoʻyadi; {{key:Mod+V}} esa baribir soʻramasdan elektron jadvaldagi qatorlarni qoʻyadi.
:::

## Nuqta raqamlari hech qachon toʻqnashmaydi

Ikki nuqta hech qachon bir raqamga ega boʻlmaydi. Qoʻyganingizda:

- Qoʻyilgan nuqta loyihada hech bir nuqta egallamagan boʻlsa, oʻz raqamini saqlaydi. Shunday qilib **Kesish** dan keyin nuqtalar oʻz raqamlari bilan qaytadan qoʻyiladi, boshqa loyihadan nusxalangan nuqtalar esa boʻsh boʻlsa oʻz raqamlarini saqlaydi.
- Raqami band boʻlgan qoʻyilgan nuqta yangi butun raqam oladi: ishlatilayotgan eng katta raqamdan bittaga katta, ortib boradi.
- Holat satri nima boʻlganini aytadi, masalan "1 ta oʻz raqamini saqladi; 9 tasi yangi raqam oldi: 10–18 277–285 boʻldi".

[CivilCraft sozlamalari](topic:settings) da **Har doim yangi raqamlar** ni tanlashingiz mumkin, va yangi raqamlar boshlanadigan sonni, masalan loyiha nuqtalari uchun 5000 ni.

:::warning
**Uzilish chizigʻi** sifatida yuzani quradigan nuqta guruhlari nuqtalarini raqam tartibida birlashtiradi. Uzilish chizigʻi nuqtalarining qoʻyilgan nusxalari (masalan FL oʻlchovlari) yangi, kattaroq raqamlar oladi va shu uzilish chizigʻi oxiriga qoʻshiladi, ehtimol uzun sakrash bilan. Bunday nuqtalarni qoʻygandan keyin rejani tekshiring yoki ularning guruhini {{ui:Nuqtalar}} ga oʻrnating.
:::

## Takrorlash

{{ui:Yana}} › {{ui:Takrorlash}} yoki {{key:Mod+D}} tanlangan nuqtalarning koʻrsatkichni kuzatuvchi nusxasini yaratadi: u qayerga borishi kerak boʻlsa, oʻsha yerni bosing. Nusxalar doim yangi raqam oladi, CivilCraft buferi esa oʻz holicha qoladi.

## Elektron jadval yoki matn faylidan

Elektron jadvalda nuqta qatorlarini (nuqta, shimoliy koordinata, sharqiy koordinata, balandlik, tavsif) tanlang va nusxalang. CivilCraft da {{key:Mod+V}} ni bosing va ular borishi kerak boʻlgan joyni bosing, yoki {{key:Mod+Shift+V}} ni bosing, ularni oʻz koordinatalariga qoʻyish uchun; bu odatda haqiqiy geodezik maʼlumotlar uchun kerak boʻladi.

Qatorlar aynan [nuqta fayli](topic:point-file-formats) kabi oʻqiladi: vergul, tabulyatsiya yoki boʻshliq, sarlavha qatori boʻlsa, undan. Sarlavhasiz boʻlsa, ustunlar tartibi [CivilCraft sozlamalari](topic:settings) dagi **Nuqta qatorlari** dan olinadi.

Ikkalasi ham boʻlsa, CivilCraft qaysi biri yangiroq ekanini hal qiladi: tizim buferidagi, CivilCraft ning oxirgi nusxasidan farq qiladigan qatorlar keyinroq nusxalangan, shuning uchun ular qoʻyiladi. Nuqta boʻlmagan matn eʼtiborsiz qoldiriladi va oʻrniga CivilCraft ning oʻz nusxasi qoʻyiladi.

## Loyihalar va yorliqlar orasida

Nusxa shu brauzerda saqlanadi, shuning uchun CivilCraft ning ikkinchi yorligʻi uni birinchi yorliq yopilgandan keyin ham qoʻyishi mumkin. Metrdagi loyihada nusxalangan va futdagi loyihaga qoʻyilgan nuqtalar raqamlarini oʻzgartirmasdan saqlaydi: hech narsa aylantirilmaydi va holat satri buni aytadi.

## Nima nusxalanmaydi

Hozircha faqat geodezik nuqtalar nusxalanadi. Trassalar, maydonchalar, quvur tarmoqlari, uzilish chiziqlari va chegaralarni hali nusxalash yoki qoʻyib boʻlmaydi. Qoʻyish mavjud nuqtalarni koʻchira olmaydi: {{ui:Kesish}} va qoʻyishdan foydalaning yoki nuqtalarni bittadan koʻchiring ([Geodezik nuqtani tahrirlash](topic:edit-points)).
