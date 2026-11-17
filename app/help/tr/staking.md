---
title: Kazık çakma raporu hazırlama
summary: Bir eksen boyunca istasyon ve ofsetlerde kazıkları veya yakınındaki noktaları; istasyon, ofset, kuzey, doğu, tasarım ve zemin kotlarını ile kazı veya dolguyu listeleyin ve raporu CSV veya PDF olarak kaydedin.
keywords: kazık çakma, kazık, kazık raporu, kesim listesi, kot listesi, istasyon, ofset, kazı, dolgu, aplikasyon, inşaat kazık çakma, yapım sonrası
from: d8a4e9f1
---

Bir eksen seçin ve **Özellikler** içindeki **Kazık çakma raporu**na tıklayın.

## İstasyonlarda ve ofsetlerde kazıklar

1. **Başlangıç** ve **Bitiş**: kazıklanacak istasyonlar (1+50 veya 150).
2. **Her**: aralık. Kazıklar, bunun her katında, iki uçta ve (kutu işaretliyse) eksenin eğrilerinin başladığı ve bittiği yerlerde çakılır.
3. **Ofsetler**: eksenin solu ve sağı, istasyon yönünde bakılarak: `12 L, 0, 12 R`, `L12 CL R12` veya `-12, 0, 12` (sol eksi). Koridorlu bir eksen, kaplama kenarları ve bankuetlerle başlar.
4. **Numaralandırmaya başla** ve **önek** kazıkları adlandırır: 1, 2, 3 veya S101, S102.

## Eksene yakın noktalar

**Eksene yakın noktalar** seçeneğini ve ne kadar yakın olacaklarını belirleyin. Bu mesafe içindeki her nokta, kendi istasyonunu ve ofsetini, oradaki tasarımı ve zemin olarak kendi kotunu alır: kazıklanmış veya yapım sonrası ölçülmüş noktaların bir kontrolüdür.

## Raporun içeriği

| Sütun | Anlamı |
|---|---|
| Nokta | Kazığın adı veya ölçü noktasının numarası |
| İstasyon, Ofset | Eksen boyunca konumu: L sol, R sağ |
| Kuzey, Doğu | Koordinatları |
| Tasarım kotu | Oradaki tesviye edilmiş koridor yüzeyi (yarma-dolgu sınırından yarma-dolgu sınırına); yoksa eksendeki tasarım boy kesiti |
| Zemin kotu | Oradaki mevcut yüzey veya ölçü noktasının kendi kotu |
| Kazı/dolgu | Zemin tasarımın üstündeyse C (kazı), altındaysa F (dolgu), iki ondalığa kadar |

Tasarım kotu olmayan bir kazık (koridor dışında veya eksenden uzakta, tasarım kotu olmayan bir eksende) kazı veya dolgu içermez; iletişim kutusu kaç tane olduğunu bildirir.

## Kaydetme

- **CSV**: bir başlık satırı, ardından yukarıdaki sütunlar ve kazı veya dolgu, işaretli bir sayı olarak (zemin eksi tasarım), elektronik tablolar ve veri toplayıcılar için.
- **PDF**: seçtiğiniz kâğıtta tablo sayfaları; her satırda bir kazık, kazılar turuncu, dolgular yeşil, diğer sayfaların künye şeridiyle birlikte.

:::note
Kazıklar, projedeki tasarımdan hesaplanır. İnşaattan önce onaylı planlarla karşılaştırın.
:::
