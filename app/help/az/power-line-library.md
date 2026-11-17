---
title: Elektrik xətti kitabxananız
summary: Öz naqillərinizi, yeraltı kabellərinizi, dayaqlarınızı, avadanlığınızı və xəndək növlərinizi adlandırdığınız kateqoriyalarda yaradın və onları fayl kimi paylaşın.
keywords: kitabxana, naqil, kabel, dirək, dayaq, köndələn qol, izolyator, armatur, ştaqa, guy, transformator, şkaf, birləşmə, xəndək, kateqoriya, csv, idxal, ixrac
from: 88733744
---

**Kitabxana** bölməsi Elektrik xətləri iş sahəsində xətt və kabelin istifadə edə biləcəyi hər elementi saxlayır. Bunların heç biri ölkə və ya istehsalçı ilə bağlı deyil: işlədiyiniz elementləri siz yaradırsınız.

## Üç növ element

| Növ | Harada saxlanılır | Dəyişmək olarmı? |
|---|---|---|
| **Nümunələr** | CivilCraft ilə birlikdə gəlir, materialların xüsusiyyətlərindən hesablanmış ümumi rəqəmlərlə | Xeyr: əvvəl {{ui:Mənim kitabxanama kopyala}} |
| **Layihədə** | Açdığınız layihə faylı ilə gəlir | Xeyr: əvvəl {{ui:Mənim kitabxanama kopyala}} |
| **Mənim** | Sizin öz elementləriniz, bu brauzerdə saxlanılır | Bəli, dəyişikliklər dərhal saxlanılır |

Hər layihə istifadə etdiyi hər elementin nüsxəsini saxlayır, ona görə layihə hər kompüterdə öz naqilləri və dirəkləri ilə açılır.

:::warning
Nümunə elementlər sadəcə nümunələrdir: hər rəqəmi təchizatçınızın məlumatı ilə yoxlayın. Yeraltı kabellərin cərəyan həddi qəsdən yoxdur, çünki o, kabelin necə döşəndiyindən asılıdır.
:::

## Element yaradın

1. **Kitabxana**da **Növ**ü seçin (hava naqilləri, yeraltı kabellər, dayaqlar, avadanlıq və ya xəndək növləri).
2. {{ui:Yeni element}} klikləyin və ya nümunə seçib {{ui:Mənim kitabxanama kopyala}} və ya {{ui:Dublikat yarat}} klikləyin.
3. Sahələrini doldurun. `*` ilə işarələnmiş sahələr yoxlamaların ehtiyac duyduğu sahələrdir; çatışmayan element `!` ilə işarələnir və xətt onu istifadə etdikdə **Yoxlamalar** siyahısında göstərilir.
4. **Kateqoriya** verin, səviyyələr arasında `/` ilə: `Hava/AG/Dəstəli`, `Dayaqlar/Beton/12 m`. Ağac kateqoriyalarınızı izləyir.

Hər növ nə tələb edir:

| Növ | Yoxlamalar üçün lazımdır |
|---|---|
| Hava naqili | kəsik sahəsi, diametr, metr başına kütlə, qırılma möhkəmliyi, elastiklik modulu, istilik genişlənməsi |
| Yeraltı kabel | nüvələr, kəsik sahəsi, gərginlik, diametr, müqavimət, cərəyan həddi |
| Dayaq | ümumi uzunluq, nominal yük (yuxarıdan aşağıda bir nöqtədə götürülür), yerdə dərinlik |
| Avadanlıq | növü; köndələn qollar, armaturlar və ştaqalar üçün yük həddi; köndələn qollar üçün fazalar arası məsafə və itki; izolyatorlar üçün uzunluq; ştaqalar üçün bucaq |
| Xəndək növü | dərinlik, en, kabellərin üzərindəki örtük |

## Paylaşın

- {{ui:Mənim kitabxanamı saxla}} hər elementinizi bir `.cclines.json` faylı kimi saxlayır; {{ui:Kitabxana açın…}} onu geri oxuyur (eyni açarlı elementlər əvəz olunur).
- {{ui:CSV kimi saxla}} baxdığınız növü elektron cədvəl kimi saxlayır; {{ui:Kitabxana açın…}} o növün CSV-sini geri oxuyur. Sütunlar istənilən ardıcıllıqda ola bilər; nöqtəli vergüllə ayrılmış faylda onluq vergül istifadə oluna bilər.
