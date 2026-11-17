---
title: Ültetési tervek és kimutatások
summary: Egyes növények, a távolság szerint kitöltött ültetési ágyak százalékos keverékkel, és sövények elhelyezése; feliratozás; számolás növénykimutatásban táblázatkezelőhöz vagy TakeoffCraft-hoz.
keywords: ültetési terv, növénykimutatás, ültetési ágy, tömegültetés, sövény, fa, cserje, talajtakaró, távolság, háromszögű távolság, növényszám, mennyiségek, feliratok, lombkorona, növényjelképek, ifc, takeoff
from: ab49eab5
---

## Növények elhelyezése

1. Válasszon egy növényt a bal oldali **Növények** részben.
2. Kattintson a {{ui:Növény}} gombra, majd kattintson az alaprajzra: minden kattintás egy növényt helyez el. A leállításhoz nyomja meg az {{key:Esc}} billentyűt.

A növény jelképe az érett terjedelmével rajzolódik ki; a Továbbiak › {{ui:Megjelenítés ültetési méretben}} minden növényt abban a méretben rajzol, amelyben ültetik. A fák a rájuk eső talajon állnak: ha később alakítja a terepet, követik azt. Ha ehelyett egy növényt adott magasságban szeretne rögzíteni, írja be a **Magasság** mezőbe a **Tulajdonságok** részben.

## Ültetési ágyak

1. Válassza a fő növényt, kattintson a {{ui:Ágy}} gombra, és kattintson az ágy sarkaira. Az zárás: nyomja meg az {{key:Enter}} billentyűt (vagy kattintson újra az első sarokra).
2. Az ágy a növénnyel töltődik ki a saját távolságában, **háromszög** mintázatban (a szokásos: minden növény hat másiktól egyforma távolságra van), a szélétől fél távolságnyira befelé.
3. A Tulajdonságokban az **Növény hozzáadása** a bal oldalon kiválasztott növényt keveri be. Állítsa be minden növény **Arány %** értékét: az ágy pontosan ennyi százalékot foglal el mindegyikből, szétosztva az egészen. A **Keverés újra** újraosztja, hogy hol legyenek.

Ha a **Távolság** üres, a növények saját távolsága érvényes (arányuk szerint súlyozva); írjon be egyet, hogy mindegyik növényre ezt használja. A **Minta** lehet négyzet is, a **Sorok iránya** pedig elforgatja a sorokat.

## Sövények

Válassza a sövénynövényt, kattintson a {{ui:Sövény}} gombra, kattintson a sövény mentén, majd nyomja meg az {{key:Enter}} billentyűt. A növények a vonal mentén, a távolságukban kerülnek elhelyezésre, középre igazítva, így mindkét végén azonos a szélső távolság. A sövény lehet két, egymáshoz képest váltakozó sor is, egymástól beállított távolságra.

## Feliratok

Az egyes növényeket a feliratbeállítás jelöli (alapértelmezés szerint `{name}`); egy növény saját feliratát a Tulajdonságokban írhatja be. Az ágyakat a bennük lévő növények darabszámával, a sövényeket a saját darabszámukkal jelöli. A Továbbiak › {{ui:Növényfeliratok}} be- és kikapcsolja a feliratokat. Feliratmezők: `{name}`, `{botanical}`, `{size}` (a konténer), `{qty}`, `{height}`, `{spread}`, `{container}`.

## A növénykimutatás

Továbbiak › {{ui:Növénykimutatás…}} minden növényt fajonként számol, az egyedi növényekből, ágyakból és sövényekből együtt, az ültetési méretükkel. Mentse **CSV**-ként vagy **XLSX**-ként, vagy válassza a **TakeoffCraft-be küldés** lehetőséget: ez egy mennyiségi fájl, amelyet a TakeoffCraft megnyit, hogy árazza a növényeket (mellettük a kemény burkolat és az öntözés mennyiségeivel).

## IFC

Továbbiak › {{ui:Tájépítészeti IFC exportálása}} a tájépítészetet IFC-fájlként (IFC 4.3) menti, amelyet egy BIM-modell tartalmazhat: minden növény egy `IfcGeographicElement` (VEGETATION típus), a fajának megfelelő típussal és a növény tulajdonságaival (latin név, méretek, télállóság, víz- és fényigény); minden ágy és sövény egy elem a darabszámaival, a telephelyen. A BimCraft az épülettel együtt nyitja meg.
