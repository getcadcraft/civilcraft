---
title: Özellik çizgileri
summary: Köşe noktası köşe noktası eğimlendirdiğiniz 3B çizgiler çizin, bunların basamaklı ofsetlerini yapın ve tasarımda bunları zeminin kırılma çizgisi ya da eğimli platform olarak kullanın.
keywords: yay, eğri, yarıçap, 3B yay, helis, eğimli bordür, eğim kaplaması, kot kaplaması, eğim okları, özellik çizgisi, eğim, kot, basamaklı ofset, ofset, kırılma çizgisi, bordür, hendek, berm, eğimli platform, yarma-dolgu sınırı, tesviye, 3B çoklu çizgi
from: d55b25fb
---

Özellik çizgisi, her köşe noktasında bir kotu olan bir çizgidir: bir bordür, bir hendek akış çizgisi, bir berm'in üstü ya da eğimli bir platformun kenarı. Kotlarını sayıyla ya da eğimle belirlersiniz, yukarı ya da aşağı bir basamakla yana kopyalarsınız ve yüzeylerin onunla ne yapacağını seçersiniz.

## Bir tane çizin

1. **Yüzey** › {{ui:Daha fazla}} › {{ui:Özellik çizgisi}} seçin ya da {{key:L}} tuşuna basın.
2. Köşe noktalarına planda tıklayın. Bir ölçü noktasına tıklamak, noktanın yerini ve kotunu alır; başka her yerde köşe noktası, oradaki mevcut zeminin kotunu alır.
3. Açık bir çizgiyi bitirmek için {{key:Enter}} tuşuna basın ya da kapatmak için ilk köşe noktasına yeniden tıklayın.

Yeni çizgi seçilir ve mevcut zeminin bir kırılma çizgisi olarak başlar; zemin üzerinde yatar.

## Yaylar

Bir parça, uçları farklı kotlarda olan planda bir yay olabilir: bir bordür dönüşü, eğri bir hendek, dönen bir rampa. Eğimi yay boyunca eşit dağılır ve uzunluğu eğri boyunca ölçülür.

- **Çizerken:** yayları açmak için {{key:C}} tuşuna basın (dokunmatik ekranda, plan üzerindeki çubuktaki {{ui:Yay}}). Bir köşe noktasından sonra eğri üzerinde bir noktaya, sonra yayın bittiği yere tıklayın. Düz parçalar için yeniden {{key:C}} tuşuna basın. {{key:Backspace}}, önce eğri üzerindeki noktayı kaldırır.
- **Sonradan:** **Özellikler** içinde, köşe noktasının **Yay** kutusuna bir yarıçap ve dönüş yönünü yazın, örneğin `50 L` ya da `50 R` (çizgi boyunca yürürken sola ya da sağa) ve {{key:Enter}} tuşuna basın. Parçayı yeniden düz yapmak için kutuyu boşaltın. Parçanın yarısından küçük bir yarıçap reddedilir.

Seçili çizgi, her yayın yarıçapını eğiminin yanında gösterir. **Uzunluk**, plandaki yaylar boyunca ölçülür; **3B uzunluk** ayrıca yükselişi ve alçalışı da sayar. Basamaklı ofsetler yayları korur: bir dönüşün dış tarafındaki bir yay büyür, iç tarafındaki küçülür ve bir yay merkezinin ötesindeki bir ofset reddedilir.

Yüzeyler, 3B görünüm, DXF ve DWG, her yayı eğriye 0.01 içinde kalan kısa düz parçalar olarak kullanır. LandXML bunları yay olarak tutar (aşağıdaki **Diğer dosyalardaki yaylar** bölümüne bakın).

## Kotları ve eğimleri belirleme

**Özellikler**, köşe noktalarını çizgi boyunca uzaklıklarıyla, **Kot** ve **Sonrakine eğim** (yüzde olarak) ile listeler. İkisinden birini yazın ve {{key:Enter}} tuşuna basın:

- Bir kot yalnızca o köşe noktasını taşır.
- Bir eğim, parçasının uzak ucundaki kotu belirler; ondan sonraki köşe noktaları yerinde kalır, bu yüzden bir sonraki parçanın eğimi değişir.

**Özellikler** içinde ayrıca:

| Eylem | Ne yapar |
|---|---|
| **Tümünü şu kadar yükselt ya da alçalt** | Yazdığınız yüksekliği her köşe noktasına ekler. |
| {{ui:Zeminden kotlar}} | Her köşe noktasını yeniden mevcut zemine koyar (yüzeyin dışındaki köşe noktaları kendi kotlarını korur ve listelenir). |
| {{ui:Birinci'den sonuncuya tek eğim}} | İlk ve son kotları korur ve aradaki köşe noktalarını tek bir eşit eğime yerleştirir. |

Seçili çizgi, planda köşe noktalarındaki kotlarını ve parçalar boyunca eğimlerini gösterir. Taşımak için {{ui:Seç}} ile bir köşe noktasını sürükleyin; kotu aynı kalır.

## Basamaklı ofsetler

**Basamaklı ofset** altında bir **Mesafe** yazın (çizginin yönünün sağında pozitif, solunda negatif), sonra bir yükseklik (ne kadar yukarı ya da aşağı) ya da yüzde olarak bir eğim yazın ve {{ui:Ofset çizgisini oluştur}} düğmesine tıklayın. Kopya yeni bir özellik çizgisidir: örneğin bir bordürün arkası yana 0.5 ft ve 0.5 ft daha yüksek, ya da bir hendek kenarı 6 ft dışarıda, 2 % eğimle. Dar bir dönüşte kopyayı kendi üzerine katlayacak bir mesafe reddedilir.

## Ekranda eğimler ve kotlar

Her özellik çizgisinin her parça boyunca eğimini (aşağı yöne işaret eden küçük bir okla) ve köşe noktalarındaki kotunu görmek için {{key:E}} tuşuna basın ya da **Görüntüleme** altında **Özellik çizgilerinde eğimler ve kotlar** kutusunu işaretleyin. Bunlar yalnızca ekranda görünür: çizime bir şey eklenmez ve PDF, DXF ile DWG olduğu gibi kalır. Kısa parçalar ve sıkışık köşe noktaları, yakınlaştırana kadar etiketlenmez. Seçili çizgi her zaman kendi eğimlerini ve kotlarını gösterir.

## Boy kesiti görünümünde

Bir eksenle kesişen bir özellik çizgisi, o eksenin boy kesiti görünümünde, kesişme noktasındaki adı ve kotuyla birlikte görünür; yanından geçen çizgiler de gösterilebilir. Bkz. [Düşey boy kesiti tasarlama](topic:profile).

## Yüzeylerin onunla yaptıkları

**Kullanım** seçin:

| Kullanım | Ne olur |
|---|---|
| Mevcut zeminin kırılma çizgisi | Mevcut zemin, çizilmiş bir kırılma çizgisi gibi, çizgiden kendi kotlarında geçer. |
| Tasarıma tesviye | Bir **kapalı** çizgi eğimli bir platforma dönüşür: içindeki önerilen yüzey kenarına doğru tesviye edilir. Bir platformun yaptığı gibi, kenarından zemine kesme ve dolgu şevleri (yatay:düşey 1:1) çalıştırmak için **Zemine yarma-dolgu sınırı** seçeneğini açın; her şev orada kenarın kendi kotundan başlar. |
| Yalnızca çizilmiş | Planda kalır ve DXF, DWG ve PDF'e çıkar (C-GRAD-FEAT katmanı, 3B çoklu çizgiler), ancak yüzeyler onu yok sayar. |

Hacimler, kesitler ve 3B görünüm, platformlar gibi tasarıma tesviye edilmiş özellik çizgilerini içerir. Her değişiklik tek bir adımdır: {{key:Mod+Z}} onu geri alır.

## Çizgileri ekibinizle paylaşma

CadCraft Studio'da bulut dosyalarınızdan açılmış, bir ekip planındaki bir çizimde, projenin **Özellikler** bölümünde (hiçbir şey seçili değilken) {{ui:Ekip çizgileri…}} içeren bir **Ekip** bölümü bulunur: ekibinizin paylaştığı çizgiler, her biri kendi revizyonuyla, önce bir özellik çizgisi seçmeden. Paylaşmak için bir çizgi seçin, yeni bir revizyon gönderin, ekibinkini çekin ya da paylaşmayı durdurun. Bu ayar dışında bölüm neye ihtiyaç duyduğunu söyler.

## Diğer dosyalardaki yaylar

| Dosya | Yay içeren bir özellik çizgisine ne olur |
|---|---|
| CivilCraft projesi | Tam olarak korunur. |
| LandXML | Çizgiler ve yaylardan oluşan, kotlarıyla birlikte bir plan özelliği olarak yazılır ve yaylarıyla birlikte geri okunur. Başka bir programdan gelen bir özellik çizgisi **Yalnızca çizilmiş** olarak gelir: bir yüzeye koymak için **Kullanım** seçeneğini belirleyin. |
| DWG ve DXF | Bir 3B çoklu çizgi yay tutamaz; bu yüzden çizgi, her yayın 0.01 içinde kısa parçalar olarak yazılır. CivilCraft ayrıca çizimde hangi parçaların yay olduğunu not eder: çizimi çizgi çalışması olarak açtığınızda, {{ui:Özellik çizgileri}} çizgileri yaylarıyla birlikte özellik çizgisi olarak geri getirir. Diğer programlar sıradan bir 3B çoklu çizgi görür. |
