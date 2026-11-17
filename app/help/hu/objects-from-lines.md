---
title: Vonalakból készült objektumok, megtartott kapcsolattal
summary: Burkolat, ültetett terület, ágyás, sövény, ösvény, fal, szegély, lépcsők, rámpa, platform, árok vagy jellemzővonal készítése egy vonalból; a vonal mozgásakor követi, amíg meg nem szakítja a kapcsolatot.
keywords: vonalból, vonalrajz, DWG, DXF, kapcsolat, kapcsolt, követés, újragenerálás, kapcsolat megszüntetése, jellemzővonal, jellemzővonal vonalrajzból, importált réteg, körvonal, supercad studio, rajzvonal
from: eb67a0c6
---

{{ui:From a line}} (Tájrendezés › {{ui:More}}): kattintson egy jellemzővonalra, vagy egy importált DWG/DXF-réteg vonalára vagy körvonalára. Egy zárt vonal burkolatot, gyepet, ültetett ágyást, rétet, talajtakaró növényzetet, ágyást vagy platformot készíthet; egy nyitott vonal ösvényt, falat, szegélyt, lépcsőket (az első és az utolsó pontjával), rámpát, sövényt vagy árkot. Mindkét fajta készíthet **jellemzővonalat**, kivéve magát a jellemzővonalat.

## Jellemzővonal egy vonalból

Egy vonalból készült jellemzővonal átveszi a vonal pontjait, zártan, ha a vonal zárt volt. Magasságai a meglévő terepre kerülnek (ahol még nincs, ott 0), a használata pedig **Ki**: nem alakít ki terepet, amíg nem választ használatot, és nem állítja be a magasságait a Tulajdonságokban. Ha a vonal mozog, a azonos számú ponttal rendelkező jellemzővonal megtartja minden beállított magasságát; ha a vonal pontokat nyer vagy veszít, a magasságok újra a terepre kerülnek. Lásd: [Jellemzővonalak](topic:feature-lines).

Az új objektum megtartja a **kapcsolatot** a vonalával. Ha a vonal mozog (húzza a pontjait, vagy a rajzot áthelyezik vagy újraolvassák), az objektum ugyanabban a visszavonási lépésben veszi fel az új alakot, a terepmódosítókon keresztül pedig a tervezett terep is követi. A Tulajdonságok megmondja, mihez kapcsolódik; a {{ui:Break link}} szabaddá teszi.

A vonalakat először ellenőrzik: egy vonalnak legalább 2 pontja kell legyen (körvonalnak 3), legfeljebb 5000, valós számok, a körvonalnak zártnak kell lennie, és nem keresztezheti magát. A hibás vonal nem kerül felhasználásra: az objektum úgy marad, ahogy volt, a Problémák panel pedig megmondja, miért. Ha a vonalat törlik, az objektum megmarad, és a Problémák panel ezt jelzi.

## SuperCad Studio-ban

Nyissa meg a telket és a 2D-s rajzot ugyanabban a projektben. Válasszon ki egy vonalat vagy polivonalat a 2D-s rajzon, nyomja meg a Ctrl+K billentyűket, és futtassa a {{ui:Tájrendezési objektum a kijelölt rajzvonalból}} parancsot: a CivilCraft megkérdezi, mit készítsen, a fentiek szerint, és az objektum megmarad a rajz adott vonalához kapcsolva. Miután módosította a vonalakat a rajzon, a Ctrl+K {{ui:A tájrendezés frissítése a rajzból}} parancs a kapcsolt objektumokat követi, vonalanként egy visszavonási lépéssel. A projekt kapcsolati fájlja rögzíti, melyik objektum melyik vonalat követi. A SuperCad Studio saját súgójában van egy Tájrendezés témakör.
