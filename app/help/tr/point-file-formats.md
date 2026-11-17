---
title: Nokta dosyası biçimleri
summary: CivilCraft'ın okuduğu sütun sıraları, ayırıcıyı ve başlık satırını nasıl bulduğu, tanıdığı başlık adları ve satırların nasıl denetlendiği.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, nokta dosyası biçimi, sütunlar, başlık, ayırıcı
from: 84fab42e
---

Nokta dosyası düz metindir; her satırda bir nokta bulunur. CivilCraft onu tarayıcıda okur; hiçbir şey yüklenmez.

## Sütun sıraları

Harfler sütunları soldan sağa adlandırır: **P** nokta numarası ya da adı, **N** kuzey, **E** doğu, **Z** kot, **D** açıklama.

| Sıra | Sütunlar | Örnek satır |
|---|---|---|
| PNEZD | nokta, kuzey, doğu, kot, açıklama | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | nokta, doğu, kuzey, kot, açıklama | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | nokta, kuzey, doğu, kot | `101,2080000.00,6150000.00,250.00` |
| PENZ | nokta, doğu, kuzey, kot | `101,6150000.00,2080000.00,250.00` |
| NEZD | kuzey, doğu, kot, açıklama | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | doğu, kuzey, kot, açıklama | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | kuzey, doğu, kot | `2080000.00 6150000.00 250.00` |
| ENZ | doğu, kuzey, kot | `6150000.00 2080000.00 250.00` |

P içermeyen sıralar noktaları dosya sırasına göre 1, 2, 3 … diye numaralandırır. X doğu, Y kuzeydir.

## Ayırıcılar

CivilCraft ilk 20 satıra bakar ve bunlardan en az %60'ında görünen ilk ayırıcıyı seçer: virgül, sekme, noktalı virgül. Aksi halde boşluk dizileriyle böler.

- Virgül, sekme ve noktalı virgüllü dosyalarda çift tırnak içindeki bir alan ayırıcıyı içerebilir (`"FL, NORTH"`) ve tırnakların içindeki `""` tek bir tırnak işaretidir.
- Boşlukla ayrılmış dosyalarda satır sonundaki bir açıklama boşluk içerebilir: son koordinat sütunundan sonra gelen her şey açıklamadır.
- `#`, `;` ya da `//` ile başlayan satırlar ve boş satırlar atlanır.
- Dosyanın başındaki bayt sırası işareti yok sayılır.

## Başlık satırı

İlk satır, alanlarından ikisinden azı sayı olduğunda başlık sayılır. Başlığın her alanı CivilCraft'ın tanıdığı bir ad ise sütun sırası oradan alınır ("başlık satırından"). Adlar büyük-küçük harf, boşluk, nokta, alt çizgi, kısa çizgi ve parantezlere bakılmadan eşleştirilir:

| Sütun | Tanınan adlar |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Bir başlık adı tanınmazsa ya da adlar sekiz sıradan birini oluşturmazsa başlık atlanır ve sıra sütun sayısından tahmin edilir.

:::warning
Hem bir enlem sütunu (`lat`, `latitude`) hem de bir boylam sütunu (`lon`, `long`, `longitude`) adlandıran bir başlık, kuzey ve doğu olarak değil, derece olarak okunur. {{ui:İçe aktar}}'da noktalar projenin koordinat sistemi üzerinden dönüştürülür; koordinat sistemi olmayan bir proje önce bunu seçmenizi ister. ±90° enlemin ya da ±180° boylamın dışındaki satırlar reddedilir. Bkz. [GIS verilerini içe aktarma](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Sütun sayısından tahmin etme

Kullanılabilir bir başlık yokken ve **Sütunlar** {{ui:Algıla}} üzerinde bırakıldığında:

- 5 veya daha fazla sütun: PNEZD.
- 4 sütun: ilk sütun örneklenen her satırda tam sayıysa ve dördüncü bir sayıysa PNEZ; aksi halde NEZD.
- 3 sütun: NEZ.

PNEZD ile PENZD sayılardan ayırt edilemez. Tahmin, [CivilCraft ayarları](topic:settings) içindeki **Nokta satırları** ayarını izler: başta P, N, E, Z, D ya da P, E, N, Z, D (bu durumda dört sütun PENZ, üç sütun ENZ olarak okunur). İletişim kutusu "sütun sayısından tahmin edildi — kuzey ve doğunun yer değiştirmediğini denetleyin" der. Önizleme yanlış görünüyorsa **Sütunlar** içinden doğru sırayı seçin.

## Satırların denetlenmesi

- Bir satır açıklamayı dışarıda bırakabilir.
- Kuzey ve doğu sayı olmalıdır. Kot boş olabilir (nokta tutulur ama yüzeyde kullanılmaz).
- Nokta numarası herhangi bir metin olabilir (`CP1` gibi harfler de dahil), ama boş olamaz.
- Bir nokta numarası tekrar ederse ilk satır tutulur, diğerleri okunmamış olarak listelenir.
- Açıklamalar 200 karaktere kadar tutulur; denetim karakterleri boşluğa dönüşür.
- İletişim kutusu için en fazla 200 okunmamış satır tutulur (25'i gösterilir) ve hepsi sayılır.

## Nokta grupları

Bir noktanın grubu, açıklamasındaki ilk kelimenin büyük harfli hâlidir. "GRD", "grd shot" ve "Grd" hepsi GRD grubundadır. Açıklaması olmayan bir nokta "(açıklama yok)" grubundadır. Bkz. [Ölçme noktalarını içe aktarma](topic:import-points).

## Nokta yazma

CivilCraft henüz bir nokta metin dosyası dışa aktarmaz. Noktalar LandXML (CgPoints olarak), proje dosyasında ve GIS {{ui:Dışa aktar}} üzerinden P, N, E, Z ve D alanlarıyla bir shapefile, GeoPackage ya da GeoJSON olarak çıkar ([GIS için yapım sonrası veriyi dışa aktarma](topic:gis-export)). Bkz. [Henüz yapılmadı](topic:not-built-yet).
