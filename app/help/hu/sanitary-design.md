---
title: Szennyvíz-tervezési vízhozamok kiszámítása és a csatorna ellenőrzése
summary: Adja meg a szennyvízhálózat minden aknájába érkező embereket és területet; a CivilCraft lefelé összeadja őket a hálózaton, kiszámítja a csúcsvízhozamot csúcstényezővel és beszivárgással, és ellenőrzi minden cső kapacitását és sebességét.
keywords: szennyvíz, csatorna, szennyvízcsatorna, szennyvízelvezetés, tervezési vízhozam, csúcsvízhozam, csúcstényező, harmon, babbitt, beszivárgás, népesség, fajlagos, telítettség, öntisztuló, sebesség, csőméretezés, tervlap
from: 73ba197a
---

A szennyvíz-tervezési vízhozamok a [csőhálózaton](topic:pipe-network) működnek, ha annak {{ui:Típus}} értéke {{ui:Szennyvíz}}. Semmi kijelölése nélkül a jobb oldali panel ekkor a **Szennyvíz-tervezési vízhozamok** részt mutatja, ahol csapadékvíz-hálózatnál a csapadékvíz-elvezetés látszik.

## Az érkező vízhozam megadása

1. Jelöljön ki egy aknát. A **Szennyvíz-tervezési vízhozamok** alatt írja be az {{ui:Itt belépő emberek}} és az {{ui:Itt belépő terület}} értéket (hektár a métermértékű projektben, acre a lábmértékű projektben).
2. Üzletek, irodák vagy ipar esetén adja meg az **egyenértékű fő** számot: a terület szorozva a hatóság által használt fő/hektár (vagy fő/acre) értékkel. A terület mindkét esetben beszámít a beszivárgásba.
3. Ismételje meg minden aknára, ahová utca vagy telek csatlakozik. Ahová semmi nem csatlakozik, ott mindkét érték 0 marad.

Minden cső szállítja mindazt, ami a felső aknájába érkezik, és az afölötti aknákból. Jelöljön ki egy aknát, hogy lássa, mi halad át rajta.

## Beállítások

| Beállítás | Jelentése |
|---|---|
| {{ui:Flow per person}} | egy ember átlagos napi vízhozama: liter (méteres projekt) vagy US gallon (lábmértékű projekt) |
| {{ui:Infiltration}} | a beszivárgó talajvíz: liter másodpercenként hektáronként, vagy gallon naponta acre-onként |
| {{ui:Peaking factor}} | Harmon, 1 + 14 / (4 + √P), vagy Babbitt, 5 / P^0.2, ahol P a népesség ezrekben |
| {{ui:Peaking factor at least}} / {{ui:Peaking factor at most}} | a tényező e két érték között marad |
| {{ui:Manning n}} | a kapacitáshoz és a sebességhez |
| {{ui:Least velocity}} / {{ui:Most velocity}} | a csúcsvízhozam saját mélységénél a csőben |
| {{ui:Most of full capacity}} | mennyire telhet meg egy cső csúcsidőben, százalékban annak, amit teljesen megtelve szállít |

A kezdő értékek helyőrző értékek, nem szabvány. Használja azokat az értékeket, amelyeket a hatósága közzétett.

## Mit számít ki

Minden csőre, az áramlás sorrendjében:

- csúcsvízhozam = fő × fajlagos vízhozam × csúcstényező + terület × beszivárgás
- teljesen megtelve szállított kapacitás (Manning-egyenlet a cső lejtésénél), és hogy a csúcs mennyire telíti meg
- a csúcsvízhozam normálmélysége és a sebesség ott

A **Szennyvíz-eredmények** táblázat minden cső emberszámát, csúcstényezőjét, csúcsvízhozamát (l/s, vagy gpm és cu ft/s), telítettségét százalékban és sebességét tartalmazza. A táblázat alatt vannak a problémák: egy cső, amely a határnál telítettebb, a legkisebb sebességnél lassabb (lehet, hogy nem tisztul öntisztulóan), a legnagyobbnál gyorsabb, vagy nincs esése. A {{ui:Csövek méretezése ezekhez a hozamokhoz}} minden csőhöz kiválasztja a legkisebb szabványos méretet (200 mm vagy 8 inch fölött), amely csúcsvízhozamát a határon belül szállítja; egy {{key:Mod+Z}} visszavonja.

:::note
Ez a stabil csúcsvízhozam, amelyet egy tervlap kiszámít, és egy közzétett tervlappal vetnek össze annak nyomtatott kerekítéséig. Nem az idővel változó csatornamodell: nincsenek hidrográfok, tárolás, szivattyúk vagy túlfolyások. Lásd: [Még nincs elkészítve](topic:not-built-yet).
:::

A sebességek Manning-egyenletet használnak, minden mélységnél azonos n-nel. Egyes hatóságok részben telt diagramjai az n-t a mélységgel változtatják, ami a 60–70%-ban telt csőben kissé kisebb sebességet ad (kb. 3%-kal kevesebbet).
