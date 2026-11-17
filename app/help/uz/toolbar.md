---
title: Asboblar paneli boʻyicha qoʻllanma
summary: CivilCraft dagi har bir asboblar paneli tugmasi, uning klavishasi, nima qilishi va qachon xiralashishi yoki rad etishi.
keywords: asboblar paneli, tugmalar, buyruqlar, asboblar, fayl, eksport, sirt, loyiha, tahrirlash, koʻrinish, menyu
from: 4c4352bc
---

Asboblar paneli ilova yuqorisida yetti guruh boʻylab joylashgan. Har bir tugma ustiga kelganda oʻz maslahat matnini va klavishasini koʻrsatadi.

## Fayl

| Tugma | Klavisha | Nima qiladi |
|---|---|---|
| {{ui:Yangi}} | yoʻq | Boʻsh loyiha boshlaydi. Saqlanmagan oʻzgarishlar boʻlsa avval soraydi. |
| {{ui:Ochish}} | {{key:Mod+O}} | Nuqtalar faylini (CSV, TXT), LandXML yoki CivilCraft loyihasini ochadi. |
| {{ui:Saqlash}} | {{key:Mod+S}} | Loyihani `<name>.civilcraft.json` sifatida yuklab oladi. |

## Eksport

| Tugma | Klavisha | Nima qiladi |
|---|---|---|
| {{ui:LandXML}} | yoʻq | `<name>.xml` ni yuklab oladi: nuqtalar, sirtlar, trassalar, profillar va quvur tarmogʻi LandXML 1.2 formatida. Loyiha boʻsh boʻlsa: "Hali eksport qilinadigan narsa yoʻq." |
| {{ui:DXF}} | yoʻq | `<name>.dxf` ni yuklab oladi: reja chiziqlari R12 DXF formatida. |
| {{ui:PDF}} | {{key:Mod+P}} | **Rejani PDF ga chizish** ni ochadi. Loyiha boʻsh boʻlsa: "Hali chizish uchun narsa yoʻq." |

## Sirt

| Tugma | Klavisha | Nima qiladi |
|---|---|---|
| {{ui:Sinuvchi chiziq}} | {{key:B}} | Geodezik nuqtalarga tartib bilan bosing, tugatish uchun {{key:Enter}}. Sinuvchi chiziq nuqtalarning balandliklarini oladi. |
| {{ui:Chegara}} | {{key:O}} | Tashqi chegaraning burchaklariga bosing, tugatish uchun {{key:Enter}}. Har qanday chegarani almashtiradi. |

Ikkalasi ham sirt yoʻq boʻlganda "Hali sirt yoʻq: avval geodezik nuqtalarni oching." deydi.

## Loyiha

| Tugma | Klavisha | Nima qiladi |
|---|---|---|
| {{ui:Trassa}} | {{key:A}} | PI larga tartib bilan bosing, tugatish uchun {{key:Enter}}. |
| {{ui:Maydoncha}} | {{key:G}} | Maydonchaning burchaklariga bosing, tugatish uchun {{key:Enter}}. Sirt asboblari kabi, sirt yoʻq boʻlsa ogohlantiradi; maydoncha faqat sirtda tekislanadi. |
| {{ui:Quvurlar}} | {{key:P}} | Inshootlarga yuqoridan pastga qarab bosing (mavjudiga bosib unga qoʻshiling), tugatish uchun {{key:Enter}}. |
| {{ui:Profil}} | {{key:R}} | Reja ostidagi profil koʻrinishini koʻrsatadi yoki yashiradi. |

## Tahrirlash

| Tugma | Klavisha | Nima qiladi |
|---|---|---|
| {{ui:Ortga qaytarish}} | {{key:Mod+Z}} | Oxirgi oʻzgarishni bekor qiladi (200 tagacha). Bekor qilinadigan narsa boʻlmasa xiralashadi. |
| {{ui:Qayta bajarish}} | {{key:Mod+Y}} | Bekor qilinganni qayta bajaradi. Qayta bajariladigan narsa boʻlmasa xiralashadi. |
| {{ui:Nusxalash}} | {{key:Mod+C}} | Tanlangan geodezik nuqtalarni nusxalaydi va elektron jadval qabul qila oladigan nuqta qatorlari sifatida xotiraga qoʻyadi. Nuqtalar tanlanmaguncha xiralashadi. |
| {{ui:Qoʻyish}} | {{key:Mod+V}} | Nuqtalarni qoʻyadi: ular koʻrsatkichga ergashadi va bosish ularni hech bir boshqa nuqtada boʻlmagan raqamlar bilan qoʻyadi. Elektron jadvalda nusxalangan nuqta qatorlari ham qoʻyiladi. |
| {{ui:Yana}} | yoʻq | Quyidagi menyuni ochadi. |

{{ui:Yana}} menyusi:

| Band | Klavisha | Nima qiladi |
|---|---|---|
| {{ui:Kesish}} | {{key:Mod+X}} | Tanlangan nuqtalarni nusxalaydi va oʻchiradi (bitta ortga qaytarish qadami). |
| {{ui:Nusxalash}} | {{key:Mod+C}} | {{ui:Nusxalash}} tugmasi kabi. |
| {{ui:Qoʻyish}} | {{key:Mod+V}} | {{ui:Qoʻyish}} tugmasi kabi. |
| {{ui:Joyida qoʻyish}} | {{key:Mod+Shift+V}} | Nuqtalarni oʻz koordinatalarida, hech bir boshqa nuqtada boʻlmagan raqamlar bilan qoʻyadi. |
| {{ui:Takrorlash}} | {{key:Mod+D}} | Tanlangan nuqtalarning nusxasi koʻrsatkichga ergashadi; qayerga borishini bosing. Xotira oʻzgarmaydi. |
| {{ui:Oʻchirish}} | {{key:Delete}} | Tanlangan geodezik nuqtalarni yoki tanlangan trassani, maydonchani, inshootni (uning quvurlari bilan), quvurni yoki PVI ni oʻchiradi. |
| {{ui:Barcha nuqtalarni tanlash}} | {{key:Mod+A}} | Har bir geodezik nuqtani tanlaydi. |
| {{ui:Hech birini tanlamaslik}} | {{key:Esc}} | Tanlovni tozalaydi. |

Hozir bajara olmaydigan band xiralashadi va uning maslahat matni sababini aytadi. Batafsil: [Geodezik nuqtalarni tanlash, nusxalash va qoʻyish](topic:copy-paste-points).

Ortga qaytarish loyiha, sirt sozlamalari va geodezik nuqtalardagi tahrirlarni qamrab oladi (qoʻyish, kesish, takrorlash, oʻchirish). Koʻrinish sozlamalarini qamrab olmaydi; istalgan faylni ochish yoki import qilish uni tozalaydi.

## GIS

| Tugma | Klavisha | Nima qiladi |
|---|---|---|
| {{ui:Koordinatalar}} | yoʻq | **Koordinatalar tizimi** dialogini ochadi: loyiha qaysi tizimda ekanini ayting yoki yer yoki mahalliy koordinatalardan foydalaning. Qarang [Loyiha koordinatalar tizimini belgilash](topic:coordinate-systems) va [Yer va mahalliy koordinatalar](topic:ground-and-local-coordinates). |
| {{ui:Import}} | yoʻq | GIS maʼlumotlarini import qiladi: shapefayllar, GeoJSON, GeoPackage, balandlik toʻrlari va LiDAR. Qarang [GIS maʼlumotlarini import qilish](topic:gis-import). |
| {{ui:Eksport}} | yoʻq | Ijro etilgan maʼlumotlarni GIS boʻlimi uchun eksport qiladi. Qarang [GIS uchun ijro etilgan maʼlumotlarni eksport qilish](topic:gis-export). |
| {{ui:Tahlil}} | yoʻq | GIS tahlil panelini ochadi: bufer, ustma-ustlik, fazoviy birlashtirish, atribut boʻyicha tanlash, oʻlchash. Qarang [GIS qatlamlarini tahlil qilish](topic:gis-analysis). |
| {{ui:Atributlar jadvali}} | yoʻq | Sirt › Yana ichida. GIS qatlamining atributlar jadvalini ochadi: saralash, filtrlash, tanlash, tahrirlash, maydon qoʻshish, hisoblash, CSV sifatida saqlash. Qarang [GIS qatlamining atributlar jadvali bilan ishlash](topic:gis-table). |
| {{ui:Xarita}} | yoʻq | **Xarita qatlamlari** dialogini ochadi: georeferensli rasm yoki siz qoʻshgan xarita serverlari, reja ostida chiziladi. Qarang [Xarita qatlamlarini reja ostida koʻrsatish](topic:map-layers). |

GIS vositalari bu tugmalardan birinchi marta foydalanganda, GIS faylini ochganda yoki koordinatalar tizimi yoki GIS qatlamlari bor loyihani ochganda yuklanadi.

## Koʻrinish

| Tugma | Klavisha | Nima qiladi |
|---|---|---|
| {{ui:Tanlash}} | {{key:V}} yoki {{key:Esc}} | Trassalar, maydonchalar, inshootlar, quvurlar va nuqtalarni tanlash uchun bosing ({{key:Shift}} bilan bosish yoki sudrash nuqtalar qoʻshadi); PI larni, maydon burchaklarini va inshootlarni koʻchirish uchun tutqichlarni sudrang. |
| {{ui:Moslash}} | {{key:F}} | Rejani sirtni, nuqtalarni, trassalar va maydonchalarni koʻrsatadigan qilib kattalashtiradi (3D koʻrinishda: hammasini koʻrsatadi). |
| {{ui:3D}} | {{key:D}} | Saytni rejaning ustida 3D da koʻrsatadi yoki rejaga qaytadi. 3D koʻrinish ustidagi panel koʻrinishni, tik kattalashtirishni, ranglarni va nima koʻrinishini belgilaydi, GLB yoki OBJ eksport qiladi. Qarang [Saytni 3D da koʻrish](topic:site-3d). |

## Panellardagi tugmalar

| Tugma | Qayerda | Nima qiladi |
|---|---|---|
| {{ui:Namunaviy uchastkani ochish}} | Boʻsh rejadagi quti | Namunaviy geodezik oʻlchovni yuklaydi (ulanish kerak, agar CivilCraft oflayn foydalanish uchun saqlanmagan boʻlsa) |
| {{ui:Chegarani oʻchirish}} | Chap panel, Sirt | Tashqi chegarani olib tashlaydi |
| {{ui:Chizilgan uzilish chiziqlarini oʻchirish}} | Chap panel, Sirt | Asbob bilan chizilgan har bir sinuvchi chiziqni oʻchiradi (sinuvchi chiziq guruhlarini emas) |
| {{ui:Sirtni nuqtalardan qayta qurish}} | Chap panel, Sirt (faqat LandXML sirti) | LandXML TIN ni tashlab yuboradi va nuqtalardan quradi; bekor qilib boʻlmaydi |
| {{ui:Yer yuzasidan boshlash}} | Oʻng panel, Trassa | Har bir uchida yer ustidagi PVI bilan loyiha profilini boshlaydi |
| {{ui:Profil koʻrinishi}} | Oʻng panel, Trassa | Shu trassa uchun profil koʻrinishini ochadi |
| {{ui:PVI qoʻshish}} | Profil paneli | Bosilgan holatda, profilga bosish PVI qoʻshadi |
| {{ui:Barcha tub balandliklarini qoidalar boʻyicha oʻrnatish}} | Oʻng panel, Quvur tarmogʻi | Har bir quvurning tub balandliklarini qoidalar boʻyicha oʻrnatadi |
| {{ui:Tub balandliklarini qoidalar boʻyicha oʻrnatish}} | Oʻng panel, Quvur | Shu quvurning tub balandliklarini qoidalar boʻyicha oʻrnatadi |
