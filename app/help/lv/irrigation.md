---
title: Laistīšanas projektēšana
summary: Aprēķinu palīglīdzeklis, nevis apstiprināts projekts. Smidzinātāji, zarojumi, maģistrāle, vārsti un pilienu līnijas uz vietas; zonas, kas atrastas pēc caurulēm; spiediena zudumi pēc Hazen–Williams formulas, sliktākā gadījuma smidzinātājs, plūsma un spiediens pret padevi, nokrišņu intensitāte, darbības laiki, pārklājums un materiālu saraksts.
keywords: laistīšana, smidzinātājs, smidzinātāji, sprejs, rotors, rotējoša sprausla, burbuļotājs, pilieni, pilienu līnija, emitētājs, vārsts, zona, stacija, kontrolieris, maģistrāle, zarojums, pieslēgšanas punkts, ūdens padeve, spiediens, psi, kpa, plūsma, gpm, berzes zudums, hazen williams, nokrišņu intensitāte, darbības laiks, pārklājums, galva pie galvas, materiālu saraksts
from: 7d6342c1
---

:::warning
Tas ir aprēķinu palīglīdzeklis, nevis apstiprināts projekts: laistīšanas projektētājs pārbauda katru rezultātu, pirms kaut kas tiek būvēts.
:::

## Izveidot sistēmu

1. Kreisajā pusē sadaļā **Laistīšana** izvēlieties **Smidzinātājs**, tā **Loks** un vieta, kur loks sākas, kā arī zarojumu un maģistrāles cauruļu izmērus.
2. {{ui:Laistīšana}} › {{ui:Pieslēgšanas punkts}}: noklikšķiniet, kur ūdens padeve pievienojas. Iestatiet tās **spiedienu**, pieejamo **plūsmu** un skaitītāja un pretplūsmas zudumu rekvizītos.
3. {{ui:Laistīšana}} › {{ui:Vārsts}}: noklikšķiniet, kur iet katras zonas vārsts. Vārsts sāk zonu.
4. {{ui:Laistīšana}} › {{ui:Smidzinātājs}}: noklikšķiniet, lai novietotu smidzinātājus; katrs klikšķis novieto vienu.
5. {{ui:Laistīšana}} › {{ui:Sānu caurule}}: noklikšķiniet no vārsta caur smidzinātājiem un nospiediet {{key:Enter}}. {{ui:Galvenā līnija}}: no pieslēguma punkta līdz katram vārstam.

Cauruļu galus piesaista smidzinātājiem, vārstiem, padevei un citiem cauruļu galiem, tāpēc tīkls savienojas. Zona ir viss, kas sasniegts no tās vārsta pa zarojumiem; galvenā līnija vienlaikus nes vienu zonu.

## Pilieni

{{ui:Laistīšana}} › {{ui:Pilienu līnija}}: noklikšķiniet gar līniju, sākot no vietas, kur tā tiek padota (zarojuma gals vai vārsts). Rekvizītos iestatiet **emitētāja plūsmu** un **attālumu**; līnijas plūsma ir visu emitētāju summa gar to.

## Pārbaude

{{ui:Laistīšana}} › {{ui:Pārbaudīt sistēmu…}} uzskaita katru zonu:

| Kolonna | Kā tā tiek aprēķināta |
|---|---|
| Plūsma | Smidzinātāju (un pilienu līniju) plūsmas, summētas |
| Pie vārsta | Sliktākā gadījuma smidzinātāja darba spiediens plus cauruļu zudumi līdz tam (Hazen–Williams, caurules iekšējais diametrs, augstuma izmaiņa) un zudums caur vārstu |
| Pie padeves | Tas pats plus galvenās līnijas zudums, kas nes šo zonu, un skaitītāja un pretplūsmas zudums |
| Nokrišņi | Smidzinātāju plūsma uz platību, ko tie laista ar attālumu galva pie galvas |
| Minūtes nedēļā | Lai pielietotu iestatījumu **Ūdens nedēļā** |
| Problēmas | Ātrums pārsniedz robežu, smidzinātājs ārpus sava spiediena diapazona, sprejs un rotors uz viena vārsta, nepietiekams spiediens vai plūsma padevē, smidzinātāji bez zonas, cilpas |

Atlasiet vārstu, lai redzētu tā zonas skaitļus un apvilktu sliktākā gadījuma smidzinātāju plānā. Materiālu saraksts saskaita smidzinātājus pēc veida un loka, caurules pēc izmēra, vārstus, pilienu līniju un emitētājus, kā arī kontroliera stacijas. **Saglabāt kā CSV** saglabā abus.

Laistīšanas sadaļas iestatījumi: **Hazen–Williams C** (150 jaunai plastmasas caurulei), **ātrākā plūsma** caurulē (1.5 m/s), **zudums caur vārstu** un **ūdens nedēļā**. Tie ir atzīmēti kā noklusējuma iestatījumi.

## Pārklājums

{{ui:Laistīšana}} › {{ui:Rādīt pārklājumu}} parāda, cik lielu daļu platības smidzinātāji atstāj sausu, cik daļu laista divi vai vairāk smidzinātāji un kuri smidzinātāji nesasniedz kaimiņu (attālums galva pie galvas).

## Smidzinātāji

Uzskaitītie smidzinātāji ir **vispārīgi** veidi, ko CadCraft sagatavojis no projektētajām nokrišņu intensitātēm (fiksētie sprejas, rotējošās sprauslas, zobratu rotori, burbuļotāji, mikrosprejas, emitētāji), nevis jebkura ražotāja produkti. **Pievienot smidzinātājus no faila…** nolasa jūsu pašu smidzinātājus (JSON saraksts ar katra smidzinātāja izmetienu, plūsmu vai nokrišņu intensitāti un spiediena diapazonu); tie tiek saglabāti kopā ar projektu. Ražotāja publicētie dati tiek ievietoti tikai ar šī ražotāja ierakstītu atļauju.

Zem vispārīgajiem smidzinātājiem sarakstā ir **tipiski smidzinātāji** (to nosaukumi beidzas ar "tipiskās vērtības"): sprauslu izmēri fiksētajiem sprejiem, rotējošām sprauslām un zobratu rotoriem, mikrosprejiem, burbuļotājiem un emitētājiem, ar rādiusu, plūsmu un spiediena diapazonu. CadCraft tos aprēķina no publicētās matemātikas (plūsmai — atveres vienādojums, rādiusam — strūklas izmetiena mērogs) un nominālajām plūsmas klasēm, tikai no atvērtiem avotiem; neviena ražotāja tabula nav kopēta. Izvēlieties vienu, un izvēlnē redzams tā pamats un licence. Projekts, kas izmanto kādu no tiem, saglabā smidzinātāju un tā avotu projekta failā. Tie domāti plānošanai: pirms būvēšanas pārbaudiet reālā smidzinātāja paša datus.
