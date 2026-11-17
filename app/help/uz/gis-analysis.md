---
title: GIS qatlamlarini tahlil qilish
summary: Buffer, ustma-ust qoʻyish (kesishish, birlashma, oʻchirib tashlash, eritib birlashtirish), fazoviy birlashtirish, atribut boʻyicha tanlash va loyihadagi GIS qatlamlarini oʻlchash — har biri bekor qilinadigan yangi qatlam sifatida.
keywords: gis, tahlil, buffer, ustma-ust qoʻyish, kesishish, birlashma, oʻchirib tashlash, kesish, eritib birlashtirish, fazoviy birlashtirish, birlashtirish, atribut boʻyicha tanlash, soʻrov, shart, ifoda, statistika, maydon, uzunlik, perimetr, oʻlchash, uchastkalar, servitut, chegaradan chekinish, shapefile, geopackage, atributlar jadvali
from: a6b2d3f9
---

Loyihada GIS qatlamlari boʻlgach (qarang: [GIS maʼlumotlarini import qilish](topic:gis-import)), GIS guruhidagi **Tahlil** tugmasi (`GISANALYSIS`, `ANALYZE` yoki `BUFFER` buyrugʻi bilan) beshta yorliqli panelni ochadi. U reja yonida ochiq qoladi, shuning uchun siz tanlagan narsa siz ishlayotganda rejada chiziladi.

Har bir yaratadigan vosita **yangi qatlam qoʻshadi** va oʻqigan qatlamlarni oʻzgarishsiz qoldiradi. Har biri bitta bekor qilish qadami: paneldagi {{ui:Undo}} (yoki Ctrl+Z) yangi qatlamni olib tashlaydi. Natijani boshqa qatlamlar kabi [GIS uchun as-built maʼlumotlarini eksport qilish](topic:gis-export) orqali shapefile, GeoJSON yoki GeoPackage sifatida eksport qiling.

Qatlamning toʻliq jadvali — saralash, tahrirlash va maydon kalkulyatori bilan — [Qatlam atributlar jadvali bilan ishlash](topic:gis-table) boʻlimida; maydon boʻyicha ranglash [Qatlamni atribut boʻyicha uslublash](topic:gis-symbology) boʻlimida.

Hammasi rejada, loyiha birliklarida (feet yoki meters) bajariladi. Loyiha doim proyeksiyalangan yoki mahalliy tizimda boʻladi, shuning uchun 50 masofa 50 feet yoki 50 meters degani, hech qachon gradus emas. Balandliklar (z) natijalarda saqlanmaydi.

## Buffer

Har bir obyekt atrofida berilgan masofada zona chizadi va yangi poligon qatlam hosil qiladi. Nuqtalar aylanaga, chiziqlar yumaloq uchli yoʻlakka, poligonlar esa kengayadi. **Manfiy** masofa poligonlarni toraytiradi (100 × 100 kvadrat 5 ga torayganda 90 × 90 boʻladi; 60 ga torayganda hech narsa qolmaydi va panel buni aytadi). Masofani har bir obyekt uchun alohida raqamli ustundan oling yoki **Barcha buferlarni bitta shaklga birlashtirish** katakchasini belgilab ularni eriting.

Yumaloq qismlar toʻgʻri chiziqli boʻlaklardan iborat boʻlib, haqiqiy egri chiziq ichida chiziladi, shuning uchun buffer aniq aylanadan bir oz kichik boʻladi: odatdagi sozlamada maydonda taxminan 0.6 %, Fine rejimida 0.16 %. Oʻlchaydigan narsalaringiz uchun Fine dan foydalaning.

## Ustma-ust qoʻyish

| Vosita | Natija |
|---|---|
| Intersect (Kesishish) | Kiritilgan qatlam ustma-ust qoʻyish poligonlari bilan uchrashadigan boʻlaklar, har birida ikkala qatlam ustunlari. Chiziqlar va nuqtalar poligonlar boʻyicha kesiladi. |
| Union (Birlashma) | Ikkala poligon qatlam bir-birining chegaralari boʻylab kesiladi: umumiy boʻlaklarda ikkala qatlam ustunlari boʻladi, qolganlarida esa bitta qatlamniki (boshqasining ustunlari boʻsh). |
| Erase (Oʻchirib tashlash) | Kiritilgan poligonlar, ustma-ust qoʻyish poligonlari olib tashlangan holda. Ustunlar kiritilgan qatlamda qoladi. Butunlay oʻchirilgan obyekt chiqarib tashlanadi (panel ularni sanaydi). |
| Dissolve (Eritib birlashtirish) | Bir-biriga tegib turgan yoki ustma-ust tushgan poligonlarni birlashtiradi: hammasini yoki ustun har bir qiymati uchun bitta shaklni. `COUNT` va `AREA` qoʻshiladi. |

Ikkala qatlamda bor ustun nomi birinchi qatlam uchun saqlanadi, ikkinchi qatlamniki esa `_2` bilan yoziladi. Bitta qatlam ichidagi obyektlar bir-birini kesib oʻtmasligi kerak: kesib oʻtsa, Union ustma-ust tushgan qismni ikkala tomonda ham sanaydi.

## Birlashtirish

Fazoviy birlashtirish **manba** qatlamdan atributlarni u bilan uchrashadigan har bir **maqsad** obyektiga koʻchiradi va maqsad shakllariga ega yangi qatlam beradi. Uchrashish shartini tanlang: tegib turish yoki ustma-ust tushish, maqsad manba poligoni ichida joylashgan, maqsad manba obyektini oʻz ichiga olgan, eng yaqin manba obyekti (ixtiyoriy chegara bilan) yoki berilgan masofa ichidagi istalgan manba obyekti.

Bir nechta manba obyekti mos kelsa, birinchisining atributlari olinadi (eng yaqin va masofa birlashmalarida eng yaqinining; `DISTANCE` qoʻshiladi), yoki ular **sanaladi va raqamli ustunlari jamlanadi**: `COUNT`, hamda har bir raqamli ustun uchun `SUM_`, `MEAN_`, `MIN_`, `MAX_`. **Mos kelmagan maqsad obyektlarini saqlash** katakchasini olib tashlang, shunda ular chiqarib tashlanadi. Hech narsa mos kelmagan joyda birlashtirilgan ustunlar boʻsh boʻladi, panel mos kelmaganlarini sanaydi.

## Tanlash

Atributlar yoki shakl haqida savol yozing, **Tanlash** tugmasini bosing — obyektlar rejada, sonlari, jadvali va umumiy maydoni, uzunligi yoki soni bilan chiziladi. Soʻngra ularni alohida qatlamga aylantiring, ularga kattalashtiring yoki tanlovni tozalang.

| Yozish mumkin | Misol |
|---|---|
| Ustun nomi bilan; nomida boʻshliq boʻlsa "qoʻshtirnoq" yoki [kvadrat qavs] ishlating | `VALUE`, `"Lot Number"` |
| Raqamlar, 'matn', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (matn katta-kichik harfga eʼtibor bermaydi; `like` da `%` istalgan belgilar ketma-ketligi, `_` esa bitta harf) | `Notes contains 'corner'` |
| `is null`, `is not null` (boʻsh qiymat null hisoblanadi) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` va qavslar | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Shakl qiymatlari `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Toʻliq boʻlmagan yoki qatlamda boʻlmagan ustunni nomlagan savol, qayerda xato ekanini koʻrsatuvchi jumla bilan rad etiladi.

## Oʻlchash

Qatlamning umumiy maydonini va perimetrini, uzunligini yoki sonini koʻrsatadi va unga **ustunlar qoʻshadi**: poligonlar uchun `AREA` va `PERIMETER`, chiziqlar uchun `LENGTH` (reja uzunligi), nuqtalar uchun `X` va `Y`. Mavjud ustun hech qachon ustiga yozilmaydi: yangisi `AREA_2` deb ataladi. Bu bitta bekor qilish qadami. **Statistika** raqamli ustunning sonini, yigʻindisini, oʻrtachasini, minimumi va maksimumini beradi, ixtiyoriy ravishda boshqa ustunning har bir qiymati uchun.

:::note
Bu vositalar ortidagi tekshiruvlar testda qoʻlda bajariladi (`node bin/test-civilcraft-gisanalysis.mjs`): masalan, 100 × 100 uchastkalar 100 × 80 zona ostida 3,000 + 3,000 da kesishadi, va 10 ga buferlangan 100 uzunlikdagi chiziq 2,000 + aylana beradi.
:::
