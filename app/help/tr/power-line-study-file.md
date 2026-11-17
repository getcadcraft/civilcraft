---
title: Başka bir hat programı için etüt dosyaları (.DON)
summary: Bir havai hattı .DON etüt dosyası olarak kaydedin ya da bir dosyadan direkleri yeni bir hatta okuyun. Dosyayı okuyan programla henüz sınanmadı.
keywords: don, .don, etüt dosyası, xml, dışa aktar, içe aktar, havai hat programı, çekme, canton
from: 1abc4d07
---

Bazı havai hat programları bir etüdü `.DON` dosyasında (XML metni) tutar. CivilCraft bir hattı böyle bir dosya olarak yazabilir ve bir dosyadaki direkleri okuyabilir.

:::warning
**Henüz sınanmadı.** Bunu, bir kullanıcının paylaştığı biçimin alan adları listesinden yaptık, gerçek bir dosyadan değil; dosyalarımızı onu okuyan programda henüz açmadık. Ona güvenmeden önce dosyayı orada açın ve her değeri denetleyin. Bir `.DON` dosyası paylaşabilirseniz (müşteri bilgileri çıkarılmış olarak), bunu doğru yapmamıza yardımcı olur.
:::

## Etüt dosyası kaydedin

1. Hatta bir iletken verin ve sonuçları olduğundan emin olun (Özellikler'de "hesaplanmadı" yok).
2. {{ui:Daha fazla}} › {{ui:Etüt dosyası kaydet (.DON)…}}; hattı seçin, bir açıklama ve bir iş numarası ekleyin.
3. {{ui:Etüt dosyasını kaydet}}.

Dosya hattın direklerini (koordinatlar, zemin, yükseklikler, roller, travers, tutulan ya da önerilen direk, yük durumu başına yükler, temel), uç bağlantılar arasındaki her bölüm için bir bölüm (iletken, gerilim, hakem aralığı, aralıklar, çekme ve katener parametresi, yük durumu başına en büyük çekme) ve çekme tablolarını tutar. Uzunluklar metre, kuvvetler daN cinsindendir; metin Latin-1 ile yazılır, bu yüzden kapsamı dışındaki bir karakter `?` olur.

## Etüt dosyası okuyun

{{ui:Daha fazla}} › {{ui:Etüt dosyası aç (.DON)…}}, direkleri yeni bir hatta okur. İletken, direkler ve traverslar adlarına göre kütüphanenizle eşleştirilir; bulunamayan her şey Özellikler'de sizin seçmeniz için bırakılır.
