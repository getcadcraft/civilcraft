---
title: Mula menggunakan CivilCraft
summary: Apa yang CivilCraft lakukan, cara membukanya, dan sepuluh minit pertama dengan tapak contoh, daripada titik kepada kontur, jalan dan projek yang disimpan.
keywords: mula, larian pertama, tapak contoh, pengenalan, mula pantas, tutorial, mulakan, projek baharu
from: c9b6dd8e
---

CivilCraft ialah aplikasi reka bentuk sivil dan tapak dalam keluarga CadCraft. Ia mengambil titik tinjauan dan menukarnya kepada permukaan (TIN) dengan kontur, kemudian membolehkan anda menyusun penjajaran dengan profil reka bentuk, melakar koridor jalan ringkas, meratakan pelantar bangunan ke persilangan cerun, menyemak rangkaian paip graviti terhadap peraturan anda dan melihat isipadu potongan dan tambakan. Ia membaca dan menulis LandXML, mengeksport pelan sebagai DXF dan memplotnya ke PDF.

Jika anda pernah menggunakan Civil 3D, idea-idea ini akan biasa: titik, kumpulan titik, garis putus, penjajaran mengikut PI, profil mengikut PVI, koridor, pembentukan, rangkaian paip. Cara anda bekerja berbeza, dan jauh lebih kecil: tiada baris arahan, tiada gaya dan tiada fail lukisan. Baca [Datang dari perisian sivil lain](topic:coming-from) sekali sebelum kerja sebenar pertama anda.

## Apa yang anda perlukan

- Pelayar desktop yang terkini: Chrome, Edge, Firefox atau Safari. Lihat [Pelayar](common:browsers).
- Tetikus atau pad jejak dan papan kekunci, atau skrin sentuh: melukis mempunyai butang atas skrin {{ui:Selesai}}, {{ui:Buat asal titik}} dan {{ui:Batal}} di sana (lihat [Tetikus, pad jejak dan sentuh](topic:keyboard#mouse-trackpad-and-touch)).
- Pelan dilukis dalam 2D dengan kanvas pelayar. [Paparan 3D](topic:site-3d) menggunakan grafik WebGL pelayar; jika ia tidak dapat dimulakan, bar status memberitahu sebabnya dan pelan tetap berfungsi.
- Tiada akaun dan tiada muat naik. Fail dibuka pada komputer anda dan disimpan sebagai muat turun. Lihat [Fail anda](common:your-files).

:::note
CivilCraft berjalan hari ini sebagai binaan pelayar awal yang masih dibina. Binaan desktop belum tersedia, dan simpanan awan belum tersedia. Segala yang anda hasilkan kekal di komputer anda sehingga anda menyimpan atau mengeksportnya.
:::

## Buka CivilCraft

1. Buka CivilCraft dalam pelayar anda.
2. Tunggu skrin dipenuhi: bar alat di atas, panel di sebelah kiri, pelan di tengah dan panel **Sifat** di sebelah kanan.
3. Pada pelan kosong anda melihat kotak bertajuk **Mula dengan titik tinjauan**. Ia menyenaraikan langkah pertama dan mempunyai pautan, {{ui:Buka tapak contoh}}.

Untuk menggunakan CivilCraft tanpa sambungan kemudian, klik {{ui:Simpan untuk luar talian}} pada bar aplikasi dan tunggu {{ui:Sedia untuk luar talian}}. Ia termasuk bantuan ini, tapak contoh, serta pustaka 3D dan GIS. Lihat [Luar talian](common:offline). Tekan {{key:F1}} atau klik {{ui:Bantuan}} pada bila-bila masa untuk membuka bantuan ini di sebelah aplikasi.

## Sepuluh minit pertama anda: tapak contoh

Tapak contoh ialah tinjauan kecil dalam kaki AS: 276 titik pada koordinat satah negeri, rabung, saliran dengan garis aliran dan dua puncak tebing. Ia disertakan dengan aplikasi, jadi anda boleh mengikutinya tanpa fail anda sendiri.

1. Klik {{ui:Buka tapak contoh}} dalam kotak pada pelan.
   Kotak dialog **Import titik** dibuka. Ia berkata "276 titik dibaca sebagai PNEZD (daripada baris tajuk), dipisahkan dengan koma." dan menunjukkan baris pertama.
2. Klik {{ui:Import}}.
   Pelan dipenuhi dengan titik, kontur dan tepi permukaan. Bar status di bawah menyatakan titik telah diimport dan berapa banyak segi tiga permukaan itu ada (546).
3. Lihat panel kiri di bawah **Titik**. Titik dikumpulkan mengikut perkataan pertama huraiannya: CP, FL, GRD, RIDGE, TBN, TBS dan TREE.
4. Dalam lajur **Permukaan** jadual itu, tetapkan **FL**, **RIDGE**, **TBN** dan **TBS** kepada {{ui:Garis putus}}.
   Permukaan dibina semula serta-merta. Fakta **Permukaan** kini berkata "Garis putus: 4", dan kontur membengkok tajam sepanjang garis aliran dan rabung dan bukannya memotong melintasinya.
5. Gerakkan penunjuk ke atas pelan. Bar status menunjukkan timur dan utara di bawah penunjuk serta aras tanah di situ.
6. Di bawah **Paparan**, tetapkan {{ui:Kontur setiap}} kepada 0.5 ft dan hidupkan {{ui:Jalur aras}}. Jalur warna muncul dengan petunjuk di bawah kotak semak. Matikan jalur semula apabila anda selesai.

Anda kini mempunyai permukaan tanah sedia ada. Seterusnya, jalan.

## Susun jalan pendek

1. Tekan {{key:A}} (atau klik {{ui:Penjajaran}} dalam kumpulan **Reka bentuk**).
2. Klik tiga titik merentas tapak, satu demi satu. Garisan merah mengikut penunjuk dan menunjukkan panjang dan bearing tangen seterusnya.
3. Tekan {{key:Enter}} untuk selesai.
   Penjajaran muncul dengan stesen. Panel kanan menunjukkan **Penjajaran**: panjangnya, jadual PI dan lengkung pada PI tengah (jejari 100 ft, atau lebih kecil jika 100 ft tidak muat).
4. Dalam panel kanan, di bawah **Profil reka bentuk**, klik {{ui:Mula dari tanah sedia ada}}.
   Paparan profil dibuka di bawah pelan dengan tanah sedia ada dan kecerunan reka bentuk lurus dari hujung ke hujung.
5. Tekan {{key:I}} untuk menghidupkan {{ui:Tambah PVI}}, kemudian klik sekali dalam paparan profil berhampiran tengah. Satu PVI muncul.
6. Dalam jadual PVI di sebelah kanan, taip panjang lengkung (contohnya 100) dalam kotak **Lengkung L** bagi PVI tengah dan tekan {{key:Enter}}. Profil kini mempunyai lengkung menegak, dengan nilai K-nya dilabelkan.
7. Di bawah **Koridor**, tanda **Sapu himpunan sepanjang profil reka bentuk**.
   Jalan dibentuk ke dalam tanah: lorong, bahu dan cerun sisi hingga persilangan cerun. Blok **Kerja tanah** menunjukkan potongan dan tambakan.

Jangan risau tentang nilai tepat. Setiap nombor boleh diubah dalam panel kanan, dan {{key:Mod+Z}} membuat asal perubahan terakhir.

## Simpan kerja anda

1. Taip nama dalam **Nama** di bahagian atas panel kiri.
2. Tekan {{key:Mod+S}} (atau klik {{ui:Simpan}}).
   Pelayar memuat turun fail dinamakan mengikut tapak, berakhir dengan `.civilcraft.json`. Ia mengandungi titik, tetapan permukaan, penjajaran, profil, koridor, pelantar dan paip.
3. Untuk meneruskan kemudian, klik {{ui:Buka}} (atau tekan {{key:Mod+O}}) dan pilih fail itu, atau lepaskannya pada pelan.

:::warning
Tiada simpanan automatik. Jika anda menutup tab dengan perubahan yang belum disimpan, pelayar bertanya sama ada hendak pergi; jika anda pergi, perubahan itu hilang. Simpan kerap.
:::

## Ke mana seterusnya

- [Import titik tinjauan](topic:import-points) dengan fail anda sendiri.
- [Bina dan perhalusi permukaan](topic:build-surface) dengan garis putus dan sempadan.
- [Skrin, bahagian demi bahagian](topic:workspace).
- [Kekunci dan tetikus](topic:keyboard).
