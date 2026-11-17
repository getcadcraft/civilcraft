---
title: Nöqtə fayl formatları
summary: CivilCraft-ın oxuduğu sütun ardıcıllıqları, ayırıcını və başlıq sətirini necə tapdığı, hansı başlıq adlarını tanıdığı və sətirlərin necə yoxlandığı.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, nöqtə fayl formatı, sütunlar, başlıq, ayırıcı
from: 84fab42e
---

Nöqtə faylı düz mətndir, hər sətirdə bir nöqtə. CivilCraft onu brauzerdə oxuyur; heç nə yüklənmir.

## Sütun ardıcıllığı

Hərflər sütunları soldan sağa adlandırır: **P** nöqtə nömrəsi və ya adı, **N** şimal, **E** şərq, **Z** hündürlük, **D** təsvir.

| Ardıcıllıq | Sütunlar | Nümunə sətir |
|---|---|---|
| PNEZD | nöqtə, şimal, şərq, hündürlük, təsvir | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | nöqtə, şərq, şimal, hündürlük, təsvir | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | nöqtə, şimal, şərq, hündürlük | `101,2080000.00,6150000.00,250.00` |
| PENZ | nöqtə, şərq, şimal, hündürlük | `101,6150000.00,2080000.00,250.00` |
| NEZD | şimal, şərq, hündürlük, təsvir | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | şərq, şimal, hündürlük, təsvir | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | şimal, şərq, hündürlük | `2080000.00 6150000.00 250.00` |
| ENZ | şərq, şimal, hündürlük | `6150000.00 2080000.00 250.00` |

P olmayan ardıcıllıqlarda nöqtələr fayl sırası ilə 1, 2, 3 … nömrələnir. X şərq, Y şimaldır.

## Ayırıcılar

CivilCraft ilk 20 sətirə baxır və bunlardan ən azı 60%-ində görünən ilk ayırıcını seçir: vergül, tabulyasiya, nöqtəli vergül. Əks halda boşluq qruplarına görə bölür.

- Vergül, tabulyasiya və nöqtəli vergül fayllarında dırnaq içindəki sahə ayırıcını ehtiva edə bilər (`"FL, NORTH"`), dırnaqlar içində `""` isə bir dırnaq işarəsidir.
- Boşluqla ayrılmış fayllarda sətirin sonundakı təsvir boşluqlar ehtiva edə bilər: son koordinat sütunundan sonra hər şey təsvirdir.
- `#`, `;` və ya `//` ilə başlayan sətirlər və boş sətirlər ötürülür.
- Faylın əvvəlindəki bayt sırası işarəsi (BOM) nəzərə alınmır.

## Başlıq sətiri

İlk sətir başlıq sayılır, əgər onun sahələrindən ikisindən azı ədəd deyilsə. Başlığın hər sahəsi CivilCraft-ın tanıdığı ad olarsa, sütun ardıcıllığı ondan götürülür ("başlıq sətirindən"). Adlar böyük-kiçik hərf, boşluq, nöqtə, alt xətt, defis və mötərizələrə baxılmadan uyğunlaşdırılır:

| Sütun | Tanınan adlar |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Başlıqda tanınmayan ad varsa, ya da adlar səkkiz ardıcıllıqdan birini təşkil etmirsə, başlıq ötürülür və ardıcıllıq sütunların sayından təxmin edilir.

:::warning
Həm enlik sütununu (`lat`, `latitude`), həm də uzunluq sütununu (`lon`, `long`, `longitude`) göstərən başlıq dərəcə kimi oxunur, şimal və şərq kimi deyil. {{ui:İdxal}} zamanı nöqtələr layihənin koordinat sistemi ilə çevrilir, koordinat sistemi olmayan layihə əvvəl onu seçməyinizi istəyir. ±90° enlikdən və ya ±180° uzunluqdan kənar sətirlər rədd edilir. Bax [GIS məlumatlarının idxalı](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Sütun sayından təxmin

Yararlı başlıq olmadıqda və **Sütunlar** {{ui:Təyin et}} üzərində qaldıqda:

- 5 və ya daha çox sütun: PNEZD.
- 4 sütun: PNEZ, əgər birinci sütun bütün nümunə sətirlərdə tam ədəddirsə və dördüncü ədəddirsə; əks halda NEZD.
- 3 sütun: NEZ.

PNEZD və PENZD ədədlərdən fərqləndirilə bilməz. Təxmin [CivilCraft parametrləri](topic:settings) daxilində **Nöqtə sətirləri**-ni izləyir: əvvəldə P, N, E, Z, D, və ya P, E, N, Z, D (sonra dörd sütun PENZ, üç sütun ENZ kimi oxunur). Dialoq yazır: "sütun sayına görə təxmin edildi — şimal və şərq yerlərinin qarışmadığını yoxlayın". Önizləmə yanlış görünərsə **Sütunlar**-da düzgün ardıcıllığı seçin.

## Sətirlər necə yoxlanılır

- Sətir təsviri buraxa bilər.
- Şimal və şərq ədəd olmalıdır. Hündürlük boş ola bilər (nöqtə saxlanılır, lakin səthdə istifadə olunmur).
- Nöqtə nömrəsi istənilən mətn ola bilər (`CP1` kimi hərflər də), amma boş olmamalıdır.
- Nöqtə nömrəsi təkrarlanarsa, birinci sətir saxlanılır, qalanları oxunmamış kimi siyahıya alınır.
- Təsvirlər 200 simvola qədər saxlanılır; idarəetmə simvolları boşluğa çevrilir.
- Dialoq üçün 200-ə qədər oxunmamış sətir saxlanılır (25 göstərilir), və hamısı sayılır.

## Nöqtə qrupları

Nöqtənin qrupu təsvirinin böyük hərflərlə ilk sözüdür. "GRD", "grd shot" və "Grd" hamısı GRD qrupudur. Təsviri olmayan nöqtə "(təsvir yoxdur)" qrupundadır. Bax [Planalma nöqtələrinin idxalı](topic:import-points).

## Nöqtələrin yazılması

CivilCraft hələ nöqtə mətn faylı ixrac etmir. Nöqtələr LandXML-də (CgPoints kimi), layihə faylında və GIS {{ui:İxrac}} vasitəsilə P, N, E, Z və D sahələri ilə shapefile, GeoPackage və ya GeoJSON kimi çıxır ([GIS üçün as-built məlumatlarının ixracı](topic:gis-export)). Bax [Hələ hazır deyil](topic:not-built-yet).
