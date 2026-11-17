---
title: Fișiere de studiu pentru alt program de linii (.DON)
summary: Salvați o linie aeriană ca fișier de studiu .DON sau citiți suporturile unuia într-o linie nouă. Netestat cu programul care le citește.
keywords: don, .don, fișier de studiu, xml, export, import, program de linii aeriene, întindere, canton
from: 1abc4d07
---

Unele programe de linii aeriene păstrează un studiu într-un fișier `.DON` (text XML). CivilCraft poate scrie o linie ca un astfel de fișier și poate citi suporturile unuia.

:::warning
**Netestat.** Am construit aceasta dintr-o listă de nume de câmpuri ale formatului, trimisă de un utilizator, nu dintr-un fișier real, iar noi nu am deschis fișierele noastre în programul care le citește. Deschideți fișierul acolo și verificați fiecare valoare înainte de a vă baza pe el. Dacă puteți trimite un fișier `.DON` (fără datele clientului), ne ajută să corectăm acest lucru.
:::

## Salvarea unui fișier de studiu

1. Dați liniei un conductor și asigurați-vă că are rezultate (fără „nu s-a calculat” în Proprietăți).
2. {{ui:Mai multe}} › {{ui:Salvare fișier de studiu (.DON)…}}, alegeți linia, adăugați o descriere și un număr de lucrare.
3. {{ui:Salvare fișier de studiu}}.

Fișierul conține suporturile liniei (coordonate, sol, înălțimi, roluri, traversă, suportul păstrat sau sugerat, sarcinile pe ipoteză de încărcare, fundația), câte o secțiune pentru fiecare porțiune între capete fixe (conductor, tensiune, deschiderea de referință, deschideri, tensiunea și parametrul catenarei, cea mai mare tensiune pe ipoteză de încărcare) și tabelele de întindere. Lungimile sunt în metri, iar forțele în daN; textul este scris în Latin-1, deci un caracter din afara lui devine `?`.

## Citirea unui fișier de studiu

{{ui:Mai multe}} › {{ui:Deschidere fișier de studiu (.DON)…}} citește suporturile într-o linie nouă. Conductorul, suporturile și traversele sunt potrivite cu biblioteca proprie după nume; orice nu este găsit rămâne de ales în Proprietăți.
