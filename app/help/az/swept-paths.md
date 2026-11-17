---
title: Nəqliyyat vasitəsinin keçid yolları
summary: Üç qoşquya qədər nəqliyyat vasitəsini xüsusiyyət xətti və ya trassa boyunca irəli və ya geri sürün, süpürdüyü sahəni, təkər yollarını, sükanını və harada qatlanma baş verdiyini görün.
keywords: keçid yolu, dönmə yolu, nəqliyyat izləmə, dönmə şablonu, layihə vasitəsi, yük maşını, avtobus, qoşqu, yarımqoşqu, geriyə sürmə, geri manevr, qatlanma, oynaqlılıq, sükan kilidi, kənara sürüşmə, təkər yolu, yükləmə rampası, dönmə radiusu
from: 8caafb8a
---

Keçid yolu nəqliyyat vasitəsini xətt boyunca sürür və onun gövdəsinin keçdiyi torpağı göstərir. Yük maşınının künc dönə bilməsini, yükləmə rampasına çatmasını və ya qoşquya yerə geri manevr etdirməsini, örtükdən çıxmadan, yoxlamaq üçün istifadə edin.

## Nəqliyyat vasitəsini xətt boyunca sürün

1. Nəqliyyat vasitəsinin izlədiyi xətti hərəkət istiqamətində çəkin: xüsusiyyət xətti (qövslər də olar: çəkərkən {{key:C}} basın, bax [Xüsusiyyət xətləri](topic:feature-lines)) və ya trassa.
2. Onu seçin və **Xüsusiyyətlər**ində {{ui:Swept path…}} basın.
3. **Başlanğıc**da nəqliyyat vasitəsi seçin, sonra ölçülərini öz layihə vasitənizdən təyin edin: en, ön konsol, təkərlər arası məsafə (dingil), arxa konsol, iz eni və **Sükan kilidi**. Üç qoşquya qədər əlavə edin, hər birində onun qoşulduğu yer, qoşma nöqtəsindən oxuna qədər uzunluq, konsolları və **Ən böyük oynaqlılıq** olsun.
4. **Hərəkət**i seçin: irəli və ya geri. {{ui:Drive it}} basın.

:::warning
Başlanğıc üçün nəqliyyat vasitələri yer tutucudur, standart deyil. Ölçüləri layihənizin istifadə etdiyi layihə vasitəsindən təyin edin.
:::

## İrəli və geri

| Hərəkət | Xətti nə izləyir | CivilCraft nəyi hesablayır |
|---|---|---|
| **İrəli** | Ön dingilin mərkəzi | Arxa dingil və hər qoşqu hara gedir, sükan bucağı və oynaqlılıq |
| **Geri** | Son dingilin mərkəzi (qoşqunun arxası) | Qarşıdakı hər hissə hara gedir və qoşqunu oraya qoymaq üçün kabinənin sükanı nə tələb edir |

Geri manevr belə yoxlanılır: qoşquun harada olmalı olduğunu deyin, CivilCraft kabinənin buna nail ola biləcəyini deyir.

## Nəticəni oxuyun

Keçid yolu planda narıncı rənglə çəkilir: onun konturu və kəsik xətlə ən kənar təkərlərin yolları. Onu seçin (içinə basın) və **Xüsusiyyətlər**ində görün:

- **Sürülən uzunluq**, ən böyük **Sükan** bucağı və **Oynaqlılıq** onların həddinə qarşı, və **Süpürülən sahə**.
- Xətt boyunca hər problem, məsafəsi ilə: sükan kilidindən keçən, ya da qoşqunun oynaqlılıq həddindən keçən (qatlanır).
- **Xətt boyunca nəqliyyat vasitəsi**: istənilən nöqtədə nəqliyyat vasitəsini görmək üçün sürgünü hərəkət etdirin, orada sükan və oynaqlılığı ilə birlikdə.

Xətti dəyişin və keçid yolu izləyir. {{ui:Edit the vehicle…}} ölçüləri dəyişir; **Hərəkət** irəli və geri arasında keçir. Hər dəyişiklik bir addımdır: {{key:Mod+Z}} onu geri alır. {{key:Delete}} seçilmiş keçid yolunu silir (xətt qalır).

Kontur və təkər yolları PDF, DXF və DWG-yə C-ROAD-SWPT qatında gedir.

## Necə hesablanır

Hər hissə öz arxa dingilinin xətti ətrafında fırlanır və qarşısındakı nöqtə (ön dingil və ya qoşma nöqtəsi) tərəfindən dartılır: keçid yolu yoxlamalarının istifadə etdiyi aşağı sürətli, sürüşməsiz model. Süpürülən sahə hər vəziyyətin gövdə konturlarının birləşməsidir. Sürəti, təkər sürüşməsini, sükanın dönmə vaxtını, sükanlı qoşquları və gövdə altındakı klirensi modelləşdirmir.
