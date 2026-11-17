---
title: Teren iz izohipsnih linija
summary: Izradite površinu terena iz karte izohipsa: odaberite slojeve linija, navedite odakle dolazi visina svake linije, provjerite križanja i udvostručenja te izgradite. Izohipsne linije postaju prijelomnice, a ravni trokuti na grebenima i dolinama se popravljaju. Karta prenesena sa slike ili PDF-a može se skalirati i postaviti prema dvjema poznatim točkama.
keywords: izohipse, izohipsne linije, teren iz izohipsa, površina iz izohipsa, topografska karta, geodetska karta, bez koordinata, prijelomnice, ravni trokuti, greben, dolina, vrh brda, križanje izohipsa, udvostručene izohipse, razmak izohipsa, skaliranje karte, dvije točke, postavljanje karte, DXF, DWG, shapefile
from: e6161653
---

Geodet ponekad pošalje kartu izohipsa: linije s visinama, ali bez točaka. CivilCraft iz tih linija izrađuje postojeći teren.

## Uvezite izohipse

Otvorite kartu kao linije: DXF ili DWG nacrt, shapefile ili GeoJSON (**GIS** › {{ui:Uvezi}}, ili povucite datoteku na tlocrt). Linije se uvoze kao **slojevi karte**. Pod **Teren** › {{ui:Više}} odaberite {{ui:Teren iz izohipsa}}.

## Navedite odakle dolazi visina

Označite slojeve koji sadrže izohipse, zatim odaberite **Visina iz**:

- {{ui:Vlastitih visina linija}}: linija kojoj svi vrhovi imaju istu visinu (3D polilinija ili polilinija s visinom). Linija na 0 je linija tlocrta i nema visinu.
- **Polje s brojem** sloja (na primjer ELEV), kada karta dolazi s njim.
- {{ui:Početka i intervala, redom kojim su linije navedene}}: za linije bez ikakve visine. Prvoj navedenoj liniji dodjeljuje se **Visina prve linije**, sljedećoj ta visina plus **Razmak izohipsa**, i tako dalje. Navedite linije od najniže prema gore (ili ih preslažite u sloju).

## Provjerite, zatim izgradite

{{ui:Provjeri}} navodi što je pogrešno, riječima, prije nego se išta promijeni:

- linija **bez visine** ili s manje od dvije točke;
- **udvostručena** linija (isti oblik dvaput, čak i nacrtan u suprotnom smjeru);
- dvije linije koje se **križaju**, na različitim visinama ili na istoj (i linija koja se sama križa), s mjestom;
- visina koja **nije na intervalu** (greška u upisu poput 105.5 na karti od 1 m).

Označite {{ui:Izostavi linije koje križaju drugu}} da se izostavi linija koja križa najviše drugih (zatim sljedeća, dok se ništa ne križa): ide linija koja slučajno siječe svaku izohipsu, a ne izohipse. **Pojednostavi linije unutar** prorjeđuje vrhove koji su bliži ravnom potezu od te udaljenosti.

{{ui:Izgradi tlo}} dodaje linije postojećem terenu kao prijelomnice (jedan korak poništavanja), pa površina prolazi točno kroz svaku izohipsu. Uz označeno {{ui:Popravi ravne trokute na grebenima, dolinama i vrhovima}} i zadani interval, CivilCraft također dodaje točku unutar svakog ravnog trokuta (trokuta čiji svi kutovi leže na jednoj izohipsi) na visini na kojoj se nastavlja nagib uz njega, nikad više od pola intervala od izohipse. Bez toga, vrhovi grebena, dna dolina i vrhovi brda ispadaju kao ravne ploče. Na testnom brdu greška u odnosu na stvarnu površinu pala je za četvrtinu; na grebenu za 40 %.

## Karta bez koordinata

Za kartu izohipsa prenesenu sa slike ili PDF-a otvorite **Skaliraj i postavi slojeve prema dvjema poznatim točkama**. Unesite dvije točke na karti i gdje se stvarno nalaze; označeni slojevi se skaliraju, zakreću i pomiču da odgovaraju (jedan korak poništavanja; visine se ne mijenjaju). Iste dvije točke daju mjerilo (prikazano u poruci) i rotaciju.

Površina je dobra koliko i karta: između dvije izohipse ona je ravnina, pa stvarni teren između njih nije poznat. Prije oslanjanja na rezultat provjerite ga prema kotama na točkama.
