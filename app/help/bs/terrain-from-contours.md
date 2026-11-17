---
title: Teren iz linija izohipsi
summary: Napravi površinu terena iz karte izohipsi: odaberi slojeve linija, označi odakle dolazi kota svake linije, provjeri ukrštanja i duplikate, pa izgradi. Linije izohipsi postaju prelomne linije, a ravni trouglovi na grebenima i dolinama se popravljaju. Karta prenesena sa slike ili PDF-a može se skalirati i postaviti pomoću dvije poznate tačke.
keywords: izohipse, linije izohipsi, teren iz izohipsi, površina iz izohipsi, topografska karta, geodetska karta, bez koordinata, prelomne linije, ravni trouglovi, greben, dolina, vrh brda, ukrštajuće izohipse, duplirane izohipse, interval izohipsi, skaliranje karte, dvije tačke, postavljanje karte, DXF, DWG, shapefile
from: e6161653
---

Geodet ponekad pošalje kartu izohipsi: linije s kotama, ali bez tačaka. CivilCraft gradi postojeći teren iz tih linija.

## Uvedi izohipse

Otvori kartu kao linije: DXF ili DWG crtež, shapefile ili GeoJSON (**GIS** › {{ui:Uvezi}}, ili prevuci datoteku na plan). Linije ulaze kao **slojevi karte**. Pod **Površina** › {{ui:Više}}, odaberi {{ui:Teren iz izohipsa}}.

## Označi odakle dolazi kota

Označi slojeve koji sadrže izohipse, zatim odaberi **Kota iz**:

- {{ui:Vlastitih kota linija}}: linija čiji svi vrhovi imaju istu kotu (3D polilinija, ili polilinija s kotom). Linija na 0 je linearni crtež plana i nema visinu.
- **Numeričko polje** sloja (na primjer ELEV), kada je karta došla s njim.
- {{ui:Početne kote i intervala, redom kojim su linije navedene}}: za linije bez ikakve kote. Prva navedena linija dobija **Kotu prve linije**, sljedeća tu kotu plus **Interval izohipsi**, i tako dalje. Navedi linije od najniže prema višoj (ili ih preuredi u sloju).

## Provjeri, pa izgradi

{{ui:Provjeri}} navodi šta nije u redu, riječima, prije nego išta bude promijenjeno:

- linija bez **kote** ili s manje od dvije tačke;
- **dupla** linija (isti oblik dvaput, čak i nacrtan u suprotnom smjeru);
- dvije linije koje se **ukrštaju**, na različitim kotama ili na istoj (linija koja se ukršta sama sa sobom također), s mjestom;
- kota koja **nije na intervalu** (greška pri kucanju, kao 105.5 na karti s 1 m).

Označi {{ui:Izostavi linije koje presijecaju drugu}} da odbaciš liniju koja presijeca najviše drugih (zatim sljedeću, dok nijedna ne presijeca): odlazi zalutala linija koja siječe svaku izohipsu, a ne izohipse. **Pojednostavi linije unutar** prorjeđuje vrhove koji su bliži pravoj dionici od te udaljenosti.

{{ui:Izgradi teren}} dodaje linije postojećem terenu kao prelomne linije (jedan korak poništavanja), pa površina prolazi kroz svaku izohipsu tačno. Kada je označeno {{ui:Popravi ravne trouglove na grebenima, dolinama i vrhovima}} i dat interval, CivilCraft također dodaje tačku unutar svakog ravnog trougla (trougao čiji svi uglovi leže na jednoj izohipsi) na visini na koju se nastavlja nagib uz njega, nikada više od pola intervala od izohipse. Bez toga, vrhovi grebena, dna dolina i vrhovi brda ispadaju kao ravne ploče. Na probnom brdu greška u odnosu na stvarnu površinu smanjila se za četvrtinu; na grebenu za 40 %.

## Karta bez koordinata

Za kartu izohipsi prenesenu sa slike ili PDF-a, otvori **Skaliraj i postavi slojeve pomoću dvije poznate tačke**. Navedi dvije tačke na karti i gdje se one stvarno nalaze; označeni slojevi se skaliraju, okreću i pomjeraju da se uklope (jedan korak poništavanja; visine se ne mijenjaju). Iste dvije tačke daju razmjeru (prikazanu u poruci) i rotaciju.

Površina je dobra koliko i karta: između dvije izohipse ona je ravan, pa stvarni teren između njih nije poznat. Provjeri rezultat u odnosu na kote tačaka prije nego se oslanjaš na njega.
