---
title: Objek bentuk bebas
summary: Bawa bentuk yang dibuat di aplikasi lain (STL, OBJ, atau item pustaka) ke lokasi; ia berdiri di atas tanah atau dipotong ke dalamnya, dan volume, luas, serta jejaknya dihitung seperti yang lain.
keywords: bentuk bebas, objek kustom, patung, pot tanaman, kursi, mesh, stl, obj, item pustaka, sadar medan, mengikuti tanah, memotong tanah, kuantitas, volume, ifc
from: ec835f33
---

Fitur satu kali (pot tanaman, dinding kursi, patung, gundukan bermain) dapat dibuat di ModelCraft atau PartCraft dan ditempatkan di sini agar berada di model dan jadwal yang sama dengan semua yang lain.

1. Lanskap › Lainnya › {{ui:Objek bentuk bebas…}} dan pilih file **STL** atau **OBJ** (dalam satuan proyek: kaki pada proyek kaki, meter pada proyek meter) atau **item pustaka** CadCraft (`.json`) dengan badan mesh.
2. Klik tempat ia akan diletakkan.

## Alasnya

- **Mengikuti tanah**: titik terendahnya berada di atas tanah terendah di bawah jejaknya, sehingga tidak ada yang melayang. Properti memperkirakan berapa bagiannya yang berada di bawah tanah.
- **Memotong tanah**: alasnya diatur pada suatu elevasi, dan tanah di dalam jejaknya digrading ke sana dengan lereng daylight, dihitung di **Pekerjaan tanah** seperti platform.

Putar dengan **Putar**, dan seret di denah untuk memindahkannya.

## Dihitung

Properti memberikan **volume** (untuk solid tertutup), **luas permukaan**, **jejak**, dan **tinggi**, diukur dari mesh. Ekspor IFC menuliskannya dengan **kelas IFC** yang Anda pilih dan kuantitas tersebut.

:::note
Jejak adalah cangkang cembung (convex hull) dari garis luarnya: bentuk cekung (pot tanaman berbentuk L) digrading seolah-olah sudah terisi penuh.
:::
