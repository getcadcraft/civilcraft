---
title: Kreslení s přichycením, výběr rohů a přesun, kopírování, otočení
summary: Umisťujte osy tras, plošiny, parcely a konstrukční čáry přesně na body a rohy, které už máte, zadejte nebo vyberte východ a sever rohu, otočte tečnu směrem ke dvěma bodům a přesuňte, kopírujte nebo otočte objekt o vzdálenost nebo úhel.
keywords: přichycení, snap, snaps, osnap, přichycení k bodu, přichycení k rohu, pi, vrchol, roh, výběr, zaměřovací kříž, X, Y, souřadnice, zadané souřadnice, tečna, směr, azimut, přesunout, kopírovat, otočit, transformace, kopírovat otočené, duplikovat, alt, volný bod, kreslení
from: 49864dda
---

Nové ve verzi 0.9: při kreslení kurzor dopadne na body a rohy, které už v plánu jsou, a roh plošiny, parcely nebo konstrukční čáry lze zadat nebo vybrat. Toto téma provede třemi nástroji.

## Co uděláte

- Kreslete s přichycením, aby nová osa trasy, plošina, parcela nebo čára začínala a končila přesně na něčem, co existuje.
- Nastavte východ a sever rohu buď jeho zadáním, nebo výběrem místa v plánu.
- Otočte osu trasy tak, aby směřovala ke dvěma vybraným bodům.
- Přesuňte, kopírujte nebo otočte celý objekt.

## Postup

1. Zvolte kreslicí nástroj, například {{ui:Alignment}}, {{ui:Pad}}, {{ui:Parcel}} nebo {{ui:Feature line}}. Přesuňte kurzor blízko průzkumného bodu, PI osy trasy, plošiny, parcely nebo rohu hmoty, vrcholu konstrukční čáry nebo šachty dešťové kanalizace. Objeví se značka s popiskem (PI, Roh, Vrchol, Objekt nebo Bod a jeho číslo) a východ a sever, kam dopadne. Kliknutím umístěte bod tam.
2. Chcete-li umístit bod volně, držte při kliknutí {{key:Alt}}. Přichycení se vypne.
3. Vyberte plošinu, parcelu nebo konstrukční čáru. Ve Vlastnostech blok {{ui:Corners}} uvádí každý roh s polem Východ a polem Sever. Napište nová čísla, nebo stiskněte tlačítko se zaměřovacím křížem vedle rohu a klikněte na místo v plánu. Roh převezme tento východ a sever. Stiskněte {{key:Esc}} pro zrušení výběru. Zaměřovací kříž funguje jen v plánu: nejprve zavřete 3D pohled.
4. Chcete-li otočit tečnu, vyberte osu trasy. Ve Vlastnostech, pod {{ui:Tangent from two points}}, zvolte tečnu, stiskněte {{ui:First point}} a klikněte v plánu, stiskněte {{ui:Second point}} a klikněte znovu, pak stiskněte {{ui:Set direction}}. Tečna se otočí tak, aby vedla od prvního bodu k druhému, a zachová svou délku.
5. Chcete-li přesunout, kopírovat nebo otočit, vyberte osu trasy, plošinu, parcelu nebo konstrukční čáru. Ve Vlastnostech, pod {{ui:Move, copy and rotate}}, napište {{ui:Posun na východ (záporné = západ)}} a {{ui:Posun na sever (záporné = jih)}} (záporná čísla jdou na západ a na jih) a stiskněte {{ui:Move}} nebo {{ui:Copy}}. Nebo stiskněte {{ui:Distance from two points}} a klikněte na bod, ze kterého se přesouvá, a na bod, kam se přesouvá.
6. Chcete-li otočit, napište úhel do pole {{ui:Rotate counter-clockwise}} (ve stupních), pak stiskněte {{ui:Rotate}} nebo {{ui:Copy rotated}}. Otočí se kolem středu svých rohů, pokud nevyberete bod, kolem něhož se má otáčet, zaměřovacím křížem vedle úhlu.

## Poznámky

- Kopie nechá originál tam, kde je, a poté je vybrána.
- Každé přesunutí, kopírování, otočení, vybraný roh a otočená tečna je jeden krok zpět.
- Přichycení dosáhne 10 obrazových bodů od kurzoru. Značka přichycení jen nabízí místo; nic se nezmění, dokud neklikněte.
- Stejný zaměřovací kříž je u řádků PI osy trasy. Viz [Osy tras](topic:alignment), [Parcely](topic:parcels) a [Konstrukční čáry](topic:feature-lines).
