---
title: Kontrola hmôt voči limitom zónovania, ktoré zadáte
summary: Zadajte odstupy pozemku riadok po riadku, výškový limit, rovinu expozície oblohy, koeficient podlažnej plochy a zastavanosť, pozrite zastavateľnú obálku na pláne a zistite, ktoré hmoty porušujú ktorý limit.
keywords: zónovanie, odstup, odstupy, predný, bočný, zadný, obálka, zastavateľná plocha, výškový limit, rovina expozície oblohy, koeficient podlažnej plochy, FAR, zastavanosť, pozemok, parcela, nariadenie, kontrola predpisov
from: 3e267b31
---

**CivilCraft nemá v sebe žiadny stavebný poriadok.** Nepozná pravidlá žiadneho mesta a neobsahuje ich knižnicu. Každé číslo na tejto stránke zadáte vy zo svojho nariadenia a každý výsledok hovorí, že bol meraný voči limitom, ktoré ste zadali. Je to spôsob, ako vidieť, ako limity pozemku tvarujú budovu, nie rozhodnutie o tom, či je návrh povolený.

## Zadajte limity

V **Vlastnostiach**, v časti **Hmoty budov**, vyberte **Parcelu** (alebo vyberte hmotu: limity jej parcely sa zobrazia pod ňou). Potom vyplňte, čo platí; prázdne políčko znamená „bez limitu“:

- **Uličná čiara**: hranica pozemku pri ulici. **Predný odstup** platí pre ňu, **Zadný odstup** pre čiaru najviac oproti nej a **Bočný odstup** pre ostatné.
- **Výškový limit**.
- **Rovina oblohy**: začína vo výške na hranici pozemku a stúpa o sumu, ktorú zadáte, na každú 1 dĺžky smerom dovnútra, meranú od uličnej čiary alebo od každej hranice pozemku (2 znamená 2 ku 1). Povolená výška nad bodom je najnižšia z roviny a výškového limitu.
- **Koeficient podlažnej plochy** (hrubá podlažná plocha hmôt na pozemku delená plochou pozemku) a **Zastavanosť** (ich pôdorysy delené plochou pozemku, zadané v percentách).

## Obálka

Zaškrtnite **Zobraziť obálku na pláne**, aby sa nakreslila na vrstve `A-MASS-ENVL`. Obálka je pozemok zmenšený od každej hranice pozemku o jej vlastný odstup, pričom posunuté čiary sa stretávajú v skosených rohoch. Hranica pozemku tvorená oblúkom sa berie ako krátke tetivy v rámci 0,01 od oblúka. Fungujú konvexné aj konkávne pozemky. Ak sa odstupy prekrížia (hlboký odstup na úzkom alebo veľmi konkávnom pozemku), obálka neexistuje a Vlastnosti to povedia; skúste menšie vzdialenosti.

## Výsledok

Pod políčkami dostane každá hmota a každý limit riadok s fajkou alebo krížikom:

- **odstupy**: plocha hmoty, ktorá leží mimo obálky;
- **výška**: výška hmoty oproti najvyššej povolenej nad jej pôdorysom (hranol jednej výšky je obmedzený najnižšou povolenou výškou v ktoromkoľvek z jeho rohov);
- **koeficient podlažnej plochy** a **zastavanosť**: všetky hmoty na parcele spolu.
