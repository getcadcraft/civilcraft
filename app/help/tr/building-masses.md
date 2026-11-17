---
title: Arsada yapı kütlelerini çizin
summary: Bir parsel üzerine yapı kütlesi çizin, katlarını ve kat yüksekliğini verin, brüt kat alanını görün, eğimli zeminde nasıl oturacağını seçin, 3D'de yüksekliğini itip çekin ve BimCraft'a gönderin ya da IFC dosyası olarak kaydedin.
keywords: kütle, kütle oluşturma, yapı kütlesi, hacim, taban izi, katlar, kat yüksekliği, brüt kat alanı, GFA, eğim, podyum, kazı ve dolgu, itme çekme, 3D, arsa çalışması, erken tasarım, IFC, geliştir, BimCraft, A-MASS
from: e5a67c16
---

Yapı kütlesi bir taban izi, bir kat sayısı ve bir kat yüksekliğidir: erken soru, "burada ne kadar yapı sığar ve bu zemine ne yapar?" Kütleler planda adları, kat sayıları ve brüt kat alanlarıyla durur; PDF çıktıya ve DWG ile DXF dışa aktarımlarına `A-MASS` ve `A-MASS-TEXT` katmanlarında girer ve proje dosyasına kaydedilir.

## Kütle çizin

1. **Özellikler** altında, **Yapı kütleleri** başlığında **Kütle çiz** düğmesine tıklayın. (Araç çubuğunun **Yüzey** yanındaki **Diğer** menüsünde de vardır.)
2. Taban izinin köşelerine tıklayın. Bir parsel köşesinin ya da arazi noktasının yakınına tıklamak, o noktanın tam yerini alır.
3. Bitirmek için ilk köşeye yeniden tıklayın ya da {{key:Enter}} tuşuna basın. {{key:Backspace}} son köşeyi geri alır; {{key:Esc}} durdurur.

Yeni bir kütlenin üç katı ve 12 ft (3.6 m) kat yüksekliği vardır; ortasının düştüğü parsele ait olur.

## Kat, yükseklik ve alan

Bir kütleye tıklayarak **Ad**, **Kullanım**, **Kat**, **Kat yüksekliği** ve **Parsel** değerlerini değiştirin. **Yükseklik**, kat yüksekliğiyle kat sayısının çarpımıdır: bir yükseklik yazarsanız kat sayısı en yakın tam kata yuvarlanır (en az bir). **Taban izi** ve **Brüt kat alanı** (taban izi çarpı kat) sizin için hesaplanır.

## Eğimli zeminde

Kütlenin altındaki zemin yüzeyden okunur: mevcut zemin ya da **Önerilen zemin (tesviyeli)** seçtiğinizde tesviyeli zemin. **Eğimli zeminde** zemin katın nereye gideceğini söyler:

- **Basamaklı**: taban izinin altındaki ortalama zeminde. Alçak taraf ona kadar doldurulur, yüksek taraf kazılır; ikisi neredeyse dengelenir.
- **Podyum**: en yüksek zeminde. Katı bir taban alçak tarafı doldurur.
- **Kazı**: en alçak zeminde. Yüksek taraf tepeye doğru kazılır.

Özellikler, kütlenin altındaki zemin aralığını, **Zemin kat seviyesini** ve zemin ile o seviye arasındaki dolgu ve kazı hacmini gösterir. Yüzeyin dışında kalan taban izi noktaları hariç tutulur ve Özellikler bunların sayısını söyler.

## 3D görünümde

Kütleler 3D arsa görünümünde çizilir; her kat etrafında bir çizgi ve çatının üzerinde adları vardır. **Göster** altında **Yapı kütleleri** için bir onay kutusu vardır. Birini seçmek için tıklayın. Bir kütle seçiliyken:

- çatısını yukarı ya da aşağı sürükleyerek bir kat bir kat itin ya da çekin, ya da {{key:PageUp}} ve {{key:PageDown}} tuşlarına basın;
- taşımanın tamamı tek bir geri alma adımıdır.

**Sürüş** görünümünün sokak görünümü de kütleleri görür ve **Güneş** onların gölgelerini zemine düşürür.

## Gönderin

- **Kütleleri IFC olarak** her kütleyi bir IFC4 dosyası olarak kaydeder: bir arsa, katlarıyla bir yapı ve kütle; sayıları `CadCraft_SiteMass` özellik kümesinde olan bir yapı öğesi olarak. Projede bir koordinat sistemi ayarlıysa dosya haritaya yerleşir ve arsanın enlem ve boylamını taşır; yoksa nerede olduğu hakkında hiçbir şey söylemez.
- **BimCraft'ta geliştir** kütleleriyle BimCraft'ı yeni bir sekmede açar. Orada bir kütleyi seçmek sayılarını ve **Bu kütleyi geliştir** düğmesini gösterir; bu, taban izinden her katta duvarlar ve binanın altına bir döşeme kurar, tek bir geri alma adımında. Hiçbir şey yüklenmez: dosya bu tarayıcının iki sekmesi arasında geçer.

Ayrıca bkz. **İmar sınırları** ve **Güneş saatleri**.
