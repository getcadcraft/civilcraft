---
title: İçe aktarırken birimler: bir dosya birimlerini belirtir ya da önce sorulursunuz
summary: Projeye getirdiğiniz bir çizim ya da ağ birimlerini belirtiyorsa CivilCraft bunları dönüştürür ve bunu söyler. Belirtmiyorsa, okumadan önce sorar ve cevabınızı o dosya için hatırlar.
keywords: birimler, içe aktarma, DWG, DXF, STL, OBJ, ölçüm, feet, US survey feet, metre, milimetre, ölçek, yanlış boyut, çok büyük, çok küçük, sor, hatırlanan, INSUNITS, çizim birimleri
from: 60921963
---

## Ne yapacaksınız

Bir dosyayı projeye getirin ve doğru boyutta geldiğinden emin olun.

## Adımlar

1. Dosyayı her zamanki gibi açın: {{ui:Aç}}, dosyayı plana bırakın ya da CAD çizim komutunu kullanın.
2. Dosya birimlerini belirtiyorsa hiçbir şey sorulmaz: içe aktarma iletişim kutusu bunları **Çizimin söylediği gibi** olarak gösterir.
3. Belirtmiyorsa, içe aktarma iletişim kutusu açılmadan önce dosyanın **Birimleri** soran bir iletişim kutusu çıkar. Dosyadaki bir birimin ne olduğunu seçin ve {{ui:Bu birimleri kullan}} tıklayın.
4. {{ui:İptal}} (ya da {{key:Esc}}) dosyayı atlar. Dosyadan hiçbir şey projeye okunmaz.

## Hangi dosyalar birimlerini belirtir

- **DWG ve DXF**: çizimin ekleme birimleri (`$INSUNITS`). Bunları belirtmeyen dosyaya soru sorulur. İçe aktarma iletişim kutusundaki **Çizim birimleri** listesi cevabınızla başlar ve yine de değiştirilebilir.
- **STL ve OBJ** (arazi serbest biçimli şekiller): hiçbir zaman birim belirtmez. Size sorulur.
- **Nokta listeleri** (CSV, TXT) ve ilerleme ölçüm listeleri: ilk satırlarında birimini belirten bir liste dönüştürülür ve durum satırı bunu söyler. Hiçbir birim belirtmeyen bir liste, {{ui:İçe aktar}} tıkladığınızda, noktalar eklenmeden önce sorulur. Enlem ve boylam sütunları bunun yerine koordinat sisteminden geçer.
- **Nokta bulutları eklentisi**: birimi belirtmeyen bir dosyadan bulut oluşturduğunuzda sorar ve bulutun sayılarını taşıdığı birimde etiketler.
- **IFC ve LandXML**: kendi birimlerini belirtir; projenin birimlerine dönüştürülürler.
- **LAS, LAZ ve yükseklik rasterleri**: koordinat sistemlerine göre yerleştirilir; dosya belirtmiyorsa arazi iletişim kutusu yükseklik birimini sorar.

## İyi bilinmesi gerekenler

- Cevap bu bilgisayarda, bu dosya için, her CadCraft uygulamasında hatırlanır. Dosya bir dahaki sefere geldiğinde size sorulmaz.
- Yeniden sorulmasını istiyorsanız: komut paleti ({{key:Mod+K}}) › **İçe aktarılan dosyaların birimleri için yeniden sor**.
- Bir liste tarafından belirtilen birim ilk sekiz satırından okunur: `units: ft` gibi bir satır ya da hepsi parantez içinde aynı birimi taşıyan sütun başlıkları, örneğin `Elevation (m)`.
