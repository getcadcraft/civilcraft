---
title: Jedinice pri uvozu: datoteka navodi svoje jedinice, ili te prvo pitamo
summary: Kad crtež ili mreža koju uvodiš u projekat navodi svoje jedinice, CivilCraft ih pretvara i to kaže. Kad ih ne navodi, CivilCraft pita prije čitanja i pamti tvoj odgovor za tu datoteku.
keywords: jedinice, uvoz, DWG, DXF, STL, OBJ, geodetsko snimanje, stope, američke geodetske stope, metri, milimetri, razmjera, pogrešna veličina, preveliko, premalo, pitaj, zapamćeno, INSUNITS, jedinice crteža
from: 60921963
---

## Šta ćeš uraditi

Uvesti datoteku u projekat i biti siguran da ulazi u pravoj veličini.

## Koraci

1. Otvori datoteku kao obično: {{ui:Otvori}}, prevuci je na plan, ili naredba za CAD crtež.
2. Ako datoteka navodi svoje jedinice, ništa se ne pita: dijalog za uvoz ih prikazuje kao **Kako kaže crtež**.
3. Ako ne navodi, dijalog pita **Jedinice** datoteke prije nego što se otvori dijalog za uvoz. Izaberi šta je jedna jedinica u datoteci i klikni {{ui:Koristi ove jedinice}}.
4. {{ui:Otkaži}} (ili {{key:Esc}}) preskače datoteku. Ništa iz nje se ne učitava u projekat.

## Koje datoteke navode svoje jedinice

- **DWG i DXF**: jedinice umetanja crteža (`$INSUNITS`). Datoteka bez njih se pita. Lista **Jedinice crteža** u dijalogu za uvoz počinje tvojim odgovorom i može se i dalje promijeniti.
- **STL i OBJ** (slobodni oblici terena): nikad ne navode jedinice. Pita se.
- **Liste tačaka** (CSV, TXT) i liste terenskog snimanja: lista koja navodi svoju jedinicu u prvim redovima se pretvara, a statusni red to kaže. Lista bez jedinice pita se kad pritisneš {{ui:Uvezi}}, prije nego što tačke uđu. Kolone geografske širine i dužine prolaze kroz koordinatni sistem.
- **Dodatak Oblaci tačaka**: pita kad napraviš oblak čija datoteka ne navodi jedinicu, i označava brojeve oblaka jedinicom koju nosi.
- **IFC i LandXML**: navode svoje; pretvaraju se u jedinice projekta.
- **LAS, LAZ i rasteri kota**: postavljaju se prema svom koordinatnom sistemu; dijalog terena pita za jedinicu kote kad datoteka ne kaže.

## Dobro je znati

- Odgovor se pamti za tu datoteku na ovom računaru, u svim CadCraft aplikacijama. Sljedeći put kad uđe, ne pitaš se.
- Da te ponovo pita: paleta naredbi ({{key:Mod+K}}) › **Ponovo pitaj za jedinice uvezenih datoteka**.
- Jedinica koju lista navodi čita se iz prvih osam redova: red kao `units: ft`, ili naslovi kolona koji svi nose istu jedinicu u zagradama, kao `Elevation (m)`.
