---
title: Săgeata și întinderea
summary: Ipotezele de încărcare (temperatură, vânt, chiciură) și limitele de întindere, cum calculează CivilCraft întinderea fiecărei secțiuni și tabelele de întindere.
keywords: săgeată, întindere, caz de încărcare, temperatură, vânt, chiciură, chiciură asimetrică, deschidere de referință, deschidere echivalentă, schimbare de stare, catenară, tabel de întindere, rezistență la rupere, efort de exploatare
from: f8876c35
---

## Ipoteze de încărcare și limite

{{ui:More}} › {{ui:Load cases and limits…}} editează regulile pe care le urmează fiecare linie din proiect.

- **Ipoteze de încărcare**: o temperatură, o presiune a vântului pe conductor (Pa) și chiciură radială (mm, cu densitatea sa). Primul caz este cel de referință.
- **Limite de întindere**: o parte din rezistența la rupere a conductorului, fie pe întinderea orizontală, fie pe cea mai mare întindere la un reazem, într-un caz de încărcare. Sau introduceți singur întinderea orizontală.
- **Distanțe de siguranță**: distanța pe care conductorul o păstrează față de teren, un drum, o clădire și așa mai departe. Adăugați, redenumiți și eliminați: sunt ale dvs. Sub ele, alegeți regulile pentru **Plante de peisaj sub o linie**, **Ziduri de peisaj sub o linie** și **Traversări subterane**.
- **Cazurile folosite de verificări**: care caz dă cea mai mare săgeată (cald), balansarea izolatorului (vânt), chiciura și chiciura pe o singură parte a unui reazem.
- **Factori**: factorul k al distanței între faze, cea mai mare balansare a izolatorului, un factor pentru sarcinile de pe reazeme și accesorii, unghiurile de deviere care fac reazemele de unghi și de capăt, acoperirea minimă a cablurilor îngropate și cea mai mare cădere de tensiune.

## Pachete: reguli și bibliotecă pentru o țară

Nicio reglementare a unei țări nu este încorporată în CivilCraft. Un **pachet** ține împreună un set de reguli și o bibliotecă într-un singur fișier (`.cclinepack.json`), pentru o țară, un operator de rețea sau o companie:

- **Salvare ca pachet…** în {{ui:Load cases and limits…}} scrie setul de reguli afișat și biblioteca dvs. (sau, dacă biblioteca nu are încă nimic, elementele pe care le folosește acest proiect). Scrieți mai întâi **Țara sau regiunea**.
- **Deschidere set de reguli sau pachet…** citește un pachet, un fișier de reguli sau un fișier de bibliotecă. Regulile unui pachet sunt afișate în casetă (apăsați **Aplicare** ca să le folosiți), iar elementele sale intră în biblioteca dvs.
- Pachetele pe care le împărtășesc alții sunt listate pe pagina de suplimente, sub **Pachete pentru linii electrice**. Două pachete exemplu arată formatul; nu sunt reguli ale vreunei țări.

Fiecare pachet este verificat la deschidere, ca orice fișier. Verificați fiecare valoare față de standardul care se aplică, înainte ca ceva să fie construit.

Două seturi de reguli exemplu sunt acolo ca punct de plecare: **Exemplu: climă rece** și **Exemplu: climă blândă**. Cifrele lor nu provin din niciun standard: introduceți valorile pe care le dă standardul dvs. {{ui:Save rules}} și {{ui:Open rules…}} împart un set de reguli ca fișier.

## Cum se calculează întinderea

Pentru fiecare secțiune între capetele moarte:

1. **Deschiderea de referință** este √(ΣL³ ÷ ΣL) din deschiderile sale.
2. Fiecare limită se transformă într-o întindere orizontală în cazul de referință prin **ecuația schimbării de stare** aplicată pe deschiderea de referință: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. Cea mai restrictivă stabilește întinderea.
3. Întinderea fiecărui caz de încărcare urmează din aceea, iar forma fiecărei deschideri este **catenara** exactă prin cele două puncte de atașare (inclusiv deschiderile pe pantă): săgeata din coardă, lungimea și întinderea la fiecare capăt.

Sarcina pe metru într-un caz: greutatea plus chiciura (aria chiciurii × densitate × g), pe verticală; presiunea vântului × diametrul cu chiciură, pe orizontală.

## Tabele de întindere

{{ui:More}} › {{ui:Stringing tables…}} listează, pentru fiecare secțiune, întinderea orizontală și săgeata fiecărei deschideri la fiecare temperatură din setul de reguli (de la −5 °C la 40 °C din 5 în 5 °C, la început), în aer calm. Salvați-le, împreună cu tabelul reazemelor, ca CSV.

Nu sunt incluse: fluajul conductorului de-a lungul anilor și alungirea unui conductor nou. Adăugați-le prin temperaturile la care întindeți.
