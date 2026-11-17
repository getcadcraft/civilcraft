---
title: Sillutis, seinad ja trepid
summary: Sillutis langusega äravoolu või põiklangusega, muster ja selle kihtidest koosnev ülesehitus; maapinda järgivad teed; tugi- ja vabalt seisvad seinad astmelise vundamendiga; äärekivid; rambid ja trepid, mida kontrollitakse nende piirväärtuste vastu; IFC väljund.
keywords: kõvad pinnad, sillutis, sillutuskivid, õueala, terrass, langus, äravool, põiklangus, kalasoomuster, lamevuuk, tee, jalgtee, tugisein, aiamüür, vundament, katteplaat, äärekivi, serv, rambi, ligipääsetavus, trepid, astmed, astmekõrgus, astmepind, vahetasand
from: 51475877
---

Kõvad pinnad arvutatakse maapinnast iga kord uuesti, nii et need järgivad maastikku ja tekivad uuesti, kui maapind või selle joon liigub. Lohista nende nurki plaanil nagu iga joont. Ava see {{ui:Kõvad pinnad}} alt haljastuse grupis.

## Sillutis

Klõpsa nurki ja vajuta {{key:Enter}}. Omadustes:

- **Tase**: tühi = selle all oleva maapinna keskmine;
- **Langused**: tase, **põiklangus** (% mingi suuna poole) või **äravoolu poole**: CivilCraft palub klõpsata kohta, kuhu äravool läheb, ja siis iga nurk tõuseb äravoolust langusega. Nooled plaanil näitavad langusi.
- **Muster** (ruudustik, lamevuuk, kalasoomuster) koos ühiku suuruse, vuugi ja nurgaga; **Äärise** laius. Lehel jäetakse välja vuugid, mis on lähemal kui millimeeter.
- Sillutis on osa projekteeritud pinnast. Selle kihid (kivid, vuugitäide, alus) lähevad IFC-sse ja kogustesse.

## Teed

Klõpsa mööda teed ja vajuta {{key:Enter}}. See järgib maapinda, oma **põiklangusega** paremal pool. Tee, mis on järsem kui **Lubatud suurim kalle**, on plaanil kohas märgitud `!` ja Omadustes on öeldud, kui järsk see on.

## Seinad

Klõpsa mööda seina ja vajuta {{key:Enter}}. Sein on **tugisein** või **vabalt seisev**. Ilma **Ülemise** kõrguseta seisab see oma **kõrguse** võrra maapinnast kogu pikkuses; ülemise kõrguse sisestamisel hoitakse see tasasena. Selle **vundament** asub kindla sügavuse võrra maapinnast allpool ja astub alla täissammudena, nii et nende vahel on see tasane. Omadustes on seina pikkus, kõrgused, külgpinna pindala ja vundamendi astmed; plaan märgistab seina ülemise ja alumise serva (TW / BW) mõlemas otsas.

:::warning
Tugisein, mis on kõrgem kui 1.2 m (4 ft), on märgitud: selle projekteerib insener.
:::

## Äärekivid

Klõpsa mööda äärekivi ja vajuta {{key:Enter}}; määra selle laius ja tõus.

## Rambid

Klõpsa altpoolt üles ja vajuta {{key:Enter}}. Kõrgused tulevad maapinnast kummagi otsa juurest, kui sa neid ei sisesta. Rambile lisatakse vahetasand iga 750 mm (2.5 ft) tõusu järel ja seda kontrollitakse **Lubatud suurima kalde** (algselt 1:12) ja miinimumlaiuse vastu; Omadustes on öeldud, kui pikk see peaks olema.

## Trepid

Klõpsa alumise astme esiserva, siis kohta, kus trepp jõuab ülemisse, ja vajuta {{key:Enter}}. Astmekõrguste arv tuleneb kõrgusest ja **Suurimast astmekõrgusest**; astmepinna sügavus tuleneb mugavusreeglist 2R + G ≈ 630 mm, aga mitte kunagi alla **Väikseima astmepinna sügavuse**; vahetasand tuleb iga **Maksimaalselt astmeid ühes lennus** järel. Omadustes on öeldud, kas nad mahuvad kahe punkti vahele või kui palju pikemaks neid tuleb.

:::note
Rampide ja trepi piirangud on märgitud vaikeväärtused. Määra need, mida sinu ehitusnorm nõuab.
:::

## CivilCraftist välja

- Veel › {{ui:Ekspordi haljastuse IFC}}: sillutis ja teed kui `IfcPavement`, seinad kui `IfcWall` (tugiseinad kui RETAININGWALL) koos kihtidega, äärekivid kui `IfcKerb`, rambid kui `IfcRamp`, trepid kui `IfcStair` koos astmekõrguste ja astmepindadega.
- Taimeloendi **Saada TakeoffCraftile** kannab sillutiste pindalad ja kihtide mahud, seinte külgpindade pindalad ja pikkused, äärekivide pikkused ning astmete arvud.
- Detailide leht joonistab iga seina lõike, iga sillutise ülesehituse ja iga trepilennu. Vaata [Haljastuslehed](topic:landscape-sheets).
