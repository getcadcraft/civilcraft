---
title: Beräkna dagvattenflöden, ledningsdimensioner och trycklinjen
summary: Rita de avrinningsområden som avvattnar till varje brunn, summera flödena nedströms i nätet med den rationella metoden, dimensionera ledningarna med Mannings ekvation och se var trycklinjen går fullt eller når upp till markytan.
keywords: dagvatten, avrinningsområde, rationella metoden, avrinningskoefficient, koncentrationstid, regnintensitet, idf, manning, ledningsdimensionering, trycklinje, hgl, energilinje, egl, överbelastning, översvämning, recipientnivå
from: e44872ec
---

Dagvatten arbetar på [rörnätet](topic:pipe-network): rita nätet först, sedan de områden som avvattnar till det. Allt visas under **Dagvatten** i den högra panelen när inget är markerat.

## Rita ett avrinningsområde

1. Klicka på **Rita ett avrinningsområde** under **Dagvatten**.
2. Klicka på hörnen i området som avvattnar till en brunn. {{key:Enter}} eller dubbelklick avslutar; {{key:Backspace}} tar tillbaka sista hörnet, {{key:Esc}} avbryter.
3. Området avvattnar till en brunn inuti det, annars till den närmaste. Dess **Palett** öppnas: ange dess namn, **Avrinningskoefficient C** (andelen av regnet som rinner av, 0 till 1), **Koncentrationstid** i minuter och vilken brunn det **Avvattnar till**.

**Rita ett nytt avrinningsområde** i dess palett startar nästa. Klicka inuti ett avrinningsområde på planen för att markera det; {{key:Delete}} tar bort det. Varje ändring är ett steg: {{key:Mod+Z}} ångrar den.

## Ange dimensionerande regn

Regnintensiteten är i = a ÷ (tc + b) upphöjt till c, i tum per timme för ett projekt i fot och i millimeter per timme för ett projekt i meter. Anpassa **Intensitet a**, **b** och **c** till din egen intensitet-varaktighet-frekvens-kurva för den återkomsttid du dimensionerar för.

:::warning
Startkurvan för intensiteten, Mannings n (0.013) och brunnsförlusten (0.5) är platshållare, inte en standard. Ange dem utifrån dina egna regndata och dina dimensioneringskriterier.
:::

- **Kortaste koncentrationstid**: ingen ledning räknas med kortare tid (10 minuter till att börja med).
- **Mannings n**: ledningarnas råhet.
- **Brunnsförlust**: fallhöjden som förloras i varje brunn, som en andel av hastighetshöjden V²/2g för ledningen som lämnar den.
- **Vattennivå vid utloppet**: recipientnivån, där sista ledningen mynnar. Lämna tomt när utloppet mynnar fritt.

## Så summeras flödena

Varje ledning bär alla avrinningsområden ovanför sig. Q = C × i × A, där C × A summeras nedströms i nätet och i är intensiteten vid den längsta koncentrationstiden för vattnet som kommer dit: ett områdes egen tid, eller tiden från ett uppströms område plus restiden genom ledningarna (längd ÷ hastigheten när de är fullt fyllda). Q anges i kubikfot per sekund (A i acres) eller kubikmeter per sekund (A i hektar).

## Dimensionera ledningarna

Tabellen under **Flöden och trycklinjer** visar för varje ledning flödet, vad den bär när den är fullt fylld med sin lutning, hastigheten, trycklinjen i dess över- och underände samt hur djupt den flyter.

**Dimensionera ledningarna för dessa flöden** ger varje ledning den minsta standarddimension som bär dess flöde vid sin egen lutning (12 till 72 in, eller 300 till 1800 mm). Det är ett steg. Bottennivåerna står kvar där de är: om dimensionerna ändras, använd **Sätt alla bottennivåer från reglerna** för att behålla täckningen och kontrollera sedan tabellen igen.

## Läs trycklinjerna

Trycklinjen (HGL) räknas från utloppet uppströms:

- En ledning som flyter delvis fylld har sin HGL vid vattenytan: bottennivån plus normaldjupet.
- När vattnet nedanför står högre än dess scheitel, eller ledningen bär mer än den klarar när den är fullt fylld, flyter den fullt (överbelastad) och dess HGL stiger med friktionslutningen över dess längd.
- Vid varje brunn är HGL den utgående ledningens övre HGL plus brunnsförlusten.
- Energilinjen (EGL) är HGL plus hastighetshöjden.

En ledning som flyter fullt listas, liksom varje brunn där HGL ligger över brunnskanten: vatten når markytan där, och brunnen ringas in i rött på planen. Markera en ledning eller en brunn för att se dess flöde, djup, hastighet och båda trycklinjerna i dess palett.

## Dirigera ett skyfall

Den rationella metoden ger en topp för varje ledning. **Dirigera skyfallet** (under resultatet, i nätets palett) räknar i stället ut hela skyfallet: varje områdes avrinning över tiden, förd nedåt i ledningarna med deras restid och magasinering, och adderad där de möts.

1. Lämna **Regnet varar** och **Regnintensitet** tomma för att använda den längsta koncentrationstiden och regnkurvan ovan, eller skriv in egna värden.
2. Tryck på **Dirigera skyfallet**. Tabellen listar för varje ledning det högsta flödet in och ut, hur mycket lägre den utgående toppen är, hur stor del av ledningens fulla kapacitet som används och minuten då den toppar.
3. Varje utlopp får ett litet diagram över flödet över tiden och **Ladda ner hydrografen (CSV)**.

Ett avrinningsområde skickar ut regnet medelvärdesbildat över sin koncentrationstid, så ett skyfall som är kortare än den toppar lägre än C × i × A. Varje ledning dirigeras med Muskingum–Cunge-metoden, med det flödesdjup som den rationella metoden redan har fått fram. Två grenar med olika koncentrationstider toppar inte samtidigt, så deras summa är lägre än summan av deras toppar.

Detta modellerar inte överbelastning, bakvatten, magasinering i brunnar eller översvämning. En ledning vars dirigerade topp ligger över dess fulla kapacitet listas, och dess vatten skickas vidare som om det fick plats. Använd det för att se tidpunkt och dämpning, inte för att dimensionera ledningen. Det är ett beräkningsstöd: en ingenjör kontrollerar det.

## Sparas med projektet

Avrinningsområden och skyfallsinställningarna sparas i projektfilen. De finns ännu inte i PDF-plotten, DWG- eller DXF-filen eller LandXML: se [Finns inte ännu](topic:not-built-yet).
