---
title: Wat is nuut in 0.7
summary: CivilCraft 0.7 voeg 'n Kraglynewerkruimte by (bogrondse lyne en ondergrondse kabels met jou eie biblioteke, sag en spanning, spelings- en sterktekontroles, afspanningstabelle, hoeveelhede, blaaie en GIS), 'n Landskapwerkruimte ('n plantlys, plantplanne en -skedules, landskapgradering, plaveising, mure en trappe, 'n besproeiingsberekeningshulp, landskapblaaie en vrye voorwerpe), gebouvolumes met zoneringsgrense wat jy tik en sonure, kloteoïdespirale, koridors wat aan elke kant uit onderdele gebou word, USD-uitvoer en meer gereedskap vir KI-assistente.
keywords: wat is nuut, wat's nuut, vrystellingsnotas, veranderinge, 0.7, weergawe, nuwe kenmerke, landskap, landskapwerkruimte, plantlys, plante, beplanting, plantskedule, bed, heining, gradering, plataform, berm, greppel, puntehoogte, hellingsanalise, plasvorming, verharding, pad, muur, randsteen, helling, trappe, besproeiing, sproeier, druppel, landskapblaaie, vrye voorwerp, gebouvolume, massering, bruto vloeroppervlakte, zonering, terugtrek, omhulsel, hemelvlak, vloeroppervlakverhouding, dekking, sonure, skaduwee, ifc, ontwikkel in BimCraft, spiraal, kloteoïde, oorgang, samestelling, goot, sypaadjie, usd, assistente, eenhede, portugees
from: 3c9d79db
---

Dit is wat in CivilCraft 0.7 verander het, vergeleke met 0.6. Die grootste nuwe dele is die Kraglyne- en Landskapwerkruimtes en gebouvolumes.

## Nuut

### Die Landskapwerkruimte

- **'n Landskapwerkruimte op dieselfde terrein.** {{ui:Oppervlak}} › {{ui:Meer}} › {{ui:Landskapwerkruimte}} voeg beplanting-, gradering-, verhardings- en besproeiingsgereedskap by die terrein wat jy alreeds het: dieselfde opmetingspunte, oppervlaktes en projeklêer. Kies **Civil** onder **Werkruimte** om terug te gaan. Sien [Die Landskapwerkruimte](topic:landscape).
- **'n Plantlys.** Ongeveer 420 algemene gematigde en Middellandse-see-bome, -struike, -heinings, -grasse, -meerjariges, -grondbedekkers en -klimplante, met hul groottes by aanplant en by volwassenheid, winterhardheidsone, lig, water en spasiëring. Soek met enige naam in Engels, Spaans of Portugees. Voer jou eie lys as CSV in; dit word met die projek gestoor. Die ingeboude groottes is tipies en afgerond: kontroleer hulle by 'n plaaslike kwekery. Sien [Die plantlys](topic:plant-list).
- **Plantplanne.** {{ui:Plant}} plaas enkele plante wat op die grond sit en latere gradering volg, {{ui:Bed}} vul 'n omtrek by die plante se spasiëring met 'n mengsel volgens persentasie, en {{ui:Heining}} plaas een of twee rye langs 'n lyn. Plante word op die plan benoem. Sien [Plantplanne en skedules](topic:planting).
- **'n Plantskedule.** Meer › {{ui:Plantskedule…}} tel die plante volgens spesie en aanplantgrootte. Stoor dit as CSV of XLSX, of stuur dit na TakeoffCraft om te prys. Sien [Die plantskedule](topic:planting#the-plant-schedule).
- **Gradering vir landskap.** {{ui:Grondbewerking}} het plataforms (plat of afwaarts), bermes, greppels, en graderingsgebiede met puntehoogtes en kontoerlyne wat jy sleep. Snit en vul wys soos jy werk. **Hellingsanalise** kleur die oppervlak volgens jou eie twee perke, en **Vloeipyltjies en plasvorming** wys waar water loop en waar dit sou plas. Alles gaan in dieselfde voorgestelde oppervlak as plataforms en koridors. Sien [Gradering vir landskap](topic:landscape-grading).
- **Plaveising, paaie, mure, randstene, hellings en trappe.** {{ui:Verhardings}} teken plaveising met 'n dwarsval of val na 'n afvoer, 'n patroon en sy lae; paaie wat die grond volg; keermure en vrystaande mure met trapsgewyse fondasies; randstene; en hellings en trappe wat teen perke wat jy stel, nagegaan word. 'n Keermuur van meer as 1.2 m (4 ft) word vir 'n ingenieur gemerk. Sien [Plaveising, mure en trappe](topic:hardscape).
- **'n Besproeiingsberekeningshulp.** {{ui:Besproeiing}} plaas koppe, laterale, die hoofleiding, kleppe, druppellyne en die aansluitingspunt. {{ui:Kontroleer die stelsel…}} vind die sones uit die pype en werk elke sone se vloei uit, die druk wat by sy klep en by die toevoer nodig is (Hazen–Williams), neerslag, looptye, dekking en 'n materiaallys. Dit is 'n berekeningshulp, nie 'n ontwerpsertifisering nie: 'n besproeiingsontwerper kontroleer elke resultaat. Die koppe is generiese soorte, of jou eie uit 'n lêer. Sien [Besproeiingsontwerp](topic:irrigation).
- **Landskapblaaie.** Meer › {{ui:Landskapblaaie…}} maak beplanting-, gradering- en besproeiingsplanne met hul legendes, en 'n detailblad van keermuursnitte, plaveisopbou en trappe, as een PDF. Sien [Landskapblaaie](topic:landscape-sheets).
- **Vrye voorwerpe.** Meer › {{ui:Vrye voorwerp…}} plaas 'n STL-, OBJ- of biblioteekitem-maas wat in 'n ander program gemaak is, soos 'n plantbak of 'n beeldhouwerk. Dit sit op die grond of sny daarin, en sy volume, oppervlakte en voetspoor word getel. Sien [Vrye voorwerpe](topic:freeform-objects).
- **Landskap-IFC.** Meer › {{ui:Voer landskap-IFC uit}} stoor plante (as plantegroei met hul eienskappe), verharding en vrye voorwerpe as IFC 4.3 vir 'n BIM-model. Sien [IFC](topic:planting#ifc).
- **Begin tot einde.** [Ontwerp 'n tuin, van begin tot einde](topic:landscape-walkthrough) loop die hele werkruimte op die voorbeeldterrein deur.

### Die Kraglynewerkruimte

- **Bogrondse lyne en ondergrondse kabels op jou terrein.** {{ui:Oppervlak}} › {{ui:Meer}} › {{ui:Kraglynewerkruimte}}: teken 'n lyn volgens sy steunpunte, kabels in sleuwe, toerusting en hindernisse, op dieselfde grond en in dieselfde projeklêer. Sien [Die Kraglynewerkruimte](topic:power-lines).
- **Jou eie biblioteke.** Geleiers, kabels, steunpunte, toerusting (dwarsarms, isolators, passtukke, stutte, transformators, kaste, verbindings) en sleufsoorte, in kategorieë wat jy benoem, gedeel as 'n lêer of 'n sigblad. Geen land se of vervaardiger se katalogus is ingebou nie; die voorbeelde sê dat hulle voorbeelde is. Sien [Jou kraglynbiblioteek](topic:power-line-library).
- **Sag en spanning onder jou lasgevalle.** Temperatuur, wind, ys en ys aan een kant; spanningsgrense op 'n deel van die breeksterkte; die presiese kettinglyn op elke span, insluitend hellings; afspanningstabelle. Sien [Sag en spanning](topic:sag-and-tension).
- **Kontroles, altyd op datum.** Speling oor die grond en hindernisse, fase-afstand, isolatorswaai, opdrukking, steunlaste met dimensionering uit jou biblioteek, stutte, passtukke, fondasies, ontbrekende data, ontkoppelde kabels, oorbelastings en spanningsval, op die plan en op die lynprofiel gemerk. 'n Ontwerphulp: 'n ingenieur kontroleer dit. Sien [Kraglynkontroles](topic:power-line-checks).
- **Tabelle, blaaie en GIS.** Afspan- en steuntabelle, hoeveelhede (CSV, Excel, TakeoffCraft), plan- en profielblaaie met 'n studieverslag in een PDF, GIS-lae met elke bate se data. Sien [Kraglyntabelle, hoeveelhede, blaaie en GIS](topic:power-line-outputs).
- **Na die eerste pogings.** Die lynprofiel volg die lyn wat jy kies, het 'n **Lyn**-lys, lees die grond, geleier en speling onder die wyser en meet tussen twee punte. Landskapplante en -mure tel as hindernisse onder lyne; kabelroetes en pype wys in die lynprofiel en kruis met 'n spelingreël wat jy kies; **Reëls…** langs elke speling maak jou eie reëls oop; en reëlstelle met 'n biblioteek stoor as pakkette om volgens land te deel. Sien [Kraglynkontroles](topic:power-line-checks) en [Pakkette](topic:sag-and-tension#packs-rules-and-a-library-for-a-country).
- **Jou eie lêerformate.** Kraglyne word in die CivilCraft-projeklêer gestoor, biblioteke in `.cclines.json` of CSV, reëlstelle en pakkette in hul eie JSON-lêers: oop formate wat enigiemand kan lees of omskakel. Die `.DON`-studielêer is 'n ekstra invoer en uitvoer langs hulle.
- **Studielêers (.DON), ongetoets.** Stoor 'n lyn as 'n `.DON`-studielêer vir 'n ander lynprogram, of lees iemand se steunpunte; gebou uit die formaat se veldname, nog nie getoets met daardie program nie. Sien [Studielêers](topic:power-line-study-file).

### Meting

- **'n Meet-gereedskap.** {{ui:Oppervlak}} › {{ui:Meer}} › {{ui:Meet}} (of {{key:M}}) meet op die plan: elke kant se lengte en rigting, die lopende totaal, die lengte langs die grond en die helling, en die oppervlakte en omtrek sodra jy die vorm sluit. Niks word in die projek geteken nie. Sien [Meet](topic:measure).

### Gebouvolumes

- **Teken gebouvolumes.** In Eienskappe, onder **Gebouvolumes**, {{ui:Teken ’n volume}} (ook {{ui:Oppervlak}} › {{ui:Meer}} › {{ui:Volumes}}). Gee 'n volume verdiepings en 'n verdiepinghoogte en lees sy bruto vloeroppervlakte af. Kies hoe dit op hellende grond sit (trapsgewys, sokkel of snit) en sien die vul en snit. Volumes wys op die plan, in die PDF en in DWG en DXF op hul eie lae. Sien [Teken gebouvolumes op 'n terrein](topic:building-masses).
- **Druk en trek in 3D.** In die 3D-aansig, sleep 'n geselekteerde volume se dak, of druk {{key:PageUp}} en {{key:PageDown}}, om dit een verdieping op 'n slag te verander, in een ontdoenstap. **Son** werp die volumes se skaduwees. Sien [In die 3D-aansig](topic:building-masses#in-the-3d-view).
- **Zoneringsgrense wat jy tik.** Terugtrekkings lyn-vir-lyn vanaf die straatlyn, 'n hoogtegrens, 'n hemelblootstellingsvlak, 'n vloeroppervlakverhouding en 'n dekking. Die boubare omhulsel teken op die plan, en elke volume kry 'n merkie of 'n kruisie vir elke grens. CivilCraft het geen soneringskode in nie: elke getal is een wat jy uit jou eie verordening tik. Sien [Kontroleer volumes teen die zoneringsgrense wat jy tik](topic:zoning-limits).
- **Sonure.** Kies 'n dag, of 'n seisoen, en 'n tydsone volgens naam of verskuiwing, en lees die ure direkte son op elke muur van elke volume af, verdieping vir verdieping, en op die grond rondom hulle, geteken op die plan. Stoor die mure en die grond as CSV. Die projek het 'n koördinaatstelsel nodig. Sien [Bepaal die sonure op 'n terrein](topic:sun-hours).
- **Volumes as IFC, en voort na BimCraft.** {{ui:Massas as IFC}} stoor die volumes as IFC4, op die kaart geplaas wanneer die projek 'n koördinaatstelsel het. {{ui:Ontwikkel in BimCraft}} maak BimCraft in 'n nuwe oortjie oop met die volumes, waar **Ontwikkel hierdie volume** mure op elke vlak en 'n vloer uit die voetspoor bou. Niks word opgelaai nie. Sien [Stuur dit voort](topic:building-masses#send-it-on).

### Belynings

- **Kloteoïdespirale.** Tik 'n lengte in **Spiraal in** en **Spiraal uit** in die PI-tabel vir 'n kromme: raaklyn, spiraal, kromme, spiraal, raaklyn, met gelyke of verskillende lengtes. Die plan merk TS, SC, CS en ST, die kromlys gee θs en die raaklyn- en eksterne afstande, en stasies en verplasings loop deur die spirale. Sien [Spirale](topic:alignment#spirals).
- **Spirale in LandXML.** LandXML skryf en lees kloteoïdespirale. Belynings met spirale, wat CivilCraft vroeër by invoer oorgeslaan het, maak nou oop. Sien [Uitruil-LandXML](topic:landxml).

### Koridors

- **Bou elke kant uit onderdele.** Skakel **Bou elke kant uit onderdele** aan om elke kant sy eie lys te gee vanaf die middellyn uit: bane, 'n skouer, 'n goot, 'n randsteen, 'n beplantingstrook, 'n sypaadjie en 'n kanthelling met sy eie snit en vul. Begin vanaf {{ui:Landelike pad}} of {{ui:Stedelike straat}} en kopieer een kant na die ander. Dwarssnitte merk die vloedlyn, randsteen en loopstrook, en die gegradeerde oppervlak het die randsteen. Sien [Bou elke kant uit onderdele](topic:corridor#build-each-side-from-parts).
- **Superhoogte oor spirale.** Op 'n kromme met spirale loop die superhoogte-oorgang oor die spiraal: vlak kruin by die TS, volle superhoogte by die SC. Sien [Superhoogte](topic:corridor#superelevation).

### 3D-lêers

- **USD-uitvoer.** In die 3D-aansig skryf {{ui:USD}} die terrein as `.usda`, `.usdc` of `.usdz` op ware skaal en by sy projekkoördinate: oppervlaktes, pype en strukture as maas, lyne, elke belyning, en opmetingspunte met hul nommers. Sien [Voer die 3D-terrein as USD uit](topic:usd).

### KI-assistente

- **Meer vir assistente.** Met assistente aangeskakel in {{ui:Instellings}} › {{ui:CivilCraft}} kan 'n assistent nou ook erwe, snit en vul en profiele lees, opmetingspunte byvoeg, die projek stoor, LandXML, DWG en USD uitvoer, en werk in vouers wat jy in CadCraft Studio kies. Die Landskapwerkruimte voeg gereedskap by om plante te vind, plante, bedde en heinings te plaas, te gradeer en die besproeiing na te gaan. Die lêerbediener en die `cadcraft`-opdragreël maak gestoorde projekte oop sonder die venster. Sien [Laat 'n KI-assistent met jou terrein werk](topic:assistants).

## In elke program

- **Eenhede.** {{ui:Instellings}} › {{ui:Algemeen}} › {{ui:Eenhede}} het een lys elk vir lengte, oppervlakte, volume, hoek en helling, met die presiese groottes wat die eenhede se definisies gee (die Amerikaanse opmetingsvoet is sy eie eenheid). Skakel die eenhede wat jy nooit gebruik af, en hulle verlaat die eenheidslyste; merk een met 'n ster en nuwe werk begin daarin. 'n Lêer hou altyd sy eie eenheid. In CivilCraft volg die projek se **Eenhede**-lys die skakelaars; 'n metriese lengtester begin nuwe projekte in meter (anders voet, wat Amerikaanse opmetingsvoet is), 'n oppervlakte- of volume-ster stel die eenhede waarin oppervlaktes en volumes gerapporteer word, en 'n lengtekassie aanvaar enige eenheid se merk, soos `3 ch` of `450 mm`. Sien [Eenhede, getikte waardes en die eenheidslyste](common:unit-lists).
- **'n Digter uitleg en paneel wat wegskuif.** {{ui:Instellings}} › {{ui:Algemeen}} › {{ui:Uitlegdigtheid}} › {{ui:Kompak}} pas meer op die skerm (aanraakskerms en foonskerms hou hul groot knoppies). Elke syspaneel het 'n dun titelbalk: sleep dit om die paneel vas te maak of te laat dryf, laat dit op 'n ander paneel se balk val om een raam as oortjies te deel, pen dit vas om na die rand weg te skuif, of versteek dit en bring dit terug vanaf die rand. Sien [Rangskik die paneels](common:arrange-panels#make-the-layout-denser).
- **Dialoogkassies skuif.** Sleep 'n dialoogkassie aan sy titelbalk uit die pad van die tekening; dit kom terug waar jy dit gelaat het. Dubbelklik op die titelbalk om dit weer te sentreer. Sien [Skuif 'n dialoogkassie](common:arrange-panels#move-a-dialog).
- **Resepte vir KI-assistente.** Tien uitgewerkte versoeke vir jou eie assistent (maak 'n tekening skoon, plot 'n stel, kontroleer tekeninge, vra 'n model vrae, totaal 'n hoeveelheidsopname, probeer 'n onderdeelvariant…), elk met die gereedskap wat dit roep en die toestemmings wat dit nodig het, en elk herspeel deur ons toetse. Die programme bevat geen KI nie. Sien [Resepte vir KI-assistente](common:assistants-recipes).
- **Tale.** **Português (Portugal)** is nuut in {{ui:Instellings}} › {{ui:Algemeen}} › {{ui:Taal}}. Dit, **Português (Brasil)**, **Español (México)** en **Bahasa Indonesia** het nou elke woord van die programme, as konsepte wat nog nie deur 'n moedertaalspreker nagesien is nie. Hulponderwerpe is in Engels, met 'n paar in Spaans.
- **CadCraft Studio** sê hoekom 'n opdateringskontrole misluk het (geen lêer vir jou stelsel nog nie, geen netwerk nie, 'n slegte handtekening) in plaas van net "Klaar", en hou op om 'n Wat's nuut-kaart wat jy toegemaak het terug te bring totdat daar 'n nuwer vrystelling is.

## Nog nie in hierdie weergawe nie

- **0.7 is nie kodegeteken nie.** Kodeteken, en die Microsoft Store-pakket, het na 0.8 verskuif omdat die sertifikaatvalidering nog nie deurgekom het nie. Kontroleer die SHA-256 langs elke lêer op getcadcraft.com/download. Op Windows, as SmartScreen die installeerder stop, kies {{ui:Meer inligting}}, dan {{ui:Hardloop tog}}. Op 'n Mac, die eerste keer, regsklik op CadCraft Studio en kies {{ui:Maak oop}}. CadCraft Studio is nog nie in 'n programwinkel nie, en daar is nog nie 'n iPad- of iPhone-bou nie.
- Die hoek- en helling-lyste in {{ui:Eenhede}} word gestoor, maar geen blokkie lees hulle nog nie.
- Vervaardigers se besproeiingskoppe: net generiese koppe en jou eie koppe uit 'n lêer. Vervaardigersdata kom slegs met hul toestemming in, en geen is nog gegee nie.
- BimCraft en ModelCraft dra die plantlys, maar hul Plaas uit biblioteek bied nog nie plante aan nie. Plante bereik BimCraft deur die landskap-IFC.
- Die landskapgereedskap vir assistente werk met die CivilCraft-venster oop; die lêerbediener en die opdragreël het hulle nog nie.
- Gebouvolumes: geen gevelbeligting of wind nie, geen skaduwee van bome of enigiets wat nie as 'n volume geteken is nie, geen dakvorms nie, en sonure wys op die plan, nie in die 3D-aansig nie. Ontwikkel in BimCraft bou gewone mure en 'n vloer, sonder openings of dak.
- Kraglyne: geen land se standaard ingebou nie (jy stel die lasgevalle, perke en spelings); geen geleierkruip, termiese graderingsstudie van begrawe kabels, kortsluit-, beskermings- of aardingsstudies nie; geen lyne in die 3D-aansig of IFC nie. Die `.DON`-studielêer is nog nie getoets met die program wat dit lees nie.
- Spirale behalwe kloteoïde, 'n spiraal tussen twee krommes, en spirale in kenmerklyne. Die spirale is nagegaan teen die formules en die LandXML-skema, nog nie teen 'n LandXML-lêer met spirale van 'n ander program nie.
- Koridorsamestellings wat langs die pad verander, streke, en teikens vir die kanthelling.
- Watervoorsieningsleidings en drukleidingnetwerke (die volgende burgerlike werk), vloeie wat met tyd verander, en skakels tussen water- en stormnetwerke.
- Boë in geteekende breeklyne. Standaard ontwerpvoertuigtabelle: die vyf voertuie wat saamkom, is gemerkte plekhouers. Kenmerklyne wat tussen projekte gedeel word, wag vir spanprojekte.

Alles anders is in [Nog nie gebou nie](topic:not-built-yet).
