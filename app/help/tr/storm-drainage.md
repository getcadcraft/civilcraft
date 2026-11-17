---
title: Yağmur suyu debilerini, boru boyutlarını ve hidrolik eğim çizgisini hesaplama
summary: Her yapıya akan havzaları çizin, rasyonel yöntemle ağ boyunca debileri toplayın, boruları Manning denklemiyle boyutlandırın ve hidrolik eğim çizgisinin nerede tam dolu olduğunu veya yüzeye ulaştığını görün.
keywords: yağmur suyu drenajı, havza, drenaj alanı, rasyonel yöntem, akış katsayısı, yoğunlaşma süresi, yağış şiddeti, idf, manning, boru boyutlandırma, hidrolik eğim çizgisi, hgl, enerji eğim çizgisi, egl, aşırı yük, taşkın, kuyruk suyu
from: e44872ec
---

**Yağmur suyu drenajı**, [boru ağı](topic:pipe-network) üzerinde çalışır: önce ağı çizin, ardından ona akan alanları. Hiçbir şey seçili değilken her şey sağ panelde **Yağmur suyu drenajı** altında görünür.

## Havza çizme

1. **Yağmur suyu drenajı** altındaki **Havza çiz** düğmesine tıklayın.
2. Bir yapıya akan alanın köşelerine tıklayın. {{key:Enter}} veya çift tıklama bitirir; {{key:Backspace}} son köşeyi geri alır, {{key:Esc}} durdurur.
3. Havza, içindeki bir yapıya, yoksa en yakın yapıya akar. Özellikleri açılır: adını, **Akış katsayısı C** (yağmurun akan payı, 0 ile 1 arası), **Yoğunlaşma süresi** (dakika cinsinden) ve hangi yapıya **Akış yapısı** olduğunu ayarlayın.

Özelliklerindeki **Başka havza çiz** bir sonrakini başlatır. Seçmek için planda bir havzanın içine tıklayın; {{key:Delete}} onu siler. Her değişiklik tek bir adımdır: {{key:Mod+Z}} geri alır.

## Tasarım yağmurunu ayarlama

Yağış şiddeti i = a ÷ (tc + b) üssü c'dir; fit birimli projede saatte inç, metre birimli projede saatte milimetre cinsindendir. **Şiddet a**, **b** ve **c** değerlerini, tasarladığınız tekerrür periyodu için kendi şiddet-süre-frekans eğrinize uydurun.

:::warning
Başlangıç şiddet eğrisi, Manning n (0.013) ve birleşim kaybı (0.5) yer tutucudur, standart değildir. Bunları kendi yağış verilerinize ve tasarım kriterlerinize göre ayarlayın.
:::

- **En kısa yoğunlaşma süresi**: hiçbir boru bundan kısa bir süreyle hesaplanmaz (başlangıçta 10 dakika).
- **Manning n**: boruların pürüzlülüğü.
- **Birleşim kaybı**: her yapıda kaybedilen yük, oradan çıkan borunun hız yüksekliği V²/2g'nin bir payı olarak.
- **Çıkıştaki su seviyesi**: son borunun boşaldığı yerdeki kuyruk suyu. Çıkış serbest akıyorsa boş bırakın.

## Debilerin nasıl toplandığı

Her boru, üstündeki tüm havzaları taşır. Q = C × i × A; burada C × A ağ boyunca toplanır ve i, gelen suyun en uzun yoğunlaşma süresindeki şiddetidir: havzanın kendi süresi veya yukarı akıştaki bir havzadan gelen süre artı borulardaki seyahat süresi (uzunluk ÷ tam dolu akış hızı). Q, saniyede küp fit cinsinden (A akre cinsinden) veya saniyede metreküp cinsindendir (A hektar cinsinden).

## Boruları boyutlandırma

**Debiler ve eğim çizgileri** altındaki tablo, her boru için debiyi, eğiminde tam dolu akarken taşıyabildiği debiyi, hızı, üst ve alt ucundaki hidrolik eğimi ve ne kadar derin aktığını gösterir.

**Boruları bu debilere göre boyutlandır**, her boruya, kendi eğiminde debisini taşıyan en küçük standart boyutu verir (12 ila 72 in veya 300 ila 1800 mm). Tek bir adımdır. Bağlantı kotları yerinde kalır: boyutlar değişirse, örtü derinliğini korumak için **Tüm bağlantı kotlarını kurallara göre ayarla** kullanın, ardından tabloyu yeniden denetleyin.

## Eğim çizgilerini okuma

Hidrolik eğim çizgisi (HGL), çıkıştan yukarı akışa doğru hesaplanır:

- Kısmen dolu akan bir borunun HGL'si su yüzeyindedir: bağlantı kotu artı normal derinlik.
- Aşağıdaki su boru tepesinden yüksekse veya tam dolu akarken taşıyabileceğinden fazlasını taşıyorsa, boru tam dolu akar (aşırı yüklü) ve HGL'si, uzunluğu boyunca sürtünme eğimi kadar yükselir.
- Her yapıda HGL, çıkan borunun üst HGL'si artı birleşim kaybıdır.
- Enerji eğim çizgisi (EGL), HGL artı hız yüksekliğidir.

Tam dolu akan bir boru listelenir; HGL'nin rögar ağzının üstünde olduğu her yapı da listelenir: orada su yüzeye ulaşır ve yapı planda kırmızıyla çevrelenir. Bir boru veya yapı seçerek özelliklerinde debisini, derinliğini, hızını ve her iki eğim çizgisini görün.

## Yağışı ilerletme

Rasyonel yöntem her boru için tek bir tepe değeri verir. {{ui:Yağışı ilerlet}} (sonuçların altında, ağın özelliklerinde) bunun yerine tüm yağmuru hesaplar: her havzanın zamana bağlı akışı, borularda seyahat süresi ve depolama ile ilerletilir ve buluştukları yerde eklenir.

1. {{ui:Yağmur süresi}} ve {{ui:Yağış şiddeti}} alanlarını boş bırakarak yukarıdaki en uzun yoğunlaşma süresini ve yağış eğrisini kullanın veya kendi değerlerinizi girin.
2. {{ui:Yağışı ilerlet}} düğmesine basın. Tablo her boru için girişteki ve çıkıştaki en yüksek debiyi, çıkan tepe değerinin ne kadar düştüğünü, borunun tam kapasitesinin ne kadarını kullandığını ve tepe değerine ulaştığı dakikayı listeler.
3. Her çıkış, küçük bir zamana bağlı debi grafiği ve {{ui:Hidrografı indir (CSV)}} alır.

Bir havza, yoğunlaşma süresi boyunca ortalamalanmış yağmuru gönderir; bu nedenle bundan kısa bir yağmur, C × i × A'dan daha düşük bir tepe değerine ulaşır. Her boru, rasyonel yöntemin zaten bulduğu akış derinliğini kullanarak Muskingum–Cunge yöntemiyle yönlendirilir. Farklı yoğunlaşma sürelerine sahip iki kol birlikte tepe yapmaz, bu nedenle toplamları, tepe değerlerinin toplamından düşüktür.

Bu, aşırı yükü, geri su etkisini, yapılardaki depolamayı veya taşkını modellemez. Yönlendirilmiş tepe değeri tam kapasitesinin üzerinde olan bir boru listelenir ve suyu sığıyormuş gibi iletilir. Zamanlamayı ve sönümlemeyi görmek için kullanın, boruyu boyutlandırmak için değil. Bu bir hesaplama yardımcısıdır: bir mühendis kontrol eder.

## Projeyle birlikte kaydedilir

Havzalar ve yağmur ayarları proje dosyasında kaydedilir. Henüz PDF çıktısında, DWG veya DXF'te ya da LandXML'de yer almazlar: bkz. [Henüz yapılmadı](topic:not-built-yet).
