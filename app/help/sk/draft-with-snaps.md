---
title: Kreslenie s prichytávaním, vybraté rohy a presun, kopírovanie a otočenie
summary: Umiestnite osi trasy, plošiny, parcely a charakteristické čiary presne na body a rohy, ktoré už máte, zadajte alebo vyberte X a Y rohu, nasmerujte dotyčnicu k dvom bodom a presuňte, skopírujte alebo otočte objekt o vzdialenosť alebo uhol.
keywords: prichytávanie, uchopenie objektu, prichytenie k bodu, prichytenie k rohu, PI, vrchol, roh, výber, kríž, X, Y, súradnice, zadané súradnice, dotyčnica, smer, azimut, presun, kopírovanie, otočenie, transformácia, otočená kópia, duplikovať, alt, voľný bod, kreslenie
from: 49864dda
---

Nové vo verzii 0.9: pri kreslení kurzor dopadne na body a rohy, ktoré už sú v pôdoryse, a roh plošiny, parcely alebo charakteristickej čiary sa dá zadať alebo vybrať. Táto téma prechádza tromi nástrojmi.

## Čo budete robiť

- Kreslite s prichytávaním, aby nová os trasy, plošina, parcela alebo čiara začínala a končila presne na niečom, čo už existuje.
- Nastavte X a Y rohu zadaním alebo výberom miesta v pôdoryse.
- Nasmerujte dotyčnicu osi trasy k dvom vybraným bodom.
- Presuňte, skopírujte alebo otočte celý objekt.

## Postup

1. Vyberte kresliaci nástroj, napríklad {{ui:Os trasy}}, {{ui:Plošina}}, {{ui:Parcela}} alebo {{ui:Charakteristická čiara}}. Presuňte kurzor blízko meraného bodu, PI osi trasy, rohu plošiny, parcely alebo zemnej hmoty, vrcholu charakteristickej čiary alebo dažďového objektu. Objaví sa značka s popisom (PI, Roh, Vrchol, Objekt alebo Bod a jeho číslo) a X a Y, kam dopadne. Kliknutím bod umiestnite na toto miesto.
2. Ak chcete bod umiestniť voľne, podržte {{key:Alt}} pri kliknutí. Prichytávanie sa vypne.
3. Vyberte plošinu, parcelu alebo charakteristickú čiaru. Vo **Vlastnostiach** blok {{ui:Rohy}} uvádza každý roh s políčkom X a políčkom Y. Zadajte nové čísla alebo stlačte tlačidlo s krížom vedľa rohu a kliknite na miesto v pôdoryse. Roh dostane tú X a Y. Výber zrušíte klávesom {{key:Esc}}. Kríž funguje iba v pôdoryse: najprv zatvorte 3D zobrazenie.
4. Ak chcete otočiť dotyčnicu, vyberte os trasy. Vo **Vlastnostiach** pod {{ui:Dotyčnica z dvoch bodov}} vyberte dotyčnicu, stlačte {{ui:Prvý bod}} a kliknite v pôdoryse, stlačte {{ui:Druhý bod}} a kliknite znova, potom stlačte {{ui:Nastaviť smer}}. Dotyčnica sa otočí tak, aby viedla z prvého bodu k druhému, a zachová svoju dĺžku.
5. Ak chcete presunúť, skopírovať alebo otočiť, vyberte os trasy, plošinu, parcelu alebo charakteristickú čiaru. Vo **Vlastnostiach** pod {{ui:Presun, kopírovanie a otočenie}} zadajte {{ui:Presunúť na východ}} a {{ui:Presunúť na sever}} (záporné čísla idú na západ a juh) a stlačte {{ui:Presunúť}} alebo {{ui:Kopírovať}}. Alebo stlačte {{ui:Vzdialenosť z dvoch bodov}} a kliknite na bod, z ktorého sa presúva, a na bod, do ktorého sa presúva.
6. Ak chcete otočiť, zadajte uhol do {{ui:Otočiť proti smeru hodinových ručičiek}} (stupne) a potom stlačte {{ui:Otočiť}} alebo {{ui:Kopírovať otočený}}. Otáča sa okolo stredu svojich rohov, pokiaľ nevyberiete bod, okolo ktorého sa má otáčať, pomocou kríža vedľa uhla.

## Poznámky

- Kópia nechá originál na mieste a potom sa vyberie.
- Každý presun, kopírovanie, otočenie, vybratý roh a otočená dotyčnica je jeden krok späť.
- Prichytenie dosiahne 10 obrazových bodov od kurzora. Značka prichytenia iba ponúka miesto; nič sa nezmení, kým neklikniete.
- Ten istý kríž je aj v riadkoch PI osi trasy. Pozri [Osi trasy](topic:alignment), [Parcely](topic:parcels) a [Charakteristické čiary](topic:feature-lines).
