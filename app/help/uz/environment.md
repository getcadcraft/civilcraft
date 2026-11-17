---
title: Soya, quyosh hosildorligi va tashqi qulaylik
summary: Bino massalari bir kun yoki mavsum davomida tashlagan soyani tekshiring va uni animatsiyada koʻring. Tomlar va devorlardagi quyosh panellari tipik yilda qancha elektr berishini hisoblang, bino yonidagi koʻchaning qulayligini koʻring (UTCI) va piyodalar uchun shamol qulayligining dastlabki bahosini oling.
keywords: soya tadqiqi, soya, quyosh soatlari, animatsiya, quyosh, PV, fotoelektrik, panellar, hosildorlik, kWh, EPW, ob-havo fayli, UTCI, issiqlik qulayligi, tashqi qulaylik, issiqlik stressi, shamol
from: 96e7af4d
---

**Atrof-muhit** boʻlimi massaning **Xususiyatlari** ichida **Quyosh soatlari** ostida joylashgan. U chizgan massalaringizni binolar sifatida ishlatadi.

## Ob-havo faylini yuklash

Shahringiz uchun tipik yillik ob-havo faylini (**.epw**) tanlang. Ular EnergyPlus ob-havo saytidan va climate.onebuilding.org dan bepul olinadi. Fayl bu tashrif davomida brauzeringizda qoladi. Quyosh hosildorligi va qulaylik tadqiqi unga muhtoj; soya tadqiqi esa loyihada koordinatalar tizimi boʻlsa, usiz ishlaydi.

## Soya tadqiqi

Sana tanlang (yoki **Mavsum** ni belgilang va oxirgi sana hamda qadam kunlarda) va vaqt mintaqasini, soʻng **Soya tadqiqini ishga tushirish**. Massalar atrofidagi yerdagi quyosh soatlari yoki soya xaritasini, kun davomida yerning qancha qismi soyada ekani jadvalini va kunning animatsiyasini olasiz: uni ijro etish yoki qadamma-qadam koʻrish mumkin. **Xaritani saqlash**, **Animatsiya kadrlarini saqlash** (barcha kadrlar bitta rasmda) va **Soatlarni saqlash** (CSV) natijalarni saqlaydi.

Yer eng past massaning darajasida tekis deb olinadi. Qiya yerdagi soya uchun relyefni oʻqiydigan **Quyosh soatlari** dan foydalaning.

## Quyosh hosildorligi

Panel samaradorligini, har bir tom va devorning qancha qismi qoplanganini va tizim yoʻqotishlarini sozlang, soʻng **Quyosh hosildorligini ishga tushirish**. Har bir tom va devor uchun tipik yilda bir kvadrat metr panel qancha elektr berishini, qoʻshni massalar undan qancha olib qoʻyishini va har bir massa uchun jami qiymatni olasiz. Model tugmasi yonida oddiy soʻzlar bilan yozilgan: bu tipik yildan olingan rejalashtirish bahosi, kafolat emas.

## Tashqi qulaylik

**Qulaylikni hisoblash** ochiq yerda va birinchi massa yonida (janub, shimol, sharq va gʻarb tomonlari) turgan odam uchun universal issiqlik iqlim indeksini (UTCI) hisoblaydi, har bir massaning soyasi bilan. U qancha osmon koʻrinishini, kunduzgi oʻrtacha UTCI ni hamda 32 dan yuqori (issiqlik stressi) va 0 dan past (sovuq stress) soatlar sonini koʻrsatadi.

## Shamol (dastlabki baho)

**Shamol tadqiqini ishga tushirish** massalaringiz atrofidagi havo oqimini ob-havo faylingizda esadigan har bir shamol yoʻnalishi uchun (4, 8, 12 yoki 16 yoʻnalish) bir marta hal qiladi, siz tanlagan muhit (ochiq dala, shahar chekkasi yoki markaz) ustida, soʻng butun yillik soatlik shamolni yigʻadi. Xarita yerni qulaylik sinfi boʻyicha boʻyaydi: yashildan (**oʻtirish**) — **turish**, **sayr qilish** va **yurish** orqali qizilgacha (**noqulay**). Faoliyat chegara tezligi (4, 6, 8 va 10 m/s) soatlarning 5 % dan koʻpida oshmasa, oʻsha faoliyat tanlanadi. Ikkinchi jadval NEN 8100 darajasini (A dan E gacha) shamol 5 m/s dan oshadigan soatlar ulushidan beradi. Shamol toʻlqini koeffitsienti soatlik oʻrtacha qiymatni koʻpaytirib, samarali shamol toʻlqinini beradi.

Qanday ishlashi oddiy soʻzlar bilan: massalar atrofidagi quti ichida lattice-Boltzmann katta girdobli oqim yechuvchisi (oʻzimizniki, `lib/wind` kutubxonasida), tanlangan notekislik boʻyicha balandlik bilan oshadigan shamol tezligi profili, va yerdan taxminan 1.5 m dagi tezlik 10 m balandlikdagi yuqori oqim tezligi bilan solishtiriladi. **Dastlabki baho** tez va qoʻpol; **Standart** koʻproq katakchalardan foydalanadi va ancha uzoq ishlaydi. Agar panel toʻr qoʻpol ekanini (eng baland bino ustida 10 katakdan kam) yoki oqim hali oʻzgarib turganini aytsa, xaritaga kamroq ishoning.

**Bu nima emas.** Yechuvchi darslik oqimlarida (kanal, qopqoqli boʻshliq) tekshirilgan va burchaklardagi iz hamda tezlik oshishi toʻgʻri koʻrinishi uchun kub ustida ishlatilgan. U binolarning shamol tunnelidagi oʻlchovlari bilan tasdiqlanmagan, shuning uchun har bir natija tasdiqlanmagan deb belgilanadi. Uni loyiha qiymati, shamol yuki yoki rejalashtirish sertifikati uchun ishlatmang: toʻgʻri tadqiqotni shamol muhandisi oʻtkazib tasdiqlashi kerak. Tekis yer, silliq bino devorlari, ob-havo stansiyasining notekislik qisqa yoʻli va chegara jadvali soddalashtirishlardir; chegaralar sizning hokimiyatingiz mezonlaridan farq qilishi mumkin.

## OpenFOAM bilan shamol (qoʻshimcha)

Yuqoridagi oʻrnatilgan shamol dvigateli tajribaviy. Toʻgʻri oqim yechuvchisi uchun **Sozlamalar > Qoʻshimchalar** da **Piyodalar shamoli (OpenFOAM)** qoʻshimchasini yoqing (siz yoqmaguningizcha u oʻchiq). Bu oʻz GPL litsenziyali dasturi, CadCraft ning qolgan qismidan ajratilgan, va OpenFOAM ni oʻz ichiga olmaydi: uni oʻzingiz oʻrnatasiz. Keyin shamol blokidagi **Dvigatel** OpenFOAM ni koʻrsatadi.

Bir marta sozlanadigan narsalar:

1. **OpenFOAM ni oʻrnating** (openfoam.com dan ESI v-seriyasi; qoʻshimcha v2512 bilan sinovdan oʻtgan). Ubuntu yoki Debian da (Windows da WSL ichida ham): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, soʻng `sudo apt install openfoam2512-default`. U `/usr/lib/openfoam/openfoam2512` ostida oʻrnatiladi. CadCraft ishlashi uchun `blockMesh`, `snappyHexMesh` va `simpleFoam` kerak. (Ubuntuning oʻz arxividagi eski `openfoam` 1912 paketi ham ishlaydi, lekin uning funksiya obyektlari ishdan chiqadi; u holda qoʻshimcha natija fayllarini oʻzi oʻqiydi.)
2. **Yordamchini ishga tushiring**: qoʻshimchaning `runner` papkasidan Node.js bilan: `node cc-openfoam-runner.mjs serve`. Agar OpenFOAM qidiruv yoʻlida boʻlmasa, unga OpenFOAM ning `etc/bashrc` yoʻli bilan kichik `runner.json` faylini bering (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) va uni `--config runner.json` bilan ishga tushiring. Yordamchi faqat shu kompyuterda tinglaydi va token chop etadi.
3. **Tokenni joylashtiring** shamol blokidagi qoʻshimcha maydonlariga (manzil `http://127.0.0.1:8765` qoladi) va **Yordamchini tekshirish** tugmasini bosing.

Shundan keyin **Shamol tadqiqini ishga tushirish** ob-havo faylidagi har bir shamol yoʻnalishi uchun bitta holat bilan ishlaydi: massalaringiz STL sirti sifatida odatdagi qoida boʻyicha oʻlchangan quti ichida (bino balandligining 5 barobari atrofda va undan yuqori, orqada 10 barobari), blockMesh va snappyHexMesh bilan toʻrlanadi, barqaror k-epsilon RANS sifatida atmosfera chegara qatlami kirishi bilan tanlangan notekislik ustida ishlaydi, va 1.5 m dagi tezlik qayta oʻqilib, bir xil Lawson va NEN 8100 sinflariga aylantiriladi. Hech narsa kompyuteringizdan chiqmaydi.

**Nima tekshirilgan.** Natijalar ustidagi matn buni ochiq aytadi va har bir saqlangan CSV ning bir qismi. Qoʻshimchaning holat yozish, natijalarni oʻqish va butun konveyeri OpenFOAM siz sinovdan oʻtkazilgan; bitta kub haqiqiy OpenFOAM orqali uch xil toʻr oʻlchamida ishlatilgan (raqamlar loyiha yozuvlarida). U binolarning shamol tunnelidagi oʻlchovlari bilan tasdiqlanmagan. Bu dastlabki baho, loyiha qiymati emas va sertifikat emas. Standart k-epsilon binolar oldida turbulentlikni ortiqcha bashorat qiladi, yer tekis, devorlar silliq va relyef yoki oʻsimlik yoʻq.
