---
title: Selectarea, copierea și lipirea punctelor de măsurare
summary: Selectați puncte de măsurare prin clic, Shift și o casetă, sau pe toate deodată; copiați, decupați, lipiți, lipiți în aceeași poziție, duplicați și ștergeți-le cu numere noi de punct care nu se ciocnesc niciodată; lipiți rânduri de puncte din și în foaia de calcul.
keywords: copiere, lipire, decupare, duplicare, ștergere puncte, selectare puncte, selectare totală, selectare prin casetă, fereastră, clipboard, foaie de calcul, csv, renumerotare, numere de punct, lipire în aceeași poziție, clonare, trasare pe teren
from: 78a6aea7
---

Punctele de măsurare pot fi copiate și lipite într-un proiect, între proiecte din două file de browser și din și în foaia de calcul. Fiecare modificare este un singur pas de anulare, iar modelul de teren se reconstruiește imediat din noile puncte.

## Selectarea punctelor

Cu {{ui:Selectare}} ({{key:V}}):

- **Clic** pe un punct ca să-l selectați (și doar pe el). Numerele lui apar sub **Proprietăți**.
- {{key:Shift}} și **clic** adaugă un punct la selecție sau îl scoate din ea.
- {{key:Shift}} și **trageți** desenează o casetă: punctele din ea sunt adăugate la selecție. Trageți în jurul punctelor în schimb și devine lasou; vezi [Selectarea cu lasou a punctelor de măsurare](topic:lasso-selection). O tragere fără {{key:Shift}} mută planul, ca de obicei.
- {{key:Mod+A}} (sau {{ui:Mai multe}} › {{ui:Selectarea tuturor punctelor}}) selectează fiecare punct.
- {{key:Esc}} (sau {{ui:Mai multe}} › {{ui:Anularea selecției}}) golește selecția.

Punctele selectate au un cerc. Când sunt mai multe selectate, **Proprietăți** arată câte sunt, numerele lor, intervalul lor de cote și grupurile lor.

## Copiere, decupare și ștergere

- {{ui:Copiere}} sau {{key:Mod+C}} copiază punctele selectate. CivilCraft păstrează copia și o pune și în clipboardul sistemului ca rânduri de puncte, astfel încât o puteți lipi direct într-o foaie de calcul sau într-un fișier text.
- {{ui:Mai multe}} › {{ui:Decupare}} sau {{key:Mod+X}} le copiază și le șterge, într-un singur pas.
- {{ui:Mai multe}} › {{ui:Ștergere}} sau {{key:Delete}} le șterge. {{key:Mod+Z}} le aduce înapoi.

Rândurile sunt: punct, nord, est, cotă, descriere (P,N,E,Z,D), separate prin virgule, cu trei zecimale. Ca să aveți estul înaintea nordului, setați **Rânduri de puncte** în [Setările CivilCraft](topic:settings). O descriere pe care o foaie de calcul ar trata ca formulă (care începe cu =, +, - sau @) primește un apostrof în față, ca să rămână text.

## Lipire

1. Apăsați {{key:Mod+V}} sau faceți clic pe {{ui:Lipire}}. Punctele urmează cursorul ca mici cruci, cu o linie punctată înapoi spre locul de unde au venit.
2. Faceți clic unde trebuie să ajungă. Mijlocul punctelor copiate ajunge la clic.
3. Sau apăsați {{key:Enter}} ca să le puneți la propriile coordonate, ori {{key:Esc}} ca să anulați.

{{ui:Mai multe}} › {{ui:Lipire în aceeași poziție}} sau {{key:Mod+Shift+V}} lipește imediat la coordonatele proprii ale punctelor. Punctele lipite sunt selectate după aceea, ca să le puteți copia, muta sau șterge din nou.

:::note
Un clic pe {{ui:Lipire}} din bara de instrumente citește clipboardul sistemului. Prima dată, browserul poate întreba dacă CivilCraft are voie să vadă clipboardul. Dacă refuzați, butonul din bara de instrumente lipește doar copia proprie a CivilCraft; {{key:Mod+V}} lipește în continuare rânduri dintr-o foaie de calcul fără să întrebe.
:::

## Numerele de punct nu se ciocnesc niciodată

Două puncte nu au niciodată același număr. Când lipiți:

- Un punct lipit își păstrează numărul când niciun punct din proiect nu-l are. Așadar, după **Decupare**, punctele se lipesc înapoi cu propriile numere, iar punctele copiate dintr-un alt proiect își păstrează numerele unde sunt libere.
- Un punct lipit al cărui număr este deja luat primește un număr întreg nou: cu unu mai mare decât cel mai mare număr în uz, numărând în sus.
- Bara de stare spune ce s-a întâmplat, de exemplu „1 și-a păstrat numărul; 9 au primit numere noi: 10–18 au devenit 277–285”.

În [Setările CivilCraft](topic:settings) puteți alege **Întotdeauna numere noi** și un număr de la care să pornească numerele noi, de exemplu 5000 pentru punctele de proiectare.

:::warning
Grupurile de puncte care construiesc modelul de teren ca **linie de rupere** își unesc punctele în ordinea numerelor. Copiile lipite ale punctelor de linie de rupere (de exemplu puncte FL) primesc numere noi, mai mari, și se unesc la capătul acelei linii de rupere, posibil cu un salt lung. Verificați planul după lipirea unor astfel de puncte sau setați grupul lor la {{ui:Puncte}}.
:::

## Duplicare

{{ui:Mai multe}} › {{ui:Duplicare}} sau {{key:Mod+D}} face o copie a punctelor selectate care urmează cursorul: faceți clic unde trebuie să ajungă. Copiile primesc întotdeauna numere noi, iar clipboardul CivilCraft rămâne cum era.

## Dintr-o foaie de calcul sau un fișier text

Selectați rânduri de puncte într-o foaie de calcul (punct, nord, est, cotă, descriere) și copiați-le. În CivilCraft apăsați {{key:Mod+V}} și faceți clic unde trebuie să ajungă, sau apăsați {{key:Mod+Shift+V}} ca să le puneți la propriile coordonate, ceea ce de obicei doriți pentru date reale de măsurătoare.

Rândurile sunt citite exact ca un [fișier de puncte](topic:point-file-formats): virgule, tabulatori sau spații, cu un rând de antet dacă există unul. Fără antet, ordinea coloanelor vine din **Rânduri de puncte** în [Setările CivilCraft](topic:settings).

Când ambele sunt prezente, CivilCraft decide după ce este mai nou: rândurile din clipboardul sistemului care diferă de ultima copie a CivilCraft au fost copiate mai târziu, deci sunt lipite. Textul care nu conține puncte este ignorat, iar în locul lui se lipește copia proprie a CivilCraft.

## Între proiecte și file

Copia este păstrată în acest browser, astfel încât o a doua filă a CivilCraft o poate lipi, chiar și după ce prima filă se închide. Punctele copiate dintr-un proiect în metri și lipite într-un proiect în picioare își păstrează numerele așa cum sunt: nimic nu se convertește, iar bara de stare spune asta.

## Ce nu se copiază

Deocamdată se copiază doar punctele de măsurare. Aliniamentele, platformele, rețelele de conducte, liniile de rupere și limitele nu pot fi copiate sau lipite încă. Lipirea nu poate muta puncte existente: folosiți {{ui:Decupare}} și lipire sau mutați câte un punct pe rând ([Editarea unui punct de măsurare](topic:edit-points)).
