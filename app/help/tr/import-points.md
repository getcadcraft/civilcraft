---
title: Ölçüm noktalarını içe aktarma
summary: Bir CSV veya metin nokta dosyası açın, Noktaları içe aktar iletişim kutusunda sütun sırasını denetleyin, okunamayan satırları düzeltin ve noktaları gruplara ayırın.
keywords: nokta içe aktar, csv, txt, pnezd, penzd, nokta dosyası, arazi ölçümü, cogo noktaları, nokta grupları, sütunlar, kuzey, doğu
from: ad33d88a
---

Nokta dosyası, satır başına bir nokta içeren metin dosyasıdır: nokta numarası, kuzey, doğu, kot ve açıklama bir sırada, virgül, sekme, noktalı virgül veya boşlukla ayrılmış. CivilCraft bunu tarayıcıda okur ve hemen bir yüzey oluşturur.

## Başlamadan önce

- Mümkünse dosyanın sütun sırasını bilin (PNEZD ve PENZD bilgisayara aynı görünür).
- Birimlerini bilin. CivilCraft dönüştürme yapmaz: dosyaya uyması için sol paneldeki **Birimler**'i ayarlayın (bkz. [Birimler, istasyonlar ve sayı biçimleri](topic:units-and-stations)).
- Koordinatlar büyük olabilir: eyalet düzlem koordinatlarındaki milyonlarca kuzey ve doğu değeri uygundur.

## Dosyayı içe aktarın

1. Araç çubuğunda {{ui:Aç}} tıklayın veya {{key:Mod+O}} tuşlarına basın ve dosyayı seçin. Dosyayı planın üzerine de sürükleyebilirsiniz.
   **Noktaları içe aktar** iletişim kutusu dosya adı, {{ui:Algıla}} olarak ayarlanmış bir **Sütunlar** listesi, bir özet satırı ve ilk altı noktayla açılır.
2. Özet satırını okuyun. Kaç noktanın okunduğunu, hangi sütun sırasıyla, bu sıranın nasıl bulunduğunu ve sütunları neyin ayırdığını söyler. Sıranın bulunduğu üç yol:
   - "başlık satırından": ilk satır sütunlarını adlandırır (Nokta, Kuzey, Doğu, Kot, Açıklama veya X, Y, Z …). Bu en güvenli yoldur.
   - "seçildiği gibi": **Sütunlar**'da bir sıra seçtiniz.
   - "sütun sayısından ve nokta satırı ayarından (PNEZD) tahmin edildi — kuzey ve doğunun yer değiştirmediğini denetleyin": kullanılabilir bir başlık yok. Dosyalarınız genellikle önce doğu içeriyorsa, [CivilCraft ayarları](topic:settings) içinde **Nokta satırları**'nı P, E, N, Z, D olarak ayarlayın.
3. Önizleme tablosunu denetleyin. Sütunları, dosya hangi sırayı kullanırsa kullansın her zaman **Nokta**, **Kuzey**, **Doğu**, **Kot** ve **Açıklama**dır. Gerçek bir sahanın kuzey ve doğu değerleri genellikle belirgin biçimde farklı büyüklüktedir: yer değiştirmiş görünüyorlarsa tahmin yanlıştır.
4. Sıra yanlışsa **Sütunlar**'dan doğrusunu seçin (örneğin {{ui:PENZD — nokta, doğu, kuzey, kot, açıklama}}). Özet ve önizleme hemen güncellenir.
5. Önizlemenin altında **Okunmayan satırlar**'a bakın. Her satır dosya satır numarasını, nedenini ve satırın başını adlandırır. Bkz. [Okunmayan satırlar](topic:import-points#rows-that-are-not-read).
6. {{ui:İçe aktar}} tıklayın.
   Noktalar planda belirir, görünüm onlara yakınlaşır ve yüzey oluşturulur. Durum çubuğu örneğin "site.csv dosyasından 276 nokta içe aktarıldı; yüzey: 546 üçgen." der.

Projenin henüz adı yoksa dosyanın adını alır.

## Grupları denetleyin

Her nokta, **açıklamasının ilk sözcüğüyle** adlandırılan bir gruba aittir; büyük harflerle: "GRD", "FL 12" ve "fl" GRD, FL ve FL gruplarıdır. Açıklaması olmayan noktalar "(açıklama yok)" grubuna girer.

1. Sol paneldeki **Noktalar** altındaki tabloya bakın: grup, nokta sayısı ve bir **Yüzey** seçimi.
2. Her grup {{ui:Noktalar}} olarak başlar. Su hatlarını, kaplama kenarlarını, yamaç üstlerini ve ayaklarını, sırtları ve benzeri kodlu çizgileri {{ui:Kırılma çizgisi}} olarak değiştirin. Zemini şekillendirmemesi gereken grupları (kontrol noktaları, ağaç tepeleri, tepeden ölçülen elektrik direkleri) {{ui:Dışarıda bırakıldı}} olarak ayarlayın.
3. Planda ({{ui:Seç}} ile) bir noktaya tıklayın; sağ panelde numarasını, koordinatlarını, kotunu, açıklamasını ve grubunu görün.

:::warning
Bir kırılma çizgisi grubu **tüm** noktalarını nokta numarası sırasıyla **tek bir çizgide** birleştirir. Bu, her kodlu çizgi kendi kodu ile sırayla ölçüldüğünde işe yarar. Her ikisi de "FL" koduyla işaretlenmiş iki ayrı su hattı, aralarında zikzak çizen tek bir çizgiye dönüşür. Kodlarınız paylaşılıyorsa, her çizginin noktalarını bunun yerine {{ui:Kırılma çizgisi}} aracıyla tıklayın (bkz. [Yüzeyi oluşturun ve iyileştirin](topic:build-surface)).
:::

## Okunmayan satırlar

| Gösterilen neden | Ne anlama gelir | Ne yapmalı |
|---|---|---|
| "kuzey veya doğu bir sayı değil" | Bir koordinat sütunu metin içerir | Sütun sırasını veya dosyanın ortasındaki yabancı bir metin satırını denetleyin |
| "kot bir sayı değil" | Kot sütunu metin içerir | Yanlış sütun sırası veya kot sütununda bir açıklama |
| "nokta numarası yok" | Nokta sütunu boş | Noktayı numaralandırın veya P içermeyen bir sıra seçin (NEZD, NEZ …): noktalar o zaman 1, 2, 3 … diye numaralandırılır |
| "12 numaralı nokta iki kez var (ilki tutuldu)" | İki satır aynı numarayı paylaşıyor | Ölçümler ikisi de gerçekse dosyada birini yeniden numaralandırın |
| "3 sütun, 5 bekleniyor (PNEZD)" | Satır kısa | Bozuk bir satır veya yanlış sütun sırası |

Kotu boş olan bir nokta tutulur, ancak yüzeyde kullanılmaz. **Noktalar** bilgileri kaç noktanın kotu olduğunu gösterir.

`#`, `;` veya `//` ile başlayan satırlar açıklamadır ve atlanır. Boş satırlar atlanır.

## Noktaları değiştirin veya ekleyin

Yeniden içe aktarmak **tüm** noktaları **değiştirir**; onlara eklemez. Eksenleriniz, platformlarınız, boru hatlarınız, çizilmiş kırılma çizgileriniz ve sınırınız kalır. Geri alma geçmişi temizlenir; bu yüzden eski noktaları geri isteyebileceğinizi düşünüyorsanız önce projeyi kaydedin. İki dosyayı birleştirmek için, içe aktarmadan önce bir metin düzenleyicisinde veya elektronik tabloda birleştirin (yinelenen nokta numaralarına dikkat edin).

Noktalar CivilCraft içinde henüz taşınamaz, düzenlenemez veya silinemez. Dosyada düzeltip yeniden içe aktarın.

## İlgili

- [Nokta dosyası biçimleri](topic:point-file-formats): her sütun sırası ve başlıkların nasıl tanındığı.
- [Yüzeyi oluşturun ve iyileştirin](topic:build-surface).
