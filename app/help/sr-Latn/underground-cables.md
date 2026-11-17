---
title: Podzemni kablovi
summary: Trase kablova u rovovima između oslonaca i opreme, zaštitna visina i ukrštanja, spojnice po dužini bubnja, te količine rova i kablova.
keywords: podzemni kabl, trasa kabla, rov, kanal, zaštitna visina, ukrštanje, ukrštanje sa cevi, spojnica, bubanj, ormarić, transformator, izvor, pad napona
from: adfd2717
---

## Nacrtajte trasu kabla

1. Prvo postavite opremu ako se kabl završava na ormariću, transformatoru ili spojnici: {{ui:Oprema}}, zatim kliknite.
2. Kliknite {{ui:Kabl}} i kliknite trasu; početak i kraj na osloncu ili na opremi povezuju se sa njom. {{key:Enter}} završava crtanje.

U svojstvima izaberite **Kabl**, **Vrstu rova**, koliko **kablova jedan pored drugog** i **rezervu** (%). Trasa prikazuje svoju dužinu, mesta početka i kraja i struju koju provodi.

## Šta se proverava

- **Zaštitna visina**: gornja ivica kabla ispod terena duž trase, u odnosu na zaštitnu visinu za vrstu rova (ili najmanju zaštitnu visinu iz skupa pravila).
- **Ukrštanja**: mesta gde trasa seče CivilCraft cev ili drugi kabl, i razmak između njih u odnosu na pravilo razmaka: sopstveni **Razmak kod ukrštanja** trase (u njenim Svojstvima) kada izaberete jedan; inače pravilo skupa **Podzemna ukrštanja** (primeri skupova koriste *Podzemno ukrštanje*, 0.3 m); inače razmak do ostalih instalacija za vrstu rova. Kod ukrštanja dva kabla zadržava se veći od ta dva razmaka. Nadzemni vod koji se preseca navodi se radi informacije, a kabl se prikazuje u profilu tog voda.
- **Spojnice**: po jedna na svaku dužinu bubnja kabla (sa rezervom), kada stavka kabla daje dužinu bubnja.

## Oprema

Oprema ima stavku iz biblioteke, **opterećenje** (kW) sa svojim **faktorom snage**, i može biti **izvor**: mreža se napaja odatle. Napon izvora dolazi iz njegove stavke iz biblioteke, ili inače iz voda ili kabla koji napaja.

## Količine

{{ui:Više}} › {{ui:Količine…}} broji kabl (dužina trase × (1 + rezerva) × kablovi jedan pored drugog + uspon na svakom kraju), rov po vrsti, zapremine iskopa, posteljine i zatrpavanja, kanale i spojnice, sa provodnikom, osloncima i opremom nadzemnih vodova.
