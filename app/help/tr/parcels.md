---
title: Parseller çizin ve yasal tanımlarını yazın
summary: Bir parseli köşeleriyle çizin ya da tapu veya parselasyon planındaki ölçüleri girin, ölçülerin ne kadar kapandığını kontrol edin, planda yön açılarını ve uzaklıkları etiketleyin, her doğruyu bir eğriye çevirin ve bir taslak yasal tanımı kopyalayın.
keywords: parseller, arsalar, mülk sınırları, sınır, tapu, parselasyon planı, ölçü ve sınır, yön açısı, uzaklık, kapanma, kapanma hatası, hassasiyet, yasal tanım, başlangıç noktası, eğri, yarıçap, alan, acres
from: 6793d6ce
---

Parseller planda, her düz doğru boyunca yön açısı ve uzaklıkla (bir eğri yarıçapını, uzunluğunu ve merkez açısını gösterir) ve ortada adları ile alanlarıyla yer alır. PDF çıktısına, DWG ve DXF dışa aktarımlarına `V-PROP` (doğrular) ve `V-PROP-TEXT` (etiketler) katmanlarında girerler. Hiçbir şey seçili değilken her şey sağ panelde **Parseller** altındadır.

## Parsel çizin

1. **Parsel çiz** düğmesine tıklayın.
2. Köşelere, başlangıç noktasından başlayarak tıklayın. Bir ölçüm noktasının yakınına tıklamak, o noktanın tam yerini alır.
3. Bitirmek için ilk köşeye yeniden tıklayın veya {{key:Enter}} tuşuna basın. {{key:Backspace}} son köşeyi geri alır; {{key:Esc}} şimdiye kadarki köşeleri bırakır; aracı kapatmak için tekrar basın.

## Tapudaki ölçüleri girin

1. **Tapu ölçülerini gir** düğmesine tıklayın.
2. Ölçülerin nerede başladığını belirtin: bir ölçüm noktasının numarasını ya da kuzey ve doğu koordinatlarını.
3. Ölçüleri her satıra bir tane olacak şekilde yazın ya da yapıştırın:
   - bir doğru: bir yön açısı ve bir uzaklık, örneğin `N 45°30'15" E 125.50`. `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` ve azimutlar (`AZ 45°30'15"`) da çalışır; "thence", virgüller ve "feet" yok sayılır.
   - bir eğri: `C R 300 L 52.36 right` (yarıçap ve yay uzunluğu) veya `C R 300 D 10°00'00" left` (yarıçap ve merkez açısı). Bir eğri, kendinden önceki doğruyu izler; izlemediğinde kiriş yön açısını da ekleyin: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` ile başlayan satır bir yorum satırıdır.
4. Yazdıkça iletişim kutusu ölçülerin toplam uzunluğunu, **kapanma hatasını** (başlangıçtan ne kadar uzakta ve hangi yönde bittiklerini), **hassasiyeti** (uzunluğun kapanma hatasına bölümü, 1 : 10,000 gibi) ve alanı gösterir. Okuyamadığı satırlar satır numaralarıyla listelenir.
5. **Parseli ekle**. Ölçüler kapanmadığında parsel, boşluğu düz bir doğruyla kapatır: ölçüleri tapu ile karşılaştırın. Bir arazi poligonunun hatasını doğrularına yaymak için önce onu düzeltin.

## Eğriler

Bir parselin **Özellikleri**'nde her doğrunun bir **Yarıçapı** vardır. Aynı iki köşeden geçen bir eğri yapmak için bir değer yazın (köşeler arasındaki mesafenin yarısından küçük bir yarıçap ulaşamaz, bu yüzden reddedilir) ve **Eğriler** bölümünde **Sağ** ya da **Sol** seçin: sağa dönen bir eğrinin merkezi, tapuda olduğu gibi, ilerleme yönünün sağındadır. Yarıçapı silerek yeniden düz hale getirin. Her değişiklik bir adımdır: {{key:Mod+Z}} onu geri alır.

## Yasal tanım

Bir parselin Özellikleri, çizimden yazılmış yasal tanımıyla biter:

- "Beginning at" metni, yazdığınız **Başlangıç noktası** (örneğin "4 numaralı parselin kuzeydoğu köşesi") ile başlar; yoksa ilk köşenin kuzey ve doğu koordinatı ya da ölçülerin başladığı ölçüm noktası kullanılır.
- "thence" her doğru: bir yön açısı ve bir uzaklık ya da yarıçapı, yay uzunluğu, merkez açısı, kiriş yön açısı ve uzaklığıyla birlikte bir eğri.
- "Containing" alanı kare fit ve akre cinsinden (metre projesinde metrekare ve hektar cinsinden).

**Kopyala** düğmesi metni panoya koyar; **Metin olarak indir** onu bir `.txt` dosyası olarak kaydeder.

:::warning
Yasal tanım, çizimden hazırlanmış bir taslaktır, bir ölçüm değildir. Herhangi biri ona güvenmeden önce lisanslı bir harita mühendisi kayıtlarla karşılaştırıp imzalamalıdır.
:::

Seçmek için planda bir parselin içine tıklayın; {{key:Delete}} onu kaldırır. Parseller proje dosyasına kaydedilir.
