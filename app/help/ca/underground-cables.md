---
title: Cables soterrats
summary: Traçats de cable en rases entre suports i equips, recobriment i encreuaments, empalmes per longitud de tambor, i les quantitats de rasa i de cable.
keywords: cable soterrat, traçat de cable, rasa, conducte, recobriment, encreuament, encreuament de canonada, empalme, tambor, armari, transformador, font, caiguda de tensió
from: adfd2717
---

## Dibuixar un traçat de cable

1. Col·loqueu primer l'equip si el cable acaba en un armari, un transformador o un empalme: {{ui:Equip}}, i després feu clic.
2. Feu clic a {{ui:Cable}} i després al traçat; comenceu i acabeu en un suport o en un equip per connectar-s'hi. {{key:Enter}} n'acaba el dibuix.

A les Propietats, trieu el **Cable**, el **Tipus de rasa**, quants **cables un al costat de l'altre** i la **folga** (%). El traçat mostra la seva longitud, on comença i acaba, i el corrent que transporta.

## Què es comprova

- **Recobriment**: la part superior del cable ha d'estar per sota del terreny al llarg del traçat, comparada amb el recobriment del tipus de rasa (o amb el recobriment mínim del conjunt de regles).
- **Encreuaments**: on el traçat creua una canonada de CivilCraft o un altre cable, la separació entre tots dos es compara amb una regla de distància: la **Distància d'encreuament** propi del traçat (a les seves Propietats) quan n'escolliu una; si no, la regla **Encreuaments soterrats** del conjunt de regles (els conjunts d'exemple fan servir *Encreuament soterrat*, 0.3 m); si no, la separació del tipus de rasa respecte d'altres serveis. Dos cables que s'encreuen mantenen el més gran dels dos. Una línia aèria encreuada es llista a títol informatiu, i el cable apareix al perfil d'aquella línia.
- **Empalmes**: un per cada longitud de tambor del cable (amb folga), quan l'element de cable en dona una longitud de tambor.

## Equip

L'equip té un element de biblioteca, una **càrrega** (kW) amb el seu **factor de potència**, i pot ser **una font**: la xarxa s'alimenta des d'allà. La tensió d'una font ve de l'element de biblioteca o, si no, de la línia o del cable que alimenta.

## Quantitats

{{ui:Més}} › {{ui:Quantitats…}} compta el cable (longitud del traçat × (1 + folga) × cables un al costat de l'altre + el desnivell a cada extrem), la rasa per tipus, els volums d'excavació, de llit i de rebliment, els conductes i els empalmes, amb el conductor, els suports i l'equip de les línies aèries.
