---
title: Tanım anahtarları ve çizgi kodları
summary: Saha kodlarını tanımlı nokta gruplarına çevirin ve kodlu noktaları, kırılma çizgisi olan çizgilere birleştirin (başlat, bitir, kapat).
keywords: tanım anahtarları, saha kodları, çizgi kodları, şekiller, çizgi çalışması, başlat, bitir, kapat, nokta grupları, kodlar, ölçü kodları, veri toplayıcı, kırılma çizgileri, bordür, kaplama kenarı
from: b3d1af8d
---

Ölçü ekipleri her ölçümü sahada kodlar: `EP` kaplama kenarı için, `TC` bordür üstü için, `BLDG` bir bina köşesi için. Kod, noktanın tanımının ilk kelimesidir. CivilCraft noktaları ona göre gruplar ve ardından gelen çizgi kodlarını çizgilere çevirir.

## Çizgi kodları

Bir çizgi kodu, saha kodundan hemen sonraki kelimedir:

| Tanım | Anlamı |
|---|---|
| `EP B` | Bu noktada yeni bir kaplama kenarı çizgisi başlatır |
| `EP` | Geçerli EP çizgisine devam eder |
| `EP E` | Geçerli EP çizgisini bu noktada bitirir |
| `BLDG C` | Binayı kapatır: bu noktayı çizginin ilk noktasına bağlar |

Aynı kodlu noktalar nokta numarası sırasıyla birleştirilir. Farklı kodlar, bir grubu paylaşsalar bile farklı çizgilerdir: `EP1` ve `EP2` aynı anda iki kenar verir. Çizgi kodu kullanmayan bir kod, daha önceki sürümlerdeki gibi tüm noktalarından birleştirilir.

**Kırılma çizgisi** olarak kullanılan bir gruptaki çizgiler, her biri için bir kırılma çizgisi olur; böylece boşluklu bir bordür o boşluğun üzerinden gerilmez. Diğer gruplardaki çizgiler planda çizilir (V-NODE-LINE katmanı) ve DXF, DWG ve PDF'e çıkar.

Başlama, bitirme ve kapatma için kelimeler `B`, `BEG`, `START`; `E`, `END`; ve `C`, `CLO`, `CLOSE`'dur. Bunları aşağıdaki iletişim kutusunda değiştirin veya çizgi kodlarını kapatın.

## Tanım anahtarları

Bir tanım anahtarı, bir kodu bir nokta grubuna, bir kullanıma ve uzun bir açıklamaya çevirir.

1. **Noktalar** altında {{ui:Tanım anahtarları ve çizgi kodları}} seçeneğine tıklayın.
2. {{ui:Anahtar ekle}} seçeneğine tıklayın ve satırı doldurun:
   - **Kod**: eşleşecek saha kodu. `*` herhangi karakterleri, `?` tek bir karakteri temsil eder; böylece `EP*` EP, EP1 ve EP12'yi yakalar.
   - **Grup**: bu noktaların katılacağı nokta grubu (boş = kodun kendisi). `EP*` ve grup `EP` ise EP1 ve EP2 bir grupta olur, ama ayrı çizgi olarak kalır.
   - **Kullanım**: Noktalar, Kırılma çizgisi veya Dışarıda bırak; grup ilk göründüğünde için (ya da **Noktalar** tablosuna bırakın).
   - **Açıklama**: uzun ad; bir noktanın **Özellikler** içinde gösterilir.
3. **Noktalar** sütunu, siz yazarken her anahtarın yakaladığı noktaları sayar. Bir kodla eşleşen ilk anahtar kazanır.
4. {{ui:Uygula}} seçeneğine tıklayın. Gruplar, yüzey ve plan tek bir adımda izler: {{key:Mod+Z}} onu geri alır.

Bir grup, **Noktalar** tablosunda verdiğiniz kullanımı korur; bir anahtarın kullanımı yalnızca yeni olan bir grup için ayarlanır. Anahtarlar ve çizgi kodları proje dosyasında kaydedilir.
