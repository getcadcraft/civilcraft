---
title: Susun atur tempat letak kereta
summary: Susun petak, laluan, ruang kebolehcapaian dan van serta pulau dalam garis luar, gredkan tempat letak kereta dengan kecerunan ke longkang berbanding tanah sedia ada, kemudian turapkan dan tanamkan. Turut tersedia untuk pembantu.
keywords: tempat letak kereta, lot, petak, laluan, kebolehcapaian, ada, van, pulau, longkang, kecerunan, potongan, timbunan, turapan, batu turapan, penanaman, pokok, rupa bumi, awan titik, mcp, pembantu
from: 06c14da9
---

Muatkan tempat letak kereta ke dalam lot, pelantar atau garisan ciri tertutup, dan dapatkan kiraan, penggredan dan turapan dalam satu langkah.

## Susun atur

1. Pilih lot, pelantar atau garisan ciri tertutup pada pelan.
2. Buka **Permukaan, Lagi, Tempat letak kereta...**
3. Pilih peraturan, sudut petak (90, 75, 60, 45, 30 degrees atau selari) dan laluan satu hala atau dua hala. Saiz petak, laluan dan pulau bermula daripada jadual dan setiap satu boleh ditaip ganti.
4. Pilih **Susun atur**.

Baris berjalan sepanjang tepi garis luar yang memberikan petak paling banyak (atau pada sudut yang anda taip). Petak dikira hanya jika ia terletak sepenuhnya di dalam garis luar. Jika ruang tinggal untuk satu baris dan satu laluan, jalur satu baris ditambah. Tetingkap menyenaraikan ruang, ruang kebolehcapaian dan van, pulau, longkang dan luas setiap ruang, dan pelan menunjukkan petak, ruang kebolehcapaian dengan laluan akses berlorek, pulau, garis tengah laluan dan longkang pada lapisannya sendiri (C-PARK-...), supaya ia sampai ke PDF, DXF dan DWG.

## Ruang kebolehcapaian

Dengan peraturan Amerika Syarikat, kiraan mengikut jadual 208.2 Piawaian ADA 2010 bagi ruang yang disediakan (satu daripada enam, dibundarkan ke atas, ialah ruang van), diletakkan paling hampir dengan sudut pertama garis luar (pintu masuk), setiap satu dengan laluan akses; dua berkongsi satu. Petak yang lebih sempit daripada lebar kebolehcapaian, atau kecerunan yang lebih curam daripada 1:48 pada ruang kebolehcapaian, ditunjukkan sebagai masalah. **Nombor ini ditaip daripada piawaian seperti yang diingati dan belum disemak terhadap piawaian bercetak.** Saiz petak dan laluan yang tipikal datang daripada panduan reka bentuk tempat letak kereta dan juga belum disemak. Semak kedua-duanya, dan kod tempatan anda, sebelum bergantung kepadanya. Pilih **Tersuai** untuk memasukkan kiraan kebolehcapaian anda sendiri.

## Kecerunan ke longkang, potongan dan timbunan

Melainkan anda mematikannya, lot menjadi kawasan penggredan dalam ruang kerja Landskap. Longkang diletakkan pada garis tengah laluan kira-kira setiap 100 feet (30 m); permukaan naik dari setiap longkang pada kecerunan yang anda beri (1.5 peratus untuk permulaan), jadi setiap titik turun ke longkang terdekatnya. Aras dipilih supaya potongan dan timbunan lot seimbang pada tanah sedia ada. Tanah sedia ada ialah permukaan sedia ada projek, yang boleh datang daripada titik ukur, LandXML, awan titik lidar atau imbasan yang ditukar kepada permukaan, atau kontur. Tetingkap menunjukkan anggaran potongan dan timbunan; isipadu projek sendiri memberikan angka tepat selepas itu. Kawasan penggredan mengekalkan tepinya pada tanah sedia ada, jadi apabila permukaan baharu berbeza daripada tanah di tepi, anda akan mendapat satu langkah, dan tetingkap memberitahu sebesar mana.

## Turapan dan penanaman

Keseluruhan garis luar mendapat turapan batu (corak stretcher yang boleh anda ubah di bawah Landskap, Hardscape) dan setiap pulau mendapat katil semak dan, jika cukup lebar, sebatang pokok, diambil daripada senarai tumbuhan. Semuanya ialah objek Landskap biasa selepas itu: sunting, atau pilih **Susun atur semula** untuk menggantikan apa yang dibuat oleh lot. Membuang lot memadamkan apa yang dibuatnya.

## Daripada pembantu

Lot yang sama boleh diminta melalui MCP: `parking_layout` pratonton, `parking_build` menulis, `parking_remove` mengeluarkan lot itu. Minta mengikut nama lot atau hantar garis luarnya.

## Yang belum dibina

Sama ada laluan sampai ke jalan tidak disemak. Turapan meliputi keseluruhan garis luar, jadi luasnya termasuk pulau. Pilihan bahan turapan daripada Pustaka dan jenis Pustaka untuk petak belum dibina; corak turapan ialah corak Hardscape. Peraturan negara lain belum dibina.
