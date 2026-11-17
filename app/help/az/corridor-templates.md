---
title: Korridor şablonları və relyef şablonları
summary: Kiçik, təkrar istifadə olunan şablonlar yaradın (bordür və oluk, səki, divar, arx), onlardan piketə görə korridor qurun, sol və sağ tərəfləri ayrıca təyin edin, trassanı bir neçə korridora bölün və relyef üzərində təbəqəli materialları örtün.
keywords: şablon, şablonlar, şablon kitabxanası, şablon yaradılması, tipik kəsik, yığım, alt yığım, komponentlər, nöqtə kodları, son şərt, günəş işığı, arx, divar, bordür, oluq, səki, bölgələr, piket aralığı, bir neçə korridor, sol və sağ, relyef şablonu, münbit torpaq, yol örtüyü, baza, örtük, materiallar, kəmiyyətlər
from: ce70e58b
---

**Şablon** bir dəfə çəkib təkrar istifadə etdiyiniz kiçik eninə kəsikdir: ofsetləri, meylləri və nöqtə kodları olan nöqtələr və materialları olan komponentlər. Korridor piketə görə şablonlardan qurula bilər, hər tərəfin öz yol örtüyü şablonları və öz son şərti olur, eyni şablonlar relyefdə də örtülə bilər.

:::warning
Nümunə şablonlar başlamaq üçün yer tutucudur. Onların rəqəmləri heç bir standartdan və ya agentlikdən alınmayıb. Layihəyə tətbiq etməzdən əvvəl mühəndis hər şablonu və ona verdiyiniz hər qiyməti yoxlamalıdır.
:::

## Şablonları açın

{{ui:Surface}} › {{ui:More}} › {{ui:Corridor templates…}} (və ya {{cmd:TEMPLATES}} yazın) açın. Pəncərədə üç siyahı var:

- **Bu layihədə**: bu layihənin korridorlarının və relyef şablonlarının istifadə etdiyi şablonlar. Onlar layihə faylında saxlanılır.
- **Mənim kitabxanam**: bu brauzerdə saxlanılan və hər layihədə təklif olunan şablonlar. Saxlamaq üçün layihə şablonunda {{ui:Save to My library}} istifadə edin.
- **Nümunələr**: təbəqələri olan iki zolaq, bordür və oluq, səki, günəş işığı, arx, relyef altındakı divar, relyefdəki münbit torpaq və yol örtüyü. Hər biri "Mühəndis tərəfindən yoxlanılması üçün" kimi işarələnib.

{{ui:Use in this project}} kitabxana və ya nümunə şablonunu layihəyə kopyalayır. {{ui:Export this project's templates}} onları `.cctemplates.json` faylı kimi saxlayır, {{ui:Import a file}} isə faylı layihəyə və Mənim kitabxanama oxuyur. Şablonları paylaşmaq və ya başqa kompüterə köçürmək üçün faylı istifadə edin.

## Şablon yaradın

{{ui:New template}} (və ya layihə şablonunda {{ui:Edit}}) şablon redaktorunu açır. Sağ tərəfi çəkin, şablonun 0,0 nöqtəsindən xaricə doğru; sol tərəf eyni şablonu sola doğru istifadə edir.

1. Ona ad və növ verin: **Yol örtüyü** (növbəti şablon onun sonuna birləşir), **Son şərt** (zəminə çatır) və ya **Relyef şablonu**.
2. **Qiymətlər** əlavə edin: en `w` və ya meyl `s` kimi adlandırılmış ədədlər. Şablonun istənilən yerində ədəd qutusu ədəd və ya qiymətin adını qəbul edir; `-t` mənfi edilmiş `t` qiymətidir. Korridor şablonun hər istifadəsinə öz qiymətlərini verə bilər, buna görə də bir bordür şablonu hər bordür hündürlüyünə xidmət edir.
3. **Nöqtələri** sıra ilə əlavə edin. Hər biri əvvəlki nöqtədən (və ya 0,0 nöqtəsindən) öz məhdudiyyəti ilə yerləşdirilir:

| Məhdudiyyət | Nöqtəni yerləşdirir |
|---|---|
| Meyldə ofset | Xaricə ofset və meyl (qalxma/məsafə; −0.02 2% enməni bildirir) |
| Ofset və qalxma | Ofset və qalxma |
| Düz yuxarı və ya aşağı | Yalnız qalxma |
| Zəminə yan meyl | Nöqtəsindən zəminə qədər xaricə, zəmin yuxarıda olan yerdə kəsim nisbəti, aşağıda olan yerdə doldurma nisbəti ilə |
| Zəminə qədər | Ofset, sonra zəminə düz yuxarı və ya aşağı |
| Divar | Verdiyiniz qalınlıqda divar: kəsimdə onun yuxarısı yol üzündə zəmini tapır, doldurmada yol onun üzərindən keçir və xarici üzü zəmitə enir |

   Bitmiş səthin keçdiyi nöqtələr üçün **Üst** işarələyin. Son üst nöqtə həmin tərəfdəki növbəti şablonun başladığı yerdir. **Hədəf** korridorun nöqtəni hərəkət etdirməsinə imkan verir: onun ofseti və ya yüksəkliyi xəttdən gəlir.
4. **Komponentləri** əlavə edin: nöqtə kodları ilə (`0` 0,0 nöqtəsidir) bağlı formalar, hər birinin adı, materialı və növü var. Onların sahələri həcmləri verir.

Çertyoj hər dəyişiklikdə həqiqi miqyasda izlənir və onun altındakı siyahı nəyin səhv olduğunu deyir (sondan əvvəl zəmini toxunan nöqtə, şablonda olmayan qiymət, sahəsi olmayan komponent). {{ui:Add to this project}} və ya {{ui:Save}} onu bir geri qaytarma addımı kimi saxlayır.

## Şablonlardan korridor qurun

Korridoru olan trassanı seçin və onun Xüsusiyyətlərində {{ui:Build from templates by station}} seçimini yandırın. Korridor hər iki tərəfdə iki zolaq və günəş işığı nümunələri ilə başlayır.

- **Bölgələr.** Hər bölgə bir piketdən başlayır və növbəti bölgənin piketinə qədər davam edir. {{ui:Add a region}} birini əlavə edir; onun başlanğıc piketini öz qutusunda dəyişin.
- **Sol və sağ ayrıca.** Hər bölgənin hər tərəfinin öz **Yol örtüyü** siyahısı var, mərkəz xəttindən xaricə, və öz **Son şərti** var: günəş işığı, arx, divar və ya zəmini toxunan istənilən şablon. Son şərt olmadıqda tərəf korridorun kəsim və doldurma meylləri ilə günəş işığına çıxır. {{ui:Copy left to right}} bir tərəfi kopyalayır.
- **Qiymətlər və hədəflər.** Tərəfdəki hər şablonun altında hər qiymət üçün bir qutu (boş = şablonun öz qiyməti) və hədəf alan nöqtə üçün onu hərəkət etdirən layihə xətti və ya başqa korridorun xətti.
- **Başlanğıc və son** korridoru trassanın bir hissəsi ilə məhdudlaşdırır.

Kəsiklər, hər nöqtə kodu üçün plan xətləri, bitmiş səth, planda qoyulma və torpaq işləri hamısı bunu izləyir. Xüsusiyyətlər hər komponentin hər tərəf və bölgə üzrə həcmini göstərir (mərkəz xətti boyunca orta son sahələri ilə). Korridor şablonlardan qurulduqda yan meyl və korridorun kənar hədəfləri istifadə olunmur.

## Bir trassada bir neçə korridor

**Bu trassadakı korridorlar** altında {{ui:Add a corridor}} trassanın qalan hissəsində korridor əlavə edir: birinci korridora ortada son piket verilir (və ya öz piketini saxlayır), yeni korridor orada birinci korridorun son bölgəsinin şablonları ilə başlayır. Hər korridorun öz adı, piket aralığı, şablonları və torpaq işləri var. Birini {{ui:On}} qutusu ilə söndürün. İki aralıq üst-üstə düşdükdə sonrakı korridor əvvəlkinin üzərinə grade edir.

## Relyef şablonları

Relyef şablonu şablonun təbəqələrini 0,0 nöqtəsindən relyefə örtür: 0,0 nöqtəsindən aşağıdakı təbəqə zəminə gedir (sökülməli münbit torpaq), yuxarıdakı isə zəmin üzərində oturur (avtomobil dayanacağında baza və yol örtüyü). Enlər və meyllər vacib deyil, yalnız hər komponentin 0,0 nöqtəsindən yuxarıda və ya aşağıda dərinliyi vacibdir.

{{ui:Surface}} › {{ui:More}} › {{ui:Terrain templates…}} (və ya {{cmd:TERRAINTEMPLATES}} yazın) açın; blok layihənin Xüsusiyyətlərində də var. {{ui:Add a terrain template}} münbit torpaq nümunəsi ilə birini əlavə edir. Hər biri üçün seçin:

- **şablon** (onun qiymətləri bu biri üçün dəyişdirilə bilər),
- **relyef**: mövcud zəmin və ya layihə səthi,
- onu kəsən **forma**: bütün relyef, parsel, platforma və ya bağlı layihə xətti. Eyni relyefdə müxtəlif formalarla bir neçə relyef şablonu istifadə edilə bilər.

Hər təbəqə qalınlığını, plan sahəsini və həcmini sadalayır. Həcm plan sahəsinin qalınlığa vurulmasıdır, qalınlıq düz aşağıya ölçülür; sahə şəbəkədə ölçülür və sürüşdürülmüş (meylli) sahə də verilir. Formalar plana C-TOPO-TMPL qatında çəkilir. Relyef şablonları layihə səthini dəyişmir.

## Materiallar və kəmiyyətlər

Layihənin Torpaq işləri bloku **Şablonlardan materiallar** siyahılayır: hər korridor komponenti və relyef şablonu təbəqəsi öz həcmi ilə. {{ui:Send to TakeoffCraft}} kəsim və doldurmadan sonra onları kəmiyyətlər faylına yazır, hər element bir sətir, kubmetr (futla layihələrdə kubyard) ilə.

## Fayllar

Şablonlar, bölgələr, əlavə korridorlar və relyef şablonları layihə faylında saxlanılır. Onlardan heç biri istifadə olunmayan layihə əvvəlki kimi saxlanılır və köhnə CivilCraft versiyaları şablonları istifadə edən layihəni açır (onlar şablonları nəzərə almır və korridorun öz yığımını qurur).
