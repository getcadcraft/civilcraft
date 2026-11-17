---
title: Vannspeilsprofiler i elver
summary: Modeller en elv fra terrengoverflaten og beregn stasjonære vannspeilsprofiler med standard step-metoden: vannstander, energi, hastigheter, Froude-tall og flomutbredelsen i planen. En laboratoriefunksjon; hvert resultat krever en ingeniørs gjennomgang.
keywords: vollgrav, ineffektivt strømningsareal, tverrprofilredigering, elv, hydraulikk, vannspeilsprofil, tilbakeslag, standard step, stasjonær strømning, 1D, tverrprofiler, manning, ruhet, transportevne, kritisk dybde, normaldybde, froude, energilinje, flomutbredelse, flomslette, oversvømmelse, brinkstasjoner, reach-lengder, innsnevring, utvidelse, subkritisk, superkritisk, blandet regime, hydraulisk sprang
from: fb8bf425
---

CivilCraft beregner stasjonære, endimensjonale vannspeilsprofiler langs en elv: for hver strømning du oppgir, vannstanden i hvert tverrprofil, fra energibalansen mellom nabotverrprofiler (standard step-metoden). Den er i laboratoriet mens den kontrolleres.

**Kun som beregningshjelp.** Vannstandene krever gjennomgang av en kvalifisert ingeniør før noen stoler på dem: en 1D-modell er så god som sine tverrprofiler, ruhetsverdier, reach-lengder og randbetingelser, og den kjenner ikke til broer, kulverter eller strømning som forlater elven.

## Tegn elven

1. Bygg terrengoverflaten først (punkter, bruddlinjer, eller en TIN du har åpnet).
2. Under **Terrengmodell** › {{ui:Mer}}, velg {{ui:Elv}}.
3. Klikk langs elvens midtlinje **fra oppstrøms til nedstrøms**, og trykk deretter {{key:Enter}} eller dobbeltklikk.

CivilCraft kutter et tverrprofil vinkelrett på midtlinjen hver 50 m (200 ft), 100 m (300 ft) til hver side, fra terrenget. Elvestasjonene måles fra nedstrøms ende, så de vokser oppstrøms. Brinkene starter som et gjett 10 m (30 ft) på hver side av hvert tverrprofils laveste punkt.

For å legge til et tverrprofil der elven smalner inn eller en konstruksjon står, velg elven, klikk {{ui:Legg til et tverrprofil}} og tegn en snittlinje over den (begge veier: den snus til å gå venstre mot høyre sett nedstrøms).

## Sett opp elven

Velg elven for å se den i **Egenskaper**:

- **Strømningsregime**: subkritisk (det vanlige: beregnet oppstrøms fra nedstrøms randbetingelse), superkritisk (beregnet nedstrøms fra oppstrøms randbetingelse) eller blandet (begge, så den med størst spesifikk kraft i hvert tverrprofil; en forhåndsvisning).
- **Strømningsprofiler**: et navn og en strømning for hver (for eksempel en 10-års og en 100-års strømning), og randbetingelsen i nedstrøms ende (og oppstrøms ende når regimet ikke er subkritisk): **Normaldybde** med en energihelning (bunnhelningen er et første gjett), en **Kjent vannoverflate**-kote, eller **Kritisk dybde**.
- **Tverrprofiler fra terrenget**: avstanden, hvor langt til venstre og høyre, gjetningen for brinkene og de to Manning n-verdiene; {{ui:Skjær tverrprofilene på nytt}} erstatter tverrprofilene (ett steg i Angre).
- **Tverrprofiltabellen**: for hvert tverrprofil, forskyvningene til venstre og høyre brink, n for kanalen og n for overbredden, reach-lengdene til neste tverrprofil nedstrøms (venstre overbredde, kanal, høyre overbredde; målt fra planen for å starte) og sammentrekningskoeffisientene og utvidelseskoeffisientene (0,1 og 0,3 til å begynne med: jevne overganger). {{ui:Rediger}} åpner tverrprofilredigereren (neste); en prikk etter den betyr at tverrprofilet har en vollgrav eller et ineffektivt område.

Hver endring er ett steg i Angre ({{key:Mod+Z}}).

## Rediger et tverrprofil: brinker, vollgraver og ineffektive områder

{{ui:Rediger}} på et tverrprofil tegner terrenget og lar deg dra det solveren leser: **venstre og høyre brink** (de deler tverrprofilet i venstre overbredde, hovedkanalen og høyre overbredde), en **vollgrav** på hver side og **ineffektive strømningsområder**. Hvert håndtak kan også flyttes med piltastene, og hver verdi kan skrives inn ved siden av plottet. {{ui:Bruk}} er ett steg i Angre.

- En **vollgrav** har et sted (forskyvning) og en kronekote. Terrenget bortenfor den, bort fra elven, er avskåret fra elven mens vannspeilet er under kronen: arealet, den våte omkretsen og transportevnen er holdt utenfor. Over kronen teller hele tverrprofilet igjen. En vollgrav står utenfor brinken den beskytter; en som ligger innenfor brinkene merkes.
- Et **ineffektivt strømningsområde** holder vann, men bærer ingen strømning (en lomme bak en fylling, dødt vann ved siden av en brotilkomst). Gi de to forskyvningene og, om du vil, en vannstand under hvilken det er ineffektivt ({{ui:alltid}} når feltet er tomt): over den nivået strømmer det som resten. Et område som dekker deler av hovedkanalen merkes.
- Mellom to tverrprofiler etterlater flomutbredelsen tørt terrenget bak en vollgrav som begge tverrprofilene har, mens vannspeilet der er under kronen (linjen mellom de to kronene er rett).

## Beregn og les resultatene

Klikk {{ui:Vannspeilsprofiler}}. For profilet du velger får du:

- et **plott** langs elven (strømning venstre mot høyre): kanalbunn, brinker, vannspeil, energilinje og kritisk vannspeil; tverrprofiler holdt på kritisk dybde er ringet inn;
- en **tabell** per tverrprofil: elvestasjon, strømning, kanalbunn, vannspeil, kritisk vannspeil, energilinje, dybde, hastighet i kanalen og totalt, Froude-tallet for kanalen, strømningsareal, bredde i toppen, strømningen i hver overbredde og i kanalen, energihelningen, og advarsler;
- **advarsler** med vanlige ord, for eksempel et tverrprofil satt til kritisk dybde, vann over et tverrprofils ender, eller en stor endring i transportevne mellom to tverrprofiler (legg til tverrprofiler mellom).

{{ui:Tabell (CSV)}}, {{ui:Rapport}} (ren tekst med metoden, randbetingelsene og alle tabellene) og {{ui:Plott (SVG)}} lagrer til nedlastingene dine. Hver av dem bærer gjennomgangslinjen.

Kryss av {{ui:Vis flomutbredelsen}} i **Egenskaper** for å skravere det våte området i planen for det valgte profilet, med vannlinjen tegnet der dybden er null. Mellom tverrprofiler er vannspeilet vannrett tvers over elven og endrer seg lineært med elvestasjonen. Terreng bak en vollgrav er tørt mens vannet er under kronen. Annen lavtliggende mark innenfor elvens korridor som vannet ikke når (for eksempel bak en veifylling) skraveres likevel: kontroller den.

## På tegningen og i Problemer

Elvens linjer går til planen, PDF-en og DWG-en på egne lag: **C-WATR-CNTR** (midtlinjen), **C-WATR-SCTN** (hver snittlinje, med elvestasjonen) og **C-WATR-FLOD** (vannlinjen for flomutbredelsen, når {{ui:Vis flomutbredelsen}} er avkrysset for et profil). Elvens advarsler (et tverrprofil satt til kritisk dybde, vann over tverrprofilenders ender, en endring i transportevne som krever flere tverrprofiler, en energibalanse som ikke gikk opp, en vollgrav innenfor brinkene) går også til panelet **Problemer**, om elven og plassert ved tverrprofilet de kommer fra.

## Slik beregnes det

- Energi mellom to tverrprofiler: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Transportevne ved oppdeling: hver overbredde deles der n endrer seg, K = Σ (1/n)·A·R^(2/3) (1,486/n i US-enheter); kanalen er ett stykke, med en sammensatt n når dens n endrer seg. α kommer av hvordan transportevnen deles.
- Friksjonshelning ved gjennomsnittlig transportevne, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², over den strømningsvektede reach-lengden.
- Sammentrekningskoeffisient når strømningen akselererer nedstrøms, utvidelse når den bremser.
- Kritisk dybde = minst spesifikk energi. Hver vannstand løses på et intervall, så den aldri hopper til feil side av kritisk; når ingen løsning finnes settes den til kritisk dybde og merkes.

Programmet er kontrollert mot Mannings normaldybde, kritisk dybde i en rektangulær kanal, og Chows tilbakeslagseksempel (*Open-Channel Hydraulics*, 1959, kapittel 10), integrert uavhengig. Den samme metoden brukes av de vanlige 1D-elveprogrammene, så en håndberegning eller en students notater kan overføres.

## Kulverter og broer

I elvens **Egenskaper**, under **Kulverter og broer**, legger {{ui:Legg til en kulvert}} eller {{ui:Legg til en bru}} en mellom to tverrprofiler (hver strekning beholder minst to). Profilet under den er uendret; vannspeilet rett ovenfor kommer fra konstruksjonen, og profilet fortsetter oppstrøms derfra. **Resultater** legger til en tabell for hver konstruksjon: vannstanden nedstrøms, vannstanden oppstrøms, hvilken kontroll som styrer, strømningen gjennom åpningen og strømningen over veien eller dekket. Kun subkritisk strømning.

- **Kulvert** (boks eller rund, ett eller flere like løp). Kontroll ved innløp er overløpsstrømning mens innløpet er fritt, og åpningsstrømning når det er neddykket, blandet mellom en oppstrømsvannstand på én og halvannen ganger stigningen. Utløpskontroll er energibalansen: innløpstap, friksjon og utløpshastighetshøyde, over den høyeste av nedstrøms vannstand og midthøyden for kritisk dybde og kronen, minus fallet langs løpet. Oppstrøms vannstand er den største av de to. Kryss av **Vann kan gå over veien**, så deler veiens overløpsstrømning strømningen med løpene.
- **Bro.** Åpningen er tverrprofilet under broen, kuttet ved landkarene, med hver pilar som et område som ikke bærer strømning. Vannspeilet i åpningen kommer fra tverrprofilet under (utvidelseskoeffisient), og tverrprofilet over fra åpningen (sammentrekningskoeffisient). Hvis åpningen ikke klarer strømningen ved den nedstrøms vannstanden, går den på kritisk dybde og broen merkes som stoppet. Når vannet når underkanten av bjelkelaget, er strømningen trykkstrømning (sluketype mens nedstrøms vannstand er under underkanten, neddykket over den), og vann over dekket legger til overløpsstrømning; oppstrøms vannstand er den der de til sammen gir strømningen.

Koeffisientene (utløp, innløpstap, overløp) er avrundede standardverdier du skriver inn selv. Endre dem for din prosjektering. De er ikke de tilpassede diagrammene som kulvertprosjekteringshåndbøker trykker, så behandle oppstrøms vannstand nær grensen til en kulvert som et anslag. Vann over en vei eller et dekk, et neddykket innløp, en stoppet åpning og rask strømning i et løp vises i **Problemer**.

## Ustasjonær strømning

{{ui:Ustasjonær strømning…}} i elvens **Egenskaper** sender en flomhydrograf nedover tverrprofilene. Skriv inn tilløpet som timer og strømninger, ett par per linje, nedstrøms helning (normaldybde) og hvor lenge det skal kjøre. Det starter fra det stasjonære vannspeilet ved første strømning og løser de fulle endimensjonale ligningene (det implisitte firepunktsskjemaet, vektet 0,6 i tid). Du får toppvannstanden og -strømningen i hvert tverrprofil med timen hvert av dem inntreffer, et plott av strømningen i de to endene, og volumkontrollen (inn, ut og endringen lagret). Den kontrolleres for at stasjonær strømning forblir stasjonær, at et sprang i tilløpet ender i det stasjonære profilet for den nye strømningen, at volumet går opp, og for farten på flomBølgen mot kinematisk bølge. Subkritisk strømning, én strekning, ingen sidetilløp, og ingen kulverter eller broer inne i kjøringen.

## Sammenløp

Strekninger som slår sammen strømningen til ett utløp: strømningene legges sammen, og vannspeilet ved hodet av den nedstrøms strekningen føres opp til endene av strekningene som slutter seg til den (samme vannspeil ved sammenløpet, den enkle metoden: ingen vinkel, ingen bevegelsesmengde, så den passer ved lave Froude-tall). Modellen og testene ligger på plass (`river-structures.js`); et panel for å slå sammen to elver i planen er ikke bygget ennå.

## Ikke bygget ennå

Overløp og luker som egne konstruksjoner, et panel for sammenløp, konstruksjoner inne i en ustasjonær kjøring, og ustasjonær superkritisk strømning. En kjøring med blandet regime merker et hydraulisk sprang mellom to tverrprofiler, men plasserer det ikke.

**Der elver møtes.** I en elvs Egenskaper nevner «Strømmer inn i» elven den slår seg sammen med. Elvene som slår seg sammen løses sammen: elven de strømmer inn i bærer summen av strømningene deres, og hver av dem ender ved vannspeilet til den elvens første tverrprofil (metoden for lik vannoverflate; den utelater vinkelen og bevegelsesmengden til strømningene). For å slå sammen en hovedelv og en bekk, tegn en kort elv nedenfor sammenløpet og la begge strømme inn i den. Resultatene viser en sammenløpstabell. Standardverdiene i disse resultatene (sammentrekning 0,1, utvidelse 0,3, én kanal i ett stykke med en sammensatt ruhet, blandet regime etter spesifikk kraft) står til en ingeniør har gjennomgått dem, og Resultatene sier det.
