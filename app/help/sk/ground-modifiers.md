---
title: Úpravy terénu a živé úrovne
summary: Všetko, čo tvaruje navrhovaný terén, v jednom usporiadanom zozname (neskorší má prednosť tam, kde sa prekrývajú), výkop a násyp pre každú úpravu, kontroly spojov v paneli Problémy a bodové úrovne a šípky sklonu, ktoré čítajú terén naživo.
keywords: úpravy terénu, zásobník, poradie, navrhovaný terén, jestvujúci terén, prekrytie, výkop a násyp, spoj, oporný múr, hrana dláždenia, úroveň podložia, podesta schodov, bodová úroveň, výškový bod, šípka sklonu, označenie sklonu, spády
from: 3998a5b0
---

Navrhovaný terén = jestvujúci terén + úpravy podľa poradia. Jestvujúci terén sa nikdy nemení.

## Zoznam

{{ui:Úrovne}} › {{ui:Úpravy terénu…}} vypíše každý objekt, ktorý tvaruje terén: plošiny, valy, vsakovacie priekopy, plochy úprav, dláždenie a chodníky, osadené plochy s konečnou úrovňou a schody a rampy, u ktorých je zaškrtnuté políčko **Tvaruje terén** (s ich spodnou a hornou úrovňou). Kde sa dva prekrývajú, **neskorší** má prednosť. Riadok presuňte ťahaním alebo pomocou šípok; terén sa hneď prepočíta. Každý riadok ukazuje svoj výkop a násyp (čo tvaruje po tých, ktoré sú nad ním), so súčtom pod zoznamom.

## Kontroly spojov

Panel Problémy vypíše s **prejsť na**:

- múr, ktorého vysoká strana je nad jeho hornou hranou (zemina nad múrom), alebo ktorého nízka strana ukazuje jeho základ;
- osadenú plochu, ktorej konečná úroveň je nad hranou dláždenia, na ktorú naráža, alebo viac než typických 150 mm pod ňou;
- schody, ktorých spodok alebo vrch nenadväzuje na dláždenie, na ktorom pristávajú;
- dve úpravy, ktoré sa prekrývajú (tam má prednosť neskoršia).

Oporný múr môže mať hornú hranu, ktorá nasleduje vysokú stranu terénu: jeho výška sa prepočíta vždy, keď sa terén zmení.

## Oporný múr, ktorý tvaruje terén

Vyberte oporný múr a zaškrtnite **Tvaruje terén**. Pás pod múrom (rovnako široký, ako je múr hrubý) sa zaradí do zoznamu ako úprava:

- hrana na **vysokej strane** sa drží na terénu tam, staničenie po staničení, takže horná hrana múra nasleduje vysokú stranu (s korunovou rímsou navrchu). Ak zadáte **Hornú** úroveň, vysoká strana sa drží na tejto úrovni zníženej o korunovú rímsu;
- hrana na **nízkej strane** sa drží na úrovni, ktorú zadáte do **Terén držaný na nízkej strane**, alebo, ak pole necháte prázdne, na terénu tam;
- vysoká strana je strana, ktorej terén je vyšší po celej dĺžke múra, takže sa pozdĺž múra nikdy neprehodí;
- terén za pásom sa nemení a jestvujúci terén sa nikdy nemení.

Ako každá úprava, aj tento múr je v zozname a úprava zaradená za ním má prednosť tam, kde sa prekrývajú. Múr, ktorého držaná úroveň na konci je viac než typických 150 mm od jestvujúceho terénu, dostane upozornenie v paneli Problémy (s **prejsť na**). Voľne stojaci múr terén netvaruje. V súboroch zo skorších zostavení je políčko vypnuté, takže sa otvoria tak, ako boli.

## Bodové úrovne a šípky sklonu

{{ui:Bodová úroveň}} (jedno kliknutie) a {{ui:Šípka sklonu}} (dve kliknutia) čítajú terén zakaždým, keď sa kreslia: keď objekt presuniete alebo znova vyrovnáte, popisky sa prispôsobia. V paneli Vlastnosti zvoľte, či popisok číta navrhovaný, alebo jestvujúci terén; popisky jestvujúceho terénu sa zobrazia v zátvorkách. Šípky ukazujú smerom nadol a uvádzajú `1:20 (5.0 %)`.
