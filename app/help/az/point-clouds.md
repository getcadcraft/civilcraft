---
title: Dron və ya skanerdən nöqtə buludları
summary: Nöqtə buludları əlavəsi ilə milyonlarla nöqtədən ibarət LAS və ya LAZ faylını açın, hamısına baxın, təmizləyin, onu zəmin, bitki örtüyü və binalara görə təsnif edin və ondan zəmin, horizontallar və həcmləri qurun.
keywords: nöqtə buludu, las, laz, dron, fotogrammetriya, recap, lidar, skan, zəmin, təsnif, səs-küy, yığın, həcm, kəsim və doldurma, horizontallar, sındırma xətti, eye-dome, ortomozaika, ortho, örtük, xəritə qatı, las ixrac, laz ixrac, sıxmaq
from: e4a4901f
---

Çox adam buna ehtiyac duymur, ona görə bu əlavədir. **Parametrlər › Əlavələr** bölməsində {{ui:Nöqtə buludları}} aktivləşdirin; sağ paneldə {{ui:Nöqtə buludları}} sekmesi görünəcək. Fayl brauzerinizdə oxunur və brauzerinizin öz yaddaşında (və ya seçdiyiniz qovluqda) saxlanılan kafellərə bölünür. **Heç nə yüklənmir.**

:::warning
Bu sekmədə göstərilən hər şey məlumatlarınızdan alınmış rəqəmdir, sertifikat deyil. O, uydurma sahədə sınaqdan keçirilib, hələ real dron planalmasında yox: ilk nəticələri diqqətlə oxuyun və nə tapdığınızı bizə bildirin. Zəmin, horizontallar və həcmlərin dəyərini qeydiyyatdan keçmiş mütəxəssis müəyyən edir.
:::

## Bulud açın

{{ui:Bulud açın}} altında LAS və ya LAZ faylı seçin. Sekmə onun neçə nöqtə saxladığını, koordinat sistemini və vahidlərini, həmçinin qurulma üçün nə qədər yer lazım olduğunu göstərir; {{ui:Buludu qurun}} düyməsinə basın. Qurulma dayandırıla bilər və {{ui:Davam et}} ilə davam edir (eyni faylı yenidən seçin). Fayl heç vaxt dəyişdirilmir. 100 milyon nöqtəli fayl iş stansiyasında bir neçə dəqiqəyə və faylın ölçüsü qədər yerə qurulur.

{{ui:Bu kompüterdə buludlar}} altında buludu açır və ya silirsiniz. {{ui:Buludları qovluqda saxla…}} (Chrome, Edge və Studio tətbiqi) kafelləri seçdiyiniz qovluqda saxlayır, məsələn, Sənədlərdə CadCraft buludlar qovluğunda; beləliklə, 10 GB bulud brauzerin yaddaşına sığmaq məcburiyyətində qalmır. Əvvəllər qurulmuş buludlar qurulduğu yerdə qalır. Brauzer yenidən başladıqdan sonra icazəni yenidən soruşur: {{ui:Qovluğu … yenidən istifadə et}} düyməsinə basın.

## Baxın

{{ui:3D-də baxın}} buludu kobud kafellərdən çəkir və yaxınlaşdıqca dəqiqləşdirir, eyni anda heç vaxt {{ui:Çəkilən ən çox nöqtə}} sayından çox olmur (2.5 milyon; telefonda 500 min). Rəngi faylın öz rəngi, hündürlük, sinif, intensivlik və ya qalıqa görə verin. {{ui:Eye-dome işıqlandırma}} kənarları dərinliyə görə kölgələndirir ki, normallar olmadan forma aydın görünsün (telefonda söndürülüb); {{ui:Nöqtələr məsafə ilə kiçilir}} uzaq nöqtələri kiçildir, yaxın olanları böyüdür; {{ui:Nöqtənin ölçüsü}} ölçünü təyin edir. Plan buludu çertyojunuzun altında raster kimi göstərir və **bir hissəsinə yaxınlaşdıqda dəqiqləşir**.

## Təmizləyin

{{ui:Təmizlə}} altında planda lasso, düzbucaqlı və ya çoxbucaqlı çəkin (və ya 3D-də yuxarı görünüşdən: 3D-də kontur birbaşa aşağı götürülür, ona görə yalnız yuxarıdan dəqiq olur). Sekmə tətbiq etməzdən **əvvəl** içəridə neçə nöqtənin olduğunu göstərir: {{ui:Bu nöqtələri sil}}, {{ui:Sinfini dəyiş}}, {{ui:Silinmiş nöqtələri bərpa et}} və ya {{ui:Bu sərhədə görə kəs}}. {{ui:Geri qaytar}} və {{ui:Təkrarla}} redaktə jurnalında hərəkət edir; fayl özü heç vaxt dəyişdirilmir. {{ui:Səs-küy filtri…}} səhv nöqtələri aşağı nöqtələr (sinif 7) və ya yüksək səs-küy (sinif 18) kimi qeyd edir.

## Təsnif edin

{{ui:Zəmini tapın}} nöqtələri kafel-kafel işləyir və zəmin (sinif 2) və aşağı nöqtələri qeyd edir; tolerantlıq 0.15 m-dir, və ya planalma dəqiqliyi açarı ilə 0.08 m. Uyğunsuzluq göstərən kafel tikişlərini bildirir. Sonra {{ui:Bitki örtüyü və binaları təsnif edin}} zəminə görə hündürlükdən və ətrafın necə düz olmasından asılı olaraq aşağı, orta və yüksək bitki örtüyünü və binaları qeyd edir. Maşın öyrənməsi yoxdur, ona görə ağacların altında düz damlı anbar yanlış ola bilər: baxın.

## Zəmin, horizontallar, sındırma xətləri

{{ui:Zəmini qurun}} mövcud zəmini zəmin nöqtələrindən yaradır və layihəyə LAS idxalı kimi əlavə edir (bir geri qaytarma addımı). Sonra nöqtələri onunla müqayisə edir: orta, RMS, 95-ci faiz, tolerantlığa uyğun pay və ən çox fərqlənən on yer, hər biri {{ui:Oraya keç}} ilə. {{ui:Qalıq}} ilə rəngləndirmək zəminin və buludun harada uyğunsuz olduğunu göstərir.

**Sındırma xətti** (bordür, xəndək və ya yamacın üstü) buludda seçilir: 3D görünüşündə {{ui:Buludda sındırma xəttini seçin}} hər klikdə ən yaxın çəkilmiş nöqtəni götürür, {{ui:Planda sındırma xəttini seçin}} isə hər klik altında ən yaxın bulud nöqtəsini (əvvəl zəmin) götürür; ikiqat klik və ya Enter xətti bitirir. Növbəti {{ui:Zəmini qurun}} onu istifadə edir. {{ui:Horizontalları göstər}} horizontalları kiçik şəkildə buludun üzərində çəkir və layihənin intervalını təyin edir.

## Həcmlər

{{ui:Yığının həcmi…}} çəkdiyiniz sərhəd daxilində əsas üzərindəki səthin həcmini hesablayır. Sərhədi yığının ətrafında düz zəmində çəkin və əsası seçin: ən aşağı sərhəd nöqtəsi, müstəvi, hamar əyri əsas, sərhəd boyu səth və ya yazdığınız səviyyə. Meylli və ya əyri zəmində müstəvi və ya əyri əsasdan istifadə edin; ən aşağı nöqtə çox yüksək oxunur. Digərlərindən yuxarı duran sərhəd nöqtələri (xətt üzərindəki ağac) əsasdan kənarda qalır. {{ui:Uçuşdan uçuşa}} iki bulud arasında kəsim və doldurma verir. Hər ikisi CSV kimi saxlana bilər.

## Ortomozaika

{{ui:Ortomozaika (yuxarıdan şəkil)}} altında varsa dronun ortomozaikasını onun dünya faylı və `.prj` ilə birlikdə seçin: GeoTIFF, və ya PNG və ya JPEG. O, layihənin **xəritə qatı** olur, beləliklə plan onu çertyojunuzun altında göstərir, 3D görünüşü ({{ui:Xəritə}} rəngi) isə qurduğunuz zəmin üzərinə çəkir, ona görə əvvəl {{ui:Zəmini qurun}} edin. Sekmə şəkilin bulud hissəsinin nə qədərini əhatə etdiyini göstərir və heç nə əhatə etmədikdə xəbərdarlıq edir: adi səbəb fərqli koordinat sistemidir, ona görə onunla birlikdə `.prj` faylını verin. `.prj` olmadıqda proqram koordinatların harada olduğunu soruşur. Şəkil layihə faylının içində saxlanılır; 200 MB-dan böyük GeoTIFF rədd edilir, çox böyük mozaika isə 16 megapikselə endirilir, ona görə böyük planalma üçün əvvəl mozaikanı sahəyə görə kəsin.

## İxrac

{{ui:İxrac}} təmizlənmiş, təsnif edilmiş buludu yeni fayl kimi yazır (bütün nöqtələr, təmiz siniflər və ya yalnız zəmin). {{ui:Fayl növü}} altında seçin:

- **LAS 1.4 (sıxılmamış)**: nöqtə formatı 6, və ya rənglə 7.
- **LAZ (sıxılmış)**: eyni nöqtələr itkisiz sıxılır, beləliklə hər nöqtə dəqiq geri gəlir. LAS 1.4 faylında nöqtə formatı 0, və ya rənglə 2 kimi yazılır. Uydurma 300 m sahədə LAZ, LAS 1.4 faylının təxminən beşdə biri ölçüsündə idi. LAZ formatları 0 və 2 yalnız 0–31 siniflərini saxlayır: yüksək sinifli nöqtə olan bulud mesajla rədd edilir, ona görə belə buludu LAS 1.4 kimi ixrac edin.

LAZ CadCraft-ın öz sıxıcısı ilə, dərc olunmuş LAZ spesifikasiyası əsasında yazılır. Öz oxuyucumuzu və iki müstəqil LAZ oxuyucusunu (tətbiqin LAZ fayllarını açmaq üçün istifadə etdiyi laz-perf və lazrs ilə laspy) yoxladıq: hər nöqtəni dəqiq geri oxuyurlar və laspy ilə yaradılmış LAZ faylları nöqtələri yenidən yazdıqda bayt-bayt eyni çıxır. Digər proqramlar hələ sınanmayıb, ona görə biri faylı açmasa, bizə hansının olduğunu bildirin.

Brauzer faylı yazarkən yaza bildikdə, əvvəl faylı seçirsiniz və çox böyük bulud yaddaşda toplanmaq əvəzinə kafel-kafel ora yazılır; əks halda fayl toplanır və yüklənir, bu bir neçə yüz meqabayta qədər yaxşıdır.

## Nəyi etmir

Yalnız LAS və LAZ oxuyur (E57, PLY və PCD bu sekmədə hələ bağlı deyil və bir uçuşun bir neçə faylı birləşdirilmir), buludu yenidən proyeksiya etmir (layihənin sistemi və metrlər fərz edilir), Autodesk-in RCP və ya RCS fayllarını oxumur, fotoşəkillərdən səth yaratmır və dirəkləri, bordürləri və ya boruları özü tapmır.
