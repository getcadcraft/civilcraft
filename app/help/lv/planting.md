---
title: Stādīšanas plāni un specifikācijas
summary: Ievietot atsevišķus augus, stādījumu dobes, kas aizpildītas ar augiem pēc to attāluma, ar augu maisījumu pēc procentiem, un dzīvžogus; marķēt tos; saskaitīt augu specifikācijā izklājlapai vai TakeoffCraft.
keywords: stādīšanas plāns, augu specifikācija, stādījumu dobe, masveida stādījums, dzīvžogs, koks, krūms, segaugs, attālums, trijstūra attālums, augu skaits, daudzumi, uzraksti, vainags, augu simboli, ifc, takeoff
from: ab49eab5
---

## Augu ievietošana

1. Kreisajā pusē izvēlieties augu sadaļā **Augi**.
2. Noklikšķiniet uz {{ui:Augs}}, pēc tam noklikšķiniet plānā: katrs klikšķis ievieto vienu augu. Lai pārtrauktu, nospiediet {{key:Esc}}.

Auga simbols tiek zīmēts pieaugušā izplatībā; Vairāk › {{ui:Rādīt stādīšanas izmērā}} zīmē katru augu izmērā, kādā tas tiek stādīts. Koki atrodas uz zemes zem sevis: vēlāk, veicot objekta vertikālo plānošanu, tie seko tai. Lai augu nostiprinātu noteiktā augstumā, ierakstiet to laukā **Augstuma atzīme** sadaļā Rekvizīti.

## Stādījumu dobes

1. Izvēlieties galveno augu, noklikšķiniet uz {{ui:Dobe}} un noklikšķiniet uz dobes stūriem. Nospiediet {{key:Enter}} (vai vēlreiz noklikšķiniet uz pirmā stūra), lai to aizvērtu.
2. Dobe tiek aizpildīta ar šo augu tā attālumā, **trijstūra** shēmā (parastā: katrs augs vienādā attālumā no sešiem citiem), pusi attāluma no malas.
3. Rekvizītos **Pievienot augu** sajauc kreisajā pusē izvēlēto augu. Iestatiet katra auga **Daļa %**: dobē tiek ņemts tieši tik daudz katra, izkliedēti visā dobē. **Sajaukt no jauna** pārkārto, kur tie atrodas.

Ja **Attālums** ir tukšs, tiek izmantots augu paša attālums (svērts pēc to daļām); ierakstiet vienu, lai to izmantotu visiem augiem. **Shēma** var būt kvadrāta, un **Rindas leņķis** pagriež rindas.

## Dzīvžogi

Izvēlieties dzīvžoga augu, noklikšķiniet uz {{ui:Dzīvžogs}}, noklikšķiniet gar dzīvžogu un nospiediet {{key:Enter}}. Augi tiek novietoti pa līniju savā attālumā, centrēti tā, lai abos galos būtu vienāda atstarpe. Dzīvžogs var būt **divās rindās, šahveidā**, noteiktā attālumā viena no otras.

## Uzraksti

Atsevišķus augus marķē ar uzraksta iestatījumu (pēc noklusējuma `{name}`); vienam augam savu uzrakstu ierakstiet Rekvizītos. Dobes tiek marķētas ar katra auga skaitu, dzīvžogi — ar savu. Vairāk › {{ui:Augu uzraksti}} ieslēdz un izslēdz uzrakstus. Uzrakstu lauki: `{name}`, `{botanical}`, `{size}` (konteiners), `{qty}`, `{height}`, `{spread}`, `{container}`.

## Augu specifikācija

Vairāk › {{ui:Augu specifikācija…}} saskaita katru augu pēc sugas — atsevišķus augus, dobes un dzīvžogus kopā — ar tā stādīšanas izmēru. Saglabājiet to kā **CSV** vai **XLSX**, vai **Sūtīt uz TakeoffCraft**: daudzumu failu, ko TakeoffCraft atver, lai izcenotu augus (blakus ir cietā seguma un apūdeņošanas daudzumi).

## IFC

Vairāk › {{ui:Eksportēt ainavu IFC}} saglabā ainavu kā IFC failu (IFC 4.3), ko BIM modelis var saturēt: katrs augs ir `IfcGeographicElement` ar tipu VEGETATION, tā sugas tipu un auga īpašībām (botāniskais nosaukums, izmēri, izturība, ūdens, gaisma); katra dobe un dzīvžogs ir viens elements ar saviem skaitiem zemes gabalā. BimCraft to atver blakus ēkai.
