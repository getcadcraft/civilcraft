---
title: Izdelava in dopolnjevanje površja
summary: Kako CivilCraft triangulira obstoječi teren in kako ga oblikovati s skupinami prelomnic, narisanimi prelomnicami, zunanjo mejo in najdaljšim zunanjim robom.
keywords: tin, površje, triangulacija, prelomnica, meja, obstoječi teren, eg, ustvari površje, delaunay, trikotniki, največji rob, zunanja meja
from: b9eea3f3
---

CivilCraft ima na projekt eno površje obstoječega terena. Je TIN (nepravilna triangulirana mreža), zgrajen iz vaših točk, in se samodejno obnovi ob vsaki spremembi vhoda. Ukaza „obnovi“ ni in ni zastarelega površja.

## Kaj vstopa v površje

- Vsaka točka z višino v skupini, nastavljeni na {{ui:Točke}}.
- Vsaka skupina, nastavljena na {{ui:Prelomnica}}, povezana po številkah točk.
- Vsaka prelomnica, ki jo narišete z orodjem {{ui:Prelomnica}}.
- Zunanja meja, če jo narišete.
- Nastavitev **Najdaljši zunanji rob**.

Trikotniki nikoli ne sekajo prelomnice: površje je prisiljeno, da ji sledi, nato pa je čim bolj enakomerno izdelano okoli nje (drugod po Delaunayju).

## Pretvorba kodiranih črt v prelomnice

1. V levem panelu pod **Točke** poiščite skupino (na primer FL).
2. Nastavite njeno izbiro **Površje** na {{ui:Prelomnica}}.
   Površje se obnovi, črta se nariše oranžno (če je {{ui:Prelomnice}} vklopljeno pod **Prikaz**), in **Prelomnice** v podatkih o površju se poveča za ena.
3. Preverite črto na načrtu. Mora potekati od točke do točke v vrstnem redu, v katerem je bila izmerjena. Če zavija v cik-cak, skupina vsebuje več kot eno črto ali točke niso oštevilčene po vrsti: nastavite skupino nazaj na {{ui:Točke}} in narišite črte ročno (naslednji oddelek).

## Narišite prelomnico skozi točke

1. Pritisnite {{key:B}} ali kliknite {{ui:Prelomnica}} v skupini **Površje**.
   Namig pravi: „Prelomnica: kliknite geodetske točke po vrsti (prevzame njihove višine). Enter konča.“
2. Premaknite kazalec blizu točke. Majhen oranžen kvadrat označi točko, ki jo bo prevzel.
3. Kliknite točke črte drugo za drugo. Vsak klik imenuje točko in njeno višino v vrstici stanja.
4. Pritisnite {{key:Enter}}, da končate.
   Vrstica stanja pove „Prelomnica 1 dodana; površje je bilo obnovljeno.“

Kliki morajo zadeti geodetsko točko z višino; klik drugje je zavrnjen z opozorilom „Kliknite geodetsko točko z višino: prelomnica prevzame višine točk.“ {{key:Backspace}} odstrani zadnjo točko; {{key:Esc}} prekliče celotno črto.

:::warning
Končajte s tipko {{key:Enter}}. Dvojni klik sicer tudi konča, vendar v tej različici odstrani točko, na katero ste dvakrat kliknili. Enkrat kliknite zadnjo točko, nato pritisnite {{key:Enter}}.
:::

Če želite hkrati odstraniti vse narisane prelomnice, kliknite {{ui:Odstrani narisane prelomnice}} v oddelku **Površje**. Če želite odstraniti samo zadnjo, uporabite {{key:Mod+Z}}. Narisanih prelomnic še ni mogoče izbrati ali urejati posamezno.

## Narišite zunanjo mejo

Meja obreže površje na območje, ki mu zaupate, na primer na meje geodetskega posnetka, tako da dolgi trikotniki čez neizmerjene vogale izginejo.

1. Pritisnite {{key:O}} ali kliknite {{ui:Meja}}.
2. Kliknite vogale po vrsti okoli območja. Črtkana črta prikaže obliko.
3. Pritisnite {{key:Enter}}.
   Vrstica stanja pove „Meja je nastavljena; trikotnikov zunaj nje ni več.“ **Meja** v podatkih o površju pove „Da“ in število vogalov.

Na kaj paziti:

- Meja je samo ena. Če narišete novo, nadomesti staro. {{ui:Odstrani mejo}} jo odstrani.
- Lahko samo odvzema: meja, ki sega čez točke, se obreže na njihov obris, z opombo „Meja sega čez točke; obrezana je bila na njihov obris.“
- Njeni vogali prevzamejo svoje višine iz površja, zato rob natančno sledi terenu.
- Skrite (notranje) meje še niso na voljo.

## Obrežite dolge zunanje trikotnike

Brez meje površje zapolni ves obris točk, vključno z dolgimi tankimi trikotniki čez konkavne robove.

1. V **Površje** vpišite dolžino v **Najdaljši zunanji rob** in pritisnite {{key:Enter}}. Začnite z vrednostjo, ki je okoli dvakrat do trikrat večja od običajnega razmika meritev.
2. Zunanji trikotniki, katerih zunanji rob je daljši od te vrednosti, se odstranijo, pri čemer se postopoma pomikate navznoter, dokler ni vsak zunanji rob dovolj kratek. Rob, ki je prelomnica, se nikoli ne odstrani.
3. Vpišite 0, da spet obdržite vse trikotnike.

## Preberite poročilo o površju

Pod podatki o površju okno navaja, kaj je naredil graditelj površja. Z oker vrstico na levi je to informacija; z rdečo vrstico vsebuje napako in površja ni.

| Sporočilo | Pomen |
|---|---|
| „3 točke so bile na istem mestu kot druga točka in so se ji pridružile.“ | Točke, bližje kot 0.0001 na načrtu, so postale eno oglišče (prva se ohrani). |
| „2 mesti imata različni višini …“ | Točke ena nad drugo ali sekajoče se prelomnice se razlikujejo po višini. Prevlada višina prelomnice, nato prva. |
| „1 odsek prelomnice ni mogel biti vsiljen v površje.“ | Zelo kratek ali skoraj prekrivajoč se odsek prelomnice se ni prilegal; preverite to mesto. |
| „Površje potrebuje vsaj tri točke z višinami.“ | Premalo točk: preverite vrstni red stolpcev in skupine. |
| „Vse točke ležijo na eni črti: ni trikotnikov.“ | Točke nimajo širine, na primer en sam poligonski vlak. |
| „Meja se ne prekriva s točkami.“ | Meja je nekje drugje, pogosto zaradi zmede enot ali koordinat. |
| „Znotraj meje ni ostal noben trikotnik.“ | Meja je premajhna ali napačno postavljena. |

## Površje, prebrano iz LandXML

Ko odprete LandXML, se njegova prva površina TIN uporabi tak, kot je: naslov **Površje** pove „Površje (iz LandXML)“, **Najdaljši zunanji rob** pa je sivo obarvan. Dokler je ta površina v uporabi, skupine prelomnic, narisane prelomnice in nova meja ne spremenijo nje. Če želite površje zgraditi iz točk datoteke, kliknite {{ui:Obnovi površje iz točk}}. {{key:Mod+Z}} vrne površje LandXML.

## Povezano

- [Preberite plastnice, višine in naklone](topic:contours).
- [Uvozite geodetske točke](topic:import-points).
