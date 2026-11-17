---
title: Area tanam: hamparan rumput, bedengan, padang rumput, penutup tanah
summary: Area tanam sebagai objek dengan susunan lapisan (tanah atas, mulsa, membran, tepi pembatas), campuran tanaman, dan elevasi akhir opsional; area ini memotong sendiri di sekitar perkerasan, dinding, dan anak tangga, serta memberikan luas bersih, volume, panjang tepi pembatas, dan jumlah tanaman.
keywords: area tanam, hamparan rumput, rumput, bedengan, tepi, padang rumput, penutup tanah, tanah atas, mulsa, membran, kain gulma, tepi pembatas, elevasi akhir, kuantitas, luas bersih, potong
from: 2617ec0e
---

{{ui:Area}} di grup Lanskap menggambar **hamparan rumput**, **bedengan tanaman**, **padang rumput**, atau **penutup tanah**: klik sudutnya lalu tekan {{key:Enter}}. Bedengan atau penutup tanah dimulai terisi dengan tanaman yang dipilih di bagian Tanaman; hamparan rumput tidak memiliki tanaman.

## Isinya

- **Susunan lapisan**: kedalaman tanah atas, kedalaman mulsa, membran gulma, dan tepi pembatas (baja, kayu, bata, beton, plastik, atau tanpa). Kedalaman khas sudah terisi; atur sendiri.
- **Campuran**: spesies (dengan kultivar dan ukuran) dan porsinya, diisi seperti bedengan sesuai jarak atau kerapatan.
- **Elevasi akhir**: kosongkan dan area mengikuti tanah; beri elevasi dan area menjadi pengubah tanah (lihat [Pengubah tanah dan elevasi](topic:ground-modifiers)).
- **Potong di sekitar perkerasan, dinding, dan anak tangga** (aktif secara bawaan): bagian yang tumpang tindih dengan perkerasan, jalur, dinding, kereb, rampa, atau anak tangga dikeluarkan. Tidak ada tanaman yang ditempatkan di bawahnya atau dalam setengah jarak dari tepinya.

## Kuantitas

**Properti** menampilkan **luas bersih** (setelah pemotongan, diukur tepat), keliling, **panjang tepi pembatas** (hanya di sepanjang tepi area itu sendiri, bukan di tempat perkerasan memotongnya), volume tanah atas dan mulsa, luas membran, dan jumlah tanaman per baris campuran. Jadwal tanaman menghitung tanaman area; file kuantitas untuk TakeoffCraft memuat luas, tanah atas, mulsa, membran, dan tepi pembatas; IFC lanskap menulis IfcGeographicElement dengan satu set kuantitas.
