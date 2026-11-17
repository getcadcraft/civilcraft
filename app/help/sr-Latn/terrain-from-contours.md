---
title: Teren iz izohipsi
summary: Napravi površinu terena iz topografske karte: izaberi slojeve linija, navedi odakle dolazi kota svake linije, proveri preseke i duplikate, pa izgradi. Linije izohipsi postaju linije loma, a ravni trouglovi na grebenima i u dolinama se popravljaju. Karta izvučena sa slike ili iz PDF-a može se skalirati i postaviti pomoću dve poznate tačke.
keywords: izohipse, linije izohipsi, teren iz izohipsi, površina iz izohipsi, topografska karta, geodetska karta, bez koordinata, linije loma, ravni trouglovi, greben, dolina, vrh brda, preseci izohipsi, duplikati izohipsi, interval izohipsi, skaliranje karte, dve tačke, postavljanje karte, DXF, DWG, shapefile
from: e6161653
---

Geodetičar ponekad pošalje topografsku kartu: linije sa kotama, ali bez tačaka. CivilCraft gradi postojeći teren iz tih linija.

## Uvedi izohipse

Otvorite kartu kao linije: crtež DXF ili DWG, shapefile ili GeoJSON (**GIS** › {{ui:Import}}, ili prevucite datoteku na plan). Linije dolaze kao **slojevi karte**. Pod **Teren** › {{ui:More}} izaberite {{ui:Terrain from contours}}.

## Navedi odakle dolazi kota

Štiklirajte slojeve koji sadrže izohipse, pa izaberite **Kota iz**:

- {{ui:The lines' own elevations}}: linija čiji svi vrhovi imaju istu kotu (3D polilinija, ili polilinija sa kotom). Linija na 0 je plan i nema visinu.
- **Polje brojeva** sloja (na primer ELEV), kada je karta došla sa njim.
- {{ui:A start and an interval, in the order the lines are listed}}: za linije bez ikakve kote. Prva navedena linija dobija **Kotu prve linije**, sledeća tu kotu plus **Interval izohipsi**, i tako dalje. Navedite linije od najniže ka višoj (ili ih preuredite u sloju).

## Proveri, pa izgradi

{{ui:Check}} navodi, rečima, šta nije u redu, pre nego što se bilo šta promeni:

- linija **bez kote** ili sa manje od dve tačke;
- **duplikat** linije (isti oblik dvaput, čak i nacrtan obrnutim smerom);
- dve linije koje se **seku**, na različitim kotama ili na istoj (linija koja se seče sama sa sobom takođe), sa mestom preseka;
- kota koja **nije na intervalu** (greška u kucanju kao 105.5 na karti sa intervalom 1 m).

Štiklirajte {{ui:Leave out lines that cross another}} da odbacite liniju koja seče najviše drugih (pa sledeću, dok nijedna ne seče). Zalutala linija koja seče svaku izohipsu je ona koja odlazi, a ne izohipse. **Pojednostavi linije unutar** proređuje tačke koje su bliže pravoj nego to rastojanje.

{{ui:Build the ground}} dodaje linije postojećem terenu kao linije loma (jedan korak opozivanja), tako da površina prolazi kroz svaku izohipsu tačno. Sa štiklirano {{ui:Fix flat triangles on ridges, valleys and hilltops}} i zadatim intervalom, CivilCraft takođe dodaje tačku unutar svakog ravnog trougla (trougla čiji se svi ćoškovi nalaze na jednoj izohipsi) na visini na kojoj nastavlja nagib pored njega, a nikada više od pola intervala od izohipse. Bez toga, vrhovi grebena, dna dolina i vrhovi brda ispadaju kao ravne ploče. Na probnom brdu greška u odnosu na pravu površinu pala je za četvrtinu; na grebenu za 40 %.

## Karta bez koordinata

Za topografsku kartu izvučenu sa slike ili iz PDF-a otvorite **Skaliraj i postavi slojeve pomoću dve poznate tačke**. Zadajte dve tačke na karti i gde se one zaista nalaze; štiklirani slojevi se skaliraju, zaokreću i pomeraju da bi se uklopili (jedan korak opozivanja; visine se ne menjaju). Iste dve tačke daju razmeru (prikazuje se u poruci) i rotaciju.

Površina je dobra koliko i karta: između dve izohipse ona je ravan, pa stvarni teren između njih nije poznat. Proverite rezultat u odnosu na kote tačaka pre nego što mu verujete.
