---
title: Provlinjer och tvärsektioner
summary: Skär sektioner vinkelrätt mot en linjeföring, se marken, projekteringen och schakt och fyllning vid varje station, och få volymer med medelareametoden.
keywords: massdiagram, massdiagram, balanspunkt, krympning, svällning, transportsträcka, lån, deponi, sektionsblad, tvärsektionsblad, sektions-PDF, sektioner, tvärsektioner, provlinjer, sektionsvy, schakt, fyllning, areor, medelareametoden, volymer medelarea, jordarbeten, station, förskjutning, csv
from: 09639ce2
---

En tvärsektion visar vägen så som den ska byggas: tvärs över linjeföringen vid en station, den befintliga marken, projekteringen (korridoren eller plattan som jämnats in) och schakt och fyll emellan.

## Lägg till provlinjer

1. Markera en linjeföring. Under **Egenskaper**, under **Provlinjer**, klicka på {{ui:Lägg till provlinjer}}.
2. Ange **Avstånd** (intervallet: 50 ft eller 20 m till att börja med), **Vänster bredd** och **Höger bredd** (hur långt varje sektion når från mittlinjen).
3. För att skära en sektion vid en viss station, skriv den i **Lägg till en station** (till exempel `2+35`) och tryck på {{key:Enter}}.

Sektioner skärs vid varje helt multipel av avståndet, vid båda ändarna av linjeföringen, vid början och slutet av varje kurva (PC och PT) och vid de stationer du lägger till. Provlinjerna visas i planen som grå linjer tvärs över linjeföringen. De går också ut i DXF, DWG och PDF på lagret C-ROAD-SCTN. Varje ändring är ett steg: {{key:Mod+Z}} ångrar den.

## Sektionsvyn

Öppna den med {{ui:Sektionsvy}} i linjeföringens **Egenskaper**, {{ui:Sektioner}} under {{ui:Terrängmodell}} › {{ui:Mer}}, eller {{key:X}}. Den tar platsen för profilvyn under planen.

- Stega genom sektionerna med pilarna i dess fält, stationslistan, eller {{key:Left}} och {{key:Right}} när sektionsvyn har fokus ({{key:Home}} och {{key:End}} för första och sista).
- Den grå linjen är den befintliga marken, den röda linjen projekteringen. Schakt skuggas orange, fyllning grön. Korridorpunkter är markerade: CL (mittlinje), EOP (vägkant), SH (vägren) och DL (släntkrön).
- Rubriken anger stationen, sektionens schakt- och fyllningsareor samt den vertikala överdrivningen. **Anpassa** fyller panelen. Välj 1× för att se sektionen i verklig skala.
- Den tjocka linjen i planen visar vilken sektion som visas på skärmen.
- **Zooma och panorera:** hjulet zoomar kring pekaren, och dragning flyttar vyn. {{ui:Anpassa}} (eller {{key:F}}, eller ett dubbelklick) anpassar hela sektionen igen.

## Mät i en sektion

1. Klicka på {{ui:Mät}} i sektionsfältet, eller tryck på {{key:M}}. Tipset säger "Klicka på första punkten, och sedan på den andra."
2. Klicka på två punkter. Var och en fångar till slutet av en linje eller en korridorpunkt (CL, EOP, SH, DL); håll ned {{key:Alt}} för en fri punkt.
3. Avläsningen ger det horisontella avståndet (ΔH), det vertikala avståndet (ΔV), lutningen i procent med dess kvot, och den raka längden, i projektets enheter.

Klicka igen för att starta en ny mätning. {{key:Esc}} rensar den, och {{key:M}} stänger av Mät.

## Sektionsblad

{{ui:Sektionsblad (PDF)}} under **Provlinjer** lägger varje sektion på PDF-sidor, i rader från vänster till höger och uppifrån och ner i stationsordning. Välj **Papper**, **Planskala** (sektionernas horisontella skala) och **Profiloverdrivning** (1×, 2×, 5× eller 10×). Dialogrutan säger hur många sektioner som ryms på en sida och hur många sidor det blir.

Varje sektion visar ett rutnät med förskjutningar och höjder, marken (streckad), projekteringen, schakt och fyllning skuggade (orange och grön), korridorpunkterna, och under den sin station och sina schakt- och fyllningsareor. Alla sektioner på bladen ritas lika stora, tillräckligt höga för den största. När den inte ryms på sidan vid din överdrivning använder CivilCraft den största som ryms, och säger det. Titelfältet anger linjeföringen, stationerna på sidan, skalorna och "Blad 1 av 3".

## Vad schakt och fyllning mäts mot

En korridor kan ha lager under beläggningen: beläggningslager, mallkomponenter, spår. Välj **Volymer mäts mot** i sektionsfältet för att bestämma vad schakt och fyllning går mot:

- **Nedre yta** (början): mot undersidan av dessa komponenter, så att schakten inkluderar djupet av beläggningens uppbyggnad.
- **Övre yta**: endast mot projekteringens överkant, som förut när komponenter räknades.

Areorna i rubriken, volymerna nedan, CSV-filen och massdiagrammet följer alla detta val, och det sparas med projektet.

## Volymer med medelareametoden

Mellan två närliggande sektioner är volymen medelvärdet av deras två areor gånger avståndet mellan deras stationer. Fältet visar summorna för linjeföringen, och {{ui:CSV}} laddar ner varje sektions areor och volymer med löpande summor (kubikyard för projekt i fot, kubikmeter för metriska).

**Egenskaper** visar samma summor bredvid volymerna från rutnätsmetoden i [Jordarbetsvolymer](topic:volumes). De två är olika approximationer: tätare sektioner för dem närmare varandra, och på en rak väg på platt mark är de samma.

:::note
Schakt och fyllning räknas endast inom de planerade områdena (en korridors eller en plattas släntkrönslinjer), som rutnätsmetoden gör. Utan korridor eller platta är projekteringen marken, så en sektion visar ingen schakt eller fyllning.
:::

## Massdiagram

**Massdiagram** under **Provlinjer** ritar massdiagrammet från samma medelareavolymer: längs stationerna, den löpande summan av schakt minus fyllning.

- **Krympning (−) eller svällning (+) av schakten** anger vad en kubikyard schakt blir när den läggs som fyllning: −10 % (startvärdet, en platshållare) betyder att den krymper till 0.9. Berg som sväller kan vara +5 %. Använd värdet från din geotekniska rapport.
- Där linjen stiger är vägen i schakt; där den sjunker, i fyllning. Över noll (skuggat orange) flyttas jord uppströms i stationsriktningen; under noll (grönt), nedströms.
- **Balanspunkter** är där linjen korsar noll: mellan två av dem balanserar schakt och fyllning. Tabellen listar varje balanserad sträcka, den flyttade volymen (dess högsta eller lägsta punkt) och den genomsnittliga transportsträckan (den skuggade arean delat med den volymen).
- Där linjen slutar utanför noll är det som blir över **deponi** (ovan) eller **lån** (under). På den sista sträckan räknas endast jorden bortom nivån den slutar på som flyttad.

**CSV** sparar massordinaten vid varje sektion, sträckorna och faktorn.
