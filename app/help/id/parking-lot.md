---
title: Tata letak area parkir
summary: Tata letak petak parkir, lajur, ruang aksesibel dan ruang van, serta pulau di dalam garis batas; beri kemiringan area ke drainase terhadap tanah asli, lalu beri perkerasan dan penanaman. Juga tersedia untuk asisten.
keywords: parkir, area, petak, lajur, aksesibel, ada, van, pulau, drainase, kemiringan, grading, galian, timbunan, perkerasan, paver, penanaman, pohon, medan, point cloud, mcp, asisten
from: 06c14da9
---

Pasang area parkir ke dalam persil, pad, atau garis fitur tertutup, dan dapatkan jumlah, grading, serta perkerasannya dalam satu langkah.

## Menata letak

1. Pilih persil, pad, atau garis fitur tertutup pada denah.
2. Buka **Permukaan, Lainnya, Area parkir...**
3. Pilih aturannya, sudut petak (90, 75, 60, 45, 30 derajat atau sejajar), dan lajur satu arah atau dua arah. Ukuran petak, lajur, dan pulau dimulai dari tabel, dan setiap ukuran dapat diketik ulang.
4. Pilih **Tata letak**.

Baris berjalan sepanjang tepi garis batas yang menghasilkan petak terbanyak (atau pada sudut yang Anda ketik). Sebuah petak dihitung hanya jika seluruhnya berada di dalam garis batas. Jika ruang tersisa untuk satu baris dan satu lajur, sebuah jalur satu sisi ditambahkan. Jendela mendaftar ruang, ruang aksesibel dan ruang van, pulau, drainase, serta luas per ruang, sedangkan denah menampilkan petak, ruang aksesibel dengan lajur akses yang berarsir, pulau, garis tengah lajur, dan drainase pada layer tersendiri (C-PARK-...), sehingga ikut ke PDF, DXF, dan DWG.

## Ruang aksesibel

Dengan aturan Amerika Serikat, jumlahnya mengikuti tabel 208.2 ADA Standards 2010 untuk ruang yang disediakan (satu dari enam, dibulatkan ke atas, adalah ruang van), ditempatkan paling dekat dengan sudut pertama garis batas (pintu masuk), masing-masing dengan lajur akses; dua ruang berbagi satu lajur. Petak yang lebih sempit dari lebar aksesibel, atau kemiringan lebih curam dari 1:48 pada ruang aksesibel, ditampilkan sebagai masalah. **Angka-angka ini diketik dari standar berdasarkan ingatan dan belum diperiksa terhadap standar cetak.** Ukuran petak dan lajur yang umum berasal dari panduan desain parkir dan juga belum diperiksa. Periksa keduanya, dan kode setempat Anda, sebelum mengandalkannya. Pilih **Kustom** untuk memasukkan jumlah ruang aksesibel Anda sendiri.

## Kemiringan ke drainase, galian dan timbunan

Kecuali Anda mematikannya, area parkir menjadi area grading di ruang kerja Landscape. Drainase ditempatkan pada garis tengah lajur kira-kira setiap 100 kaki (30 m); permukaan naik dari setiap drainase dengan kemiringan yang Anda berikan (1.5 persen sebagai awal), sehingga setiap titik miring ke drainase terdekatnya. Elevasi dipilih agar galian dan timbunan area parkir seimbang terhadap tanah asli. Tanah asli adalah permukaan proyek yang sudah ada, yang dapat berasal dari titik survei, LandXML, point cloud lidar atau pemindaian yang diubah menjadi permukaan, atau kontur. Jendela menampilkan estimasi galian dan timbunan; volume proyek menampilkan angka pastinya setelah itu. Area grading mempertahankan tepinya pada tanah asli, sehingga jika permukaan baru berbeda dari tanah di tepi, Anda mendapat satu langkah, dan jendela memberi tahu seberapa besar.

## Perkerasan dan penanaman

Seluruh garis batas mendapat perkerasan paver (pola stretcher yang dapat Anda ubah di Landscape, Hardscape), dan setiap pulau mendapat bedengan semak dan, jika cukup lebar, sebuah pohon, diambil dari daftar tanaman. Setelah itu, semuanya menjadi objek Landscape biasa: sunting, atau pilih **Tata letak ulang** untuk mengganti yang dibuat area parkir. Menghapus area parkir juga menghapus yang telah dibuatnya.

## Dari asisten

Area parkir yang sama dapat diminta melalui MCP: `parking_layout` menampilkan pratinjau, `parking_build` menulis, dan `parking_remove` menghapus area parkir. Minta dengan nama persil, atau kirim garis batasnya.

## Yang belum dibuat

Apakah lajur tersambung ke jalan tidak diperiksa. Perkerasan menutupi seluruh garis batas, sehingga luasnya mencakup pulau. Pilihan bahan perkerasan dari Pustaka dan tipe Pustaka untuk petak belum dibuat; pola perkerasannya adalah pola Hardscape. Aturan negara lain belum dibuat.
