---
title: Llogarit orët e diellit në një vend
summary: Zgjidh një ditë (ose një stinë) dhe një zonë kohore, dhe shiko orët e diellit të drejtpërdrejtë në çdo mur të çdo mase dhe në tokën rreth tyre, me tokën e vizatuar në planimetri dhe numrat si CSV.
keywords: diell, orët e diellit, hije, qasje diellore, orë drite, fasadë, mur, stinë, solstic, ekuinoks, zonë kohore, ora e verës, gjerësi, gjatësi, CSV, raster
from: 4e32a314
---

**Orët e diellit** numëron orët e diellit të drejtpërdrejtë që arrijnë çdo mur të çdo mase ndërtese dhe tokën rreth tyre, në një ditë që zgjedh ti ose mesatarisht gjatë një stine. Masat dhe vetë toka hedhin hije; asgjë tjetër nuk hedh (asnjë pemë, asnjë fqinj që nuk e ke vizatuar). Drita e qiellit që nuk është diell i drejtpërdrejtë nuk numërohet.

## Përpara se të fillosh

Vendi i diellit vjen nga gjerësia dhe gjatësia gjeografike e vendit, të cilat vijnë nga **sistemi i koordinatave** të projektit. Një projekt pa të refuzohet me një mesazh: vendose së pari (**Koordinatat** në grupin GIS). Një gjerësi dhe gjatësi e shkruar me dorë do të ishte një supozim, prandaj nuk ka kuti për to.

## Llogarite

Te **Vetitë**, nën **Masat e ndërtesës**, **Orët e diellit**:

1. Zgjidh **Ditën**. Fillon me ditën kur dielli është më i ulët aty ku je (21 dhjetor, ose 21 qershor në hemisferën jugore). Për një stinë, shëno **Gjatë një stine**, zgjidh **Ditën e fundit** dhe sa ditë larg të merren mostrat.
2. Shkruaj **Zonën kohore**: një emër si `America/Mexico_City`, ose një diferencë nga UTC si `-6`. Një emër ndjek rregullat e orës së verës të asaj zone për ditën; një diferencë që shkruan përdoret ashtu siç e shkruan, prandaj përdor atë që është në fuqi atë ditë. Rreshti nën kuti tregon diferencën që gjeti.
3. Zgjidh sa shpesh të vendoset dielli (çdo 5, 10, 15 ose 30 minuta), pastaj **Llogarit orët e diellit**. Një stinë punon në procese në sfond; **Ndalo** e anulon.

## Çfarë merr

- Një tabelë sipas masës: **muri më i keq**, **mesatarja** dhe **muri më i mirë**, në orë në ditë, dhe një tabelë e çdo muri me mënyrën si është i kthyer dhe orët e tij kat për kat.
- Toka rreth masave, e vizatuar në planimetri nga e errët (pa diell) deri në të verdhë (më shumë se çdo qelizë merr), me një legjendë. Qelizat nën një masë lihen boshe. **Shfaq tokën në planimetri** e fik.
- **Muret si CSV** dhe **Toka si CSV** ruajnë numrat.

Për një stinë shifrat janë mesatarja për ditë mbi ditët e marra mostra. Asgjë nuk ruhet në projekt: rezultati është për t'u parë, dhe rinisja e tij e bën sërish.

## Të mirë për t'u ditur

- Një mur e numëron një çast si me diell vetëm kur është i kthyer nga dielli dhe asgjë nuk e pengon. Një mur i kthyer nga ana tjetër nuk merr asgjë.
- Toka mostrohet në një rrjet që varet nga madhësia e vendit, dhe pozicioni i diellit në mes të çdo hapi kohor, prandaj orët janë të sakta deri afër hapit që zgjodhe.
- Pozicioni i diellit është një formulë astronomike e publikuar, e saktë deri afërsisht një minutë hark.
