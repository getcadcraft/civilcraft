---
title: Katmanı bir özniteliğe göre stillendirme
summary: Bir GIS katmanının özelliklerini bir alanın değerlerine göre renklendirin (değer başına bir renk veya sayı aralıklarıyla), noktaları bir sayıya göre boyutlandırın, çokgenleri tonlayın ve plan üzerinde bir gösterge gösterin.
keywords: sembolizasyon, stil, renk, renklendirme, kategorili, derecelendirilmiş, benzersiz değerler, eşit aralık, çeyrek, doğal kırılmalar, jenks, renk skalası, renk körü, gösterge, boyut, noktalar, koroplet, sınıflar, gis, cbs
from: a3a69add
---

Bir katmanın GIS katmanları listesindeki **üç nokta** menüsünü açın ve {{ui:Style by attribute…}} seçeneğini seçin.

## Üç stil

- **Tek sembol:** daha önce olduğu gibi katman rengi.
- **Kategorili:** herhangi bir alanın ayrı her değeri için bir renk. En fazla sekiz değer, Okabe-Ito renklerinin sekizini alır (yaygın renk körlüğü türleri için birbirinden ayrı kalacak şekilde seçilmiştir); daha fazla değerde en yaygın yedi değer birer renk alır, kalanlar ortak bir gri **Diğer** sınıfını paylaşır. Değeri olmayan özellikler gri olur.
- **Derecelendirilmiş:** bir sayısal alan, bir renk skalasından birer rengi olan 2 ile 9 aralığa bölünür. Bir kırılma noktasındaki değer alt aralığa girer.

## Aralıklar nasıl kesilir

| Yöntem | Kırılmalar |
|---|---|
| Eşit aralık | En küçük ile en büyük değer arasındaki aralık eşit genişlikli parçalara bölünür. Üç aralıkta 0 ile 30 arasındaki değerler: 0, 10, 20, 30. |
| Çeyrek | Her aralıkta yaklaşık aynı sayıda özellik. Kırılmalar, sıralanmış değerlerden olağan doğrusal enterpolasyonla okunur: iki aralıkta 1 ile 10 için kırılma 5.5'tir. |
| Doğal kırılmalar (Jenks) | Her aralık içinde en az yayılım bırakan kesimler; böylece benzer değer kümeleri bir arada kalır. 1,500'den fazla değerde, eşit aralıklı 1,500 değer üzerinde çalışır ve bunu söyler. |

## Renkler

Viridis ve Cividis, parlaklığı sabit bir değişimle koyudan açığa gider; böylece aralıkların sırası gri tonlarda veya renk körlüğünde bile okunabilir. Blues açıktan koyuya gider. Kırmızıdan maviye, orta bir değer etrafında iki yönlü bir skaladır. **Renkleri ters çevir** bunların herhangi birini çevirir. İletişim kutusu, uygulamadan önce aralıkları ve her birindeki özellik sayısını listeler.

## Boyut, dolgu ve gösterge

- **Nokta boyutu** bir sayısal alana göre: değer büyüdükçe her noktanın karesi, verdiğiniz iki boyut arasında daha büyük olur (kâğıtta milimetre cinsinden, kenarın yarısı).
- **Çokgenlerin içini tonla** her çokgeni sınıf renginde doldurur (delikler boş kalır). Ton ekrandadır; çıktılar ve DXF/DWG renkli ana hatları gösterir.
- **Planda gösterge göster** sınıfları, sayılarını ve boyut aralığını planın sol altında çizer. Gösterge ekrandadır; çıktıda yer almaz.
- Özellikleri bir alanla etiketlemek için aynı menüdeki **Şununla etiketle** seçeneğini kullanın.

Stil proje dosyasında saklanır. Stilleri bilmeyen bir sürüm dosyayı katman rengiyle açar. Çıktılar, DXF ve DWG, sınıfları katmanın ve sınıfın adıyla adlandırılmış ayrı katmanlar olarak taşır; dokuz temel CAD renginden en yakın olanında. 200,000'den fazla özelliği olan bir katman tek renkte çizilir.
