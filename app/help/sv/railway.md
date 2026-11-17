---
title: Projektera ett järnvägsspår
summary: Gör en linjeföring till en järnväg: spårövergångar (klotoid, kubisk parabel, Bloss, Helmert, sinus halvvåg, sinus), överhöjning i varje kurva med dess jämviktsöverhöjning, överhöjningsbrist och överskott, gränser för överhöjning och spårgeometri som varningar, växlar och spårförbindelser per station, en fri profil som sveps längs linjen och ett spår med räler, sliprar och en ballastbädd byggt som korridor, i plan, sektioner, längdprofil, 3D och mängder.
keywords: järnväg, räl, järnvägsspår, spår, tåg, tunnelbana, spårvagn, överhöjning, överhöjningsbrist, överhöjningsöverskott, jämviktsöverhöjning, övergång, övergångskurva, klotoid, kubisk parabel, Bloss, Helmert, sinus halvvåg, cosinus, spårvidd, normalspår, bredspår, meterspår, smalspår, sliper, ballast, underballast, banvall, bankett, spåravstånd, 60E1, 54E1, UIC60, 115RE, 136RE, överhöjningens lutning, förändringshastighet för överhöjning, växel, tungspets, hjärtstycke, hjärtstyckesnummer, spårförbindelse, ledlängd, avslutningskurva, hastighet genom växeln, fri profil, konstruktionsprofil, perrong, perrongkant, spåravstånd, lutning, vertikalkurva, minsta radie, LandXML-överhöjning
from: 99de9745
---

Vilken linjeföring som helst kan bli ett järnvägsspår. Dess kurvor får då spårövergångar och en överhöjning (rälernas överhöjning), och dess korridor byggs som ett spår: räler på sliprar på en ballastbädd, planerat in i marken som en väg. Växlar och spårförbindelser läggs på den per station, och en fri profil kan sveps längs den och kontrolleras mot det som står bredvid spåret.

Alla värden nedan är **platshållare**, inte standarder. Järnvägar sätter sina gränser efter linjehastighet, spårtyp och land; ange dem enligt din egen järnvägs standard. CivilCraft levererar ingen nationell tabell.

## Gör linjeföringen till en järnväg

1. Markera linjeföringen och hitta **Järnväg** i Egenskaper.
2. Bocka i **Den här linjeföringen är ett järnvägsspår**. Varje ändring är ett steg i ångra.
3. Ange **Projekteringshastighet** överst i linjeföringens Egenskaper: det är linjehastigheten som överhöjningen kontrolleras mot. **Långsammaste tåg** (i järnvägsavsnittet) är hastigheten som överhöjningsöverskottet kontrolleras mot.

## Övergångar

Ge varje kurva en spirallängd i ändarna i PI-tabellen (**Spiral in**, **Spiral out**), välj sedan dess typ i järnvägsavsnittets kurvtabell, eller **Övergång för varje kurva**:

| Typ | Krökning längs övergången |
|---|---|
| Klotoid | växer jämnt (vägspiralen) |
| Kubisk parabel | y = x³ / (6·R·L), med L mätt längs tangenten; kurvan i sig är något längre |
| Bloss | 3u² − 2u³ av full krökning (u = andelen av längden): börjar och slutar mjukt |
| Helmert | två parabler, först 2u² och sedan 1 − 2(1 − u)² |
| Sinus halvvåg | (1 − cos πu) / 2 |
| Sinus | u − sin(2πu) / 2π |

Alla utom den kubiska parabeln vrids L / 2R, precis som klotoiden. Stationer följer den verkliga längden. LandXML behåller typen (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Överhöjning

Skriv in **Överhöjning** för varje kurva i millimeter. Tabellen visar för varje kurva:

- **Jämviktsöverhöjning** = G·v² / (g·R), där G är avståndet mellan rälernas mitt (**Rälsmittavstånd**, spårvidden plus rälshuvudets bredd om du inte skriver in något annat). Med G = 1500 mm blir detta den välkända 11.8·V² / R (V i km/h, R i m).
- **Brist** = jämviktsöverhöjning vid linjehastigheten − tillämpad överhöjning.
- **Överskott** = tillämpad överhöjning − jämviktsöverhöjning vid långsammaste tågens hastighet.
- **Rampning**: den brantaste överhöjningslutningen längs dess rampar, i mm per meter.

Överhöjningen ökar över varje övergång, formad efter dess krökning: rak för en klotoid eller en kubisk parabel, Bloss-formad för Bloss och så vidare. Ett kurvslut utan övergång ökar på den raka sträckan före, så långt gränsen för överhöjningens lutning kräver, och det anges: överhöjningen ändras då där krökningen inte gör det.

**Överhöjningen vrids kring** anger vilken räl som ligger kvar på projekteringsprofilen: **den låga rälen** (den vanliga), **den inre rälen** eller **spårcentrum** (var och en av rälerna flyttas halva överhöjningen). Projekteringsprofilen är där rälens överkant ligger.

**Överhöjningsdiagrammet** ritar varje rälshöjd över profilen längs stationerna; profilvyn och plan- och profilbladen får samma som ett band under profilen.

## Gränser och varningar för överhöjning

**Störst tillämpad överhöjning**, **Störst överhöjningsbrist**, **Störst överhöjningsöverskott**, **Brantaste överhöjningslutning** och **Snabbaste förändring av överhöjning** (lutningen vid linjehastighet, mm/s) kontrolleras i varje kurva. Ett värde över en gräns är en varning i järnvägsavsnittet och i panelen Problem, med gränsen och det uppmätta värdet. Utan projekteringshastighet kontrolleras inte brist och förändringshastighet (en notering säger det).

## Spåret

Ange **Spårvidd** (förval för normalspår 1435 mm, bredspår, meterspår eller smalspår, eller egen), **Rälsprofil** (60E1, 54E1, 49E1, 115RE, 136RE: endast deras publicerade mått), antalet **Spår** och deras **Spåravstånd**, och sedan **Sliprar och ballast**: slipermaterial, längd, bredd, djup och avstånd; ballastdjupet under sliprarna (vid den låga rälen), bankfoten, lutningen och hur långt dess överkant ligger under sliprarna; underballastens djup, banketten utanför ballastfoten och banvallens tvärfall.

Tryck på **Bygg spåret**. Det slår på linjeföringens korridor, byggd som ett spår längs projekteringsprofilen: rälerna och sliprarna lutar med överhöjningen, banvallen gör inte det. Släntkrönen går från banketten vid korridorens skärning och fyllning, och spåret planeras in i den föreslagna ytan som en väg.

- **Plan**: båda rälerna i varje spår (lager C-RAIL-TRAK) och, med fler än ett spår, varje spårs mitt (C-RAIL-CNTR), på skärmen, i DXF, DWG, PDF och i plan- och profilblad.
- **Sektioner**: sliprarna, rälerna samt ballastens och underballastens undersidor i varje sektion.
- **3D**: rälerna, varje sliper och ballastbädden (Visa › Spår), även i GLB, OBJ och USD.
- **Mängder**: spårlängd, räl (båda rälerna i varje spår, längs varje spårs egna linje), sliprar, ballastbädden och ballasten minus sliprarna, samt underballasten, med medelyteformeln mellan sektioner.

## Kontroller av spårgeometrin

Vid sidan av överhöjningen kontrollerar järnvägsavsnittet själva linjen mot sex gränser till (alla platshållare, alla dina att ange):

- **Brantaste lutning** på projekteringsprofilen, i mm per meter.
- **Minsta vertikalkurvradie**, som en faktor k i R ≥ k·V² (R i meter, V i km/h). En parabolisk vertikalkurva med längd L mellan två lutningar har en radie på L delat med lutningsförändringen.
- **Kortaste vertikalkurva**.
- **Minsta kurvradie** i plan (0 stänger av kontrollen).
- **Kortaste båge eller raksträcka**, i sekunder körning vid linjehastighet: en cirkelbåge, eller raksträckan mellan två kurvor, som är kortare än det avståndet ger en varning. 1.8 s är den välkända "hälften av hastigheten i km/h, i meter".
- **Förändringshastighet för överhöjningsbrist** längs varje övergång, i mm/s vid linjehastighet.

**Spårgeometri** listar den brantaste lutningen som hittades och varje vertikalkurva med sin radie och den radie som linjehastigheten kräver. En vertikalkurva som ligger på en övergång eller en överhöjningsrampe får en notering. Utan projekteringsprofil eller projekteringshastighet hoppas de kontroller som kräver dem över, och en notering säger det.

## Växlar och spårförbindelser

Under **Växlar och spårförbindelser** trycker du på **Lägg till en växel**. Den placeras på den längsta raksträckan; ange i tabellen:

- **Tungspets-station**: var växeln börjar på den här linjeföringen.
- **Hjärtstycke**: hjärtstyckets nummer N (1:N). Hjärtstyckets vinkel är 2·atan(1 / 2N).
- **Sida**: vänster eller höger, sett i stationsriktningen.
- **Spårförbindelsens avstånd** i meter: över 0 blir växeln en spårförbindelse till ett parallellt spår på så långt avstånd (två växlar och raksträckan mellan dem).

Tabellen visar **Ledlängd** (tungspets till hjärtstycke), avslutningskurvans **Radie** och **Hastighet genom växeln** som den radien tillåter med din gräns för överhöjningsbrist och ingen överhöjning. **Skapa dess spår** gör den avvikande vägen till en egen linjeföring (växeln, avslutningskurvan och sedan rakt fram i hjärtstyckets vinkel) med samma järnvägsinställningar, redo att förlängas.

Planen ritar varje växels två avvikande räler, dess mittlinje, en markering vid tungspetsen och vid hjärtstycket samt "1:N" (lager C-RAIL-TURN), på skärmen och i DXF, DWG, PDF och blad. 3D-vyn ritar de avvikande rälerna på huvudspårets nivå.

Formen är en **platshållare**: en rak växel och en avslutningskurva utifrån hjärtstyckets nummer. En byggd växel följer järnvägens standard och tillverkarens ritning. Varningar: en växel som går utanför linjeföringen, ligger på en kurva, en övergång, överhöjning eller vertikalkurva, eller överlappar en annan; och en notering när linjehastigheten är över dess hastighet genom växeln.

## Fri profil

Bocka i **Sveep en fri profil längs detta spår**. Välj **Kontur** (två platshållarformer, eller **Egen kontur** skriven som en punkt per rad: förskjutning från spårcentrum, sedan höjd över rälens överkant, i meter), **Fordonslängd** och **Boggiavstånd** och, om det finns, en **Perrongkant** (sida, avstånd från spårcentrum, höjd över rälen).

Vid varje station lutas konturen med överhöjningen kring den låga rälen och breddas av kurvan: fordonets mitt rör sig inåt med b² / 8R, dess ändar utåt med (L² − b²) / 8R (b boggiavstånden, L fordonslängden, R radien där, efter övergången). Blocket ritar sektionen på raksträckan och där den är bredast, och listar:

- den **bredaste fria profilen** och var,
- **spåravstånden** mot de avstånd som två intilliggande fria profiler kräver,
- utrymmet kvar vid **perrongkanten**, eller hur mycket den ligger innanför,
- varje funktionslinje, rörkonstruktion och annan järnvägslinjeföring som hittas **innanför den fria profilen**.

En funktionslinje med höjder bedöms mot konturen på dess höjd över rälen; utan projekteringsprofil, eller för en punkt utan höjd, bedöms den endast i plan, och listan säger det. Planen visar den fria profilens två kanter (lager C-RAIL-CLRN) med ett kryss vid varje sak som ligger innanför.

Konturerna som erbjuds är **platshållare, inte någon järnvägs konstruktionsprofil**. Skriv in din järnvägs konstruktionsprofil innan du litar på ett resultat.

## I andra program

- **LandXML**: en järnvägslinjeföring skrivs med sina övergångar (spiType) och ett `Cant`-block: spårvidden, rotationspunkten, linjehastigheten och en station där varje överhöjningsrampe börjar och slutar, med tillämpad överhöjning, jämviktsöverhöjning och brist. Att öppna en LandXML-fil med ett `Cant`-block gör den linjeföringen till en järnväg med de överhöjningarna.
- **IFC**: linjeföringen med sina överhöjningssegment, rälerna, sliprarna, ballasten och underballasten.

## Finns inte ännu

Växlar i IFC-exporten, växelfamiljer utöver den enda avslutningskurvan (kurvade växlar, rörliga hjärtstycken, slips, diamanter), kinematiska profilregler (den fria profilen är en fast kontur med kurvutslag), kontaktledning och signalering.

**Vilken standard.** I järnvägsavsnittet tar "Standard att hänvisa till" emot Ingen eller Europeisk (UIC och EN). Om du väljer Europeisk anges de dokument ett europeiskt projekt hänvisar till (EN 13803 för linjeföringsparametrarna, EN 13232 för växlar och korsningar, EN 15273 för konstruktionsprofiler, EN 13848 för kvaliteten på spårgeometrin) och varje gräns får en ruta för paragrafen den kommer från. Inget värde från någon standard är inbyggt: gränserna för överhöjning, brist, överskott, lutning och förändringshastighet, växelgeometrin och konstruktionsprofilen är alla fortfarande platshållare, och fönstret säger det. En järnvägsingenjör kontrollerar varje värde mot standardens egen text och skriver in paragrafen bredvid, innan något byggs. Sydafrika och AREMA-tabellerna ingår inte i den här versionen.
