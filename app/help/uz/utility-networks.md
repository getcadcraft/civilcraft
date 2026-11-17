---
title: Kommunal tarmoqlar va OpenStreetMap
summary: Suv, kanalizatsiya, yomgʻir suvi, gaz, elektr va aloqa yoʻllari: material, oʻlcham, qoplama va egasi bilan; Overpass JSON faylidan OpenStreetMap maʼlumotlari; kesishishlar, xandak kesimlari va hajmlar; DWG, DXF va PDF formatidagi xizmat qatlamlari; IFC quvur va kabel segmentlari.
keywords: kommunal, tarmoq, osm, openstreetmap, overpass, quvur, kabel, gaz, kanalizatsiya, yomgʻir, aloqa, elektr, suv, gidrant, quduq, xandak, kesishish, oraliq, qoplama, chuqurlik, dwg, ifc, georeferensli, qatlamlar
from: 8a85dace
---

Site boʻyicha koʻmilgan kommunal xizmatlarni har bir xizmat turi uchun alohida tarmoq sifatida chizing, ularning qayerda kesishishini tekshiring va ularni chizma qatlamlari hamda IFC sifatida chiqaring.

## Yoʻllar yaratish

Ochish: **Sirt, Yana, Kommunal tarmoqlar...**

- **Tanlovdan yoʻl yaratish** tanlangan trassa, xususiyat chizigʻi yoki quvurni siz tanlagan xizmat turidagi yoʻlga aylantiradi. Soʻngra jadvalda materialni, oʻlchamni (mm), qoplamani (quvur yoki kabelning ustki qismigacha boʻlgan chuqurlik) va egasini toʻldiring.
- **OpenStreetMap maʼlumotlarini oʻqish** saqlangan Overpass JSON faylini oʻqiydi (`out geom;` soʻrovi bilan). OpenStreetMap joylashuvi kenglik va uzunlik boʻyicha boʻlgani uchun avval loyihada koordinatalar tizimi boʻlishi kerak. Moddaga koʻra quvur yoʻllari, yer ostidagi elektr va aloqa kabellari, gidrantlar, quduqlar hamda yomgʻir kanalizatsiyasi oʻqiladi; boshqa hamma narsa chiqarib tashlangan deb sanaladi va bu haqda xabarda aytiladi. Havo liniyalari chiqarib tashlanadi.
- **OpenStreetMap xaritasini qoʻshish** rejа ostiga OpenStreetMap xaritasini qoʻshadi. U faqat Sozlamalar ichida internetdagi xarita qatlamlari yoqilgan boʻlsa chiziladi.

## Tekshiruvlar va natijalar

- **Kesishishlar**: plan boʻyicha kesishadigan turli xizmat yoʻllari roʻyxatga olinadi; yer yuzasi mavjud boʻlsa, ular orasidagi toza balandlik koʻrsatiladi. Minimal qiymat siz belgilaydigan joy egallovchi qiymat boʻlib, standart raqami emas.
- **Xandak**: har bir yoʻlga xandak beriladi (quvur oʻlchami va ikki tomondagi oraliq, yon qiyalik, yostiq) va hajm hisoblanadi. Jami natija oynada va CSV faylda koʻrsatiladi.
- **Chizma**: yoʻllar va nuqtalar xizmat qatlamlarida (masalan, U-WATR-RUN, U-POWR-RUN) joylashadi, shuning uchun ular PDF, DXF va DWG formatlariga oʻtadi.
- **IFC**: yoʻllar IFC eksportiga quvur segmentlari va kabel segmentlari sifatida, gidrantlar, klapanlar hamda kameralar bilan, har bir xizmat uchun bitta tizim sifatida, loyihaning koordinatalar tizimida kiradi.

## OpenStreetMap maʼlumotlari

OpenStreetMap maʼlumotlari OpenStreetMap hissadorlariga tegishli muallif huquqi bilan himoyalangan va ODbL litsenziyasi ostida tarqatiladi. Mualliflik koʻrsatkichi chizmaga, CSV ga va IFC ga qoʻshiladi. OpenStreetMap maʼlumotlarini oʻz ichiga olgan faylni ulashsangiz, mualliflik koʻrsatkichini saqlang va litsenziyaning bir xil shartlarda tarqatish shartlarini oʻqib chiqing.

## Hali bajarilmaganlar

Yoʻllar hali asbob bilan plan ustida nuqta-nuqta chizilmaydi, kesishishlar esa hali profil koʻrinishida chizilmaydi (hisoblash tayyor). Chuqurliklar, oʻlchamlar va oraliqlar dastlab joy egallovchi qiymatlar boʻlib, ulardan oʻz standartingizdagi raqamlar bilan foydalaning.
