---
title: Stilizovanje sloja po atributu
summary: Obojte objekte GIS sloja prema vrednostima polja (jedna boja po vrednosti ili po opsezima brojeva), veličinu tačaka prema broju, nijansirajte poligone i prikažite legendu na osnovi.
keywords: simbologija, stil, boja, kategorisano, stepenovano, jedinstvene vrednosti, jednak interval, kvantil, prirodni prekidi, jenks, paleta, daltonizam, legenda, veličina, tačke, horopleta, klase, gis
from: a3a69add
---

Otvorite meni **tri tačke** sloja u listi GIS slojeva i izaberite {{ui:Stilizuj po atributu…}}.

## Tri stila

- **Jedan simbol:** boja sloja, kao i ranije.
- **Kategorisano:** jedna boja za svaku različitu vrednost bilo kog polja. Do osam vrednosti dobija osam Okabe-Ito boja (izabranih da ostanu razlučive za česte vrste daltonizma); sa više vrednosti, sedam najčešćih dobija po jednu boju, a ostale dele sivu klasu **Ostalo**. Objekti bez vrednosti su sivi.
- **Stepenovano:** brojčano polje se deli na 2 do 9 opsega, svaki sa bojom iz palete. Vrednost na prekidu ide u niži opseg.

## Kako se opsezi seku

| Metod | Prekidi |
|---|---|
| Jednak interval | Opseg od najmanje do najveće vrednosti deli se na jednake širine. Vrednosti od 0 do 30 u tri opsega: 0, 10, 20, 30. |
| Kvantil | Otprilike isti broj objekata u svakom opsegu. Prekidi se čitaju iz sortiranih vrednosti uobičajenom pravolinijskom interpolacijom: za 1 do 10 u dva opsega prekid je 5,5. |
| Prirodni prekidi (Jenks) | Rezovi koji ostavljaju najmanje rasipanja unutar svakog opsega, pa grupe sličnih vrednosti ostaju zajedno. Kod više od 1.500 vrednosti radi na 1.500 ravnomerno raspoređenih i to kaže. |

## Boje

Viridis i Cividis idu od tamnog ka svetlom uz stalnu promenu svetline, pa se redosled opsega može pročitati i u sivom ili pri daltonizmu. Blues ide od svetlog ka tamnom. Crveno do plavo je dvosmerna paleta za vrednosti oko srednje. **Obrni boje** okreće bilo koju od njih. Dijalog navodi opsege i broj objekata u svakom pre nego što primenite.

## Veličina, ispuna i legenda

- **Veličina tačke po** brojčanom polju čini kvadrat svake tačke većim što je vrednost veća, između dve veličine koje zadate (polovina stranice, u milimetrima na papiru).
- **Oboji unutrašnjost poligona** puni svaki poligon bojom njegove klase (rupe ostaju prazne). Nijansa je na ekranu; štampe i DXF/DWG prikazuju obojene konture.
- **Prikaži legendu na osnovi** crta klase, njihov broj i opseg veličina u donjem levom uglu osnove. Legenda je na ekranu; ne ulazi u štampu.
- Za označavanje objekata poljem koristite **Označi pomoću** u istom meniju.

Stil se čuva u datoteci projekta. Verzija koja ne zna za stilove otvara datoteku sa bojom sloja. Štampe, DXF i DWG nose klase kao zasebne slojeve imenovane po sloju i klasi, u najbližoj od devet osnovnih CAD boja. Sloj sa više od 200.000 objekata crta se u jednoj boji.
