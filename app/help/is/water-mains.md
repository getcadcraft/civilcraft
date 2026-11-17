---
title: Vatnsveitulagnir, þrýstingar, rennsli og brunaflæði
summary: Teiknaðu þrýstinet tengipunkta, lóna, geyma, lagna, dæla og þrýstiminnkunarloka á teikninguna. CivilCraft reiknar þrýstihæðir, þrýsting og rennsli (Hazen–Williams, lykkjunet), rennslið sem er tiltækt fyrir eld og sólarhringsnotkun. Tilraunaeiginleiki; sérhver niðurstaða þarf yfirferð verkfræðings.
keywords: vatn, vatnsveitulögn, vatnsdreifing, þrýstinet, þrýstilögn, lykkjunet, hazen-williams, C-stuðull, þrýstihæðartap, eftirþrýstingur, brunaflæði, brunahani, notkun, tengipunktur, lón, geymir, dæla, dælukúrfa, þrýstiminnkunarloki, prv, bakstreymisloki, lengdartímabil, epanet, inp, hraði
from: df46bf6d
---

Vatnsveitulagnir eru þrýstihlið svæðisins: lagnir sem eru alltaf fullar, þar sem vatn er þrýst áfram af lóni, geymi eða dælu. CivilCraft reiknar þrýstihæð og þrýsting við hvern tengipunkt og rennsli í hverri lögn, þar á meðal í lykkjunetum þar sem vatnið á fleiri en eina leið. Eiginleikinn er á tilraunastigi meðan hann er prófaður.

**Aðeins reiknihjálp.** Sérhver tala þarf yfirferð hæfs verkfræðings: svarið er aðeins jafn gott og þarfirnar, hæðirnar, lagnastærðirnar og grófleikagildin sem þú gafst upp, og líkan í jafnvægisástandi veit ekkert um vatnshögg, vatnsgæði eða raunverulega hegðun brunadælu.

## Teikna netið

1. Undir **Yfirborð** › {{ui:Meira}} veldu {{ui:Vatnsveitulagnir…}}. Glugginn er opinn meðan þú vinnur á teikningunni.
2. Veldu {{ui:Lón}} og smelltu á teikninguna þar sem framboðið er. Þrýstihæð þess byrjar 100 ft (30 m) yfir jörðu; breyttu henni í Eiginleikum.
3. Veldu {{ui:Tengipunktur}} og smelltu á hvern stað þar sem vatn er tekið eða lagnir mætast. Tengipunktur tekur hæð sína úr landinu; sláðu inn aðra í Eiginleikum til að yfirskrifa hana.
4. Veldu {{ui:Lögn}}, smelltu á einn hnút, og síðan á þann hnút sem hún tengist. Verkfærið helst virkt fyrir næstu lögn. {{ui:Dæla}} og {{ui:Þrýstiminnkunarloki}} eru teiknuð á sama hátt, frá sog- (eða uppstraums-) hnútnum að afhendingar- (eða niðurstraums-) hnútnum. {{ui:Geymir}} er settur eins og tengipunktur.
5. Veldu tengipunkt og sláðu inn {{ui:Notkun}} hans (gpm, eða L/s í metraverkefni). Veldu lögn og stilltu {{ui:Þvermál}} hennar (in, eða mm) og, ef þú veist það, C-stuðul Hazen–Williams.

Sérhver breyting er eitt skref í afturköllun. Delete fjarlægir hnútinn og lagnirnar sem enda við hann.

## Hvað hver hluti þýðir

- **Lögn.** Lengdin er mæld eftir teikningunni nema þú slærð inn eina. C er grófleiki Hazen–Williams (130 til að byrja með, breyttu sjálfgildinu í glugganum). Staðarstuðullinn K bætir við töpum í beygjum og tengistykkjum. Hakaðu við **Bakstreymisloki** fyrir lögn sem má ekki bera vatn afturábak; **Lokuð** lögn ber ekkert.
- **Lón.** Uppspretta með föstu þrýstihæð, vatnsborðið sem það heldur yfir viðmiðunarfletinum. Það gefur eða tekur það sem netið þarfnast.
- **Geymir.** Vatnsborð sem breytist yfir sólarhring. Í föstu niðurstöðunum er hann uppspretta í núverandi borði sínu.
- **Dæla.** Einn hönnunarpunktur (rennsli og þrýstihæð) gefur venjulega kúrfu í gegnum sig: þrýstihæðin við núllrennsli er 133 % af hönnunarþrýstihæðinni, og þrýstihæðin er núll við tvöfalt hönnunarrennsli. Dæla ýtir aldrei vatni afturábak.
- **Þrýstiminnkunarloki.** Heldur þrýstingnum sem þú stillir niðurstraums meðan framboðið er hærra. Þegar framboðið er lægra er hann opinn og heldur engu; ef vatnið myndi renna afturábak lokast hann.

## Lesa niðurstöðurnar

Glugginn sýnir þrýstihæð og þrýsting hvers hnúts og rennsli, hraða og þrýstihæðartap hverrar tengingar á 1,000 ft (eða km), með tengipunktunum litaða á teikningunni: grænt er á milli lægsta og hæsta þrýstings sem þú gafst upp, rautt fyrir neðan, gulbrúnt fyrir ofan. Rennslisörvar sýna stefnuna. Veldu hnút eða lögn til að lesa tölur hennar í Eiginleikum.

Undir töflunum er listi yfir það sem á að skoða: lágur eða hár þrýstingur, lögn hraðari en mörkin þín, tengipunktur sem er skorinn frá öllum uppsprettum, eða lausnari sem náði ekki jafnvægi. Sömu niðurstöður eru í Vandamálaspjaldinu. Stilltu mörkin í glugganum (20 psi, 100 psi og 10 ft/s til að byrja með; 140 kPa, 700 kPa og 3 m/s í metraverkefni).

## Brunaflæði

{{ui:Brunaflæði…}} teiknar rennsli við einn tengipunkt og sýnir þrýstinginn þar og lægsta þrýstinginn hvar sem er í netinu. Það finnur einnig rennslið sem er tiltækt við þann tengipunkt á meðan veikasti hnúturinn í netinu heldur þeim afgangsþrýstingi sem þú gefur upp. Önnur notkun helst óbreytt.

## Sólarhringur notkunar

{{ui:Sólarhringur notkunar…}} keyrir netið klukkutíma fyrir klukkutíma. Gefðu notkunarmynstrið í stillingum skrárinnar (listi margfaldara sem endurtekur sig); geymar fyllast og tæmast með rennsli inn og út, og dæla getur fylgt kveikju/slökkvi-mynstri. Geymir sem nær hæsta eða lægsta borði sínu er nefndur í listanum: CivilCraft lokar ekki inntaki hans eða úttaki fyrir þig, svo lestu það sem „þessi geymir er of lítill eða dælan of stór“.

## EPANET-texti

{{ui:Vista sem EPANET-textaskrá (.inp)}} skrifar netið í textasniðinu sem mörg vatnsforrit lesa, og {{ui:Opna EPANET-textaskrá (.inp)…}} les eina slíka. Aðeins það sem CivilCraft líkir eftir berst yfir: tengipunktar, lón, geymar, lagnir, dælur með þrýstihæðarkúrfu, þrýstiminnkunarlokar, notkunarmynstur og tímarnir. Aðrar gerðir loka, dælur gefnar upp með afli og aðrar formúlur fyrir þrýstihæðartap eru nefndar og skildar eftir. Skráin verður að nota sömu einingar og verkefnið.

## Brunahanar, lokar og tengistykki

Veldu tengipunkt og hakaðu við **Brunahani** til að setja einn þar; veldu aðallögn og ýttu á **Bæta við í miðjunni** til að setja loka, loftloka, skolloka eða mæli á hana. Þeir eru hlutir netsins: þeir hreyfast með því og eitt skref í afturköllun fjarlægir þá.

Skipulagið gefur einnig í skyn tengistykki, og CivilCraft skráir þau án þess að vera beðið um það: **T-stykki** þar sem þrjár aðallagnir mætast, **kross** þar sem fjórar gera það, **beygja** (með sínu horni) þar sem tvær aðallagnir beygja um 5° eða meira, **minnkari** þar sem tvær stærðir mætast, og **hetta** við blindenda. {{ui:Listi yfir tengistykki (CSV)}} telur þau og aðallagnirnar eftir stærð. Þetta er það sem skipulagið gefur í skyn, magntaka til að bera saman við þínar eigin teikningar, ekki listi til að panta eftir.

Aðallagnir eru lagðar í landinu að frádreginni dýpt (4 ft eða 1.2 m) svo hægt sé að teikna þær og móta í þrívídd; þrýstingarnir hér að ofan ráðast aldrei af henni.

## Á teikningunni og í skrám

Teikningin, PDF-skráin og DWG eða DXF bera aðallagnirnar á **C-WATR-MAIN** með stærðum sínum á **C-WATR-TEXT**, brunahana á **C-WATR-HYDR**, lokana á **C-WATR-VALV** og tengistykkin á **C-WATR-FITT**. LandXML-útflutningur skrifar vatnslagnanet (mannvirki fyrir hvern hnút, lögn fyrir hverja aðallögn, brunahanar nefndir); LandXML-innflutningur les það til baka sem vatnsveitulagnir, án notkunar, dælna eða loka, sem LandXML ber ekki. IFC-útflutningurinn skrifar aðallagnirnar sem pípuhluta, brunahana, loka og tengistykki í einu vatnskerfi. Þessar skrár hafa verið prófaðar gegn eigin lesara og skrifurum okkar; prófaðu þær í öðrum forritum þínum og segðu okkur hvað þau segja.

## Það sem er ekki komið ennþá

Vatnsgæði og aldur, stýringar og reglur umfram kveikju/slökkvi-mynstur dælu, aðrar gerðir loka, eftirspurn eftir þrýstingi, lagnir með breytilegu þvermáli og rennsli skólplagna yfir tíma. Sjá [Ekki smíðað ennþá](topic:not-built-yet). Hreinlætishönnunarrennsli, sem er annar útreikningur, er í [Hreinlætishönnunarrennsli](topic:sanitary-design).
