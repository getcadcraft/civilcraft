---
title: Peramban dan komputer
summary: Peramban apa yang dapat menjalankan app, apa bedanya, dan apa yang dibutuhkan komputer Anda.
keywords: chrome, edge, firefox, safari, brave, peramban, browser, mac, windows, linux, ipad, tablet, webgl, persyaratan, memori
from: a11b09b1
---

App berjalan di dalam peramban web. Pekerjaannya dilakukan di komputer Anda sendiri: file dibuka di sana dan tidak pernah dikirim kepada kami (lihat [Ke mana file Anda pergi](common:your-files)).

## Peramban mana

Pakai versi terbaru dari salah satu berikut:

| Peramban | Mesin | Catatan |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | Paling lengkap: memilih folder, menyimpan untuk pemakaian offline, penanganan file. |
| Firefox | Gecko | Berfungsi. Membuka seluruh folder memakai pemilih yang lebih sederhana. Penyimpanan offline mungkin tidak berfungsi di jendela pribadi. |
| Safari | WebKit | Berfungsi di Mac dan iPad. Membuka seluruh folder memakai pemilih yang lebih sederhana. Safari dapat menghapus salinan offline yang tidak Anda pakai selama beberapa minggu. |

Ketiga mesin cocok untuk pekerjaan sehari-hari. Bila sebuah app bekerja berbeda di salah satunya, bantuannya menampilkan langkah untuk peramban Anda.

## Perbedaan antarperamban

- **Membuka folder.** Peramban Chromium menampilkan pemilih folder yang sesungguhnya dan dapat membaca folder secara langsung. Firefox dan Safari meminta Anda memilih folder lalu membaca setiap file di dalamnya, yang memakan waktu lebih lama untuk folder proyek besar; menyeret folder ke app berfungsi di ketiganya.
- **Menyimpan.** App menyimpan dengan mengunduh file. Peramban Anda yang menentukan ke mana unduhan masuk dan apakah bertanya dulu.

:::chromium
Di Chrome atau Edge, nyalakan "Tanyakan lokasi penyimpanan setiap file sebelum mendownload" (di Pengaturan, bagian Download) untuk memilih folder setiap kali.
:::

:::firefox
Di Firefox, buka Pengaturan, lalu Umum, lalu Unduhan, dan pilih "Selalu tanya di mana menyimpan file" untuk memilih folder setiap kali.
:::

:::safari
Di Safari, buka Pengaturan, lalu Umum, dan atur "Lokasi unduhan file" ke "Tanyakan untuk setiap unduhan" untuk memilih folder setiap kali.
:::

## Mac, Windows, dan Linux

App sama di semua komputer. Yang berubah adalah keyboard: pintasan ditulis menyesuaikan komputer Anda secara otomatis. Lihat [Keyboard, mouse, dan trackpad](common:keys).

## Tablet dan layar sentuh

Sebagian app menerima sentuhan (satu jari menggambar atau memilih, dua jari mencubit untuk zoom dan menggeser). Bantuan setiap app menyebutkan apakah mendukungnya. Di iPad, pakai Safari atau Chrome. Keyboard membantu untuk app yang memakai perintah ketikan.

## Peramban dan sistem tertua

Kami membacanya dari kode app 0.7, bukan dari perkiraan: setiap file diurai dan setiap fitur bahasa yang dipakainya dicari di data kompatibilitas peramban yang dipublikasikan. Di bawah versi ini app bahkan tidak dapat dimulai, karena peramban tidak memahami kodenya.

| | Versi tertua yang dapat memulai app |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium 94 |
| Firefox | 93 |
| Safari (Mac, iPad, iPhone) | 16.4 (macOS 13.3, iPadOS dan iOS 16.4) |

CadCraft Studio membawa mesin webnya sendiri di Windows, jadi membutuhkan Windows 10 atau 11; di Mac memakai mesin milik sistem, jadi membutuhkan macOS 13.3 atau lebih baru. Pengaturan › Pembaruan di Studio menampilkan apa yang dipakai salinan Anda.

Ini adalah versi tertua yang *dapat memulai*, dibaca dari kode. Ini bukan daftar peramban lama tempat kami menjalankan app, jadi peramban lebih lama yang bisa memulai mungkin tetap kekurangan suatu fitur.

## Yang dibutuhkan komputer Anda

Ini adalah batas minimum yang direncanakan untuk app, bukan persyaratan hasil pengukuran:

- Memori 8 GB (16 GB disarankan untuk model gabungan yang besar).
- Chip grafis dengan WebGL 2 untuk app 3D. Jika tampilan 3D tetap kosong, periksa bahwa akselerasi perangkat keras menyala di pengaturan peramban Anda.
- Layar selebar minimal 1280 piksel untuk bilah alat lengkap; layar yang lebih kecil membuatnya terlipat ke baris berikutnya.

File yang sangat besar (set denah besar, model besar) memakai banyak memori di tab peramban. Tutup tab berat lainnya jika app melambat.
