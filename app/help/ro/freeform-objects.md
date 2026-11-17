---
title: Obiecte libere
summary: Aduceți pe șantier o formă realizată într-o altă aplicație (STL, OBJ sau un element de bibliotecă); stă pe teren sau este tăiată în teren, iar volumul, aria și amprenta sa sunt numărate ca restul.
keywords: obiect liber, obiect personalizat, sculptură, jardinieră, bancă, movilă de joacă, plasă, stl, obj, element de bibliotecă, conștient de teren, urmărește terenul, tăiat în teren, cantități, volum, ifc
from: ec835f33
---

O operație unică (o jardinieră, un zid-bancă, o sculptură, o movilă de joacă) poate fi realizată în ModelCraft sau PartCraft și plasată aici, ca să stea în același model și în aceleași liste ca tot restul.

1. Peisaj › {{ui:Mai multe}} › {{ui:Obiect liber…}} și alegeți un fișier **STL** sau **OBJ** (în unitățile proiectului: feet într-un proiect în feet, metri într-un proiect în metri) sau un **element de bibliotecă** CadCraft (`.json`) cu un corp de tip plasă.
2. Faceți clic unde urmează să fie plasat.

## Baza sa

- **Urmărește terenul**: punctul său cel mai jos stă pe cel mai jos teren sub amprenta sa, astfel încât nimic nu plutește. **Proprietățile** estimează cât din el este sub teren.
- **Taie terenul**: baza sa este stabilită la o cotă, iar terenul din interiorul amprentei sale este amenajat până la ea cu taluzuri de intersecție cu terenul, numărate în **Terasamente** ca o platformă.

Rotiți-l cu **Rotire**, trageți-l în plan ca să-l mutați.

## Numărat

**Proprietăți** îi dau **volumul** (pentru un solid închis), **aria suprafeței**, **amprenta** și **înălțimea**, măsurate din plasă. Exportul IFC îl scrie cu **clasa IFC** pe care o alegeți și cu aceste cantități.

:::note
Amprenta este înfășurătoarea convexă a conturului: o formă concavă (o jardinieră în formă de L) este amenajată ca și cum ar fi plină.
:::
