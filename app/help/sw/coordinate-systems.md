---
title: Weka mfumo wa kuratibu wa mradi
summary: Sema mfumo wa kuratibu wa upimaji, ili CivilCraft ionyeshe latitudo na longitudo, iweke faili za GIS na tabaka za ramani, na kuandika faili za .prj. Chagua kwa msimbo, kwa jina, kwa kuratibu zenyewe au kutoka faili la .prj.
keywords: mfumo wa kuratibu, crs, epsg, srid, state plane, spcs, utm, nad83, wgs 84, makadirio, prj, wkt, datum, latitudo, longitudo, lat long, kijiografia, gridi, georeference, georeferencing, weka mfumo wa kuratibu
from: 964250e2
---

Kuratibu za mradi ni namba tupu hadi useme zinamaanisha nini. Kuweka mfumo wa kuratibu **haihamishi chochote kamwe**: inaiambia CivilCraft kwamba, kwa mfano, E 6,150,000 N 2,080,000 ni kuratibu za state plane za eneo la 6 la California kwa futi za US survey. Ikishajua:

- upau wa hali unaonyesha latitudo na longitudo ya kielekezi,
- faili za GIS za mifumo mingine (shapefiles, GeoJSON, GeoPackage, gridi za mwinuko, LiDAR) hubadilishwa kuingia kwenye mradi zinapofunguliwa,
- tabaka za ramani zinaweza kuchorwa chini ya mpango ([Onyesha tabaka za ramani chini ya mpango](topic:map-layers)),
- hamisho kwenda fomati za GIS hubeba mfumo (`.prj` kwa shapefiles, msimbo wa EPSG kwa GeoPackage na GeoTIFF).

## Chagua mfumo

1. Chagua {{ui:Kuratibu}} katika kikundi cha {{ui:GIS}} kwenye upau wa zana. Kidirisha cha **Mfumo wa kuratibu** kinafunguka. Juu kinasema mradi uko kwenye mfumo gani sasa, au **Hakuna — kuratibu ni namba tu**.
2. Tafuta mfumo kwa mojawapo ya njia hizi:
   - **Tafuta**: andika msimbo wa EPSG (`2277`, `EPSG:2277`) au maneno kutoka kwenye jina (`texas central`, `utm 14n`, `lambert-93`). Misimbo huorodhesha kuanzia ile uliyoandika; maneno huorodhesha mifumo ambayo jina lake lina kila neno.
   - {{ui:Mifumo ambayo kuratibu hizi zinafaa}} (mradi ukiwa na nukta au uso): CivilCraft husoma katikati ya mradi wako katika kila mfumo wa familia ya vipimo vya mradi na kuorodhesha ile ambayo eneo lake la matumizi linaushikilia. Kuratibu za state plane kwa kawaida zinafaa kwenye kanda chache tu: mradi wa Texas wenye E 3,115,000 N 10,070,000 futi za US survey unafaa kwa tofauti nne za Texas Central (NAD83, NAD83(2011), HARN, NSRS2007). Kila ingizo linaonyesha mahali katikati ya mradi wako lingekuwa.
   - **Karibu (lat, long)** na {{ui:Pendekeza}}: andika mahali eneo lilipo, kwa mfano `30.27, -97.74` au `30°16′N 97°44′W`, na CivilCraft inaorodhesha mifumo ya makadirio ambayo eneo lake linaushikilia, gridi za kitaifa na za jimbo kwanza.
   - {{ui:Soma faili la .prj…}}: fungua `.prj` iliyokuja na shapefile au mchoro. CivilCraft inailinganisha na orodha yake kwa hesabu za makadirio (kwa hiyo `.prj` inayotaja datum kwa jina tofauti bado inapata mfumo sahihi) na inasema ni ipi; pale ambapo hakuna kinacholingana kabisa, maelezo ya faili yenyewe yanatumika. Unaweza pia kuburuta `.prj` kwenye kidirisha, au kuifungua au kuiburuta kwenye mpango yenyewe.
3. Bofya mfumo kwenye orodha. Chini ya **Uliochagua** kunaonyeshwa jina, msimbo wa EPSG, kipimo, jinsi datum yake inavyofungamana vizuri na WGS 84, eneo lake la matumizi kwa latitudo na longitudo, na mahali katikati ya mradi wako lilipo ndani yake.
4. Acha **Gridi** ikiwa imechaguliwa (miradi mingi; angalia [Ardhi na kuratibu za ndani](topic:ground-and-local-coordinates) kwa nyingine) kisha chagua {{ui:Tumia}}.

Sasa upau wa hali unaonyesha latitudo na longitudo ya kielekezi karibu na E na N. Kuweka mfumo ni hatua moja ya kutendua: {{key:Mod+Z}} inauondoa.

:::note
Vipimo lazima vilingane: mradi wa futi unakubali mifumo ya futi za US survey au futi za kimataifa, mradi wa mita unakubali mifumo ya mita. CivilCraft inaeleza kukataliwa ("Mradi uko kwa futi lakini mfumo huu uko kwa mita…"). Mradi wa futi wenye mfumo wa futi ya US survey hutumia futi za survey: "ft" ya mradi inamaanisha futi ya mfumo. Mifumo ya kijiografia (latitudo na longitudo, kama WGS 84 yenyewe) haiwezi kuwa mfumo wa mradi: michoro inahitaji eastings na northings.
:::

## Badilisha au ondoa mfumo

Fungua tena {{ui:Kuratibu}}, chagua mfumo mwingine kisha chagua {{ui:Tumia}}. Mradi ukiwa na nukta au muundo, CivilCraft inauliza **Je, kuratibu tayari ziko katika … ?**

- {{ui:Ndiyo — hakuna kitakachohamishwa}}: namba zinabaki kama zilivyo na maana yake tu ndiyo inabadilika. Tumia hii pale mfumo wa zamani ulichaguliwa kwa makosa.
- {{ui:Hapana — zibadilishe}}: kila nukta ya upimaji, mstari wa kuvunja, mpaka, PI ya mpangilio wa njia, pembe ya jukwaa na muundo vinabadilishwa kutoka mfumo wa zamani kwenda mpya, kwa hatua moja ya kutendua. Uso uliosomwa kutoka LandXML kama pembetatu hauwezi kubadilishwa; ujenge upya kutoka kwenye nukta kwanza.

{{ui:Ondoa mfumo}} huondoa mfumo (hakuna kinachohamia). Tabaka za GIS ambazo tayari ziko kwenye mradi zinabaki pale zilipo.

## Latitudo na longitudo kwenye upau wa hali

Mradi ukiwa na mfumo, upau wa hali unaonyesha latitudo na longitudo ya kielekezi kwenye WGS 84, kwa mfano `30°18′00.00″ N  97°42′00.00″ W`. Badala yake chagua digrii za desimali chini ya {{ui:Mipangilio}}, {{ui:CivilCraft}}, **Latitudo na longitudo** ([Mipangilio ya CivilCraft](topic:settings)). Kwa kuratibu za ardhi au za ndani, usomaji hupitia hatua hiyo kwanza, kwa hiyo ni sahihi kwa nukta iliyo chini ya kielekezi.

## Ubora wa mabadiliko ya datum

Latitudo, longitudo, GeoJSON na tabaka za ramani zote ziko kwenye WGS 84. Kifungamano cha kila mfumo kwa WGS 84 kinaonyeshwa kwenye kidirisha:

| Kidirisha kinasema | Maana yake |
|---|---|
| WGS 84 yenyewe | Hakuna mabadiliko kabisa. |
| NAD83 inachukuliwa kama WGS 84 | Hizi mbili zinatofautiana kwa mita moja au mbili katika Amerika Kaskazini nyingi, mita chache zaidi kwa kiwango cha juu. Ni nzuri kwa tabaka za ramani na muktadha wa eneo; si kwa udhibiti wa upimaji. |
| Inajulikana kwa takriban *n* m (kipimo cha EPSG) | Mabadiliko yaliyochapishwa; tabaka za ramani na GeoJSON vinaweza kutofautiana kwa takriban kiasi hicho. |
| Haijulikani kwa datum hii | Hakuna mabadiliko yaliyochapishwa bila faili la gridi: tabaka za ramani na GeoJSON vinaweza kutofautiana kwa mamia ya mita. |
| Kutoka faili la mabadiliko ya gridi … | Faili la mabadiliko ya gridi linatumika (hapa chini): ndani ya takriban 10 cm kutoka NAD83 ndani ya gridi. |

Kuratibu zenyewe za mradi wako hazipiti kwenye mabadiliko ya datum kamwe: ni kile tu kinachobadilishwa kwenda au kutoka latitudo na longitudo ndicho kinachopitia. Datum wima na modeli za geoid hazishughulikiwi (mwinuko haubadilishwi kamwe). Pale mabadiliko bora yanapohitaji faili la gridi, orodha hubeba mabadiliko mabaya zaidi yaliyochapishwa na kidirisha kinaonyesha usahihi wake (mifumo ya NAD27, kwa mfano, takriban 20 m), hadi uongeze gridi.

## Faili za mabadiliko ya gridi

Kwa mfumo wa NAD27, **Faili la mabadiliko ya gridi** kwenye kidirisha cha mfumo wa kuratibu huweka latitudo na longitudo, faili za GIS na tabaka za ramani ndani ya takriban 10 cm kutoka NAD83 badala ya takriban 20 m:

- **Pakua** gridi inayopendekezwa kwa eneo la mfumo (NADCON5 kwa Marekani inayoungana, NADCON kwa Alaska, NTv2 kwa Kanada) kutoka cdn.proj.org, seva ya umma ya gridi ya PROJ. Jina la faili la gridi pekee ndilo linalotumwa.
- Au **Ongeza faili la gridi…** ulilo nalo tayari: NTv2 (`.gsb`) au gridi ya PROJ GeoTIFF (`.tif`), hadi MB 20.

Gridi huhifadhiwa kwenye faili la mradi, kwa hiyo husafiri na mradi. Sehemu hiyo inasema kama katikati ya mradi iko ndani ya gridi: nje yake, hakuna mabadiliko yoyote yanayotumika, kwa hiyo tumia gridi inayofunika eneo. **Acha kutumia gridi** hurudi kwenye mabadiliko mabaya. Kila mabadiliko ni hatua moja: {{key:Mod+Z}} inayatendua.

Tabaka za GIS ambazo tayari ziko kwenye mradi zinabaki pale zilipo gridi inapobadilika; ziingize tena ili ziwekwe kupitia gridi. Kuratibu za mradi wenyewe hazihami kamwe.

## Kilichokaguliwa

- Kila ubadilishaji ulilinganishwa na PROJ (pyproj 3.7.1 na PROJ 9.5.1), maktaba ya kuratibu ambayo programu nyingi za GIS hutumia, kwenye mifumo zaidi ya 330: state plane kwa futi za US survey na futi, UTM kaskazini na kusini, Lambert-93, British National Grid, GDA2020 MGA, New Zealand Transverse Mercator na web Mercator miongoni mwake. Eastings na northings zinakubaliana ndani ya cm 1 kwa mabadiliko sawa ya datum (mengi chini ya mm 1), na hesabu za makadirio zinakubaliana na ufafanuzi wa PROJ wenyewe ndani ya cm 1.
- Faili za `.prj` zilizoandikwa na PROJ katika namna zote mbili za kawaida (ESRI na OGC) zilisomwa tena kwa mifumo 105: 208 kati ya 210 zililingana na msimbo wao halisi wa EPSG, na nyingine mbili zililingana na mfumo wenye hesabu sawa kwenye ellipsoid ile ile. Faili za `.prj` ambazo CivilCraft huandika husomwa na PROJ kama mfumo uleule. Faili za ESRI `.prj` za mifumo ya polar stereographic (UPS, Alaska polar) haziwezi kusomwa; chagua mifumo hiyo kwa msimbo.
- Latitudo na longitudo kwenye upau wa hali zililingana na PROJ ndani ya 0.01″ kwenye kivinjari.
