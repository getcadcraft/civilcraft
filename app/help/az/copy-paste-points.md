---
title: Geodezik nöqtələri seçin, kopyalayın və yapışdırın
summary: Geodezik nöqtələri klikləmə, Shift və pəncərə ilə və ya hamısını birdən seçin; onları yeni, heç vaxt toqquşmayan nöqtə nömrələri ilə kopyalayın, kəsin, yapışdırın, yerində yapışdırın, dublikat yaradın və silin; nöqtə sətirlərini elektron cədvələ və ya ondan yapışdırın.
keywords: kopyala, yapışdır, kəs, dublikat, nöqtələri sil, nöqtələri seç, hamısını seç, pəncərə, pəncərə seçimi, mübadilə buferi, elektron cədvəl, csv, nömrələri yenidən ver, nöqtə nömrələri, yerində yapışdır, klon, nişanlama
from: 78a6aea7
---

Geodezik nöqtələri layihə daxilində, iki brauzer sekmesi arasında və elektron cədvələ və ya ondan kopyalayıb yapışdırmaq olar. Hər dəyişiklik bir geri qaytarma addımıdır və səth yeni nöqtələrdən dərhal yenidən qurulur.

## Nöqtələri seçin

{{ui:Select}} ({{key:V}}) ilə:

- Nöqtəni seçmək üçün **klikləyin** (yalnız onu). Onun nömrələri **Xüsusiyyətlər** altında göstərilir.
- {{key:Shift}} və **klik** nöqtəni seçimə əlavə edir və ya seçimdən çıxarır.
- {{key:Shift}} və **sürüşdürmə** içində nöqtələri olan bir çərçivə çəkir: içəridəki nöqtələr seçimə əlavə olunur. Çərçivəni nöqtələrin ətrafında çəksəniz, o, kəmənd olur; bax [Geodezik nöqtələrin kəmənd seçimi](topic:lasso-selection). {{key:Shift}} olmadan sürüşdürmə həmişə olduğu kimi planı sürüşdürür.
- {{key:Mod+A}} (və ya {{ui:More}} › {{ui:Select all points}}) bütün nöqtələri seçir.
- {{key:Esc}} (və ya {{ui:More}} › {{ui:Select none}}) seçimi təmizləyir.

Seçilmiş nöqtələrin ətrafında halqa olur. Birdən çox seçildikdə **Xüsusiyyətlər** onların sayını, nömrələrini, yüksəklik diapazonunu və qruplarını göstərir.

## Kopyalayın, kəsin və silin

- {{ui:Copy}} və ya {{key:Mod+C}} seçilmiş nöqtələri kopyalayır. CivilCraft kopyanı saxlayır və eyni zamanda onu sistem mübadilə buferinə nöqtə sətirləri kimi qoyur, beləliklə onu birbaşa elektron cədvələ və ya mətn faylına yapışdıra bilərsiniz.
- {{ui:More}} › {{ui:Cut}} və ya {{key:Mod+X}} onları kopyalayır və silir, bir addımda.
- {{ui:More}} › {{ui:Delete}} və ya {{key:Delete}} onları silir. {{key:Mod+Z}} onları geri gətirir.

Sətirlər belədir: nöqtə, şimal, şərq, yüksəklik, təsvir (P,N,E,Z,D), vergüllə ayrılmış və üç onluq rəqəmlə. Əvvəl şərqi, sonra şimalı almaq üçün [CivilCraft parametrləri](topic:settings) daxilində **Nöqtə sətirləri** seçimini təyin edin. Elektron cədvəlin formul kimi qəbul edəcəyi təsvir (= , + , - və ya @ ilə başlayan) onun önünə apostrof alır, beləliklə mətn olaraq qalır.

## Yapışdırın

1. {{key:Mod+V}} basın və ya {{ui:Paste}} klikləyin. Nöqtələr kiçik xaç kimi göstəricini izləyir, onlar gəldikləri yerə nöqtəli xətt ilə bağlanır.
2. Onların gedəcəyi yeri klikləyin. Kopyalanmış nöqtələrin ortası kliklədiyiniz yerə düşür.
3. Və ya onları öz koordinatlarında yerləşdirmək üçün {{key:Enter}} basın, ləğv etmək üçün {{key:Esc}}.

{{ui:More}} › {{ui:Paste in place}} və ya {{key:Mod+Shift+V}} nöqtələri dərhal onların öz koordinatlarında yapışdırır. Yapışdırılmış nöqtələr sonradan seçilmiş olur, beləliklə onları yenidən kopyalaya, köçürə və ya silə bilərsiniz.

:::note
Alətlər panelindəki {{ui:Paste}} düyməsinə klikləmək sistem mübadilə buferini oxuyur. İlk dəfə brauzer CivilCraft-ın mübadilə buferini görməsinə icazə istəyə bilər. Rədd etsəniz, alət düyməsi yalnız CivilCraft-ın öz kopyasını yapışdırır; {{key:Mod+V}} isə icazə soruşmadan elektron cədvəldən sətirləri yapışdırmağa davam edir.
:::

## Nöqtə nömrələri heç vaxt toqquşmır

İki nöqtə heç vaxt eyni nömrəni paylaşmır. Yapışdırdıqda:

- Yapışdırılan nöqtə, layihədə heç bir nöqtə onu istifadə etmirsə, öz nömrəsini saxlayır. Beləliklə **Kəs** əməliyyatından sonra nöqtələr öz nömrələri ilə geri yapışır və başqa layihədən kopyalanmış nöqtələr, boş olduqda, öz nömrələrini saxlayır.
- Nömrəsi tutulmuş yapışdırılan nöqtə yeni tam ədəd alır: istifadədə olan ən böyük nömrədən bir çox, yuxarı sayaraq.
- Status paneli baş verənləri deyir, məsələn "1 öz nömrəsini saxladı; 9 yeni nömrə aldı: 10–18 oldu 277–285".

[CivilCraft parametrləri](topic:settings) daxilində **Həmişə yeni nömrələr** seçə bilərsiniz və yeni nömrələrin başlayacağı ədədi, məsələn layihə nöqtələri üçün 5000.

:::warning
Səthi **sınma xətti** kimi quran nöqtə qrupları nöqtələrini nömrə ardıcıllığı ilə birləşdirir. Sınma xəttinin yapışdırılmış nöqtə surətləri (məsələn FL ölçüləri) yeni, daha böyük nömrələr alır və həmin sınma xəttinin sonuna birləşir, ola bilsin uzun sıçrayışla. Belə nöqtələri yapışdırdıqdan sonra planı yoxlayın, ya da onların qrupunu {{ui:Points}} olaraq təyin edin.
:::

## Dublikat yaradın

{{ui:More}} › {{ui:Duplicate}} və ya {{key:Mod+D}} seçilmiş nöqtələrin göstəricini izləyən surətini yaradır: onun gedəcəyi yeri klikləyin. Surətlər həmişə yeni nömrələr alır və CivilCraft-ın mübadilə buferi olduğu kimi qalır.

## Elektron cədvəldən və ya mətn faylından

Elektron cədvəldə nöqtə sətirlərini (nöqtə, şimal, şərq, yüksəklik, təsvir) seçin və kopyalayın. CivilCraft-da {{key:Mod+V}} basın və yerləri klikləyin, ya da {{key:Mod+Shift+V}} basın ki, onlar öz koordinatlarında yerləşsin — real geodezik məlumat üçün adətən məhz bu lazımdır.

Sətirlər tam olaraq [nöqtə faylı](topic:point-file-formats) kimi oxunur: vergül, tabulyasiya və ya boşluq, varsa başlıq sətri. Başlıq olmadıqda sütun sırası [CivilCraft parametrləri](topic:settings) daxilində **Nöqtə sətirləri**-dən gəlir.

Hər ikisi olduqda CivilCraft yenisinə görə qərar verir: mübadilə buferindəki, CivilCraft-ın son kopyasından fərqli olan sətirlər daha sonra kopyalanıb, buna görə də onlar yapışdırılır. Nöqtə olmayan mətn nəzərə alınmır və CivilCraft-ın öz kopyası yapışdırılır.

## Layihələr və sekmələr arasında

Kopya bu brauzerdə saxlanılır, buna görə də CivilCraft-ın ikinci sekmesi birinci sekmə bağlandıqdan sonra da onu yapışdıra bilər. Metr layihəsində kopyalanmış və futla layihəyə yapışdırılmış nöqtələr nömrələrini olduğu kimi saxlayır: heç nə çevrilmir və status paneli bunu deyir.

## Nə kopyalanmır

Hələlik yalnız geodezik nöqtələr kopyalanır. Trassalar, platformalar, boru şəbəkələri, sınma xətləri və sərhədlər hələ kopyalanıb yapışdırıla bilməz. Yapışdırma mövcud nöqtələri köçürə bilməz: {{ui:Cut}} və yapışdırmanı istifadə edin, ya da nöqtəni bir-bir köçürün ([Geodezik nöqtəni redaktə edin](topic:edit-points)).
