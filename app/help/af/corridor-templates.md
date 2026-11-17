---
title: Koridorsjablone en terreinsjablone
summary: Maak klein herbruikbare sjablone (randsteen en goot, sypaadjie, muur, sloot), bou 'n koridor daaruit volgens stasie met links en regs apart, verdeel 'n belyning in verskeie koridors, en bedek gelaagde materiale op 'n terrein.
keywords: sjabloon, sjablone, sjabloonbiblioteek, sjabloonskepping, tipiese snit, samestelling, subsamestelling, komponente, puntkodes, eindtoestand, daglig, sloot, keermuur, randsteen, goot, sypaadjie, streke, stasiereeks, verskeie koridors, links en regs, terreinsjabloon, bolaag, plaveisel, basis, bedek, materiale, hoeveelhede
from: ce70e58b
---

'n **Sjabloon** is 'n klein dwarssnit wat jy een keer teken en hergebruik: punte met afsetsels, hellings en puntkodes, en komponente met materiale. 'n Koridor kan volgens stasie uit sjablone gebou word, elke kant met sy eie plaveiselsjablone en sy eie eindtoestand, en dieselfde sjablone kan op 'n terrein bedek word.

:::warning
Die voorbeeldsjablone is plekhouers om mee te begin. Hul getalle is nie uit 'n standaard of agentskap geneem nie. 'n Ingenieur moet elke sjabloon en elke waarde wat jy daaraan gee nagaan voordat dit vir 'n ontwerp gebruik word.
:::

## Maak die sjablone oop

Maak {{ui:Oppervlak}} › {{ui:Meer}} › {{ui:Koridorsjablone…}} oop (of tik {{cmd:TEMPLATES}}). Die venster het drie lyste:

- **In hierdie projek**: die sjablone wat hierdie projek se koridors en terreinsjablone gebruik. Hulle word in die projeklêer gestoor.
- **My biblioteek**: sjablone wat in hierdie blaaier bewaar word en in elke projek aangebied word. Gebruik {{ui:Stoor in My biblioteek}} op 'n projeksjabloon om dit te behou.
- **Voorbeelde**: twee bane met lae, randsteen en goot, sypaadjie, daglig, sloot, keermuur, bolaag onder die terrein, en plaveisel op die terrein. Elkeen is gemerk "For checking by an engineer".

{{ui:Gebruik in hierdie projek}} kopieer 'n biblioteek- of voorbeeldsjabloon na die projek. {{ui:Voer hierdie projek se sjablone uit}} stoor hulle as 'n `.cctemplates.json`-lêer, en {{ui:Voer 'n lêer in}} lees een in die projek en My biblioteek. Gebruik die lêer om sjablone te deel of na 'n ander rekenaar te skuif.

## Maak 'n sjabloon

{{ui:Nuwe sjabloon}} (of {{ui:Redigeer}} op 'n projeksjabloon) maak die sjabloonredigeerder oop. Teken die regterkant, uitwaarts vanaf die sjabloon se 0,0-punt; die linkerkant gebruik dieselfde sjabloon uitwaarts na links.

1. Gee dit 'n naam en 'n soort: **Plaveisel** (die volgende sjabloon heg aan sy einde), **Eindtoestand** (dit raak die grond) of **Terreinsjabloon**.
2. Voeg **waardes** by: benoemde getalle soos 'n breedte `w` of 'n helling `s`. 'n Getalkassie enige plek in die sjabloon neem 'n getal of 'n waarde se naam; `-t` is die waarde `t` negatief gemaak. 'n Koridor kan elke gebruik van die sjabloon sy eie waardes gee, so een randsteensjabloon dien elke randsteenhoogte.
3. Voeg **punte** in volgorde by. Elkeen word vanaf 'n vroeër punt (of die 0,0-punt) volgens sy beperking geplaas:

| Beperking | Plaas die punt |
|---|---|
| Afsetsel teen 'n helling | 'n Afsetsel uitwaarts en 'n helling (styging per loop; −0.02 daal 2%) |
| Afsetsel en styging | 'n Afsetsel en 'n styging |
| Reguit op of af | Net 'n styging |
| Sylhelling tot die grond | Uit sy punt na die grond, teen die snyverhouding waar die grond bo is en die opvulverhouding waar dit onder is |
| Tot die grond | 'n Afsetsel, dan reguit op of af tot die grond |
| Keermuur | 'n Muur van die dikte wat jy gee: in sny raak sy bo die grond by die padvlak, in opvulling loop die pad oor dit en sy buitevlak daal tot die grond |

   Merk **Bo** vir die punte waardeur die voltooide oppervlak loop. Die laaste boepunt is waar die volgende sjabloon aan daardie kant begin. 'n **Teiken** laat 'n koridor die punt skuif: sy afsetsel of sy hoogte kom van 'n lyn.
4. Voeg **komponente** by: geslote vorms deur puntkodes (`0` is die 0,0-punt), elk met 'n naam, 'n materiaal en 'n soort. Hul oppervlaktes gee die volumes.

Die tekening volg elke verandering op ware skaal, en die lys onder dit sê wat verkeerd is (’n punt wat die grond raak voor die einde, 'n waarde wat die sjabloon nie het nie, 'n komponent sonder oppervlakte). {{ui:Voeg by hierdie projek}} of {{ui:Stoor}} hou dit, as een ontdoenstap.

## Bou 'n koridor uit sjablone

Kies 'n belyning met 'n koridor en skakel in sy **Eienskappe** {{ui:Bou vanuit sjablone volgens stasie}} aan. Die koridor begin met die voorbeelde van twee bane en daglig aan albei kante.

- **Streke.** Elke streek begin by 'n stasie en loop tot die volgende streek s'n. {{ui:Voeg 'n streek by}} voeg een by; verander sy beginstasie in sy kassie.
- **Links en regs apart.** Elke kant van elke streek het sy eie **Plaveisel**-lys, vanaf die middellyn uitwaarts, en sy eie **Eindtoestand**: daglig, 'n sloot, 'n muur, of enige sjabloon wat die grond raak. Sonder 'n eindtoestand bereik die kant die grond by die koridor se sny- en opvulhellings. {{ui:Kopieer links na regs}} kopieer 'n kant.
- **Waardes en teikens.** Onder elke sjabloon aan 'n kant, 'n kassie per waarde (leeg = die sjabloon se eie waarde) en, vir 'n punt wat 'n teiken neem, die kenmerklyn of ander koridor se lyn wat dit skuif.
- **Vanaf** en **Tot** beperk die koridor tot deel van die belyning.

Die snitte, die planlyne vir elke puntkode, die voorgestelde oppervlak, afpen en grondwerk volg almal. **Eienskappe** lys elke komponent se volume per kant en streek (gemiddelde eindoppervlaktes langs die middellyn). Superhoogte en die koridor se randteikens word nie gebruik solank die koridor uit sjablone gebou word nie.

## Verskeie koridors op een belyning

Onder **Koridors op hierdie belyning** voeg {{ui:Voeg 'n koridor by}} 'n koridor op die res van die belyning by: die eerste koridor kry 'n eindstasie in die middel (of hou sy eie), en die nuwe een begin daar met die eerste een se laaste streek sjablone. Elke koridor het sy eie naam, stasiereeks, sjablone en grondwerk. Skakel een af met sy {{ui:Aan}}-kassie. Waar twee reekse oorvleuel, gradeer die latere koridor oor die vroeëre een.

## Terreinsjablone

'n Terreinsjabloon bedek 'n sjabloon se lae op 'n terrein vanaf sy 0,0-punt: 'n laag onder die 0,0-punt gaan in die grond (bolaag wat afgeskraap moet word), 'n laag bo dit sit op die grond (basis en plaveisel op 'n parkeerarea). Breedtes en hellings maak nie saak nie, net elke komponent se diepte bo of onder die 0,0-punt.

Maak {{ui:Oppervlak}} › {{ui:Meer}} › {{ui:Terreinsjablone…}} oop (of tik {{cmd:TERRAINTEMPLATES}}); die blok is ook in die projek se **Eienskappe**. {{ui:Voeg 'n terreinsjabloon by}} voeg een by met die bolaagvoorbeeld. Vir elk kies:

- die **sjabloon** (sy waardes kan vir hierdie een verander word),
- die **terrein**: die bestaande grond of die voorgestelde oppervlak,
- die **vorm** wat dit knip: die hele terrein, 'n erf, 'n plataform of 'n geslote kenmerklyn. Verskeie terreinsjablone kan verskillende vorme op dieselfde terrein gebruik.

Elke laag lys sy dikte, plan-oppervlakte en volume. Volume is die plan-oppervlakte maal die dikte, die dikte reguit af gemeet; die oppervlakte word op 'n rooster gemeet, en die bedekte (hellende) oppervlakte word ook gegee. Die vorms word op die plan geteken op laag C-TOPO-TMPL. Terreinsjablone verander nie die voorgestelde oppervlak nie.

## Materiale en hoeveelhede

Die projek se **Grondwerk**-blok lys **Materiale uit sjablone**: elke koridorkomponent en terreinsjabloonlaag met sy volume. {{ui:Stuur na TakeoffCraft}} skryf hulle na die hoeveelhedelêer ná die sny en opvulling, elk een item, in kubieke yard (voetprojekte) of kubieke meter.

## Lêers

Sjablone, streke, die ekstra koridors en die terreinsjablone word in die projeklêer gestoor. 'n Projek wat geen van hulle gebruik nie, word presies soos vantevore gestoor, en ouer CivilCraft-weergawes open 'n projek wat hulle gebruik (hulle ignoreer die sjablone en bou die koridor se eie samestelling).
