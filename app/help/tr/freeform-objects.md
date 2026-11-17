---
title: Serbest biçimli nesneler
summary: Başka bir uygulamada yapılmış bir şekli (STL, OBJ ya da bir kütüphane öğesi) sahaya getirin; zemine oturur ya da içine kesilir ve hacmi, alanı ve taban izi diğerleri gibi sayılır.
keywords: serbest biçimli, özel nesne, heykel, saksı, oturma, ağ, stl, obj, kütüphane öğesi, araziye duyarlı, zemini takip et, zemine kes, miktarlar, hacim, ifc
from: ec835f33
---

Tek seferlik bir özellik (bir saksı, bir oturma duvarı, bir heykel, bir oyun tepesi) ModelCraft ya da PartCraft'ta yapılabilir ve buraya yerleştirilebilir; böylece diğer her şeyle aynı modelde ve listelerde yer alır.

1. Peyzaj › Daha fazla › {{ui:Serbest biçimli nesne…}} seçeneğine gidin ve bir **STL** ya da **OBJ** dosyası (proje birimlerinde: fit projesinde fit, metre projesinde metre) ya da gövdesi bir ağ olan bir CadCraft **kütüphane öğesi** (`.json`) seçin.
2. Nesnenin gideceği yere tıklayın.

## Tabanı

- **Zemini takip eder**: en alçak noktası, taban izinin altındaki en alçak zemine oturur; böylece hiçbir şey havada kalmaz. **Özellikler**, bunun ne kadarının zeminin altında olduğunu tahmin eder.
- **Zemini keser**: tabanı bir kotta ayarlanır ve taban izinin içindeki zemin, yarma-dolgu sınırı şevleriyle buna tesviye edilir; bir platform gibi **Toprak işleri** içinde sayılır.

**Döndürülmüş** ile çevirin; taşımak için planda sürükleyin.

## Sayılanlar

**Özellikler**, ağdan ölçülen **hacmini** (kapalı bir katı için), **yüzey alanını**, **taban izini** ve **yüksekliğini** verir. IFC dışa aktarması, seçtiğiniz **IFC sınıfı** ile ve bu miktarlarla birlikte yazar.

:::note
Taban izi, ana hattın dış bükey zarfıdır: içbükey bir şekil (L biçimli bir saksı) sanki doldurulmuş gibi tesviye edilir.
:::
