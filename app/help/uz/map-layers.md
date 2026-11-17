---
title: Reja ostida xarita qatlamlarini koʻrsatish
summary: Georeferensli rasm, xarita plitkalari, WMS yoki WMTS server yoki xarita xizmatini maydon konteksti sifatida reja ostiga qoʻying: internet sozlamasi, shaffoflik, tartib va manba belgisi bilan.
keywords: xarita qatlamlari, asos xaritasi, fon, aerofoto, ortofoto, tasvir, sputnik, rastr, dunyo fayli, pgw, jgw, tfw, wld, geotiff, georeferensli rasm, xyz, plitkalar, slippy map, wms, wmts, getcapabilities, xarita xizmati, rest, mapserver, imageserver, usgs, milliy xarita, manba belgisi, shaffoflik
from: 32d7718e
---

Xarita qatlamlari sizning loyihangiz ostida chizilgan rasmlar: dunyo fayli bilan aerofoto yoki internetdagi serverlardan olingan xaritalar. Ular faqat ekrandagi maydon konteksti: PDF chop etishlarda, DXF yoki DWG eksportlarida yoki 3D koʻrinishda **kirmaydi**.

{{ui:GIS}} guruhida {{ui:Xarita}} ni tanlang. **Xarita qatlamlari** oynasi loyihaning qatlamlarini sanaydi va yangilarini qoʻshadi. Xarita qatlamlariga loyihaning koordinatalar tizimi kerak ([Loyihaning koordinatalar tizimini oʻrnatish](topic:coordinate-systems)), faqat dunyo fayli loyihaning oʻz koordinatalaridan foydalanadigan rasm bundan mustasno.

## Internet sozlamasi

CivilCraft xaritalar serverlaridan hech narsa soʻramaydi, siz ruxsat bermaguningizcha: {{ui:Sozlamalar}}, {{ui:CivilCraft}}, **Xarita qatlamlari internetdan**: **Oʻchiq** (boshlanishda) yoki **Yoqiq**.

:::note
Yoqilganda CivilCraft qoʻshgan xarita serverlaridan ekrandagi maydon rasmlarini soʻraydi. Chizmangiz bu kompyuterda qoladi; server maydonni va sizning internet manzilingizni koʻradi.
:::

Oʻchiq boʻlsa, internet qatlamlari oynada sababi bilan xira koʻrinishda roʻyxatda turadi; hech narsa chizilmaydi va soʻralmaydi. Xarita serverlarini nomlovchi loyiha ochilganda ham ular bilan bogʻlanilmaydi. Fayldan olingan rasm har qanday holatda ishlaydi. Oynadagi {{ui:Sozlamalarni ochish}} tugmasi sizni oʻsha yerga olib boradi.

## Georeferensli rasm (oflaynda ishlaydi)

1. **Qatlam qoʻshish**da **Georeferensli rasm** ni qoldiring va fayllarni tanlang: rasm (PNG yoki JPEG) **birga** dunyo fayli bilan (PNG uchun `.pgw`, JPEG uchun `.jgw` yoki `.wld`) va, agar boʻlsa, uning `.prj` fayli. Ularni rejaga birga tashlashingiz ham mumkin.
2. `.prj` boʻlmasa, CivilCraft dunyo fayli qaysi tizimdan foydalanishini soʻraydi: {{ui:Loyihaning tizimi}} (eng keng tarqalgan), {{ui:Tizimni tanlang…}} yoki tizimsiz loyihada **Loyiha koordinatalari**.
3. Rasm reja ostida paydo boʻladi va {{ui:Moslash}} uni oʻz ichiga oladi.

RGB GeoTIFF (GeoTIFF sifatida saqlangan aerofoto) oʻzining joylashuvi va tizimiga ega: uni alohida oching. Rasm **loyiha faylining ichida** saqlanadi (25 MB gacha); kattaroqi oʻlchami bilan rad etiladi, shuning uchun kichikroq nusxa saqlang (kamroq piksel yoki JPEG).

## Plitkalar, WMS, WMTS va xarita xizmatlari

Avval **Xarita qatlamlari internetdan** ni yoqing. Soʻng **Qatlam qoʻshish**da:

| Manba | Nimani joylashtirish | CivilCraft nima qiladi |
|---|---|---|
| Plitka URL | `{z}`, `{x}` va `{y}` (yoki `{-y}`) hamda server harfi uchun `{s}` bilan shablon, masalan `https://tile.example.org/{z}/{x}/{y}.png`. Unga nom va manba belgisini bering. | Ekrandagi maydon va masshtab uchun veb Merkator plitkalari. |
| WMS server | Serverning manzili yoki uning GetCapabilities havolasi. {{ui:Qatlamlarni olish}} ni tanlang, soʻng qatlamni. | Ekrandagi maydonning bitta rasmi; server taklif qilsa, loyihaning EPSG kodida, aks holda veb Merkator yoki WGS 84 da. |
| WMTS server | Serverning manzili yoki uning `WMTSCapabilities.xml` fayli. {{ui:Qatlamlarni olish}} ni tanlang, soʻng qatlam va plitka matritsasi toʻplamini. | Toʻplamdan plitkalar, loyihaning tizimida boʻlsa, aks holda veb Merkator. |
| ArcGIS xarita xizmati (REST) | `/MapServer` yoki `/ImageServer` bilan tugaydigan URL. {{ui:Xizmatni oʻqish}} ni tanlang. | Keshlangan veb Merkator xizmatlari plitkalaridan chiziladi; boshqalaridan ekrandagi maydonning bitta rasmi soʻraladi. |

Serverlar oldindan oʻrnatilmagan. Ochiq misollar, hammasi USGS National Map dan (ommaviy domen):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Xizmat: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (aerofotolar uchun `USGSImageryOnly` ham)

Koʻpgina shahar va tuman GIS boʻlimlari oʻz WMS yoki xarita xizmatlarini eʼlon qiladi; ularning GIS sahifalarida manzil koʻrsatilgan. Kirish yoki kalit soʻraydigan server ishlamaydi: CivilCraft foydalanuvchi nomlari, parollar yoki kalitlarni yubormaydi.

## Qatlamlar qanday chiziladi

- Loyihanikidan boshqa tizimdagi rasmlar unga buriladi: rasm boʻlaklarga kesiladi, har biri aniq konvertatsiya qoʻyadigan joydan ekran pikselining chorakidan kam masofada joylashadi.
- Plitkalar ekrandagi maydon va masshtab uchun tanlanadi: bir koʻrinish uchun 64 tadan oshmaydi, bir vaqtda 6 tadan. Siz siljitsangiz yoki masshtabni oʻzgartirsangiz, eski koʻrinish uchun soʻrovlar bekor qilinadi. Xotirada taxminan 200 plitka saqlanadi (diskda hech narsa saqlanmaydi).
- WMS yoki xizmat rasmi koʻrinish harakatlanishni toʻxtatgandan keyin soʻraladi; u kelguncha oxirgisi oʻz joyida qoladi.
- Har bir qatlamning manba belgisi rejaning pastki oʻng burchagida kichik koʻrinadi.

## Qatlamlarni oʻzgartirish, tartiblash va olib tashlash

Oynada har bir qatlamda uni koʻrsatish yoki yashirish uchun katakcha, **Shaffoflik** surgichi, uni oldinroq (pastroq) yoki keyinroq (ustida) chizish uchun strelkalar, rasmlar uchun masshtab tugmasi va olib tashlash tugmasi bor. Roʻyxatdagi birinchi qatlam eng pastda chiziladi. Har bir oʻzgarish bitta bekor qilish qadami.

## Qatlam hech narsa koʻrsatmasa

Sabab holat satrida bir marta koʻrinadi va qatlam nomi ostida oynada qoladi:

| Xabar | Nima qilish kerak |
|---|---|
| Oʻchiq: internetdan xarita qatlamlari Sozlamalarda oʻchiq. | **Xarita qatlamlari internetdan** ni yoqing. |
| Loyihaning koordinatalar tizimi kerak | Uni {{ui:Koordinatalar}} ostida oʻrnating. |
| Server bu sahifaga uning rasmlaridan foydalanishga ruxsat bermadi (CORS), yoki unga yetib boʻlmadi. | Server veb-sahifalarga rasmlaridan foydalanishga ruxsat bermaydi yoki u ishlamayapti. Toʻrt marta rad etilgandan keyin CivilCraft soʻrashni toʻxtatadi; qayta urinish uchun qatlamni yashiring va koʻrsating. |
| Server 404 … bilan javob berdi / Server rasm emas, text/xml yubordi: … | URL, qatlam yoki uslub notoʻgʻri; yoki serverning xabari nima kerakligini aytadi. |
| Bu qatlam loyihaning tizimida, veb Merkatorda yoki WGS 84 da taklif qilinmagan | Server CivilCraft joylashtira oladigan joyda chiza olmaydi. |

## Nimalar tekshirilgan

- Plitka raqamlari standart veb Merkator plitkalash bilan tekshirildi; WMS 1.1.1 va 1.3.0, WMTS va xizmat javoblari qoʻlda yozilgan fayllardan hamda USGS National Map va terrestris OpenStreetMap serverlaridan saqlangan haqiqiy javoblardan oʻqildi. WMS 1.3.0 soʻrovlari EPSG:4326 uchun kenglikni birinchi qoʻyadi, standart shunday deydi.
- Buralish PROJ raqamlari orqali har bir piksel boʻyicha aniq konvertatsiya bilan solishtirildi: plitkalar, WMS rasmlar va tuman oʻlchamidagi rasm uchun 0,13 pikseldan kam, sayt masshtabida va uzoqlashtirilganda.
- Dunyo fayli bilan rasm va rasterio orqali GDAL yozgan RGB GeoTIFF joylashuvi aytilgan joyda chizildi, brauzerda piksel boʻyicha tekshirildi.
- Brauzerda, sinov kompyuterida turgan vaqtinchalik server bilan: plitkalar PROJ har bir nuqtani joylashtiradigan plitkaga tushadi, WMS rasm 2 pikselgacha aniqlikda tushadi, bir vaqtda koʻpi bilan 6 ta soʻrov ishlaydi, sozlama oʻchiq boʻlganda sahifadan hech qanday soʻrov chiqmaydi. Yuqorida koʻrsatilgan USGS National Map xizmati ham brauzerda jonli oʻqildi va chizildi (plitkalari kelib chizildi, mualliflik huquqi matni bilan); boshqa ochiq serverlar faqat saqlangan javoblardan oʻqildi.
