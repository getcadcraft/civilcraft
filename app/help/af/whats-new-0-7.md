---
title: Wat is nuut in 0.7 (vroeër)
summary: CivilCraft 0.7 voeg 'n Kraglyne-werkruimte by (oorhoofse lyne en ondergrondse kabels met jou eie biblioteke, deurhang en spanning, vryruimte- en sterktekontroles, draadleggingstabelle, hoeveelhede, blaaie en GIS), 'n Landskap-werkruimte ('n plantlys, beplantingsplanne en -skedules, landskapgelykmaking, plaveisel, mure en trappe, 'n besproeiingsberekeningshulp, landskapblaaie en vrye voorwerpe), gebouvolumes met sonering-perke wat jy tik en sonuur, klotoïde-spiraales, korridors wat uit dele aan elke kant gebou word, USD-uitvoer en meer gereedskap vir KI-assistente.
keywords: wat is nuut 0.7, vroeër vrystelling, vrystellingnotas, veranderingslog, veranderinge, 0.7, weergawe, nuwe kenmerke, landskap, landskapwerkruimte, plantlys, plante, beplanting, plantskedule, plantbed, heining, gelykmaking, platform, wal, grondsloot, puntpeil, helling-ontleding, plasvorming, verhardings, pad, muur, kantsteen, hellingbaan, trappe, besproeiing, sproeier, druppel, landskapblaaie, vrye voorwerp, gebouvolume, volumes, bruto vloeroppervlakte, sonering, terugspring, omhulsel, hemelvlak, vloeroppervlakverhouding, dekking, sonure, skaduwee, ifc, ontwikkel in bimcraft, spiraal, klotoïde, oorgang, samestelling, kantsteen, goot, sypaadjie, usd, assistente, eenhede, portugees
from: 797d2f2f
---

Dit is wat in CivilCraft 0.7 verander het, vergeleke met 0.6. Die grootste nuwe dele is die Kraglyne- en Landskap-werkruimtes en gebouvolumes.

## Nuut

### Die Landskap-werkruimte

- **'n Landskap-werkruimte op dieselfde terrein.** {{ui:Oppervlak}} › {{ui:Meer}} › {{ui:Landskapwerkruimte}} voeg beplantings-, gelykmakings-, verhardings- en besproeiingsgereedskap by die terrein wat jy reeds het: dieselfde opmetingspunte, oppervlaktes en projeklêer. Kies **Civil** onder **Werkruimte** om terug te gaan. Sien [Die Landskap-werkruimte](topic:landscape).
- **'n Plantlys.** Ongeveer 420 algemene gematigde en Middellandse See-bome, struike, heinings, grasse, meerjariges, grondbedekkers en klimplante, met hul groottes by aanplant en by volwassenheid, hardheidsone, lig, water en afstand. Soek op enige naam in Engels, Spaans of Portugees. Voer jou eie lys as CSV in; dit word saam met die projek gestoor. Die ingeboude groottes is tipies en afgerond: gaan dit na by 'n plaaslike kwekery. Sien [Die plantlys](topic:plant-list).
- **Beplantingsplanne.** {{ui:Plant}} plaas enkele plante wat op die grond sit en latere gelykmaking volg, {{ui:Plantbed}} vul 'n omtrek teen die plante se afstand met 'n mengsel volgens persentasie, en {{ui:Heining}} stel een of twee rye langs 'n lyn. Plante word op die plan benoem. Sien [Beplantingsplanne en -skedules](topic:planting).
- **'n Plantskedule.** Meer › {{ui:Plantskedule…}} tel die plante volgens spesie en aanplantgrootte. Stoor dit as CSV of XLSX, of stuur dit na TakeoffCraft om te prys. Sien [Die plantskedule](topic:planting#the-plant-schedule).
- **Gelykmaking vir landskap.** {{ui:Grondbewerking}} het platforms (plat of afwaarts), walle, grondslote en gelykmakingsgebiede met puntpeile en kontoere wat jy sleep. Afgrawing en opvulling wys soos jy werk. **Helling-ontleding** kleur die oppervlak volgens jou eie twee perke, en **Vloeipyle en plasvorming** wys waar water loop en waar dit sou opdam. Alles gaan in dieselfde voorgestelde oppervlak as blokke en korridors. Sien [Gelykmaking vir landskap](topic:landscape-grading).
- **Plaveisel, paaie, mure, kantstene, hellingbane en trappe.** {{ui:Verhardings}} teken plaveisel met 'n dwarsval of val na 'n put, 'n patroon en sy lae; paaie wat die grond volg; keer- en vrystaande mure met trapsgewyse fondasies; kantstene; en hellingbane en trappe wat teen perke wat jy stel gekontroleer word. 'n Keermuur hoër as 1,2 m (4 ft) word vir 'n ingenieur gemerk. Sien [Plaveisel, mure en trappe](topic:hardscape).
- **'n Besproeiingsberekeningshulp.** {{ui:Besproeiing}} plaas koppe, laterale, die hoofpyp, kleppe, druppellyne en die verbindingspunt. {{ui:Kontroleer die stelsel…}} vind die sones uit die pype en werk elke sone se vloei, die druk wat by sy klep en by die toevoer nodig is (Hazen–Williams), neerslag, looptye, dekking en 'n materiaallys uit. Dit is 'n berekeningshulp, nie 'n ontwerpsertifisering nie: 'n besproeiingsontwerper nagaan elke resultaat. Die koppe is generiese soorte, of jou eie uit 'n lêer. Sien [Besproeiingsontwerp](topic:irrigation).
- **Landskapblaaie.** Meer › {{ui:Landskapblaaie…}} maak beplantings-, gelykmakings- en besproeiingsplanne met hul legendes, en 'n besonderhedeblad van muurseksies, plaveiselopbou en trappe, as een PDF. Sien [Landskapblaaie](topic:landscape-sheets).
- **Vrye voorwerpe.** Meer › {{ui:Vrye voorwerp…}} plaas 'n STL-, OBJ- of biblioteekitem-maas wat in 'n ander program gemaak is, soos 'n plantbak of 'n beeldhouwerk. Dit staan op die grond of sny daarin, en sy volume, oppervlakte en grondvlak word getel. Sien [Vrye voorwerpe](topic:freeform-objects).
- **Landskap-IFC.** Meer › {{ui:Voer landskap-IFC uit}} stoor plante (as plantegroei met hul eienskappe), verhardings en vrye voorwerpe as IFC 4.3 vir 'n BIM-model. Sien [IFC](topic:planting#ifc).
- **Van begin tot einde.** [Ontwerp 'n tuin, van begin tot einde](topic:landscape-walkthrough) loop die hele werkruimte op die voorbeeldterrein deur.

### Die Kraglyne-werkruimte

- **Oorhoofse lyne en ondergrondse kabels op jou terrein.** {{ui:Oppervlak}} › {{ui:Meer}} › {{ui:Kraglynewerkruimte}}: teken 'n lyn volgens sy steunpunte, kabels in sleuwe, toerusting en hindernisse, op dieselfde grond en in dieselfde projeklêer. Sien [Die Kraglyne-werkruimte](topic:power-lines).
- **Jou eie biblioteke.** Geleiers, kabels, steunpunte, toerusting (dwarsarms, isolators, toebehore, stutte, transformators, kabinette, verbindings) en sleufsoorte, in kategorieë wat jy benoem, gedeel as 'n lêer of 'n sigblad. Geen land se of vervaardiger se katalogus is ingebou nie; die voorbeelde sê dat hulle voorbeelde is. Sien [Jou kraglynbiblioteek](topic:power-line-library).
- **Deurhang en spanning onder jou lasgevalle.** Temperatuur, wind, ys en ys aan een kant; spanningsperke as 'n deel van die breeksterkte; die presiese kettinglyn op elke span, hellings ingesluit; draadleggingstabelle. Sien [Deurhang en spanning](topic:sag-and-tension).
- **Kontroles, altyd op datum.** Vryruimte oor die grond en hindernisse, fasespasiëring, isolatorswaai, opwaartse lig, steunpuntlaste met dimensionering uit jou biblioteek, stutte, toebehore, fondasies, ontbrekende data, ontkoppelde kabels, oorlaaie en spanningsval, gemerk op die plan en op die lynprofiel. 'n Ontwerphulp: 'n ingenieur nagaan dit. Sien [Kraglyn-kontroles](topic:power-line-checks).
- **Tabelle, blaaie en GIS.** Draadlegging- en steunpunttabelle, hoeveelhede (CSV, Excel, TakeoffCraft), plan- en profielblaaie met 'n studieverslag in een PDF, GIS-lae met elke bate se data. Sien [Kraglyntabelle, hoeveelhede, blaaie en GIS](topic:power-line-outputs).
- **Na die eerste pogings.** Die lynprofiel volg die lyn wat jy kies, het 'n **Lyn**-lys, lees die grond, geleier en vryruimte onder die aanwyser en meet tussen twee punte. Landskapplante en mure tel as hindernisse onder lyne; kabelroetes en pype wys in die lynprofiel en kruis met 'n vryruimtereël wat jy kies; **Reëls…** langs elke vryruimte maak jou eie reëls oop, en reëlstelle met 'n biblioteek stoor as pakkette om per land te deel. Sien [Kraglyn-kontroles](topic:power-line-checks) en [Pakkette](topic:sag-and-tension#packs-rules-and-a-library-for-a-country).
- **Jou eie lêerformate.** Kraglyne word in die CivilCraft-projeklêer gestoor, biblioteke in `.cclines.json` of CSV, en reëlstelle en pakkette in hul eie JSON-lêers: oop formate wat enigiemand kan lees of omskakel. Die `.DON`-studielêer is 'n ekstra invoer en uitvoer langs hulle.
- **Studielêers (.DON), nog nie getoets.** Stoor 'n lyn as 'n `.DON`-studielêer vir 'n ander lynprogram, of lees steunpunte uit een: gebou uit die formaat se veldnaam, nog nie met daardie program getoets nie. Sien [Studielêers](topic:power-line-study-file).

### Meet

- **'n Meetgereedskap.** {{ui:Oppervlak}} › {{ui:Meer}} › {{ui:Meet}} (of {{key:M}}) meet op die plan: elke kant se lengte en rigting, die lopende totaal, die lengte langs die grond en die helling, en die oppervlakte en omtrek sodra jy die vorm sluit. Niks word in die projek geteken nie. Sien [Meet](topic:measure).

### Gebouvolumes

- **Teken gebouvolumes.** In Eienskappe, onder **Gebouvolumes**, {{ui:Teken 'n volume}} (ook {{ui:Oppervlak}} › {{ui:Meer}} › {{ui:Volumes}}). Gee 'n volume verdiepings en 'n verdiepingshoogte en lees sy bruto vloeroppervlakte. Kies hoe dit op hellende grond sit (trapsgewys, podium of afgrawing) en sien die opvulling en afgrawing. Volumes wys op die plan, in die PDF en in DWG en DXF op hul eie lae. Sien [Teken gebouvolumes op 'n terrein](topic:building-masses).
- **Stoot en trek in 3D.** In die 3D-aansig sleep jy 'n gekose volume se dak, of druk {{key:PageUp}} en {{key:PageDown}}, om dit een verdieping op 'n slag te verander, in een ontdoen-stap. **Son** werp die volumes se skaduwees. Sien [In die 3D-aansig](topic:building-masses#in-the-3d-view).
- **Soneringsperke wat jy tik.** Terugsprings lyn vir lyn vanaf die straatlyn, 'n hoogtebeperking, 'n hemelblootstellingsvlak, 'n vloeroppervlakverhouding en 'n dekking. Die bebouwbare omhulsel teken op die plan, en elke volume kry 'n hakie of 'n kruisie vir elke perk. CivilCraft het geen soneringskode in nie: elke getal is een wat jy tik uit jou eie verordening. Sien [Kontroleer volumes teen die soneringsperke wat jy tik](topic:zoning-limits).
- **Sonure.** Kies 'n dag, of 'n seisoen, en 'n tydsone volgens naam of verskil, en lees die ure direkte son op elke muur van elke volume, verdieping vir verdieping, en op die grond rondom hulle, getekend op die plan. Stoor die mure en die grond as CSV. Die projek het 'n koördinaatstelsel nodig. Sien [Bereken die sonure op 'n terrein](topic:sun-hours).
- **Volumes as IFC, en voort na BimCraft.** {{ui:Massas as IFC}} stoor die volumes as IFC4, geplaas op die kaart wanneer die projek 'n koördinaatstelsel het. {{ui:Ontwikkel in BimCraft}} maak BimCraft in 'n nuwe oortjie oop met die volumes, waar **Ontwikkel hierdie volume** mure op elke vlak en 'n vloer uit die grondoppervlak bou. Niks word opgelaai nie. Sien [Stuur dit verder](topic:building-masses#send-it-on).

### Belynings

- **Klotoïde-spiraales.** Tik 'n lengte in **Spiraal in** en **Spiraal uit** in die PI-tabel vir 'n kurwe: raaklyn, spiraal, kurwe, spiraal, raaklyn, met gelyke of verskillende lengtes. Die plan merk TS, SC, CS en ST, die kurwelys gee θs en die raaklyn- en eksterne afstande, en stasies en afsette loop deur die spiraales. Sien [Spiraales](topic:alignment#spirals).
- **Spiraales in LandXML.** LandXML skryf en lees klotoïde-spiraales. Belynings met spiraales, wat CivilCraft voorheen by invoer oorgeslaan het, open nou. Sien [LandXML uitruil](topic:landxml).

### Korridors

- **Bou elke kant uit dele.** Skakel **Bou elke kant uit dele** aan om elke kant sy eie lys vanaf die middellyn uit te gee: bane, 'n skouer, 'n goot, 'n kantsteen, 'n beplantingstrook, 'n sypaadjie en 'n kantelhelling met sy eie afgrawing en opvulling. Begin by {{ui:Landelike pad}} of {{ui:Stedelike straat}} en kopieer een kant na die ander. Dwarssnitte merk die vloeilyn, kantsteen en loopbaan, en die gelykgemaakte oppervlak het die kantsteen. Sien [Bou elke kant uit dele](topic:corridor#build-each-side-from-parts).
- **Superhoogte oor spiraales.** By 'n kurwe met spiraales loop die superhoogte-uitloop oor die spiraal: gelyke kruin by die TS, volle superhoogte by die SC. Sien [Superhoogte](topic:corridor#superelevation).

### 3D-lêers

- **USD-uitvoer.** In die 3D-aansig skryf {{ui:USD}} die terrein as `.usda`, `.usdc` of `.usdz` op ware skaal en by sy projekkoördinate: oppervlaktes, pype en strukture as maas, lyne, elke belyning, en opmetingspunte met hul nommers. Sien [Voer die 3D-terrein uit as USD](topic:usd).

### KI-assistente

- **Meer vir assistente.** Met assistente aangeskakel in {{ui:Instellings}} › {{ui:CivilCraft}} kan 'n assistent nou ook erwe, afgrawing en opvulling en profiele lees, opmetingspunte byvoeg, die projek stoor, LandXML, DWG en USD uitvoer, en werk in vouers wat jy in CadCraft Studio kies. Die Landskap-werkruimte voeg gereedskap by om plante te vind, plante, plantbedde en heinings te plaas, gelyk te maak en die besproeiing na te gaan. Die lêerbediener en die `cadcraft`-opdragreël open gestoorde projekte sonder die venster. Sien [Laat 'n KI-assistent met jou terrein werk](topic:assistants).

## In elke program

- **Eenhede.** {{ui:Instellings}} › {{ui:Algemeen}} › {{ui:Eenhede}} het een lys elk vir lengte, oppervlakte, volume, hoek en helling, met die presiese groottes wat die eenhede se definisies gee (die VSA-opmetingsvoet is sy eie eenheid). Skakel die eenhede wat jy nooit gebruik af en hulle verlaat die eenhedelyste; merk een met 'n ster en nuwe werk begin daarin. 'n Lêer hou altyd sy eie eenheid. In CivilCraft volg die projek se lys **Eenhede** die skakelaars; 'n metriese lengtester begin nuwe projekte in meter (anders voet, wat VSA-opmetingsvoet is), 'n oppervlakte- of volumester stel die eenhede waarin oppervlaktes en volumes gerapporteer word, en 'n lengtekassie neem enige eenheid se merk, soos `3 ch` of `450 mm`. Sien [Eenhede, getikte waardes en die eenhedelyste](common:unit-lists).
- **'n Digter uitleg en paneels wat wegskuif.** {{ui:Instellings}} › {{ui:Algemeen}} › {{ui:Uitlegdigtheid}} › {{ui:Kompak}} pas meer op die skerm (aanraakskerms en fone hou hul groot knoppies). Elke sypaneel het 'n slanke titelbalk: sleep dit om die paneel vas te maak of los te laat, laat dit op 'n ander paneel se balk val om een raam as oortjies te deel, speld dit vas om na die rand weg te skuif, of versteek dit en haal dit weer uit die rand. Sien [Rangskik die paneels](common:arrange-panels#make-the-layout-denser).
- **Dialoë beweeg.** Sleep 'n dialoog aan sy titelbalk uit die pad van die tekening; dit kom terug waar jy dit gelos het. Dubbelklik op die titelbalk om dit weer te sentreer. Sien [Skuif 'n dialoog](common:arrange-panels#move-a-dialog).
- **Resepte vir KI-assistente.** Tien uitgewerkte versoeke vir jou eie assistent (maak 'n tekening skoon, druk 'n stel uit, nagaan van tekeninge, vra 'n model vrae, totaal 'n hoeveelheidsopname, probeer 'n onderdeelvariant…), elk met die gereedskap wat dit roep en die toestemmings wat dit nodig het, en elk deur ons toetse weer uitgevoer. Die programme bevat geen KI nie. Sien [Resepte vir KI-assistente](common:assistants-recipes).
- **Tale.** **Português (Portugal)** is nuut in {{ui:Instellings}} › {{ui:Algemeen}} › {{ui:Taal}}. Dit, **Português (Brasil)**, **Español (México)** en **Bahasa Indonesia** het nou elke woord van die programme, as konsepte wat nog nie deur 'n moedertaalspreker nagesien is nie. Hulponderwerpe is in Engels, met 'n paar in Spaans.
- **CadCraft Studio** sê waarom 'n opdateringskontrole misluk het (nog geen lêer vir jou stelsel nie, geen netwerk nie, 'n slegte handtekening) in plaas van net "Klaar", en hou op om 'n Wat is nuut-kaart terug te bring wat jy toegemaak het totdat daar 'n nuwer vrystelling is.

## Nog nie in hierdie weergawe nie

- **0.7 is nie kode-geteken nie.** Teken, en die Microsoft Store-pakket, het na 0.8 geskuif omdat die sertifikaatvalidering nog nie deurgekom het nie. Kontroleer die SHA-256 langs elke lêer op getcadcraft.com/download. Op Windows, as SmartScreen die installeerder stop, kies {{ui:Meer inligting}}, en dan {{ui:Begin tog}}. Op 'n Mac, die eerste keer, regsklik op CadCraft Studio en kies {{ui:Open}}. CadCraft Studio is nog nie in 'n toepassingswinkel nie, en daar is nog geen iPad- of iPhone-bou nie.
- Die hoek- en helling-lyste in {{ui:Eenhede}} word gestoor, maar geen kassie lees hulle nog nie.
- Vervaardigers se besproeiingskoppe: net generiese koppe en jou eie koppe uit 'n lêer. Vervaardigers se data kom net in met hul toestemming, en niemand het dit nog gegee nie.
- BimCraft en ModelCraft dra die plantlys, maar hul Plaas uit biblioteek bied nog nie plante aan nie. Plante bereik BimCraft deur die landskap-IFC.
- Die landskapgereedskap vir assistente werk met die CivilCraft-venster oop; die lêerbediener en die opdragreël het dit nog nie.
- Gebouvolumes: geen gevelbeligting of wind nie, geen skaduwee van bome of enigiets wat nie as 'n volume geteken is nie, geen dakvorms nie, en sonure wys op die plan, nie in die 3D-aansig nie. Ontwikkel in BimCraft bou gewone mure en 'n vloer, sonder openings of dak.
- Kraglyne: geen land se standaard ingebou nie (jy stel die lasgevalle, perke en vryruimtes); geen geleierkruip, termiese graderings van begrawe kabels, kortsluit-, beskerming- of aardingstudies nie; geen lyne in die 3D-aansig of IFC nie. Die `.DON`-studielêer is nog nie getoets met die program wat dit lees nie.
- Spiraales anders as klotoïde, 'n spiraal tussen twee kurwes, en spiraales in kenmerklyne. Die spiraales is nagegaan teen die formules en die LandXML-skema, nog nie teen 'n LandXML-lêer met spiraales van 'n ander program nie.
- Korridorsamestellings wat langs die pad verander, streke, en teikens vir die kantelhelling.
- Waterhoofpype en drukneurwerke (die volgende burgerlike werk), vloei wat oor tyd verander, en skakels tussen water- en stormnetwerke.
- Boë in getekende breeklyne. Standaard ontwerpvoertuigtabelle: die vyf voertuie wat meegelewer word, is plekhouers. Kenmerklyne wat tussen projekte gedeel word, wag vir spanprojekte.

Alles anders is in [Nog nie gebou nie](topic:not-built-yet).
