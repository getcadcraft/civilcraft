---
title: Lendut dan tegangan
summary: Kes beban anda (suhu, angin, ais) dan had tegangan, cara CivilCraft mengira tegangan setiap bahagian, serta jadual penarikan.
keywords: lendut, tegangan, kes beban, suhu, angin, ais, ais tidak simetri, span pemerintah, span setara, perubahan keadaan, katenari, jadual penarikan, kekuatan putus, tegasan harian
from: f8876c35
---

## Kes beban dan had

{{ui:Lagi}} › {{ui:Kes beban dan had…}} menyunting peraturan yang diikuti setiap talian dalam projek.

- **Kes beban**: suhu, tekanan angin pada konduktor (Pa), dan ais radial (mm, dengan ketumpatannya). Kes pertama ialah rujukan.
- **Had tegangan**: sebahagian daripada kekuatan putus konduktor, pada tegangan mendatar atau tegangan terbesar pada sokongan, dalam satu kes beban. Atau beri tegangan mendatar sendiri.
- **Jarak bebas**: jarak bebas yang dikekalkan konduktor di atas tanah, jalan, bangunan dan sebagainya. Tambah, namakan semula dan buang: ia milik anda. Di bawahnya, pilih peraturan untuk **Tumbuhan landskap di bawah talian**, **Dinding landskap di bawah talian** dan **Persilangan bawah tanah**.
- **Kes yang digunakan semakan**: kes mana yang memberi lendut terbesar (panas), ayunan penebat (angin), ais, dan ais di satu sisi sokongan.
- **Faktor**: faktor jarak fasa k, ayunan penebat terbesar, faktor pada beban sokongan dan kelengkapan, sudut pusingan yang menjadikan sokongan sudut dan hujung mati, penutup minimum bagi kabel tertanam, dan kejatuhan voltan terbesar.

## Pek: peraturan dan perpustakaan untuk sesebuah negara

Tiada peraturan negara dibina ke dalam CivilCraft. **Pek** menyimpan satu set peraturan dan perpustakaan bersama dalam satu fail (`.cclinepack.json`), untuk sesebuah negara, pengendali rangkaian atau syarikat:

- **Simpan sebagai pek…** dalam {{ui:Kes beban dan had…}} menulis set peraturan yang ditunjukkan dan perpustakaan anda (atau, jika perpustakaan anda belum ada apa-apa, item yang digunakan projek ini). Taip **Negara atau rantau** dahulu.
- **Buka set peraturan atau pek…** membaca pek, fail peraturan atau fail perpustakaan. Peraturan pek ditunjukkan dalam kotak dialog (klik **Guna** untuk menggunakannya) dan itemnya dimasukkan ke dalam perpustakaan anda.
- Pek yang dikongsi orang lain disenaraikan pada halaman add-on di bawah **Pek talian kuasa**. Dua pek contoh menunjukkan formatnya; ia bukan peraturan mana-mana negara.

Setiap pek disemak apabila dibuka, seperti mana-mana fail. Semak setiap nilai terhadap piawaian yang berkenaan sebelum apa-apa dibina.

Dua set peraturan contoh tersedia untuk dimulakan: **Contoh: iklim sejuk** dan **Contoh: iklim sederhana**. Nombor mereka tidak datang daripada mana-mana piawaian: tetapkan nilai yang diberikan oleh piawaian anda. {{ui:Simpan peraturan}} dan {{ui:Buka peraturan…}} berkongsi set peraturan sebagai fail.

## Cara tegangan dikira

Bagi setiap bahagian antara hujung mati:

1. **Span pemerintah** ialah √(ΣL³ ÷ ΣL) bagi span-spannya.
2. Setiap had ditukar kepada tegangan mendatar dalam kes rujukan melalui **persamaan perubahan keadaan** pada span pemerintah: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. Had yang paling ketat menetapkan tegangan.
3. Tegangan setiap kes beban mengikut daripada itu, dan bentuk setiap span ialah **katenari** tepat melalui dua titik lampirannya (termasuk span pada cerun): lendut daripada kord, panjang, dan tegangan di setiap hujung.

Beban per meter dalam satu kes: berat ditambah ais (luas ais × ketumpatan × g) secara menegak; tekanan angin × diameter berais secara mendatar.

## Jadual penarikan

{{ui:Lagi}} › {{ui:Jadual penarikan…}} menyenaraikan, bagi setiap bahagian, tegangan mendatar dan lendut setiap span pada setiap suhu dalam set peraturan (−5 °C hingga 40 °C setiap 5 °C untuk permulaan), dalam udara tenang. Simpan mereka, dan jadual sokongan, sebagai CSV.

Tidak dikira: rayapan konduktor sepanjang tahun, dan regangan konduktor baharu. Tambahkannya melalui suhu yang anda gunakan semasa menarik talian.
