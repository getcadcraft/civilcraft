---
title: Nechajte AI asistenta pracovať s vašou lokalitou
summary: Zapnite asistentov v nastaveniach, aby asistent vo vašom počítači mohol čítať otvorenú lokalitu (body, povrchy, objemy, profily, parcely), pridávať geodetické body, ukladať a exportovať LandXML alebo DWG cez CadCraft Studio. Vypnuté, kým ho nezapnete.
keywords: ai, asistent, mcp, skript, automatizácia, studio, body, výška, staničenie, odsadenie, os trasy, objem, výkop, násyp, profil, parcela, landxml, dwg, usd, priečinky, oprávnenia, odpojiť, aktivita
from: d0356582
---

## Čo sa naučíte

Ako necháte AI asistenta (akéhokoľvek asistenta, ktorý hovorí MCP) pracovať s lokalitou, ktorú máte otvorenú, čo môže a čo nemôže urobiť a ako ho zastaviť.

## Čo asistent môže robiť v CivilCraft

| Žiada si | Čo dostane | Potrebuje |
|---|---|---|
| Lokalitu | Názov, jednotky, súradnicový systém, skupiny bodov, osi trasy, povrchy, plošiny, parcely a potrubia | Čítanie |
| Geodetické body | Číslo, Y, X, výška a popis, podľa skupiny, podľa popisu alebo vo vnútri obdĺžnika | Čítanie |
| Výšky povrchu | Jestvujúci terén (alebo upravený povrch) v ľubovoľných bodoch, ktoré pomenuje | Čítanie |
| Staničenia a odsadenia | Staničenie a odsadenie bodov pozdĺž osi trasy, alebo súradnice a výška terénu staníc | Čítanie |
| Profil | Výšky terénu, návrhového profilu a upraveného povrchu pozdĺž osi trasy, každých toľko stôp alebo metrov | Čítanie |
| Výkop a násyp | Objemy medzi jestvujúcim terénom a upraveným povrchom (aj každej plošiny a koridoru), alebo medzi terénom a rovinou | Čítanie |
| Parcely | Rohy, plocha (v akroch alebo hektároch), obvod a popis pozemku | Čítanie |
| Výber | Body, ktoré pomenuje, sa označia v pôdoryse, ako keby ste ich vybrali | Úpravy |
| Nové geodetické body | Body pridané s číslami, ktoré dá, alebo s najbližšími voľnými. Každé volanie je jeden krok, ktorý môžete vrátiť | Úpravy |
| Uložiť | Vlastné {{ui:Uložiť}} CivilCraft | Uložiť |
| LandXML alebo DWG | Tie isté súbory ako tlačidlá {{ui:LandXML}} a {{ui:DWG}} | Export |
| Lokalita v 3D | OpenUSD (.usdz, .usda alebo .usdc) terénu, upraveného povrchu, plošín a potrubí, tak ako ju exportuje 3D pohľad | Export |
| Rastliny a zoznam rastlín | Rastliny nájdené v zozname rastlín pod ľubovoľným názvom a počty zo zoznamu rastlín | Čítanie |
| Výsadba a úprava terénu | Rastliny, záhon alebo živý plot umiestnené, alebo plošina, val, odvodňovacia depresia či oblasť úpravy terénu pridaná, každá ako jeden krok, ktorý môžete vrátiť, s jej výkopom a násypom | Úpravy |
| Kontrola závlahy | Prietok každej zóny, tlak potrebný pri jej ventile a na prívode, najhoršia tlaková výška, doby behu, problémy a kusovník, ako pomôcka pre výpočet, ktorú kontroluje projektant závlahy | Čítanie |

Pracuje s otvorenou lokalitou. V Studiu môže aj ukladať a exportovať do priečinkov, ktoré zvolíte (nižšie); bez priečinka sa jeho súbory stiahnu rovnako ako pri tlačidlách.

## Zapnutie

Asistenti sa k CivilCraft dostanú cez CadCraft Studio vo vašom počítači; obyčajný prehliadač nemá spôsob, ako sa dostať dnu.

1. Otvorte {{ui:Nastavenia}} a zvoľte kartu **CivilCraft**.
2. V časti **Asistenti** zaškrtnite **Povoliť AI asistentom a skriptom používať CivilCraft**.
3. **Čítanie** je zaškrtnuté za vás. Zaškrtnite **Úpravy**, **Uložiť** alebo **Export** iba vtedy, keď asistent tieto potrebuje.
4. Ak chcete, aby mohol ukladať a exportovať do priečinka, zvoľte {{ui:Pridať priečinok…}} pod **Priečinky, ktoré môže používať** a vyberte priečinok v dialógu Studia. {{ui:Odstrániť}} mu ho okamžite odoberie; každá iná cesta sa odmietne.
5. Pripojte asistenta v Studiu (Studio ukáže adresu a nastavenia, ktoré treba vložiť do asistenta).

## Keď je asistent pripojený

Poznámka v hornej časti pravého panela hovorí, ktorý asistent je pripojený a čo môže. Kliknite na {{ui:Odpojiť}}, aby sa jeho relácia okamžite ukončila; musí sa znova pripojiť, aby mohol pokračovať.

**Aktivita** pod **Asistenti** v Nastaveniach vypisuje každé volanie, ktoré asistent urobil, od najnovšieho, s tým, či prebehlo úspešne.

:::tip
Pýtajte sa jednoduchými slovami, napríklad "aká je výška terénu každých 50 stôp pozdĺž ulice Hlavná?", "koľko výkopu a násypu potrebujú plošiny?" alebo "pridaj riadiaci bod na tieto súradnice". Asistent prečíta lokalitu a odpovie, alebo vykoná zmenu ako jeden krok, ktorý môžete vrátiť.
:::

## Bez otvorenia CivilCraft

Server súborov CadCraft pre asistentov (`npx @getcadcraft/mcp`) a príkazový riadok `cadcraft` otvoria uložené projekty CivilCraft (`.civilcraft.json`) a súbory bodov pomocou vlastného kódu CivilCraft, bez okna: rovnaké čítacie nástroje, pridávanie bodov, uloženie projektu, LandXML a lokalita v 3D ako OpenUSD. `cadcraft convert site.civilcraft.json site.xml` zapíše LandXML z príkazového riadka. Otváranie LandXML, export DWG a nástroje pracovného priestoru Krajina stále potrebujú okno CivilCraft.

## Vypnutie

Zrušte zaškrtnutie **Povoliť AI asistentom a skriptom používať CivilCraft**. Každý asistent sa okamžite odpojí a nastavenie sa zachová na nabudúce.

## Pozrite tiež

- [Recepty pre AI asistentov](common:assistants-recipes): príklady s postupom, každý s nástrojmi, ktoré volá.
- [Návrh vodorovnej osi trasy](topic:alignment)
- [Vytvorenie a spresnenie povrchu](topic:build-surface)
- [Výber, kopírovanie a vkladanie geodetických bodov](topic:copy-paste-points)
- [Nastavenia CivilCraft](topic:settings)
