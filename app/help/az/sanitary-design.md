---
title: Məişət axınlarının layihələndirilməsi və kanalizasiyanın yoxlanılması
summary: Məişət kanalizasiya şəbəkəsinin hər lyukunda daxil olan adamları və sahəni daxil edin; CivilCraft onları şəbəkə üzrə toplayır, zirvə əmsalı və sızma ilə zirvə axını hesablayır və hər borunun tutumunu və sürətini yoxlayır.
keywords: məişət, kanalizasiya, məişət kanalizasiyası, çirkab su, layihə axını, zirvə axını, zirvə əmsalı, harmon, babbitt, sızma, əhali, adambaşına, dolma faizi, özütəmizləmə, sürət, boru ölçüsünün seçilməsi, layihə vərəqi
from: 73ba197a
---

Məişət layihə axınları [boru şəbəkəsi](topic:pipe-network) üzərində işləyir, onun {{ui:Type}} {{ui:Sanitary}} olduqda. Heç nə seçilmədikdə sağ panel **Məişət layihə axınları**nı göstərir, yağış şəbəkəsi isə yağış drenajını göstərir.

## Daxil olanı daxil edin

1. Lyuk seçin. **Məişət layihə axınları** altında {{ui:People entering here}} və {{ui:Area entering here}} yazın (metrik layihədə hektar, fut layihədə akr).
2. Dükanlar, ofislər və ya sənaye üçün ekvivalent adamları yazın: sahə, agentliyinizin istifadə etdiyi hər hektara (və ya akra) adam sayı ilə vurulur. Sahə hər halda sızma üçün sayılır.
3. Küçə və ya sahə bağlanan hər lyuk üçün təkrar edin. Heç nə bağlanmayan lyuk hər ikisini 0-da saxlayır.

Hər boru yuxarı lyukunda və ondan yuxarıda daxil olan hər şeyi daşıyır. Ondan keçənləri görmək üçün lyuku seçin.

## Parametrlər

| Parametr | Nə deməkdir |
|---|---|
| {{ui:Flow per person}} | bir adamın gündəlik orta axını: litrlə (metrik layihə) və ya ABŞ qallonu ilə (fut layihə) |
| {{ui:Infiltration}} | yeraltı sızan su: saniyədə hər hektara litr, ya da hər akra gündə qallon |
| {{ui:Peaking factor}} | Harmon, 1 + 14 / (4 + √P), ya da Babbitt, 5 / P^0.2; P minlərlə əhali |
| {{ui:Peaking factor at least}} / {{ui:Peaking factor at most}} | əmsal bu ikisi arasında saxlanılır |
| {{ui:Manning n}} | tutum və sürət üçün |
| {{ui:Least velocity}} / {{ui:Most velocity}} | zirvə axınının öz dərinliyində borudakı |
| {{ui:Most of full capacity}} | zirvədə borunun nə qədər dolu işləyə biləcəyi, tam dolu daşıdığının faizi ilə |

Başlanğıc qiymətlər yer tutucudur, standart deyil. Agentliyinizin dərc etdiyi qiymətlərdən istifadə edin.

## Nəyi hesablayır

Hər boru üçün, axın sırası ilə:

- zirvə axını = adamlar × adambaşına axın × zirvə əmsalı + sahə × sızma
- tam dolu tutum (borunun meylində Manninq tənliyi) və zirvənin onu nə qədər doldurduğu
- zirvə axınının normal dərinliyi və orada sürət

**Məişət nəticələri** cədvəli hər borunun adamlarını, zirvə əmsalını, zirvə axınını (L/s, ya da gpm və kubik fut/san), dolma faizini və sürətini sadalayır. Problemlər altında sadalanır: limitdən çox dolu boru, ən az sürətdən yavaş (özünü təmizləməyə bilər), ən çox sürətdən sürətli və ya heç bir düşmə olmayan boru. {{ui:Size the pipes for these flows}} hər boru üçün ən kiçik standart ölçünü (200 mm və ya 8 düym və yuxarı) seçir ki, zirvəsi limit daxilində daşısın; bir {{key:Mod+Z}} onu geri qaytarır.

:::note
Bu, layihə vərəqinin hesabladığı stasionar zirvə axınıdır, dərc olunmuş layihə vərəqinə qarşı çap olunmuş yuvarlaqlaşdırmaya qədər yoxlanılıb. Zamanla kanalizasiyanın modeli deyil: hidrograf, saxlama, nasos və ya daşma yoxdur. Bax: [Hələ qurulmayıb](topic:not-built-yet).
:::

Sürətlər hər dərinlikdə eyni n ilə Manninq tənliyindən istifadə edir. Bəzi agentliklərin yarım dolu cədvəlləri n-in dərinliklə dəyişməsinə icazə verir, bu da 60-70 faiz dolu boruda bir az aşağı sürət verir (təxminən 3 faiz az).
