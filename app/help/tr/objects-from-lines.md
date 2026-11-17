---
title: Çizgi işinden bağlantılı nesneler
summary: Bir çizgiden döşeme, ekili bir alan, bir yatak, bir çit, bir patika, bir duvar, bir bordür, basamaklar, bir rampa, bir platform, bir drenaj hendeği ya da bir özellik çizgisi oluşturun; çizgi hareket ettiğinde nesne de takip eder, bağlantıyı kırana kadar.
keywords: bir çizgiden, çizgi işi, DWG, DXF, bağlantı, bağlı, takip, yeniden oluştur, bağlantıyı kır, özellik çizgisi, çizgiden özellik çizgisi, içe aktarılmış katman, ana hat, supercad studio, çizim çizgisi
from: eb67a0c6
---

{{ui:Bir çizgiden}} (Peyzaj › {{ui:Daha fazla}}): bir özellik çizgisine ya da içe aktarılmış bir DWG/DXF katmanının bir çizgisine ya da ana hattına tıklayın. Kapalı bir çizgi döşeme, çim, ekili bir yatak, bir çayır, yer örtüsü, bir yatak ya da bir platform yapabilir; açık bir çizgi ise bir patika, bir duvar, bir bordür, basamaklar (ilk ve son noktası), bir rampa, bir çit ya da bir drenaj hendeği. İki türün de **özellik çizgisi** olabilmesi, bir özellik çizgisinin kendisi dışında.

## Bir çizgiden özellik çizgisi

Bir çizgiden yapılan özellik çizgisi, çizginin noktalarını alır; çizgi kapalıysa o da kapalı olur. Kotları mevcut zemin üzerine yerleştirilir (henüz zemin yoksa 0) ve kullanımı **Kapalı**dır: siz bir kullanım seçip özellikleri içinde kotlarını ayarlayana kadar hiçbir zemini şekillendirmez. Çizgi hareket ettiğinde, aynı sayıda noktası olan bir özellik çizgisi, sizin ayarladığınız her kotu korur; çizgi nokta kazanır ya da kaybederse, kotlar zemin üzerine yeniden yerleştirilir. Bkz. [Özellik çizgileri](topic:feature-lines).

Yeni nesne çizgisine bir **bağlantı** tutar. Çizgi hareket ettiğinde (noktalarını sürüklerseniz ya da çizim taşınır ya da yeniden okunursa), nesne aynı geri alma adımında yeni şekli alır ve zemin değiştiricileri aracılığıyla önerilen zemin de takip eder. Özellikler neye bağlı olduğunu söyler; {{ui:Bağlantıyı kır}} onu bağımsız yapar.

Çizgiler önce denetlenir: bir çizgi en az 2 noktaya (bir ana hat için 3), en fazla 5000 noktaya sahip olmalı, gerçek sayılar içermeli; bir ana hat kapalı olmalı ve kendini kesmemelidir. Denetimi geçemeyen bir çizgi kullanılmaz: nesne olduğu gibi kalır ve Sorunlar paneli nedenini söyler. Çizgi silinirse nesne kalır ve Sorunlar paneli bunu not eder.

## SuperCad Studio'da

Siteyi ve 2B çizimi aynı projede açın. 2B çizimde bir çizgi ya da çoklu çizgi (polyline) seçin, Ctrl+K tuşuna basın ve {{ui:Seçilen çizim çizgisinden peyzaj nesnesi}} komutunu çalıştırın: CivilCraft yukarıdaki gibi ne oluşturulacağını sorar ve nesne o çizgiye bağlı kalır. Çizimdeki çizgileri değiştirdikten sonra, Ctrl+K {{ui:Peyzajı çizimden güncelle}} nesnelerin takip etmesini sağlar; her çizgi için bir geri alma adımı. Projenin bağlantı dosyası hangi nesnenin hangi çizgiyi takip ettiğini kaydeder. SuperCad Studio'nun kendi yardımında bir Peyzaj konusu vardır.
