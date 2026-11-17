---
title: Vijat e mostrave dhe prerjet tërthore
summary: Prisni prerje katrore me një akst rrugor, shikoni tokën, projektin dhe prerjen dhe mbushjen në çdo stacion, dhe merrni vëllimet me metodën e sipërfaqeve mesatare të skajeve.
keywords: diagrami i masës, pika e ekuilibrit, tkurrje, zgjerim, largësi transporti, marrje, hedhje, fletët e prerjeve, fletët e prerjeve tërthore, pdf i prerjeve, prerje, prerje tërthore, vija mostre, pamja e prerjes, prerje, mbushje, sipërfaqe, metoda e sipërfaqeve mesatare të skajeve, vëllime me sipërfaqe skajesh, lëvizje dheu, stacion, zhvendosje, csv
from: 5060173c
---

Një prerje tërthore e tregon rrugën ashtu si do të ndërtohet: tërthor me aksin në një stacion, tokën ekzistuese, projektin (korridori ose platforma e nivelizuar) dhe prerjen dhe mbushjen midis tyre.

## Shtoni vija mostre

1. Përzgjidhni një akst. Te **Veti**, nën **Sample lines**, klikoni {{ui:Add sample lines}}.
2. Vendosni **Every** (hapësirën: 50 ft ose 20 m për të filluar), **Left width** dhe **Right width** (sa larg arrin çdo prerje nga boshti).
3. Për të prerë një prerje në një stacion të caktuar, shkruajeni te **Add a station** (për shembull `2+35`) dhe shtypni {{key:Enter}}.

Prerjet priten në çdo shumëfish të plotë të hapësirës, në të dy skajet e aksit, në fillimin dhe fundin e çdo kurbe (PC dhe PT), dhe në stacionet që shtoni. Vijat e mostrave shfaqen në plan si vija gri përtej aksit; dalin gjithashtu në DXF, DWG dhe PDF në shtresën C-ROAD-SCTN. Çdo ndryshim është një hap: {{key:Mod+Z}} e zhbën.

## Pamja e prerjes

Hapeni me {{ui:Section view}} te **Veti** e aksit, me {{ui:Sections}} nën **Surface** › {{ui:More}}, ose me {{key:X}}. Ajo zë vendin e pamjes së profilit nën plan.

- Kaloni nëpër prerje me shigjetat në shiritin e saj, listën e stacioneve, ose me {{key:Left}} dhe {{key:Right}} kur pamja e prerjes është e fokusuar ({{key:Home}} dhe {{key:End}} për të parën dhe të fundit).
- Vija gri është toka ekzistuese, vija e kuqe është projekti. Prerja hijezohet portokalli, mbushja jeshile. Pikat e korridorit shënohen: CL (boshti), EOP (skaji i asfaltit), SH (bankina) dhe DL (pika e prerjes me terrenin).
- Koka jep stacionin, sipërfaqet e prerjes dhe të mbushjes të kësaj prerjeje dhe zmadhimin vertikal. **Fit** e mbush panelin; zgjidhni 1× për të parë prerjen në përmasa reale.
- Vija e trashë në plan tregon cila prerje është në ekran.

## Fletët e prerjeve

{{ui:Section sheets (PDF)}} nën **Sample lines** vendos çdo prerje në faqe PDF, në rreshta nga e majta në të djathtë dhe nga lart poshtë sipas renditjes së stacioneve. Zgjidhni **Paper**, **Plan scale** (shkalla horizontale e prerjeve) dhe **Profile exaggeration** (1×, 2×, 5× ose 10×); dialogu thotë sa prerje ngjajnë në një faqe dhe sa faqe bëhen.

Çdo prerje shfaq një rrjet me zhvendosje dhe kota, tokën (me vija të ndërprera), projektin, prerjen dhe mbushjen e hijezuara (portokalli dhe jeshile), pikat e korridorit, dhe nën të stacionin dhe sipërfaqet e prerjes dhe mbushjes. Çdo prerje në fletë vizatohet me të njëjtën madhësi, aq e lartë sa e madhja; kur kjo nuk futet në faqe me zmadhimin tuaj, CivilCraft përdor atë më të madhen që futet dhe e thotë këtë. Shiriti i titullit emëron aksin, stacionet në atë faqe, shkallët dhe "Fleta 1 nga 3".

## Vëllimet me metodën e sipërfaqeve mesatare të skajeve

Midis dy prerjeve fqinje, vëllimi është mesatarja e dy sipërfaqeve të tyre shumëzuar me largësinë midis stacioneve të tyre. Shiriti tregon totalet për aksin, dhe {{ui:CSV}} shkarkon sipërfaqet dhe vëllimet e çdo prerjeje me totale rrjedhëse (jard kub për projekte në këmbë, metra kub për ato metrike).

**Veti** tregon të njëjtat totale pranë vëllimeve sipas metodës së rrjetit nga [Vëllimet e lëvizjes së dheut](topic:volumes). Të dyja janë përafrime të ndryshme: prerjet më të afërta i sjellin më pranë njëra-tjetrës, dhe në një rrugë të drejtë në tokë të sheshtë janë të njëjta.

:::note
Prerja dhe mbushja llogariten vetëm brenda zonave të nivelizuara (vijave të prerjes me tokën të një korridori ose platforme), si bën metoda e rrjetit. Pa korridor ose platformë, projekti është toka, kështu që një prerje nuk tregon asnjë prerje ose mbushje.
:::

## Masa e transportit

**Mass haul** nën **Sample lines** vizaton diagramin e masës së transportit nga të njëjtat vëllime me sipërfaqe skajesh: përgjatë stacioneve, totali rrjedhës i prerjes minus mbushjen.

- **Shrink (−) or swell (+) of the cut** tregon çfarë bën një jard kub prerje kur vendoset si mbushje: −10 % (vlera fillestare, një vend-mbajtës) do të thotë që tkurret në 0.9; guri që zgjerohet mund të jetë +5 %. Përdorni shifrën e raportit tuaj gjeoteknik.
- Aty ku vija ngrihet, rruga është në prerje; aty ku bie, në mbushje. Mbi zero (hijezuar portokalli) dheu lëviz lart stacionit; nën zero (jeshile), poshtë stacionit.
- **Pikat e ekuilibrit** janë aty ku vija kalon zero: midis dy prej tyre prerja dhe mbushja janë në ekuilibër. Tabela liston çdo segment të balancuar, vëllimin e lëvizur (pika e tij më e lartë ose më e ulët) dhe largësinë mesatare të transportit (sipërfaqja e hijezuar e pjesëtuar me atë vëllim).
- Aty ku vija mbaron jashtë zeros, ajo që mbetet është **hedhje** (mbi) ose **marrje** (poshtë). Në atë segment të fundit numërohet vetëm dheu përtej nivelit ku mbaron.

**CSV** ruan ordinatën e masës në çdo prerje, segmentet dhe faktorin.
