---
title: Taste și mouse
summary: Fiecare scurtătură de tastatură și fiecare acțiune de mouse, trackpad și ecran tactil din CivilCraft, grupate, cu diferențele dintre browsere și platforme.
keywords: tastatură, scurtături, taste rapide, taste, mouse, trackpad, atingere, deplasare, zoom, ciupire, rotiță, clic dreapta, mac, tasta Command
from: a9756f46
---

Tastele dintr-o singură literă funcționează când nu scrieți într-o casetă. Scurtăturile cu {{key:Mod}} folosesc Command pe Mac și Ctrl în rest. Vezi și [Tastele din browser](common:keys).

## Fișiere și editare

| Tastă | Acțiune |
|---|---|
| {{key:Mod+O}} | Deschide un fișier de puncte, LandXML sau un proiect |
| {{key:Mod+S}} | Salvează proiectul (descarcă un fișier `.civilcraft.json`) |
| {{key:Mod+P}} | Trasează planul în PDF (deschide caseta de trasare, nu imprimarea browserului) |
| {{key:Mod+Z}} | Anulare |
| {{key:Mod+Y}} | Refacere |
| {{key:Delete}} | Șterge punctele de topografie, aliniamentul, platforma, structura, conducta sau PVI-ul selectat |
| {{key:Mod+C}} | Copiază punctele de topografie selectate (și ca rânduri de puncte pentru o foaie de calcul) |
| {{key:Mod+X}} | Decupează punctele de topografie selectate |
| {{key:Mod+V}} | Lipește punctele: urmează indicatorul, faceți clic unde trebuie să meargă |
| {{key:Mod+Shift+V}} | Lipire în aceeași poziție: la coordonatele proprii ale punctelor |
| {{key:Mod+D}} | Duplică punctele selectate: o copie urmează indicatorul |
| {{key:Mod+A}} | Selectează fiecare punct de topografie |
| {{key:Esc}} | Anularea selecției (și a lipirii) |

{{key:Mod+S}}, {{key:Mod+O}} și {{key:Mod+P}} funcționează chiar și când scrieți într-o casetă. {{key:Mod+Z}} și {{key:Mod+Y}} într-o casetă de text anulează scrierea dvs., ca de obicei, și la fel {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}} și {{key:Mod+A}}: într-o casetă copiază, decupează, lipesc și selectează textul ei. Cu text selectat pe pagină (într-un panou), {{key:Mod+C}} copiază acel text. {{key:Mod+Shift+Z}} nu face nimic în CivilCraft: folosiți {{key:Mod+Y}} sau butonul {{ui:Refacere}}.

:::mac
Tasta Mac marcată **delete** este {{key:Backspace}} pentru browser. Ca să ștergeți o selecție, apăsați {{key:Delete}} (Fn și delete) sau alegeți {{ui:Ștergere}} din meniul {{ui:Mai multe}} al barei de instrumente.
:::

## Instrumente

| Tastă | Instrument |
|---|---|
| {{key:V}} | {{ui:Selectare}} |
| {{key:M}} | {{ui:Măsurare}}: distanțe, arii și pante pe plan ([Măsurare](topic:measure)) |
| {{key:A}} | {{ui:Axul traseului}} |
| {{key:G}} | {{ui:Platformă}} |
| {{key:P}} | {{ui:Conducte}} |
| {{key:B}} | {{ui:Linie de rupere}} |
| {{key:O}} | {{ui:Limită}} |
| {{key:R}} | Arată sau ascunde vizualizarea profilului |
| {{key:I}} | Activează sau dezactivează {{ui:Adăugare PVI}} (deschide vizualizarea profilului dacă este închisă) |
| {{key:F}} | {{ui:Potrivire}}: arată tot |
| {{key:D}} | {{ui:3D}}: arată situl în 3D sau revine la plan |
| {{key:E}} | Arată sau ascunde pantele și cotele de-a lungul fiecărei linii de caracteristică (doar pe ecran) |

Apăsarea tastei instrumentului activ din nou revine la {{ui:Selectare}}. Literele cu Shift nu fac nimic.

## În timpul desenării

| Tastă | Acțiune |
|---|---|
| {{key:Enter}} | Încheie aliniamentul, platforma, traseul conductei, linia de rupere sau limita |
| {{key:Backspace}} | Elimină ultimul punct făcut clic |
| {{key:C}} | Linie de caracteristică: activează sau dezactivează arcele (după un vârf, faceți clic pe un punct de pe curbă, apoi pe capătul ei) |
| {{key:Esc}} | Anulează desenarea (sau lipirea); apăsat din nou (sau când nu este desenat nimic), revine la {{ui:Selectare}} și golește selecția |

## Vizualizarea planului

| Tastă sau acțiune | Rezultat |
|---|---|
| Rotița | Zoom înainte sau înapoi la indicator |
| Tragere pe spațiu gol | Deplasare (în orice instrument; un clic scurt tot face clic; cu {{key:Shift}} ținut, desenează o casetă de selecție) |
| Tragere cu butonul din mijloc | Deplasare |
| Tragere cu butonul din dreapta | Deplasare (nu se deschide niciun meniu) |
| {{key:Space}} și tragere | Deplasare |
| Clic | Selectare (cu {{ui:Selectare}}) sau plasarea unui punct (cu un instrument de desen) |
| {{key:Shift}} și clic | Adaugă un punct de topografie la selecție sau îl scoate din ea |
| {{key:Shift}} și tragere | Desenează o casetă: punctele de topografie din ea sunt adăugate la selecție. Trageți în jurul lor pentru un [lasou](topic:lasso-selection) |
| {{key:Space}} în timp ce desenați un lasou | Fereastră, apoi intersectare, apoi gard |
| Clic în timpul lipirii | Pune acolo punctele lipite ({{key:Enter}} le pune la propriile coordonate) |
| Tragere de un mâner | Mută un PI, un colț de platformă sau o structură (un pas de anulare) |
| {{key:Up}} {{key:Down}} {{key:Left}} {{key:Right}} | Deplasare, când planul are focusul (faceți clic pe el mai întâi) |
| {{key:Plus}} și {{key:Minus}} | Zoom înainte și înapoi la mijloc, când planul are focusul |

Tasta = mărește ca {{key:Plus}}, deci nu aveți nevoie de Shift.

## Vizualizarea profilului

| Acțiune | Rezultat |
|---|---|
| Clic cu {{ui:Adăugare PVI}} activat | Adaugă un PVI acolo |
| Clic pe un PVI | Îl selectează |
| Tragere a unui PVI | Îl mută (un pas de anulare) |
| {{key:Delete}} sau {{key:Backspace}} | Elimină PVI-ul selectat ({{key:Backspace}} doar când vizualizarea profilului are focusul) |

Vizualizarea profilului nu face zoom și nu deplasează.

## Ecran și ajutor

| Tastă | Acțiune |
|---|---|
| {{key:F1}} | Deschide sau închide acest ajutor (panoul lateral); {{ui:Ajutor}} din bara aplicației face același lucru |
| {{key:Esc}} | Închide panoul de ajutor când este deschis |
| {{key:Ctrl+Shift+F}} | Trece prin modurile de ecran: ecran complet, ecran complet cu barele ascunse, normal |
| {{key:Esc}} | Iese din ecranul complet (tasta proprie browserului) |

{{key:F1}} ajunge la ajutor înaintea CivilCraft, deci funcționează în orice instrument. Pe majoritatea tastaturilor Mac, apăsați fn cu F1 sau faceți clic pe {{ui:Ajutor}}. {{key:Ctrl+Shift+F}} folosește tasta Ctrl pe fiecare platformă, inclusiv pe Mac. Vezi [Utilizarea ajutorului](common:help) pentru cum să căutați în acest ajutor.

## Mouse, trackpad și ecran tactil

:::mouse
- Rotița face zoom la indicator. Un mouse cu rotița liberă face zoom rapid: dați rotiri scurte.
- Deplasați cu orice tragere pe spațiu gol, cu butonul din mijloc, cu butonul din dreapta sau cu {{key:Space}} și tragere.
:::

:::mac
Pe trackpadul unui Mac:

- Derularea cu două degete **face zoom** (nu deplasează), iar ciupirea face zoom și ea.
- Ca să deplasați, apăsați și trageți pe spațiu gol cu un deget, sau țineți {{key:Space}} și trageți.
- Un clic cu două degete (clic dreapta) nu deschide niciun meniu și nu face nimic de unul singur.
:::

:::touch
Pe un ecran tactil:

- Prima atingere face butoanele și rândurile de meniu de mărimea degetului.
- Atingeți ca să selectați sau să plasați un punct; un deget tras pe spațiu gol deplasează. O atingere poate tremura puțin: deplasează doar după ce degetul se mișcă cam 10 pixeli.
- Două degete ciupesc ca să facă zoom și se mișcă împreună ca să deplaseze.
- Trageți un mâner sau un PVI cu un deget. Mânerele au nevoie de lățimea unui deget în jur.
- În timp ce desenați un aliniament, o platformă, o linie de rupere, o limită, un traseu de conductă, o linie de caracteristică sau o parcelă, o bară de deasupra planului oferă {{ui:Finish}} ({{key:Enter}}), {{ui:Undo point}} ({{key:Backspace}}) și {{ui:Cancel}} ({{key:Esc}}). O apăsare lungă (o jumătate de secundă fără mișcare) încheie și ea.
- În {{ui:Selectare}}, o apăsare lungă pe un punct de topografie îl adaugă la selecție sau îl scoate, la fel ca {{key:Shift}}+clic.
- În vederea 3D, un deget orbitează, două ciupesc și deplasează, iar o atingere alege.
- Pe ecranul tactil nu există hover, deci citirile din bara de stare se actualizează doar cât timp un deget este apăsat.
:::

## Scurtăturile browserului care câștigă

Unele taste aparțin browserului și nu ajung niciodată la CivilCraft, de exemplu {{key:Mod+W}} (închide fila), {{key:Mod+T}} (filă nouă), {{key:Mod+N}} (fereastră nouă) și {{key:F11}} (ecran complet în browserele din Windows și Linux). CivilCraft nu le folosește. Dacă o scurtătură deschide ceva în browser, faceți clic o dată pe plan, ca pagina să aibă focusul, și încercați din nou.

## Unde se află Mutarea

Nu există o comandă Mutare: alegeți {{ui:Selectare}} și trageți un punct sau un vârf, sau editați-i coordonatele în {{ui:Proprietăți}}. Vezi [Editarea punctelor](topic:edit-points).
