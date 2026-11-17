---
title: DWG ya da DXF'i çizgi işi olarak açın
summary: Bir çizimin çizgi işini katman katman planda açın; kot eğrilerini, 3B çoklu çizgileri ve kapalı ana hatlarını yüzey için kullanın; nokta bloklarını ölçü noktalarına çevirin.
keywords: ölçü kontrolü, metin kotları, dwg, dxf, cad, çizim, çizgi işi, kot eğrileri, kırılma çizgileri, sınır, çoklu çizgi, 3B çoklu çizgi, katmanlar, temel harita, topo, arazi çizimi, bloklar, blok başvuruları, bloklardan ölçü noktaları, öznitelikler, nokta blokları, ekleme noktası
from: da0f4c58
---

Bir topografik ölçü çoğu zaman bir çizim olarak gelir: kot eğrileri, kendi kotlarında çoklu çizgiler olarak; kırılma çizgileri 3B çoklu çizgiler olarak; sahanın ana hattı kapalı bir çoklu çizgi olarak. CivilCraft çizimin **model uzayını** planda katmanlar olarak açar ve bu çizgileri doğrudan yüzeye dönüştürebilir.

## Çizimi açın

1. **Yüzey** grubundaki {{ui:Çizgi işi}} tıklayın ({{ui:Aç}} ya da çizim dosyasını plana bırakın) ve bir `.dwg` ya da `.dxf` dosyası seçin. Çizim bu bilgisayarda okunur; hiçbir şey yüklenmez. 2000'den 2018'e kadar olan DWG ve ASCII DXF okunur.
2. **Çizgi işi** iletişim kutusu, çizimin çizgi, kapalı şekil ya da nokta içeren katmanlarını ve bunların **kotları** olup olmadığını listeler. Çizimde kapalı olan katmanlar işaretsiz başlar. Metin, taralamalar, ölçülendirmeler ve çizgi işi olmayan diğer nesneler sayılır ve dışarıda bırakılır (iletişim kutusu hangileri olduğunu söyler).
3. **Çizim birimleri** değerini kontrol edin. Çizim birimlerini belirttiğinde, CivilCraft bunları projenin birimlerine dönüştürür (milimetreden metreye, metreden feet'e, inçten feet'e). Feet cinsinden bir çizim, ölçeklendirilmeden ABD ölçü feet'i olarak okunur: ikisi milyonda 2 parça farklıdır ve state plane koordinatlarının bu oranda ölçeklendirilmesi onları feet kadar kaydırırdı. Çizim birimlerini belirtmediğinde, sayıları projenin birimleriyle okunur; değilse listeden doğru birimleri seçin.
4. **Yüzey için kullan** bölümünde, her katmanın yüzeye ne vereceğini seçin (ya da yalnızca **Yalnızca göster** bırakın). Kot eğrisi gibi adlandırılmış (TOPO, CONT, CNTR) ve kotları olan katmanlar kırılma çizgisi olarak başlar.
5. {{ui:Ekle}} tıklayın. Katmanlar sol panelde **GIS katmanları** altında görünür; her kullanım yüzeye eklenir. Her parça kendi başına bir adımdır: {{key:Mod+Z}} onları birer birer geri alır.

## Her katman türü ne verebilir

| Katmanın içerdiği | Yüzey için kullanım |
|---|---|
| Kot eğrileri (bir kotta çoklu çizgiler) | Çizgilerin kendi kotunda ya da ELEV alanında kırılma çizgileri |
| 3B çoklu çizgiler | Kendi kotlarında kırılma çizgileri |
| Kapalı bir ana hat | Yüzey sınırı (en büyük kapalı şekil ya da sizin seçtiğiniz) |
| Kotlu noktalar | Ölçü noktaları, katman adıyla tanımlanır |
| 0 kotundaki çizgiler (plan çizgi işi) | Hiçbiri: plan üzerinde temel çizim olarak kalır |

CivilCraft'ın yazdığı bir çizim, özellik çizgilerini yaylarını hatırlayan 3B çoklu çizgiler olarak tutar. İletişim kutusu o zaman **Özellik çizgileri** seçeneğini gösterir: bunları yaylarıyla ve kullanımlarıyla özellik çizgileri olarak geri getirmek için işaretli bırakın (bir geri alma adımı), ya da diğer katmanlar gibi çizgi işi olarak okumak için işareti kaldırın.

Daha sonra, yalnızca gösterdiğiniz bir katmanı yüzey için de kullanmak üzere, **GIS katmanları** altındaki katmanın menüsünde {{ui:Yüzey için kullan}} öğesini kullanın.

## Bloklardan ölçü noktaları

Ölçü çizimleri noktalarını çoğu zaman blok olarak taşır: her atışta küçük bir sembol, nokta numarası, tanım ve kot için öznitelikler ile. Çizimde blok başvuruları varsa, iletişim kutusunda bir **Bloklardan ölçü noktaları** bölümü bulunur:

1. Alınacak blokları işaretleyin (tablo her birinin kaç başvuru içerdiğini, hangi katmanlarda ve hangi öznitelikleri olduğunu söyler) ya da üzerindeki her blok başvurusunu almak için katmanları işaretleyin.
2. Her noktanın **numarası**, **tanımı** ve **kotunun** nereden geleceğini seçin: bir öznitelikten, bloğun ya da katmanın adından, bir sonraki boş numaralardan ya da ekleme noktasının Z değerinden. CivilCraft olası öznitelikleri (PT, DESC, ELEV ve benzeri) öncelikli alır ve kotu bir öznitelikten yalnızca bloklar sıfırda durduğunda alır.
3. Yalnızca noktaları istiyorsanız çizgi işi katmanlarının işaretini kaldırın, sonra {{ui:Ekle}} tıklayın.

Her başvuru, ekleme noktasında bir ölçü noktası olur. Yalnızca model uzayına yerleştirilmiş başvurular sayılır; başka blokların içindeki bloklar sayılmaz. Projede zaten var olan ya da çizimde iki kez kullanılan numaralar, en yüksek numaradan sonra yeni numaralar alır; sayı olmayan bir kot özniteliği o noktayı kotsuz bırakır; durum çubuğu ikisini de sayar. Çizim asla değiştirilmez ve her nokta kendi bloğunu hatırlar: Özellikleri, bloğu, katmanı ve tutamacı ile **Bloktan** değerini gösterir. Noktaların eklenmesi tek bir adımdır; {{key:Mod+Z}} hepsini geri alır.

## Metin olarak yazılmış kotlar ve denetim

Metin olarak yazılmış kot noktaları (ya da bir ölçü noktası bloğu olmayan bir blok özniteliğindeki kotlar) çizgi işi değildir. **Ölçü kotları ve denetim** bölümü bunları ölçü noktası olarak alabilir ve çizimde yanlış görünen şeyleri listeler: birimler, koordinat sistemi, sıfır noktasına uzaklık, düz kot eğrileri, garip kotlar, çift noktalar. Bkz. [İçe aktarmada ölçü çizimini denetleyin](topic:survey-check).

## Çizim nasıl okunur

- Yaylar, daireler, elipsler, kabarık (bulge) çoklu çizgi parçaları ve splineler en fazla her 5°'de kısa düz parçalara dönüşür.
- Blok başvuruları yerleştirildikleri yerde çizilir, iç içe bloklar da; bir bloğun 0 katmanındaki şey, başvurunun katmanını alır.
- Başka bir düzlemde çizilmiş nesneler (farklı bir ekstrüzyon yönü) dünya koordinatlarına yerleştirilir.
- Her nesne üç alan alır: LAYER, TYPE (nesne türü) ve ELEV (tüm noktaları aynı kotu paylaştığında o kot).
- Koordinatlar olduğu gibi alınır: çizim projeyle aynı koordinatları kullanmalıdır (örneğin aynı state plane bölgesi). Bağlı çizimler (xref) açılmaz: bunları ayrı ayrı açın.

:::tip
Kot eğrisi çizimi, tepelerde ve çukurlarda birkaç nokta kotuyla birlikte en iyi yüzeyi verir; yalnız kot eğrileri düz üçgenler bırakır. Bu kotları ölçü noktası olarak ekleyin ya da çizimdeki bir nokta katmanından alın.
:::
