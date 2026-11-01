---
title: Pelayar dan komputer
summary: Pelayar yang digunakan aplikasi, perbezaan antara mereka, dan apa yang diperlukan oleh komputer anda.
keywords: chrome, edge, firefox, safari, brave, pelayar, mac, windows, linux, ipad, tablet, webgl, keperluan, memori
from: a11b09b1
---

Aplikasi berjalan di dalam pelayar web. Ia melakukan kerja di komputer anda sendiri: fail anda dibuka di sana dan tidak pernah dihantar kepada kami (lihat [Di mana fail anda pergi](common:your-files)).

## Pelayar yang mana

Gunakan versi terkini salah satu daripada ini:

| Pelayar | Enjin | Nota |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | Paling lengkap: memilih folder, menyimpan untuk kegunaan luar talian, pengendalian fail. |
| Firefox | Gecko | Berfungsi. Membuka keseluruhan folder menggunakan pemilih yang lebih ringkas. Simpanan luar talian mungkin tidak berfungsi dalam tetingkap persendirian. |
| Safari | WebKit | Berfungsi pada Mac dan iPad. Membuka keseluruhan folder menggunakan pemilih yang lebih ringkas. Safari mungkin memadam salinan luar talian yang tidak anda guna selama beberapa minggu. |

Ketiga-tiga enjin ini sesuai untuk kerja harian. Jika aplikasi melakukan sesuatu secara berbeza dalam salah satu daripadanya, bantuannya menunjukkan langkah untuk pelayar anda.

## Perbezaan antara pelayar

- **Membuka folder.** Pelayar berasaskan Chromium memaparkan pemilih folder sebenar dan boleh membaca folder itu secara terus. Firefox dan Safari meminta anda memilih folder dan kemudian membaca setiap fail di dalamnya, yang mengambil masa lebih lama untuk folder projek yang besar; menyeret folder ke aplikasi berfungsi pada ketiga-tiga pelayar.
- **Menyimpan.** Aplikasi menyimpan dengan memuat turun fail. Pelayar anda menentukan ke mana muat turun pergi dan sama ada ia bertanya dahulu.

:::chromium
Dalam Chrome atau Edge, hidupkan "Ask where to save each file before downloading" (dalam Tetapan, di bawah Muat turun) untuk memilih folder setiap kali.
:::

:::firefox
Dalam Firefox, buka Tetapan, kemudian Umum, kemudian Muat turun, dan pilih "Always ask you where to save files" untuk memilih folder setiap kali.
:::

:::safari
Dalam Safari, buka Tetapan, kemudian Umum, dan tetapkan "File download location" kepada "Ask for each download" untuk memilih folder setiap kali.
:::

## Mac, Windows dan Linux

Aplikasi adalah sama pada setiap komputer. Yang berubah ialah papan kekunci: pintasan ditulis secara automatik untuk komputer anda. Lihat [Kekunci, tetikus dan pad sentuh](common:keys).

## Tablet dan skrin sentuh

Sesetengah aplikasi menerima sentuhan (satu jari melukis atau memilih, dua jari mencubit untuk zum dan pan). Bantuan setiap aplikasi memberitahu sama ada ia berbuat demikian. Pada iPad, guna Safari atau Chrome. Papan kekunci membantu untuk aplikasi yang menggunakan arahan yang ditaip.

## Pelayar dan sistem terlama

Kami membaca ini daripada kod aplikasi 0.7, bukan daripada tekaan: setiap fail dihuraikan dan setiap ciri bahasa yang digunakannya disemak dengan data keserasian pelayar yang diterbitkan. Di bawah versi ini, aplikasi tidak dapat dimulakan langsung kerana pelayar tidak memahami kod itu.

| | Versi terlama yang boleh memulakan aplikasi |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium 94 |
| Firefox | 93 |
| Safari (Mac, iPad, iPhone) | 16.4 (macOS 13.3, iPadOS dan iOS 16.4) |

CadCraft Studio membawa enjin web sendiri pada Windows, jadi ia memerlukan Windows 10 atau 11; pada Mac ia menggunakan enjin sistem, jadi ia memerlukan macOS 13.3 atau lebih baharu. Tetapan › Kemas kini dalam Studio menunjukkan sistem yang disokong oleh salinan anda.

Ini ialah versi terlama yang *boleh dimulakan*, dibaca daripada kod. Ia bukan senarai pelayar lama yang kami jalankan aplikasi di dalamnya, jadi pelayar lama yang boleh dimulakan mungkin masih tidak menyokong satu-satu ciri.

## Keperluan komputer anda

Ini ialah minimum yang dirancang untuk aplikasi, bukan keperluan yang diukur:

- 8 GB memori (16 GB disyorkan untuk model bersekutu yang besar).
- Cip grafik dengan WebGL 2 untuk aplikasi 3D. Jika paparan 3D kekal kosong, semak sama ada pecutan perkakasan dihidupkan dalam tetapan pelayar anda.
- Skrin dengan lebar sekurang-kurangnya 1280 piksel untuk bar alat penuh; skrin yang lebih kecil akan membalut bar alat kepada beberapa baris.

Fail yang sangat besar (set pelan besar, model besar) menggunakan banyak memori dalam tab pelayar. Tutup tab berat lain jika aplikasi menjadi perlahan.
