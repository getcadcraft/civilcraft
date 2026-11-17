---
title: Enote pri uvozu - datoteka navede svoje enote ali vas najprej vprašamo
summary: Ko risba ali mreža, ki jo uvozite v projekt, navede svoje enote, CivilCraft jo pretvori in to pove. Kadar je ne navede, CivilCraft vpraša, preden jo prebere, in si zapomni odgovor za to datoteko.
keywords: enote, uvoz, DWG, DXF, STL, OBJ, izmera, čevlji, US survey ft, metri, milimetri, merilo, napačna velikost, prevelik, premajhen, vprašaj, zapomni, INSUNITS, enote risbe
from: 60921963
---

## Kaj boste naredili

Datoteko prinesete v projekt in se prepričate, da pride v pravi velikosti.

## Koraki

1. Datoteko odprite kot običajno: {{ui:Odpri}}, jo spustite na načrt ali uporabite ukaz za CAD risbo.
2. Če datoteka navaja svoje enote, ničesar ne sprašuje: uvozno pogovorno okno jih prikaže kot **Kot pravi risba**.
3. Če ne, se pred odprtjem uvoznega pogovornega okna prikaže vprašanje **Enote** datoteke. Izberite, kaj je ena enota v datoteki, in kliknite {{ui:Uporabi te enote}}.
4. {{ui:Prekliči}} (ali {{key:Esc}}) datoteko preskoči. Nič iz nje se ne prebere v projekt.

## Katere datoteke navajajo svoje enote

- **DWG in DXF**: vstavitvene enote risbe (`$INSUNITS`). Datoteka brez njih se vpraša. Seznam **Enote risbe** v uvoznem pogovornem oknu začne z vašim odgovorom in ga je še vedno mogoče spremeniti.
- **STL in OBJ** (prosto oblikovane oblike terena): nikoli ne navajata enot. Vprašani ste.
- **Seznami točk** (CSV, TXT) in seznami izmere med gradnjo: seznam, ki navede svojo enoto v prvih vrsticah, se pretvori, vrstica stanja pa to pove. Seznam, ki je ne navede, se vpraša, ko pritisnete {{ui:Uvozi}}, preden se točke vnesejo. Stolpci zemljepisne širine in dolžine gredo namesto tega skozi koordinatni sistem.
- **Dodatek Oblaki točk**: vpraša, ko zgradite oblak, katerega datoteka ne navaja enote, in številke oblaka označi z enoto, ki jo ima.
- **IFC in LandXML**: navajata svoje enote; pretvorita se v enote projekta.
- **LAS, LAZ in višinski rastri**: postavijo se po svojem koordinatnem sistemu; pogovorno okno za teren vpraša po enoti višine, kadar datoteka ne navaja enote.

## Dobro je vedeti

- Odgovor se za to datoteko shrani na tem računalniku, v vseh aplikacijah CadCraft. Ob naslednjem uvozu vas ne vprašamo.
- Da vas vprašamo znova: paleta ukazov ({{key:Mod+K}}) › **Ponovno vprašaj za enote uvoženih datotek**.
- Enota, ki jo seznam navede, se prebere iz prvih osmih vrstic: na primer vrstica `units: ft` ali naslovi stolpcev, ki vsi nosijo isto enoto v oklepaju, kot je `Kota (m)`.
