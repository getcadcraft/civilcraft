---
title: Əkin planları və cədvəlləri
summary: Tək bitkiləri yerləşdirin, bitkilərin məsafəsinə uyğun doldurulmuş əkin yataqları (faizlə qarışıq bitkilər) və hasarlar; onları etiketləyin; əkin cədvəlində sayın (elektron cədvəl və ya TakeoffCraft üçün).
keywords: əkin planı, bitki cədvəli, əkin yatağı, kütləvi əkin, hasar, ağac, kol, yerüstü örtük, məsafə, üçbucaq məsafə, bitki sayı, miqdarlar, etiketlər, tac, bitki simvolları, ifc, həcmlərin hesablanması
from: ab49eab5
---

## Bitki yerləşdirin

1. Soldakı **Bitkilər** bölməsində bitki seçin.
2. {{ui:Bitki}} düyməsini basın, sonra plana klikləyin: hər klik bir bitki yerləşdirir. Dayandırmaq üçün {{key:Esc}} basın.

Bitkinin simvolu yetkinlikdə yayılmasında çəkilir; Daha çox › {{ui:Əkin ölçüsündə göstər}} hər bitkini əkildiyi ölçüdə çəkir. Ağaclar altındakı zəmində durur: sonradan sahəni şaquli planlaşdırdıqda onlar da onu izləyir. Bitkini bunun əvəzinə müəyyən hündürlükdə sabitləmək üçün Xüsusiyyətlərdə **Hündürlük** sahəsinə yazın.

## Əkin yataqları

1. Əsas bitkini seçin, {{ui:Yataq}} düyməsini basın və yataqın künclərini klikləyin. Bağlamaq üçün {{key:Enter}} basın (və ya birinci küncə yenidən klikləyin).
2. Yataq həmin bitkini onun məsafəsində doldurur, **üçbucaq** şablonunda (adi olanı: hər bitki altı digərindən eyni məsafədədir), kənardan yarım məsafə içəridə.
3. Xüsusiyyətlərdə **Bitki əlavə et** soldakı bitkini qarışdırır. Hər bitki üçün **Pay %** təyin edin: yataq hər birindən dəqiq həmin qədərini tutur və bütün sahəyə yayılır. **Yenidən qarışdır** onların yerini qarışdırır.

Əgər **Məsafə** boşdursa, bitkilərin öz məsafəsi (paylarına görə çəki ilə) istifadə olunur; hər bitki üçün bir dəyər yazın ki, hamısı üçün istifadə olunsun. **Şablon** kvadrat ola bilər, **Cərgələr** isə cərgələri fırladır.

## Hasarlar

Hasar bitkisini seçin, {{ui:Hasar}} düyməsini basın, hasar boyunca klikləyin və {{key:Enter}} basın. Bitkilər xətt boyunca öz məsafəsində yerləşir, iki ucda eyni kənar qalması üçün ortalanır. Hasar müəyyən məsafə ilə ayrılmış **iki sıra, şaxmat** ola bilər.

## Etiketlər

Tək bitkilər etiket parametri ilə etiketlənir (defolt olaraq `{name}`); bir bitki üçün öz etiketinizi Xüsusiyyətlərdə yazın. Yataqlar hər bitkinin sayı ilə, hasarlar öz sayları ilə etiketlənir. Daha çox › {{ui:Bitki etiketləri}} etiketləri açır və bağlayır. Etiket sahələri: `{name}`, `{botanical}`, `{size}` (qab), `{qty}`, `{height}`, `{spread}`, `{container}`.

## Bitki cədvəli

Daha çox › {{ui:Bitki cədvəli…}} tək bitkilər, yataqlar və hasarlar birlikdə olmaqla hər bitkini növə görə, əkin ölçüsü ilə sayır. Onu **CSV** və ya **XLSX** kimi saxlayın, ya da **TakeoffCraft-a göndərin**: TakeoffCraft-ın bitkiləri qiymətləndirmək üçün açdığı miqdarlar faylı (yanında sərt örtük və suvarma miqdarları ilə).

## IFC

Daha çox › {{ui:Abadlaşdırma IFC-ni ixrac et}} abadlaşdırmanı BIM modelinin saxlaya biləcəyi IFC faylı (IFC 4.3) kimi saxlayır: hər bitki VEGETATION tipli `IfcGeographicElement` olaraq, növünə görə tipləndirilmiş və bitkinin xassələri (botaniki ad, ölçülər, dözümlülük, su, işıq) ilə; hər yataq və hasar öz sayları ilə bir element olaraq sahədə. BimCraft onu binanın yanında açır.
