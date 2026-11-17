---
title: Səthi qurun və təkmilləşdirin
summary: CivilCraft mövcud zəmini necə üçbucaqlayır və onu sınma xətti qrupları, çəkilmiş sınma xətləri, xarici sərhəd və ən uzun xarici kənarla necə formalaşdırmaq olar.
keywords: tin, səth, üçbucaqlama, sınma xətti, sərhəd, mövcud zəmin, eg, səth yaratmaq, delaunay, üçbucaqlar, maks kənar, xarici sərhəd
from: b9eea3f3
---

CivilCraft-da layihə başına bir mövcud zəmin səthi var. O, nöqtələrinizdən qurulmuş TIN-dir (üçbucaqlanmış qeyri-müntəzəm şəbəkə) və hər giriş dəyişəndə avtomatik yenidən qurulur. "Yenidən qur" əmri yoxdur və köhnəlmiş səth yoxdur.

## Səthə nə daxil olur

- Yüksəkliyi olan hər nöqtə, {{ui:Nöqtələr}} olaraq təyin olunmuş qrupda.
- {{ui:Sınma xətti}} olaraq təyin olunmuş hər qrup, nöqtə nömrəsi sırası ilə birləşdirilir.
- {{ui:Sınma xətti}} aləti ilə çəkdiyiniz hər sınma xətti.
- Çəkdiyiniz xarici sərhəd, əgər varsa.
- **Ən uzun xarici kənar** parametri.

Üçbucaqlar heç vaxt sınma xəttini kəsmir: səth ona riayət etməyə məcbur edilir, sonra ətrafında mümkün qədər bərabər düzülür (qalan yerlərdə Delaunay).

## Kodlanmış xətləri sınma xəttinə çevirin

1. Sol paneldə **Nöqtələr** altında qrupu tapın (məsələn FL).
2. Onun **Səth** seçimini {{ui:Sınma xətti}} edin.
   Səth yenidən qurulur, xətt narıncı rəngdə çəkilir ({{ui:Sınma xətləri}} **Göstər** altında açıq olduqda) və səth məlumatlarında **Sınma xətləri** bir artır.
3. Xətti planda yoxlayın. O, xəttin ölçüldüyü sırada nöqtədən nöqtəyə getməlidir. Zığzaq edirsə, qrupda birdən çox xətt var və ya nöqtələr sıra ilə nömrələnməyib: qrupu {{ui:Nöqtələr}} olaraq geri təyin edin və xətləri əl ilə çəkin (növbəti bölmə).

## Nöqtələr vasitəsilə sınma xətti çəkin

1. {{key:B}} basın və ya **Səth** qrupunda {{ui:Sınma xətti}} klikləyin.
   İpucu deyir: "Sınma xətti: geodeziya nöqtələrini ardıcıl klikləyin (onların yüksəkliklərini alır). Enter bitirir."
2. Göstəricini nöqtənin yaxınına aparın. Kiçik narıncı kvadrat alacağı nöqtəni göstərir.
3. Xəttin nöqtələrinə bir-birinin ardınca klikləyin. Hər klik nöqtəni və onun yüksəkliyini status sətrində göstərir.
4. Bitirmək üçün {{key:Enter}} basın.
   Status sətri deyir: "Sınma xətti 1 əlavə edildi; səth yenidən quruldu."

Klik yüksəkliyi olan geodeziya nöqtəsinə düşməlidir; başqa yerə klik "Yüksəkliyi olan geodeziya nöqtəsinə klikləyin: sınma xətti nöqtələrin yüksəkliklərini alır." mesajı ilə rədd olunur. {{key:Backspace}} son nöqtəni silir; {{key:Esc}} bütün xətti ləğv edir.

:::warning
{{key:Enter}} ilə bitirin. İkiqat klik də bitirir, lakin bu versiyada ikiqat klik etdiyiniz nöqtəni silir. Son nöqtəyə bir dəfə klikləyin, sonra {{key:Enter}} basın.
:::

Bütün çəkilmiş sınma xətlərini bir dəfəyə silmək üçün **Səth** bölməsində {{ui:Çəkilmiş xətti sərhədləri sil}} klikləyin. Yalnız sonuncunu silmək üçün {{key:Mod+Z}} istifadə edin. Çəkilmiş sınma xətləri hələ tək-tək seçilə və ya redaktə edilə bilmir.

## Xarici sərhəd çəkin

Sərhəd səthi sizin etibar etdiyiniz sahəyə kəsir (məsələn geodeziya limitlərinə), buna görə ölçülməmiş küncləri keçən uzun üçbucaqlar yox olur.

1. {{key:O}} basın və ya {{ui:Sərhəd}} klikləyin.
2. Sahənin ətrafında künclərə ardıcıl klikləyin. Kəsikli xətt forma göstərir.
3. {{key:Enter}} basın.
   Status sətri deyir: "Sərhəd təyin edildi; ondan kənar üçbucaqlar yox oldu." Səth məlumatlarında **Sərhəd** "Bəli" və künclərin sayını göstərir.

Bilməli olduqlarınız:

- Yalnız bir sərhəd var. Başqasını çəkmək onu əvəz edir. {{ui:Sərhədi silin}} onu aradan qaldırır.
- Sərhəd yalnız kəsə bilər: nöqtələrin ötəsinə uzanan sərhəd onların konturuna qədər kəsilir, "Sərhəd nöqtələrin ötəsinə uzanır; onların konturuna qədər kəsildi." qeydi ilə.
- Künclər yüksəkliklərini səthdən alır, buna görə kənar zəminə dəqiq uyğun gəlir.
- Gizli (daxili) sərhədlər hələ mövcud deyil.

## Uzun xarici üçbucaqları kəsin

Sərhəd olmadan səth nöqtələrin bütün konturunu doldurur, o cümlədən konkav kənarlar boyunca uzun nazik üçbucaqlar.

1. **Səth** bölməsində **Ən uzun xarici kənar** sahəsinə uzunluq yazın və {{key:Enter}} basın. Adi nöqtə aralığınızın iki-üç mislindən başlayın.
2. Xarici kənarı bundan uzun olan xarici üçbucaqlar silinir; hər xarici kənar kifayət qədər qısa olana qədər içəriyə doğru davam edilir. Sınma xətti olan kənar heç vaxt soyulmur.
3. Bütün üçbucaqları yenidən saxlamaq üçün 0 yazın.

## Səth hesabatını oxuyun

Səth məlumatlarının altında qutu qurucunun nə etdiyini siyahılayır. Solunda narıncı zolaq varsa, o məlumatdır; qırmızı zolaqla isə xəta var və səth yoxdur.

| Mesaj | Mənası |
|---|---|
| "3 nöqtə başqası ilə eyni yerdə idi və ona birləşdi." | Planda 0.0001-dən yaxın olan nöqtələr bir təpə oldu (birinci saxlanıldı). |
| "2 yerdə iki fərqli yüksəklik var …" | Bir-birinin üstündə olan nöqtələr və ya kəsişən sınma xətləri hündürlükdə razılaşmır. Sınma xəttinin yüksəkliyi qalib gəlir, sonra birincisi. |
| "1 sınma xətti parçası səthə məcbur edilə bilmədi." | Çox qısa və ya demək olar ki, üst-üstə düşən sınma xətti parçası yerə düşmədi; həmin yeri yoxlayın. |
| "Səth üçün yüksəkliyi olan ən azı üç nöqtə lazımdır." | Nöqtələr çox azdır: sütun sırasını və qrupları yoxlayın. |
| "Nöqtələrin hamısı bir xətt üzərindədir: üçbucaq yoxdur." | Nöqtələrin eni yoxdur, məsələn tək poliqon xətti. |
| "Sərhəd nöqtələrlə üst-üstə düşmür." | Sərhəd başqa yerdədir, çox vaxt vahid və ya koordinat qarışığıdır. |
| "Sərhədin içində üçbucaq qalmayıb." | Sərhəd çox kiçikdir və ya yanlış yerdədir. |

## LandXML-dən oxunan səth

LandXML açdıqda, onun ilk TIN səthi olduğu kimi istifadə olunur: **Səth** başlığı "Səth (LandXML-dən)" deyir və **Ən uzun xarici kənar** boz rəngdə olur. Bu səth istifadədə olduqda, sınma xətti qrupları, çəkilmiş sınma xətləri və yeni sərhəd onu dəyişmir. Səthi faylın nöqtələrindən qurmaq üçün {{ui:Səthi nöqtələrdən yenidən qur}} klikləyin. {{key:Mod+Z}} LandXML səthini geri qaytarır.

## Əlaqəli

- [Konturları, yüksəklikləri və meyilləri oxuyun](topic:contours).
- [Geodeziya nöqtələrini idxal edin](topic:import-points).
