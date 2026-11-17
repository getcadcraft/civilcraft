---
title: Fail yang boleh anda buka, simpan dan eksport
summary: Fail titik, LandXML dan projek CivilCraft untuk dibuka; projek, LandXML, DXF dan PDF untuk dieksport; apa yang disimpan oleh setiap satu, di mana fail pergi, dan apa yang berubah apabila luar talian.
keywords: buka, simpan, eksport, import, format fail, csv, txt, landxml, xml, dxf, pdf, json, muat turun, fail projek
from: 82bff559
---

CivilCraft membuka fail dari komputer anda dan menyimpan dengan memuat turun fail kembali ke sana. Tiada apa yang dimuat naik dan tiada apa yang disimpan di pelayan. Lihat juga [Fail anda](common:your-files).

## Apa yang dibuka

Klik {{ui:Buka}} (atau tekan {{key:Mod+O}}) dan pilih fail, atau seret fail dari {{pick:mac=Finder|windows=File Explorer|linux=pengurus fail anda}} ke pelan. Satu fail pada satu masa; fail melebihi 200 MB ditolak. Fail LandXML atau projek melebihi 32 MB dibaca dalam bahagian kira-kira 4 MB, tidak sekali sebagai satu blok teks; semasa LandXML dibuka, jangkakan ia menggunakan kira-kira 13 kali saiz fail dalam memori (fail 69 MB menggunakan kira-kira 0.9 GB dalam ujian kami).

| Jenis | Nama fail | Apa yang berlaku |
|---|---|---|
| Fail titik | `.csv`, `.txt`, `.pnt`, `.xyz` (mana-mana fail teks) | Kotak dialog **Import titik** dibuka. Titik menggantikan titik projek; penjajaran, pelantar dan paip kekal. |
| LandXML | `.xml`, `.landxml` | **Projek baharu** dibuat daripada fail (anda ditanya dahulu jika projek semasa mempunyai perubahan yang belum disimpan). |
| Projek CivilCraft | `.civilcraft.json` (mana-mana `.json`) | Projek dibuka seperti yang disimpan (anda ditanya dahulu jika projek semasa mempunyai perubahan yang belum disimpan). |

CivilCraft menentukan mengikut hujung fail, kemudian mengikut aksara pertamanya: teks yang bermula dengan `{` dibaca sebagai projek, teks yang bermula dengan `<` sebagai LandXML, selain itu sebagai fail titik. Fail yang dimalapkan oleh kotak buka masih boleh dilepaskan ke pelan.

:::note
Mengimport fail titik ke dalam projek yang sudah mempunyai titik akan menggantikannya tanpa bertanya, dan ia mengosongkan sejarah buat asal (membuka mana-mana fail ialah permulaan baharu bagi buat asal). Jika permukaan datang daripada LandXML, mengimport titik menukarnya kembali kepada permukaan yang dibina daripada titik. Simpan dahulu jika anda mungkin mahu titik lama semula.
:::

Butiran: [Format fail titik](topic:point-file-formats), [LandXML: apa yang dibaca dan ditulis](topic:landxml-reference).

## Apa yang disimpan

{{ui:Simpan}} ({{key:Mod+S}}) menulis dua fail bersebelahan, dinamakan mengikut **Nama** di panel kiri: `<name>.civilcraft.json`, projek yang anda terus sunting, dan `<name>.ifc`, reka bentuk yang sama sebagai IFC 4.3 untuk pihak lain (lihat [Eksport dan import IFC](topic:ifc)). Setiap fail merekodkan yang satu lagi, dan IFC juga membawa salinan termampat projek, jadi IFC yang dihantar sendiri masih boleh dibuka semula dengan penyuntingan penuh.

- **Dalam Studio** kedua-dua fail ditulis bersebelahan, di tempat asal.
- **Dalam Chrome dan Edge** Simpan pertama meminta folder dan menulis kedua-duanya ke dalamnya; simpanan seterusnya pergi ke folder yang sama. Batalkan soalan folder untuk memuat turun kedua-duanya sebaliknya.
- **Dalam pelayar lain** kedua-dua fail dimuat turun, fail projek dahulu.

Membuka mana-mana fail mencari yang satu lagi. Buka kedua-duanya bersama (atau lepaskan kedua-duanya), atau buka satu: dalam Studio, yang satu lagi dijumpai dalam folder yang sama; dalam pelayar, CivilCraft meminta anda menambahnya, atau meneruskan dengan yang anda ada. Jika IFC diubah oleh program lain selepas CivilCraft menyimpannya, atau salah satu fail lebih lama daripada yang satu lagi, projek dibuka daripada reka bentuk yang lebih baharu dan panel Masalah menerangkan apa yang berlaku, dengan **Simpan sekarang** (menulis kedua-dua fail semula) dan **Tunjuk geometri IFC sebagai rujukan**. IFC sahaja yang diubah oleh program lain dibuka daripada salinan projeknya dengan apa yang masih sepadan: penjajaran yang diubahnya mengambil geometrinya, objek yang dibuangnya ditinggalkan, dan baki perubahannya disenaraikan, tidak diambil. Fail projek daripada sebelum 0.7.1 dibuka seperti biasa.

Fail projek menyimpan:

- setiap titik (nombor, koordinat, aras, huraian) dan nama fail titik asalnya
- tetapan permukaan: pilihan kumpulan, garis putus yang dilukis, sempadan, tepi luar terpanjang, dan TIN yang dibaca daripada LandXML
- tetapan paparan
- penjajaran dengan PI, jejari dan stesen mula, profil reka bentuknya (PVI dan panjang lengkung) dan tetapan koridor
- pelantar dan rangkaian paip dengan peraturannya

Ia tidak menyimpan sejarah buat asal. Permukaan, kontur, garisan siang hari dan isipadu tidak disimpan; ia dibina semula daripada input yang disimpan apabila projek dibuka. Fail projek daripada CivilCraft yang lebih baharu ditolak dengan mesej yang menamakan versinya.

## Apa yang dieksport

| Butang | Fail | Kandungan |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: titik, tanah sedia ada (dan permukaan yang digredkan apabila ada) sebagai permukaan TIN, penjajaran, profil tanah dan reka bentuk, rangkaian paip |
| {{ui:DXF}} | `<name>.dxf` | DXF R12 bagi garisan pelan seperti yang dipaparkan, pada lapisan bernama |
| {{ui:DWG}} | `<name>.dwg` | Garisan yang sama sebagai lukisan DWG, dalam format yang anda pilih (2000 hingga 2018) |
| {{ui:PDF}} | `<name>.pdf` | Plot vektor pelan pada helaian, pada skala yang anda pilih |
| {{ui:GLB}} atau {{ui:OBJ}} (pada bar paparan 3D) | `<name>-3d.glb`, `<name>-3d.obj` | Apa yang dipaparkan oleh paparan 3D sebagai model 3D: meter, Y ke atas, skala benar, sekitar asal tempatan yang direkodkan |

Apa yang ditinggalkan oleh setiap satu: [LandXML pertukaran](topic:landxml), [Eksport pelan ke DXF](topic:dxf-export) (DWG juga), [Plot pelan ke PDF](topic:plot-pdf), [Eksport tapak dalam 3D](topic:export-3d).

## Di mana fail pergi

Fail yang disimpan dan dieksport pergi ke mana pelayar anda meletakkan muat turun, biasanya folder Muat turun. Untuk memilih folder setiap kali:

:::chromium
Buka **Tetapan** pelayar, kemudian **Muat turun**, dan hidupkan **Tanya di mana hendak menyimpan setiap fail sebelum memuat turun**.
:::

:::firefox
Buka **Tetapan**, kemudian **Umum**, dan di bawah **Fail dan Aplikasi** pilih **Sentiasa tanya saya di mana hendak menyimpan fail**.
:::

:::safari
Buka **Safari > Tetapan > Umum** dan tetapkan **Lokasi muat turun fail** kepada **Tanya untuk setiap muat turun**.
:::

Jika anda menyimpan dua kali dengan nama yang sama, pelayar mungkin menambah nombor pada fail kedua, contohnya `Site (1).civilcraft.json`. Buka yang terbaru kali seterusnya.

## Dalam talian dan luar talian

CivilCraft berfungsi hanya pada komputer anda dalam kedua-dua keadaan: membuka membaca fail dalam pelayar, menyimpan memuat turunnya. Untuk membuka CivilCraft tanpa sebarang sambungan, simpan untuk kegunaan luar talian dahulu:

1. Semasa dalam talian, klik {{ui:Simpan untuk luar talian}} pada bar aplikasi di bahagian atas.
2. Butang itu mengira ("Menyimpan 12 daripada 30") dan kemudian menunjukkan {{ui:Sedia untuk luar talian}}. CivilCraft kecil (kira-kira 0.6 MB), jadi ini mengambil sedikit masa. Salinan yang disimpan termasuk bantuan ini dan tapak contoh.
3. Tanpa sambungan, buka alamat yang sama (atau penanda halaman bagi alamat itu). Semuanya berfungsi, termasuk {{ui:Buka tapak contoh}}.

Keadaan butang yang lain:

- {{ui:Tidak dapat menyimpan}}: sebahagian fail tidak dimuat turun. Semak sambungan dan klik untuk mencuba semula.
- {{ui:Luar talian tidak tersedia}}: tetingkap pelayar ini tidak dapat menyimpan salinan luar talian (tetingkap persendirian dan sesetengah komputer terurus menyekatnya). Gunakan tetingkap biasa.

Klik {{ui:Sedia untuk luar talian}} untuk melihat bila salinan disimpan, dengan dua pilihan: {{ui:Simpan semula (dapatkan versi terkini)}} dan {{ui:Alih keluar salinan luar talian}}. Simpan semula sebelum lawatan tapak supaya salinan sepadan dengan binaan terkini. Lebih lanjut dalam [Luar talian](common:offline).

:::offline
Anda sedang luar talian sekarang. Jika CivilCraft disimpan untuk kegunaan luar talian, semuanya berfungsi, termasuk tapak contoh. Jika tidak, teruskan bekerja dalam tab ini, tetapi jangan muat semula sehingga anda dalam talian semula; tanpa salinan yang disimpan, {{ui:Buka tapak contoh}} gagal dengan "Sampel tidak dapat dimuatkan".
:::

:::tip
Untuk kegunaan di lapangan, simpan CivilCraft untuk kegunaan luar talian dan bawa fail titik anda pada komputer riba itu sendiri. Projek dan eksport disimpan sebagai muat turun tanpa sambungan, jadi anda boleh mengimport bacaan sehari, menyemak permukaan dan menyimpan projek di tapak.
:::

Simpan awan belum tersedia, dan binaan desktop belum dikeluarkan. Buat masa ini, fail yang anda simpan ialah satu-satunya salinan: simpanlah di tempat yang dibuat sandaran.

## Add-on yang digunakan oleh fail

Apabila anda menyimpan projek yang mengandungi data daripada add-on (tanda Peraturan bangunan, atau sumber Alamat ke tapak), fail itu merekodkan add-on yang mana dan versi yang mana. Buka pada komputer yang tiada salah satu daripadanya dan bar di atas pelan memberitahu begitu serta menawarkan untuk menambahnya dari senarai akaun anda. Rekod itu hanyalah nota; fail tetap dibuka.

## Buat asal daripada Studio

Di dalam CadCraft Studio, setiap langkah yang anda selesaikan dalam CivilCraft diberitahu kepada Studio, supaya buat asal peringkat projeknya boleh membatalkan langkah terkini merentas aplikasi. Studio hanya membatalkan langkah apabila timbunan buat asal CivilCraft sama tepat seperti langkah itu meninggalkannya; selepas anda membuka fail lain, ia melangkau tetingkap ini.

## Menutup dengan perubahan yang belum disimpan

Apabila projek mempunyai perubahan yang belum disimpan dan anda menutup tab, memuat semula, atau meninggalkan halaman, pelayar bertanya sama ada anda mahu pergi. Wording dan rupanya milik pelayar dan tidak boleh diubah oleh CivilCraft. {{ui:Baharu}}, dan membuka projek atau fail LandXML, bertanya dalam kotak **Perubahan yang belum disimpan** milik CivilCraft, dengan {{ui:Batal}}, {{ui:Jangan simpan}} dan {{ui:Simpan salinan}}.
