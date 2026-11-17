---
title: Ekspor situs 3D sebagai USD
summary: Tulis tampilan situs 3D (permukaan, garis, alinyemen, pipa, dan titik survei) sebagai USD dalam skala sebenarnya dan koordinat sebenarnya.
keywords: usd, usda, usdc, usdz, openusd, ekspor, 3d, situs, permukaan, alinyemen, titik survei, koordinat, perakitan adegan
from: e7be08ec
---

Di tampilan 3D, {{ui:USD}} di samping {{ui:GLB}} dan {{ui:OBJ}} menulis apa yang ditampilkan tampilan sebagai USD.

1. Buka tampilan 3D dan pilih apa yang akan ditampilkan.
2. Buka {{ui:USD}} dan pilih {{ui:Teks (.usda)}}, {{ui:Biner (.usdc)}}, atau {{ui:Paket (.usdz)}}.

File berada dalam skala sebenarnya (lebih besar vertikal dikembalikan), dalam meter dengan Z ke atas. Situs berada di easting, northing, dan elevasi proyeknya, dan menyebutkan sistem koordinatnya jika proyek memilikinya. Permukaan, pipa, dan bangunan berupa mesh dengan warnanya; kontur, breakline, dan garis koridor berupa garis; setiap alinyemen menjadi garisnya sendiri di bawah namanya; titik survei mempertahankan nomornya.
