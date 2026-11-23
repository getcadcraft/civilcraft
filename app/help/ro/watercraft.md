---
title: WaterCraft: consumuri, debit de incendiu, întreruperi și vârsta apei
summary: Cu suplimentul WaterCraft, transformați clienții în consumuri pe conductele de apă, verificați debitul disponibil la fiecare hidrant, aflați care întrerupere de conductă face cel mai mult rău și urmăriți vârsta apei și clorul pe parcursul unei zile.
keywords: watercraft, distribuția apei, consumuri, clienți, factor de vârf, model de consum, debit de incendiu, hidrant, presiune reziduală, criticitate, întrerupere, tronson cu vane, vârsta apei, clor, rezidual, urmărirea sursei, fund de sac, csv, supliment
from: 066fb17a
---

WaterCraft este un supliment care lucrează pe rețeaua de apă deja desenată cu uneltele Conducte de apă. Adaugă în panoul din dreapta o filă cu patru secțiuni.

:::warning
Doar un instrument de calcul. A fost verificat față de rezultate calculate manual pe rețele inventate, nu pe un model real al unui operator de apă. Un inginer de apă trebuie să verifice fiecare rezultat. Scenariile, regulile de comandă, vanele și citirile din teren au subiecte proprii, „Scenarii” și „Studii”, în ajutorul suplimentului WaterCraft.
:::

## Ce se realizează

- Introduceți clienții în rețea ca consumuri.
- Găsiți hidranții care nu ating debitul necesar.
- Găsiți conductele a căror pierdere contează cel mai mult.
- Găsiți apă veche și clor scăzut.

## Pași

1. Deschideți {{ui:Setări}} › {{ui:Suplimente}} și activați {{ui:WaterCraft (distribuție de apă)}}. În panoul din dreapta apare o filă {{ui:WaterCraft}}.
2. Desenați mai întâi un rezervor, noduri și conducte cu uneltele Conducte de apă (vedeți [Conducte de apă](topic:water-mains)). Fără o rețea, fila arată că trebuie făcut acest lucru.
3. Sub {{ui:Consumuri}}, lipiți câte un client pe rând: id, x, y, tip, cantitate. Alegeți {{ui:Factor de vârf}} și {{ui:Profil orar}} (zi rezidențială, zi comercială, plat sau păstrați profilul cum este). Apăsați {{ui:Verificare}} pentru a vedea unde ajunge fiecare client (cel mai apropiat nod), apoi {{ui:Introducere în rețea}}. Anularea scoate consumurile înapoi.
4. Sub {{ui:Debit de incendiu}}, setați debitul necesar și presiunea reziduală, alegeți dacă presiunea reziduală se menține {{ui:Doar la hidrant}} sau {{ui:Peste tot în sistem (mai strict)}}, și apăsați {{ui:Desfășurare}}. Fiecare hidrant este listat de la cel mai slab, ca „suficient” sau „insuficient”.
5. Sub {{ui:Care conductă contează cel mai mult}}, alegeți {{ui:câte o conductă}} sau {{ui:câte un tronson cu vane}} și apăsați {{ui:Desfășurare}}. Fiecare întrerupere arată consumul deconectat, nodurile deconectate, nodurile nou sub presiunea minimă și cea mai mică presiune rămasă.
6. Sub {{ui:Vârsta apei și clorul}}, alegeți ce se urmărește (vârsta apei, clorul sau o urmărire a sursei), setați orele de rulare și limitele dorite și apăsați {{ui:Desfășurare}}. Nodurile în afara limitelor sunt listate.
7. Apăsați {{ui:Salvare ca CSV}} sub orice tabel pentru a-l păstra.

## Note

- Debitul de incendiu necesar și consumul pe locuință sau pe acru sunt valori de pornire, nu standarde. Folosiți cifrele proprii ale operatorului.
- O conductă tăiată parțial de o vană este închisă integral, așa că întreruperea arătată este puțin mai gravă decât una reală.
- Rulați secțiunea de calitate a apei destul de mult pentru ca modelul zilnic să se repete înainte de a citi ultima zi.
- {{ui:Oprire}} încheie devreme o rulare lungă; lista arată apoi doar ce s-a făcut.
- Rețeaua rămâne în acest proiect și pe acest calculator. Nimic nu este trimis nicăieri.
