---
title: Verificați volumele față de limitele de zonare pe care le introduceți
summary: Introduceți retragerile unui lot rând cu rând, o limită de înălțime, un plan de expunere la cer, un coeficient de utilizare a terenului și o acoperire, vedeți anvelopa construibilă pe plan și citiți ce volume încalcă ce limită.
keywords: zonare, retragere, retrageri, față, lateral, spate, anvelopă, suprafață construibilă, limită de înălțime, plan de expunere la cer, coeficient de utilizare a terenului, cut, acoperire, lot, parcelă, reglementare, verificare de cod
from: 3e267b31
---

**CivilCraft nu are niciun cod de urbanism în el.** Nu cunoaște regulile niciunui oraș și nu livrează o bibliotecă de astfel de reguli. Fiecare cifră de pe această pagină este una pe care o introduceți, luată din propria reglementare, iar fiecare rezultat spune că este măsurat față de limitele introduse. Este o modalitate de a vedea cum limitele unui lot modelează o clădire, nu o decizie privind dacă un proiect este permis.

## Introduceți limitele

În **Proprietăți**, sub **Volume de clădiri**, alegeți o **Parcelă** (sau selectați un volum: limitele parcelei sale apar sub el). Apoi completați ce se aplică; lăsați o casetă goală pentru „fără limită”:

- **Linia străzii**: limita lotului pe stradă. **Retragerea din față** se aplică acesteia, **retragerea din spate** liniei cea mai opusă ei, iar **retragerea laterală** restului.
- **Limita de înălțime**.
- **Planul de cer**: pornește de la o înălțime la limita lotului și crește cu cantitatea pe care o introduceți pentru fiecare unitate de deplasare spre interior, măsurată de la linia străzii sau de la fiecare limită de lot (2 înseamnă 2 la 1). Înălțimea permisă deasupra unui punct este cea mai mică dintre plan și limita de înălțime.
- **Coeficientul de utilizare a terenului** (suprafața brută a planșeelor volumelor de pe lot împărțită la suprafața lotului) și **Acoperirea** (amprentele lor împărțite la suprafața lotului, introdusă în procente).

## Anvelopa

Bifați **Afișați anvelopa pe plan** ca s-o desenați pe stratul `A-MASS-ENVL`. Anvelopa este lotul retras din fiecare limită a lotului cu propria retragere a acelei linii, liniile decalate întâlnindu-se în colțuri teșite. O limită de lot formată dintr-o curbă este luată ca segmente scurte aflate la 0.01 de curbă. Loturile convexe și cele concave funcționează. Dacă retragerile se suprapun (o retragere adâncă pe un lot îngust sau foarte concav), nu există anvelopă, iar Proprietățile spun asta; încercați distanțe mai mici.

## Rezultatul

Sub casete, fiecare volum și fiecare limită primesc un rând, cu o bifă sau o cruce:

- **retrageri**: suprafața volumului care se află în afara anvelopei;
- **înălțime**: înălțimea volumului față de cea mai mare permisă pe amprenta sa (un prism de o singură înălțime este limitat de cea mai mică înălțime permisă în oricare dintre colțurile sale);
- **coeficientul de utilizare a terenului** și **acoperirea**: toate volumele de pe parcelă adunate.
