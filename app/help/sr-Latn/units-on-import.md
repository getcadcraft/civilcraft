---
title: Jedinice pri uvozu: datoteka navodi svoje jedinice ili se prvo pitate
summary: Kada crtež ili mreža koju uvodite u projekat navodi svoje jedinice, CivilCraft ih pretvara i to kaže. Kada ih ne navodi, CivilCraft pita pre čitanja i pamti vaš odgovor za tu datoteku.
keywords: jedinice, uvoz, DWG, DXF, STL, OBJ, geodetsko snimanje, stope, US survey stope, metri, milimetri, razmera, pogrešna veličina, preveliko, premalo, pitaj, zapamćeno, INSUNITS, jedinice crteža
from: 60921963
---

## Šta ćete uraditi

Uvedite datoteku u projekat i budite sigurni da uđe u pravoj veličini.

## Koraci

1. Otvorite datoteku kao obično: {{ui:Otvori}}, prevucite je na plan ili koristite komandu za CAD crtež.
2. Ako datoteka navodi svoje jedinice, ništa se ne pita: dijalog uvoza ih prikazuje kao **Kao što piše u crtežu**.
3. Ako ih ne navodi, dijalog pita za **Jedinice** datoteke pre nego što se otvori dijalog uvoza. Izaberite šta je jedna jedinica u datoteci i kliknite {{ui:Koristi ove jedinice}}.
4. {{ui:Otkaži}} (ili {{key:Esc}}) preskače datoteku. Ništa iz nje se ne čita u projekat.

## Koje datoteke navode svoje jedinice

- **DWG i DXF**: jedinice umetanja crteža (`$INSUNITS`). Datoteka bez njih se pita. Lista **Jedinice crteža** u dijalogu uvoza počinje od vašeg odgovora i može se i dalje promeniti.
- **STL i OBJ** (slobodni oblici terena): nikada ne navode jedinice. Pita se.
- **Liste tačaka** (CSV, TXT) i liste geodetskog snimanja: lista koja navodi svoju jedinicu u prvim redovima se pretvara, a statusni red to kaže. Lista bez nje se pita kada pritisnete {{ui:Uvezi}}, pre nego što tačke uđu. Kolone geografske širine i dužine umesto toga idu kroz koordinatni sistem.
- **Dodatak Oblaci tačaka**: pita kada pravite oblak čija datoteka ne navodi jedinicu, i označava brojeve oblaka jedinicom koju nosi.
- **IFC i LandXML**: navode svoje; pretvaraju se u jedinice projekta.
- **LAS, LAZ i rasteri kota**: postavljaju se prema svom koordinatnom sistemu; dijalog terena pita za jedinicu kote kada datoteka to ne kaže.

## Dobro je znati

- Odgovor se pamti za tu datoteku na ovom računaru, u svim CadCraft aplikacijama. Sledeći put kada uđe, ne pita se.
- Da biste bili pitani ponovo: paleta komandi ({{key:Mod+K}}) › **Pitaj ponovo za jedinice uvezenih datoteka**.
- Jedinica koju lista navodi čita se iz njenih prvih osam redova: red kao `units: ft`, ili naslovi kolona koji svi nose istu jedinicu u zagradama, kao `Elevation (m)`.
