---
title: Oblikuj sloj po atributu
summary: Boji objekte GIS sloja po vrijednostima polja (jedna boja po vrijednosti ili po rasponima brojeva), veličinom tačaka po broju, bojenjem poligona i legendom na planu.
keywords: simbologija, stil, boja, kategorizovano, stepenovano, jedinstvene vrijednosti, jednaki interval, kvantil, prirodni prekidi, jenks, paleta, daltonizam, legenda, veličina, tačke, horopleta, klase, gis
from: a3a69add
---

Otvori meni **tri tačke** sloja u listi GIS slojeva i odaberi {{ui:Oblikuj po atributu…}}.

## Tri stila

- **Jedan simbol:** boja sloja, kao ranije.
- **Kategorizovano:** jedna boja za svaku različitu vrijednost bilo kojeg polja. Do osam vrijednosti dobija osam Okabe-Ito boja (odabrane da ostanu odvojene za česte vrste daltonizma); sa više vrijednosti, sedam najčešćih dobija boju, a ostale dijele sivu klasu **Ostalo**. Objekti bez vrijednosti su sivi.
- **Stepenovano:** numeričko polje se dijeli na 2 do 9 raspona, svaki sa bojom iz palete. Vrijednost na granici ide u niži raspon.

## Kako se rasponi dijele

| Metod | Prekidi |
|---|---|
| Jednaki interval | Raspon od najmanje do najveće vrijednosti podijeljen na jednake širine. Vrijednosti 0 do 30 u tri raspona: 0, 10, 20, 30. |
| Kvantil | Otprilike isti broj objekata u svakom rasponu. Prekidi se čitaju iz sortiranih vrijednosti uobičajenom linearnom interpolacijom: za 1 do 10 u dva raspona prekid je 5.5. |
| Prirodni prekidi (Jenks) | Rezovi koji ostavljaju najmanje rasipanja unutar svakog raspona, pa grupe sličnih vrijednosti ostaju zajedno. Nad više od 1,500 vrijednosti radi nad 1,500 ravnomjerno raspoređenih i to kaže. |

## Boje

Viridis i Cividis idu od tamnog ka svijetlom, sa stalnom promjenom svjetline, pa se redoslijed raspona može pročitati i u sivom ili kod daltonizma. Blues ide od svijetlog ka tamnom. Crveno do plavo je dvosmjerna paleta za vrijednosti oko sredine. **Obrni boje** okreće bilo koju od njih. Dijalog navodi raspone i broj objekata u svakom prije primjene.

## Veličina, ispuna i legenda

- **Veličina tačke po** numeričkom polju čini kvadrat svake tačke većim što je vrijednost veća, između dvije veličine koje zadaš (polovina stranice, u milimetrima na papiru).
- **Oboji unutrašnjost poligona** ispunjava svaki poligon bojom njegove klase (rupe ostaju prazne). Obojenje je na ekranu; plotovi i DXF/DWG prikazuju obojene konture.
- **Prikaži legendu na planu** crta klase, njihove brojeve i raspon veličina u donjem lijevom uglu plana. Legenda je na ekranu; nije u plotu.
- Za označavanje objekata poljem koristi **Označi sa** u istom meniju.

Stil se čuva u datoteci projekta. Verzija koja ne zna za stilove otvara datoteku sa bojom sloja. Plotovi, DXF i DWG nose klase kao zasebne slojeve nazvane po sloju i klasi, u najbližoj od devet osnovnih CAD boja. Sloj od više od 200,000 objekata se crta jednom bojom.
