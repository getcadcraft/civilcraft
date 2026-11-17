---
title: Ölçü noktasını düzenleme
summary: Bir noktanın numarasını, koordinatlarını, kotunu ya da açıklamasını değiştirin ya da planda yeni bir yere sürükleyin.
keywords: noktayı düzenle, noktayı taşı, kotu değiştir, yeniden numaralandır, nokta numarası, açıklama, sürükle, kuzey, doğu, noktayı sabitle, bozuk ölçüm
from: 375ae2e9
---

Bozuk bir ölçüm, yanlış bir baston yüksekliği, yanlış yazılmış bir açıklama: tek noktayı düzeltin, yüzey de onu izler.

## Nokta değerlerini değiştirme

1. {{ui:Seç}} aracıyla planda noktaya tıklayın. **Özellikler**, numarasını, doğu, kuzey, kot ve açıklamasını kutularda gösterir.
2. Yeni değeri yazın ve {{key:Enter}} tuşuna basın (ya da başka yere tıklayın). Kotu olmayan bir nokta için **Kot** alanını boş bırakın.
3. Yüzey, kot eğrileri ve bunlara dayanan her şey aynı anda güncellenir.

Her değişiklik tek bir adımdır: {{key:Mod+Z}} onu geri alır, {{key:Mod+Y}} yineler. CivilCraft'ın kullanamadığı bir değer (başka bir noktanın zaten sahip olduğu bir numara, bir koordinatta harf) reddedilir: kutunun kenarı çerçevelenir ve durum çubuğu nedenini belirtir.

Yeni bir açıklama kodu, bir içe aktarmada olduğu gibi yeni bir nokta grubu oluşturur (bkz. [Yüzey oluşturma](topic:build-surface)).

## Noktayı planda taşıma

1. Noktayı seçin (etrafında bir halka belirir).
2. Halkayı sürükleyin. Durum çubuğu, noktanın gideceği doğu ve kuzeyi gösterir.
3. Taşımak için bırakın; kotu aynı kalır. Eski yerine koymak için bırakmadan önce {{key:Esc}} tuşuna basın.

## Kırılma çizgileri noktayı izler

{{ui:Kırılma çizgisi}} aracıyla çizilen bir kırılma çizgisi, geçtiği noktaları kopyalar. Bir noktayı taşıdığınızda ya da kotunu değiştirdiğinizde, üzerindeki kırılma çizgisi köşeleri de aynı adımda onunla birlikte hareket eder. Açıklamalardan oluşturulan kırılma çizgisi grupları her zaman noktalardan yeniden oluşturulur.

:::note
LandXML dosyasından okunan bir yüzey kendi üçgenlerini korur: nokta düzenlemeleri, yalnızca {{ui:Yüzeyi noktalardan yeniden oluştur}} seçeneğinden sonra onu değiştirir.
:::
