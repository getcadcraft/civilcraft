---
title: Desenarea unei linii electrice aeriene
summary: Plasați stâlpi pe plan, lăsați CivilCraft să stabilească rolul fiecărui stâlp și secțiunile dintre capetele de linie, și mutați stâlpii pe plan sau pe profilul liniei.
keywords: linie electrică aeriană, stâlp, deschidere, secțiune, capăt de linie, unghi, suspensie, profil, înălțime, consolă, haubană, tirant
from: b8e5e272
---

## Desenați-o

1. Aveți un model de teren: terenul de sub linie vine din el ([Construiți un model de teren](topic:build-surface)). Un stâlp fără teren sub el apare în lista **Verificări**; introduceți în schimb **Cota terenului** în Proprietăți.
2. Faceți clic pe {{ui:Linie}} din grupul Linii electrice și faceți clic pe fiecare stâlp de pe plan.
3. Faceți dublu clic pe ultimul, sau apăsați {{key:Enter}}.

Linia primește conductorul, stâlpul și echipamentul folosite ultima dată pe acest calculator (prima dată: exemple din bibliotecă). Schimbați-le în Proprietăți.

## Linia în Proprietăți

Selectați linia (faceți clic pe o deschidere) ca să stabiliți **Conductorul**, **Conductoare pe circuit**, **Circuitele**, **Tensiunea**, **Regula de distanță de siguranță** pe care trebuie să o păstreze deasupra terenului și echipamentul **La fiecare stâlp** (o consolă, izolatoare, accesorii). Tabelul listează **secțiunile** sale, cu fiecare deschidere de calcul, tensiunea obișnuită și ipoteza de încărcare care o guvernează.

## Stâlpi

Faceți clic pe un stâlp ca să îl selectați. În Proprietăți:

- **Stâlp**: elementul lui din bibliotecă. Când este prea slab, {{ui:Utilizare …}} pune cel mai mic stâlp din același material din biblioteca dvs. care suportă sarcina.
- **Rol**: Automat, Suspensie, Unghi sau Capăt de linie. Automat înseamnă: primul și ultimul stâlp sunt capete de linie; o schimbare de direcție peste unghiul setat de regulă face un stâlp de unghi; una mai mare, un capăt de linie.
- **Înălțimea deasupra terenului**: gol o ia din elementul din bibliotecă (lungimea minus adâncimea în pământ).
- **Și pe acest stâlp**: echipament suplimentar, precum o **haubană**. Un stâlp cu haubană transmite tracțiunea liniei către haubana sa.
- **Stâlp existent**: este verificat ca ceilalți, dar scos din cantități.

{{ui:Stâlp}} adaugă un stâlp pe deschiderea cea mai apropiată de clic. Trageți un stâlp pe plan ca să îl mutați. Delete îl elimină (o linie păstrează cel puțin doi).

Secțiunile merg între capetele de linie: în interiorul unei secțiuni conductorul trece liber prin clemele de suspensie, astfel încât o singură tensiune ține întreaga secțiune.

## Profilul liniei

Faceți clic pe {{ui:Profil longitudinal}} (sau pe **Profil longitudinal** din Proprietățile liniei). Panoul de sub plan arată terenul de-a lungul liniei, fiecare stâlp de la teren până în vârf, faza cea mai joasă a conductorului la **Ipoteza de încărcare** pe care o alegeți și distanța de siguranță pe care linia trebuie să o păstreze, ca linie punctată. O deschidere care nu trece este roșie; numărul de sub fiecare deschidere este distanța ei minimă.

- **Linia** alege linia electrică aeriană de afișat. Selectarea altei linii, sau a unuia dintre stâlpii ei pe plan, comută profilul la ea.
- Mutați indicatorul peste profil: o linie de ghidaj îl urmărește, iar eticheta arată distanța de-a lungul liniei, terenul, conductorul și distanța de siguranță din acel punct (și spune când distanța este sub regula liniei).
- {{ui:Măsurare}} în bara profilului: faceți clic pe două puncte ca să obțineți distanța pe orizontală, diferența de înălțime, distanța în linie dreaptă și panta dintre ele. Un clic lângă teren, conductor sau vârful unui stâlp se fixează acolo. Faceți din nou clic pe {{ui:Măsurare}} ca să opriți.
- Obstacolele traversate de linie se ridică din teren: cele desenate ca bare, plantele din Peisaj ca o coroană, zidurile ca bare (vedeți [Verificări pentru linii electrice](topic:power-line-checks#clearances)). Traseele de cabluri și conductele traversate de linie sunt marcate sub teren, la vârful lor, cu numele lor.

- Trageți un stâlp lateral ca să îl mutați de-a lungul liniei.
- Trageți vârful lui în sus sau în jos ca să stabiliți înălțimea deasupra terenului.
