---
title: Pipa air bersih: tekanan, aliran, dan aliran kebakaran
summary: Gambar jaringan tekanan berisi junction, reservoir, tangki, pipa, pompa, dan katup pereduksi tekanan di denah; CivilCraft menghitung head, tekanan, dan aliran (Hazen–Williams, jaringan berloop), aliran yang tersedia untuk kebakaran, serta demand satu hari. Fitur lab; setiap hasil memerlukan pemeriksaan insinyur.
keywords: air, pipa air bersih, distribusi air, jaringan tekanan, pipa tekanan, jaringan berloop, hazen-williams, faktor C, kehilangan head, tekanan sisa, aliran kebakaran, hidran, demand, junction, reservoir, tangki, pompa, kurva pompa, katup pereduksi tekanan, prv, katup periksa, periode diperpanjang, epanet, inp, kecepatan
from: df46bf6d
---

Pipa air bersih adalah sisi bertekanan dari sebuah situs: pipa yang selalu penuh, dengan air didorong oleh reservoir, tangki, atau pompa. CivilCraft menghitung head dan tekanan di setiap junction serta aliran di setiap pipa, termasuk jaringan berloop tempat air memiliki lebih dari satu jalur. Fitur ini masih di lab selama sedang diperiksa.

**Hanya alat bantu hitung.** Setiap angka memerlukan pemeriksaan insinyur yang berkualifikasi: jawabannya hanya sebaik demand, elevasi, ukuran pipa, dan nilai kekasaran yang Anda berikan, dan model keadaan tunak tidak mengetahui apa pun tentang water hammer, kualitas air, atau perilaku nyata pompa kebakaran.

## Gambar jaringan

1. Di bawah **Permukaan** › {{ui:Lainnya}}, pilih {{ui:Pipa air bersih…}}. Jendela tetap terbuka saat Anda bekerja di denah.
2. Pilih {{ui:Reservoir}} dan klik denah di tempat suplai berada. Head-nya dimulai 100 ft (30 m) di atas tanah; ubah di Properties.
3. Pilih {{ui:Junction}} dan klik setiap tempat air diambil atau pipa bertemu. Junction mengambil elevasinya dari tanah; ketik elevasi lain di Properties untuk menimpanya.
4. Pilih {{ui:Pipa}}, klik sebuah node, lalu node yang disambungkannya. Alat tetap aktif untuk pipa berikutnya. {{ui:Pompa}} dan {{ui:Katup pereduksi tekanan}} digambar dengan cara yang sama, dari node hisap (atau hulu) ke node pengiriman (atau hilir). {{ui:Tangki}} ditempatkan seperti junction.
5. Pilih junction lalu ketik {{ui:Demand}}-nya (gpm, atau L/s di proyek meter). Pilih pipa lalu atur {{ui:Diameter}}-nya (in, atau mm) dan, jika Anda tahu, nilai C Hazen–Williams-nya.

Setiap perubahan adalah satu langkah urungkan. Delete menghapus node dan pipa yang berakhir di sana.

## Arti setiap bagian

- **Pipa.** Panjangnya diukur sepanjang denah kecuali Anda mengetiknya. C adalah kekasaran Hazen–Williams (130 untuk memulai, ubah nilai default di jendela). Koefisien kehilangan minor K menambahkan kehilangan belokan dan fitting. Centang **Katup periksa** untuk pipa yang tidak boleh mengalirkan air mundur; pipa **Ditutup** tidak mengalirkan apa pun.
- **Reservoir.** Sumber pada head tetap, yaitu level air yang ditahannya di atas datum. Ia memberi atau mengambil apa pun yang dibutuhkan jaringan.
- **Tangki.** Level yang berubah sepanjang hari. Dalam hasil keadaan tunak, ia menjadi sumber pada level saat itu.
- **Pompa.** Satu titik desain (aliran dan head) menghasilkan kurva biasa yang melewatinya: head pada aliran nol adalah 133 % dari head desain, dan head nol pada dua kali aliran desain. Pompa tidak pernah mendorong air mundur.
- **Katup pereduksi tekanan.** Menahan tekanan yang Anda atur di hilir saat suplai lebih tinggi. Saat suplai lebih rendah, katup terbuka dan tidak menahan apa pun; jika air akan mengalir mundur, katup menutup.

## Membaca hasil

Jendela menampilkan head dan tekanan setiap node serta aliran, kecepatan, dan kehilangan head per 1,000 ft (atau per km) setiap link, dengan junction diwarnai di denah: hijau berarti di antara tekanan terendah dan tertinggi Anda, merah di bawah, kuning di atas. Panah aliran menunjukkan arahnya. Pilih node atau pipa untuk membaca angkanya di Properties.

Di bawah tabel ada daftar hal yang perlu diperiksa: tekanan rendah atau tinggi, pipa lebih cepat dari batas Anda, junction yang terputus dari setiap sumber, atau solver yang tidak konvergen. Temuan yang sama ada di panel Masalah. Atur batasnya di jendela (20 psi, 100 psi, dan 10 ft/s untuk memulai; 140 kPa, 700 kPa, dan 3 m/s di proyek meter).

## Aliran kebakaran

{{ui:Aliran kebakaran…}} menggambar aliran di satu junction dan menampilkan tekanan di sana serta tekanan terendah di mana pun dalam jaringan. Ia juga mencari aliran yang tersedia di junction itu selama node terlemah dalam jaringan mempertahankan tekanan sisa yang Anda berikan. Demand lain tetap seperti semula.

## Demand satu hari

{{ui:Demand satu hari…}} menjalankan jaringan jam demi jam. Berikan pola demand di pengaturan file (daftar pengali yang berulang); tangki terisi dan kosong sesuai aliran masuk dan keluar, dan pompa dapat mengikuti pola nyala/mati. Tangki yang mencapai level tertinggi atau terendahnya disebutkan dalam daftar: CivilCraft tidak menutup saluran masuk atau keluarnya untuk Anda, jadi baca itu sebagai "tangki ini terlalu kecil atau pompanya terlalu besar".

## Teks EPANET

{{ui:Simpan sebagai teks EPANET (.inp)}} menulis jaringan dalam format teks biasa yang dibaca banyak program air, dan {{ui:Buka teks EPANET (.inp)…}} membaca satu file. Hanya yang dimodelkan CivilCraft yang ikut: junction, reservoir, tangki, pipa, pompa dengan kurva head, katup pereduksi tekanan, pola demand, dan waktu. Jenis katup lain, pompa yang diberi daya, dan rumus kehilangan head lain disebutkan namanya dan tidak disertakan. File harus menggunakan satuan yang sama dengan proyek.

## Hidran, katup, dan fitting

Pilih junction dan centang **Hidran** untuk menaruhnya di sana; pilih pipa utama dan tekan **Tambahkan di tengah** untuk menaruh katup, katup udara, blow-off, atau meter di sana. Mereka adalah objek jaringan: mereka ikut bergerak bersamanya dan satu langkah urungkan menghapusnya.

Tata letak juga menyiratkan fitting, dan CivilCraft mendaftarkannya tanpa diminta: sebuah **tee** di tempat tiga pipa utama bertemu, **cross** tempat empat bertemu, **belokan** (dengan sudutnya) tempat dua pipa utama berbelok 5° atau lebih, **reducer** tempat dua ukuran bertemu, dan **cap** di ujung buntu. {{ui:Jadwal fitting (CSV)}} menghitungnya dan pipa utama menurut ukuran. Ini adalah apa yang disiratkan tata letak, daftar kuantitas untuk diperiksa terhadap detail Anda sendiri, bukan daftar untuk dipesan.

Pipa utama dipasang di bawah tanah dikurangi penutup (4 ft atau 1.2 m) agar bisa digambar dan dimodelkan dalam 3D; tekanan di atas tidak pernah bergantung padanya.

## Di denah dan dalam file

Denah, PDF, dan DWG atau DXF memuat pipa utama pada **C-WATR-MAIN** dengan ukurannya pada **C-WATR-TEXT**, hidran pada **C-WATR-HYDR**, katup pada **C-WATR-VALV**, dan fitting pada **C-WATR-FITT**. LandXML keluar menulis jaringan pipa air (sebuah struktur untuk setiap node, sebuah pipa untuk setiap pipa utama, hidran diberi nama); LandXML masuk membacanya kembali sebagai pipa air bersih, tanpa demand, pompa, atau katup, yang tidak dibawa LandXML. Ekspor IFC menulis pipa utama sebagai segmen pipa, hidran, katup, dan fitting dalam satu sistem air. File-file ini telah diperiksa dengan pembaca dan penulis kami sendiri; cobalah di program lain Anda dan beri tahu kami apa hasilnya.

## Yang belum tersedia

Kualitas dan umur air, kontrol dan aturan di luar pola nyala/mati pompa, jenis katup lain, demand menurut tekanan, pipa dengan diameter yang berubah, serta aliran air limbah sepanjang waktu. Lihat [Belum dibuat](topic:not-built-yet). Debit desain sanitasi, yang merupakan perhitungan berbeda, ada di [Debit desain sanitasi](topic:sanitary-design).
