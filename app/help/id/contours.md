---
title: Baca kontur, elevasi dan kemiringan
summary: Atur interval kontur dan kontur utama, tampilkan pita elevasi, panah kemiringan dan segitiga, serta baca elevasi tanah di bawah penunjuk.
keywords: kontur, interval kontur, kontur utama, label, pita elevasi, panah kemiringan, segitiga, elevasi titik, analisis permukaan, analisis elevasi, analisis kemiringan
from: 585e500a
---

Permukaan ditampilkan dengan kontur begitu permukaan itu ada. Semua yang dibahas dalam topik ini diatur di bawah **Tampilan** pada panel kiri. Pengaturan tampilan hanya mengubah apa yang Anda lihat (dan apa yang diekspor); pengaturan ini bukan langkah urungkan.

## Atur interval kontur

1. Di bawah **Tampilan**, pilih nilai di **Kontur setiap**.
   - Dalam feet: 0.25, 0.5, 1, 2, 5, 10 atau 20 ft.
   - Dalam meter: 0.1, 0.25, 0.5, 1, 2, 5 atau 10 m.
2. Pilih **Major setiap**: kontur ke-2, ke-4, ke-5 atau ke-10.
   Kontur utama digambar lebih tebal dan diberi label dengan elevasinya. Kontur utama jatuh pada kelipatan penuh dari jarak major (dengan kontur 1 ft dan setiap major ke-5: 245, 250, 255 …).
3. Matikan {{ui:Label kontur}} jika label membuat denah kecil terlihat penuh.

Proyek baru dimulai dengan 1 unit dan setiap kontur ke-5 menjadi major. Kontur membelok di breakline; jika kontur memotong lurus melintasi garis aliran atau punggung, garis itu belum menjadi breakline (lihat [Bangun dan sempurnakan permukaan](topic:build-surface)).

:::note
Kontur hanya digambar jika terdapat tidak lebih dari 2.000 level antara titik terendah dan tertinggi. Pada lokasi dengan beda tinggi besar dan interval yang sangat kecil, denah tidak menampilkan kontur sama sekali: pilih interval yang lebih besar.
:::

## Haluskan kontur

Kontur ditelusuri sebagai potongan lurus, satu melintasi setiap segitiga permukaan, sehingga kontur membelok sedikit di setiap sisi segitiga. **Penghalusan kontur** di bawah **Tampilan** membulatkan belokan ini:

- **Tidak ada (potongan lurus)**: garis hasil telusur apa adanya. Ini yang ditampilkan gambar baru atau gambar yang lebih lama.
- **Ringan**: belokan dibulatkan sedikit. Sebuah garis tidak pernah bergeser lebih dari 10% menuju kontur berikutnya, dan tidak pernah lebih jauh dari potongan lurusnya daripada satu per enam panjang potongan itu.
- **Kuat**: lengkung yang mengalir. Sebuah garis tidak pernah bergeser lebih dari 25% menuju kontur berikutnya, dan tidak pernah lebih jauh dari potongan lurusnya daripada sepertiga panjang potongan itu.

Dengan pilihan mana pun, kontur yang dihaluskan tetap memotong setiap sisi segitiga di titik yang sama dengan kontur hasil telusur, tetap berada di dalam segitiga yang dilintasi tiap potongan, sehingga tidak pernah memotong atau menyentuh kontur lain. Di tempat kontur memotong breakline atau batas, belokan tajamnya dipertahankan. Garis yang dihaluskan adalah yang diplot dan diekspor (DXF, DWG, PDF, GIS dan 3D), dan memiliki lebih banyak vertex daripada garis hasil telusur.

Penghalusan hanya mengubah garis yang digambar. Elevasi, volume, profil dan penampang tetap dibaca dari permukaan itu sendiri. Kontur yang melewati tepat titik survei (titik di 250.00 pada kontur 250) tetap mempertahankan belokan kecil di setiap titik seperti itu.

## Cara permukaan di balik kontur dibuat

Kontur mengikuti permukaan, dan permukaan mengikuti **Metode kontur** di bawah **Permukaan** pada panel kiri. Default, **Triangulasi dengan interpolasi linear**, menghubungkan titik-titik Anda menjadi segitiga dan mempertahankan setiap titik dan breakline secara tepat. Metode lain lebih dulu menyesuaikan grid beraturan terhadap titik-titik (kriging, kelengkungan minimum, natural neighbor, inverse distance dan lainnya), yang menghasilkan kontur yang lebih membulat di antara titik tetapi tidak melewati setiap titik secara tepat; laporan permukaan di bawah **Permukaan** menunjukkan seberapa jauh hasilnya meleset di titik-titik Anda.

**ABOS (approximation based on smoothing)** termasuk metode grid. Metode ini memiliki dua pengaturan sendiri: **Kehalusan** (mulai dari 0.5; makin kecil makin halus) dan **Akurasi** (mulai dari 1: permukaan dibawa hingga dalam 1% dari rentang tinggi lokasi di titik Anda; ketik angka yang lebih kecil untuk kecocokan yang lebih rapat). Jika tidak dapat mencapai akurasi pada grid yang ada, laporan permukaan akan menyebutkannya: ketik **Jarak grid** yang lebih kecil.

## Baca elevasi di mana saja

Gerakkan penunjuk di atas denah. Bilah status menampilkan:

- **E** dan **N** di bawah penunjuk
- **Tanah** dan elevasi tanah asli di sana, diinterpolasi pada segitiga di bawah penunjuk
- **Grading** dan elevasi rencana, jika pad atau koridor telah mengubah tanah
- "Di luar permukaan" di luar permukaan

Untuk membaca satu titik survei secara tepat, pilih {{ui:Pilih}} lalu klik titik itu: panel kanan menampilkan nomornya, easting, northing, elevasi, deskripsi dan grupnya.

## Tampilkan pita elevasi

1. Centang {{ui:Pita elevasi}}.
   Permukaan diisi warna dari rendah (biru-hijau) ke tinggi (ocher-cokelat). Legenda di bawah kotak centang mencantumkan rentang elevasi setiap pita.
2. Pilih berapa banyak pita di **Pita**: 5, 8, 10 atau 12. Pita membagi rentang dari elevasi terendah sampai tertinggi menjadi langkah yang sama besar.

Pita hanya untuk dilihat. Pita tidak diekspor ke DXF atau diplot ke PDF.

## Tampilkan panah kemiringan

Centang {{ui:Panah kemiringan}}. Setiap segitiga yang cukup besar untuk memuat satu panah mendapat panah pendek yang menunjuk ke bawah lereng. Segitiga datar tidak mendapat panah. Panah berguna untuk memeriksa arah drainase dengan cepat; nilai kemiringan itu sendiri belum diberi label.

## Tampilkan segitiga, titik dan sisi

- {{ui:Segitiga}} menggambar sisi-sisi TIN. Nyalakan untuk memeriksa bagaimana permukaan menghubungkan titik, terutama di sepanjang breakline dan di bagian luar.
- {{ui:Titik}} menggambar setiap titik survei; {{ui:Label titik}} menambahkan nomor, elevasi dan deskripsinya (atau lebih sedikit: lihat **Label titik** di [Pengaturan CivilCraft](topic:settings)).
- {{ui:Breakline}} menggambar breakline (dan batas) dengan warna oranye.
- {{ui:Tepi permukaan}} menggambar garis luar permukaan.

## Yang ada atau yang diusulkan

Setelah pad atau koridor melakukan grading tanpa masalah, **Permukaan** di bawah **Tampilan** menawarkan {{ui:Rencana (grading)}}. Kontur, pita dan panah kemudian menampilkan permukaan hasil grading, sehingga Anda dapat melihat tanah baru dan daylight di sekitarnya. Beralih kembali ke {{ui:Tanah asli}} untuk melihat survei.

## Yang diekspor

Output DXF dan PDF mengikuti pengaturan ini: yang Anda matikan tidak ditulis, dan kontur adalah kontur dari permukaan yang ditampilkan. Pita elevasi tidak pernah diekspor.
