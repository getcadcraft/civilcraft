---
title: IFC dışa aktarımını müşterinin IDS'sine göre denetleyin
summary: Bir müşterinin ya da yol kurumunun verdiği .ids dosyasını yükleyin ve bu şartı karşılamayan her dışa aktarılmış öğeyi Sorunlar'da görün.
keywords: ids, bilgi teslim şartnamesi, buildingsmart, gereksinimler, teslim, denetim, doğrulama, kalite kontrol, ifc dışa aktarımı, ifc 4.3, eksen, yol, ihale, procurement
from: 183d9a0e
---

## Ne yapacaksınız

Bir IDS (Information Delivery Specification, bir buildingSMART standardı), bir IFC'nin neleri içermesi gerektiğinin listesidir. Kamu ihaleleri genellikle işle birlikte bir tane gönderir. CivilCraft, bu projenin dışa aktardığı IFC'yi, dışa aktarma için seçtiğiniz IFC sürümünde, buna karşı denetler ve yetersiz kalan her öğeyi listeler.

## Adımlar

1. Projenizi açın.
2. Araç çubuğunun Dışa aktar grubunda {{ui:IFC}} düğmesine tıklayın. İletişim kutusunda teslim edeceğiniz IFC sürümünü seçin.
3. {{ui:Check against IDS…}} düğmesine tıklayın.
4. {{ui:Load an .ids file…}} düğmesine tıklayın ve dosyayı seçin. Hiçbir şey yüklenmez.
5. Sonucu okuyun: her şartname **Geçti** ya da **Kaldı** ile ve kaç öğeye uygulandığıyla.
6. Sorunlar'ı ({{key:Ctrl+Shift+M}}) açın ve bir başarısızlığa tıklayarak onu oluşturan eksen, platform, boru, yapı ya da yapı kütlesini seçin.

## Ne görmelisiniz

- Her eksik olan dışa aktarılmış öğe ve gereksinim başına bir uyarı; şartnamenin adı, IDS'nin istediği ve dışa aktarmanın ne içerdiğiyle.
- Denetim raporu (Sorunlar'da) IDS ile başlar: başlığı, sürümü, yazarı ve her şartnamenin sayıları.

## Bilmeniz iyi olacaklar

- IDS proje dosyasına kaydedilir, bu yüzden projeyi açtığınızda yeniden denetlenir. Onu yüklemek ya da unutmak, geri alabileceğiniz tek bir adımdır.
- Her değişiklik kısa bir süre sonra yeniden denetlenir. Büyük yüzeylerin yazılması daha uzun sürer, bu yüzden denetim çalıştırmaları arasında biraz daha beklenir.
- Denetim, {{ui:IFC}} dışa aktarımının yazdığı aynı dosyayı kullanır; orada son seçilen sürümde (hiç seçilmediyse IFC 4.3).
- Sayılar SI birimlerinde karşılaştırılır: feet'teki bir proje önce metreye çevrilir.

- IDS'deki kalıplar bütün değer olarak okunur. Baştaki `^` ve sondaki `$` de çoğu IDS dosyasının anlamladığı gibi "bütün değer" sayılır.

## Sonraki

- [IFC dışa aktarma](topic:ifc)
