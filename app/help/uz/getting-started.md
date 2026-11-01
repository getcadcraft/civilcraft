---
title: CivilCraft bilan boshlash
summary: CivilCraft nima qilishi, uni qanday ochish va namuna hudud bilan birinchi oʻn daqiqa — nuqtalardan gorizontallargacha, yoʻlgacha va saqlangan loyihagacha.
keywords: boshlash, birinchi ishga tushirish, namuna hudud, kirish, tezkor boshlash, qoʻllanma, yangi loyiha
from: c9b6dd8e
---

CivilCraft — CadCraft oilasining civil va hudud loyihalash ilovasi. U geodezik nuqtalarni olib, ulardan gorizontallari bilan sirt (TIN) yaratadi; soʻngra trassalarni loyihaviy profillar bilan joylashtirish, oddiy yoʻl koridorini surish, bino maydonchalarini mavjud yer bilan tutashguncha tekislash, gravitatsion quvur tarmogʻini qoidalaringizga qarshi tekshirish va qazish va toʻldirish hajmlarini koʻrish imkonini beradi. U LandXML ni oʻqiydi va yozadi, rejani DXF sifatida eksport qiladi va PDF ga chizadi.

Agar Civil 3D dan foydalangan boʻlsangiz, gʻoyalar tanish boʻladi: nuqtalar, nuqtalar guruhlari, uzilish chiziqlari, PI boʻyicha trassalar, PVI boʻyicha profillar, koridorlar, tekislash, quvur tarmoqlari. Ishlash usuli boshqacha va ancha oddiy: buyruq satri, uslublar va chizma fayli yoʻq. Birinchi haqiqiy ishingizdan oldin [Boshqa civil dasturlaridan kelish](topic:coming-from) ni bir marta oʻqing.

## Nima kerak

- Zamonaviy ish stoli brauzeri: Chrome, Edge, Firefox yoki Safari. Qarang: [Brauzerlar](common:browsers).
- Sichqoncha yoki sensorli panel va klaviatura, yoki sensorli ekran: chizishda ekranda {{ui:Tugatish}}, {{ui:Nuqtani bekor qilish}} va {{ui:Bekor qilish}} tugmalari bor (qarang: [Sichqoncha, sensorli panel va teginish](topic:keyboard#mouse-trackpad-and-touch)).
- Reja brauzerning canvas i bilan 2D da chiziladi. [3D koʻrinish](topic:site-3d) brauzerning WebGL grafikasidan foydalanadi; u ishga tushmasa, holat paneli sababini aytadi va reja baribir ishlaydi.
- Hisob yoʻq va yuklash yoʻq. Fayllar kompyuteringizda ochiladi va yuklab olish sifatida saqlanadi. Qarang: [Fayllaringiz](common:your-files).

:::note
CivilCraft hozir ishlab chiqilayotgan erta brauzer versiyasi sifatida ishlaydi. Ish stoli versiyalari hali mavjud emas va bulutga saqlash ham hali mavjud emas. Siz yaratgan hamma narsa saqlanmaguningizcha yoki eksport qilinmaguncha kompyuteringizda qoladi.
:::

## CivilCraft ni ochish

1. CivilCraft ni brauzeringizda oching.
2. Ekran toʻlishini kuting: yuqorida asboblar paneli, chapda panel, oʻrtada reja va oʻngda **Xususiyatlar** paneli.
3. Boʻsh rejada **Geodezik nuqtalar bilan boshlang** deb nomlangan quti koʻrinadi. Unda birinchi qadamlar roʻyxati va {{ui:Namuna hududni oching}} havolasi bor.

Keyinchalik CivilCraft ni ulanishsiz ishlatish uchun ilova panelidagi {{ui:Oflayn uchun saqlash}} tugmasini bosing va {{ui:Oflayn tayyor}} koʻrinishini kutib turing. Unga bu yordam, namuna hudud, 3D va GIS kutubxonalari kiradi. Qarang: [Oflayn](common:offline). Istalgan vaqtda {{key:F1}} tugmasini bosing yoki bu yordamni ilova yonida ochish uchun {{ui:Yordam}} tugmasini bosing.

## Birinchi oʻn daqiqa: namuna hudud

Namuna hudud AQSh futlarida kichik geodezik oʻlchov: davlat tekisligi koordinatalarida 276 nuqta, tizma, oqim chizigʻi bilan botiq va ikki qirgʻoq choʻqqisi. U ilova bilan birga keladi, shuning uchun oʻz faylingiz boʻlmasa ham kuzatib borishingiz mumkin.

1. Rejadagi qutida {{ui:Namuna hududni oching}} tugmasini bosing.
   **Nuqtalarni import qilish** oynasi ochiladi. U "Sarlavha qatoridan PNEZD formatida 276 nuqta oʻqildi, vergul bilan ajratilgan." deydi va birinchi qatorlarni koʻrsatadi.
2. {{ui:Import}} tugmasini bosing.
   Reja nuqtalar, gorizontallar va sirt chekkasi bilan toʻladi. Pastdagi holat paneli nuqtalar import qilinganini va sirtda nechta uchburchak borligini koʻrsatadi (546).
3. Chap paneldagi **Nuqtalar** boʻlimiga qarang. Nuqtalar tavsifining birinchi soʻzi boʻyicha guruhlangan: CP, FL, GRD, RIDGE, TBN, TBS va TREE.
4. Jadvalning **Yuza** ustunida **FL**, **RIDGE**, **TBN** va **TBS** ni {{ui:Sinuvchi chiziq}} ga qoʻying.
   Sirt darhol qayta quriladi. **Yuza** maʼlumotlari endi "{{ui:Uzilish chiziqlari}}: 4" deydi va gorizontallar oqim chizigʻi va tizma boʻylab keskin egiladi, ularni kesib oʻtmaydi.
5. Kursorni reja ustiga olib boring. Holat paneli sharq va shimol koordinatalarini hamda oʻsha yerdagi yer balandligini koʻrsatadi.
6. **Koʻrinish** boʻlimida {{ui:Horizontallar har}} ni 0.5 ft ga qoʻying va {{ui:Balandlik zonalari}} ni yoqing. Belgilar ostida legenda bilan rang gradatsiyasi paydo boʻladi. Tugatganingizda zonalarni yana oʻchiring.

Endi sizda mavjud yer sirti bor. Keyin yoʻl.

## Qisqa yoʻl joylashtirish

1. {{key:A}} tugmasini bosing (yoki **Loyihalash** guruhidagi {{ui:Trassa}} ni bosing).
2. Hudud boʻylab uchta nuqtani ketma-ket bosing. Qizil chiziq kursorga ergashadi va keyingi tangensning uzunligi va yoʻnalishini koʻrsatadi.
3. Tugatish uchun {{key:Enter}} tugmasini bosing.
   Trassa pikketlash bilan paydo boʻladi. Oʻng panelda **Trassa** koʻrinadi: uning uzunligi, PI jadvali va oʻrta PI dagi egri (100 ft radius, yoki 100 ft sigʻmasa undan kichik).
4. Oʻng paneldagi **Loyihaviy profil** ostida {{ui:Yer yuzasidan boshlash}} ni bosing.
   Profil koʻrinishi reja ostida mavjud yer va bir uchidan ikkinchisigacha toʻgʻri loyihaviy nishablik bilan ochiladi.
5. {{key:I}} tugmasini bosib {{ui:PVI qoʻshish}} ni yoqing, soʻng profil koʻrinishida oʻrta yaqinida bir marta bosing. PVI paydo boʻladi.
6. Oʻng paneldagi PVI jadvalida oʻrta PVI ning **Egri L** maydoniga egri uzunligini (masalan 100) yozing va {{key:Enter}} ni bosing. Profilda K qiymati belgilangan vertikal egri paydo boʻladi.
7. **Koridor** ostida **Loyihaviy profil boʻylab yigʻmani surish** katagini belgilang.
   Yoʻl yerga tekislanadi: yoʻl polosalari, yelkalar va yon nishablar mavjud yer sirtigacha. **Yer ishlari** bloki qazish va toʻldirishni koʻrsatadi.

Aniq qiymatlar haqida tashvishlanmang. Har bir raqamni oʻng paneldan oʻzgartirish mumkin, {{key:Mod+Z}} esa oxirgi oʻzgarishni bekor qiladi.

## Ishingizni saqlang

1. Chap panelning yuqorisidagi **Nom** maydoniga nom yozing.
2. {{key:Mod+S}} tugmasini bosing (yoki {{ui:Saqlash}} ni bosing).
   Brauzer sayt nomi bilan nomlangan va `.civilcraft.json` bilan tugaydigan faylni yuklab oladi. Unda nuqtalar, sirt sozlamalari, trassalar, profillar, koridorlar, maydonchalar va quvurlar boʻladi.
3. Keyinroq davom etish uchun {{ui:Ochish}} tugmasini bosing (yoki {{key:Mod+O}} tugmalarini bosing) va shu faylni tanlang yoki uni rejaga tashlang.

:::warning
Avtomatik saqlash yoʻq. Saqlanmagan oʻzgarishlar bilan yorliqni yopsangiz, brauzer chiqishni soraydi; chiqsangiz, oʻzgarishlar yoʻqoladi. Tez-tez saqlang.
:::

## Keyin nima qilish

- Oʻz fayllaringiz bilan [Geodezik nuqtalarni import qilish](topic:import-points).
- [Sirtni uzilish chiziqlari va chegara bilan qurish](topic:build-surface).
- [Ekran, qismlar boʻyicha](topic:workspace).
- [Tugmalar va sichqoncha](topic:keyboard).
