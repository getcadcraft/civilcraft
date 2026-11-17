---
title: Objek bentuk bebas
summary: Bawa bentuk yang dibuat dalam aplikasi lain (STL, OBJ atau item pustaka) ke tapak; ia terletak di atas tanah atau dipotong ke dalamnya, dan isi padu, luas serta jejaknya dikira seperti yang lain.
keywords: bentuk bebas, objek tersuai, arca, pasu, kerusi, jejaring, stl, obj, item pustaka, sedar tanah, ikut tanah, potong ke dalam tanah, kuantiti, isi padu, ifc
from: ec835f33
---

Satu ciri sekali sahaja (pasu, dinding kerusi, arca, busut permainan) boleh dibuat dalam ModelCraft atau PartCraft dan diletakkan di sini supaya ia berada dalam model dan jadual yang sama seperti yang lain.

1. Landskap › Lagi › {{ui:Objek bentuk bebas…}} dan pilih fail **STL** atau **OBJ** (dalam unit projek: kaki dalam projek kaki, meter dalam projek meter) atau **item pustaka** CadCraft (`.json`) dengan badan jejaring.
2. Klik tempat ia akan diletakkan.

## Asasnya

- **Mengikut tanah**: titik terendahnya terletak di atas tanah terendah di bawah jejak tapaknya, supaya tiada apa yang terapung. Sifat menganggarkan berapa banyak daripadanya berada di bawah tanah.
- **Memotong tanah**: asasnya ditetapkan pada satu aras dan tanah di dalam jejak tapaknya dibentuk ke aras itu dengan cerun persilangan, dikira dalam Kerja tanah seperti platform.

Pusingkannya dengan **Putar**, seret ia pada pelan untuk mengalihkannya.

## Dikira

Sifat memberi **isi padu** (untuk pepejal tertutup), **luas permukaan**, **jejak** dan **ketinggian**, diukur daripada jejaring. Eksport IFC menulisnya dengan **kelas IFC** yang anda pilih dan kuantiti tersebut.

:::note
Jejak ialah sarung cembung (convex hull) bagi garis luar: bentuk cekung (pasu berbentuk L) dibentuk seolah-olah ia diisi penuh.
:::
