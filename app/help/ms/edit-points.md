---
title: Sunting titik ukur
summary: Tukar nombor, koordinat, aras atau huraian satu titik, atau seret ke tempat baharu pada pelan.
keywords: sunting titik, alih titik, tukar aras, nombor semula, nombor titik, huraian, seret, northing, easting, betulkan titik, tembakan rosak
from: 375ae2e9
---

Tembakan yang rosak, ketinggian rod yang salah, huraian yang ditaip salah: betulkan satu titik itu, dan permukaan akan mengikutinya.

## Tukar nilai titik

1. Dengan {{ui:Pilih}}, klik titik pada pelan. **Sifat** memaparkan nombor, easting, northing, aras dan huraian dalam kotak.
2. Taip nilai baharu dan tekan {{key:Enter}} (atau klik di luar). Biarkan **Aras** kosong untuk titik tanpa aras.
3. Permukaan, kontur dan semua yang dibina daripadanya dikemas kini serentak.

Setiap perubahan ialah satu langkah: {{key:Mod+Z}} membuat asal dan {{key:Mod+Y}} membuat semula. Nilai yang CivilCraft tidak dapat gunakan (nombor yang sudah dimiliki titik lain, huruf dalam koordinat) ditolak: kotak digariskan dan bar status menyatakan sebabnya.

Kod huraian baharu membentuk kumpulan titik baharu, seperti import (lihat [Bina permukaan](topic:build-surface)).

## Alih titik pada pelan

1. Pilih titik (ia mendapat gelang).
2. Seret gelang itu. Bar status memaparkan easting dan northing ke mana ia akan dialihkan.
3. Lepaskan untuk mengalihkannya; arasnya kekal. Tekan {{key:Esc}} sebelum melepaskan untuk mengembalikannya.

## Garis putus mengikut titik

Garis putus yang dilukis dengan alat {{ui:Garis putus}} menyalin titik yang dilaluinya. Apabila anda mengalihkan titik atau menukar arasnya, bucu garis putus di atasnya turut bergerak bersamanya, dalam langkah yang sama. Kumpulan garis putus yang dibuat daripada huraian sentiasa dibina semula daripada titik.

:::note
Permukaan yang dibaca daripada fail LandXML mengekalkan segi tiganya sendiri: suntingan titik hanya mengubahnya selepas {{ui:Bina semula permukaan daripada titik}}.
:::
