---
title: Unități, pichete și formate de numere
summary: Proiecte în picioare și în metri, cum se scriu și se tastează pichetele, pantele, taluzurile, orientările, suprafețele, volumele și diametrele conductelor, și ce schimbă modificarea unităților.
keywords: introducere lungime, aritmetică, calculator, sumă, fracție, picioare și inci, 4+7/16, unități, picioare, US survey feet, metri, metric, imperial, format pichet, pichetare, pantă, procent, taluz, h:v, orientare, yarzi cubi, diametru
from: 0b9b5b6b
---

## Unitățile proiectului

Un proiect este în **US feet** sau în **metri** (**Unități** din panoul din stânga). Fiecare coordonată, cotă, lungime și pichet din proiect este în acea unitate.

:::warning
Schimbarea **Unităților** schimbă etichetele, formatul pichetelor, valorile implicite și felul în care sunt scrise fișierele. Ea **nu** convertește niciun număr. Un sit măsurat în picioare și trecut în metri păstrează aceleași numere, acum citite ca metri. Bara de stare spune „Unitățile sunt acum metri. Coordonatele nu au fost convertite.” Setați unitățile în acord cu datele înainte să proiectați.
:::

Ce depinde de unități:

| | US feet | Metri |
|---|---|---|
| Format pichet | `12+34.56` (pichete de 100 ft) | `1+234.567` (pichete de 1000 m) |
| Intervale de curbe de nivel oferite | 0.25 până la 20 ft | 0.1 până la 10 m |
| Suprafață | sq ft | sq m |
| Volum | cu yd | cu m |
| Diametrul conductei și al structurii | inci | milimetri |
| Raza implicită a curbei | 100 ft | 30 m |
| Gradațiile pichetării pe plan | la fiecare 50 ft, etichete la fiecare 100 ft | la fiecare 20 m, etichete la fiecare 100 m |
| Scări de trasare | 1" = 5' până la 1" = 1000' | 1:50 până la 1:10000 |
| Unitate liniară LandXML | USSurveyFoot | meter |

Un proiect nou începe în picioare, sau în metri când unitatea de lungime marcată cu steluță în {{ui:Setări}} › {{ui:General}} › {{ui:Unități}} este una metrică. Lista **Unități** arată unitățile activate acolo și întotdeauna pe cele ale proiectului. Cu o unitate de suprafață sau de volum marcată acolo (acri, hectare, acre-feet …), suprafețele și volumele sunt raportate în ea, în locul coloanei de mai sus. Vezi [Unități, valori tastate și listele de unități](common:unit-lists).

Când deschideți LandXML, proiectul preia unitățile fișierului. Un fișier în picioare internaționale se deschide ca proiect în picioare; numerele nu sunt schimbate.

## Introducerea lungimilor și a sumelor

Orice casetă care primește o lungime sau o cotă citește mai mult decât un număr simplu: apăsați {{key:Enter}} și caseta arată rezultatul în unitățile proiectului.

| Tastați | Într-un proiect în picioare | Într-un proiect în metri |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | aceleași lungimi în metri |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | în picioare | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, iar celelalte în US survey feet | aceleași lungimi în metri |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | suma, în picioare | suma, în metri |

Orice marcă de lungime din tabelul comun de unități funcționează, cu dimensiunea sa exactă: picioarele unui proiect sunt US survey feet, deci `10 US ft` este 10, iar `3 ch` (lanțul de picior internațional) este 197.9996. Folosiți `+ - * /` și paranteze, precum și `abs`, `round`, `ceil` și `floor`. O liniuță scrisă într-o lungime face parte din ea (`24'-6"`, `6-1/2`); cu spații în jurul ei, scade (`24' - 6"` = 23.5 ft). Un număr simplu înmulțește sau împarte o lungime și este o lungime în unitățile proiectului când este adunat cu una. Dacă CivilCraft nu poate citi ce ați tastat, caseta este marcată, iar bara de stare spune unde.

Pichetele nu sunt sume: `10+00` într-o casetă de pichet este pichetul 10+00. Pantele în procente, numerele punctelor și descrierile sunt citite așa cum sunt.

## Pichete

Un pichet este o distanță de-a lungul unui aliniament, scrisă cu semnul plus:

- Picioare: partea de dinaintea plusului este sute de picioare. `12+34.56` înseamnă 1,234.56 ft.
- Metri: partea de dinaintea plusului este mii de metri. `1+234.567` înseamnă 1,234.567 m.
- Pichetele negative păstrează semnul în față: `-0+50.00`.

Oriunde tastați un pichet (**Pichet de început**, **Pichet** al unui PVI), îl puteți tasta cu plus (`12+34.56`) sau ca număr simplu (`1234.56`). Spațiile sunt ignorate.

## Pante și taluzuri

- **Pantele** (profiluri, conducte, pante ale benzilor și ale acostamentelor) sunt în procente: `+1.25%` urcă în sensul pichetării, `-0.50%` coboară.
- **Taluzurile** (tăiere și umplutură la platformă, tăiere și umplutură la coridor) sunt orizontal la vertical: `3` înseamnă 3 : 1, adică trei pe orizontală pentru unul pe verticală, în sus sau în jos.
- **K** pentru o curbă verticală este lungimea ei împărțită la modificarea pantei în procente.

## Orientări și unghiuri

Orientările sunt orientări pe cadran, în grade, minute și secunde: `N 63°12'05" E`. Deviațiile curbelor (Δ) folosesc aceleași grade, minute și secunde, cu „stânga” sau „dreapta”.

## Decalaje

Decalajele față de un aliniament sunt distanțe perpendiculare pe el, marcate **L** (stânga) sau **R** (dreapta), privind în sensul pichetării.

## Afișarea numerelor

- Coordonatele și cotele se afișează cu 2 zecimale în panouri și în bara de stare (3 pentru un punct topografic selectat).
- Suprafețele și volumele sunt grupate pe mii: `128,250 sq ft`, `454.9 cu yd`.
- Coordonatele nu sunt grupate niciodată, ca să poată fi copiate așa cum sunt.

## Coordonate

CivilCraft lucrează într-un plan plat: estul spre dreapta, nordul în sus. Lucrările de proiectare se fac întotdeauna în coordonate proiectate (plan de stat, UTM sau o rețea locală). Puteți spune CivilCraft ce sistem de coordonate folosiți și dacă sunt coordonate de rețea, de teren sau locale; atunci afișează latitudinea și longitudinea și plasează fișierele GIS și straturile de hartă, dar nu schimbă niciodată unitățile și nu vă mută coordonatele de la sine. Vezi [Stabilirea sistemului de coordonate al proiectului](topic:coordinate-systems) și [Coordonate de teren și locale](topic:ground-and-local-coordinates). Valorile mari ale planului de stat (milioane de picioare) sunt în regulă; CivilCraft lucrează intern față de sit ca să păstreze precizia.
