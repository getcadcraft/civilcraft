---
title: Výber, kopírovanie a prilepovanie meračských bodov
summary: Vyberte merané body kliknutím, klávesom Shift a rámčekom alebo všetky naraz; kopírujte, vystrihujte, prilepujte, prilepujte na rovnaké miesto, duplikujte a zmažte ich s novými číslami bodov, ktoré sa nikdy nezhodujú; prilepujte riadky bodov z tabuľky a do tabuľky.
keywords: kopírovať, prilepiť, vystrihnúť, duplikovať, zmazať body, vybrať body, vybrať všetko, rámček výberu, okno, schránka, tabuľka, csv, prečíslovanie, čísla bodov, prilepiť na rovnaké miesto, klón, vytyčovanie
from: 78a6aea7
---

Merané body možno kopírovať a prilepovať v rámci projektu, medzi projektmi v dvoch kartách prehliadača a do tabuľky a z nej. Každá zmena je jeden krok späť a povrch sa hneď znova vytvorí z nových bodov.

## Výber bodov

S nástrojom {{ui:Výber}} ({{key:V}}):

- **Kliknite** na bod, aby sa vybral (iba on). Jeho čísla sa zobrazia pod **Vlastnosti**.
- {{key:Shift}} a **kliknutie** pridá bod do výberu alebo ho z výberu odoberie.
- {{key:Shift}} a **ťahanie** nakreslí rámček: body v ňom sa pridajú do výberu. Ak ťaháte okolo bodov, stane sa z neho laso; pozri [Výber meraných bodov lasom](topic:lasso-selection). Ťahanie bez {{key:Shift}} posúva pohľad, ako vždy.
- {{key:Mod+A}} (alebo {{ui:Viac}} › {{ui:Vybrať všetky body}}) vyberie každý bod.
- {{key:Esc}} (alebo {{ui:Viac}} › {{ui:Zrušiť výber}}) zruší výber.

Vybrané body majú krúžok. Ak je vybratých viac, **Vlastnosti** zobrazia ich počet, čísla, rozsah výšok a skupiny.

## Kopírovanie, vystrihovanie a mazanie

- {{ui:Kopírovať}} alebo {{key:Mod+C}} skopíruje vybrané body. CivilCraft si kópiu ponechá a zároveň ju uloží do systémovej schránky ako riadky bodov, takže ju môžete hneď prilepiť do tabuľky alebo textového súboru.
- {{ui:Viac}} › {{ui:Vystrihnúť}} alebo {{key:Mod+X}} ich skopíruje a zmaže v jednom kroku.
- {{ui:Viac}} › {{ui:Zmazať}} alebo {{key:Delete}} ich zmaže. {{key:Mod+Z}} ich vráti.

Riadky sú: bod, Y (northing), X (easting), výška, popis (P,N,E,Z,D), oddelené čiarkami, s tromi desatinnými miestami. Ak chcete najprv X a potom Y, nastavte **Riadky bodov** v [nastaveniach CivilCraft](topic:settings). Popis, ktorý by tabuľka považovala za vzorec (začína znakom =, +, - alebo @), dostane pred seba apostrof, aby zostal textom.

## Prilepenie

1. Stlačte {{key:Mod+V}} alebo kliknite na {{ui:Prilepiť}}. Body sledujú kurzor ako malé krížiky s bodkovanou čiarou späť k miestu, odkiaľ pochádzajú.
2. Kliknite, kam majú ísť. Stred skopírovaných bodov pristane v mieste kliknutia.
3. Alebo stlačte {{key:Enter}}, aby sa umiestnili na vlastné súradnice, alebo {{key:Esc}} na zrušenie.

{{ui:Viac}} › {{ui:Prilepiť na rovnaké miesto}} alebo {{key:Mod+Shift+V}} prilepí body hneď na ich vlastné súradnice. Prilepené body sú potom vybraté, takže ich môžete znova kopírovať, presúvať alebo mazať.

:::note
Kliknutie na {{ui:Prilepiť}} na paneli nástrojov číta systémovú schránku. Prehliadač sa môže pri prvom použití opýtať, či CivilCraft smie vidieť schránku. Ak to odmietnete, tlačidlo na paneli prilepí iba vlastnú kópiu CivilCraft; {{key:Mod+V}} stále prilepí riadky z tabuľky bez opýtania.
:::

## Čísla bodov sa nikdy nezhodujú

Dva body nikdy nemajú rovnaké číslo. Pri prilepovaní:

- Prilepený bod si ponechá svoje číslo, ak ho v projekte nemá žiadny iný bod. Takže po **Vystrihnúť** sa body prilepia späť so svojimi číslami a body skopírované z iného projektu si svoje čísla zachovajú, ak sú voľné.
- Prilepenému bodu, ktorého číslo je obsadené, sa pridelí nové celé číslo: o jeden viac než najvyššie používané číslo, počítané nahor.
- Stavový riadok uvedie, čo sa stalo, napríklad "1 si ponechal číslo; 9 dostalo nové čísla: 10–18 sa zmenilo na 277–285".

V [nastaveniach CivilCraft](topic:settings) môžete zvoliť **Vždy nové čísla** a číslo, od ktorého nové čísla začínajú, napríklad 5000 pre návrhové body.

:::warning
Skupiny bodov, ktoré vytvárajú povrch ako **hranu zlomu**, spájajú svoje body v poradí podľa čísel. Prilepené kópie bodov hrán zlomu (napríklad merania FL) dostanú nové, vyššie čísla a pripoja sa na koniec tejto hrany zlomu, možno s dlhým skokom. Po prilepení takýchto bodov skontrolujte pôdorys alebo nastavte ich skupinu na {{ui:Body}}.
:::

## Duplikovanie

{{ui:Viac}} › {{ui:Duplikovať}} alebo {{key:Mod+D}} vytvorí kópiu vybraných bodov, ktorá sleduje kurzor: kliknite, kam má ísť. Kópie vždy dostanú nové čísla a schránka CivilCraft zostane nezmenená.

## Z tabuľky alebo textového súboru

Vyberte riadky bodov v tabuľke (bod, Y, X, výška, popis) a skopírujte ich. V CivilCraft stlačte {{key:Mod+V}} a kliknite, kam majú ísť, alebo stlačte {{key:Mod+Shift+V}}, aby sa umiestnili na vlastné súradnice, čo je zvyčajne to, čo chcete pri skutočných meraniach.

Riadky sa čítajú presne ako [súbor bodov](topic:point-file-formats): čiarky, tabulátory alebo medzery, hlavičkový riadok, ak nejaký je. Bez hlavičky poradie stĺpcov určuje **Riadky bodov** v [nastaveniach CivilCraft](topic:settings).

Keď sú k dispozícii oba, CivilCraft rozhoduje podľa toho, čo je novšie: riadky v systémovej schránke, ktoré sa líšia od poslednej kópie CivilCraft, boli skopírované neskôr, takže sa prilepia. Text, ktorý neobsahuje body, sa ignoruje a namiesto neho sa prilepí vlastná kópia CivilCraft.

## Medzi projektmi a kartami

Kópia sa uchováva v tomto prehliadači, takže ju môže prilepiť druhá karta CivilCraft, aj keď sa prvá karta zavrie. Body skopírované v projekte v metroch a prilepené do projektu v stopách si zachovajú svoje čísla bez zmeny: nič sa neprevádza a stavový riadok to uvedie.

## Čo sa nekopíruje

Zatiaľ sa kopírujú iba merané body. Osi trasy, plošiny, potrubné siete, hrany zlomu a hranice sa zatiaľ nedajú kopírovať ani prilepovať. Prilepením sa nedajú presunúť existujúce body: použite {{ui:Vystrihnúť}} a prilepenie alebo presúvajte po jednom bode ([Úprava meraného bodu](topic:edit-points)).
