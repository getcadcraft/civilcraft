---
title: Eksport data as-built untuk GIS
summary: Hantar titik ukur, kontur, penjajaran, pelantar, paip dan struktur kepada jabatan GIS bandaraya atau daerah sebagai shapefile, GeoPackage, GeoJSON atau KML, dalam koordinat grid sistem koordinat projek.
keywords: gis, eksport, kml, kmz, google earth, as-built, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, paip, struktur, utiliti, bandaraya, daerah, grid, tanah, epsg, prj
from: bba4fea5
---

Banyak bandaraya dan daerah meminta data as-built dalam format GIS apabila projek ditutup: di mana paip dan struktur diletakkan, gred akhir, dan garis tengah jalan. **GIS › Eksport** menulis apa yang CivilCraft simpan sebagai lapisan GIS, satu lapisan bagi setiap jenis objek.

## Sebelum anda mengeksport

1. Tetapkan sistem koordinat projek dalam {{ui:Koordinat}}. Jabatan GIS perlu tahu di mana nombor-nombor itu; tanpa sistem, fail membawa nombor asal projek dan tidak menamakan apa-apa.
2. Semak permukaan, penjajaran, pelantar dan rangkaian paip mengikut cara yang anda mahu ia dihantar.
3. Tanya jabatan itu format dan sistem koordinat yang mereka mahu. Ramai masih meminta shapefile dalam zon satah negeri tempatan; sistem yang lebih baharu menerima GeoPackage.

## Eksport

1. Klik {{ui:Eksport}} dalam kumpulan **GIS**.
2. Di bawah **Apa**, tandakan jenis yang hendak dihantar. Setiap satu menunjukkan berapa ciri yang ada; jenis yang belum mempunyai apa-apa dimalapkan.
3. Di bawah **Sebagai**, pilih format.
4. Baca nota tentang koordinat dan unit, kemudian klik butang muat turun. Baris status memberitahu apa yang dimasukkan, dan nama medan yang dipendekkan.

Dialog juga memuatkan eksport grid ketinggian ({{ui:Permukaan sebagai grid ketinggian GeoTIFF}}); lihat [Grid ketinggian dan LiDAR](topic:elevation-grids-and-lidar).

## Apa yang dimuatkan setiap jenis

| Jenis | Bentuk | Medan |
|---|---|---|
| Titik ukur | Titik dengan ketinggian | `P` nombor titik, `N` utara, `E` timur, `Z` ketinggian, `D` huraian |
| Kontur tanah sedia ada, dan kontur permukaan yang diratakan | Garisan pada ketinggiannya | `ELEV` |
| Garis putus | Garisan dengan ketinggian | `NAME` |
| Sempadan permukaan | Poligon (sempadan yang dilukis, atau jika tiada, tepi permukaan) | `NAME` |
| Penjajaran | Garis tengah | `NAME`, `LENGTH`, `STA_START`, `STA_END` (stesen sebagai nombor biasa) |
| Pelantar | Poligon pada ketinggian pelantar | `NAME`, `ELEV`, `AREA` |
| Garis persilangan cerun | Garisan dengan ketinggian (pelantar dan koridor) | `NAME` |
| Garis ciri koridor | Garisan dengan ketinggian: tengah, tepi turapan, bahu | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Paip | Garisan dari invert atas ke invert bawah | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (peratus), `LENGTH`, `NETWORK` |
| Struktur | Titik pada rim | `NAME`, `RIM`, `INVERT` (invert paip terendah di situ), `SUMP`, `DIA`, `DIA_UNIT` |
| Setiap lapisan GIS | Seperti yang diimport | Medannya sendiri |

Panjang, stesen dan ketinggian dinyatakan dalam unit projek (kaki ukur AS atau meter). Diameter paip dan struktur dalam inci untuk projek kaki dan dalam milimeter untuk projek meter; `DIA_UNIT` menyatakan yang mana.

## Format

- **Shapefile**: satu `.zip` dengan shapefile bagi setiap jenis (`.shp`, `.shx`, `.dbf`), fail `.cpg` yang menyatakan teks ialah UTF-8, dan `.prj` yang menamakan sistem koordinat. Bentuk dengan ketinggian ditulis sebagai jenis Z shapefile. Nama medan lebih panjang daripada 10 aksara dipendekkan, seperti yang dikehendaki format, dan baris status menyenaraikannya.
- **GeoPackage**: satu fail `.gpkg` dengan jadual bagi setiap jenis, sistem koordinat disimpan bersama kod EPSG. Satu fail dan bukan banyak, nama medan panjang dikekalkan.
- **KML** atau **KMZ** (KML dizipkan): satu fail latitud dan longitud untuk Google Earth dan peta web, satu folder bagi setiap jenis, dan setiap ciri ialah penanda yang dinamakan daripada medan NAME dengan setiap medan sebagai data lanjutan; ketinggian dalam meter (mod altitud mutlak). Seperti GeoJSON, ia memerlukan sistem koordinat projek.
- **GeoJSON**: satu fail latitud dan longitud (standard GeoJSON tidak membenarkan yang lain) dengan setiap ciri membawa sifat `kind` (`pipes`, `structures`, …) supaya penerima boleh memisahkannya. Ketinggian ditukar kepada meter, seperti yang dikehendaki standard; ia kekal pada datum menegak projek anda (CivilCraft tidak mempunyai model geoid). Projek tanpa sistem koordinat tidak boleh mengeksport GeoJSON, dan dialog memberitahu sebabnya.

## Grid, bukan tanah

Jabatan GIS menyimpan data mereka dalam koordinat **grid** bagi sesuatu sistem koordinat. Jika projek anda menggunakan koordinat tanah atau tempatan (ditetapkan dalam {{ui:Koordinat}}), setiap koordinat ditukar kembali kepada grid semasa keluar: nombor dalam fail berbeza daripada pelan mengikut faktor skala anda (dan putaran, bagi sistem tempatan). Medan titik `N` dan `E` juga memegang nilai grid. Dialog akan mengingatkan anda.

:::tip
Hantar nota ringkas bersama fail: sistem koordinat dan kod EPSGnya, datum menegak bagi ketinggian anda, unit, dan apa yang setiap fail ialah.
:::

## Apa yang telah diperiksa

- Setiap fail yang ditulis dibaca semula oleh GDAL, perpustakaan yang kebanyakan program GIS gunakan untuk membaca fail ini: setiap bentuk, ketinggian dan atribut, bilangan ciri, dan sistem koordinat sebagai kod EPSG (`.prj` dan GeoPackage). Pembaca kami sendiri membacanya semula dengan cara yang sama.
- Fail GeoJSON mengikut RFC 7946: longitud sebelum latitud, tiada anggota `crs`, gelang luar mengikut arah lawan jam dan lubang mengikut arah jam; kedudukan sepadan dengan PROJ dalam 2 mm.
- Satu projek koordinat tanah dieksport dan setiap titik diperiksa berbanding koordinat gridnya.
- Tiada apa di sini yang telah dibuka dalam program GIS lain lagi. Semak penghantaran pertama dengan jabatan sebelum bergantung kepadanya.
