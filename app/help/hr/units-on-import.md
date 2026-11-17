---
title: Jedinice pri uvozu: datoteka navodi svoje jedinice ili se prvo pita
summary: Kada crtež ili mreža koju uvozite u projekt navodi svoje jedinice, CivilCraft ih pretvara i to kaže. Kada ih ne navodi, CivilCraft pita prije čitanja i pamti vaš odgovor za tu datoteku.
keywords: jedinice, uvoz, DWG, DXF, STL, OBJ, geodezija, stope, američke geodetske stope, metri, milimetri, mjerilo, pogrešna veličina, preveliko, premalo, pitanje, zapamćeno, INSUNITS, jedinice crteža
from: 60921963
---

## Što ćete raditi

Uvedite datoteku u projekt i budite sigurni da uđe u pravoj veličini.

## Koraci

1. Otvorite datoteku kao i obično: {{ui:Otvori}}, povucite je na plan ili upotrijebite naredbu za CAD crtež.
2. Ako datoteka navodi svoje jedinice, ništa se ne pita: dijaloški okvir za uvoz prikazuje ih kao **Kako piše u crtežu**.
3. Ako ne navodi, dijaloški okvir pita **Jedinice datoteke** prije otvaranja dijaloškog okvira za uvoz. Odaberite što je jedna jedinica u datoteci i kliknite {{ui:Upotrijebi ove jedinice}}.
4. {{ui:Odustani}} (ili {{key:Esc}}) preskače datoteku. Ništa iz nje se ne čita u projekt.

## Koje datoteke navode svoje jedinice

- **DWG i DXF**: jedinice umetanja crteža (`$INSUNITS`). Za datoteku bez njih pita se. Popis **Jedinice crteža** u dijaloškom okviru za uvoz počinje vašim odgovorom i još se može promijeniti.
- **STL i OBJ** (slobodni oblici terena): nikada ne navode jedinice. Pita se vas.
- **Popisi točaka** (CSV, TXT) i popisi tekućih geodetskih mjerenja: popis koji navodi jedinicu u prvim recima se pretvara i statusni redak to kaže. Za popis koji ne navodi nijednu pita se kada pritisnete {{ui:Uvezi}}, prije nego što točke uđu. Stupci geografske širine i dužine umjesto toga prolaze kroz koordinatni sustav.
- **Dodatak Oblaci točaka**: pita kada izrađujete oblak čija datoteka ne navodi jedinicu i označava brojeve oblaka jedinicom koju nosi.
- **IFC i LandXML**: navode svoje; pretvaraju se u jedinice projekta.
- **LAS, LAZ i rasteri kota**: postavljaju se prema svom koordinatnom sustavu; dijaloški okvir za teren pita za jedinicu kote kada datoteka to ne navodi.

## Dobro je znati

- Odgovor se pamti za tu datoteku na ovom računalu, u svakoj aplikaciji CadCraft. Sljedeći put kada uđe, ne pita se.
- Da vas se ponovno pita: paleta naredbi ({{key:Mod+K}}) › **Ponovno pitaj za jedinice uvezenih datoteka**.
- Jedinica koju popis navodi čita se iz prvih osam redaka: redak poput `units: ft` ili naslovi stupaca koji svi u zagradi nose istu jedinicu, poput `Elevation (m)`.
