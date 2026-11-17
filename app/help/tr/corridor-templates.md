---
title: Koridor şablonları ve arazi şablonları
summary: Küçük, yeniden kullanılabilir şablonlar yapın (bordür ve kanal, yaya kaldırımı, duvar, hendek), bunlardan istasyona göre bir koridor oluşturun; sol ve sağ ayrı tutulsun, bir eksen birkaç koridora bölünsün ve katmanlı malzemeler bir arazinin üzerine serilsin.
keywords: şablon, şablonlar, şablon kütüphanesi, şablon oluşturma, tipik kesit, düzenek, alt düzenek, bileşenler, nokta kodları, bitiş koşulu, yarma-dolgu sınırı, hendek, istinat duvarı, bordür, kanal, yaya kaldırımı, bölgeler, istasyon aralığı, birden fazla koridor, sol ve sağ, arazi şablonu, bitkisel toprak, kaplama, temel, üzerine serme, malzemeler, metrajlar
from: ce70e58b
---

Bir **şablon**, bir kez çizip yeniden kullandığınız küçük bir enine kesittir: ofsetli, eğimli ve nokta kodlu noktalar ile malzemeli bileşenler. Bir koridor, istasyona göre şablonlardan oluşturulabilir; her yanın kendi kaplama şablonları ve kendi bitiş koşulu vardır ve aynı şablonlar bir arazinin üzerine de serilebilir.

:::warning
Örnek şablonlar başlangıç içindir. Değerleri hiçbir standarttan veya kurumdan alınmamıştır. Bir mühendis, bir tasarımda kullanılmadan önce her şablonu ve ona verdiğiniz her değeri kontrol etmelidir.
:::

## Şablonları açın

{{ui:Yüzey}} › {{ui:Daha fazla}} › {{ui:Koridor şablonları…}} seçeneğini açın (ya da {{cmd:TEMPLATES}} yazın). Pencerede üç liste vardır:

- **Bu projede**: bu projenin koridorlarının ve arazi şablonlarının kullandığı şablonlar. Proje dosyasında kaydedilirler.
- **Kütüphanem**: bu tarayıcıda tutulan ve her projede sunulan şablonlar. Bir proje şablonunu saklamak için {{ui:Kütüphanem'e kaydet}} seçeneğini kullanın.
- **Örnekler**: tabakalı iki şerit, bordür ve kanal, yaya kaldırımı, yarma-dolgu sınırı, hendek, istinat duvarı, arazi altında bitkisel toprak ve arazi üzerinde kaplama. Her biri "Bir mühendis tarafından kontrol edilmek üzere" olarak işaretlidir.

{{ui:Bu projede kullan}} bir kütüphane veya örnek şablonu projeye kopyalar. {{ui:Bu projenin şablonlarını dışa aktar}} onları bir `.cctemplates.json` dosyası olarak kaydeder ve {{ui:Dosya içe aktar}} bir dosyayı projeye ve Kütüphanem'e okur. Şablonları paylaşmak veya başka bir bilgisayara taşımak için dosyayı kullanın.

## Bir şablon yapın

{{ui:Yeni şablon}} (ya da bir proje şablonunda {{ui:Düzenle}}) şablon düzenleyicisini açar. Sağ tarafı çizin: şablonun 0,0 noktasından dışarı doğru. Sol taraf aynı şablonu sola doğru dışarı kullanır.

1. Ona bir ad ve tür verin: **Kaplama** (bir sonraki şablon ucuna eklenir), **Bitiş koşulu** (zemine ulaşır) veya **Arazi şablonu**.
2. **Değerler** ekleyin: genişlik `w` veya şev `s` gibi adlandırılmış sayılar. Şablondaki herhangi bir sayı kutusu bir sayı veya bir değerin adını alır; `-t`, `t` değerinin negatifidir. Bir koridor, şablonun her kullanımına kendi değerlerini verebilir; bu yüzden tek bir bordür şablonu her bordür yüksekliğine hizmet eder.
3. **Noktaları** sırayla ekleyin. Her biri, daha önceki bir noktadan (ya da 0,0 noktasından) kendi kısıtına göre yerleştirilir:

| Kısıt | Noktayı yerleştirir |
|---|---|
| Eğimde ofset | Dışarı doğru bir ofset ve bir eğim (birim yatay başına düşü; −0.02, 2% düşüştür) |
| Ofset ve yükselme | Bir ofset ve bir yükselme |
| Doğrudan yukarı veya aşağı | Yalnızca bir yükselme |
| Zemine yan şev | Noktasından zemine doğru dışarı; zemin üstteyse yarma oranında, altındaysa dolgu oranında |
| Zemine | Bir ofset, sonra doğrudan yukarı veya aşağı zemine kadar |
| İstinat duvarı | Verdiğiniz kalınlıkta bir duvar: yarmada üst kısmı yol yüzüyle zemine değer, dolguda yol üzerinden geçer ve dış yüzü zemine iner |

   Bitmiş yüzeyin geçtiği noktalar için **Üst** kutusunu işaretleyin. Son üst nokta, o taraftaki bir sonraki şablonun başladığı yerdir. Bir **Hedef**, bir koridorun noktayı taşımasını sağlar: ofseti veya kotu bir çizgiden gelir.
4. **Bileşenler** ekleyin: nokta kodlarından (`0` 0,0 noktasıdır) geçen kapalı şekiller; her biri bir ad, bir malzeme ve bir tür alır. Alanları hacimleri verir.

Şablon çizimi her değişikliği gerçek ölçekte izler ve altındaki liste neyin yanlış olduğunu söyler (bitişten önce zemine değen bir nokta, şablonda olmayan bir değer, alanı olmayan bir bileşen). {{ui:Bu projeye ekle}} veya {{ui:Kaydet}} onu tek bir geri alma adımı olarak tutar.

## Şablonlardan bir koridor oluşturun

Koridorlu bir eksen seçin ve Özellikleri içinde {{ui:Koridoru istasyona göre şablonlardan oluştur}} seçeneğini açın. Koridor, iki tarafta iki şerit ve yarma-dolgu sınırı örnekleriyle başlar.

- **Bölgeler.** Her bölge bir istasyonda başlar ve bir sonraki bölgenin başlangıcına kadar uzanır. {{ui:Bölge ekle}} bir tane ekler; başlangıç istasyonunu kutusundan değiştirin.
- **Sol ve sağ ayrı.** Her bölgenin her tarafının kendi **Kaplama** listesi vardır (eksen çizgisinden dışarı doğru) ve kendi **Bitiş koşulu**: yarma-dolgu sınırı, hendek, duvar veya zemine ulaşan herhangi bir şablon. Bitiş koşulu yoksa taraf, koridorun yarma ve dolgu şevlerinde yarma-dolgu sınırına ulaşır. {{ui:Soldakini sağa kopyala}} bir tarafı kopyalar.
- **Değerler ve hedefler.** Bir taraftaki her şablonun altında, değer başına bir kutu (boş = şablonun kendi değeri) ve hedef alan bir nokta için, onu taşıyan kırılma çizgisi veya başka bir koridorun çizgisi.
- **Başlangıç** ve **Bitiş** koridoru eksenin bir parçasıyla sınırlar.

Kesitler, her nokta kodu için plan çizgileri, önerilen yüzey, kazıklama ve toprak işleri bunu izler. Özellikler her bileşenin hacmini taraf ve bölge başına listeler (eksen boyunca ortalama uç alanlar). Koridor şablonlardan oluşturulurken süperelevasyon ve koridorun kenar hedefleri kullanılmaz.

## Aynı eksende birkaç koridor

**Bu eksendeki koridorlar** altında {{ui:Koridor ekle}} eksenin geri kalanına bir koridor ekler: ilk koridora ortada bir bitiş istasyonu verilir (ya da kendi bitişini korur) ve yenisi orada, ilk koridorun son bölge şablonlarıyla başlar. Her koridorun kendi adı, istasyon aralığı, şablonları ve toprak işleri vardır. Birini kapatmak için {{ui:Açık}} kutusunu kullanın. İki aralık çakıştığında, sonraki koridor önceki koridorun üzerinde tesviye yapar.

## Arazi şablonları

Bir arazi şablonu, bir şablonun katmanlarını 0,0 noktasından bir arazinin üzerine serer: 0,0 noktasının altındaki bir katman zemine girer (sıyrılacak bitkisel toprak), üstündeki bir katman zeminin üzerinde durur (bir otoparkta temel ve kaplama). Genişlikler ve şevler önemli değildir; yalnızca her bileşenin 0,0 noktasının üstündeki veya altındaki derinliği önemlidir.

{{ui:Yüzey}} › {{ui:Daha fazla}} › {{ui:Arazi şablonları…}} seçeneğini açın (ya da {{cmd:TERRAINTEMPLATES}} yazın); blok proje Özelliklerinde de bulunur. {{ui:Arazi şablonu ekle}} bitkisel toprak örneğiyle bir tane ekler. Her biri için seçin:

- **şablon** (değerleri bu uygulama için değiştirilebilir),
- **arazi**: mevcut zemin veya önerilen yüzey,
- onu kırpan **şekil**: tüm arazi, bir parsel, bir platform veya kapalı bir özellik çizgisi. Aynı arazi üzerinde farklı şekillere sahip birkaç arazi şablonu kullanılabilir.

Her katman kalınlığını, plan alanını ve hacmini listeler. Hacim, plan alanının kalınlıkla çarpımıdır; kalınlık doğrudan aşağı ölçülür. Alan bir ızgarada ölçülür ve yerleştirilen (eğimli) alan da verilir. Şekiller planda C-TOPO-TMPL katmanında çizilir. Arazi şablonları önerilen yüzeyi değiştirmez.

## Malzemeler ve metrajlar

Projenin Toprak işleri bloğu **Şablonlardan malzemeler** listeler: her koridor bileşeni ve arazi şablonu katmanı, hacmiyle birlikte. {{ui:TakeoffCraft'a gönder}} bunları kesme ve dolgudan sonra metraj dosyasına, her biri bir kalem olarak yazar; hacimler feet projelerinde kübik yarda, diğerlerinde metreküptür.

## Dosyalar

Şablonlar, bölgeler, ek koridorlar ve arazi şablonları proje dosyasında kaydedilir. Bunlardan hiçbirini kullanmayan bir proje tam olarak eskisi gibi kaydedilir; eski CivilCraft sürümleri bunları kullanan bir projeyi açar (şablonları yok sayar ve koridorun kendi düzeneğini oluşturur).
