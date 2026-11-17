---
title: Calculul debitelor menajere de proiectare și verificarea canalizării
summary: Introduceți persoanele și suprafața care intră la fiecare cămin al unei rețele de canalizare menajeră; CivilCraft le adună în aval prin rețea, calculează debitul de vârf cu un factor de vârf și infiltrații și verifică capacitatea și viteza fiecărei conducte.
keywords: menajer, canalizare menajeră, canalizare, ape uzate, debit de proiectare, debit de vârf, factor de vârf, harmon, babbitt, infiltrații, populație, pe locuitor, grad de umplere, autocurățare, viteză, dimensionarea conductelor, fișă de calcul
from: 73ba197a
---

Debitele menajere de proiectare lucrează pe [rețeaua de conducte](topic:pipe-network) când {{ui:Type}} ei este {{ui:Sanitary}}. Fără nimic selectat, panoul din dreapta arată atunci **Debitele menajere de proiectare**, unde o rețea pluvială arată drenajul pluvial.

## Introducerea debitelor care intră

1. Selectați un cămin. Sub **Debitele menajere de proiectare**, introduceți {{ui:People entering here}} și {{ui:Area entering here}} (hectare într-un proiect metric, acri într-unul în picioare).
2. Pentru magazine, birouri sau industrie, introduceți echivalent persoane: suprafața înmulțită cu numărul de persoane pe hectar (sau pe acru) pe care îl folosește agenția dvs. Suprafața contează pentru infiltrații în ambele cazuri.
3. Repetați pentru fiecare cămin unde se leagă o stradă sau un lot. Un cămin unde nu se leagă nimic rămâne cu ambele valori la 0.

Fiecare conductă transportă tot ce intră la căminul său din amonte și de deasupra lui. Selectați un cămin ca să vedeți ce trece prin el.

## Setările

| Setare | Ce înseamnă |
|---|---|
| {{ui:Flow per person}} | debitul mediu al unei persoane pe zi: litri (proiect metric) sau galoane americane (proiect în picioare) |
| {{ui:Infiltration}} | apa subterană care se infiltrează: litri pe secundă pe hectar sau galoane pe zi pe acru |
| {{ui:Peaking factor}} | Harmon, 1 + 14 / (4 + √P), sau Babbitt, 5 / P^0.2, cu P populația în mii |
| {{ui:Peaking factor at least}} / {{ui:Peaking factor at most}} | factorul este menținut între aceste două valori |
| {{ui:Manning n}} | pentru capacitate și viteză |
| {{ui:Least velocity}} / {{ui:Most velocity}} | la adâncimea proprie a debitului de vârf din conductă |
| {{ui:Most of full capacity}} | cât de plină poate fi o conductă la vârf, ca procent din ce transportă când curge plină |

Valorile de pornire sunt substituenți, nu un standard. Folosiți valorile pe care le publică agenția dvs.

## Ce calculează

Pentru fiecare conductă, în ordinea curgerii:

- debit de vârf = persoane × debit pe persoană × factor de vârf + suprafață × infiltrație
- capacitatea la curgere plină (ecuația lui Manning, la panta conductei) și cât de plină o face vârful
- adâncimea normală a debitului de vârf și viteza acolo

Tabelul **Rezultatele menajere** listează persoanele fiecărei conducte, factorul de vârf, debitul de vârf (L/s, sau gpm și picioare cubice pe secundă), gradul de umplere și viteza. Problemele sunt listate sub el: o conductă mai plină decât limita, mai lentă decât viteza minimă (poate nu se autocurăță), mai rapidă decât cea mai mare sau fără pantă. {{ui:Size the pipes for these flows}} alege pentru fiecare conductă cea mai mică dimensiune standard (200 mm sau 8 inch și peste) care transportă vârful ei în limită; un {{key:Mod+Z}} o anulează.

:::note
Acesta este debitul de vârf staționar pe care îl calculează o fișă de proiectare, verificat față de o fișă publicată, până la rotunjirea tipărită. Nu este un model al canalizării în timp: fără hidrograme, stocare, pompe sau deversări. Vezi [Încă nerealizat](topic:not-built-yet).
:::

Vitezele folosesc ecuația lui Manning cu același n la fiecare adâncime. Unele agenții au diagrame de umplere parțială care lasă n să varieze cu adâncimea, ceea ce dă o viteză ușor mai mică într-o conductă care curge 60 până la 70 la sută plină (cu aproximativ 3 la sută mai puțin).
