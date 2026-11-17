---
title: Vannledninger: trykk, vannmengder og brannvann
summary: Tegn et trykknett av knutepunkter, reservoarer, tanker, rør, pumper og trykkreduksjonsventiler på planen; CivilCraft regner ut trykkhøyder, trykk og vannmengder (Hazen–Williams, sløyfede nett), vannmengden som er tilgjengelig for brann, og et døgns forbruk. En laboratoriefunksjon; alle resultater trenger kontroll av en ingeniør.
keywords: vann, vannledning, vannfordeling, trykknett, trykkrør, sløyfet nett, hazen-williams, C-faktor, trykktap, restrykk, brannvann, brannhydrant, forbruk, knutepunkt, reservoar, tank, pumpe, pumpekurve, trykkreduksjonsventil, prv, tilbakeslagsventil, utvidet periode, epanet, inp, hastighet
from: df46bf6d
---

Vannledninger er trykksiden av et område: rør som alltid er fulle, med vann presset gjennom av et reservoar, en tank eller en pumpe. CivilCraft regner ut trykkhøyde og trykk i hvert knutepunkt og vannmengden i hvert rør, også for sløyfede nett der vannet har mer enn én vei å gå. Funksjonen er i laboratoriet mens den kontrolleres.

**Bare et beregningshjelpemiddel.** Hvert tall trenger kontroll av en kvalifisert ingeniør: svaret er bare så godt som forbruket, kotene, rørdimensjonene og ruhetsverdiene du oppga, og en stasjonær modell vet ingenting om vannslag, vannkvalitet eller hvordan en brannpumpe faktisk oppfører seg.

## Tegn nettet

1. Under **Terrengmodell** › {{ui:Mer}}, velg {{ui:Vannledninger…}}. Vinduet forblir åpent mens du jobber på planen.
2. Velg {{ui:Reservoar}} og klikk på planen der forsyningen er. Trykkhøyden starter 100 ft (30 m) over terrenget; endre den under Egenskaper.
3. Velg {{ui:Knutepunkt}} og klikk på hvert sted der vann tas ut eller rør møtes. Et knutepunkt tar kote fra terrenget; skriv inn en annen under Egenskaper for å overstyre den.
4. Velg {{ui:Rør}}, klikk på et knutepunkt, og deretter på knutepunktet det går til. Verktøyet forblir på for neste rør. En {{ui:Pumpe}} og en {{ui:Trykkreduksjonsventil}} tegnes på samme måte, fra sug- (eller oppstrøms) knutepunktet til trykk- (eller nedstrøms) knutepunktet. En {{ui:Tank}} plasseres som et knutepunkt.
5. Velg et knutepunkt og skriv inn dets {{ui:Forbruk}} (gpm, eller L/s i et meterprosjekt). Velg et rør og sett dets {{ui:Diameter}} (in, eller mm) og, hvis du kjenner den, dets Hazen–Williams C.

Hver endring er ett angrsteg. Delete fjerner knutepunktet og rørene som ender i det.

## Hva hver del betyr

- **Rør.** Lengden måles langs planen med mindre du skriver inn en. C er Hazen–Williams-ruheten (130 til å begynne med; endre standardverdien i vinduet). En tapskoeffisient K legger til tapene i bøyer og rørdeler. Kryss av **Tilbakeslagsventil** for et rør som ikke må føre vann bakover; et **Stengt** rør fører ingenting.
- **Reservoar.** En kilde med fast trykkhøyde, vannstanden den holder over referanseplanet. Den gir eller tar det nettet trenger.
- **Tank.** En vannstand som endrer seg over et døgn. I de stasjonære resultatene er den en kilde på sitt nåværende nivå.
- **Pumpe.** Ett dimensjonerende punkt (vannmengde og trykkhøyde) gir den vanlige kurven gjennom seg: trykkhøyden ved null vannmengde er 133 % av dimensjonerende trykkhøyde, og trykkhøyden er null ved dobbel dimensjonerende vannmengde. En pumpe presser aldri vann bakover.
- **Trykkreduksjonsventil.** Holder trykket du setter nedstrøms mens forsyningen er høyere. Når forsyningen er lavere, er den åpen og holder ikke noe; hvis vannet ville gått bakover, stenger den.

## Les resultatene

Vinduet viser trykkhøyde og trykk for hvert knutepunkt og vannmengde, hastighet og trykktap for hver forbindelse per 1,000 ft (eller per km), med knutepunktene farget på planen: grønt er mellom ditt laveste og høyeste trykk, rødt under, gult over. Strømningspiler viser retningen. Velg et knutepunkt eller rør for å lese tallene i Egenskaper.

Under tabellene er en liste over hva du bør se på: lavt eller høyt trykk, et rør raskere enn grensen din, et knutepunkt avskåret fra alle kilder, eller en løser som ikke konvergerte. De samme funnene står i panelet Problemer. Sett grensene i vinduet (20 psi, 100 psi og 10 ft/s til å begynne med; 140 kPa, 700 kPa og 3 m/s i et meterprosjekt).

## Brannvann

{{ui:Brannvann…}} tegner en vannmengde ved ett knutepunkt og viser trykket der og det laveste trykket hvor som helst i nettet. Den finner også vannmengden som er tilgjengelig i det knutepunktet, mens det svakeste punktet i nettet beholder det restrykket du oppgir. Andre forbruk forblir som de er.

## Et døgn med forbruk

{{ui:Et døgn med forbruk…}} kjører nettet time for time. Oppgi forbruksmønsteret i filens innstillinger (en liste med multiplikatorer som gjentas); tanker fylles og tømmes med vannmengden inn og ut, og en pumpe kan følge et på/av-mønster. En tank som når sitt høyeste eller laveste nivå, nevnes i listen: CivilCraft stenger ikke inn- eller utløpet for deg, så les det som "denne tanken er for liten eller pumpen for stor".

## EPANET-tekst

{{ui:Lagre som EPANET-tekst (.inp)}} skriver nettet i det rene tekstformatet mange vannprogrammer leser, og {{ui:Åpne EPANET-tekst (.inp)…}} leser et. Bare det CivilCraft modellerer, blir med over: knutepunkter, reservoarer, tanker, rør, pumper med en trykkhøydekurve, trykkreduksjonsventiler, forbruksmønstre og tidene. Andre ventiltyper, pumper gitt med effekt, og andre formler for trykktap nevnes og utelates. Filen må bruke de samme enhetene som prosjektet.

## Brannhydranter, ventiler og rørdeler

Velg et knutepunkt og kryss av **Brannhydrant** for å plassere en der; velg en hovedledning og trykk **Legg til i midten** for å plassere en ventil, luftventil, avblåsningsventil eller en måler på den. De er objekter i nettet: de flytter seg med det, og ett angrsteg fjerner dem.

Oppsettet antyder også rørdeler, og CivilCraft lister dem uten å bli bedt om det: et **T-stykke** der tre hovedledninger møtes, et **kryss** der fire gjør det, en **bøy** (med sin vinkel) der to hovedledninger svinger 5° eller mer, en **reduksjon** der to dimensjoner møtes, og en **blindplugg** i en blindende. {{ui:Fittingsliste (CSV)}} teller dem og hovedledningene etter dimensjon. Dette er det oppsettet antyder, en mengdeuttak å sjekke mot dine egne detaljer, ikke en liste å bestille fra.

Hovedledninger legges på terrenget minus en overdekning (4 ft eller 1.2 m), så de kan tegnes og modelleres i 3D; trykkene over avhenger aldri av den.

## På planen og i filer

Planen, PDF-en og DWG- eller DXF-filen bærer hovedledningene på **C-WATR-MAIN** med sine dimensjoner på **C-WATR-TEXT**, hydranter på **C-WATR-HYDR**, ventiler på **C-WATR-VALV** og rørdelene på **C-WATR-FITT**. LandXML ut skriver et vannrørnett (en konstruksjon for hvert knutepunkt, et rør for hver hovedledning, hydrantene navngitt); LandXML inn leser det tilbake som vannhovedledninger, uten forbruk, pumper eller ventiler, som LandXML ikke bærer. IFC-eksporten skriver hovedledningene som rørsegmenter, hydranter, ventiler og rørdeler i ett vannsystem. Disse filene er kontrollert mot våre egne lesere og skrivere; prøv dem i dine andre programmer og fortell oss hva de sier.

## Det som ikke finnes ennå

Vannkvalitet og alder, styring og regler utover en pumpes på/av-mønster, andre ventiltyper, forbruk etter trykk, rør med skiftende diameter, og spillvannsmengder over tid. Se [Ikke bygget ennå](topic:not-built-yet). Dimensjonerende spillvannsmengder, som er en annen beregning, finnes i [Dimensjonerende spillvannsmengder](topic:sanitary-design).
