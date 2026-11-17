---
title: Menu, tombol, dan mouse
summary: Pilih gaya menu yang sesuai dengan cara kerja Anda, beri perintah apa pun tombol sendiri, pindahkan perintah antar tab ribbon, dan atur fungsi roda serta tombol mouse di denah dan 3D.
keywords: gaya menu, menu, ribbon, ribbon sipil, bilah alat, baris perintah, drafting klasik, pintasan keyboard, hotkey, tombol, sesuaikan, ganti tombol, mouse, roda, balikkan, arah zoom, tombol tengah, tombol kanan, geser, orbit, ekspor, impor, beralih, akrab
from: 07ac73a0
---

Perintah CivilCraft sama saja apa pun cara Anda memanggilnya. **Gaya menu** hanya menentukan di mana perintah itu berada di layar, apa namanya di sana, dan tombol mana yang menjalankannya, sehingga Anda bisa mempertahankan kebiasaan Anda. Pilih di {{ui:Pengaturan}} ({{key:Mod+,}}) › {{ui:CivilCraft}} › {{ui:Menu, tombol, dan mouse}}; perubahan langsung berlaku, dan peramban ini mengingatnya.

## Tiga gaya

| Gaya | Yang Anda dapat |
|---|---|
| {{ui:CivilCraft}} | Bilah alat CivilCraft sendiri (File, Ekspor, Permukaan, Desain, Sunting, GIS, Tampilan) dan tombol tunggal: {{key:A}} alinyemen, {{key:G}} pad, {{key:P}} pipa, {{key:B}} breakline, {{key:O}} batas, {{key:L}} garis fitur, {{key:R}} profil, {{key:X}} potongan, {{key:E}} kelandaian, {{key:D}} 3D, {{key:F}} paskan, {{key:V}} pilih. Titik awal. |
| {{ui:Drafting klasik}} | Pita kecil ({{ui:Beranda}}, {{ui:Sisipkan}}, {{ui:Keluaran}}) dan baris perintah, untuk orang yang mengetik perintah: ALIGNMENT, PAD, PIPE, FEATURELINE, BREAKLINE, PROFILE, SECTIONS, U (urungkan), ZOOM, 3D, PLOT, LANDXML, XATTACH, MAPIMPORT, HELP. Mulai mengetik di mana saja dan huruf-hurufnya masuk ke baris perintah; {{key:Enter}} menjalankan, {{key:Enter}} pada baris kosong mengulang perintah terakhir, {{key:Esc}} menghapusnya. Tombol tengah menggeser. |
| {{ui:Ribbon sipil}} | Tab tombol besar seperti cara program desain sipil mengelompokkan alatnya: {{ui:Beranda}} (data tanah, buat desain, tampilan profil dan potongan), {{ui:Permukaan}}, {{ui:Ubah}}, {{ui:Geolokasi}}, {{ui:Tampilan}}, dan {{ui:Keluaran}}, dengan menu {{ui:File}} dan tombol cepat di sisi kanan. Tombol tunggal tetap berlaku. Tombol tengah menggeser denah; di 3D, tombol tengah menggeser dan {{key:Shift}} dengan tombol tengah berputar (orbit). |

Setiap gaya tetap memakai tombol {{key:Mod}}: {{key:Mod+Z}}, {{key:Mod+Y}}, {{key:Mod+S}}, {{key:Mod+O}}, {{key:Mod+P}}, {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}}, {{key:Mod+D}}, {{key:Mod+A}}.

:::tip
Tombol yang termasuk tata letak CivilCraft tetapi oleh gaya Anda diberikan ke perintah lain tidak melakukan apa-apa, dan bilah status menyebutkan ke mana perintahnya pindah ("Di Tombol saya, Pad adalah Ctrl+Alt+G"). {{key:Delete}}, {{key:Esc}}, {{key:Enter}}, {{key:Tab}}, {{key:Space}} dan tombol panah selalu mempertahankan artinya, dan saat Anda menggambar garis, titik-titiknya tetap memakai tombolnya ({{key:Backspace}}, {{key:Enter}}).
:::

## Buat sesuai keinginan Anda

1. Pilih gaya yang paling dekat dengan yang Anda inginkan, lalu klik {{ui:Sesuaikan…}}.
2. Pada {{ui:Tombol dan menu}}, cari perintah (kotak pencarian membantu). Klik {{ui:Tambah kunci}} dan tekan tombolnya, atau dua tombol berurutan untuk tombol dua huruf. Klik tombol untuk melepasnya.
3. Dengan ribbon, {{ui:Letaknya}} memindahkan perintah ke tab dan panel lain, ke menu {{ui:File}}, atau ke {{ui:Hanya tombol}}.
4. Pada {{ui:Mouse}}, atur roda, tombol yang menggeser denah, dan apa yang dilakukan tiap tombol di tampilan 3D.
5. Beri nama dan klik {{ui:Simpan}}.

Menyimpan gaya bawaan membuat salinan milik Anda sendiri ("Ribbon sipil saya"); gaya bawaan tidak pernah berubah. Kunci yang diberikan ke dua perintah, atau yang akan dijalankan sebelum tombol dua huruf sempat diketik, tampil merah dan harus diperbaiki sebelum Anda bisa menyimpan.

## Mouse

- **Roda mouse**: {{ui:Gulir ke atas memperbesar}} (bawaan) atau {{ui:Gulir ke atas memperkecil}}, serta seberapa cepat, di denah dan 3D. Cubitan trackpad selalu memperbesar mengikuti arah gerak jari Anda.
- **Geser denah dengan**: tombol tengah, tombol kanan, atau keduanya. {{key:Space}} dan seret juga menggeser. Tombol kiri selalu memilih dan menggambar.
- **Seret di tampilan 3D**: {{ui:Milik tiap tampilan}} mempertahankan tombol CivilCraft (kiri berputar, kanan menggeser). Atau atur tiap tombol menjadi orbit, geser, zoom, atau tidak ada; {{key:Shift}} dengan tombol menukar orbit dan geser. Klik tanpa menyeret tetap memilih.

## Bawa bersama Anda

{{ui:Ekspor}} menyimpan gaya yang sedang dipakai sebagai file `.ccinput.json` kecil; {{ui:Impor…}} menambahkannya, dari komputer lain atau dari rekan. File impor hanya bisa menunjuk ke perintah CivilCraft sendiri: apa pun selain itu dibiarkan dan dihitung di bilah status. {{ui:Hapus gaya ini}} menghapus salah satu gaya milik Anda.

:::note
Pengaturan ini tersimpan di peramban ini. {{ui:Gunakan gaya ini di setiap aplikasi}} di bawah kartu gaya membuat setiap aplikasi terbuka dalam gaya yang sesuai (bilah alatnya sendiri, ribbon, atau Drafting klasik), dengan perubahan yang Anda buat di tiap aplikasi. CivilCraft tidak punya gaya bilah menu; ketika bilah menu aplikasi lain dipilih untuk semua aplikasi, CivilCraft tetap memakai bilah alatnya sendiri.
:::

Terkait: [Keyboard dan mouse](topic:keyboard) · [Pengaturan CivilCraft](topic:settings) · [Beralih dari perangkat lunak sipil lain](topic:coming-from)
