---
title: Miqyasa görə bitki qrafikası, öz simvollarınız və 3D bitkilər
summary: Bitkilərin hər çəkilmə miqyasında və təfərrüat səviyyəsində planda necə çəkildiyi və bitki qeydinin öz simvolunu (SVG və ya DXF/DWG bloku) və öz 3D modelini (OBJ, STL və ya GLB) necə aldığı.
keywords: bitki qrafikası, bitki simvolu, miqyasa görə simvol, təfərrüat səviyyəsi, sadə dairə, kontur, ətraflı simvol, öz simvolu, blok, svg, dxf, dwg, 3D bitki, öz 3D modeli, obj, stl, glb, gltf, ağac modeli, bitkilər 3D-də
from: 875837d9
---

## Miqyasa görə plan simvolları

Abadlaşdırma › {{ui:Daha çox}} › {{ui:Bitki qrafikası}} bitkilərin planda necə çəkiləcəyini təyin edir. **Avtomatik, miqyasa görə** çəkiliş miqyasından üç səviyyədən birini seçir:

- **Sadə dairə** (1:500-dən kobud): bitkinin yayılmasında dairə.
- **Mərkəzli kontur** (1:500-dən 1:200-ə qədər): dairə və kiçik mərkəz xaçı.
- **Ətraflı simvol** (1:200-dən incə): qeydin öz simvolu varsa o, yoxsa daxili simvol.

İki miqyası **Sadə başlanğıc 1:** və **Kontur başlanğıc 1:** ilə dəyişin, ya da hər miqyas üçün bir səviyyə seçin. **Vərəqlər** dialoqunda hər vərəq dəstinin öz **Planda bitki təfərrüatı** var, belə ki 1:500 sahə planı və 1:100 əkin planı fərqli ola bilər. Parametrlər layihə ilə birlikdə saxlanılır.

## Öz simvolunuz

Bitkilər bölməsində bitki seçin və {{ui:Öz simvolu…}} düyməsini basın. SVG və ya DXF və ya DWG çertyojunun bloku oxunur (çertyojda bir neçə blok varsa birini seçirsiniz). Simvol bitkinin yayılmasına uyğunlaşdırılır və ətraflı səviyyədə çəkilir. Layihədə saxlanılır, buna görə fayl onunla birlikdə hərəkət edir.

- SVG-dən xətlər, polixətlər, çoxbucaqlılar, düzbucaqlılar, dairələr, ellipslər və yollar oxunur. Skriptlər, üslublar, keçidlər və şəkillər heç vaxt yoxlanılmır. Çevirmələr tətbiq olunmur: fayldə olduqda sizə bildirilir, ona görə də əvvəlcə çertyoj proqramınızda onları düzləşdirin.
- Limitlər: 512 KB SVG və 2000 forma. Daha böyük fayl səbəbi göstərilməklə rədd edilir.

## Öz 3D bitkiniz

Eyni qeyddə {{ui:Öz 3D modeli…}} **OBJ**, **STL** və ya **GLB** faylını oxuyur. Sonra Bitki qrafikasında **3D-də bitkilər** parametrini **Hər qeydin öz modeli** edin: həmin qeydin hər bitkisi öz modelini hündürlük və yayılmaya uyğun ölçüdə göstərir. Öz modeli olmayan qeydlər daxili formaları saxlayır. Böyük sahələrin sürətli baxışı üçün **Sadə kütlələr** seçin.

GLB yalnız forması üçün oxunur:

- Modelin ehtiyac duyduğu hər şey .glb faylının içində olmalıdır. Başqa fayllara istinad edən model (ayrı .bin və ya ünvanla şəkillər) rədd edilir: heç nə yüklənmir.
- Sıxılmış və ya paketlənmiş həndəsə (Draco, meshopt, kvantlaşdırılmış mövqelər) oxunmur. Sıxılmadan ixrac edin.
- Fayldakı teksturalar və rənglər istifadə olunmur: model bitkinin öz rəngi ilə çəkilir. Teksturalar yenə də yoxlanılır və tərəfi 4096 pikseldən böyük tekstura rədd edilir.
- Limitlər: 32 MB fayl, 50 000 üçbucaq (bir hissənin bir neçə dəfə yerləşdirilmiş hər nüsxəsi də sayılır), 64 şəkil və 16 MB şəkil.

Hər limit faylı səbəbi göstərməklə rədd edir; yarımçıq oxunan heç nə saxlanılmır. Bir geri qaytarma addımı qeydə simvol və ya model verir, {{ui:Öz simvolunu sil}} və ya {{ui:Öz 3D modelini sil}} isə onu geri götürür.

Qeydin özü üçün bax: [Bitki qeydləri](topic:plant-records) və [Məkanı 3D-də görmək](topic:site-3d).
