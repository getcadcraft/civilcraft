---
title: Výsadbové plány a zoznamy
summary: Umiestnite jednotlivé rastliny, výsadbové záhony vyplnené podľa rozstupu rastlín so zmiešanými rastlinami podľa percenta a živé ploty; označte ich a spočítajte v zozname rastlín pre tabuľkový procesor alebo TakeoffCraft.
keywords: výsadbový plán, zoznam rastlín, výsadbový záhon, hromadná výsadba, živý plot, strom, krík, pôdopokryvná rastlina, rozstup, trojuholníkový rozstup, počet rastlín, množstvá, popisky, koruna, značky rastlín, ifc, takeoff
from: ab49eab5
---

## Umiestnenie rastlín

1. Vyberte rastlinu v časti **Rastliny** vľavo.
2. Kliknite na {{ui:Plant}}, potom kliknite na pôdorys: každé kliknutie umiestni jednu rastlinu. Stlačením {{key:Esc}} zastavte.

Značka rastliny sa kreslí v jej rozpätí v dospelosti; Viac › {{ui:Show at planting size}} nakreslí každú rastlinu vo veľkosti, s ktorou sa vysádza. Stromy stoja na zemi pod nimi: keď neskôr upravujete terén, sledujú ho. Ak chcete rastlinu pripnúť na určitú kótu, zadajte ju do poľa **Kóta** vo Vlastnostiach.

## Výsadbové záhony

1. Vyberte hlavnú rastlinu, kliknite na {{ui:Bed}} a kliknite na rohy záhonu. Stlačte {{key:Enter}} (alebo kliknite znova na prvý roh) na uzavretie.
2. Záhon sa vyplní touto rastlinou v jej rozstupe, v **trojuholníkovom** vzore (bežnom: každá rastlina je rovnako vzdialená od šiestich ďalších), o polovicu rozstupu od okraja.
3. Vo Vlastnostiach **Pridať rastlinu** zmieša rastlinu vybranú vľavo. Nastavte každej rastline **Podiel %**: záhon ju zaberie presne toľko, rozložené po celej ploche. **Zmiešať znova** premieša, kde sú.

**Rozstup** prázdny použije vlastný rozstup rastlín (vážený ich podielmi); zadajte ho a použije sa pre každú rastlinu. **Vzor** môže byť štvorcový a **Rady pod uhlom** otáča rady.

## Živé ploty

Vyberte rastlinu živého plota, kliknite na {{ui:Hedge}}, kliknite pozdĺž plota a stlačte {{key:Enter}}. Rastliny ležia pozdĺž čiary v rozstupe, vycentrované tak, aby mali oba konce rovnaký okraj. Živý plot môže mať **dva rady, zoskupené vo šachovnici**, vo zvolenej vzdialenosti.

## Popisky

Jednotlivé rastliny sa popisujú podľa nastavenia popiskov (predvolene `{name}`); vlastný popisok pre jednu rastlinu zadajte vo Vlastnostiach. Záhony majú popisok s počtom každej rastliny, živé ploty s ich počtom. Viac › {{ui:Plant labels}} zapína a vypína popisky. Polia popiskov: `{name}`, `{botanical}`, `{size}` (kontajner), `{qty}`, `{height}`, `{spread}`, `{container}`.

## Zoznam rastlín

Viac › {{ui:Plant schedule…}} spočíta každú rastlinu podľa druhu, od jednotlivých rastlín, záhonov a živých plotov spolu, s jej veľkosťou pri výsadbe. Uložte ho ako **CSV** alebo **XLSX**, alebo ako **Odoslať do TakeoffCraft**: súbor množstiev, ktorý TakeoffCraft otvorí na ocenenie rastlín (vedľa nich sú množstvá spevnených plôch a závlah).

## IFC

Viac › {{ui:Export landscape IFC}} uloží krajinu ako súbor IFC (IFC 4.3), ktorý môže model BIM obsahovať: každá rastlina ako `IfcGeographicElement` typu VEGETATION, typizovaná podľa druhu, s vlastnosťami rastliny (botanický názov, veľkosti, odolnosť, voda, svetlo); každý záhon a živý plot ako jeden prvok s počtami, na pozemku. BimCraft ho otvorí vedľa budovy.
