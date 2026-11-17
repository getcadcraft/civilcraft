---
title: Bitki kayıtları, çeşitler ve sağlanan boyutlar
summary: Projenizin kendi bitki listesi bir tablo olarak: çeşitler, sağlanan boyutlar (kap, kök topağı, gövde çevresi, temiz gövde), yoğunluk, şartname notları, CSV girişi ve çıkışı; yerleştirilen her bitki bir boyut belirtir; ölçeğe göre bitki sembolleri, kendi sembolleriniz ve 3B modelleriniz.
keywords: bitki tablosu, bitki veritabanı, çeşit, varyete, sağlanan boyut, kap, kök topağı, çıplak kök, gövde çevresi, temiz gövde, yoğunluk, metrekare başına bitki, şartname, şartname notları, bitki sembolü, blok, kendi sembolünüz, 3B bitki, ayrıntı düzeyi, ölçek
from: 12251beb
---

{{ui:Bitki tablosu}} öğesini Peyzaj grubunun {{ui:Daha fazla}} menüsünden ya da Bitkiler bölümünden açın. Her satır, bu projenin kendi listesindeki bir bitki kaydıdır (bitki listesinden bir kayıt eklediğinizde kopyalanır). Her düzenleme, içe aktarılmış bir dosya gibi denetlenir ve tek bir geri al adımıdır.

## Sütunlar

- **Botanik adı**, **Yaygın ad**, **Tür**, **Yükseklik** ve **Olgunlukta yayılım** (metre).
- **Aralık** (merkezden merkeze) ya da **Yoğunluk** (m² başına bitki). Yoğunluğu olan ama aralığı olmayan bir kaydın yatağı, kendi deseni (üçgen ya da kare) için bu yoğunlukta doldurulur.
- **Sağlanan boyutlar**: boyut başına bir giriş, `;` ile ayrılmış. Her giriş bir kimlik, bir tür (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) ve ardından şunlardan herhangi biri içerir: hacim `10L`, yükseklik `h0.6`, yayılım `s0.4`, gövde çevresi `g14-16` (cm), temiz gövde `st1.8`. Örnek: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Çeşitler**: `;` ile ayrılmış adlar. İçe aktarılan dosyanızda varsa bir çeşit kendi boyutlarını ve notlarını korur.
- **Şartname notları**.

{{ui:Çoğalt}} bir satırı yeni bir anahtarla kopyalar; {{ui:CSV olarak kaydet}} ve {{ui:Bitki dosyası olarak kaydet}} listeyi dışarı yazar (çeşitlere ait CSV satırları, `cultivar_of` ile birlikte türlerinin altında yer alır). Bir CSV ya da bitki dosyası içe aktarmak onu mevcut listeyle birleştirir.

## Kendi Kütüphane bitki listeniz

Kendi CadCraft hesabınıza oturum açın (Ayarlar, Eklentileriniz, Oturum aç) ve bitki tablosu, Kütüphanede tuttuğunuz listeyi kullanabilir:

- {{ui:Kütüphane listemden}} kendi bitki öğelerinizi getirir (henüz incelemede bekleyenler dahil). Burada zaten sahip olduğunuz bir bitki Kütüphaneden güncellenir; buraya eklediğiniz çeşitler, sağlanan boyutlar, yoğunluk ve şartname korunur.
- {{ui:Bitki listesi olarak kaydet}} her satırı kendi Kütüphane bitki öğeniz olarak kaydeder, tür başına bir öğe: yeni bir bitki yeni bir öğedir, değiştirilmiş bir bitki yeni bir sürümdür, değişmemiş bir bitkiye dokunulmaz. Önce kutuyu işaretleyin: kaydetmek bitkileri CC0 altında herkese açık hâle getirir. Henüz güvenilir olmayan bir kişinin ilk herkese açık yüklemesi, her yükleme gibi, görünmeden önce bir kişi tarafından denetlenir.

Kütüphane temel bitki kaydını tutar. Çeşitler, sağlanan boyutlar, yoğunluk ve şartname notları projede ve bitki dosyasında ({{ui:Bitki dosyası olarak kaydet}}) kalır; iletişim kutusu her kaydettiğinizde kaç satırın etkilendiğini belirtir.

## Yerleştirilen bir bitki bir boyut belirtir

Bir bitki, bir çit ya da bir yatağın ya da dikili alanın karışım satırını seçin: kaydın çeşitleri ya da sağlanan boyutları varsa {{ui:Çeşit ve boyut}} birini seçer. Bitki listesi bu durumda türe, çeşide ve boyuta göre sayar; bir etiket bunları gösterebilir: `{botanical} '{cultivar}' {size}` ya da `{full}`.

## Ölçeğe göre bitki sembolleri

{{ui:Bitki grafikleri}} (Peyzaj › Daha fazla) bitkilerin planda nasıl çizileceğini belirler: **otomatik** (1:500'den kaba ise yayılımda bir daire, 1:200 ile 1:500 arasında merkezli bir ana hat, daha ince ise ayrıntılı sembol; iki ölçek de değiştirilebilir) ya da her ölçek için tek bir düzey. Sayfalar iletişim kutusunun bu küme için kendi **Planda bitki ayrıntısı** ayarı vardır.

Bitkiler bölümünde bir kayıt üzerinde {{ui:Kendi sembolü…}} bir SVG ya da bir DXF/DWG çiziminin bloğunu okur ve bunu ayrıntılı düzeyde bitkinin yayılımında çizer. {{ui:Kendi 3B modeli…}} bir OBJ, STL veya GLB okur; 3B'de görmek için Bitki grafiklerinde **Her kaydın kendi modeli** seçeneğini seçin. Dosyalar sınırlıdır (512 KB SVG, 2000 şekil, 50 000 üçgen) ve proje içinde saklanır. SVG dönüşümleri uygulanmaz (dosyada varsa size bildirilir). Düzeyler, sınırlar ve bir GLB'nin neler içerebileceği için bkz. [Bitki grafikleri, kendi sembolleriniz ve 3B bitkiler](topic:plant-graphics).
