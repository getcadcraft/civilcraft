---
title: Kõvakatted, seinad ja trepid
summary: Kõvakatted kaldega äravoolu või põikkalde suunas, muster ja selle kihid; maapinna järgi kulgevad rajad; tugi- ja vabalseisvad seinad astmelise vundamendiga; äärekivid; pandused ja trepid, mida kontrollitakse piirangute suhtes; väljund IFC-sse.
keywords: kõvakatted, sillutis, sillutuskivid, terrass, rõdu, kalded, äravool, põikkalle, kalasmuster, lamellmuster, rada, kõnnitee, tugisein, aiamüür, vundament, kate, äärekivi, servapiire, pandus, juurdepääsetavus, trepid, astmed, astmepüstik, astmepind, puhkeplatvorm
from: d34b4466
---

Kõvakatted arvutatakse maapinnast uuesti iga kord, nii et need järgivad reljeefi ja uuenevad, kui maapind või selle joon liigub. Lohista nurki plaanil nagu iga joont. Ava see nupust {{ui:Kõvad pinnad}} rühmast Haljastus.

## Sillutis

Klõpsa nurki ja vajuta {{key:Enter}}. Atribuutides:

- **Tase**: tühi = maapinna keskmine selle all.
- **Kalded**: tase, **põikkalle** (% mingi suuna poole) või **äravoolu suunas**: CivilCraft palub klõpsata, kuhu äravool läheb, ja siis iga nurk tõuseb äravoolust kalde järgi. Nooled plaanil näitavad kaldeid.
- **Muster** (ruudustik, lamellmuster, kalasmuster) koos ühikmõõdu, vuugi ja nurgaga; **Servapiire** laius. Lehel jäetakse välja vuugid, mis on kitsamad kui üks millimeeter.
- Sillutis on osa projekteeritud pinnast. Selle kihid (kivid, liivapadi, alus) lähevad IFC-sse ja kogustesse.

## Rajad

Klõpsa mööda rada ja vajuta {{key:Enter}}. See järgib maapinda oma **põikkalde** all parempoolsel küljel. Rada, mis on järsem kui **Suurim lubatud kalle**, on plaanil tähistatud `!` kohas, kus see on, ja atribuudid ütlevad, kui järsuks see läheb.

Kui rada kohtub koridori poolt ehitatud teega, peatub see tee välisserval, sama kõrguse juures kui kõnnitee või ääriala seal, projekteeritud pinnal ja 3D-vaates. Rada, mis ristub teega, on näidatud kahe osana ja ots, mis on joonistatud kuni kaks korda raja laiuse kaugusel teest lühemalt, viiakse tee servani. Plaan näitab rada endiselt sellisena, nagu sa selle joonistasid, ning selle pikkus ja pindala arvestavad kogu joont. Vt [Teekoridori trassi mööda ehitamine](topic:corridor).

## Seinad

Klõpsa mööda seina ja vajuta {{key:Enter}}. Sein on **tugisein** või **vabalseisev**. Ilma **Ülaosata** seisab ta kogu ulatuses oma **kõrgusega** maapinnast kõrgemal; sisesta ülaosa, et hoida see tasane. Selle **vundament** asub kindla sügavuse all maapinnast ja astub alla täissammudena, nii et ta jääb tasaseks nende vahel. Atribuudid annavad selle pikkuse, kõrgused, pinna pindala ja vundamendi astmed; plaanil märgitakse seina ülemine ja alumine serv (TW / BW) mõlemas otsas.

:::warning
Tugisein, mis on kõrgem kui 1.2 m (4 ft), on märgitud: insener projekteerib selle.
:::

## Äärekivid

Klõpsa mööda äärekivi ja vajuta {{key:Enter}}; määra laius ja ülestõus.

## Pandused

Klõpsa alt üles ja vajuta {{key:Enter}}. Tasemed tulevad maapinnast iga otsa juures, kui sa neid ei sisesta. Pandusele tehakse puhkeplatvorm iga 750 mm (2.5 ft) tõusu kohta ning seda kontrollitakse **Suurima lubatud kalde** (algselt 1:12) ja miinimumlaiuse suhtes; atribuudid ütlevad, kui pikk see peaks olema.

## Trepid

Klõpsa alumise astme esiserva, seejärel kohta, kus astmed jõuavad üles, ja vajuta {{key:Enter}}. Astmepüstikute arv tuleneb kõrgusest ja **Suurimast astmepüstikust**; astmepinna sügavus tuleneb mugavusreeglist 2R + G ≈ 630 mm, aga mitte kunagi alla **Väikseima astmepinna sügavuse**; puhkeplatvorm tuleb iga **Astmeid trepilennus kõige rohkem** kohta. Atribuudid ütlevad, kas trepp mahub kahe punkti vahele või kui palju pikemaks see peaks minema.

:::note
Pandustele ja trepile kehtivad piirangud on märgitud vaikeväärtused. Määra need, mida su ehitusnormid nõuavad.
:::

## Väljaspool CivilCraft'i

- Veel › {{ui:Ekspordi haljastuse IFC}}: sillutis ja rajad kui `IfcPavement`, seinad kui `IfcWall` (tugiseinad kui RETAININGWALL) koos kihtidega, äärekivid kui `IfcKerb`, pandused kui `IfcRamp`, trepid kui `IfcStair` koos astmepüstikute ja astmepindadega.
- Taimeloendi **Saada programmi TakeoffCraft** kannab kaasa sillutisealad ja kihtide mahud, seinte pinnaalad ja pikkused, äärekivide pikkused ning astmete arvu.
- Detailileht joonistab iga seina lõike, iga sillutise katte ja iga trepilennu. Vt [Haljastuse lehed](topic:landscape-sheets).
