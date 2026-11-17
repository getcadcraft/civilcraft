---
title: Tombol dan mouse
summary: Setiap pintasan keyboard serta aksi mouse, trackpad, dan sentuhan di CivilCraft, dikelompokkan, dengan perbedaan peramban dan platform.
keywords: keyboard, pintasan, shortcuts, hotkeys, tombol, keys, mouse, trackpad, sentuhan, touch, geser, pan, zoom, cubit, pinch, roda, wheel, klik kanan, right-click, mac, tombol command, command key
from: a9756f46
---

Tombol satu huruf bekerja saat Anda tidak sedang mengetik di kotak. Pintasan dengan {{key:Mod}} menggunakan Command di Mac dan Ctrl di tempat lain. Lihat juga [Tombol di peramban](common:keys).

## File dan penyuntingan

| Tombol | Aksi |
|---|---|
| {{key:Mod+O}} | Buka file titik, LandXML, atau proyek |
| {{key:Mod+S}} | Simpan proyek (mengunduh file `.civilcraft.json`) |
| {{key:Mod+P}} | Cetak denah ke PDF (membuka dialog plot, bukan cetak peramban) |
| {{key:Mod+Z}} | Urungkan |
| {{key:Mod+Y}} | Ulangi |
| {{key:Delete}} | Hapus titik survei, alinyemen, pad, bangunan, pipa, atau PVI yang dipilih |
| {{key:Mod+C}} | Salin titik survei yang dipilih (juga sebagai baris titik untuk spreadsheet) |
| {{key:Mod+X}} | Potong titik survei yang dipilih |
| {{key:Mod+V}} | Tempel titik: mengikuti penunjuk, klik di tempat titik akan diletakkan |
| {{key:Mod+Shift+V}} | Tempel di tempat yang sama: pada koordinat titik itu sendiri |
| {{key:Mod+D}} | Duplikat titik yang dipilih: salinan mengikuti penunjuk |
| {{key:Mod+A}} | Pilih semua titik survei |
| {{key:Esc}} | Batalkan pilihan (dan batalkan tempel) |

{{key:Mod+S}}, {{key:Mod+O}}, dan {{key:Mod+P}} tetap bekerja saat Anda mengetik di kotak. {{key:Mod+Z}} dan {{key:Mod+Y}} di kotak teks justru mengurungkan atau mengulang ketikan Anda seperti biasa, begitu juga {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}}, dan {{key:Mod+A}}: di dalam kotak, tombol itu menyalin, memotong, menempel, dan memilih teksnya. Dengan teks dipilih di halaman (di panel), {{key:Mod+C}} menyalin teks tersebut. {{key:Mod+Shift+Z}} tidak melakukan apa pun di CivilCraft: gunakan {{key:Mod+Y}} atau tombol {{ui:Ulangi}}.

:::mac
Tombol Mac yang bertulisan **delete** adalah {{key:Backspace}} bagi peramban. Untuk menghapus pilihan, tekan {{key:Delete}} (Fn dan delete), atau pilih {{ui:Hapus}} di menu {{ui:Lainnya}} pada bilah alat.
:::

## Alat

| Tombol | Alat |
|---|---|
| {{key:V}} | {{ui:Pilih}} |
| {{key:M}} | {{ui:Ukur}}: jarak, luas, dan kemiringan pada denah ([Ukur](topic:measure)) |
| {{key:A}} | {{ui:Alinyemen}} |
| {{key:G}} | {{ui:Pad}} |
| {{key:P}} | {{ui:Pipa}} |
| {{key:B}} | {{ui:Breakline}} |
| {{key:O}} | {{ui:Batas}} |
| {{key:R}} | Tampilkan atau sembunyikan tampilan profil |
| {{key:I}} | Nyalakan atau matikan {{ui:Tambah PVI}} (membuka tampilan profil jika tertutup) |
| {{key:F}} | {{ui:Paskan}}: tampilkan semuanya |
| {{key:D}} | {{ui:3D}}: tampilkan tapak dalam 3D, atau kembali ke denah |
| {{key:E}} | Tampilkan atau sembunyikan kelandaian dan elevasi di sepanjang setiap garis fitur (hanya di layar) |

Menekan tombol alat aktif sekali lagi kembali ke {{ui:Pilih}}. Huruf dengan Shift tidak melakukan apa pun.

## Saat menggambar

| Tombol | Aksi |
|---|---|
| {{key:Enter}} | Selesaikan alinyemen, pad, jalur pipa, breakline, atau batas |
| {{key:Backspace}} | Hapus titik terakhir yang diklik |
| {{key:C}} | Garis fitur: nyalakan atau matikan busur (setelah sebuah simpul, klik titik pada kurva, lalu ujungnya) |
| {{key:Esc}} | Batalkan gambar (atau tempel); ditekan lagi (atau saat tidak ada yang digambar), kembali ke {{ui:Pilih}} dan hapus pilihan |

## Tampilan denah

| Tombol atau aksi | Hasil |
|---|---|
| Roda | Zoom masuk atau keluar di penunjuk |
| Seret di ruang kosong | Geser (di alat mana pun; klik singkat tetap mengklik; dengan {{key:Shift}} ditahan, akan menggambar kotak pilihan) |
| Seret dengan tombol tengah | Geser |
| Seret dengan tombol kanan | Geser (tidak ada menu terbuka) |
| {{key:Space}} dan seret | Geser |
| Klik | Pilih (dengan {{ui:Pilih}}), atau tempatkan titik (dengan alat gambar) |
| {{key:Shift}} dan klik | Tambahkan titik survei ke pilihan, atau keluarkan |
| {{key:Shift}} dan seret | Gambar kotak: titik survei di dalamnya ditambahkan ke pilihan. Seret mengelilinginya untuk [laso](topic:lasso-selection) |
| {{key:Space}} saat menggambar laso | Jendela, lalu silang, lalu pagar |
| Klik saat menempel | Letakkan titik yang ditempel di sana ({{key:Enter}} meletakkannya pada koordinat masing-masing) |
| Seret grip | Pindahkan PI, sudut pad, atau bangunan (satu langkah urungkan) |
| {{key:Up}} {{key:Down}} {{key:Left}} {{key:Right}} | Geser, saat denah memiliki fokus (klik dulu) |
| {{key:Plus}} dan {{key:Minus}} | Zoom masuk dan keluar di tengah, saat denah memiliki fokus |

Tombol = melakukan zoom masuk seperti {{key:Plus}}, jadi Anda tidak perlu Shift.

## Tampilan profil

| Aksi | Hasil |
|---|---|
| Klik saat {{ui:Tambah PVI}} aktif | Tambahkan PVI di sana |
| Klik sebuah PVI | Pilih PVI tersebut |
| Seret sebuah PVI | Pindahkan (satu langkah urungkan) |
| {{key:Delete}} atau {{key:Backspace}} | Hapus PVI yang dipilih (Backspace hanya saat tampilan profil memiliki fokus) |

Tampilan profil tidak di-zoom atau digeser.

## Layar dan bantuan

| Tombol | Aksi |
|---|---|
| {{key:F1}} | Buka atau tutup bantuan ini (panel samping); {{ui:Bantuan}} di bilah aplikasi melakukan hal yang sama |
| {{key:Esc}} | Tutup panel bantuan saat terbuka |
| {{key:Ctrl+Shift+F}} | Ganti mode layar secara bergiliran: layar penuh, layar penuh dengan bilah disembunyikan, normal |
| {{key:Esc}} | Keluar dari layar penuh (tombol peramban itu sendiri) |

{{key:F1}} sampai ke bantuan sebelum CivilCraft melihatnya, sehingga berfungsi di alat mana pun. Pada sebagian besar keyboard Mac, tekan fn bersama F1, atau klik {{ui:Bantuan}}. {{key:Ctrl+Shift+F}} menggunakan tombol Control di semua platform, termasuk Mac. Lihat [Menggunakan bantuan](common:help) untuk cara mencari bantuan ini.

## Mouse, trackpad, dan sentuhan

:::mouse
- Roda melakukan zoom di penunjuk. Mouse dengan roda yang berputar bebas melakukan zoom dengan cepat: putar dengan putaran pendek.
- Geser dengan seret di ruang kosong, tombol tengah, tombol kanan, atau {{key:Space}} dan seret.
:::

:::mac
Pada trackpad Mac:

- Gulir dua jari **melakukan zoom** (tidak menggeser), dan cubit juga melakukan zoom.
- Untuk menggeser, tekan dan seret di ruang kosong dengan satu jari, atau tahan {{key:Space}} dan seret.
- Klik dua jari (klik kanan) tidak membuka menu dan tidak melakukan apa pun dengan sendirinya.
:::

:::touch
Pada layar sentuh:

- Sentuhan pertama membuat tombol dan baris menu sebesar jari.
- Ketuk untuk memilih atau menempatkan titik; satu jari yang diseret di ruang kosong menggeser. Ketukan mungkin sedikit bergoyang: geser hanya dimulai setelah jari bergerak sekitar 10 piksel.
- Dua jari dicubit untuk zoom dan digerakkan bersama untuk menggeser.
- Seret grip atau PVI dengan satu jari. Grip memiliki area sebesar lebar jari di sekelilingnya.
- Saat Anda menggambar alinyemen, pad, breakline, batas, jalur pipa, garis fitur, atau persil, bilah di atas denah menawarkan {{ui:Selesai}} ({{key:Enter}}), {{ui:Urungkan titik}} ({{key:Backspace}}), dan {{ui:Batal}} ({{key:Esc}}). Tekan lama (setengah detik tanpa bergerak) juga menyelesaikan.
- Di {{ui:Pilih}}, tekan lama pada titik survei menambahkannya ke pilihan, atau mengeluarkannya, seperti yang dilakukan {{key:Shift}}+klik.
- Di tampilan 3D, satu jari mengorbit, dua jari mencubit dan menggeser, dan ketukan memilih.
- Tidak ada hover pada sentuhan, jadi pembacaan bilah status diperbarui hanya saat jari menyentuh layar.
:::

## Tombol peramban yang didahulukan

Beberapa tombol milik peramban dan tidak pernah sampai ke CivilCraft, misalnya {{key:Mod+W}} (tutup tab), {{key:Mod+T}} (tab baru), {{key:Mod+N}} (jendela baru), dan {{key:F11}} (layar penuh di peramban Windows dan Linux). CivilCraft tidak menggunakannya. Jika pintasan malah membuka sesuatu di peramban, klik denah sekali agar halaman memiliki fokus, lalu coba lagi.

## Tentang Move

Tidak ada perintah Move: pilih {{ui:Pilih}} dan seret titik atau simpul, atau sunting koordinatnya di {{ui:Properti}}. Lihat [Sunting titik](topic:edit-points).
