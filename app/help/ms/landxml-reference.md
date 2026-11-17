---
title: LandXML: apa yang dibaca dan ditulis
summary: Elemen dan atribut LandXML 1.2 yang CivilCraft baca dan tulis, elemen demi elemen, dan semua yang dilangkaunya.
keywords: landxml, xml, cgpoints, permukaan, tin, garisan putus, sempadan, penjajaran, coordgeom, profil, profalign, pvi, paracurve, pipenetworks, struct, paip, planfeatures, planfeature, garisan ciri, skema
from: ca3cf359
---

CivilCraft menulis LandXML 1.2 dengan ruang nama rasmi dan lokasi skema. Ia membaca mana-mana fail yang elemen akarnya `LandXML` dan mengambil elemen di bawah mengikut nama (awalan ruang nama diabaikan; versi tidak disemak). Pembaca XML-nya hanya menerima lima entiti standard dan rujukan aksara berangka; ia tidak sekali-kali memuat DTD atau fail luaran. Untuk langkah-langkahnya, lihat [Tukar LandXML](topic:landxml).

LandXML menulis koordinat utara dahulu: satu titik ialah "N E" atau "N E Z".

## Ditulis

| Elemen | Apa yang CivilCraft tulis |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, luas dalam kaki persegi, isipadu dalam kubik yard, diameter dalam inci) atau `Metric` (meter, square meter, cubic meter, millimeter) |
| `Project` | `name` = nama projek |
| `Application` | nama CivilCraft, pengeluar CadCraft |
| `CgPoints` / `CgPoint` | `name` = nombor titik, `desc` = huraian, `code` = kumpulan; teks "N E Z" (atau "N E" tanpa aras) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw atau ccw, `radius`, `length`, `staStart`, `chord`, `delta` (darjah), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | tanah sedia ada sepanjang penjajaran, sebagai pasangan stesen dan aras (`PntList2D`), dipecahkan di tempat ia meninggalkan permukaan |
| `Profile` / `ProfAlign` | profil reka bentuk (dinamakan "<alignment> design"): `PVI` untuk hujung dan titik sudut, `ParaCurve` dengan `length` untuk lengkung menegak |
| `Surfaces` / `Surface` | `name` dan `desc`; mula-mula tanah sedia ada, kemudian "Proposed" apabila pad atau koridor digred |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (tanah sedia ada sahaja) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (tanah sedia ada sahaja, apabila ada) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` dengan `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm atau sanitary |
| `Struct` | `name`, `elevRim` (pinggir yang digunakan, ditetapkan atau daripada permukaan), `elevSump`; `Center`; `CircStruct` dengan `diameter`; `Invert` dengan `elev`, `flowDir` in atau out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` dengan `diameter` |
| `PlanFeatures` / `PlanFeature` | satu bagi setiap garisan ciri: `name`; `CoordGeom` dengan `Line` (`length`, `Start`, `End`) dan `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` dan `End` sebagai "N E Z", `Center` sebagai "N E"); `Feature` `code="CivilCraft"` dengan `Property` use dan closed |

Tidak ditulis: pad dan koridor sebagai objek (hasilnya ialah permukaan "Proposed"), penjajaran dengan ralat, paip tanpa kedua-dua invert, peraturan rangkaian.

## Dibaca

| Elemen | Apa yang CivilCraft ambil |
|---|---|
| `Units` | `Imperial` atau `Metric` dan `linearUnit`-nya menentukan kaki atau meter. Unit yang tidak diketahui dinyatakan dalam nota. |
| `Project` | `name` menjadi nama projek. |
| `CgPoints` / `CgPoint` (bersarang juga) | nama (atau `oID`), "N E" atau "N E Z", `desc` (atau `code`) sebagai huraian |
| `Surface` dengan `Definition surfType="TIN"` | `Pnts` dan `Faces` sebagai tanah sedia ada (permukaan pertama sahaja); muka yang tidak kelihatan (`i="1"`) ditinggalkan |
| `SourceData` / `Breaklines` | garisan putus 3D, dikekalkan bersama permukaan |
| `SourceData` / `Boundaries` | sempadan luar |
| `Alignment` / `CoordGeom` | elemen `Line` dan `Curve`; PI dibina semula daripada `PI` setiap lengkung, atau daripada `Center` dan tangennya; `staStart` |
| `Profile` / `ProfAlign` | `PVI` dan `ParaCurve` (dengan `length`); profil reka bentuk pertama dengan sekurang-kurangnya dua PVI |
| `PlanFeatures` / `PlanFeature` | setiap satu sebagai garisan ciri: `Line`, `Curve` (`Start`, `Center`, `End` dan `rot`-nya) dan `IrregularLine` (`PntList3D` atau `PntList2D`) disambung hujung ke hujung (jurang disambung dengan segmen lurus dan dinyatakan); ditutup apabila berakhir di tempat ia bermula; use dan closed daripada `Feature` CivilCraft sendiri, jika tidak **Hanya dilukis**. Titik tanpa aras mendapat 0 (dinyatakan). |
| `Spiral` | spiral klotoid di sebelah `Curve` (masuk dan keluar; dibaca sebagai PI dengan jejari dan panjang spiral, ditulis semula dengan `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | rangkaian pertama yang mempunyai paip: `Struct` (`Center`, `elevRim`, `elevSump`, diameter `CircStruct`, `Invert` bagi setiap paip) dan `Pipe` (`refStart`, `refEnd`, diameter `CircPipe`) |

## Dilangkau, dan dinamakan dalam nota

- Permukaan selepas yang pertama, permukaan grid dan permukaan bukan TIN yang lain
- Penjajaran yang mengandungi elemen `IrregularLine` atau `Chain`, spiral selain klotoid, spiral di antara dua lengkung, atau yang tiada geometri
- Profil reka bentuk selepas yang pertama; lengkung menegak `CircCurve` dan `UnsymParaCurve` (PVI-nya dikekalkan tanpa lengkung)
- Titik yang hanya merujuk titik lain (`pntRef`), dan titik tanpa koordinat yang boleh dibaca
- Nama titik berulang (yang pertama dikekalkan)
- Sempadan sembunyi, tunjuk dan klip data; garisan putus tanpa titik 3D
- Rangkaian paip selepas yang pertama; jenis rangkaian selain storm dan sanitary (dibaca sebagai storm)
- Struktur segi empat, inlet dan outlet (dibaca sebagai bulat); paip dan saluran berbentuk telur, elips dan kotak (dibaca sebagai paip bulat tanpa saiz)
- Elemen `Spiral` dalam garisan ciri
- `Parcels`, `Roadways`, `GradeModel` dan `Survey`

Profil tanah (`ProfSurf`) dalam fail tidak digunakan: CivilCraft mengambil sampel tanah daripada permukaan itu sendiri.

## Mesej apabila fail tidak dapat dibuka

| Mesej | Maksud |
|---|---|
| "This is XML but not LandXML (its root element is <…>)." | Fail ini ialah jenis XML yang lain. |
| "… has no points, TIN surfaces or alignments CivilCraft can read." | Semua dalam fail berada dalam senarai dilangkau. Nota selepasnya menyatakan apa yang ada. |
| "Mismatched end tag …", "Unclosed tag …", "The file ends inside …" | Fail rosak atau terpotong. |
