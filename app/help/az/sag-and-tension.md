---
title: Sallanma və gərginlik
summary: Yük hallarınız (temperatur, külək, buz) və gərginlik həddləri, CivilCraft hər kəsiyin gərginliyini necə hesablayır və naqil çəkmə cədvəlləri.
keywords: sallanma, gərginlik, yük halı, temperatur, külək, buz, asimmetrik buz, əsas aralıq, ekvivalent aralıq, hal dəyişikliyi, katenar, naqil çəkmə cədvəli, qırılma möhkəmliyi, gündəlik gərginlik
from: f8876c35
---

## Yük halları və həddlər

{{ui:More}} › {{ui:Load cases and limits…}} layihədəki hər xətt üçün izlənən qaydaları redaktə edir.

- **Yük halları**: temperatur, keçiricidə külək təzyiqi (Pa) və radial buz (mm, sıxlığı ilə birlikdə). Birinci hal istinaddır.
- **Gərginlik həddləri**: keçiricinin qırılma möhkəmliyinin payı, üfüqi gərginlikdə və ya dayaqda ən böyük gərginlikdə, bir yük halında. Və ya üfüqi gərginliyi özünüz verin.
- **Təmizlik məsafələri**: keçiricinin yer, yol, bina və s. üzərində saxladığı məsafə. Onları əlavə edin, adını dəyişin və silin: onlar sizindir. Onların altında **Xətt altındakı bitki örtüyü**, **Xətt altındakı divarlar** və **Yeraltı keçidlər** qaydalarını seçin.
- **Yoxlamaların istifadə etdiyi hallar**: hansı hal ən böyük sallanmanı verir (isti), izolyatorun sallanması (külək), buz və dayağın bir tərəfində buz.
- **Əmsallar**: faza aralığı əmsalı k, ən böyük izolyator sallanması, dayaq və birləşmə yüklərinə əmsal, bucaq və ya son dayaq təyin edən dönmə bucaqları, basdırılmış kabellər üzərində ən az örtük və ən böyük gərginlik itkisi.

## Paketlər: bir ölkə üçün qaydalar və kitabxana

CivilCraft-a heç bir ölkənin qaydaları daxil edilməyib. **Paket** qayda dəstini və kitabxananı bir faylda (`.cclinepack.json`) saxlayır: ölkə, şəbəkə operatoru və ya şirkət üçün:

- {{ui:Load cases and limits…}} daxilində **Paket kimi saxla…** göstərilən qayda dəstini və kitabxananızı yazır (kitabxanada heç nə yoxdursa, bu layihənin istifadə etdiyi elementləri). Əvvəlcə **Ölkə və ya region** yazın.
- **Qayda dəsti və ya paket açın…** paketi, qaydalar faylını və ya kitabxana faylını oxuyur. Paketin qaydaları dialoqda göstərilir (istifadə etmək üçün **Tətbiq et** klikləyin) və onun elementləri kitabxananıza düşür.
- Başqalarının paylaşdığı paketlər əlavələr səhifəsində **Elektrik xətti paketləri** altında siyahıdadır. İki nümunə paket formatı göstərir; onlar heç bir ölkənin qaydaları deyil.

Hər paket açıldıqda, hər hansı fayl kimi, yoxlanılır. Qurulmadan əvvəl hər dəyəri tətbiq olunan standarta görə yoxlayın.

Başlamaq üçün iki nümunə qayda dəsti var: **Nümunə: soyuq iqlim** və **Nümunə: mülayim iqlim**. Onların rəqəmləri heç bir standartdan gəlmir: öz standartınızın verdiyi dəyərləri təyin edin. {{ui:Save rules}} və {{ui:Open rules…}} qayda dəstini fayl kimi paylaşır.

## Gərginlik necə hesablanır

Hər dayaqsız hissə üçün:

1. **Əsas aralıq** onun aralıqlarının √(ΣL³ ÷ ΣL)-dir.
2. Hər həd istinad halında əsas aralıqda **hal dəyişikliyi tənliyi** vasitəsilə üfüqi gərginliyə çevrilir: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. Ən məhdudlaşdıranı gərginliyi təyin edir.
3. Hər yük halının gərginliyi həmin birindən gəlir, və hər aralığın forması iki birləşmə nöqtəsindən keçən dəqiq **katenardır** (yamacdakı aralıqlar daxil): sallanma birləşmə xəttindən, uzunluq və hər ucda gərginlik.

Hal üzrə metrə düşən yük: çəki plus buz (buz sahəsi × sıxlıq × g) şaquli; külək təzyiqi × buzlu diametr üfüqi.

## Naqil çəkmə cədvəlləri

{{ui:More}} › {{ui:Stringing tables…}} hər kəsik üçün üfüqi gərginliyi və hər aralığın sallanmasını qaydalar dəstinin hər temperaturunda (başlanğıc üçün −5 °C-dən 40 °C-ə, 5 °C addımla), sakit havada, siyahıya alır. Onları və dayaq cədvəlini CSV kimi saxlayın.

Hesaba alınmayıb: illər ərzində keçiricinin sürünməsi və yeni keçiricinin uzanması. Onları naqil çəkdiyiniz temperaturlar vasitəsilə əlavə edin.
