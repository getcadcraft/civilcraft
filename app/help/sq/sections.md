---
title: Vijat e mostrës dhe prerjet tërthore
summary: Pritini prerje katrore me aksin rrugor, shihni terrenin, projektin dhe hapjen dhe mbushjen në çdo stacion, dhe merrni vëllimet me metodën e sipërfaqeve mesatare të skajeve.
keywords: diagrama e masës, kurba e masës, pika e ekuilibrit, tkurrje, fryrje, distancë transporti, huazim, mbeturina, fletë prerjesh, fletë prerjesh tërthore, prerje pdf, prerje, prerje tërthore, vija mostre, pamja e prerjes, hapje, mbushje, sipërfaqe, metoda e sipërfaqes mesatare të skajeve, vëllime të punës me tokë, stacion, zhvendosje, csv
from: 09639ce2
---

Një prerje tërthore e tregon rrugën ashtu si do ndërtohet: tërthor me aksin rrugor në një stacion, terrenin ekzistues, projektin (koridorin ose platformën e nivelluar) dhe hapjen dhe mbushjen mes tyre.

## Shto vija mostre

1. Përzgjidh një aks rrugor. Te **Vetitë**, nën **Vijat e mostrës**, kliko {{ui:Shto vija mostre}}.
2. Vendos **Çdo** (hapësira: 50 ft ose 20 m në fillim), **Gjerësia majtas** dhe **Gjerësia djathtas** (sa larg shkon çdo prerje nga boshti qendror).
3. Për të prerë një prerje në një stacion të caktuar, shkruaje te **Shto një stacion** (për shembull `2+35`) dhe shtyp {{key:Enter}}.

Prerjet bëhen në çdo shumëfish të plotë të hapësirës, në të dy skajet e aksit rrugor, në fillim dhe në fund të çdo kthese (PC dhe PT), dhe në stacionet që shton. Vijat e mostrës shfaqen në plan si vija gri përgjatë aksit rrugor; dalin gjithashtu në DXF, DWG dhe PDF në shtresën C-ROAD-SCTN. Çdo ndryshim është një hap: {{key:Mod+Z}} e zhbën.

## Pamja e prerjes

Hape me {{ui:Pamja e prerjes}} te **Vetitë** e aksit rrugor, {{ui:Seksionet}} nën **Sipërfaqe** › {{ui:Më shumë}}, ose {{key:X}}. Zë vendin e pamjes së profilit nën plan.

- Lëviz nëpër prerje me shigjetat në shiritin e saj, listën e stacioneve, ose {{key:Left}} dhe {{key:Right}} me pamjen e prerjes të fokusuar ({{key:Home}} dhe {{key:End}} për të parën dhe të fundit).
- Vija gri është terreni ekzistues, vija e kuqe projekti. Hapja hijezohet portokalli, mbushja jeshile. Pikat e koridorit shënohen: CL (boshti qendror), EOP (skaji i asfaltit), SH (bankina) dhe DL (kontakti me terrenin).
- Koka jep stacionin, sipërfaqet e hapjes dhe mbushjes së kësaj prerjeje dhe zmadhimin vertikal. **Përshtat** mbush panelin; zgjidh 1× për ta parë prerjen në shkallë reale.
- Vija e trashë në plan tregon cila prerje është në ekran.
- **Zmadhimi dhe lëvizja:** rrota zmadhon rreth treguesit, dhe zvarritja lëviz pamjen. {{ui:Përshtat}} (ose {{key:F}}, ose një klikim i dyfishtë) e përshtat përsëri gjithë prerjen.

## Mat në një prerje

1. Kliko {{ui:Mas}} në shiritin e prerjes, ose shtyp {{key:M}}. Ndihmësi thotë "Kliko pikën e parë, pastaj të dytën."
2. Kliko dy pika. Secila kapet te fundi i një vije ose një pike koridori (CL, EOP, SH, DL); mbaj {{key:Alt}} për një pikë të lirë.
3. Leximi jep distancën horizontale (ΔH), distancën vertikale (ΔV), pjerrësinë në përqind me raportin e saj, dhe gjatësinë e drejtë, në njësitë e projektit.

Kliko përsëri për të nisur një matje të re. {{key:Esc}} e pastron, dhe {{key:M}} e fik Matjen.

## Fletët e prerjeve

{{ui:Fletët e prerjeve (PDF)}} nën **Vijat e mostrës** vendos çdo prerje në faqe PDF, në rreshta nga e majta në të djathtë dhe nga lart poshtë sipas rendit të stacioneve. Zgjidh **Letrën**, **Shkallën e planit** (shkalla horizontale e prerjeve) dhe **Zmadhimin e profilit** (1×, 2×, 5× ose 10×); dialogu thotë sa prerje futen në një faqe dhe sa faqe bëhen.

Çdo prerje tregon një rrjet me zhvendosjet dhe kotat, terrenin (me pika), projektin, hapjen dhe mbushjen e hijezuar (portokalli dhe jeshile), pikat e koridorit, dhe poshtë saj stacionin dhe sipërfaqet e hapjes dhe mbushjes. Çdo prerje në fletë vizatohet me të njëjtën madhësi, sa e lartë për më të madhen; kur kjo nuk futet në faqe me zmadhimin tuaj, CivilCraft përdor më të madhen që futet dhe e thotë këtë. Shiriti i titullit emëron aksin rrugor, stacionet në atë faqe, shkallët dhe "Fleta 1 nga 3".

## Ku matet hapja dhe mbushja

Një koridor mund të ketë shtresa nën asfalt: shtresat e rrugës, përbërësit e shabllonit, shtegun. Zgjidh **Vëllimet e matura deri te** në shiritin e prerjes për të zgjedhur deri ku shkojnë hapja dhe mbushja:

- **Sipërfaqja e poshtme** (fillimi): deri në fund të atyre përbërësve, kështu hapja përfshin thellësinë e strukturës së asfaltit.
- **Sipërfaqja e sipërme**: vetëm deri në majë të projektit, si më parë kur përbërësit llogaritej.

Sipërfaqet në kokë, vëllimet më poshtë, CSV dhe transporti masiv ndjekin të gjitha këtë zgjedhje, dhe ruhet me projektin.

## Vëllimet me sipërfaqet mesatare të skajeve

Midis dy prerjeve fqinje, vëllimi është mesatarja e dy sipërfaqeve të tyre shumëzuar me distancën midis stacioneve të tyre. Shiriti tregon totalet për aksin rrugor, dhe {{ui:CSV}} shkarkon sipërfaqet dhe vëllimet e çdo prerjeje me totale kumulative (cu yd për projekte në këmbë, metra kub për ato metrike).

**Vetitë** tregon të njëjtat totale pranë vëllimeve të metodës së rrjetit nga [Vëllimet e punës me tokë](topic:volumes). Të dyja janë përafrime të ndryshme: prerjet më të afërta i sjellin më pranë njëra-tjetrës, dhe në një rrugë të drejtë mbi terren të sheshtë janë të njëjta.

:::note
Hapja dhe mbushja llogariten vetëm brenda zonave të niveluara (vijave të kontaktit të një koridori ose platforme), si bën metoda e rrjetit. Pa koridor ose platformë projekti është terreni, kështu një prerje nuk tregon hapje ose mbushje.
:::

## Transporti masiv

**Transporti masiv** nën **Vijat e mostrës** vizaton diagramin e transportit masiv nga të njëjtat vëllime të sipërfaqeve të skajeve: përgjatë stacioneve, totali kumulativ i hapjes minus mbushjen.

- **Tkurrja (−) ose fryrja (+) e hapjes** thotë sa bën një cu yd hapje kur vendoset si mbushje: −10 % (vlera fillestare, vend-mbajtëse) do të thotë se tkurret në 0.9; guri që fryhet mund të jetë +5 %. Përdor shifrën e raportit tënd gjeoteknik.
- Aty ku vija ngrihet rruga është në hapje; ku bie, në mbushje. Mbi zero (hijezuar portokalli) dheu lëviz lart stacionit; nën zero (jeshile), poshtë stacionit.
- **Pikat e ekuilibrit** janë aty ku vija kalon zeron: midis dy prej tyre hapja dhe mbushja ekuilibrohen. Tabela liston çdo segment të ekuilibruar, vëllimin e lëvizur (pika e tij më e lartë ose më e ulët) dhe distancën mesatare të transportit (sipërfaqja e hijezuar e pjesëtuar me atë vëllim).
- Aty ku vija përfundon larg zeros, ajo që mbetet është **mbeturinë** (mbi) ose **huazim** (nën). Në atë segment të fundit llogaritet si i lëvizur vetëm dheu përtej nivelit ku përfundon.

**CSV** ruan ordinatën e masës në çdo prerje, segmentet dhe faktorin.
