---
title: Provlinjer och tvärsektioner
summary: Skär sektioner vinkelrätt mot en linjeföring, se marken, projekteringen och schakt och fyllning vid varje station, och få volymer med medelyteformeln.
keywords: massdiagram, balanspunkt, krympning, svällning, transportsträcka, upplag, deponi, sektionsblad, tvärsektionsblad, sektioner pdf, sektioner, tvärsektioner, provlinjer, sektionsvy, schakt, fyllning, areor, medelyteformel, jordarbeten, station, förskjutning, csv
from: 5060173c
---

En tvärsektion visar vägen så som den ska byggas: tvärs linjeföringen vid en station, den befintliga marken, projekteringen (korridoren eller byggplattan planerad in) och schakt och fyllning mellan dem.

## Lägg till provlinjer

1. Markera en linjeföring. Klicka i **Egenskaper**, under **Provlinjer**, på {{ui:Lägg till provlinjer}}.
2. Ange **Varje** (avståndet: 50 ft eller 20 m att börja med), **Vänster bredd** och **Höger bredd** (hur långt varje sektion når från mittlinjen).
3. För att skära en sektion vid en viss station, skriv in den under **Lägg till en station** (till exempel `2+35`) och tryck på {{key:Enter}}.

Sektioner skärs vid varje helt multipel av avståndet, vid båda ändarna av linjeföringen, vid början och slutet av varje kurva (PC och PT) och vid de stationer du lägger till. Provlinjerna visas i planen som grå linjer tvärs linjeföringen; de går också ut i DXF, DWG och PDF på lager C-ROAD-SCTN. Varje ändring är ett steg: {{key:Mod+Z}} ångrar det.

## Sektionsvyn

Öppna den med {{ui:Sektionsvy}} i linjeföringens **Egenskaper**, {{ui:Sektioner}} under **Terrängmodell** › {{ui:Mer}}, eller {{key:X}}. Den tar platsen för profilvyn under planen.

- Bläddra mellan sektionerna med pilarna i dess fält, i stationslistan, eller med {{key:Left}} och {{key:Right}} när sektionsvyn har fokus ({{key:Home}} och {{key:End}} för första och sista).
- Den grå linjen är den befintliga marken, den röda linjen projekteringen. Schakt är skuggad orange, fyllning grön. Korridorpunkter är markerade: CL (mittlinje), EOP (beläggningskant), SH (vägren) och DL (släntkrön).
- Rubriken anger stationen, denna sektions schakt- och fyllningsareor och den vertikala överdriften. **Anpassa** fyller panelen; välj 1× för att se sektionen i sann skala.
- Den tjocka linjen i planen visar vilken sektion som är på skärmen.

## Sektionsblad

{{ui:Sektionsblad (PDF)}} under **Provlinjer** lägger varje sektion på PDF-sidor, i rader från vänster till höger och uppifrån och ned i stationsordning. Välj **Papper**, **Planskala** (sektionernas horisontella skala) och **Profilöverdrift** (1×, 2×, 5× eller 10×); dialogen anger hur många sektioner som får plats på en sida och hur många sidor det blir.

Varje sektion visar ett rutnät med förskjutningar och höjder, marken (streckad), projekteringen, schakt och fyllning skuggade (orange och grön), korridorpunkterna och under den dess station och dess schakt- och fyllningsareor. Varje sektion på bladen ritas lika stor, tillräckligt hög för den största; när det inte ryms på sidan vid din överdrift använder CivilCraft den största som ryms och säger det. Titelremsan anger linjeföringen, stationerna på sidan, skalorna och "Blad 1 av 3".

## Volymer med medelyteformeln

Mellan två närliggande sektioner är volymen medelvärdet av deras två areor gånger avståndet mellan deras stationer. Fältet visar summorna för linjeföringen, och {{ui:CSV}} hämtar varje sektions areor och volymer med löpande summor (kubikyard för projekt i fot, kubikmeter för metriska).

**Egenskaper** visar samma summor bredvid rutnätsmetodens volymer från [Jordmassevolymer](topic:volumes). De två är olika approximationer: tätare sektioner för dem närmare varandra, och på en rak väg på platt mark är de desamma.

:::note
Schakt och fyllning räknas endast inom de planerade ytorna (en korridors eller en byggplattas släntkrön), precis som rutnätsmetoden. Utan korridor eller byggplatta är projekteringen marken, så en sektion visar inget schakt eller fyllning.
:::

## Massdiagram

**Massdiagram** under **Provlinjer** ritar massdiagrammet från samma ytvolymer: längs stationerna, den löpande summan av schakt minus fyllning.

- **Krympning (−) eller svällning (+) av schaktet** anger vad en kubikyard schakt blir när den läggs som fyllning: −10 % (startvärdet, en platshållare) betyder att den krymper till 0.9; sten som sväller kan vara +5 %. Använd värdet i din geotekniska rapport.
- Där linjen stiger är vägen i schakt; där den sjunker, i fyllning. Över noll (skuggat orange) flyttas jord uppströms station; under noll (grön), nedströms.
- **Balanspunkter** är där linjen korsar noll: mellan två av dem balanserar schakt och fyllning. Tabellen listar varje balanserad sträcka, den flyttade volymen (dess högsta eller lägsta punkt) och den genomsnittliga transportsträckan (den skuggade arean delat med den volymen).
- Där linjen slutar utanför noll är det som blir över **deponi** (ovan) eller **upplag** (under). På den sista sträckan räknas bara jorden bortom nivån den slutar på som flyttad.

**CSV** sparar massordinaten vid varje sektion, sträckorna och faktorn.
