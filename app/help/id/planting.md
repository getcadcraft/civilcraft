---
title: Denah dan jadwal penanaman
summary: Tempatkan tanaman tunggal, bedengan tanam yang diisi sesuai jarak tanaman dengan campuran tanaman berdasarkan persentase, dan pagar; beri label; hitung dalam jadwal tanaman untuk spreadsheet atau TakeoffCraft.
keywords: denah penanaman, jadwal tanaman, bedengan, penanaman massal, pagar, pohon, semak, penutup tanah, jarak, jarak segitiga, jumlah tanaman, kuantitas, label, kanopi, simbol tanaman, ifc, takeoff
from: ab49eab5
---

## Menempatkan tanaman

1. Pilih tanaman di **Tanaman** di sebelah kiri.
2. Klik {{ui:Tanaman}}, lalu klik pada denah: setiap klik menempatkan satu tanaman. Tekan {{key:Esc}} untuk berhenti.

Simbol tanaman digambar sebesar lebar tajuknya saat dewasa; Lainnya › {{ui:Tampilkan pada ukuran tanam}} menggambar setiap tanaman sebesar ukuran saat ditanam. Pohon berada di atas tanah di bawahnya: saat Anda nanti melakukan grading tapak, pohon akan mengikutinya. Untuk mengunci tanaman pada elevasi tertentu, ketik di **Elevasi** pada Properti.

## Bedengan tanam

1. Pilih tanaman utama, klik {{ui:Bedengan}} lalu klik sudut-sudut bedengan. Tekan {{key:Enter}} (atau klik sudut pertama lagi) untuk menutupnya.
2. Bedengan terisi dengan tanaman itu sesuai jaraknya, dalam pola **segitiga** (yang biasa: setiap tanaman berjarak sama dari enam tanaman lain), setengah jarak masuk dari tepi.
3. Di Properti, **Tambahkan tanaman** mencampurkan tanaman yang dipilih di sebelah kiri. Atur **Porsi %** setiap tanaman: bedengan mengambil tepat sejumlah itu dari setiap tanaman, tersebar di seluruh bedengan. **Acak ulang campuran** mengacak posisi tanaman.

Jika **Jarak** kosong, digunakan jarak tanaman masing-masing (dibobot menurut porsinya); ketik satu nilai untuk memakainya bagi setiap tanaman. **Pola** dapat dipilih persegi, dan **Baris pada** memutar barisnya.

## Pagar

Pilih tanaman pagar, klik {{ui:Pagar tanaman}}, klik sepanjang pagar lalu tekan {{key:Enter}}. Tanaman ditempatkan di sepanjang garis sesuai jaraknya, dipusatkan agar kedua ujungnya memiliki jarak tepi yang sama. Pagar dapat dibuat **dua baris, selang-seling**, dengan jarak tertentu di antara keduanya.

## Label

Tanaman tunggal diberi label sesuai pengaturan label (`{name}` secara bawaan); ketik label Anda sendiri untuk satu tanaman di Properti. Bedengan diberi label dengan jumlah setiap tanaman, pagar dengan jumlahnya. Lainnya › {{ui:Label tanaman}} menyalakan dan mematikan label. Isian label: `{name}`, `{botanical}`, `{size}` (pot), `{qty}`, `{height}`, `{spread}`, `{container}`.

## Jadwal tanaman

Lainnya › {{ui:Daftar tanaman…}} menghitung setiap tanaman menurut spesies, dari tanaman tunggal, bedengan, dan pagar sekaligus, dengan ukuran tanamnya. Simpan sebagai **CSV** atau **XLSX**, atau **Kirim ke TakeoffCraft**: file kuantitas yang dibuka TakeoffCraft untuk memberi harga tanaman (bersama kuantitas perkerasan dan irigasi di sebelahnya).

## IFC

Lainnya › {{ui:Ekspor IFC lanskap}} menyimpan lanskap sebagai file IFC (IFC 4.3) yang dapat dimuat model BIM: setiap tanaman sebagai `IfcGeographicElement` bertipe VEGETATION, ditipekan menurut spesiesnya dengan properti tanaman (nama botani, ukuran, zona ketahanan, air, cahaya), setiap bedengan dan pagar satu elemen dengan jumlahnya, di tapak. BimCraft membukanya di samping bangunan.
