---
title: Bentuk permukaan pelantar bangunan
summary: Lukis pelantar rata, tetapkan ketinggian serta cerun potongan dan tambakan, dan biarkan CivilCraft mencari persilangan dengan tanah sedia ada serta menambahnya pada permukaan cadangan.
keywords: dinding penahan, sisi menegak, dinding dan bukan cerun, cerun setiap sisi, benteng tanah, pembentukan permukaan, pelantar, pelantar bangunan, persilangan cerun, garis ciri, kumpulan pembentukan permukaan, cerun potongan, cerun tambakan, aras siap, permukaan cadangan, pembentukan permukaan tapak
from: 482319a6
---

Pelantar ialah kawasan rata pada satu ketinggian. Dari tepinya, CivilCraft membentuk cerun ke luar pada cerun potongan anda di tempat tanah lebih tinggi daripada pelantar, dan pada cerun tambakan anda di tempat ia lebih rendah, sehingga cerun bertemu tanah sedia ada. Garis pertemuan itu ialah garis persilangan cerun. Pelantar dan cerunnya menggantikan tanah sedia ada di dalam garis persilangan cerun untuk membentuk permukaan cadangan.

## Lukis pelantar

Anda perlu mempunyai permukaan tanah sedia ada dahulu.

1. Tekan {{key:G}}, atau klik {{ui:Pelantar}} dalam kumpulan **Reka bentuk**.
   Petunjuk berbunyi "Pelantar: klik bucunya. Enter atau klik dua kali untuk selesai, Backspace untuk buang yang terakhir, Esc untuk batal."
2. Klik bucu pelantar mengikut urutan, dari arah mana-mana. Garis luar biru mengikut penuding.
3. Tekan {{key:Enter}} selepas bucu terakhir (sekurang-kurangnya tiga).
   Pelantar dilukis dan dipilih. Ia bermula pada ketinggian tanah di tengahnya, dibundarkan kepada 0.1, dengan cerun potongan 2 : 1 dan cerun tambakan 3 : 1. Bar status menyatakan, contohnya, "Pelantar 1 pada ketinggian 254.3 (tanah di tengahnya), potongan 2:1, tambakan 3:1. Tukar dalam Sifat."

:::warning
Selesaikan dengan {{key:Enter}}. Klik dua kali juga menyelesaikan, tetapi dalam binaan ini ia membuang bucu yang anda klik dua kali. Klik bucu terakhir sekali, kemudian tekan {{key:Enter}}.
:::

Garis luar pelantar tidak boleh bersilang sendiri ("Garis luar pelantar bersilang sendiri.").

## Tetapkan ketinggian dan cerun

Dengan pelantar dipilih, panel kanan menunjukkan **Pelantar**:

1. **Nama**.
2. **Ketinggian**: ketinggian rata pelantar.
3. **Cerun potongan** dan **Cerun tambakan**, sebagai H:V (2 bermaksud 2 : 1). Kedua-duanya mesti lebih daripada 0.
4. **Luas pelantar** dan **Bucu** ditunjukkan sebagai rujukan.

Tekan {{key:Enter}} selepas setiap nilai. Garis persilangan cerun, permukaan cadangan dan isipadu dikemas kini serta-merta.

Di bawah medan, satu baris dibaca, contohnya "Garis persilangan cerun: 48 garis cerun (20 dalam potongan, 28 dalam tambakan), terjauh 31.20 ft ke luar." Pelan menunjukkan garis persilangan cerun dan garis cerun dalam magenta.

## Cara persilangan dicari

- Garis cerun keluar dari setiap tepi tegak lurus kepadanya, kira-kira setiap dua puluh saiz pelantar.
- Di bucu luar ia terkembang setiap 10°, supaya cerun membalut bucu.
- Di bucu dalam satu garis berjalan sepanjang pembahagi dua sudut, tempat cerun dari kedua-dua tepi bertemu.
- Setiap garis mendaki pada cerun potongan atau turun pada cerun tambakan sehingga mencapai tanah.

## Cerun setiap sisi dan dinding penahan

Di bawah **Sisi dan dinding penahan** dalam Sifat pelantar, platform atau benteng, setiap sisi boleh dibentuk dengan caranya sendiri. Sisi 1 berjalan dari bucu pertama yang anda klik ke yang kedua, sisi 2 dari yang kedua ke yang ketiga, dan seterusnya.

- **Semua sisi**: **Bercerun** menggunakan cerun potongan dan tambakan di atas pada setiap sisi; **Menegak: dinding penahan** meletakkan dinding pada setiap sisi.
- Setiap sisi: **Cerun di atas**, **Cerun sendiri** (taip cerun potongan dan tambakan untuk sisi itu) atau **Menegak (dinding penahan)**.
- Taip cerun sebagai `3` atau `3:1` (mendatar kepada 1 menegak), `33%` atau `18.4°`; ia dipaparkan sebagai H:1. Cerun Potongan dan Tambakan pelantar itu sendiri menerima perkara yang sama.
- Sisi menegak tiada tambakan: dinding penahan berjalan sepanjang tepi, dari pelantar turun ke tanah sedia ada (dalam tambakan) atau dari tanah turun ke pelantar (dalam potongan). **Ketebalan dinding** (0.3 m atau 1 ft pada mulanya) ialah jarak tanah melangkah dari tepi pelantar ke tanah sedia ada. Isipadu potongan dan tambakan tidak termasuk tambakan bagi sisi yang tidak lagi memilikinya.
- Di tempat dinding bertemu sisi bercerun, cerun membalut hujung dinding; dua dinding bertemu dalam sudut mitre.
- Di bawah medan: panjang dinding, muka terdedah (tinggi × panjang), ketinggian tertinggi dan purata.

Pelan melukis muka luar setiap dinding dengan tanda pendek merentasinya dan ketinggiannya di kedua-dua hujung serta di tempat tertingginya (pada lapisan dinding penahan, yang juga masuk ke DXF dan DWG). Paparan 3D menunjukkan dinding sebagai pepejal (Papar › Dinding penahan), dan eksport GLB, OBJ dan USD menyertakannya. Keratan merentasi tepi menunjukkan langkahnya.

**Amaran** (dalam Sifat, dan dalam panel Masalah): dinding yang lebih tinggi daripada **Amaran di atas ketinggian dinding** (1.0 m atau 3.3 ft pada mulanya) "mungkin memerlukan dinding kejuruteraan atau permit; semak peraturan tempatan", dan, apabila anda menaip **Cerun paling curam yang boleh ditanggung tanah**, mana-mana sisi yang cerun potongan atau tambakannya lebih curam daripada itu. Ia hanya amaran: pembentukan permukaan tetap dibina. Setiap perubahan ialah satu langkah bagi {{key:Mod+Z}}.

## Alih bucu

Pilih pelantar, kemudian seret grip persegi pada bucu. Setiap seretan ialah satu langkah buat asal. Menambah atau mengalih keluar bucu belum tersedia: padam pelantar dan lukis semula.

## Bila ia tidak membentuk

Kotak merah di bawah **Kerja tanah** menamakan pelantar dan masalahnya:

| Mesej | Apa yang perlu dilakukan |
|---|---|
| "3 garis cerun terkeluar dari permukaan sebelum bertemunya: pelantar terlalu dekat dengan tepi permukaan atau terlalu tinggi/rendah." | Alih pelantar ke dalam dari tepi permukaan, atau bawa ketinggiannya lebih dekat dengan tanah. |
| "Garis persilangan cerun bersilang sendiri (cerun dari sisi pelantar yang berlainan bertembung antara satu sama lain). Bentuk semula pelantar atau tukar cerun." | Biasa bagi pelantar sempit atau berbentuk L dalam potongan dalam atau tambakan tinggi. Lebarkan pelantar, ratakan beza, atau curamkan cerun. |
| "Garis luar pelantar bersilang sendiri." | Lukis semula bucu mengikut urutan di sekeliling pelantar. |

Pelantar yang bermasalah ditinggalkan daripada permukaan cadangan dan isipadu sehingga diperbetulkan.

## Lihat hasilnya

1. Di bawah **Paparan**, tetapkan **Permukaan** kepada {{ui:Dicadangkan (diratakan)}}. Kontur kini mendatar merentasi pelantar dan mengikut cerun ke garis persilangan cerun.
2. Gerakkan penuding ke atas pelantar: bar status menunjukkan ketinggian **Tanah** dan **Dibentuk**.
3. Baca potongan dan tambakan di bawah **Kerja tanah**; lihat [Isipadu kerja tanah](topic:volumes).

Pelantar dibentuk selepas koridor, mengikut urutan ia dilukis. Pelantar yang lebih lewat menggantikan apa-apa yang lebih awal di dalam garis persilangan cerunnya sendiri.

## Padam pelantar

Pilih pelantar dan tekan {{key:Delete}} (pada Mac, Fn dan Delete), atau klik {{ui:Padam}}.

## Belum dibina

Pelantar adalah rata: pelantar bercerun, garis ciri dengan gred yang berubah, bangku, dan pembentukan kepada jarak atau sasaran ketinggian belum tersedia. Lihat [Belum dibina](topic:not-built-yet).
