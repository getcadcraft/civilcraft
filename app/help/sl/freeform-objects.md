---
title: Prostoročni objekti
summary: Prenesite obliko, narejeno v drugi aplikaciji (STL, OBJ ali element knjižnice), na lokacijo; stoji na terenu ali je vrezana vanj, njeni prostornina, površina in tloris pa se štejejo kot ostalo.
keywords: prostoročni, objekt po meri, skulptura, korito, klop, mreža, stl, obj, element knjižnice, upoštevanje terena, sledi terenu, vrezan v teren, količine, prostornina, ifc
from: ec835f33
---

Enkratno elemento (korito za rastline, klop z zidom, skulpturo, igralni nasip) lahko izdelate v ModelCraft ali PartCraft in ga tukaj postavite, da je v istem modelu in razporedih kot vse ostalo.

1. Krajinska ureditev › {{ui:Več}} › {{ui:Prostoročni objekt …}} in izberite datoteko **STL** ali **OBJ** (v enotah projekta: čevlji pri projektu v čevljih, metri pri projektu v metrih) ali **element knjižnice** CadCraft (`.json`) z mrežnim telesom.
2. Kliknite, kam naj gre.

## Njegova podlaga

- **Sledi terenu**: njegova najnižja točka je na najnižjem terenu pod njegovim tlorisom, zato nič ne lebdi. Lastnosti ocenijo, koliko ga je pod terenom.
- **Vreže se v teren**: njegova podlaga je postavljena na koto, teren znotraj njegovega tlorisa pa je izravnan do nje z brežinami izkopa in nasipa, šteto med zemeljska dela kot plato.

Zasukajte ga z možnostjo **Zasukano**, povlecite ga po tlorisu, da ga premaknete.

## Šteto

Lastnosti podajo njegovo **prostornino** (za zaprto telo), **površino ploskev**, **tloris** in **višino**, izmerjene iz mreže. Izvoz IFC ga zapiše z **razredom IFC**, ki ga izberete, in s temi količinami.

:::note
Tloris je konveksna ovojnica obrisa: vdrta oblika (korito v obliki črke L) je izravnana, kot da bi bila zapolnjena.
:::
