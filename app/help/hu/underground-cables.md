---
title: Földalatti kábelek
summary: Kábelvonalak árkokban a tartók és a berendezések között, takarás és keresztezések, csévehossz szerinti csatlakozások, valamint az árok- és kábelmennyiségek.
keywords: földalatti kábel, kábelvonal, árok, védőcső, takarás, keresztezés, csőkeresztezés, csatlakozás, cséve, szekrény, transzformátor, forrás, feszültségesés
from: adfd2717
---

## Kábelvonal rajzolása

1. Ha a kábel szekrényben, transzformátorban vagy csatlakozásban végződik, előbb helyezze el a berendezést: {{ui:Berendezés}}, majd kattintson.
2. Kattintson a {{ui:Kábel}} gombra, majd kattintson a vonalra; a kezdő- és a végpontot tartón vagy berendezésen helyezze el, hogy csatlakozzon hozzá. A befejezéshez nyomja meg az Entert.

A Tulajdonságokban válassza ki a **Kábelt**, az **Árok típusát**, hogy hány **kábel van egymás mellett**, és a **tartalékot** (%). A vonal megmutatja a hosszát, azt, hogy hol kezdődik és hol végződik, valamint a rajta folyó áramot.

## Mit ellenőriz a rendszer

- **Takarás**: a kábel tetejének a talaj alatt kell lennie a vonal mentén, az árok típusának takarási értéke (vagy a szabálykészlet legkisebb takarása) szerint.
- **Keresztezések**: ahol a vonal CivilCraft-csövet vagy másik kábelt keresztez, a köztük lévő távolságot összeveti egy távolságszabállyal: a vonal saját **Keresztezési távolság** értéke (a Tulajdonságaiban), ha választ egyet; különben a szabálykészlet **Földalatti keresztezések** szabálya (a mintakészletek a *Földalatti keresztezés* szabályt használják, 0,3 m), vagy az árok típusának a többi közmű közötti távolsága. Két kábel keresztezésénél a nagyobb érték marad. A keresztezett szabadvezeték csak tájékoztatásul jelenik meg, a kábel pedig megjelenik annak a vonalnak a hosszszelvényében.
- **Csatlakozások**: csévehosszonként egy, a tartalékkal együtt, ha a kábeltétel ad csévehosszt.

## Berendezések

A berendezésnek van könyvtári eleme, **terhelése** (kW) a **teljesítménytényezőjével**, és lehet **forrás**: a hálózat innen kap táplálást. A forrás feszültsége a könyvtári elemből származik, vagy abból a vonalból vagy kábelből, amelyet táplál.

## Mennyiségek

{{ui:Továbbiak}} › {{ui:Mennyiségek…}} megszámolja a kábelt (vonal hossza × (1 + tartalék) × egymás melletti kábelek száma + a felszállás mindkét végén), az árkot típus szerint, a kiemelést, az ágyazatot és a visszatöltést térfogatban, a védőcsöveket és a csatlakozásokat, valamint a szabadvezetékek vezetőit, tartóit és berendezéseit.
