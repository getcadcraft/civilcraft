---
title: Függőleges hossz-szelvény tervezése
summary: Nyissa meg a hossz-szelvény nézetet, kezdjen tervezési hossz-szelvényt a terepről, adjon hozzá és húzzon PVI-ket, állítson be ívhosszakat, és olvassa le a lejtéseket, K-értékeket és a magas- és mélypontokat.
keywords: hossz-szelvény, nyomvonal, pvi, függőleges ív, lejtés, k-érték, domb, homorulat, bvc, evc, hossz-szelvény nézet, végleges terep, fg, meglévő terep hossz-szelvénye, jellemzővonalak a hossz-szelvényben, keresztezések, vetített, szegély, árok, címkék
from: e9182bfa
---

Minden nyomvonalnak egy tervezési hossz-szelvénye van: PVI-k listája (szelvényszám és magasság), amelyeket egyenes lejtők kötnek össze, és minden belső, ívhosszal rendelkező PVI-nél szimmetrikus parabolikus függőleges ív van. A meglévő terep hossz-szelvénye automatikusan a felületből kerül mintavételezésre.

## A hossz-szelvény nézet megnyitása

1. Jelölje ki a nyomvonalat (kattintson rá a {{ui:Kijelölés}} eszközzel).
2. Nyomja meg a {{key:R}} billentyűt, vagy kattintson az eszköztáron a {{ui:Hossz-szelvény}} gombra, vagy a jobb oldali panel alján a {{ui:Hossz-szelvény nézet}} gombra.
   A hossz-szelvény nézet a tervrajz alatt nyílik meg, a nyomvonal mentén a meglévő terepet mutatva. Két vagy több nyomvonal esetén a hossz-szelvény eszköztár bal oldali listájában lehet egyet kiválasztani.

A nézet mindig a teljes nyomvonalat mutatja, és a magasságokat a panel kitöltésére nyújtja; a függőleges nagyítás a bal alsó sarokban látszik, például „Függőleges nagyítás 10×”. Nem nagyít és nem tol el.

Mozgassa a mutatót a hossz-szelvény mentén: az eszköztár megmutatja a szelvényszámot, a terep- és a tervezett magasságot, a lejtést és az ott lévő bevágást vagy feltöltést, a tervrajzon pedig egy pont követi a nyomvonalon.

## Tervezési hossz-szelvény kezdése

1. A jobb oldali panelen a **Tervezési hossz-szelvény** alatt kattintson a {{ui:Kezdés a terepről}} gombra.
   Két PVI kerül a terepre a nyomvonal két végén, egy egyenes lejtővel összekötve. Az állapotsor ezt írja: „A tervezési hossz-szelvény a terepről indult mindkét végén. Kapcsolja be a PVI-k hozzáadása funkciót, és kattintson a lejtéstörések hozzáadásához; a táblázatban adjon meg hozzájuk ívhosszt.”

Ha a nyomvonal nem metszi a felületet, ez jelenik meg: „Ennek a nyomvonalnak nincs alatta terep, ahonnan indulni lehetne.” Ekkor a következő szakasz szerint, kattintással adjon hozzá PVI-ket.

## PVI-k hozzáadása

1. Nyomja meg az {{key:I}} billentyűt, vagy kattintson a hossz-szelvény eszköztárban a {{ui:PVI-k hozzáadása}} gombra. A gomb benyomva marad.
2. Kattintson a hossz-szelvénybe oda, ahol lejtéstörést szeretne. Egy PVI kerül a megadott szelvényszámhoz és magassághoz, 0,01-re kerekítve, és kijelölődik.
3. Adjon hozzá annyit, amennyire szükség van, majd a hozzáadás befejezéséhez nyomja meg újra az {{key:I}} billentyűt.

Olyan helyre kattintva, ahol már van PVI, a program elutasítja („Már van PVI itt: …”). A PVI-k mindig szelvényszám szerinti sorrendben maradnak.

## PVI-k igazítása

- **Húzással** mozgassa a PVI-t a hossz-szelvényen. Nem haladhat át a szomszédjain. A mozgatás egy visszavonási lépés.
- **Begépeléssel** adja meg a pontos értékeket a jobb oldali panel PVI-táblázatában: **Szelvényszám**, **Magasság** és **Ív L** (függőleges ívhossz). Minden érték után nyomja meg az {{key:Enter}} billentyűt.
- **Eltávolítás**: a sor végén lévő x-szel, vagy kijelöléssel (kattintás rá) és az {{key:Delete}} billentyűvel. Ha a hossz-szelvény nézet kapta a fókuszt, a {{key:Backspace}} is eltávolítja.

Az első és az utolsó PVI soha nem kap ívet.

## Függőleges ívek

1. Írjon be egy hosszt az **Ív L** mezőbe egy belső PVI-hez, például 200.
2. Az ív a PVI-re központosítva rajzolódik. A hossz-szelvény és a jobb oldali panel megmutatja a fajtáját (domb vagy homorulat), az L-t és a K-t, a BVC és EVC szelvényszámait és magasságait, valamint a magas- vagy mélypontját, ha az ív belsejében van.

A K-t az L-ből számítja (K = L osztva a lejtések algebrai különbségével, százalékban). Az L-t kell beírni; a K közvetlen beírása még nem érhető el.

Ha a függőleges ív nem fér el, piros doboz mondja meg az okát: visszanyúlik az előtte lévő PVI-be vagy ívbe, vagy túlnyúlik a következő PVI-n, és megmondja, mennyi hely van ezen az oldalon (az ívnek a PVI-je mindkét oldalán a hosszának felére van szüksége). Gombja a **legnagyobb elférő ívet** állítja be a K-értékével együtt, egy lépésként ({{key:Mod+Z}} visszavonja). Vagy távolítsa el egymástól a PVI-ket.

## A tények leolvasása

A PVI-táblázat alatti listában minden lejtés szerepel százalékban („Lejtés 1: +1.25%”), és minden ív, például „Domb 2+00.00-nál: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)”, majd „Magaspont 1+62.40, 254.12”.

Ha a PVI-k nem érik el a nyomvonal mindkét végét, egy megjegyzés ezt jelzi. Sáv (korridor) csak ott épül, ahol a hossz-szelvény és a nyomvonal átfedésben van.

## Jellemzővonalak a hossz-szelvényben

A jellemzővonalak a hossz-szelvény nézetben is megjelennek, így egy szegély, egy árok vagy egy falkorona az út hossz-szelvényéhez képest is látszik.

- Ahol egy jellemzővonal **keresztezi** a nyomvonalat, a hossz-szelvényen kis rombusz jelenik meg a megfelelő szelvényszámnál és magasságnál, a vonal nevével és ottani magasságával feliratozva (a vonal saját magassága, a keresztező szakasz mentén számítva).
- Írjon egy távolságot a {{ui:Mellette ezen belül}} mezőbe, hogy a nyomvonal **mellett futó** jellemzővonalak is megjelenjenek, a saját magasságukon, szaggatott vonalként. Üres vagy 0 esetén csak a keresztezések látszanak.
- A jelölések és feliratok minden változást követnek: mozgassa a csúcspontot, írjon be lejtést vagy emelje a vonalat, és a hossz-szelvény azonnal az új magasságokat mutatja.
- A keresztezés rombuszára kattintva kijelöli a jellemzővonalat; a kijelölt vonal kiemelő színnel rajzolódik.
- A hossz-szelvény eszköztár {{ui:Jellemzővonalak}} gombja mindet elrejti vagy megjeleníti. Mindkét beállítás a projektben mentődik.

Lásd: [Jellemzővonalak](topic:feature-lines).

## Tovább

- Készítsen [útkorridort](topic:corridor) a nyomvonal és ez a hossz-szelvény mentén.
- A hossz-szelvény a nyomvonallal együtt LandXML-be íródik; lásd: [LandXML-csere](topic:landxml).
