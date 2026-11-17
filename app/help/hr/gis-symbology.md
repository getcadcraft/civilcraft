---
title: Oboji sloj prema atributu
summary: Obojite značajke GIS sloja prema vrijednostima polja (jedna boja po vrijednosti ili po rasponima brojeva), veličinom točaka prema broju, tonirajte poligone i prikažite legendu na tlocrtu.
keywords: simbologija, stil, boja, kategorizirano, stupnjevano, jedinstvene vrijednosti, jednaki intervali, kvantil, prirodni prekidi, jenks, paleta, daltonizam, legenda, veličina, točke, kloroplet, klase, gis
from: a3a69add
---

Otvorite izbornik s **tri točkice** sloja u popisu GIS slojeva i odaberite {{ui:Stiliziraj po atributu…}}.

## Tri stila

- **Jedan simbol:** boja sloja, kao i prije.
- **Kategorizirano:** jedna boja po različitoj vrijednosti bilo kojeg polja. Do osam vrijednosti dobiva osam Okabe-Ito boja (odabranih da ostanu razlučive za uobičajene vrste daltonizma); s više vrijednosti sedam najčešćih dobiva svoju boju, a ostale dijele sivu klasu **Ostalo**. Značajke bez vrijednosti su sive.
- **Stupnjevano:** brojčano polje dijeli se na 2 do 9 raspona, svaki s bojom iz palete. Vrijednost na granici ide u niži raspon.

## Kako se rasponi određuju

| Metoda | Prekidi |
|---|---|
| Jednaki intervali | Raspon od najmanje do najveće vrijednosti podijeljen na jednake širine. Vrijednosti 0 do 30 u tri raspona: 0, 10, 20, 30. |
| Kvantil | Otprilike isti broj značajki u svakom rasponu. Prekidi se čitaju iz sortiranih vrijednosti uobičajenom linearnom interpolacijom: za 1 do 10 u dva raspona prekid je 5.5. |
| Prirodni prekidi (Jenks) | Rezovi koji ostavljaju najmanje raspršenosti unutar svakog raspona, pa skupine sličnih vrijednosti ostaju zajedno. Pri više od 1,500 vrijednosti radi na 1,500 jednako raspoređenih i to javlja. |

## Boje

Viridis i Cividis idu od tamne prema svijetloj uz stalnu promjenu svjetline, pa se redoslijed raspona može pročitati i u sivom ili kod daltonizma. Plavi ide od svijetle prema tamnoj. Crveno–plava je dvosmjerna paleta za vrijednosti oko srednje točke. **Obrnite boje** okreće bilo koju od njih. Dijalog prije primjene navodi raspone i broj značajki u svakom.

## Veličina, ispuna i legenda

- **Veličina točke prema** brojčanom polju čini kvadrat svake točke većim što je vrijednost veća, između dviju veličina koje zadate (polovica stranice, u milimetrima na papiru).
- **Toniraj unutrašnjost poligona** ispunjava svaki poligon bojom njegove klase (rupe ostaju prazne). Ton je na zaslonu; ispisi i DXF/DWG prikazuju obojene obrise.
- **Prikaži legendu na tlocrtu** crta klase, njihove brojeve i raspon veličina u donjem lijevom kutu tlocrta. Legenda je na zaslonu; nije u ispisu.
- Za označavanje značajki poljem koristite **Označi s** u istom izborniku.

Stil se sprema u datoteku projekta. Verzija koja ne zna za stilove otvara datoteku s bojom sloja. Ispisi, DXF i DWG nose klase kao zasebne slojeve imenovane po sloju i klasi, u najbližoj od devet osnovnih CAD boja. Sloj s više od 200,000 značajki crta se u jednoj boji.
