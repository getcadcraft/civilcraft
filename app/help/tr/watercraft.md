---
title: WaterCraft: talepler, yangın debisi, kesintiler ve su yaşı
summary: WaterCraft eklentisiyle müşterileri su ana hatlarınızda talep olarak tanımlayın, her yangın musluğunda kullanılabilir debiyi denetleyin, hangi ana hat kesintisinin en çok zarar verdiğini görün ve bir gün boyunca su yaşını ve kloru izleyin.
keywords: watercraft, su dağıtımı, talepler, müşteriler, tepe faktörü, talep deseni, yangın debisi, yangın musluğu, kalan basınç, kritiklik, kesinti, vanalı bölüm, su yaşı, klor, kalan klor, kaynak izleme, çıkmaz uç, csv, eklenti
from: 76809f01
---

WaterCraft, Su ana hatları araçlarıyla zaten çizdiğiniz su ağının üzerinde çalışan bir eklentidir. Sağ panelde dört bölümden oluşan bir sekme ekler.

:::warning
Yalnızca bir hesaplama yardımcısıdır. Gerçek bir şebeke modeline değil, uydurulmuş ağlar üzerinde elle yapılmış hesaplara karşı denetlendi. Her sonucu bir su mühendisinin denetlemesi gerekir. Henüz pompa istasyonları, ikinci dereceden bozunma ve senaryolar yoktur.
:::

## Neler yapacaksınız

- Müşterileri ağa talep olarak yerleştirin.
- İhtiyaç duyduğunuz debinin altında kalan yangın musluklarını bulun.
- Kaybı en önemli olan ana hatları bulun.
- Eski suyu ve düşük klor seviyesini bulun.

## Adımlar

1. {{ui:Ayarlar}} › {{ui:Eklentiler}} bölümünü açın ve {{ui:WaterCraft (su dağıtımı)}} seçeneğini açın. Sağ panelde bir {{ui:WaterCraft}} sekmesi belirir.
2. Önce Su ana hatları araçlarıyla bir rezervuar, düğüm noktaları ve borular çizin (bkz. [Su ana hatları](topic:water-mains)). Ağ yoksa sekme bunu yapmanız gerektiğini söyler.
3. {{ui:Talepler}} altında her satıra bir müşteri gelecek şekilde yapıştırın: kimlik, x, y, tür, miktar. {{ui:Tepe faktörü}} ve {{ui:Saatlik desen}} seçin (konut günü, ticari gün, düz ya da desenin mevcut hali). Her müşterinin nereye düştüğünü (en yakın düğüm noktası) görmek için {{ui:Denetle}} düğmesine basın, ardından {{ui:Ağa yerleştir}} seçeneğine basın. Geri al talepleri geri alır.
4. {{ui:Yangın debisi}} altında gereken debiyi ve kalan basıncı ayarlayın, kalan basıncın {{ui:Yalnızca yangın musluğunda}} mı yoksa {{ui:Sistemin her yerinde (daha sıkı)}} mı tutulacağını seçin ve {{ui:Yatay mesafe}} düğmesine basın. Her yangın musluğu en kötüden başlayarak, yeterli ya da yetersiz olarak listelenir.
5. {{ui:En önemli ana hat}} altında {{ui:tek seferde bir boru}} ya da {{ui:tek seferde bir vanalı bölüm}} seçin ve {{ui:Yatay mesafe}} düğmesine basın. Her kesinti; kesilen talebi, kesilen düğüm noktalarını, yeni olarak minimum basıncın altına düşen düğüm noktalarını ve kalan en düşük basıncı gösterir.
6. {{ui:Su yaşı ve klor}} altında neyi izleyeceğinizi seçin (su yaşı, klor ya da bir kaynak izleme), çalıştırılacak saatleri ve istediğiniz sınırları ayarlayın, ardından {{ui:Yatay mesafe}} düğmesine basın. Sınırlarınızın dışındaki düğüm noktaları listelenir.
7. Herhangi bir tablonun altındaki {{ui:CSV olarak kaydet}} düğmesine basarak saklayın.

## Notlar

- Gereken yangın debisi ile konut başına ve acre başına kullanım, başlangıç değerleridir; standart değil. İşletmenizin kendi rakamlarını kullanın.
- Bir vanayla kısmen kesilen boru tamamen kapalı sayılır; bu yüzden gösterilen kesinti gerçek olandan biraz daha kötüdür.
- Su kalitesi bölümünü, son günü okumadan önce günlük desenin tekrar edecek kadar uzun çalıştırın.
- {{ui:Durdur}} uzun bir çalıştırmayı erken bitirir; liste o zaman yalnızca yapılanları gösterir.
- Ağınız bu projede ve bu bilgisayarda kalır. Hiçbir şey bir yere gönderilmez.
