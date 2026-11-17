---
title: Vandforsyningsledninger: tryk, flow og brandvandsmængde
summary: Tegn et trykledningsnet af samlinger, reservoirer, tanke, rør, pumper og trykreduktionsventiler på planen; CivilCraft beregner trykhøjder, tryk og flow (Hazen–Williams, sløjfede net), den brandvandsmængde, der er til rådighed, og et døgns forbrug. En laboratoriefunktion; alle resultater kræver en ingeniørs kontrol.
keywords: vand, vandledning, vanddistribution, trykledningsnet, trykrør, sløjfet net, hazen-williams, C-faktor, trykhøjdetab, restryk, brandvandsmængde, brandhane, forbrug, samling, reservoir, tank, pumpe, pumpekurve, trykreduktionsventil, prv, tilbageslagsventil, udvidet periode, epanet, inp, hastighed
from: df46bf6d
---

Vandforsyningsledninger er trykssiden af et sted: rør, der altid er fyldt, med vand skubbet igennem af et reservoir, en tank eller en pumpe. CivilCraft beregner trykhøjden og trykket ved hver samling og flowet i hvert rør, herunder sløjfede net, hvor vandet har mere end én vej at gå. Funktionen er i laboratoriet, mens den kontrolleres.

**Kun et beregningshjælpemiddel.** Alle tal kræver en kvalificeret ingeniørs kontrol: svaret er kun så godt som de forbrug, koter, rørdimensioner og ruhedsværdier, du har angivet, og en stationær model ved intet om vandslag, vandkvalitet eller en brandpumpes faktiske adfærd.

## Tegn nettet

1. Under **Overflade** › {{ui:Mere}} vælger du {{ui:Vandforsyningsledninger…}}. Vinduet forbliver åbent, mens du arbejder på planen.
2. Vælg {{ui:Reservoir}}, og klik på planen, hvor forsyningen er. Dets trykhøjde starter 100 ft (30 m) over terræn; ændr den under Egenskaber.
3. Vælg {{ui:Samling}}, og klik på hvert sted, hvor vand tages ud, eller rør mødes. En samling får sin kote fra terrænet; skriv en anden under Egenskaber for at overskrive den.
4. Vælg {{ui:Rør}}, klik på et knudepunkt, og derefter på det knudepunkt, det forbinder til. Værktøjet forbliver aktivt til næste rør. En {{ui:Pumpe}} og en {{ui:Trykreduktionsventil}} tegnes på samme måde, fra sugeknudepunktet (eller det opstrøms knudepunkt) til tryksidens knudepunkt (eller det nedstrøms knudepunkt). En {{ui:Tank}} placeres som en samling.
5. Vælg en samling, og skriv dens {{ui:Forbrug}} (gpm, eller L/s i et meterprojekt). Vælg et rør, og angiv dets {{ui:Diameter}} (in eller mm) og, hvis du kender den, dets Hazen–Williams C.

Hver ændring er ét fortrydelsestrin. Delete fjerner knudepunktet og de rør, der ender i det.

## Hvad hver del betyder

- **Rør.** Længden måles langs planen, medmindre du skriver en. C er Hazen–Williams-ruheden (130 til at starte med; ændr standarden i vinduet). En koefficient for mindre tab K lægger tabene fra bøjninger og fittings til. Sæt flueben ved **Tilbageslagsventil** for et rør, der ikke må lede vand baglæns; et **Lukket** rør fører intet.
- **Reservoir.** En kilde med en fast trykhøjde, den vandstand, det holder over datum. Det giver eller tager, hvad nettet har brug for.
- **Tank.** Et niveau, der ændrer sig i løbet af et døgn. I de stationære resultater er den en kilde på sit aktuelle niveau.
- **Pumpe.** Ét dimensioneringspunkt (flow og trykhøjde) giver den sædvanlige kurve gennem sig: trykhøjden ved nul flow er 133 % af dimensioneringstrykhøjden, og trykhøjden er nul ved to gange dimensioneringsflowet. En pumpe skubber aldrig vand baglæns.
- **Trykreduktionsventil.** Holder det tryk, du angiver nedstrøms, mens forsyningen er højere. Når forsyningen er lavere, er den åben og holder ikke noget; hvis vandet ville løbe baglæns, lukker den.

## Læs resultaterne

Vinduet viser hvert knudepunkts trykhøjde og tryk og hver forbindelses flow, hastighed og trykhøjdetab pr. 1,000 ft (eller pr. km), med samlingerne farvet på planen: grøn er mellem dit laveste og højeste tryk, rød under, gul over. Flowpile viser retningen. Vælg et knudepunkt eller et rør for at læse dets tal under Egenskaber.

Under tabellerne er en liste over, hvad du skal kigge på: lavt eller højt tryk, et rør hurtigere end din grænse, en samling afskåret fra alle kilder, eller en beregningsløser, der ikke konvergerede. De samme fund står i panelet Problemer. Angiv grænserne i vinduet (20 psi, 100 psi og 10 ft/s til at starte med; 140 kPa, 700 kPa og 3 m/s i et meterprojekt).

## Brandvandsmængde

{{ui:Brandvandsmængde…}} lægger et flow på ved én samling og viser trykket der og det laveste tryk et sted i nettet. Den finder også flowet, der er til rådighed ved den samling, mens det svageste knudepunkt i nettet bevarer det restryk, du angiver. Andre forbrug forbliver, som de er.

## Et døgns forbrug

{{ui:Et døgns forbrug…}} kører nettet time for time. Angiv forbrugsmønsteret i filens indstillinger (en liste af multiplikatorer, der gentages); tanke fyldes og tømmes med flowet ind og ud, og en pumpe kan følge et til/fra-mønster. En tank, der når sit højeste eller laveste niveau, nævnes på listen: CivilCraft lukker ikke dets indløb eller udløb for dig, så læs det som »denne tank er for lille, eller pumpen for stor«.

## EPANET-tekst

{{ui:Gem som EPANET-tekst (.inp)}} skriver nettet i det rene tekstformat, mange vandprogrammer læser, og {{ui:Åbn EPANET-tekst (.inp)…}} læser et. Kun det, CivilCraft modellerer, følger med: samlinger, reservoirer, tanke, rør, pumper med en trykhøjdekurve, trykreduktionsventiler, forbrugsmønstre og tiderne. Andre ventiltyper, pumper angivet med effekt og andre formler for trykhøjdetab nævnes og udelades. Filen skal bruge de samme enheder som projektet.

## Brandhaner, ventiler og fittings

Vælg en samling, og sæt flueben ved **Brandhane** for at sætte en dér; vælg en hovedledning, og tryk på **Tilføj på midten** for at sætte en ventil, en luftventil, en udtømningsventil eller en måler på den. De er objekter i nettet: de flyttes med det, og ét fortrydelsestrin fjerner dem.

Layoutet indebærer også fittings, og CivilCraft lister dem uden at blive bedt: et **T-stykke**, hvor tre hovedledninger mødes, et **kryds**, hvor fire gør, en **bøjning** (med sin vinkel), hvor to hovedledninger drejer 5° eller mere, en **reduktion**, hvor to dimensioner mødes, og en **prop** i en blindende. {{ui:Fittingsliste (CSV)}} tæller dem og hovedledningerne efter dimension. Det er, hvad layoutet indebærer, en mængdeopgørelse at kontrollere mod dine egne detaljer, ikke en liste at bestille efter.

Hovedledninger lægges i terræn minus en overdækning (4 ft eller 1.2 m), så de kan tegnes og modelleres i 3D; trykkene ovenfor afhænger aldrig af den.

## På planen og i filer

Planen, PDF'en og DWG eller DXF bærer hovedledningerne på **C-WATR-MAIN** med deres dimensioner på **C-WATR-TEXT**, brandhaner på **C-WATR-HYDR**, ventiler på **C-WATR-VALV** og fittings på **C-WATR-FITT**. LandXML-eksport skriver et vandrørsnet (en konstruktion for hvert knudepunkt, et rør for hver hovedledning, brandhaner navngivet); LandXML-import læser et tilbage som vandforsyningsledninger uden forbrug, pumper eller ventiler, som LandXML ikke bærer. IFC-eksporten skriver hovedledningerne som rørsegmenter, brandhaner, ventiler og fittings i ét vandsystem. Disse filer er kontrolleret mod vores egen læser og skrivere; prøv dem i dine andre programmer, og fortæl os, hvad de melder.

## Hvad der endnu ikke findes

Vandkvalitet og alder, styring og regler ud over en pumpes til/fra-mønster, andre ventiltyper, forbrug afhængigt af tryk, rør med skiftende diameter og spildevandsflow over tid. Se [Ikke lavet endnu](topic:not-built-yet). Dimensionerende spildevandsflow, som er en anden beregning, findes i [Dimensionerende spildevandsflow](topic:sanitary-design).
