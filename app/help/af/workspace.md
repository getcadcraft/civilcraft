---
title: Die skerm, deel vir deel
summary: 'n Rondleiding deur elke balk en paneel in CivilCraft volgens hul naam op die skerm, van die nutsbalk tot die statusbalk.
keywords: koppelvlak, skerm, nutsbalk, paneel, eienskappe, statusbalk, profielaansig, uitleg, rondleiding, gebruikerskoppelvlak
from: 76272010
---

CivilCraft het een skerm. Daar is geen oortjies en geen uitlegte nie. Die syspanele kan skuif, dryf of na 'n eie venster gaan: sien [Rangskik die paneels en gebruik 'n tweede monitor](common:arrange-panels). Van bo na onder en links na regs:

- die **programbalk** (CadCraft-merk, programnaam, weergawe, Oor, skermmodus, Hulp, Stoor vir vanlyn, Papier en Model)
- die **nutsbalk** met sewe groepe knoppies
- die **linkerpaneel**: Terrein, Punte, Oppervlak, Vertoning en, sodra jy 'n paar invoer, GIS-lae
- die **plan** in die middel, met die **profielaansig** daaronder wanneer dit oop is
- die **regterpaneel**: Eienskappe van wat gekies is
- die **statusbalk** langs die onderkant

## Programbalk

Die dun balk heel bo hoort by die CadCraft-terrein, nie by CivilCraft self nie.

- Die weergaweekieskaart wys watter bou jy gebruik.
- {{ui:Oor CivilCraft}} maak die program se bladsy op die terrein oop.
- {{ui:Volskerm}} wissel die skermmodusse: volskerm, dan volskerm met die balke versteek, dan terug na normaal. {{key:Ctrl+Shift+F}} doen dieselfde op elke platform, insluitend 'n Mac (dit is die Control-sleutel daar, nie Command nie). Met die balke versteek, beweeg die wyser na die bokant-rand om hulle terug te bring.
- {{ui:Hulp}} (of {{key:F1}}) maak hierdie hulp in 'n syspaneel oop; {{key:F1}} of {{key:Esc}} maak dit toe.
- {{ui:Stoor vir vanlyn}} hou CivilCraft in hierdie blaaier sodat dit sonder verbinding oopmaak; dit wys dan {{ui:Vanlyn gereed}}. Sien [Lêers wat jy kan oopmaak, stoor en uitvoer](topic:files#online-and-offline).
- {{ui:Papier}} en {{ui:Model}} wissel tussen 'n ligte en 'n donker tema. Die plan en profiel volg die tema; PDF's druk altyd op wit.

## Nutsbalk

Elke groep het 'n klein etiket bo sy knoppies. Hou die wyser oor 'n knoppie om sy oorsigteks en sleutel te sien.

| Groep | Knoppies | Wat hulle doen |
|---|---|---|
| Lêer | {{ui:Nuut}}, {{ui:Maak oop}}, {{ui:Stoor}} | Begin oor, maak 'n puntlêer, LandXML of projek oop, stoor die projek as 'n aflaai |
| Uitvoer | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | Skryf LandXML 1.2, 'n R12 DXF of 'n DWG van die plan, of plot die plan na PDF |
| Oppervlak | {{ui:Breeklyn}}, {{ui:Grens}} | Teken 'n breeklyn deur opmetingspunte; teken die buitenste grens |
| Ontwerp | {{ui:Belyning}}, {{ui:Plataform}}, {{ui:Pype}}, {{ui:Profiel}} | Teken 'n belyning, 'n plataform, 'n pyplyn; wys of versteek die profielaansig |
| Wysig | {{ui:Ontdoen}}, {{ui:Herdoen}}, {{ui:Kopieer}}, {{ui:Plak}}, {{ui:Meer}} | Ontdoen, herdoen, kopieer en plak opmetingspunte; {{ui:Meer}} bevat Knip, Plak op dieselfde plek, Dupliseer, Skrap, Kies alle punte en Kies niks |
| GIS | {{ui:Koördinate}}, {{ui:Voer in}}, {{ui:Uitvoer}}, {{ui:Kaart}} | Stel die koördinaatstelsel, voer GIS-lêers in en uit, wys kaartlae onder die plan |
| Aansig | {{ui:Kies}}, {{ui:Pas aan}}, {{ui:3D}} | Kies en skuif dinge; zoem om alles te wys; wys die terrein in 3D ([Sien die terrein in 3D](topic:site-3d)) |

'n Tekengereedskap bly ingedruk terwyl dit aktief is. Klik weer daarop, druk {{key:Esc}} of druk {{key:V}}, en jy keer terug na {{ui:Kies}}. {{ui:Ontdoen}}, {{ui:Herdoen}}, {{ui:Kopieer}} en die items in {{ui:Meer}} is grys wanneer hulle nie kan optree nie; die oorsigteks sê waarom (byvoorbeeld "Kies eers opmetingspunte"). Elke knoppie word gelys in [Nutsbalkverwysing](topic:toolbar).

Op 'n smal venster rol die nutsbalk sywaarts.

## Linkerpaneel

### Terrein

- **Naam**: die projeknaam. Dit noem elke lêer wat jy stoor of uitvoer en word in die PDF-titelstrook gedruk.
- **Eenhede**: {{ui:Amerikaanse voet}} of {{ui:Meter}}. Dit sê wat die getalle beteken. Om dit te verander, **skakel nie** koördinate om nie; sien [Eenhede, stasionering en getalformate](topic:units-and-stations).

### Punte

Leeg, dit sê jou hoe om 'n puntlêer oop te maak. Met punte wys dit die lêernaam, die aantal punte en hoeveel 'n hoogte het, dan 'n tabel van **puntegroepe**: een ry per eerste woord van die beskrywing (GRD, FL, TBS …), met 'n telling en 'n **Oppervlak**-keuse:

- {{ui:Punte}}: die punte gaan in die oppervlak (die verstek vir elke groep).
- {{ui:Breeklyn}}: die groep se punte word, in puntnommer-volgorde, in een breeklyn verbind.
- {{ui:Uitgelaat}}: die groep raak nie die oppervlak aan nie.

### Oppervlak

Feite oor die bestaande grond: punte, driehoeke, laagste en hoogste hoogte, gemiddelde hoogte, 2D- en 3D-oppervlakte, breeklyne en of daar 'n grens is. Onder die feite lys 'n kassie enigiets wat die oppervlakbouer moes regmaak of nie kon doen nie. Dan:

- **Langste buitenste rand**: 0 hou elke buitenste driehoek; 'n getal sny lang dun driehoeke van die buitekant af.
- Skakels wat verskyn wanneer hulle van toepassing is: {{ui:Verwyder die grens}}, {{ui:Verwyder getekende breeklyne}} en, vir 'n oppervlak wat uit LandXML gelees is, {{ui:Bou die oppervlak weer uit die punte}}.

### Vertoning

- **Oppervlak**: {{ui:Bestaande grond}} of {{ui:Voorgestelde (gegradeer)}}. Die tweede is beskikbaar sodra 'n plataform of koridor sonder probleme gradeer.
- **Kontoere elke**, **Hoofkontoere elke** en **Bande** (die aantal kleurbande).
- Merkhokkies: {{ui:Kontoerlyne}}, {{ui:Kontoerlynetikette}}, {{ui:Driehoeke}}, {{ui:Hoogtebande}}, {{ui:Helling-pyltjies}}, {{ui:Punte}}, {{ui:Puntetikette}}, {{ui:Breeklyne}}, {{ui:Oppervlakrand}}, {{ui:Pype}}.
- 'n Legenda van bandhoogtes verskyn wanneer bande aan is.

Vertoninstellings word saam met die projek gestoor maar is nie ontdoen-stappe nie: {{key:Mod+Z}} draai nooit 'n merkhokkie terug nie.

## Plan

Die plan wys die punte, die oppervlak en alles wat jy ontwerp, in planaansig met noord bo. Rol die muiswiel om by die wyser te zoem, en sleep leë ruimte om te pan. Die volledige lys is in [Sleutels en muis](topic:keyboard).

- Op 'n leë projek vra 'n kassie met die titel **Begin met opmetingspunte** die eerste stappe en bied {{ui:Maak die voorbeeldterrein oop}} aan.
- Terwyl 'n tekengereedskap aktief is, wys 'n wenk bo op die plan wat om te klik en hoe om klaar te maak.
- Om 'n lêer oor die plan te sleep, wys "Laat 'n puntlêer, LandXML of projek val".
- Geselekteerde dinge word uitgelig. 'n Geselekteerde belyning of plataform wys vierkantige handvatsels by sy PI's of hoeke; 'n geselekteerde struktuur wys een handvatsel. Sleep 'n handvatsel om dit te skuif.
- Geselekteerde opmetingspunte het 'n ring. {{key:Shift}} en 'n klik voeg 'n punt by of verwyder dit; {{key:Shift}} en 'n sleep trek 'n boks (of, om hulle gesleep, 'n lasso) wat die punte daarbinne byvoeg. Sien [Kies, kopieer en plak opmetingspunte](topic:copy-paste-points).

## Profielaansig

Druk {{key:R}} of klik op {{ui:Profiel}} om dit onder die plan oop te maak. Die balk het:

- 'n belynings-lys (aktief wanneer daar twee of meer belynings is)
- {{ui:Voeg PVI's by}}: terwyl dit ingedruk is, voeg 'n klik in die profiel 'n PVI by ({{key:I}} wissel dit)
- 'n aflesing van stasie, grond, ontwerphoogte, gradiënt en snit of vul onder die wyser
- 'n sluitknoppie

Die profiel wys die bestaande grond, die ontwerpprofiel, gradiënte op elke raaklyn, elke PVI se stasie en hoogte, elke vertikale kromme se L en K met sy BVC en EVC, hoë en lae punte, en die vertikale oordrywing. Dit pas altyd die hele belyning in: dit zoem of pan nie. Beweeg die wyser langs dit, en 'n stip verskyn op die belyning in die plan.

## Regterpaneel: Eienskappe

Die opskrif sê wat dit wys.

- **Projek** (niks gekies nie): die belynings en plataforms as skakels, die **Grondwerk**-blok, en die **Pypnetwerk**-blok met sy reëls en probleme.
- **Belyning**: naam, beginstasie, lengte, die PI-tabel, die krommes, die ontwerpprofiel se PVI-tabel en feite, en die **Koridor**-instellings.
- **Plataform**: naam, hoogte, snit- en vulhellings, oppervlakte, daglig-feite en grondwerk.
- **Struktuur** of **Pyp**: groottes, rande, inverts, helling, dekking en enige probleme.
- **Punt** en sy nommer: die punt se koördinate, hoogte, beskrywing en groep (alleenlees).

Velde tree in werking wanneer jy {{key:Enter}} druk of die veld verlaat. 'n Waarde wat nie aanvaar word nie, word as ongeldig gemerk en niks verander nie.

## Statusbalk

- **O** en **N**: oos- en noordkoördinate onder die wyser.
- **Grond**-hoogte daar (en **Gegradeer** waar 'n plataform of koridor dit verander het), of "Af van die oppervlak".
- Die naaste belyning (of die geselekteerde een) met die **Sta** en verplasing (**L** of **R**) onder die wyser.
- Aan die regterkant, boodskappe: wat net gebeur het, of waarom iets geweier is. 'n Boodskap verdwyn na 'n paar sekondes.

## Dialoogkassies

- **Punte invoer**: maak oop met elke puntlêer. Sien [Voer opmetingspunte in](topic:import-points).
- **Plot die plan na PDF**: sien [Plot die plan na PDF](topic:plot-pdf).
- **Nie-gestoorde veranderinge**: vra voordat {{ui:Nuut}} of die oopmaak van 'n projek- of LandXML-lêer ongestoorde werk weggooi. {{ui:Stoor 'n kopie}} laai eers die projek af.

## Klein skerms

Tot 760 pixels breed, soos op 'n foon, hou die plan die skerm: die nutsbalk is een ry wat sywaarts rol, en die paneele maak oop as blaaie vanaf 'n balk onderaan. {{ui:Gereedskap}} versteek die nutsbalk en {{ui:Skuif}} plaas dit onderaan.
