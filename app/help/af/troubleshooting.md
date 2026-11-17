---
title: Probleemoplossing
summary: Simptome, oorsake en oplossings vir die probleme wat mense in CivilCraft ondervind, met die presiese boodskappe wat die app wys.
keywords: probleme, foute, werk nie, oplossing, hulp, boodskappe, probleemoplossing, geweier, ontbrekend, verkeerd, omgeruil, kontoerlyne ontbreek
from: a9f7dedc
---

Boodskappe verskyn in die statusbalk onder regs, in kassies in die linker- en regterpanele, en in die dialoë. Hulle word hier aangehaal soos die app hulle wys.

## Lêers oopmaak

**"Daardie lêer is groter as 200 MB; CivilCraft maak nog nie lêers so groot oop nie."**
Verdeel die puntlêer, of verminder die data voordat jy dit oopmaak.

**"Kon nie site.json oopmaak nie: Dit is nie 'n CivilCraft-projeklêer nie."**
Die lêer eindig in `.json` of begin met `{`, maar is nie 'n CivilCraft-projek nie. Puntlêers mag nie met `{` begin nie.

**"Kon nie oopmaak nie … Hierdie projeklêer is van 'n nuwer CivilCraft (weergawe 2)."**
Die projek is deur 'n nuwer bou gestoor. Maak dit daar oop, of voer LandXML daaruit uit.

**"Kon nie oopmaak nie … Dit is XML, maar nie LandXML nie (die wortelelement is <…>)."**
Die lêer is 'n ander soort XML. Voer LandXML uit die ander program uit.

**"… het geen punte, TIN-oppervlakke of belynings wat CivilCraft kan lees nie."**
Alles in die lêer is iets wat CivilCraft oorslaan (byvoorbeeld net roosteroppervlakke, of net spiraalbelynings). Die res van die boodskap sê wat daar was. Sien [LandXML: wat gelees en geskryf word](topic:landxml-reference).

**"Die voorbeeld kon nie gelaai word nie: …"**
{{ui:Maak die voorbeeldterrein oop}} lees 'n lêer van die CadCraft-webwerf. Sonder verbinding werk dit net as CivilCraft vir aflyn gebruik gestoor is (die knoppie in die appbalk wys {{ui:Vanlyn gereed}}). Gaan aanlyn, klik {{ui:Stoor vir vanlyn}}, en dit werk daarna vanlyn. Sien [Vanlyn](common:offline).

**{{ui:Stoor vir vanlyn}} wys {{ui:Kon nie stoor nie}}.**
Sommige lêers is nie afgelaai nie. Kontroleer die verbinding en klik weer op die knoppie.

**{{ui:Stoor vir vanlyn}} wys {{ui:Vanlyn nie beskikbaar nie}}.**
Hierdie blaaiervenster kan nie 'n vanlynkopie hou nie, gewoonlik omdat dit 'n privaatvenster is of die rekenaar bestuur word. Maak CivilCraft in 'n normale venster oop.

**Vanlyn, die app maak glad nie oop nie.**
Dit is nie in hierdie blaaier vir vanlyn gebruik gestoor nie, of die blaaier het sy webwerfdata gewis (Safari doen dit vir webwerwe wat al etlike weke nie besoek is nie). Gaan aanlyn, maak CivilCraft oop en klik {{ui:Stoor vir vanlyn}}.

**Die vanlynkopie is 'n ouer bou.**
Klik {{ui:Vanlyn gereed}}, en dan {{ui:Stoor weer (kry die nuutste weergawe)}} terwyl jy aanlyn is.

**'n Lêer is grys in die oopmaakvenster.**
Die venster lys net puntlêers, LandXML- en projeklêers volgens hul eindings. Sleep eerder die lêer na die plan, of hernoem dit na `.txt`.

## Punte invoer

**"Geen punte kon uit hierdie lêer gelees word nie."**
Kies die kolomvolgorde in **Kolomme** met die hand. As niks werk nie, maak die lêer in 'n teksredigeerder oop en kontroleer dat dit een punt per reël het met getalle daarin.

**Die terrein lyk gespieël, gedraai of in 'n lyn uitgerek.**
Noord- en oos-koördinate is omgeruil. Die opsomming het gesê "geraai uit die kolomtelling". Kies PENZD in plaas van PNEZD (of andersom) in **Kolomme**, of voer weer in.

**Punte ver weg van die res, en die plan het uitgezoem tot 'n stippie.**
'n Ry het 'n tikfout in 'n koördinaat, of die lêer meng koördinaatstelsels. Vind die punt (klik daarop om sy nommer te sien) en herstel die lêer.

**Rye gelys onder "Rye nie gelees nie".**
Sien die tabel in [Voer opmetingspunte in](topic:import-points#rows-that-are-not-read).

**My ou punte is weg.**
Die invoer van 'n puntlêer vervang alle punte en maak ontdoen skoon. Maak jou gestoorde projek oop om hulle terug te kry.

## Die oppervlak

**"Oppervlak: Nie gebou nie" met 'n rooi kassie.**
Die kassie sê waarom: "'n Oppervlak het ten minste drie punte met hoogtes nodig.", "Die punte is almal op een lyn: geen driehoeke nie.", "Geen punte met hoogtes nie.", "Die grens oorvleuel nie die punte nie." of "Geen driehoeke bly binne die grens nie." Kontroleer die kolomvolgorde, die puntgroepe (is hulle {{ui:Uitgelaat}}?), en die grens.

**Kontoerlyne sny reguit oor 'n sloot of 'n rug.**
Daardie lyn is nie 'n breeklyn nie. Stel sy groep op {{ui:Breeklyn}}, of teken dit met die {{ui:Breeklyn}}-hulpmiddel. Sien [Bou en verfyn die oppervlak](topic:build-surface).

**'n Breeklyn-groep teken 'n sik-sak.**
Die groep hou meer as een lyn, of sy punte is nie langs die lyn genommer nie. Stel die groep terug na {{ui:Punte}} en teken elke lyn met die {{ui:Breeklyn}}-hulpmiddel.

**Lang dun driehoeke langs die buitekant.**
Teken 'n grens ({{key:O}}) of stel **Langste buitekantrand**.

**Geen kontoerlyne nie, al is die oppervlak gebou.**
Óf {{ui:Kontoerlyne}} is af onder **Vertoning**, óf die interval is so klein dat daar meer as 2,000 kontoerpeile sou wees. Kies 'n groter interval.

**Breeklyne of 'n grens verander niks nie.**
Die oppervlak kom uit LandXML ("Oppervlak (uit LandXML)"). Dit word gebruik soos dit is. Klik {{ui:Bou die oppervlak weer uit die punte}} om eerder uit die punte te bou.

**"Daar is nog geen oppervlak nie: maak eers opmetingspunte oop."**
Breeklyn, grens en platform benodig 'n bestaande grondoppervlak. Voer eers punte in.

**"Klik op 'n opmetingspunt met 'n hoogte: 'n breeklyn neem die punte se hoogtes."**
Die {{ui:Breeklyn}}-hulpmiddel kies net opmetingspunte. Zoem in en klik op 'n punt ('n oranje vierkant wys die een wat dit sal neem).

## Teken

**My laaste punt het verdwyn toe ek dubbelklik het om klaar te maak.**
In hierdie bou sluit dubbelklik die belyning, platform, breeklyn of grens af, maar laat die punt waarop jy dubbelgeklik het, val. Klik een keer op die laaste punt en druk {{key:Enter}}. Gebruik {{key:Mod+Z}} as dit alreeds gebeur het, en teken dan weer.

**Ek kan nie 'n tekening op 'n tablet voltooi nie.**
Voltooi vereis {{key:Enter}}; daar is nog geen knoppie op die skerm nie. Heg 'n sleutelbord aan. Sien [Muis, raakpaneel en aanraking](topic:keyboard#mouse-trackpad-and-touch).

**Sleep om 'n punt te plaas, pan eerder.**
'n Sleep van meer as 'n paar pixels pan die plan in elke hulpmiddel. Klik sonder om te beweeg.

**"'n Belyning benodig ten minste twee punte." / "'n Platform benodig ten minste drie hoeke." / "'n Pypreeks benodig ten minste twee strukture."**
Jy het {{key:Enter}} te vroeg gedruk. Die tekening word weggegooi; begin weer.

**Sleutels soos A of G doen niks nie.**
'n Teksblok of 'n lys in 'n paneel het nog die fokus, so die letters gaan daarheen. Klik een keer op die plan, en druk dan die sleutel. Op 'n Mac is die delete-sleutel vir die blaaier Backspace: gebruik Fn en delete om 'n keuse te skrap.

## Belynings en lengteprofiele

**"Die kurwes by PI 2 en PI 3 oorvleuel: … Gebruik kleiner radiusse."**
Twee kurwes benodig meer raaklyn as wat daar tussen hul PI's is. Verlaag een of albei radiusse in die PI-tabel, of skuif die PI's uitmekaar.

**"PI 3 draai reguit terug; dit kan nie 'n kurwe neem nie."**
Die belyning buig by daardie PI op homself terug. Skuif of verwyder die PI.

**"Hierdie belyning het geen grond onder dit om van te begin nie."**
Die belyning is van die oppervlak af. Skuif dit op die oppervlak, of voeg PVI's by deur te klik met {{ui:Voeg PVI's by}} aan.

**"Die vertikale kurwe by PVI 3 (L = …) begin voordat die kurwe of PVI voor dit eindig." / "… loop verby die volgende PVI."**
Verkort die kurwelengte of skuif die PVI's uitmekaar.

**"Daar is reeds 'n PVI by …"**
Daar bestaan reeds 'n PVI by daardie stasie. Klik êrens anders, of sleep die bestaande een.

**Die lengteprofielaansig is leeg: "Teken 'n belyning om die lengteprofiel te sien."**
Daar is geen belyning nie, of die gekose een het foute.

## Korridors en platforms

**"Die korridor benodig 'n ontwerplengteprofiel sonder foute."**
Begin 'n ontwerplengteprofiel ({{ui:Begin vanaf die grond}}) en herstel enige kurweoorvleuelings.

**"… sywaartse hellings loop van die oppervlak af voordat hulle die grond ontmoet." / "… hellinglyne loop van die oppervlak af voordat hulle dit ontmoet …"**
Die gelykmaking bereik die rand van die oppervlak voordat dit die grond ontmoet. Skuif die ontwerp vanaf die rand in, of bring dit nader aan die grond. 'n Nuwe platform wat gedeeltelik van die oppervlak af geteken is, kan by hoogte 0 begin: tik 'n werklike hoogte in.

**"Die korridor se dagligtelyne kruis …" / "Die dagligtelyn kruis homself …"**
Hellings van verskillende kante loop in mekaar: noue kurwes, smal platforms, diep afgrawings of hoë ophogings. Gebruik 'n groter radius, 'n smaller samestelling, 'n breër platform of steiler hellings.

**"Nog geen volumes nie: 'n platform moet sonder probleme gelykgemaak word."**
Herstel die probleme wat in die rooi kassie daarbo gelys word.

**{{ui:Voorgestelde (gegradeer)}} is grys.**
Geen platform of korridor is nog gegradeer nie.

## Pype

**"P2 het nog geen binnepeile nie."**
Klik {{ui:Stel sy binnepeile volgens die reëls}} of tik die binnepeile in.

**"P1: geen grond by S1 om van te begin nie."**
Die stroomopwaartse struktuur is van die oppervlak af en het geen rand nie. Tik 'n rand daarvoor in.

**Elke pyp word gemerk nadat ek 'n struktuur geskuif het.**
Om 'n struktuur te skuif verander nie binnepeile nie. Klik {{ui:Stel elke binnepeil volgens die reëls}}.

Alle netwerkboodskappe word verduidelik in [Lê 'n swaartekragpypnetwerk uit](topic:pipe-network#read-and-fix-problems).

## Stoor en uitvoer

**"Niks om nog uit te voer nie." / "Niks om nog uit te druk nie."**
Die projek is leeg. Voer eers punte in.

**Ek kan die gestoorde lêer nie vind nie.**
Dit is in die blaaier se aflaaie (gewoonlik die Aflaaie-vouer). Sien [Lêers wat jy kan oopmaak, stoor en uitvoer](topic:files#where-the-files-go).

**Die PDF-skaal is verkeerd op papier.**
Druk teen 100% of werklike grootte, nie "pas op bladsy" nie.

**Vraagtekens in die PDF-teks.**
Name of beskrywings gebruik karakters buite die Wes-Europese stel. Die statusboodskap tel hulle. Hernoem met gewone karakters.

**Die druk is aan die rande afgesny.**
Die skaal is te groot vir die vel. Kies die skaal wat "(pas)" gemerk is, 'n groter vel, of {{ui:Wat op die skerm is}}.

**{{key:Mod+P}} het die blaaier se druk-dialoog oopgemaak.**
Die bladsy het nie die fokus gehad nie. Maak die dialoog toe, klik op die plan, en druk {{key:Mod+P}} weer, of klik {{ui:PDF}}.

## Die app self

**Die skerm is leeg of die nutsbalk doen niks nie.**
Gebruik 'n huidige weergawe van Chrome, Edge, Firefox of Safari, en laai weer. Sien [Blaaiers](common:browsers).

**Die app is stadig met 'n groot puntlêer.**
Skakel {{ui:Driehoeke}}, {{ui:Puntetikette}} en {{ui:Hoogtebande}} af, en gebruik 'n groter kontoerinterval. Baie groot oppervlakke neem 'n oomblik om na elke verandering weer te bou.

**Die blaaier vra "Verlaat webwerf?"**
Die projek het ongestoorde veranderinge. Bly, stoor met {{key:Mod+S}}, en verlaat dan.
