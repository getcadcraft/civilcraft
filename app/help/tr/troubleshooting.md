---
title: Sorun giderme
summary: CivilCraft'ta karşılaşılan sorunların belirtileri, nedenleri ve çözümleri; uygulamanın gösterdiği tam iletilerle.
keywords: sorunlar, hatalar, çalışmıyor, düzeltme, yardım, iletiler, sorun giderme, reddedildi, eksik, yanlış, yer değiştirmiş, konturlar eksik
from: a9f7dedc
---

İletiler sağ alttaki durum çubuğunda, sol ve sağ paneldeki kutularda ve iletişim kutularında görünür. Alıntılar burada Türkçeye çevrilmiştir.

## Dosya açma

**"Bu dosya 200 MB'tan büyük; CivilCraft bu kadar büyük dosyaları henüz açmıyor."**
Nokta dosyasını bölün ya da açmadan önce verileri azaltın.

**"site.json açılamadı: Bu bir CivilCraft proje dosyası değil."**
Dosya `.json` ile bitiyor ya da `{` ile başlıyor, ama bir CivilCraft projesi değil. Nokta dosyaları `{` ile başlamamalıdır.

**"… açılamadı. Bu proje dosyası daha yeni bir CivilCraft'tan (sürüm 2)."**
Proje daha yeni bir sürümle kaydedilmiş. Onu o sürümde açın ya da ondan LandXML dışa aktarın.

**"… açılamadı. Bu bir XML, ama LandXML değil (kök öğesi <…>)."**
Dosya başka türde bir XML. LandXML'i diğer programdan dışa aktarın.

**"… içinde CivilCraft'ın okuyabildiği nokta, TIN yüzeyi ya da eksen yok."**
Dosyadaki her şey CivilCraft'ın atladığı türden (örneğin yalnızca ızgara yüzeyler ya da yalnızca spiral eksenler). Mesajın geri kalanı ne olduğunu söyler. Bkz. [LandXML: okunanlar ve yazılanlar](topic:landxml-reference).

**"Örnek yüklenemedi: …"**
{{ui:Örnek sahayı aç}} CadCraft sitesinden bir dosya okur. Bağlantı yoksa, CivilCraft yalnızca çevrimdışı kullanım için kaydedilmişse çalışır (uygulama çubuğundaki düğme {{ui:Çevrimdışı hazır}} gösterir). Çevrimiçi olun, {{ui:Çevrimdışı için kaydet}} düğmesini tıklayın; bundan sonra çevrimdışı da çalışır. Bkz. [Çevrimdışı](common:offline).

**{{ui:Çevrimdışı için kaydet}} {{ui:Kaydedilemedi}} gösteriyor.**
Bazı dosyalar indirilemedi. Bağlantıyı kontrol edin ve düğmeyi yeniden tıklayın.

**{{ui:Çevrimdışı için kaydet}} {{ui:Çevrimdışı kullanım yok}} gösteriyor.**
Bu tarayıcı penceresi çevrimdışı kopya tutamaz; genellikle gizli pencere olduğu ya da bilgisayarın yönetildiği için. CivilCraft'ı normal bir pencerede açın.

**Çevrimdışıyken uygulama hiç açılmıyor.**
Bu tarayıcıda çevrimdışı kullanım için kaydedilmemiş ya da tarayıcı site verilerini temizlemiş (Safari, birkaç hafta ziyaret edilmeyen siteler için bunu yapar). Çevrimiçi olun, CivilCraft'ı açın ve {{ui:Çevrimdışı için kaydet}} düğmesini tıklayın.

**Çevrimdışı kopya eski bir sürüm.**
{{ui:Çevrimdışı hazır}} düğmesini, sonra çevrimiçiyken {{ui:Yeniden kaydet (en yeni sürümü al)}} düğmesini tıklayın.

**Aç kutusunda bir dosya gri görünüyor.**
Kutu yalnızca uzantılarına göre nokta dosyalarını, LandXML'i ve proje dosyalarını listeler. Bunun yerine dosyayı plana sürükleyin ya da `.txt` olarak yeniden adlandırın.

## Nokta içe aktarma

**"Bu dosyadan nokta okunamadı."**
**Sütunlar** içinde sütun sırasını elle seçin. Hiçbir şey işe yaramazsa dosyayı bir metin düzenleyicide açın ve her satırda bir nokta olduğunu, içinde sayılar bulunduğunu kontrol edin.

**Saha ayna görüntülü, döndürülmüş ya da bir çizgiye gerilmiş görünüyor.**
Kuzey ve doğu yer değiştirmiş. Özette "sütun sayısından tahmin edildi" yazıyordu. **Sütunlar** içinde PNEZD yerine PENZD seçin (ya da tersi), ya da yeniden içe aktarın.

**Noktalar diğerlerinden çok uzakta, plan bir noktaya kadar uzaklaşmış.**
Bir satırda koordinatta yazım hatası var ya da dosya koordinat sistemlerini karıştırıyor. Noktayı bulun (numarasını görmek için tıklayın) ve dosyayı düzeltin.

**"Okunmayan satırlar" altında listelenen satırlar.**
Bkz. [Ölçüm noktalarını içe aktarma](topic:import-points#rows-that-are-not-read) tablosu.

**Eski noktalarım kayboldu.**
Bir nokta dosyası içe aktarmak tüm noktaların yerini alır ve geri alma geçmişini temizler. Kaydettiğiniz projeyi açarak onları geri alın.

## Yüzey

**"Yüzey: Oluşturulmadı" ve kırmızı bir kutu.**
Kutu nedenini söyler: "Bir yüzey için kotları olan en az üç nokta gerekir.", "Noktaların hepsi aynı çizgide: üçgen yok.", "Kotlu nokta yok.", "Sınır noktalarla örtüşmüyor." ya da "Sınırın içinde üçgen kalmadı." Nokta sütun sırasını, nokta gruplarını ({{ui:Dışarıda bırakıldı}} durumda mı?) ve sınırı kontrol edin.

**Konturlar bir hendeği ya da sırtı düz olarak kesiyor.**
Bu çizgi bir kırılma çizgisi değil. Grubunu {{ui:Kırılma çizgisi}} olarak ayarlayın ya da {{ui:Kırılma çizgisi}} aracıyla çizin. Bkz. [Yüzeyi oluşturma ve iyileştirme](topic:build-surface).

**Bir kırılma çizgisi grubu zikzak çiziyor.**
Grupta birden fazla çizgi var ya da noktaları çizgi boyunca numaralanmamış. Grubu {{ui:Noktalar}} olarak geri alın ve her çizgiyi {{ui:Kırılma çizgisi}} aracıyla ayrı ayrı çizin.

**Dış kenar boyunca uzun ince üçgenler.**
Bir sınır çizin ({{key:O}}) ya da **En uzun dış kenar** değerini ayarlayın.

**Yüzey oluşturulmuş olmasına rağmen hiç kontur yok.**
Ya **Görüntüle** altında {{ui:Konturlar}} kapalı, ya da aralık o kadar küçük ki 2,000'den fazla kontur seviyesi olurdu. Daha büyük bir aralık seçin.

**Kırılma çizgileri ya da sınır hiçbir şeyi değiştirmiyor.**
Yüzey LandXML'den geldi ("Yüzey (LandXML'den)"). Olduğu gibi kullanılır. Noktalardan oluşturmak için {{ui:Yüzeyi noktalardan yeniden oluştur}} düğmesini tıklayın.

**"Henüz yüzey yok: önce ölçüm noktalarını açın."**
Kırılma çizgisi, sınır ve platform, mevcut bir zemin yüzeyi gerektirir. Önce noktaları içe aktarın.

**"Kotlu bir ölçüm noktasını tıklayın: kırılma çizgisi noktaların kotlarını alır."**
{{ui:Kırılma çizgisi}} aracı yalnızca ölçüm noktalarını seçer. Yakınlaştırın ve bir noktaya tıklayın (alacağı noktayı turuncu bir kare gösterir).

## Çizim

**Bitirmek için çift tıkladığımda son noktam kayboldu.**
Bu sürümde çift tıklama eksen, platform, kırılma çizgisi ya da sınırı bitirir ama çift tıkladığınız noktayı atar. Son noktaya bir kez tıklayın ve {{key:Enter}} tuşuna basın. Zaten olduysa {{key:Mod+Z}} ile geri alın, sonra yeniden çizin.

**Tablette bir çizimi bitiremiyorum.**
Bitirmek için {{key:Enter}} gerekir; henüz ekranda bir düğme yok. Bir klavye bağlayın. Bkz. [Fare, izleme paneli ve dokunma](topic:keyboard#mouse-trackpad-and-touch).

**Nokta yerleştirmek için sürüklemek bunun yerine plani kaydırıyor.**
Birkaç pikselden fazla bir sürükleme her araçta planı kaydırır. Hareket ettirmeden tıklayın.

**"Bir eksen en az iki nokta gerektirir." / "Bir platform en az üç köşe gerektirir." / "Bir boru hattı en az iki yapı gerektirir."**
{{key:Enter}} tuşuna çok erken bastınız. Çizim atılır; baştan başlayın.

**A ya da G gibi tuşlar bir şey yapmıyor.**
Panelde bir metin kutusu ya da liste hâlâ odakta, harfler oraya gidiyor. Planı bir kez tıklayın, sonra tuşa basın. Mac'te tarayıcı için silme tuşu Backspace'tir: bir seçimi silmek için Fn ve delete tuşlarını kullanın.

## Eksenler ve boy kesitleri

**"PI 2 ve PI 3'teki eğriler çakışıyor: … Daha küçük yarıçaplar kullanın."**
İki eğri, PI'ları arasında olandan daha fazla teğet gerektirir. PI tablosunda bir ya da iki yarıçapı düşürün ya da PI'ları birbirinden uzaklaştırın.

**"PI 3 geri döner; eğri alamaz."**
Eksen o PI'da kendi üzerine geri dönüyor. PI'ı taşıyın ya da kaldırın.

**"Bu eksenin başlaması için altında zemin yok."**
Eksen yüzeyin dışında. Onu yüzeyin üzerine taşıyın ya da {{ui:PVI ekle}} açıkken tıklayarak PVI ekleyin.

**"PVI 3'teki düşey eğri (L = …) eğriden ya da ondan önceki PVI'dan önce başlıyor." / "… bir sonraki PVI'ı geçiyor."**
Eğri uzunluğunu kısaltın ya da PVI'ları birbirinden uzaklaştırın.

**"Bu konumda zaten bir PVI var: …"**
Bu istasyonda bir PVI zaten var. Başka bir yere tıklayın ya da mevcut olanı sürükleyin.

**Boy kesiti görünümü boş: "Boy kesitini görmek için bir eksen çizin."**
Eksen yok ya da seçili eksende hatalar var.

## Koridorlar ve platformlar

**"Koridor, hatasız bir tasarım boy kesitine ihtiyaç duyuyor."**
Bir tasarım boy kesiti başlatın ({{ui:Zeminden başlat}}) ve eğri çakışmalarını düzeltin.

**"… yan şevler zemine ulaşmadan yüzeyden çıkıyor." / "… şev çizgileri yüzeyden çıkıp ona ulaşmadan …"**
Tesviye, zemine değmeden yüzeyin kenarına ulaşıyor. Tasarımı kenardan içeri alın ya da zemine yaklaştırın. Yüzeyin kısmen dışında çizilen yeni bir platform 0 kotunda başlayabilir: gerçek bir kot yazın.

**"Koridorun yarma-dolgu sınırları … kesişiyor." / "Yarma-dolgu sınırı kendini kesiyor …"**
Farklı taraflardan gelen şevler birbirine giriyor: sıkı eğriler, dar platformlar, derin kazılar ya da yüksek dolgular. Daha büyük bir yarıçap, daha dar bir kesit, daha geniş bir platform ya da daha dik şevler kullanın.

**"Henüz hacim yok: bir platformun sorunsuz tesviye edilmesi gerekir."**
Üstündeki kırmızı kutuda listelenen sorunları düzeltin.

**{{ui:Önerilen (tesviye edilmiş)}} gri görünüyor.**
Henüz hiçbir platform ya da koridor tesviye edilmemiş.

## Borular

**"P2'nin henüz bağlantı kotu yok."**
{{ui:Bağlantı kotlarını kurallara göre ayarla}} düğmesini tıklayın ya da bağlantı kotlarını yazın.

**"P1: S1'de başlanacak zemin yok."**
Yukarı akış yapısı yüzeyin dışında ve ağız kotu yok. Onun için bir ağız kotu yazın.

**Bir yapıyı taşıdıktan sonra her boru işaretlendi.**
Bir yapıyı taşımak bağlantı kotlarını değiştirmez. {{ui:Tüm bağlantı kotlarını kurallara göre ayarla}} düğmesini tıklayın.

Tüm ağ iletileri [Yerçekimli boru ağı oluşturma](topic:pipe-network#read-and-fix-problems) bölümünde açıklanmıştır.

## Kaydetme ve dışa aktarma

**"Henüz dışa aktarılacak bir şey yok." / "Henüz çizdirilecek bir şey yok."**
Proje boş. Önce nokta içe aktarın.

**Kaydedilmiş dosyayı bulamıyorum.**
Tarayıcının indirmelerindedir (genellikle İndirilenler klasöründe). Bkz. [Açabileceğiniz, kaydedebileceğiniz ve dışa aktarabileceğiniz dosyalar](topic:files#where-the-files-go).

**PDF'in ölçeği kağıtta yanlış.**
%100 ya da gerçek boyutta yazdırın, "sayfaya sığdır" seçmeyin.

**PDF metninde soru işaretleri var.**
Adlar ya da açıklamalar Batı Avrupa karakter kümesinin dışındaki karakterler içeriyor. Durum iletisi bunları sayar. Düz karakterlerle yeniden adlandırın.

**Çizim kenarlardan kesilmiş.**
Ölçek sayfa için çok büyük. "(sığar)" işaretli ölçeği, daha büyük bir sayfayı ya da {{ui:Ekranda olan}} seçeneğini seçin.

**{{key:Mod+P}} tarayıcının yazdırma iletişim kutusunu açtı.**
Sayfa odakta değildi. İletişim kutusunu kapatın, planı tıklayın ve {{key:Mod+P}} tuşuna yeniden basın ya da {{ui:PDF}} düğmesini tıklayın.

## Uygulamanın kendisi

**Ekran boş ya da araç çubuğu hiçbir şey yapmıyor.**
Chrome, Edge, Firefox ya da Safari'nin güncel bir sürümünü kullanın ve yenileyin. Bkz. [Tarayıcılar](common:browsers).

**Büyük bir nokta dosyasıyla uygulama yavaş.**
{{ui:Üçgenler}}, {{ui:Nokta etiketleri}} ve {{ui:Kot bantları}} seçeneklerini kapatın ve daha büyük bir kontur aralığı kullanın. Çok büyük yüzeyler her değişiklikten sonra yeniden oluşturulurken bir süre bekler.

**Tarayıcı "Siteden ayrılmak istiyor musunuz?" diye soruyor.**
Projede kaydedilmemiş değişiklikler var. Kalın, {{key:Mod+S}} ile kaydedin, sonra ayrılın.
