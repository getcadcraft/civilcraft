---
title: LandXML mübadiləsi
summary: Digər mülki proqram təminatından LandXML-i yeni layihə kimi açın, nöqtələri, səthləri, trassaları, profilləri və boru şəbəkəsini LandXML 1.2 kimi ixrac edin və nəyin səyahət etmədiyini bilin.
keywords: landxml, xml, idxal, ixrac, mübadilə, tin, səth, trassa, profil, boru şəbəkəsi, qarşılıqlı əlaqə, məlumat mübadiləsi
from: 870d5ece
---

LandXML mülki proqramların əksəriyyətinin oxuduğu və yazdığı açıq mübadilə formatıdır. CivilCraft LandXML 1.2-ni oxuyur və yazır. Civil 3D-dən istifadə etmisinizsə, onun LandXML idxal və ixrac dialoqları ən yaxın uyğunluqdur; burada seçəcək heç nə yoxdur, qeydlər isə nəyin buraxıldığını deyir.

## LandXML faylını açın

1. {{ui:Aç}} düyməsini klikləyin (və ya {{key:Mod+O}} basın) və `.xml` və ya `.landxml` faylını seçin, ya da planın üzərinə atın.
2. Cari layihədə saxlanılmamış dəyişikliklər varsa, CivilCraft əvvəlcə soruşur. {{ui:Surətini saxla}}, {{ui:Saxlama}} və ya {{ui:Ləğv et}} seçin.
3. **Yeni layihə** yaradılır. Status sətri nəyin oxunduğunu deyir, məsələn: "site.xml açıldı: 412 nöqtə, 2 səth, 3 trassa."
4. **Səth** faktlarının altındakı qutuya baxın. Orada ötürülmüş və ya dəyişdirilmiş hər şey sadalanır, məsələn:
   - "Yalnız birinci səth ("EG") açıldı; faylda daha 1 var."
   - "Trassa "Ramp A" CivilCraft-ın hələ çəkə bilmədiyi elementlərə malikdir (xətlər, qövslər və ya klotoid spirallar deyil); o, ötürüldü."
   - "Boru şəbəkəsi qaydaları faylda yox idi; müvəqqəti yer tutanlar istifadə olunur — öz qaydalarınızı Layihə altında təyin edin."

Nə nəyə çevrilir:

| Faylda | CivilCraft-da |
|---|---|
| Vahidlər (Imperial və ya Metric) | Layihənin **Vahidləri** (fut və ya metr) |
| Layihənin adı | Layihənin **Adı** |
| CgPoints | Layihənin nöqtələri; təsvir (və ya kod) qrupu verir |
| Birinci TIN səth | Mövcud relyef, olduğu kimi istifadə olunur ("Surface (from LandXML)") |
| Xətt, qövs və klotoid spirallardan ibarət hər trassa | PI-ləri, radiusları və spiral uzunluqları ilə əyrilərdən yenidən qurulmuş trassa |
| Hər trassanın birinci layihə profili | Parabolik şaquli əyrilərlə layihə profili |
| Birinci boru şəbəkəsi | Lyukları, çökəkləri və invertləri ilə boru şəbəkəsi |
| Xətt və qövslərdən olan plan xüsusiyyətləri | Qövsləri saxlanılan xüsusiyyət xətləri; başqa proqramdan **Yalnız çəkilib** kimi başlayırlar |

Elementlərin və atributların tam siyahısı [LandXML: nə oxunur və nə yazılır](topic:landxml-reference) bölməsindədir.

:::note
LandXML-dən oxunan səth nöqtə qruplarını dəyişdikdə və ya sınır xətləri çəkdikdə yenidən qurulmur. Onu nöqtələrdən yenidən qurmaq üçün **Səth** bölməsində {{ui:Səthi nöqtələrdən yenidən qur}} düyməsini klikləyin ({{key:Mod+Z}} LandXML səthini geri qaytarır).
:::

## LandXML ixrac edin

1. **İxrac** qrupunda {{ui:LandXML}} klikləyin.
2. Brauzer `<name>.xml` faylını yükləyir. Status sətri nəyin daxil olduğunu deyir, məsələn: "LandXML 1.2 ixrac edildi: 276 nöqtə, 2 səth, 1 trassa, boru şəbəkəsi. Altlıqlar burada LandXML-in hissəsi deyil; relyef isə layihələndirilmiş səthdir."

Fayl bunları saxlayır:

- **Units**: ABŞ survey futları və ya metrlər.
- **CgPoints**: hər nöqtə nömrəsi adı ilə, təsviri və qrupu kod kimi.
- **Surfaces**: mövcud relyef TIN kimi, sınır xətləri və xarici sərhədi mənbə məlumatı kimi; altlıqlar və ya korridorlar planlaşdırılanda ikinci TIN səth "Proposed" adı ilə.
- **Alignments**: stansiyaları olan xətt, qövs və klotoid spirallar, hər biri boyunca nümunə götürülmüş mövcud relyefi və layihə profilini (PVI-lər və parabolik əyrilər) ehtiva edən profillə, iki və ya daha çox PVI olduqda.
- **PipeNetworks**: lyukları, çökəkləri və hər boru üçün invert olan strukturlar, diametr, uzunluq və meyl ilə borular.
- **PlanFeatures**: hər xüsusiyyət xətti, hər ucunda hündürlüklə və istifadə məqsədi ilə, xətt və qövslər kimi.

## Nəyin səyahət etmədiyi

- Obyekt kimi altlıqlar və korridorlar. Nəticəsi "Proposed" səthindədir.
- Xətalı trassalar (məsələn, üst-üstə düşən əyrilər): buraxılır və status mesajında sayılır.
- Hər iki invertsiz borular və iki strukturdan az olan şəbəkələr.
- Səthdən götürülmüş lyuk sabit lyuk kimi yazılır. Yenidən açdıqda struktur o rəqəmi saxlayır, səth dəyişsə belə.
- Şəbəkə qaydaları (ən kiçik meyl, örtük, düşmə): LandXML-də onlar üçün yer yoxdur.
- Göstərmə parametrləri və nöqtə qruplarının səth seçimləri: bunlar üçün CivilCraft layihəsini saxlayın.

Açarkən CivilCraft klotoiddən başqa spirallar, grid səthləri, başqa nöqtələrə istinad edən nöqtələr, parsellər, plan xüsusiyyətlərində spirallar, yollar və ya planalma məlumatlarını oxumur. Hər biri qeydlərdə adlanır, heç vaxt təxmin edilmir.

## Gediş-dönüş

Başqa mülki proqram təminatı istifadə edən birinə iş vermək və geri almaq üçün LandXML ixrac edin, onlar redaktə etsin və onların LandXML-ni yeni layihə kimi açın. Öz `.civilcraft.json` faylınızı da saxlayın: CivilCraft-ın bildiyi hər şeyi saxlayan yeganə faylıdır.
