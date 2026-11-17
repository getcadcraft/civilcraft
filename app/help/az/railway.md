---
title: Dəmir yolu yolunun layihələndirilməsi
summary: Trassanı dəmir yoluna çevirin: relsin keçid növləri (klotoid, kub parabola, Bloss, Helmert, sinus yarımdalğası, sinus), hər əyridə tarazlıq yan əyilməsi ilə yan əyilmə, çatışmazlıq və artıqlıq, yan əyilmə və yol həndəsəsi həddləri xəbərdarlıq kimi, stansiya üzrə stəllər və çarpaz keçidlər, boyunca çəkilən gabarit zərfi və dəhliz kimi qurulan, relslər, şpallar və balast yatağı olan yol: planda, kəsiklərdə, profilində, 3D-də və miqdarlarda.
keywords: dəmir yolu, rels, dəmir yol, yol, qatar, metro, tramvay, yan əyilmə, yan əyilmə çatışmazlığı, yan əyilmə artıqlığı, tarazlıq yan əyilməsi, keçid, keçid əyrisi, klotoid, kub parabola, bloss, helmert, sinus yarımdalğası, kosinus, yol eni, standart yol eni, geniş yol eni, metrlik yol eni, dar yol eni, şpal, balast, alt balast, əsas yataq, yol kənarı, yol mərkəzləri arası məsafə, 60E1, 54E1, UIC60, 115RE, 136RE, yan əyilmənin meyli, yan əyilmənin dəyişmə sürəti, stəll, stəll nömrəsi, çarpaz keçid, krestovina, ötürmə uzunluğu, bağlayıcı əyri, ayrılma sürəti, gabarit, gabarit zərfi, konstruktiv gabarit, platforma, platforma boşluğu, yol aralığı, meyl, şaquli əyri, minimal radius, LandXML yan əyilməsi
from: 99de9745
---

Istənilən trassa dəmir yolu yolu ola bilər. Onun əyriləri bu halda relsin keçidlərini və yan əyilməsini (relsin üst səviyyəsinin fərqi) alır, dəhliz isə yol kimi qurulur: relslər şpallar üzərində, balast yatağında, avtomobil yolu kimi zəmin üzərinə planlaşdırılmış halda. Stəllər və çarpaz keçidlər stansiya üzrə ona əlavə olunur, gabarit zərfi isə boyunca çəkilə və yolun yanındakı obyektlərlə yoxlana bilər.

Aşağıdakı bütün rəqəmlər **yer tutucudur**, standart deyil. Dəmir yolları həddləri xətt sürətinə, yol növünə və ölkəyə görə müəyyən edir; onları öz dəmir yolunuzun standartına görə təyin edin. CivilCraft heç bir milli cədvəl ilə gəlmir.

## Trassanı dəmir yoluna çevirin

1. Trassanı seçin və **Xüsusiyyətlər** bölməsində **Dəmir yolu** hissəsini tapın.
2. **Bu trassa dəmir yolu yoludur** qutusunu işarələyin. Hər dəyişiklik bir geri qaytarma addımıdır.
3. Trassanın Xüsusiyyətlərinin yuxarısında **Layihə sürəti** təyin edin: yan əyilmənin yoxlanıldığı xətt sürətidir. **Ən yavaş qatarlar** (Dəmir yolu bölməsində) yan əyilmə artıqlığının yoxlanıldığı sürətdir.

## Keçidlər

Hər əyriyə PI cədvəlində hər iki ucunda spiral uzunluğu verin (**Giriş spiralı**, **Çıxış spiralı**), sonra Dəmir yolu bölməsinin əyrilər cədvəlində və ya **Hər əyri üçün keçid** seçimi ilə növünü seçin:

| Növ | Keçid boyunca əyrilik |
|---|---|
| Klotoid | bərabər artır (avtomobil yolu spiralı kimi) |
| Kub parabola | y = x³ / (6·R·L), L tangens boyunca ölçülür; əyrinin özü bir az uzundur |
| Bloss | tam əyriliyin 3u² − 2u³-ü (u = uzunluğun payı): yumşaq başlayır və yumşaq bitir |
| Helmert | iki parabola: əvvəl 2u², sonra 1 − 2(1 − u)² |
| Sinus yarımdalğası | (1 − cos πu) / 2 |
| Sinus | u − sin(2πu) / 2π |

Kub paraboladan başqa hamısı klotoid kimi L / 2R qədər dönür. Stansiyalar həqiqi uzunluq boyunca hesablanır. LandXML növü saxlayır (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Yan əyilmə

Hər əyrinin **Yan əyilmə**sini millimetrlə yazın. Cədvəl hər əyri üçün göstərir:

- **Tarazlıq** yan əyilməsi = G·v² / (g·R), burada G relslərin mərkəzləri arasındakı məsafədir (**Rels mərkəzləri**: yol eni və relsin baş eninin cəmi, əgər siz özünüz yazmasanız). G = 1500 mm olduqda bu, tanış 11.8·V² / R düsturudur (V km/saatla, R metrlə).
- **Çatışmazlıq** = xətt sürətində tarazlıq yan əyilməsi − tətbiq olunan yan əyilmə.
- **Artıqlıq** = tətbiq olunan yan əyilmə − ən yavaş qatarların sürətində tarazlıq yan əyilməsi.
- **Artım**: yan əyilmə artımı zolaqları boyunca ən dik yan əyilmə meyli, mm metrə.

Yan əyilmə hər keçid boyunca artır və əyrilik kimi formalanır: klotoid və ya kub parabola üçün düz, Bloss üçün Bloss formasında və s. Keçidi olmayan əyri ucu, yan əyilmə meyli həddinin tələb etdiyi qədər əvvəlki düz hissədə artır və bunu göstərir: bu halda yan əyilmə əyriliyin dəyişdiyi yerdə dəyişmir.

**Yan əyilmə hansı ətrafda fırlanır** bölməsi layihə profilində hansı relsin yerdə qaldığını göstərir: **aşağı rels** (adi hal), **daxili rels** və ya **yol mərkəzi** (hər rels yan əyilmənin yarısı qədər hərəkət edir). Layihə profili orada relsin üst səviyyəsidir.

**Yan əyilmə diaqramı** stansiyalar boyunca hər relsin hündürlüyünü profil üzərində çəkir; profil görünüşü və plan və profil vərəqləri eyni məlumatı profilin altında zolaq kimi alır.

## Yan əyilmə həddləri və xəbərdarlıqlar

**Ən böyük tətbiq olunan yan əyilmə**, **Ən böyük yan əyilmə çatışmazlığı**, **Ən böyük yan əyilmə artıqlığı**, **Ən dik yan əyilmə meyli** və **Ən sürətli yan əyilmə dəyişməsi** (xətt sürətində meyl, mm/s) hər əyridə yoxlanılır. Həddi keçən qiymət Dəmir yolu bölməsində və Problemlər panelində xəbərdarlıq kimi göstərilir, tapılan qiymət və hədd ilə birlikdə. Layihə sürəti yoxdursa, çatışmazlıq və dəyişmə sürəti yoxlanılmır (bu barədə qeyd göstərilir).

## Yol

**Yol eni** (standart 1435 mm, geniş, metrlik və ya dar hazır variantlar, ya da öz ölçünüz), **Rels kəsiyi** (60E1, 54E1, 49E1, 115RE, 136RE: yalnız dərc olunmuş ölçüləri), **Yolların sayı** və onların **Yol mərkəzləri** arası məsafəsini təyin edin, sonra **Şpallar və balast**: şpal materialı, uzunluğu, eni, dərinliyi və aralığı; şpalın altında balast dərinliyi (aşağı relsdə), çiyin, meyl, balastın üstünün şpalların altından nə qədər aşağıda olması; alt balast dərinliyi, balastın ayaq xətti arxasındakı kənar boşluq (cess) və əsas yatağın eninə meyli.

**Yolu qur** düyməsinə basın. O, trassanın dəhlizinə tətbiq olunur və layihə profili boyunca yol kimi qurulur: relslər və şpallar yan əyilmə ilə birlikdə əyilir, əsas yataq isə əyilmir. Kəsikdə dəhlizin kəsilməsindən və doldurma yamaclarından kənar yamaclar çəkilir, yol isə avtomobil yolu kimi təklif olunan səthə qədər hamarlanır.

- **Plan**: hər yolun hər iki relsi (C-RAIL-TRAK qatı) və birdən çox yol olduqda hər yolun mərkəzi (C-RAIL-CNTR) ekranda, DXF, DWG, PDF və plan və profil vərəqlərində.
- **Kəsiklər**: şpallar, relslər, balastın və alt balastın aşağı səthləri hər kəsikdə.
- **3D**: relslər, hər şpal və balast yatağı (Göstər › Yol), həmçinin GLB, OBJ və USD formatlarında.
- **Miqdarlar**: yolun uzunluğu, relslər (hər yolun hər iki relsi, hər yolun öz xətti boyunca), şpallar, balast yatağı və şpalsız balast, alt balast; kəsiklər arasında orta son sahələr üsulu ilə.

## Yol həndəsəsinin yoxlanışı

Yan əyilmədən əlavə, Dəmir yolu bölməsi xətti daha altı həddə görə yoxlayır (hamısı yer tutucudur, hamısı sizin tənzimləməyinizdədir):

- Layihə profilinin **Ən dik meyli**, mm metrlə.
- **Ən kiçik şaquli əyri radiusu**, R ≥ k·V² əmsalı kimi (R metrlə, V km/saatla). İki meyl arasında L uzunluğunda parabolik şaquli əyrinin radiusu L-nin meylin dəyişməsinə bölünməsinə bərabərdir.
- **Ən qısa şaquli əyri**.
- **Planda ən kiçik əyri radiusu** (0 yoxlamanı söndürür).
- **Ən qısa qövs və ya düz hissə**, xətt sürətində hərəkət saniyəsi ilə: bu məsafədən qısa dairəvi qövs və ya iki əyri arasındakı düz hissə xəbərdarlıq verir. 1.8 san. tanış qaydadır: "km/saatla sürətin yarısı, metrlə".
- **Keçid boyunca yan əyilmə çatışmazlığının dəyişmə sürəti**, xətt sürətində mm/s ilə.

**Yol həndəsəsi** tapılan ən dik meyli və hər şaquli əyrini onun radiusu və xətt sürətinin tələb etdiyi radiusla birlikdə sadalayır. Keçiddə və ya yan əyilmə artımında olan şaquli əyri üçün qeyd göstərilir. Layihə profili və ya layihə sürəti yoxdursa, bunları tələb edən yoxlamalar ötürülür və bu barədə qeyd göstərilir.

## Stəllər və çarpaz keçidlər

**Stəllər və çarpaz keçidlər** bölməsində **Stəll əlavə et** düyməsinə basın. Stəll ən uzun düz hissəyə yerləşdirilir; cədvəldə təyin edin:

- **Stəll ucunun stansiyası**: stəllin bu trassada başladığı yer.
- **Krestovina**: krestovina nömrəsi N (1:N). Krestovina bucağı 2·atan(1 / 2N)-dir.
- **Tərəf**: sol və ya sağ, stansiya artımına baxaraq.
- **Çarpaz keçid məsafəsi** metrlə: 0-dan böyük olduqda stəll bu məsafədə olan paralel yola çarpaz keçidə çevrilir (iki stəll və onların arasındakı düz hissə).

Cədvəl **Ötürmə uzunluğu** (stəll ucundan krestovinaya), bağlayıcı əyrinin **Radiusu** və bu radiusun icazə verdiyi **Ayrılma sürəti**ni göstərir (yan əyilmə çatışmazlığı həddinizlə və yan əyilməsiz). **Yolunu yarat** ayrılan marşrutu öz trassasına çevirir (stəll, bağlayıcı əyri, sonra krestovina bucağı ilə düz) eyni dəmir yolu tənzimləmələri ilə, uzadılmağa hazır.

Plan hər stəllin iki ayrılan relsini, mərkəz xəttini, stəll ucunda və krestovinada işarəni və "1:N" yazısını çəkir (C-RAIL-TURN qatı); ekranda və DXF, DWG, PDF və vərəqlərdə. 3D görünüş ayrılan relsləri əsas yolun səviyyəsində çəkir.

Forma **yer tutucudur**: düz stəll və krestovina nömrəsindən asılı bir bağlayıcı əyri. Real stəll dəmir yolunun standartına və istehsalçının çertyoju üzrə qurulur. Xəbərdarlıqlar: trassadan kənara çıxan, əyri, keçid, yan əyilmə və ya şaquli əyri üzərində olan və ya başqa stəllə üst-üstə düşən stəll; və xətt sürətinin onun ayrılma sürətindən yüksək olduğu hallarda qeyd.

## Gabarit zərfi

**Bu yol boyunca gabarit zərfini çək** qutusunu işarələyin. **Kontur** seçin (iki yer tutucu forma, ya da **Öz konturunuz**, hər sətirdə bir nöqtə kimi yazılan: yol mərkəzindən ofset, sonra relsin üst səviyyəsindən hündürlük, metrlə), **Vaqonun uzunluğu** və **Bogi mərkəzləri**, varsa **Platforma kənarı** (tərəf, yol mərkəzindən məsafə, relsdən hündürlük).

Hər stansiyada kontur aşağı relsə görə yan əyilmə ilə əyilir və əyri səbəbindən genişlənir: vaqonun ortası b² / 8R qədər içəri, uclar (L² − b²) / 8R qədər kənara çıxır (b bogi mərkəzləri, L vaqonun uzunluğu, R həmin yerdə radius, keçidi izləyərək). Blok düz hissədə və ən geniş olan yerdə kəsiyi çəkir və siyahıya salır:

- **ən geniş zərf** və harada olduğu,
- **yol mərkəzləri** qonşu iki zərfin tələb etdiyi mərkəzlərlə müqayisədə,
- **platforma kənarında** qalan boşluq və ya nə qədər içəridə olduğu,
- **zərfin içində** tapılan hər xarakterik xətt, boru konstruksiyası və başqa dəmir yolu trassası.

Hündürlüyü olan xarakterik xətt onun relsin üstündəki hündürlüyündə konturla müqayisə olunur; layihə profili olmadan və ya hündürlüyü olmayan nöqtə üçün yalnız planda qiymətləndirilir və siyahıda bu göstərilir. Planda zərfin iki kənarı (C-RAIL-CLRN qatı) çəkilir, zərfin içindəki hər şeyin yerində xaç işarəsi olur.

Təklif olunan konturlar **yer tutucudur, heç bir dəmir yolunun gabaritı deyil**. Nəticəyə güvənməzdən əvvəl öz dəmir yolunuzun konstruktiv gabaritini yazın.

## Başqa proqramlarda

- **LandXML**: dəmir yolu trassası öz keçidləri (spiType) və `Cant` bloku ilə yazılır: yol eni, fırlanma nöqtəsi, xətt sürəti və hər yan əyilmə artımının başladığı və bitdiyi stansiya, tətbiq olunan yan əyilmə, tarazlıq yan əyilməsi və çatışmazlıqla birlikdə. `Cant` bloku olan LandXML faylı açıldıqda həmin trassa həmin yan əyilmələrlə dəmir yoluna çevrilir.
- **IFC**: yan əyilmə seqmentləri ilə trassa, relslər, şpallar, balast və alt balast.

## Hələ qurulmayıb

IFC ixracında stəllər, tək bağlayıcı əyridən kənar stəll ailələri (əyri stəllər, dönən burunlu krestovinalar, sürüşmə və romblar), kinematik gabarit qaydaları (zərf əyrinin sürüşməsi ilə sabit konturdur), yuxarı xətlər və siqnalizasiya.

**Hansı standart.** Dəmir yolu bölməsində "İstinad ediləcək standart" Heç biri və ya Avropa seçir (UIC və EN). Avropanı seçdikdə, Avropa layihəsinin istinad etdiyi sənədlər göstərilir (trassa parametrləri üçün EN 13803, stəllər və çarpaz keçidlər üçün EN 13232, gabaritlər üçün EN 15273, yolun həndəsə keyfiyyəti üçün EN 13848) və hər hədd üçün onun hansı bəndə aid olduğunu yazmaq üçün qutu verilir. Heç bir standartın rəqəmi daxil edilməyib: yan əyilmə, çatışmazlıq, artıqlıq, meyl və dəyişmə həddləri, stəll həndəsəsi və konstruktiv gabarit hələ də yer tutucudur, pəncərə də bunu göstərir. Dəmir yolu mütəxəssisi hər dəyəri standartın öz mətni ilə yoxlayır və onun yanında bəndi yazır, bundan sonra heç nə qurulmur. Cənubi Afrika və AREMA cədvəlləri bu buraxılışda yoxdur.
