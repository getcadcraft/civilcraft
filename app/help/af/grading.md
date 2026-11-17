---
title: Gradeer 'n boplataform
summary: Teken 'n plat plataform, stel sy hoogte en snit- en vulhellings, en laat CivilCraft dit na die bestaande grond daglig maak en by die voorgestelde oppervlak voeg.
keywords: keermuur, keermure, vertikale kant, muur in plaas van helling, helling per kant, wal, gradering, plataform, boplataform, daglig, kenmerklyn, graderingsgroep, snithelling, vulhelling, afgewerkte gradiënt, voorgestelde oppervlak, terreingradering
from: 482319a6
---

'n Plataform is 'n plat area op een hoogte. Vanaf sy rand gradeer CivilCraft na buite teen jou snithelling waar die grond hoër is as die plataform, en teen jou vulhelling waar dit laer is, totdat die helling die bestaande grond ontmoet. Daardie ontmoetingslyn is die daglyn. Die plataform en sy hellings vervang die bestaande grond binne die daglyn om die voorgestelde oppervlak te maak.

## Teken die plataform

Jy het eers 'n bestaande grondoppervlak nodig.

1. Druk {{key:G}}, of klik {{ui:Plataform}} in die **Ontwerp**-groep.
   Die wenk sê: "Plataform: klik sy hoeke. Enter of dubbelklik voltooi, Backspace laat die laaste val, Esc kanselleer."
2. Klik die hoeke van die plataform in volgorde, enige rigting. 'n Blou omtrek volg die wyser.
3. Druk {{key:Enter}} na die laaste hoek (minstens drie).
   Die plataform word geteken en gekies. Dit begin op die grondhoogte by sy middelpunt, afgerond tot 0.1, met 'n 2 : 1 snithelling en 'n 3 : 1 vulhelling. Die statusbalk sê byvoorbeeld: "Plataform 1 op hoogte 254.3 (die grond by sy middelpunt), snit 2:1, vul 3:1. Verander hulle in Eienskappe."

:::warning
Voltooi met {{key:Enter}}. Dubbelklik voltooi ook, maar in hierdie bou laat dit die hoek val wat jy dubbelgeklik het. Klik die laaste hoek een keer, en druk dan {{key:Enter}}.
:::

Die plataformomtrek mag nie self kruis nie ("Die plataformomtrek kruis self.").

## Stel hoogte en hellings

Met die plataform gekies wys die regterpaneel **Plataform**:

1. **Naam**.
2. **Hoogte**: die plataform se plat hoogte.
3. **Snithelling** en **Vulhelling**, as H:V (2 beteken 2 : 1). Albei moet meer as 0 wees.
4. **Plataformoppervlakte** en **Hoeke** word ter verwysing gewys.

Druk {{key:Enter}} na elke waarde. Die daglyn, die voorgestelde oppervlak en die volumes werk dadelik by.

Onder die velde lees 'n reël byvoorbeeld: "Daglyn: 48 helling-lyne (20 in snit, 28 in vul), verste 31.20 ft uit." Die plan wys die daglyn en die helling-lyne in magenta.

## Hoe die daglig gevind word

- Helling-lyne loop uit elke rand loodreg daarop, ongeveer elke twintigste van die plataform se grootte.
- By buitehoeke waaier hulle elke 10° uit, sodat die helling om die hoek draai.
- By binnehoeke loop een lyn langs die halveerlyn, waar die hellings van die twee rande ontmoet.
- Elke lyn klim teen die snithelling of daal teen die vulhelling totdat dit die grond bereik.

## Hellings per kant en keermure

Onder **Kante en keermure** in die Eienskappe van 'n plataform, 'n platform of 'n wal, kan elke kant sy eie manier gegradeer word. Kant 1 loop van die eerste hoek wat jy geklik het na die tweede, kant 2 van die tweede na die derde, en so aan.

- **Alle kante**: **Hellend** gebruik die snit- en vulhellings hierbo op elke kant; **Vertikaal: keermure** sit 'n muur op elke kant.
- Per kant: **Hellings bo**, **Eie hellings** (tik 'n snit- en 'n vulhelling vir daardie kant) of **Vertikaal (keermuur)**.
- Tik 'n helling as `3` of `3:1` (horisontaal tot 1 vertikaal), `33%` of `18.4°`; dit word as H:1 gewys. Die plataform se eie **Snithelling** en **Vulhelling** neem dieselfde.
- 'n Vertikale kant het geen wal nie: 'n keermuur loop langs die rand, van die plataform af na die bestaande grond (in vul) of van die grond af na die plataform (in snit). **Muurdikte** (0.3 m of 1 ft om mee te begin) is hoe ver die grond van die plataformrand na die bestaande grond trap. Snit- en vulvolumes laat die wal weg wat daardie kant nie meer het nie.
- Waar 'n muur 'n hellende kant ontmoet, draai die helling om die einde van die muur; twee mure ontmoet in 'n verstek.
- Onder die velde: die mure se lengte, blootgestelde vlak (hoogte × lengte), hoogste en gemiddelde hoogte.

Die plan teken elke muur se buitevlak met kort merkers daaroor en sy hoogte aan albei punte en by sy hoogste (op die keermure-laag, wat ook in DXF en DWG gaan). Die 3D-aansig wys die mure as soliede (Wys › Keermure), en GLB-, OBJ- en USD-uitvoere sluit hulle in. Snitte oor die rand wys die trap.

**Waarskuwings** (in Eienskappe, en in die Probleme-paneel): 'n muur hoër as **Waarsku bo 'n muurhoogte van** (1.0 m of 3.3 ft om mee te begin) "kan 'n ingenieursmuur of 'n permit nodig hê; kontroleer plaaslike reëls", en, wanneer jy die **Steilste helling wat die grond staan** tik, enige kant waarvan die snit- of vulhelling steiler as dit is. Dit is waarskuwings: die gradering bou steeds. Elke verandering is een stap vir {{key:Mod+Z}}.

## Skuif hoeke

Kies die plataform, sleep dan 'n vierkante handvatsel by 'n hoek. Elke sleep is een ontdoen-stap. Byvoeg of verwyder van 'n hoek is nog nie beskikbaar nie: vee die plataform uit en teken dit weer.

## Wanneer dit nie grade nie

'n Rooi blokkie onder **Grondwerk** noem die plataform en die probleem:

| Boodskap | Wat om te doen |
|---|---|
| "3 helling-lyne loop van die oppervlak af voordat hulle dit ontmoet: die plataform is te naby die oppervlak se rand of te hoog/laag." | Skuif die plataform in van die rand van die oppervlak af, of bring sy hoogte nader aan die grond. |
| "Die daglyn kruis self (hellings van verskillende kante van die plataform loop in mekaar). Herskep die plataform of verander die hellings." | Tipies vir smal of L-vormige plataforms in diep snit of hoë vulling. Maak die plataform wyer, verlaag die verskil, of maak die hellings steiler. |
| "Die plataformomtrek kruis self." | Teken die hoeke weer in volgorde rondom die plataform. |

'n Plataform met 'n probleem word uit die voorgestelde oppervlak en die volumes gelaat totdat dit reggemaak is.

## Sien die resultaat

1. Onder **Vertoning**, stel **Oppervlak** op {{ui:Voorgestelde (gegradeer)}}.
   Die kontoere loop nou plat oor die plataform en volg die hellings uit na die daglyn.
2. Beweeg die wyser oor die plataform: die statusbalk wys die **Grond**- en **Gegradeerde** hoogtes.
3. Lees snit en vul onder **Grondwerk**; sien [Grondwerkvolumes](topic:volumes).

Plataforms word na korridors gegradeer, in die volgorde waarin hulle geteken is. 'n Latere plataform vervang enigiets vroeër binne sy eie daglyn.

## Verwyder 'n plataform

Kies dit en druk {{key:Delete}} (op 'n Mac, Fn en delete), of klik {{ui:Skrap}}.

## Nog nie gebou nie

Plataforms is plat: hellende plataforms, kenmerklyne met wisselende gradiënt, banke, en gradering na 'n afstand of hoogte-teiken is nog nie beskikbaar nie. Sien [Nog nie gebou nie](topic:not-built-yet).
