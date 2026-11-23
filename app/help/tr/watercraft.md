---
title: WaterCraft: talepler, yangın debisi, kesintiler ve su yaşı
summary: WaterCraft eklentisiyle müşterileri su ana borularınız üzerindeki talepler olarak tanımlayın, her yangın musluğunda kullanılabilir debiyi kontrol edin, hangi ana boru kesintisinin en çok zarar verdiğini görün ve bir gün boyunca su yaşını ve kloru izleyin.
keywords: watercraft, su dağıtımı, talepler, müşteriler, tepe faktörü, talep deseni, yangın debisi, yangın musluğu, artık basınç, kritiklik, kesinti, vanalı bölüm, su yaşı, klor, artık, kaynak izleme, çıkmaz sokak, csv, eklenti
from: 066fb17a
---

WaterCraft, Su ana boruları araçlarıyla zaten çizdiğiniz su ağı üzerinde çalışan bir eklentidir. Sağ panele dört bölümü olan bir sekme ekler.

:::warning
Yalnızca bir hesaplama yardımcısıdır. Gerçek bir şebeke modeli yerine, uydurma ağlar üzerinde el hesaplarıyla karşılaştırılarak denetlenmiştir. Her sonucu bir su mühendisi denetlemelidir. Senaryolar, kontrol kuralları, vanalar ve saha okumaları kendi konularına sahiptir: WaterCraft eklentisinin yardımında "Senaryolar" ve "Çalışmalar".
:::

## Yapacaklarınız

- Müşterileri talepler olarak ağa yerleştirin.
- İhtiyacınız olan debinin altında kalan yangın musluklarını bulun.
- Kaybı en önemli olan ana boruları bulun.
- Eski suyu ve düşük klorü bulun.

## Adımlar

1. {{ui:Ayarlar}} › {{ui:Eklentiler}} yolunu açın ve {{ui:WaterCraft (su dağıtımı)}} seçeneğini açın. Sağ panelde bir {{ui:WaterCraft}} sekmesi belirir.
2. Önce Su ana boruları araçlarıyla bir rezervuar, birleşim noktaları ve borular çizin (bkz. [Su ana boruları](topic:water-mains)). Ağ yoksa sekme bunu yapmanız gerektiğini söyler.
3. {{ui:Talepler}} altında her satıra bir müşteri yapıştırın: kimlik, x, y, tür, miktar. {{ui:Tepe faktörü}} ve {{ui:Saatlik desen}} seçin (konut günü, ticari gün, düz veya desenin olduğu gibi kalması). Her müşterinin nereye düştüğünü (en yakın birleşim noktası) görmek için {{ui:Denetle}}'ye basın, sonra {{ui:Ağa ekle}}'ye basın. Geri al talepleri geri alır.
4. {{ui:Yangın debisi}} altında gereken debiyi ve artık basıncı ayarlayın, artığın {{ui:Yalnızca yangın musluğunda}} mı yoksa {{ui:Sistemin her yerinde (daha sıkı)}} mı tutulacağını seçin ve {{ui:Yatay mesafe}}'ye basın. Her yangın musluğu en kötüden başlayarak, yeterli ya da yetersiz olarak listelenir.
5. {{ui:Hangi ana boru en çok önemli}} altında {{ui:Bir seferde bir boru}} ya da {{ui:Bir seferde bir vanalı bölüm}} seçin ve {{ui:Yatay mesafe}}'ye basın. Her kesinti; kesilen talebi, kesilen birleşim noktalarını, yeni asgari basınç altına düşen birleşim noktalarını ve kalan en düşük basıncı gösterir.
6. {{ui:Su yaşı ve klor}} altında neyin izleneceğini (su yaşı, klor ya da kaynak izleme) seçin, çalıştırılacak saatleri ve istediğiniz sınırları ayarlayın ve {{ui:Yatay mesafe}}'ye basın. Sınırlarınızın dışında kalan birleşim noktaları listelenir.
7. Herhangi bir tablonun altındaki {{ui:CSV olarak kaydet}}'e basarak saklayın.

## Notlar

- Gereken yangın debisi ve konut ya da dönüm başına tüketim başlangıç değerleridir, standart değildir. Kendi şirketinizin değerlerini kullanın.
- Bir vana tarafından kısmen kesilen boru bütünüyle kapalı sayılır; bu nedenle gösterilen kesinti gerçek olandan biraz daha kötüdür.
- Su kalitesi bölümünü, son günü okumadan önce günlük desen tekrarlanacak kadar uzun çalıştırın.
- {{ui:Durdur}} uzun bir çalışmayı erken bitirir; liste o zaman yalnızca yapılanları gösterir.
- Ağınız bu projede ve bu bilgisayarda kalır. Hiçbir şey bir yere gönderilmez.
