---
title: WaterCraft: consumuri, debit de incendiu, întreruperi și vârsta apei
summary: Cu suplimentul WaterCraft, transformați clienții în consumuri pe conductele de apă, verificați debitul disponibil la fiecare hidrant, aflați care întrerupere de conductă are cel mai mare impact și urmăriți vârsta apei și clorul pe parcursul unei zile.
keywords: watercraft, distribuție de apă, consumuri, clienți, factor de vârf, model de consum, debit de incendiu, hidrant, presiune reziduală, criticitate, întrerupere, secțiune cu vană, vârsta apei, clor, rezidual, urmărirea sursei, fund de sac, csv, supliment
from: 76809f01
---

WaterCraft este un supliment care lucrează pe rețeaua de apă pe care ați desenat-o deja cu instrumentele Conducte de apă. Adaugă o filă în panoul din dreapta, cu patru secțiuni.

:::warning
Doar un instrument de calcul. A fost verificat față de răspunsuri calculate manual pe rețele fictive, nu pe un model real al unei companii de utilități. Un inginer de apă trebuie să verifice fiecare rezultat. Nu există stații de repompare, degradare de ordinul doi sau scenarii încă.
:::

## Ce veți face

- Puneți clienții în rețea ca fiind consumuri.
- Găsiți hidranții care nu ating debitul necesar.
- Găsiți conductele a căror pierdere contează cel mai mult.
- Găsiți apă veche și clor scăzut.

## Pași

1. Deschideți {{ui:Setări}} › {{ui:Suplimente}} și activați {{ui:WaterCraft (distribuție de apă)}}. Apare o filă {{ui:WaterCraft}} în panoul din dreapta.
2. Desenați mai întâi un rezervor, noduri și conducte cu instrumentele Conducte de apă (vezi [Conducte de apă](topic:water-mains)). Fără o rețea, fila vă spune să faceți asta.
3. Sub {{ui:Consumuri}}, lipiți câte un client pe linie: id, x, y, tip, cantitate. Alegeți {{ui:Factor de vârf}} și {{ui:Model orar}} (zi rezidențială, zi comercială, constant sau păstrarea modelului actual). Apăsați {{ui:Verificare}} ca să vedeți unde ajunge fiecare client (cel mai apropiat nod), apoi {{ui:Introducere în rețea}}. {{ui:Anulare}} scoate consumurile la loc.
4. Sub {{ui:Debit de incendiu}}, setați debitul necesar și presiunea reziduală, alegeți dacă presiunea reziduală este menținută {{ui:Doar la hidrant}} sau {{ui:Peste tot în sistem (mai strict)}}, și apăsați {{ui:Desfășurare}}. Fiecare hidrant este listat, cel mai slab primul, ca „Îndeplinește” sau „Sub necesar”.
5. Sub {{ui:Care conductă contează cel mai mult}}, alegeți {{ui:o conductă pe rând}} sau {{ui:o secțiune cu vană pe rând}} și apăsați {{ui:Desfășurare}}. Fiecare întrerupere arată consumul scos din funcțiune, nodurile rămase fără alimentare, nodurile care ajung nou sub presiunea minimă și cea mai mică presiune rămasă.
6. Sub {{ui:Vârsta apei și clorul}}, alegeți ce urmăriți (vârsta apei, clorul sau urmărirea sursei), setați orele de rulare și limitele dorite și apăsați {{ui:Desfășurare}}. Nodurile din afara limitelor sunt listate.
7. Apăsați {{ui:Salvare ca CSV}} sub orice tabel ca să îl păstrați.

## Note

- Debitul de incendiu necesar și consumul per casă sau per acru sunt valori de pornire, nu standarde. Folosiți cifrele proprii ale companiei de utilități.
- O conductă tăiată parțial de o vană este considerată închisă complet, deci întreruperea afișată este puțin mai gravă decât una reală.
- Rulați secțiunea de calitate a apei destul cât modelul zilnic să se repete înainte de a citi ultima zi.
- {{ui:Oprire}} încheie devreme o rulare lungă; lista arată atunci doar ce s-a făcut.
- Rețeaua rămâne în acest proiect și pe acest computer. Nimic nu se trimite nicăieri.
