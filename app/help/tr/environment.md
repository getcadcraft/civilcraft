---
title: Gölge, güneş enerjisi verimi ve açık hava konforu
summary: Binalarınızın kütlelerinin bir gün ya da bir mevsim boyunca attığı gölgeyi inceleyin, bunu canlandırmada görün, kütlelerdeki ve çatılardaki güneş panellerinin tipik bir yılda ne kadar elektrik üreteceğini hesaplayın, bir binanın yanındaki sokağın ne kadar konforlu olduğunu görün (UTCI) ve yaya rüzgar konforunun ön tarama okumasını alın.
keywords: gölge çalışması, gölge, güneşlenme saatleri, canlandırma, güneş, PV, fotovoltaik, paneller, verim, kWh, EPW, hava durumu dosyası, UTCI, termal konfor, açık hava konforu, sıcak stresi, rüzgar
from: 96e7af4d
---

**Çevre** bölümü, bir kütlenin **Özellikler** kısmında **Güneşlenme saatleri** altında yer alır. Binalar olarak çizdiğiniz kütleleri kullanır.

## Bir hava durumu dosyası yükleyin

Kentiniz için tipik bir yıl hava durumu dosyası (**.epw**) seçin. Bunlar EnergyPlus hava durumu sitesinden ve climate.onebuilding.org adresinden ücretsiz alınabilir. Dosya bu ziyaret boyunca tarayıcınızda kalır. Güneş enerjisi verimi ve konfor çalışması bunu gerektirir; gölge çalışması, proje bir koordinat sistemine sahipse onsuz da çalışır.

## Gölge çalışması

Bir tarih seçin (ya da **Mevsim** ve bir son tarih ile gün cinsinden bir adım işaretleyin) ve bir saat dilimi seçin, sonra **Gölge çalışmasını çalıştır** düğmesine tıklayın. Kütlelerin çevresindeki zeminde güneşli ya da gölgeli saatlerin bir haritasını; gün boyunca zeminin ne kadarının gölgede kaldığını gösteren bir tablo; ve oynatabileceğiniz ya da adım adım ilerleyebileceğiniz günün bir canlandırmasını alırsınız. **Haritayı kaydet**, **Canlandırma karelerini kaydet** (tüm kareler tek bir resimde) ve **Saatleri kaydet** (CSV) sonuçları saklar.

Zemin, en alçak kütlenin seviyesinde düz kabul edilir. Eğimli zeminde gölge için, araziyi okuyan **Güneşlenme saatleri** kullanın.

## Güneş enerjisi verimi

Panel verimini, her çatının ve duvarın ne kadarının kaplandığını ve sistem kayıplarını ayarlayın, sonra **Güneş enerjisi verimini çalıştır** düğmesine tıklayın. Her çatı ve duvar için, tipik bir yılda bir metrekare panelin üreteceği elektriği, komşu kütlelerin bunun ne kadarını aldığını ve her kütle için toplamı elde edersiniz. Model, düğmenin yanında sade sözlerle yazılır: tipik bir yıldan yapılan bir planlama tahminidir, bir garanti değildir.

## Açık hava konforu

**Konforu çalıştır**, açık zeminde ve ilk kütlenin yanında ayakta duran bir kişi için Evrensel Termal İklim İndeksini (UTCI) hesaplar (güney, kuzey, doğu ve batı yönleri), her kütlenin gölgesiyle birlikte. Ne kadar gökyüzünün görüldüğünü, ortalama gündüz UTCI değerini ve 32'nin üzerindeki (sıcak stresi) ve 0'ın altındaki (soğuk stresi) saatleri gösterir.

## Rüzgar (ön tarama)

**Rüzgar çalışmasını çalıştır**, hava durumu dosyanızda esen her rüzgar yönü için (4, 8, 12 ya da 16 yön) binalarınızın etrafındaki hava akışını bir kez çözer; bunu seçtiğiniz çevre üzerinde yapar (açık arazi, banliyö ya da şehir merkezi) ve sonra tüm yılın saatlik rüzgarını toplar. Harita, zemini konfor sınıfına göre renklendirir: yeşilden (**oturma**) **ayakta durma**, **dolaşma** ve **yürüme** üzerinden kırmızıya (**rahatsız edici**) kadar; sınır hızı (4, 6, 8 ve 10 m/s) saatlerin en fazla 5 %'inde aşılan etkinlik. İkinci bir tablo, rüzgarın 5 m/s'yi geçtiği saatlerin payından NEN 8100 derecesini (A'dan E'ye) verir. Hamle faktörü, saatlik ortalamayı çarparak etkili bir hamle verir.

Nasıl çalıştığı, sade sözlerle: binaların çevresindeki bir kutuda bir lattice-Boltzmann büyük girdap (large-eddy) akış çözücüsü (kendi yapımımız, `lib/wind` kütüphanesinde); seçilen pürüzlülük üzerinde yükseklikle artan bir rüzgar hızı profili; ve zeminin yaklaşık 1.5 m üzerindeki hızın, 10 m'deki akış yukarısındaki hızla karşılaştırılması. **Ön tarama** hızlı ve kabadır; **Standart** daha fazla hücre kullanır ve çok daha uzun sürer. Panel ızgaranın kaba olduğunu (en yüksek binanın üzerinde 10 hücreden az) ya da akışın hâlâ değiştiğini söylerse, haritaya daha az güvenin.

**Bunun olmadığı şeyler.** Çözücü, ders kitabı akışlarında (bir kanal, kapak sürüklemeli bir boşluk) denetlendi ve köşelerdeki iz ve hız artışının doğru göründüğünü görmek için bir küp üzerinde çalıştırıldı. Binalar üzerindeki rüzgar tüneli ölçümlerine karşı **doğrulanmamıştır**, bu yüzden her sonuç doğrulanmamış olarak etiketlenir. Bunu bir tasarım değeri, rüzgar yükü ya da planlama belgesi için kullanmayın: uygun bir çalışmayı bir rüzgar mühendisi yürütmeli ve onaylamalıdır. Düz zemin, pürüzsüz bina duvarları, hava istasyonu pürüzlülük kısayolu ve eşik tablosu basitleştirmelerdir; eşikler, yetkili kurumunuzun kullandığı ölçütlerde farklı olabilir.

## OpenFOAM ile rüzgar (eklenti)

Yukarıdaki yerleşik rüzgar motoru deneyseldir. Uygun bir akış çözücüsü için **Ayarlar > Eklentiler** altında **Yaya rüzgarı (OpenFOAM)** eklentisini açın (siz açana kadar kapalıdır). Bu, kendi GPL lisanslı yazılımıdır, CadCraft'ın geri kalanından ayrı tutulur ve OpenFOAM'ı içermez: onu kendiniz kurarsınız. Sonra rüzgar bloğundaki **Motor**, OpenFOAM'ı listeler.

Bir kez kuracaklarınız:

1. **OpenFOAM'ı kurun** (openfoam.com'dan ESI v-serisi; eklenti v2512 ile test edilmiştir). Ubuntu ya da Debian'da (Windows'ta WSL içinde de): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, sonra `sudo apt install openfoam2512-default`. `/usr/lib/openfoam/openfoam2512` altına kurulur. CadCraft'ın çalışması için `blockMesh`, `snappyHexMesh` ve `simpleFoam` gerekir. (Ubuntu'nun kendi arşivindeki eski `openfoam` 1912 paketi de çalışır, ancak fonksiyon nesneleri çöker; bu durumda eklenti sonuç dosyalarını kendisi okur.)
2. **Yardımcıyı başlatın**: eklentinin `runner` klasöründen Node.js ile: `node cc-openfoam-runner.mjs serve`. OpenFOAM arama yolunda değilse, OpenFOAM'ın `etc/bashrc` dosyasına giden yolu içeren küçük bir `runner.json` verin (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) ve `--config runner.json` ile başlatın. Yardımcı yalnızca bu bilgisayarı dinler ve bir belirteç (token) yazdırır.
3. **Belirteci yapıştırın** rüzgar bloğundaki eklenti alanlarına (adres `http://127.0.0.1:8765` olarak kalır) ve **Yardımcıyı denetle** düğmesine basın.

Bundan sonra **Rüzgar çalışmasını çalıştır**, hava durumu dosyasındaki her rüzgar yönü için bir durum çalıştırır: kütleleriniz, olağan kılavuzla boyutlandırılmış bir kutuda bir yüzeye (STL) dönüşür (binaların çevresinde ve üstünde 5 bina yüksekliği, arkada 10), blockMesh ve snappyHexMesh ile ağlanır, seçtiğiniz pürüzlülük üzerinden bir atmosfer sınır tabakası girişiyle kararlı k-epsilon RANS olarak çalıştırılır ve 1.5 m'deki hız geri okunup aynı Lawson ve NEN 8100 sınıflarına çevrilir. Hiçbir şey bilgisayarınızdan çıkmaz.

**Neler denetlendi.** Sonuçların üstündeki metin bunu açıkça söyler ve kaydedilen her CSV'nin parçasıdır. Eklentinin durum yazımı, sonuç okuma ve tüm boru hattı OpenFOAM olmadan denetlenmiştir; tek bir küp ise gerçek OpenFOAM ile üç ağ boyutunda çalıştırılmıştır (sayılar proje notlarındadır). Binalar üzerindeki rüzgar tüneli ölçümlerine karşı **doğrulanmamıştır**. Bu bir ön tarama okumasıdır, bir tasarım değeri ya da bir belge değildir. Standart k-epsilon, binaların önünde türbülansı fazla tahmin eder; zemin düzdür, duvarlar pürüzsüzdür ve arazi ya da bitki örtüsü yoktur.
