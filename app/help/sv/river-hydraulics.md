---
title: Vattenytprofiler i floder
summary: Modellera en flod från markytan och beräkna stationära vattenytprofiler med standardstegmetoden: vattennivåer, energi, hastigheter, Froudetal och översvämningsutbredningen i planen. En labbfunktion; varje resultat kräver granskning av en ingenjör.
keywords: vall, verkningslöst flödesområde, sektionseditor, flod, hydraulik, vattenytprofil, uppdämning, standardsteg, stationärt flöde, 1D, tvärsektioner, Manning, råhet, konveyans, kritiskt djup, normaldjup, Froude, energilinje, översvämningsutbredning, översvämningsslätt, översvämning, strandlinjer, sträcklängder, sammandragning, utvidgning, underkritiskt, överkritiskt, blandad regim, hydraulisk språng
from: fb8bf425
---

CivilCraft beräknar stationära, endimensionella vattenytprofiler längs en flod: för varje flöde du anger får du vattennivån vid varje tvärsektion, från energibalansen mellan närliggande sektioner (standardstegmetoden). Den finns i labbet medan den kontrolleras.

**Endast underlag för projektering.** Vattennivåerna behöver granskas av en kvalificerad ingenjör innan någon förlitar sig på dem: en 1D-modell är så bra som dess sektioner, råhetsvärden, sträcklängder och randvillkor, och den känner inte till broar, trummor eller flöde som lämnar floden.

## Rita floden

1. Bygg den befintliga markytan först (punkter, brytlinjer eller en TIN du öppnat).
2. Under **Terrängmodell** › {{ui:Mer}}, välj {{ui:Flod}}.
3. Klicka längs flodens mittlinje **från uppströms till nedströms**, tryck sedan på {{key:Enter}} eller dubbelklicka.

CivilCraft skär ut en sektion vinkelrät mot mittlinjen var 50 m (200 ft), med 100 m (300 ft) åt varje sida, från marken. Flodstationer mäts från nedströmsänden, så de växer uppströms. Stränderna börjar som en gissning 10 m (30 ft) på vardera sidan om varje sektions lägsta punkt.

För att lägga till en sektion där floden smalnar eller där en konstruktion ligger, markera floden, klicka på {{ui:Lägg till en sektion}} och rita en skärlinje tvärs över den (åt vilket håll som helst: den vrids så att den går från vänster till höger sett nedströms).

## Ställ in floden

Markera floden för att se den i **Egenskaper**:

- **Flödesregim**: underkritiskt (det vanliga: beräknas uppströms från nedströmsrandvillkoret), överkritiskt (beräknas nedströms från uppströmsrandvillkoret) eller blandat (båda, sedan den med större specifik kraft i varje sektion; en förhandsvisning).
- **Flödesprofiler**: ett namn och ett flöde för varje (till exempel ett 10-årsflöde och ett 100-årsflöde), och randvillkoret i nedströmsänden (och i uppströmsänden när regimen inte är underkritisk): **Normaldjup** med en energilutning (bottenlutningen är en första gissning), en **Känd vattenyta** eller **Kritiskt djup**.
- **Sektioner från marken**: avståndet, hur långt åt vänster och höger, strandgissningen och de två Mannings n-värdena; {{ui:Skär sektionerna igen}} ersätter sektionerna (ett steg i ångra).
- **Sektionstabellen**: för varje sektion, strandförskjutningarna till vänster och höger, n för fåran och n för översvämningsytan, sträcklängderna till nästa sektion nedströms (vänster översvämningsyta, fåra, höger översvämningsyta; mätt från planen för att börja) och sammandragnings- och utvidgningskoefficienterna (0.1 och 0.3 att börja med: jämna övergångar). {{ui:Redigera}} öppnar sektionseditorn (nästa); en punkt efter den betyder att sektionen har en vall eller ett verkningslöst område.

Varje ändring är ett steg i ångra ({{key:Mod+Z}}).

## Redigera en sektion: stränder, vallar och verkningslösa områden

{{ui:Redigera}} på en sektion ritar dess mark och låter dig dra det som lösaren läser: den **vänstra och högra stranden** (de delar sektionen i den vänstra översvämningsytan, huvudfåran och den högra översvämningsytan), en **vall** på vardera sidan och **verkningslösa flödesområden**. Varje handtag kan också flyttas med piltangenterna, och varje tal kan skrivas in bredvid kurvan. {{ui:Verkställ}} är ett steg i ångra.

- En **vall** har en plats (förskjutning) och en krönhöjd. Marken bortom den, bort från floden, skiljs från floden medan vattenytan ligger under krönet: dess area, våta omkrets och konveyans utelämnas. Över krönet räknas hela sektionen igen. En vall ligger utanför stranden den skyddar; en som ligger innanför stränderna flaggas.
- Ett **verkningslöst flödesområde** håller vatten men bär inget flöde (en ficka bakom en vall, stillastående vatten bredvid en broanfart). Ange dess två förskjutningar och, om du vill, en vattennivå under vilken det är verkningslöst ({{ui:alltid}} när fältet är tomt): över den nivån flödar det som resten. Ett som täcker en del av huvudfåran flaggas.
- Mellan två sektioner lämnar översvämningsutbredningen torr marken bakom en vall som båda sektionerna har, medan vattenytan där ligger under krönet (linjen mellan de två krönen är rak).

## Beräkna och läs resultaten

Klicka på {{ui:Vattenytprofiler}}. För den profil du väljer får du:

- en **kurva** längs floden (flöde från vänster till höger): fårans botten, stränder, vattenyta, energilinje och kritisk vattenyta; sektioner som hålls vid kritiskt djup är inringade;
- en **tabell** per sektion: flodstation, flöde, fårans botten, vattenyta, kritisk vattenyta, energilinje, djup, hastighet i fåran och totalt, Froudetal för fåran, flödesarea, överkantsbredd, flödet i varje översvämningsyta och i fåran, energilutning och varningar;
- **varningar** i klartext, till exempel en sektion satt till kritiskt djup, vatten över en sektions ändar, eller en stor förändring av konveyans mellan två sektioner (lägg till sektioner mittemellan).

{{ui:Tabell (CSV)}}, {{ui:Rapport}} (oformaterad text med metoden, randvillkoren och varje tabell) och {{ui:Diagram (SVG)}} sparas i dina nedladdningar. Var och en innehåller granskningsraden.

Markera {{ui:Visa översvämningsutbredningen}} i **Egenskaper** för att skugga den våta ytan i planen för den valda profilen, med vattenlinjen ritad där djupet är noll. Mellan sektioner är vattenytan plan över floden och ändras linjärt med flodstationen. Mark bakom en vall lämnas torr medan vattnet ligger under krönet. Annan låg mark inom flodens korridor som vattnet inte kan nå (bakom en vägbank till exempel) skuggas fortfarande: kontrollera den.

## I ritningen och i Problem

Flodens linjer går till planen, PDF:en och DWG:n på egna lager: **C-WATR-CNTR** (mittlinjen), **C-WATR-SCTN** (varje skärlinje, med dess flodstation) och **C-WATR-FLOD** (översvämningsutbredningens vattenlinje, när {{ui:Visa översvämningsutbredningen}} är ikryssad för en profil). Flodens varningar (en sektion satt till kritiskt djup, vatten över sektionsändarna, en förändring av konveyans som kräver fler sektioner, en energibalans som inte gick ihop, en vall innanför stränderna) går också till panelen **Problem**, som gäller floden och placeras vid den sektion de kommer från.

## Så beräknas det

- Energi mellan två sektioner: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Konveyans genom uppdelning: varje översvämningsyta delas där dess n ändras, K = Σ (1/n)·A·R^(2/3) (1.486/n i US-enheter); fåran är en del, med ett sammansatt n när dess n ändras. α kommer från hur konveyansen delas.
- Friktionslutning med medelkonveyans, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², över den flödesviktade sträcklängden.
- Sammandragningskoefficient när flödet ökar i hastighet nedströms, utvidgningskoefficient när det saktar ner.
- Kritiskt djup = minsta specifika energi. Varje vattennivå löses på ett intervall, så den hoppar aldrig till fel sida av kritiskt; när inget svar finns sätts den till kritiskt djup och flaggas.

Programmet kontrolleras mot Mannings normaldjup, kritiskt djup i en rektangulär fåra och Chows uppdämningsexempel (*Open-Channel Hydraulics*, 1959, kapitel 10), integrerat oberoende. Samma metod används av de vanliga 1D-flodprogrammen, så en handräkning eller en students anteckningar går att använda.

## Trummor och broar

I flodens **Egenskaper**, under **Trummor och broar**, lägger {{ui:Lägg till en trumma}} eller {{ui:Lägg till en bro}} en konstruktion mellan två sektioner (varje sträcka behåller minst två). Profilen under den är oförändrad; vattenytan precis ovanför den kommer från konstruktionen, och profilen fortsätter uppströms därifrån. **Resultat** lägger till en tabell för varje konstruktion: nedströms vattenyta, uppströms vattennivå, vilken styrning som avgör, flödet genom öppningen och flödet över vägen eller däcket. Endast underkritiskt flöde.

- **Trumma** (låda eller rund, en eller flera lika trumrör). Inloppsstyrning är överfallsflöde medan inloppet är fritt och öppningsflöde när det är dränkt, blandat mellan en uppströms vattennivå på en till en och en halv gånger stighöjden. Utloppsstyrning är energibalansen: inloppsförlust, friktion och utloppshastighetshöjd, över det högre av nedströms vattenyta och mitthöjden för kritiskt djup och krönet, minus fallet längs trumröret. Uppströms vattenyta är den större av de två. Bocka i **Vatten kan gå över vägen** och vägens överfallsflöde delar flödet med trumrören.
- **Bro.** Öppningen är sektionen under bron, skuren vid landfästena, med varje pelare som ett område utan flöde. Vattenytan i öppningen kommer från sektionen nedanför (utvidgningskoefficient), och sektionen ovanför från öppningen (sammandragningskoefficient). Om öppningen inte kan släppa igenom flödet vid den nedströms vattenytan går den vid kritiskt djup, och bron flaggas som strypt. Om vattnet når brons undersida är flödet tryckflöde (sluss-typ medan den nedströms vattenytan ligger under undersidan, dränkt över den), och vatten över däcket lägger till överfallsflöde; den uppströms nivån är den där de tillsammans blir lika med flödet.

Koefficienterna (flöde, inloppsförlust, överfall) är avrundade standardvärden som du skriver in. Ändra dem för din projektering. De är inte de anpassade diagram som trumhandböcker trycker, så behandla uppströms vattennivån för en trumma nära sin gräns som en uppskattning. Vatten över en väg eller ett däck, ett dränkt inlopp, en strypt öppning och snabbt flöde i ett trumrör visas i **Problem**.

## Instationärt flöde

{{ui:Instationärt flöde…}} i flodens **Egenskaper** låter ett flödeshydrograf gå nedför sektionerna. Skriv in tillflödet som timmar och flöden, ett par per rad, nedströmslutningen (normaldjup) och hur länge den ska köra. Den startar från den stationära vattenytan vid första flödet och löser de fullständiga endimensionella ekvationerna (det implicita fyrpunktsschemat, viktat 0.6 i tid). Du får den högsta vattennivån och flödet i varje sektion med timmen då varje sker, en kurva över flödet i de två ändarna och volymkontrollen (in, ut och den lagrade förändringen). Den kontrolleras mot att stationärt flöde förblir stationärt, mot ett steg i tillflödet som slutar i den stationära profilen för det nya flödet, mot att volymen går ihop och mot hastigheten på flodvågen jämfört med den kinematiska vågen. Underkritiskt flöde, en sträcka, inget sidotillflöde och inga trummor eller broar inom körningen.

## Sammanflöden

Sträckor som för samman flödet till ett utlopp: flödena adderas, och vattenytan vid början av den nedströms sträckan förs upp till ändarna av de sträckor som ansluter till den (samma vattenyta vid sammanflödet, den enkla metoden: ingen vinkel, ingen rörelsemängd, så den passar låga Froudetal). Modellen och testerna finns på plats (`river-structures.js`); en panel för att foga samman två floder i planen är inte byggd ännu.

## Finns inte ännu

Dammar och grindar som egna konstruktioner, en panel för sammanflöden, konstruktioner inom en instationär körning och överkritiskt instationärt flöde. En körning med blandad regim flaggar ett hydrauliskt språng mellan två sektioner men placerar det inte.

**Var floder möts.** I en flods Egenskaper anger "Flödar in i" vilken flod den möter. Floderna som möts löses tillsammans: floden de flödar in i bär summan av deras flöden, och var och en av dem slutar vid vattenytan i den flodens första sektion (metoden med lika vattenyta; den utelämnar vinkeln och rörelsemängden hos flödena). För att foga samman en huvudflod och ett vattendrag, rita en kort flod nedanför sammanflödet och låt båda flöda in i den. Resultaten visar en sammanflödestabell. Standardvärdena i dessa resultat (sammandragning 0.1, utvidgning 0.3, en fåra i en del med en sammansatt råhet, blandad regim efter specifik kraft) gäller tills en ingenjör har granskat dem, och resultaten säger det.
