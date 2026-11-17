---
title: Riviere se wateroppervlakprofiele
summary: Modelleer 'n rivier vanaf die grondoppervlak en bereken bestendige wateroppervlakprofiele met die standaardstapmetode: waterpeile, energie, snelhede, Froude-getalle en die vloedomvang op die plan. 'n Laboratoriumfunksie; elke resultaat benodig 'n ingenieur se nagaan.
keywords: dyk, ondoeltreffende vloeiarea, snitredigeerder, rivier, hidrolika, wateroppervlakprofiel, terugstuwing, standaardstap, bestendige vloei, 1d, dwarssnitte, manning, ruheid, geleiding, kritieke diepte, normale diepte, froude, energiegradiëntlyn, vloedomvang, oorstromingsvlakte, oorstroming, oewerstasies, rivierlengtes, vernouing, verwyding, subkritiek, superkritiek, gemengde regime, hidrouliese sprong
from: fb8bf425
---

CivilCraft bereken bestendige, eendimensionele wateroppervlakprofiele langs 'n rivier: vir elke vloei wat jy gee, die waterpeil by elke dwarssnit, uit die energiebalans tussen naburige snitte (die standaardstapmetode). Dit is in die laboratorium terwyl dit nagegaan word.

**Slegs ontwerphulp.** Die waterpeile benodig 'n gekwalifiseerde ingenieur se nagaan voordat iemand daarop staatmaak: 'n 1D-model is so goed as sy snitte, ruheidswaardes, rivierlengtes en grense, en dit weet niks van brue, duikers of vloei wat die rivier verlaat nie.

## Teken die rivier

1. Bou eers die bestaande grondoppervlak (punte, breeklyne, of 'n TIN wat jy oopgemaak het).
2. Kies onder **Oppervlak** › {{ui:Meer}} die {{ui:Rivier}}.
3. Klik langs die rivier se middellyn **van stroomop na stroomaf**, en druk dan {{key:Enter}} of dubbelklik.

CivilCraft sny elke 50 m (200 ft) 'n snit vierkant op die middellyn, 100 m (300 ft) na elke kant, uit die grond. Rivierstasies word vanaf die stroomafeinde gemeet, sodat hulle stroomop groei. Die oewers begin as 'n skatting 10 m (30 ft) aan weerskante van elke snit se laagste punt.

Om 'n snit by te voeg waar die rivier vernou of 'n struktuur staan, kies die rivier, klik {{ui:Voeg 'n snit by}} en teken 'n snytlyn daaroor (in enige rigting: dit word gedraai sodat hy van links na regs loop as jy stroomaf kyk).

## Stel die rivier op

Kies die rivier om hom in **Eienskappe** te sien:

- **Vloeiregime**: subkritiek (die gewone geval: stroomop bereken vanaf die stroomafgrens), superkritiek (stroomaf bereken vanaf die stroomopgrens) of gemengd (albei, dan die een met die groter spesifieke krag by elke snit; 'n voorskou).
- **Vloeiprofiele**: 'n naam en 'n vloei vir elk (byvoorbeeld 'n 10-jaar- en 'n 100-jaarvloei), en die grens aan die stroomafeinde (en die stroomopeinde wanneer die regime nie subkritiek is nie): **Normale diepte** met 'n energiehelling (die bedhelling is 'n eerste skatting), 'n **Bekende wateroppervlak**-hoogte, of **Kritieke diepte**.
- **Snitte uit die grond**: die spasiëring, hoe ver links en regs, die oewerskatting en die twee Manning se n-waardes; {{ui:Sny snitte weer}} vervang die snitte (een ontdoen-stap).
- **Die snitte-tabel**: vir elke snit, die linker- en regteroewerverplasings, die kanaal se n en die oorstroomde n, die rivierlengtes na die volgende snit stroomaf (linker-oorstroom, kanaal, regter-oorstroom; gemeet vanaf die plan om te begin) en die kontraksie- en ekspansiekoëffisiënte (0.1 en 0.3 om te begin: geleidelike oorgange). {{ui:Redigeer}} open die snitredigeerder (volgende); 'n stip daarna beteken die snit het 'n dyk of 'n ondoeltreffende area.

Elke verandering is een ontdoen-stap ({{key:Mod+Z}}).

## Redigeer 'n snit: oewers, dyke en ondoeltreffende areas

{{ui:Redigeer}} op 'n snit teken sy grond en laat jou sleep wat die oplosser lees: die **linker- en regteroewer** (hulle verdeel die snit in die linker-oorstroom, die hoofkanaal en die regter-oorstroom), 'n **dyk** aan weerskante, en **ondoeltreffende vloeiareas**. Elke handvatsel kan ook met die pylsleutels geskuif word, en elke getal kan naas die grafiek getik word. {{ui:Pas toe}} is een ontdoen-stap.

- 'n **Dyk** het 'n plek (verplasing) en 'n kruinhoogte. Die grond verder weg van die rivier, weg van die rivier, word afgesny terwyl die wateroppervlak onder die kruin is: die oppervlakte, natte omtrek en geleiding daarvan word uitgelaat. Bo die kruin tel die hele snit weer. 'n Dyk staan buite die oewer wat hy beskerm; een binne die oewers word gemerk.
- 'n **Ondoeltreffende vloeiarea** hou water maar dra geen vloei nie ('n kom agter 'n walm, dooie water langs 'n brugnadering). Gee sy twee verplasings en, as jy wil, 'n waterpeil waaronder hy ondoeltreffend is ({{ui:altyd}} as dit leeg is): bo daardie peil vloei hy soos die res. Een wat 'n deel van die hoofkanaal dek, word gemerk.
- Tussen twee snitte laat die vloedomvang die grond agter 'n dyk wat albei snitte het droog, terwyl die wateroppervlak daar onder die kruin is (die lyn tussen die twee kruine is reguit).

## Bereken en lees die resultate

Klik {{ui:Wateroppervlakprofiele}}. Vir die profiel wat jy kies, kry jy:

- 'n **grafiek** langs die rivier (vloei van links na regs): kanaalbodem, oewers, wateroppervlak, energiegradiëntlyn en kritieke wateroppervlak; snitte wat op kritieke diepte gehou word, is omlyn;
- 'n **tabel** per snit: rivierstasie, vloei, kanaalbodem, wateroppervlak, kritieke wateroppervlak, energiegradiëntlyn, diepte, snelheid in die kanaal en oor die geheel, die kanaal se Froude-getal, vloeiarea, boonste breedte, die vloei in elke oorstroomde gedeelte en die kanaal, die energiehelling, en waarskuwings;
- **waarskuwings** in gewone woorde, byvoorbeeld 'n snit wat op kritieke diepte gestel is, water bo 'n snit se einde, of 'n groot verandering in geleiding tussen twee snitte (voeg snitte tussenin by).

{{ui:Tabel (CSV)}}, {{ui:Verslag}} (gewone teks met die metode, die grense en elke tabel) en {{ui:Grafiek (SVG)}} stoor na jou aflaaie. Elkeen dra die nagaanreël.

Merk {{ui:Wys die vloedomvang}} in **Eienskappe** om die nat gebied op die plan vir die gekose profiel te skadu, met die waterlyn geteken waar die diepte nul is. Tussen snitte is die wateroppervlak vlak oor die rivier en verander lineêr met die rivierstasie. Grond agter 'n dyk bly droog terwyl die water onder sy kruin is. Ander lae grond binne die rivier se korridor wat die water nie kan bereik nie (agter 'n padwal, byvoorbeeld) word steeds geskadu: kontroleer dit.

## Op die tekening en in Probleme

Die rivier se lyne gaan na die plan, die PDF en die DWG op hul eie lae: **C-WATR-CNTR** (die middellyn), **C-WATR-SCTN** (elke snytlyn, met sy rivierstasie) en **C-WATR-FLOD** (die vloedomvang se waterlyn, wanneer {{ui:Wys die vloedomvang}} vir 'n profiel gemerk is). Die rivier se waarskuwings ('n snit op kritieke diepte, water bo die snitte se einde, 'n verandering in geleiding wat meer snitte vra, 'n energiebalans wat nie gesluit het nie, 'n dyk binne die oewers) gaan ook na die **Probleme**-paneel, oor die rivier en by die snit waarvandaan hulle kom.

## Hoe dit bereken word

- Energie tussen twee snitte: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Geleiding volgens onderverdeling: elke oorstroomde gedeelte word verdeel waar sy n verander, K = Σ (1/n)·A·R^(2/3) (1.486/n in VSA-eenhede); die kanaal is een stuk, met 'n saamgestelde n wanneer sy n verander. α kom uit hoe die geleiding verdeel word.
- Wrywingshelling volgens gemiddelde geleiding, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², oor die vloeiggewoë rivierlengte.
- Kontraksiekoëffisiënt wanneer die vloei stroomaf versnel, ekspansie wanneer dit vertraag.
- Kritieke diepte = kleinste spesifieke energie. Elke waterpeil word op 'n braket opgelos, sodat dit nooit na die verkeerde kant van kritiek spring nie; wanneer geen antwoord bestaan nie, word dit op kritieke diepte gestel en gemerk.

Die program is nagegaan teen Manning se normale diepte, kritieke diepte in 'n reghoekige kanaal, en Chow se terugstuwingsvoorbeeld (*Open-Channel Hydraulics*, 1959, hoofstuk 10), onafhanklik geïntegreer. Dieselfde metode word deur die algemene 1D-riviérprogramme gebruik, so 'n handberekening of 'n student se notas pas daarby aan.

## Duikers en brue

In die rivier se **Eienskappe**, onder **Duikers en brue**, plaas {{ui:Voeg 'n duiker by}} of {{ui:Voeg 'n brug by}} een tussen twee snitte (elke stuk hou ten minste twee). Die profiel daaronder bly onveranderd; die wateroppervlak net bo dit kom uit die struktuur, en die profiel loop van daar stroomop voort. **Resultate** voeg 'n tabel van elke struktuur by: stertwater, kopwaterpeil, watter beheer oorheers, die vloei deur die opening en die vloei oor die pad of dek. Slegs subkritiese vloei.

- **Duiker** (boks- of ronde, een of meer gelyke bare). Inlaatbeheer is oorlaatvloei solank die inlaat vry is, en openingsvloei sodra hy verdrink is, gemeng tussen 'n kopwater van een en een en 'n half maal die styging. Uitlaatbeheer is die energiebalans: inlaatverlies, wrywing en uitlaatsnelheidskop, oor die hoger van die stertwater en die middelhoogte van kritieke diepte en die kruin, minus die val langs die baar. Die kopwater is die groter van die twee. Merk **Water kan oor die pad gaan** en die pad se oorlaatvloei deel die vloei met die bare.
- **Brug.** Die opening is die snit onder die brug, afgesny by die landvaste, met elke pyler as 'n area wat geen vloei dra nie. Die wateroppervlak in die opening kom uit die snit onder (ekspansiekoëffisiënt), en die snit daarboaan uit die opening (kontraksiekoëffisiënt). As die opening nie die vloei by daardie stertwater kan deurlaat nie, loop dit op kritieke diepte en word die brug as verstop gemerk. As die water die onderste koord bereik, is die vloei drukvloei (skuifkleptipe solank die stertwater onder die onderste koord is, verdrink daarbo), en water oor die dek voeg oorlaatvloei by; die stroomop-peil is die een waarby hulle die vloei optel.

Die koëffisiënte (afvoer, inlaatverlies, oorlaat) is ingetikte rond-getal-verstekwaardes. Verander hulle vir jou ontwerp. Hulle is nie die gepasde grafieke wat duikerontwerphandleidings druk nie, so behandel die kopwater van 'n duiker naby sy limiet as 'n skatting. Water oor 'n pad of dek, 'n verdronke inlaat, 'n verstopte opening en vinnige vloei in 'n baar word in **Probleme** gewys.

## Onbestendige vloei

{{ui:Onbestendige vloei…}} in die rivier se **Eienskappe** stuur 'n vloedhidrograaf af deur die snitte. Tik die invloei as ure en vloeie, een paar per lyn, die stroomafhelling (normale diepte) en hoe lank om te loop. Dit begin vanaf die bestendige wateroppervlak by die eerste vloei en los die volle eendimensionele vergelykings op (die implisiete vierpuntskema, geweeg 0.6 in tyd). Jy kry die piekwaterpeil en vloei by elke snit met die uur waarop elk voorkom, 'n grafiek van die vloei aan die twee eindes, en die volumekontrole (in, uit en die verandering wat gestoor is). Dit word nagegaan vir bestendige vloei wat bestendig bly, 'n sprong in die invloei wat by die bestendige profiel van die nuwe vloei eindig, volume wat sluit, en die spoed van die vloedgolf teen die kinematiese golf. Subkritiese vloei, een rivierstuk, geen syinvloei nie, en geen duikers of brue binne die lopie nie.

## Samevloeiings

Riviere wat vloei saamvoeg tot een uitlaat: die vloeie tel bymekaar, en die wateroppervlak by die kop van die stroomafstuk word opgeneem tot by die eindes van die stukke wat daarby aansluit (dieselfde wateroppervlak by die samevloeiing, die eenvoudige metode: geen hoek, geen momentum nie, so dit pas by lae Froude-getalle). Die model en toetse is in plek (`river-structures.js`); 'n paneel om twee riviere op die plan saam te voeg is nog nie gebou nie.

## Nog nie gebou nie

Oorlate en hekke as hul eie strukture, 'n paneel vir samevloeiings, strukture binne 'n onbestendige lopie, en superkritiese onbestendige vloei. 'n Lopie in gemengde regime merk 'n hidrouliese sprong tussen twee snitte, maar plaas dit nie.

**Waar riviere saamvloei.** In 'n rivier se Eienskappe noem "Vloei in" die rivier waarin dit saamvloei. Die riviere wat saamvloei word saam opgelos: die rivier waarin hulle vloei dra die som van hul vloeie, en elkeen eindig by die wateroppervlak van daardie rivier se eerste snit (die gelyke-wateroppervlak-metode; dit laat die hoek en die momentum van die vloeie uit). Om 'n hoofrivier en 'n stroompie saam te voeg, teken 'n kort rivier onder die samevloeiing en laat albei daarin vloei. Resultate wys 'n samevloeiingstabel. Die verstekwaardes in hierdie resultate (kontraksie 0.1, ekspansie 0.3, een-stuk-kanaal met 'n saamgestelde ruheid, die gemengde regime volgens spesifieke krag) bly totdat 'n ingenieur dit nagaan, en die Resultate sê so.
