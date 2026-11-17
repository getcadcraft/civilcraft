---
title: Zemin ve yerel koordinatlar
summary: Zemin (yüzey) koordinatlarında çalışın; ızgaradan, yazdığınız veya bir noktada hesapladığınız birleşik ölçek faktörüyle ölçeklenmiş olarak; ya da sisteme iki kontrol noktasıyla bağlanan varsayımsal bir saha ızgarasında.
keywords: zemin koordinatları, yüzey koordinatları, ızgaradan zemine, birleşik ölçek faktörü, csf, birleşik faktör, ızgara faktörü, yükseklik faktörü, deniz seviyesi faktörü, yakınsama, eşleme açısı, ölçek faktörü, varsayımsal koordinatlar, yerel koordinatlar, saha ızgarası, 5000 5000, kontrol noktaları, yerelleştirme, kalibrasyon, iki nokta, kapanma hatası
from: 3d7453de
---

Eyalet düzlem ve UTM koordinatları **ızgara** koordinatlarıdır: bir harita projeksiyonu mesafeleri biraz gerer veya daraltır (milyonda birkaç on parça, ppm mertebesinde) ve arazi yükseldikçe ölçülen zemin mesafesi ızgara mesafesinden daha çok farklılaşır. Bu nedenle birçok ölçü, plandaki mesafelerin zeminde ölçülen mesafelere eşit olması için ölçeklenmiş **zemin** koordinatlarını ya da bir **varsayımsal** saha ızgarasını (bir kontrol noktasında 5000, 5000) teslim eder. CivilCraft sayılarınızı olduğu gibi tutar ve bunların ızgarayla nasıl ilişkili olduğunu kaydeder; böylece enlem ve boylam, GIS dosyaları ve harita katmanları yine doğru yere oturur.

**CBS** grubunda {{ui:Coordinates}} seçeneğini açın, sistemi seçin (veya koruyun), sonra **ızgara, zemin veya yerel koordinatlar** altından seçim yapın:

| Seçim | Koordinatlarınız | ızgarayla ilişkisi |
|---|---|---|
| {{ui:Grid}} | Sistemin kendisi (başlangıç) | Aynı sayılar |
| {{ui:Ground}} | Zemin mesafelerine ölçeklenmiş | ızgara = taban + birleşik faktör × (zemin − taban) |
| {{ui:Local}} | Varsayımsal bir saha ızgarası | İki kontrol noktasıyla taşınmış, döndürülmüş ve ızgaraya ölçeklenmiş |

Ne seçerseniz seçin projeyle birlikte kaydedilir ve tek bir geri alma adımıdır; hiçbir şey hareket etmez.

## Zemin koordinatları

1. {{ui:Ground}} seçeneğini seçin.
2. Ölçüden **Birleşik ölçek faktörünü** yazın (örneğin `0.99987`), ya da hesaplatın:
   1. **Bir noktada faktörü hesapla** altında nokta projenin ortasında başlar. {{ui:Pick a point on the plan}} seçeneğini seçin ve yere tıklayın (bir ölçü noktasının yakınına tıklamak o noktayı alır), ya da E ve N yazın.
   2. Yükseklik oradaki yüzeyden gelir; gerekirse başka bir yükseklik yazın.
   3. {{ui:Compute}} seçeneğini seçin. CivilCraft şunları gösterir:
      - **ızgara ölçek faktörü k**: orada harita projeksiyonunun mesafeleri ne kadar gerdiği.
      - **Yükseklik faktörü**: elipsoidde, o yükseklikteki mesafelere göre mesafelerin ne kadar kısa olduğu.
      - **Birleşik faktör** = k × yükseklik faktörü: ızgara mesafesi = zemin mesafesi × bu.
      - **Yakınsama**: orada ızgara kuzeyi ile gerçek kuzey arasındaki açı (jeodezik azimut = ızgara azimutu + yakınsama).
   4. Sayıların altındaki {{ui:Use}} düğmesini seçerek birleşik faktörü kutuya koyun.
3. **Taban noktasını** ayarlayın; zemin ve ızgara koordinatlarının aynı olduğu yer. 0, 0 ile başlar: zemin koordinatlarını yayımlayan çoğu yargı alanı orijin etrafında ölçeklendirir; böylece zemin koordinatları ızgara olanlara tanınabilir biçimde yakın kalır. Bazı ölçüler projenin kontrol noktası etrafında ölçeklendirir: ölçünün söylediğini kullanın.
4. {{ui:Apply}} seçeneğini seçin.

:::warning
Yükseklik, elipsoid üzerindeki yükseklik olarak alınır. CivilCraft bir jeoit modeli içermez; dolayısıyla jeoidin elipsoidin 30 m (100 ft) altında veya üstünde olduğu yerlerde yükseklik faktörü yaklaşık 5 ppm hatalı olur. Ölçü birleşik faktörünü belirttiğinde, o değeri yazın.
:::

## Yerel (varsayımsal) koordinatlar

1. {{ui:Local}} seçeneğini seçin.
2. **Kontrol noktası 1** için ölçü noktasının numarasını yazın (veya {{ui:Pick}} seçip plan üzerinde ona tıklayın). Yerel koordinatları yanında görünür.
3. Üçüncü kutuya enlem ve boylamını (örneğin `30.2672, -97.7431`) ya da **ızgara** E ve N değerlerini yazın.
4. **Kontrol noktası 2** için aynısını yapın; mümkün olduğunca ilkinden uzakta.
5. CivilCraft bulunan **Ölçek** ve **Dönme** değerlerini gösterir ve hatırlatır: **İki nokta her zaman tam oturur — üçüncüsünü kontrol edin.**
6. Bir **Kontrol noktası** için aynı şekilde değer verin. CivilCraft, uyumun onu yazdığınız ızgara koordinatlarından ne kadar uzağa koyduğunu gösterir (kapanma hatası, proje birimlerinde ve milyonda parça olarak). Büyük bir kapanma hatası hatalı bir nokta, bir yazım hatası veya başka bir birimde koordinatlar anlamına gelir.
7. {{ui:Apply}} seçeneğini seçin.

1'den çok uzak bir ölçek (0.5 ile 2'nin dışı) reddedilir: noktaları ve birimlerini kontrol edin.

## Ne kontrol edildi

- Ölçek faktörü ve yakınsama, çoğu GIS programının kullandığı koordinat kütüphanesi PROJ ile (PROJ 9.5.1 ile pyproj 3.7.1) eşleşir: konformal projeksiyonlu 300'den fazla sistemde (eyalet düzlem, UTM, enine Mercator, Lambert konformal konik) milyarda bir parça hassasiyetle; ve tarayıcıda plan üzerinde seçilen bir noktada.
- Zemin ve yerel adımlar ileri geri milyarda bir parça hassasiyetle dönüşür; iki kontrol noktası, kendileriyle yapıldıkları ölçeği ve dönmeyi geri verir; 0.05 ft kayık bir kontrol noktası, 0.05 ft'lik bir kapanma hatası gösterir.
