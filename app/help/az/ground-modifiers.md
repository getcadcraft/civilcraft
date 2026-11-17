---
title: Yer modifikatorları və canlı səviyyələr
summary: Layihəli yeri formalaşdıran bütün elementlər bir sıralı siyahıda (üst-üstə düşdükdə sonrakı üstün gəlir), hər modifikator üzrə kəsim və doldurma, Problemlər panelində birləşmə yoxlamaları, yer səviyyələrini canlı oxuyan nöqtə səviyyələri və meyl oxları.
keywords: yer modifikatorları, yığın, sıra, layihəli yer, mövcud yer, üst-üstə düşmə, kəsim və doldurma, birləşmə, dayaq divarı, döşəmə kənarı, yataq səviyyəsi, pilləkən meydançası, nöqtə səviyyəsi, nöqtə hündürlüyü, meyl oxu, meyl etiketi, düşmə
from: 3998a5b0
---

Layihəli yer = mövcud yer + modifikatorlar, sıra ilə. Mövcud yer heç vaxt dəyişdirilmir.

## Siyahı

{{ui:Levels}} › {{ui:Ground modifiers…}} yeri formalaşdıran hər obyekti siyahılayır: platformalar, torpaq sipərlər, drenaj çökəklikləri, planlaşdırma sahələri, döşəmə və cığırlar, sonlanmış səviyyəli əkilmiş sahələr, və **Yer formalaşdırır** qutusu işarələnmiş pilləkənlər və rampalar (aşağı və yuxarı səviyyələri ilə birlikdə). Bir-birinin üstünə düşdükdə **sonrakı** üstün gəlir. Sətri sürükləyin və ya oxlardan istifadə edərək sırasını dəyişin; yer dərhal yenidən qurulur. Hər sətir öz üstündəki elementlərdən sonra formalaşdırdığı kəsimi və doldurmanı göstərir; cəmi siyahının altındadır.

## Birləşmə yoxlamaları

Problemlər paneli **keçin** düyməsi ilə bunları siyahılayır:

- hündür tərəfi üstündən yuxarıda olan divar (divarın üzərində torpaq), və ya aşağı tərəfi təməlini göstərən divar;
- sonlanmış səviyyəsi qarşılaşdığı döşəmə kənarından yuxarıda olan, və ya ondan tipik 150 mm-dən çox aşağıda olan əkilmiş sahə;
- altı və ya üstü üzərinə düşdüyü döşəməyə çatmayan pilləkənlər;
- üst-üstə düşən iki modifikator (orada sonrakı üstün gəlir).

Dayaq divarının üstü yerin hündür tərəfini izləyə bilər: yer dəyişən hər dəfə onun hündürlüyü yenidən hesablanır.

## Yer formalaşdıran dayaq divarı

Dayaq divarını seçin və **Yer formalaşdırır** qutusunu işarələyin. Divarın altındakı zolaq (divarın qalınlığı qədər geniş) modifikator kimi siyahıya düşür:

- **hündür tərəfdəki** kənar oradakı yerdə, stansiya-stansiya saxlanılır, beləliklə divarın üstü hündür tərəfi izləyir (üstündəki örtüklə birlikdə). **Üst** səviyyə yazsanız, hündür tərəf örtük çıxılmaqla həmin səviyyədə saxlanılır;
- **aşağı tərəfdəki** kənar yazdığınız **Aşağı tərəfdə saxlanılan yer səviyyəsi**-də saxlanılır; boş buraxsanız oradakı yerdə;
- hündür tərəf bütün divar boyunca daha yüksək olan yer tərəfidir, beləliklə divar boyunca heç vaxt dəyişmir;
- zolağın kənarındakı yer dəyişmir; mövcud yer heç vaxt dəyişmir.

Hər modifikator kimi o da siyahıdadır və ondan sonra gələn modifikator üst-üstə düşdükdə üstün gəlir. Divarın bir ucunda saxlanılan səviyyə oradakı mövcud yerdən 150 mm-dən çox uzaqdırsa, Problemlər panelində xəbərdarlıq alır (**keçin** ilə). Sərbəst divar yeri formalaşdırmır. Bu qutu əvvəlki versiyalarda yaradılmış fayllarda söndürülüdür, onlar necə idisə elə açılır.

## Nöqtə səviyyələri və meyl oxları

{{ui:Spot level}} (bir klik) və {{ui:Gradient arrow}} (iki klik) çəkildiyi hər dəfə yeri oxuyur: obyekti köçürəndə və ya yenidən səviyyələndirəndə etiketlər izləyir. **Xüsusiyyətlər**-də etiketin layihəli və ya mövcud yeri oxuyub-oxumadığını seçin; mövcud yer etiketləri mötərizədə göstərilir. Oxlar aşağı meyl istiqamətinə göstərir və `1:20 (5.0 %)` kimi yazır.
