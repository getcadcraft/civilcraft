---
title: Fail yang boleh anda buka, simpan dan eksport
summary: Import fail titik, LandXML dan projek CivilCraft; eksport projek, LandXML, DXF dan PDF; apa yang disimpan setiap satu, ke mana fail pergi, dan apa yang berubah apabila luar talian.
keywords: buka, simpan, eksport, import, format fail, csv, txt, landxml, xml, dxf, pdf, json, muat turun, fail projek
from: a7debb61
---

CivilCraft membuka fail dari komputer anda dan menyimpan dengan memuat turun fail kembali ke komputer. Tiada apa-apa dimuat naik dan tiada apa-apa disimpan di pelayan. Lihat juga [Fail anda](common:your-files).

## Apa yang dibuka

Klik {{ui:Buka}} (atau tekan {{key:Mod+O}}) dan pilih fail, atau seret fail dari {{pick:mac=Finder|windows=File Explorer|linux=pengurus fail anda}} ke atas pelan. Satu fail pada satu masa; fail melebihi 200 MB ditolak.

| Jenis | Nama fail | Apa yang berlaku |
|---|---|---|
| Fail titik | `.csv`, `.txt`, `.pnt`, `.xyz` (mana-mana fail teks) | Kotak dialog **Import titik** dibuka. Titik menggantikan titik projek; penjajaran, pelantar dan paip kekal. |
| LandXML | `.xml`, `.landxml` | **Projek baharu** dibuat daripada fail (anda akan ditanya dahulu jika projek semasa mempunyai perubahan yang belum disimpan). |
| Projek CivilCraft | `.civilcraft.json` (mana-mana `.json`) | Projek dibuka seperti semasa disimpan (anda akan ditanya dahulu jika projek semasa mempunyai perubahan yang belum disimpan). |

CivilCraft menentukan jenis fail melalui hujung nama fail, kemudian melalui aksara pertamanya: teks yang bermula dengan `{` dibaca sebagai projek, teks yang bermula dengan `<` sebagai LandXML, dan selain itu sebagai fail titik. Fail yang dimalapkan oleh kotak buka masih boleh diseret ke atas pelan.

:::note
Mengimport fail titik ke dalam projek yang sudah mempunyai titik akan menggantikannya tanpa bertanya, dan ia mengosongkan sejarah buat asal (membuka mana-mana fail ialah permulaan baharu bagi buat asal). Jika permukaan datang daripada LandXML, mengimport titik menukarnya kembali kepada permukaan yang dibina daripada titik. Simpan dahulu jika anda mungkin mahu titik lama semula.
:::

Butiran: [Format fail titik](topic:point-file-formats), [LandXML: apa yang dibaca dan ditulis](topic:landxml-reference).

## Apa yang disimpan

{{ui:Simpan}} ({{key:Mod+S}}) menulis dua fail bersebelahan, dinamakan mengikut **Nama** dalam panel kiri: `<name>.civilcraft.json`, projek yang anda teruskan menyunting, dan `<name>.ifc`, reka bentuk yang sama sebagai IFC 4.3 untuk pihak lain (lihat [Eksport dan import IFC](topic:ifc)). Setiap fail merekodkan yang satu lagi, dan IFC juga membawa salinan termampat projek, jadi IFC yang dihantar sendiri masih boleh dibuka semula sepenuhnya dan boleh disunting.

- **Dalam Studio** kedua-dua fail ditulis bersebelahan, di tempat yang sama.
- **Dalam Chrome dan Edge** Simpan pertama meminta folder dan menulis kedua-duanya ke dalamnya; simpanan seterusnya pergi ke folder yang sama. Batalkan soalan folder untuk memuat turun kedua-duanya.
- **Dalam pelayar lain** kedua-dua fail dimuat turun, fail projek dahulu.

Membuka mana-mana fail akan mencari yang satu lagi. Buka kedua-duanya bersama (atau seret kedua-duanya), atau buka satu: dalam Studio, yang satu lagi dijumpai dalam folder yang sama; dalam pelayar, CivilCraft meminta anda menambahnya, atau meneruskan dengan fail yang ada. Jika IFC diubah oleh program lain selepas CivilCraft menyimpannya, atau satu fail lebih lama daripada yang satu lagi, projek dibuka daripada reka bentuk yang lebih baharu dan panel Masalah menerangkan apa yang berlaku, dengan **Simpan sekarang** (menulis kedua-dua fail semula) dan **Tunjukkan geometri IFC sebagai rujukan**. IFC sahaja yang diubah oleh program lain dibuka daripada salinan projeknya dengan apa yang masih sepadan: penjajaran yang diubahnya mengambil geometrinya, objek yang dibuangnya ditinggalkan, dan selebihnya perubahannya disenaraikan, tidak diambil. Fail projek dari sebelum 0.7.1 dibuka seperti biasa.

Fail projek menyimpan:

- setiap titik (nombor, koordinat, aras, huraian) dan nama fail titik asalnya
- tetapan permukaan: pilihan kumpulan, garis putus yang dilukis, sempadan, tepi luar terpanjang, dan TIN yang dibaca daripada LandXML
- tetapan paparan
- penjajaran dengan PI, jejari dan stesen permulaannya, profil reka bentuknya (PVI dan panjang lengkung) dan tetapan koridor
- pelantar dan rangkaian paip dengan peraturannya

Ia tidak menyimpan sejarah buat asal. Permukaan, kontur, garis persilangan cerun dan isipadu tidak disimpan; ia dibina semula daripada input yang disimpan apabila projek dibuka. Fail projek daripada CivilCraft yang lebih baharu ditolak dengan mesej yang menamakan versinya.

## Apa yang dieksport

| Butang | Fail | Kandungan |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: titik, tanah sedia ada (dan permukaan yang diratakan apabila ada) sebagai permukaan TIN, penjajaran, profil tanah dan reka bentuk, rangkaian paip |
| {{ui:DXF}} | `<name>.dxf` | DXF R12 bagi garisan pelan seperti yang dipaparkan, pada lapisan bernama |
| {{ui:DWG}} | `<name>.dwg` | Garisan yang sama sebagai lukisan DWG, dalam format yang anda pilih (2000 hingga 2018) |
| {{ui:PDF}} | `<name>.pdf` | Plot vektor pelan pada helaian, pada skala yang anda pilih |
| {{ui:GLB}} atau {{ui:OBJ}} (pada bar paparan 3D) | `<name>-3d.glb`, `<name>-3d.obj` | Apa yang dipaparkan oleh paparan 3D sebagai model 3D: meter, Y ke atas, skala sebenar, sekitar asal tempatan yang direkodkan |

Apa yang ditinggalkan oleh setiap satu: [Tukar LandXML](topic:landxml), [Eksport pelan ke DXF](topic:dxf-export) (DWG juga), [Plot pelan ke PDF](topic:plot-pdf), [Eksport tapak dalam 3D](topic:export-3d).

## Ke mana fail pergi

Fail yang disimpan dan dieksport pergi ke mana sahaja pelayar meletakkan muat turun, biasanya folder Muat turun. Untuk memilih folder setiap kali:

:::chromium
Buka **Tetapan** pelayar, kemudian **Muat turun**, dan hidupkan **Tanya di mana hendak simpan setiap fail sebelum memuat turun**.
:::

:::firefox
Buka **Tetapan**, kemudian **Umum**, dan di bawah **Fail dan Aplikasi** pilih **Sentiasa tanya anda di mana hendak simpan fail**.
:::

:::safari
Buka **Safari > Tetapan > Umum** dan tetapkan **Lokasi muat turun fail** kepada **Tanya untuk setiap muat turun**.
:::

Jika anda menyimpan dua kali dengan nama yang sama, pelayar mungkin menambah nombor pada fail kedua, contohnya `Site (1).civilcraft.json`. Buka yang terbaharu pada kali seterusnya.

## Dalam talian dan luar talian

CivilCraft hanya berfungsi di komputer anda dalam apa jua keadaan: membuka membaca fail dalam pelayar, menyimpan memuat turunnya. Untuk membuka CivilCraft tanpa sebarang sambungan, simpan dahulu untuk kegunaan luar talian:

1. Semasa dalam talian, klik {{ui:Simpan untuk luar talian}} pada bar aplikasi di atas.
2. Butang itu mengira ("Menyimpan 12 daripada 30") dan kemudian menunjukkan {{ui:Sedia untuk luar talian}}. CivilCraft kecil (kira-kira 0.6 MB), jadi ini mengambil sedikit masa. Salinan yang disimpan termasuk bantuan ini dan tapak contoh.
3. Tanpa sambungan, buka alamat yang sama (atau tanda buku bagi alamat itu). Semuanya berfungsi, termasuk {{ui:Buka tapak contoh}}.

Keadaan lain butang itu:

- {{ui:Tidak dapat menyimpan}}: beberapa fail tidak dimuat turun. Semak sambungan dan klik butang untuk mencuba semula.
- {{ui:Luar talian tidak tersedia}}: tetingkap pelayar ini tidak dapat menyimpan salinan luar talian (tetingkap persendirian dan beberapa komputer yang diurus menyekatnya). Gunakan tetingkap biasa.

Klik {{ui:Sedia untuk luar talian}} untuk melihat bila salinan disimpan, dengan dua pilihan: {{ui:Simpan semula (dapatkan versi terkini)}} dan {{ui:Alih keluar salinan luar talian}}. Simpan semula sebelum lawatan tapak supaya salinan sepadan dengan binaan terkini. Maklumat lanjut dalam [Luar talian](common:offline).

:::offline
Anda kini luar talian. Jika CivilCraft telah disimpan untuk kegunaan luar talian, semuanya berfungsi, termasuk tapak contoh. Jika tidak, teruskan bekerja dalam tab ini, tetapi jangan muat semula sehingga anda dalam talian semula; tanpa salinan yang disimpan, {{ui:Buka tapak contoh}} gagal dengan "Sampel tidak dapat dimuatkan".
:::

:::tip
Untuk kegunaan di lapangan, simpan CivilCraft untuk kegunaan luar talian dan bawa fail titik anda pada komputer riba itu sendiri. Projek dan eksport disimpan sebagai muat turun tanpa sambungan, jadi anda boleh mengimport bacaan hari itu, menyemak permukaan dan menyimpan projek di tapak.
:::

Simpanan awan belum tersedia, dan binaan desktop belum dikeluarkan. Hari ini, fail yang anda simpan ialah satu-satunya salinan: simpan di tempat yang mempunyai sandaran.

## Add-on yang digunakan oleh fail

Apabila anda menyimpan projek yang memegang data daripada add-on (tanda Peraturan bangunan, atau sumber Alamat ke tapak), fail merekodkan add-on yang mana dan versi yang mana. Bukanya pada komputer yang tiada salah satu daripadanya, dan bar di atas pelan akan memberitahu dan menawarkan untuk menambahnya daripada senarai akaun anda. Rekod itu hanyalah nota: fail tetap dibuka.

## Buat asal dari Studio

Dalam CadCraft Studio, setiap langkah yang anda selesaikan dalam CivilCraft dimaklumkan kepada Studio, supaya buat asal peringkat projeknya boleh menarik balik langkah terkini merentas aplikasi. Studio hanya membuat asal sesuatu langkah apabila timbunan buat asal CivilCraft sendiri betul-betul seperti langkah itu meninggalkannya; selepas anda membuka fail lain, ia melangkau tetingkap ini.

## Menutup dengan perubahan yang belum disimpan

Apabila projek mempunyai perubahan yang belum disimpan dan anda menutup tab, memuat semula, atau meninggalkan halaman, pelayar bertanya sama ada anda mahu pergi. Ayat dan rupanya milik pelayar dan tidak boleh diubah oleh CivilCraft. {{ui:Baharu}}, dan membuka projek atau fail LandXML, bertanya dalam kotak **Perubahan yang belum disimpan** milik CivilCraft sebaliknya, dengan {{ui:Batal}}, {{ui:Jangan simpan}} dan {{ui:Simpan salinan}}.
