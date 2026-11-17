---
title: Saytni 3D da eksport qilish
summary: 3D koʻrinish koʻrsatganini GLB yoki OBJ fayl sifatida boshqa 3D dasturlar uchun saqlang: metrda, Y yuqoriga, fayl yozib qoʻygan mahalliy boshlangʻich nuqta atrofida.
keywords: glb, gltf, obj, 3d eksport, eksport 3d, model eksporti, oʻyin dvigateli, vizualizatsiya, 3d koʻruvchi, metr, y yuqoriga, boshlangʻich nuqta, mahalliy boshlangʻich nuqta, davlat tekisligi
from: 07d23992
---

3D koʻrinish uning koʻrsatganini boshqa dastur ocha oladigan 3D model sifatida eksport qiladi: 3D koʻruvchi, modelyor, oʻyin dvigateli yoki vizualizatsiya vositasi.

## Eksport

1. 3D koʻrinishni oching ({{key:D}}) va {{ui:Show}} bilan nima koʻrinishini tanlang. Yashirilgan narsa eksport qilinmaydi.
2. Panelda {{ui:GLB}} yoki {{ui:OBJ}} ni bosing.
   Fayl "*loyiha nomi*-3d.glb" yoki "-3d.obj" nomi bilan yuklab olinadi va holat paneli boshlangʻich nuqtani koʻrsatadi.

## Fayllarda nima boʻladi

| | GLB | OBJ |
|---|---|---|
| Sirtlar | Normallari va tasma yoki sirt ranglari bilan toʻrlar | Normallari bilan toʻrlar (ranglarsiz) |
| Quvurlar va inshootlar | Yumaloq toʻrlar, muammoli ajratilganlari qizil | Yumaloq toʻrlar |
| Konturlar, sinuvchi chiziqlar, trassalar, belgilar, koridor va platforma chiziqlari | Chiziqlar, har biri oʻz rangida | Chiziq yozuvlari (`l`) |
| Geodezik nuqtalar | Nuqtalar | Nuqta yozuvlari (`p`) |

Har bir toʻplam oʻz nomini saqlaydi ("Existing ground", "Pipes", "Major contours" va hokazo), shuning uchun uni boshqa dasturda yashirish yoki uslublash mumkin.

## Birliklar, oʻqlar va boshlangʻich nuqta

- **Metr.** Futli loyiha AQSh geodezik futidan aylantiriladi (1 ft = 1200/3937 m).
- **Y yuqoriga**, bu formatlar uchun odatiy qoida: easting +X ga, balandlik +Y ga, northing esa −Z ga aylanadi.
- **Haqiqiy masshtab.** Koʻrinishning vertikal kuchaytirilishi qoʻllanmaydi.
- **Mahalliy boshlangʻich nuqta.** Davlat tekisligi koordinatalari million futlarda boʻladi, ya'ni bu formatlar saqlaydigan bir aniqlikdagi raqamlar uchun juda katta. Shuning uchun fayl yaqin boshlangʻich nuqtaga nisbatan yoziladi: easting va northing uchun mavjud yerning oʻz boshlangʻich nuqtasi, balandlik uchun esa uning eng past nuqtasi pastga yaxlitlangan qiymati. Boshlangʻich nuqta loyiha birliklarida faylga yoziladi: GLB da sahna va uning yuqori tuguni ustidagi `extras` sifatida, OBJ da esa fayl boshi yaqinidagi izoh qatori sifatida (`# origin easting … northing … elevation …`). Modelni loyiha koordinatalariga qaytarish uchun boshlangʻich nuqtani qoʻshing (futli loyihada metrlarni futga qaytargandan keyin).

## Hali qurilmagan

- Kuchaytirilgan koʻrinishni yoki loyiha birliklarida (metr oʻrniga) eksport qilish.
- Teksturalar, OBJ uchun material fayli (.mtl) va har bir obyekt xususiyatlari (quvur va inshootlar nomlari faqat CivilCraft da).
- Koridorni alohida qattiq jismlar sifatida yoki profil koʻrinishini 3D da eksport qilish.
