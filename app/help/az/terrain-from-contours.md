---
title: Horizontal xəttlərdən relyef
summary: Horizontal xəritədən yer səthini qurun: xətt qatlarını seçin, hər xəttin hündürlüyünün haradan gəldiyini göstərin, kəsişmələri və təkrarları yoxlayın və qurun. Horizontal xətlər sınma xətlərinə çevrilir, zirvə, dərə və təpələrdəki yastı üçbucaqlar düzəldilir. Şəkildən və ya PDF-dən izlənmiş xəritə iki məlum nöqtə ilə miqyaslana və yerləşdirilə bilər.
keywords: horizontallar, horizontal xətlər, horizontallardan relyef, horizontallardan səth, topoqrafik xəritə, planalma xəritəsi, koordinatsız, sınma xətləri, yastı üçbucaqlar, silsilə, dərə, təpə, kəsişən horizontallar, təkrar horizontallar, horizontal intervalı, xəritəni miqyaslamaq, iki nöqtə, xəritəni yerləşdirmək, DXF, DWG, shapefile
from: e6161653
---

Planalmaçı bəzən horizontal xəritə göndərir: hündürlüyü olan xətlər, lakin nöqtələr yoxdur. CivilCraft mövcud relyefi həmin xətlərdən qurur.

## Horizontalları gətirin

Xəritəni xətt kimi açın: DXF və ya DWG çertyojunu, shapefile və ya GeoJSON (**GIS** › {{ui:Import}}, ya da faylı planın üzərinə buraxın). Xətlər **xəritə qatları** kimi gəlir. **Səth** › {{ui:More}} altında {{ui:Terrain from contours}} seçin.

## Hər hündürlüyün haradan gəldiyini göstərin

Horizontalları saxlayan qatları işarələyin, sonra **Hündürlük mənbəyi**ni seçin:

- {{ui:The lines' own elevations}}: təpə nöqtələrinin hamısı eyni hündürlükdə olan xətt (3D polixətt və ya hündürlüyü olan polixətt). 0-da olan xətt plan xəttidir və hündürlüyü yoxdur.
- Qatın **ədəd sahəsi** (məsələn ELEV), xəritə ilə belə gəlirsə.
- {{ui:A start and an interval, in the order the lines are listed}}: heç bir hündürlüyü olmayan xətlər üçün. Siyahıda birinci xətt **Birinci xəttin hündürlüyü**nü alır, növbəti isə bu üstəgəl **Horizont intervalı** və s. Xətləri aşağıdan yuxarıya siyahıya salın (ya da qatda yenidən sıralayın).

## Yoxlayın, sonra qurun

{{ui:Check}} dəyişiklik olmamışdan əvvəl nəyin səhv olduğunu sözlə siyahıya salır:

- **hündürlüyü olmayan** və ya iki nöqtədən az nöqtəsi olan xətt;
- **təkrar** xətt (eyni forma iki dəfə, hətta əks istiqamətdə çəkilmiş);
- **kəsişən** iki xətt, fərqli hündürlükdə və ya eyni hündürlükdə (özü ilə kəsişən xətt də), yeri ilə;
- **intervala uyğun olmayan** hündürlük (məsələn 1 m xəritədə 105.5 kimi yazı səhvi).

{{ui:Leave out lines that cross another}} işarələyin ki, ən çox digərini kəsən xətt atılsın (sonra növbəti, heç biri kəsişməyənə qədər): hər horizontalı kəsən səhv xətt gedir, horizontallar yox. **Xətləri bu məsafə daxilində sadələşdir** bu məsafədən düz bir xəttə daha yaxın olan təpə nöqtələrini seyrəldir.

{{ui:Build the ground}} xətləri mövcud relyefə sınma xətti kimi əlavə edir (bir geri qaytarma addımı), beləliklə səth hər horizontalın dəqiq içindən keçir. {{ui:Fix flat triangles on ridges, valleys and hilltops}} işarələnəndə və interval verildikdə CivilCraft hər yastı üçbucağın (bütün künclər bir horizontal üzərində olan üçbucaq) daxilinə də nöqtə əlavə edir, onun yanındakı yamacın davam etdiyi hündürlükdə, heç vaxt horizontaldan yarım intervaldan çox uzaqda olmayan. Bu olmadan silsilə zirvələri, dərə dibləri və təpə zirvələri yastı lövhələr kimi çıxır. Test təpəsində həqiqi səthə görə xəta dörddə bir azaldı; silsilədə 40 % azaldı.

## Koordinatsız xəritə

Şəkildən və ya PDF-dən izlənmiş horizontal xəritə üçün **Qatları iki məlum nöqtə ilə miqyaslayın və yerləşdirin** bölməsini açın. Xəritədə iki nöqtə və onların real yerlərini verin; işarələnmiş qatlar miqyaslanır, döndərilir və yerinə uyğunlaşdırılır (bir geri qaytarma addımı; hündürlüklər dəyişmir). Eyni iki nöqtə miqyası (mesajda göstərilir) və fırlanmanı verir.

Səth xəritə qədər yaxşıdır: iki horizontal arasında o, müstəvidir, buna görə aralarındakı real torpaq məlum deyil. Nəticəyə güvənməzdən əvvəl onu nöqtə hündürlükləri ilə yoxlayın.
