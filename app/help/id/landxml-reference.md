---
title: LandXML: yang dibaca dan ditulis
summary: Elemen dan atribut LandXML 1.2 yang dibaca dan ditulis CivilCraft, elemen demi elemen, serta semua yang dilewati.
keywords: landxml, xml, cgpoints, surface, tin, breaklines, boundary, alignment, coordgeom, profile, profalign, pvi, paracurve, pipenetworks, struct, pipe, planfeatures, planfeature, feature line, skema
from: ca3cf359
---

CivilCraft menulis LandXML 1.2 dengan namespace dan lokasi skema resmi. Ia membaca file apa pun yang elemen akarnya `LandXML` dan mengambil elemen di bawah ini berdasarkan nama (awalan namespace diabaikan; versinya tidak diperiksa). Pembaca XML-nya hanya menerima lima entitas standar dan referensi karakter numerik; ia tidak pernah memuat DTD atau file eksternal. Untuk langkah-langkahnya, lihat [Tukar LandXML](topic:landxml).

LandXML menulis koordinat dengan utara terlebih dahulu: sebuah titik berupa "N E" atau "N E Z".

## Ditulis

| Elemen | Yang ditulis CivilCraft |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, luas dalam kaki persegi, volume dalam yard kubik, diameter dalam inci) atau `Metric` (meter, meter persegi, meter kubik, milimeter) |
| `Project` | `name` = nama proyek |
| `Application` | nama CivilCraft, produsen CadCraft |
| `CgPoints` / `CgPoint` | `name` = nomor titik, `desc` = deskripsi, `code` = grup; teks "N E Z" (atau "N E" tanpa elevasi) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw atau ccw, `radius`, `length`, `staStart`, `chord`, `delta` (derajat), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | tanah eksisting sepanjang alinyemen, sebagai pasangan stasiun dan elevasi (`PntList2D`), dipisah di tempat ia meninggalkan permukaan |
| `Profile` / `ProfAlign` | profil rencana (dinamai "<alinyemen> design"): `PVI` untuk ujung dan titik sudut, `ParaCurve` dengan `length` untuk kurva vertikal |
| `Surfaces` / `Surface` | `name` dan `desc`; pertama tanah eksisting, lalu "Proposed" saat pad atau koridor di-grading |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (hanya tanah eksisting) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (hanya tanah eksisting, jika ada) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` dengan `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm atau sanitary |
| `Struct` | `name`, `elevRim` (rim yang dipakai, ditetapkan atau dari permukaan), `elevSump`; `Center`; `CircStruct` dengan `diameter`; `Invert` dengan `elev`, `flowDir` in atau out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` dengan `diameter` |
| `PlanFeatures` / `PlanFeature` | satu per garis fitur: `name`; `CoordGeom` dengan `Line` (`length`, `Start`, `End`) dan `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` dan `End` sebagai "N E Z", `Center` sebagai "N E"); `Feature` `code="CivilCraft"` dengan `Property` use dan closed |

Tidak ditulis: pad dan koridor sebagai objek (hasilnya adalah permukaan "Proposed"), alinyemen yang memiliki kesalahan, pipa tanpa kedua invert, dan aturan jaringan.

## Dibaca

| Elemen | Yang diambil CivilCraft |
|---|---|
| `Units` | `Imperial` atau `Metric`, dan `linearUnit`-nya menentukan kaki atau meter. Satuan yang tidak dikenal dicatat. |
| `Project` | `name` menjadi nama proyek. |
| `CgPoints` / `CgPoint` (juga bersarang) | name (atau `oID`), "N E" atau "N E Z", `desc` (atau `code`) sebagai deskripsi |
| `Surface` dengan `Definition surfType="TIN"` | `Pnts` dan `Faces` sebagai tanah eksisting (hanya permukaan pertama); face yang tak terlihat (`i="1"`) dibiarkan |
| `SourceData` / `Breaklines` | breakline 3D, disimpan bersama permukaan |
| `SourceData` / `Boundaries` | batas luar |
| `Alignment` / `CoordGeom` | elemen `Line` dan `Curve`; PI dibangun ulang dari `PI` tiap kurva, atau dari `Center` dan tangennya; `staStart` |
| `Profile` / `ProfAlign` | `PVI` dan `ParaCurve` (dengan `length`); profil rencana pertama dengan setidaknya dua PVI |
| `PlanFeatures` / `PlanFeature` | tiap satu sebagai garis fitur: `Line`, `Curve` (`Start`, `Center`, `End`, dan `rot`-nya), dan `IrregularLine` (`PntList3D` atau `PntList2D`) disambung ujung ke ujung (celah disambung dengan segmen lurus dan dicatat); ditutup jika berakhir di tempat ia dimulai; use dan closed diambil dari `Feature` milik CivilCraft, jika tidak **Hanya digambar**. Titik tanpa elevasi mendapat 0 (dicatat). |
| `Spiral` | spiral clothoid di samping `Curve` (masuk dan keluar; dibaca sebagai PI dengan radius dan panjang spiral, ditulis kembali dengan `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | jaringan pertama yang memiliki pipa: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` dengan diameter, `Invert` per pipa) dan `Pipe` (`refStart`, `refEnd`, `CircPipe` dengan diameter) |

## Dilewati, dan dicatat di catatan

- Permukaan setelah yang pertama, permukaan grid, dan permukaan non-TIN lainnya
- Alinyemen yang berisi elemen `IrregularLine` atau `Chain`, spiral selain clothoid, spiral di antara dua kurva, atau alinyemen yang tidak memiliki geometri
- Profil rencana setelah yang pertama; kurva vertikal `CircCurve` dan `UnsymParaCurve` (PVI-nya tetap disimpan tanpa kurva)
- Titik yang hanya merujuk ke titik lain (`pntRef`), dan titik tanpa koordinat yang dapat dibaca
- Nama titik yang berulang (yang pertama disimpan)
- Batas sembunyikan, tampilkan, dan data-clip; breakline tanpa titik 3D
- Jaringan pipa setelah yang pertama; jenis jaringan selain storm dan sanitary (dibaca sebagai storm)
- Struktur persegi panjang, inlet, dan outlet (dibaca sebagai bulat); pipa dan saluran berbentuk telur, elips, serta kotak (dibaca sebagai pipa bulat tanpa ukuran)
- Elemen `Spiral` dalam garis fitur
- `Parcels`, `Roadways`, `GradeModel`, dan `Survey`

Profil tanah (`ProfSurf`) dalam file tidak digunakan: CivilCraft mengambil sampel tanah langsung dari permukaannya sendiri.

## Pesan saat file tidak dapat dibuka

| Pesan | Artinya |
|---|---|
| "This is XML but not LandXML (its root element is <…>)." › "Ini XML tetapi bukan LandXML (elemen akarnya adalah <…>)." | File itu adalah jenis XML lain. |
| "… has no points, TIN surfaces or alignments CivilCraft can read." › "… tidak memiliki titik, permukaan TIN, atau alinyemen yang dapat dibaca CivilCraft." | Semua isi file ada dalam daftar yang dilewati. Catatan setelahnya menyebutkan apa yang ada. |
| "Mismatched end tag …", "Unclosed tag …", "The file ends inside …" › "Tag penutup tidak cocok …", "Tag tidak ditutup …", "File berakhir di dalam …" | File rusak atau terpotong. |
