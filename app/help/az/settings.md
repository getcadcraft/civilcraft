---
title: CivilCraft parametrləri
summary: Kopyalanmış və yapışdırılmış nöqtə sətirləri üçün sütun sırası və faylın sütunlarını təxmin etmək, yapışdırılmış nöqtələrin necə nömrələndiyi, nöqtə yazılarının nə göstərdiyi, künc göstəricisi, 3D şaquli şişirtmə, en və uzunluğun necə göründüyü və xəritə təbəqələrinin internetdən gəlib-gəlmədiyi.
keywords: parametrlər, üstünlüklər, pnezd, penzd, sütun sırası, nöqtə sətirləri, yenidən nömrələ, nöqtə nömrələri, başlanğıc nömrə, nöqtə yazıları, yazılar, təsvir, yüksəklik, baxış kubu, ox işarəsi, künc göstəricisi, kompas, şaquli şişirtmə, 3d, en, uzunluq, dms, onluq dərəcələr, xəritə təbəqələri, internet, məxfilik
from: 64b9cb92
---

{{ui:Settings}} açın: tətbiq panelindəki dişli ilə və ya {{key:Mod+,}}. İlk nişan, {{ui:CivilCraft}}, bu tətbiqə aid parametrləri saxlayır; {{ui:General}} bütün CadCraft tətbiqlərinin paylaşdığını saxlayır (mövzu, alətlər paneli, panellər). CivilCraft parametrləri yalnız tətbiqdədir: onları burada dəyişirsiniz və bu brauzer onları yadda saxlayır. CivilCraft parametrlərini sıfırla hər parametri başlanğıca qaytarır.

## Nöqtə sətirləri

**P, N, E, Z, D** (başlanğıc) və ya **P, E, N, Z, D**: nöqtə, şimal, şərq, yüksəklik, təsvir, ya da əvvəlcə şərq, sonra şimal. Üç yerdə istifadə olunur:

- **Kopyala**: CivilCraft cədvəl proqramı üçün sistem buferinə qoyduğu sətirlər.
- **Yapışdır**: başlıq sətiri olmayan cədvəl proqramından və ya mətn faylından yapışdırılmış sətirlər.
- **İdxal**: fayl başlıq sətiri olmadıqda **Nöqtələri idxal et** dialoqunda təxmin (dörd sütunlu fayl PENZ, üç sütunlu ENZ kimi oxunur). Bax: [Nöqtə faylı formatları](topic:point-file-formats).

Sütunlarını adlandıran başlıq sətiri həmişə üstünlük təşkil edir, idxal dialoqunun {{ui:Columns}} siyahısındakı seçim də belə.

## Yapışdırılmış nöqtələr üçün nömrələr

- **Sərbəst nömrələri saxla** (başlanğıc): yapışdırılmış nöqtə heç bir nöqtənin olmadığı nömrəni saxlayır; yalnız toqquşan nöqtələr yeni nömrə alır.
- **Həmişə yeni nömrələr**: hər yapışdırılmış nöqtə, öz nömrəsi boş olsa belə, yeni nömrə alır.

**Yeni nömrələr bundan başlayır**: boş buraxsanız, istifadədə olan ən böyük nömrədən bir artıq sayılır. Bir nömrə yazın, məsələn 5000, yeni nöqtələr 5000-dən etibarən nömrə alır; artıq istifadədə olan nömrələr atlanır. Heç bir halda iki nöqtə eyni nömrəni paylaşmır. Bax: [Planalma nöqtələrini seçin, kopyalayın və yapışdırın](topic:copy-paste-points#point-numbers-never-clash).

## Nöqtə yazıları

Nöqtə yazısı, **Görüntü** altında {{ui:Point labels}} açıq olduqda nəyi göstərir: **Nömrə**, **Nömrə və yüksəklik** və ya **Nömrə, yüksəklik və təsvir** (başlanğıc). DXF, DWG və PDF ixracları ekranla eyni yazıları göstərir.

## Künc göstəricisi

Planın və 3D görünüşün küncündə nə olur: **Baxış kubu** (başlanğıc), **Ox işarəsi** və ya **Yoxdur**.

- **Baxış kubu** (yuxarı sağ). Planda o, kompas halqası ilə yuxarını göstərir: N şəbəkə şimalıdır (planın yuxarısı). Kubun hər hansı digər tərəfinə, kənarına və ya küncünə klikləyin, ya da sürükləyin, və [3D görünüş](topic:site-3d) oradan baxmaq üçün açılır. Plan kubunda {{ui:Home}} planı sığdırır.
- 3D görünüşdə kub görünüşlə birlikdə dönür: tərəfə, kənara və ya künca klikləyərək oradan baxın, kubu sürükləyərək orbitlə fırladın, kompas halqasını sürükləyərək şaquli ətrafında döndərin, hərfə klikləyərək o tərəfdən baxın və bütün sahənin izo görünüşü üçün {{ui:Home}} istifadə edin. Bir tərəfə düz baxdıqda kiçik oxlar növbəti tərəfə keçir, əyri oxlar görünüşü dörddə bir dönüş döndərir.
- **Ox işarəsi** (aşağı sol): planda kiçik X (şərq) və Y (şimal) işarəsi, 3D-də X, Y və Z (yuxarı).

## 3D şaquli şişirtmə

3D görünüş yüksəklikləri nə qədər uzadır: **1×**, **2×** (başlanğıc), **3×**, **5×** və ya **10×**. 3D görünüşün panelindəki siyahı eyni parametrdir, buna görə birini dəyişmək hər ikisini dəyişir. Həcmlər, profillər və 3D ixraclar həqiqi miqyasda qalır.

## En və uzunluq

Status panelində, layihənin koordinat sistemi olduqda, göstəricinin en və uzunluğunun necə göründüyü: **dərəcə, dəqiqə və saniyə** (başlanğıc, məsələn `30°18′00.00″ N`) və ya **onluq dərəcələr** (`30.300000° N`). Bax: [Layihənin koordinat sistemini təyin edin](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## İnternetdən xəritə təbəqələri

**Söndür** (başlanğıc) və ya **Yandır**. Yandırdıqda CivilCraft əlavə etdiyiniz xəritə serverlərindən ekranda olan sahənin şəkillərini istəyir. Çertyojunuz bu kompüterdə qalır; server sahəni və internet ünvanınızı görür. Söndürülmüş olduqda, açdığınız layihə hər hansı xəritə serverini adlandırsa belə, heç bir xəritə serverindən heç nə istənmir; fayldan gələn georeferanslı şəkil hər iki halda işləyir. Bax: [Plan altında xəritə təbəqələrini göstərin](topic:map-layers).

## AI köməkçiləri

**AI köməkçilərinə və skriptlərə CivilCraft-dan istifadə etməyə icazə verin** (başlanğıcda söndür) kompüterinizdəki köməkçiyə CadCraft Studio vasitəsilə açıq sahəyə çatmağa icazə verir: **Oxu** sahəni təsvir edir və nöqtələr, səth yüksəklikləri, pikitlər, profillər, həcmlər və parsellər verir; **Redaktə** onun planalma nöqtələrini seçməsinə və əlavə etməsinə icazə verir; **Saxla** və **İxrac** layihəni saxlamağa və LandXML və ya DWG yazmağa icazə verir. **İstifadə edə biləcəyi qovluqlar** (Studio-da) onun saxlaya və ixrac edə biləcəyi yerlərdir. **Fəaliyyət** onun çağırışlarını sadalayır. Bax: [AI köməkçisinin sahənizlə işləməsinə icazə verin](topic:assistants).
