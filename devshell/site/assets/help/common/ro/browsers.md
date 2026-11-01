---
title: Browsere și calculatoare
summary: În ce browsere rulează aplicațiile, ce diferă între ele și de ce are nevoie calculatorul.
keywords: chrome, edge, firefox, safari, brave, browser, mac, windows, linux, ipad, tabletă, webgl, cerințe, memorie
from: a11b09b1
---

Aplicațiile rulează în interiorul unui browser web. Lucrul se face pe calculatorul propriu: fișierele sunt deschise acolo și nu sunt trimise niciodată la noi (vezi [Unde ajung fișierele](common:your-files)).

## Ce browser

Folosiți o versiune actualizată a unuia dintre acestea:

| Browser | Motor | Observații |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | Cel mai complet: alegerea unui dosar, salvarea pentru offline, gestionarea fișierelor. |
| Firefox | Gecko | Funcționează. Deschiderea unui dosar întreg folosește un selector mai simplu. Salvarea pentru offline poate să nu funcționeze în ferestrele private. |
| Safari | WebKit | Funcționează pe Mac și iPad. Deschiderea unui dosar întreg folosește un selector mai simplu. Safari poate șterge o copie offline nefolosită de câteva săptămâni. |

Toate cele trei motoare sunt potrivite pentru lucrul de zi cu zi. Acolo unde o aplicație face ceva diferit într-unul dintre ele, ajutorul ei arată pașii pentru browserul folosit.

## Ce diferă între browsere

- **Deschiderea unui dosar.** Browserele Chromium afișează un selector real de dosare și pot citi dosarul direct. Firefox și Safari cer să alegeți un dosar, apoi citesc fiecare fișier din el, ceea ce durează mai mult pentru dosarele mari de proiect; trăgerea dosarului în aplicație funcționează în toate trei.
- **Salvarea.** Aplicațiile salvează prin descărcarea unui fișier. Browserul decide unde ajung descărcările și dacă întreabă înainte.

:::chromium
În Chrome sau Edge, activați „Întrebați unde să salvați fiecare fișier înainte de descărcare” (în Setări, la Descărcări) pentru a alege un dosar de fiecare dată.
:::

:::firefox
În Firefox, deschideți Setări, apoi General, apoi Descărcări și alegeți „Întreabă întotdeauna unde să salvez fișierele” pentru a alege un dosar de fiecare dată.
:::

:::safari
În Safari, deschideți Setări, apoi General, și setați „Locația descărcării fișierelor” la „Întreabă la fiecare descărcare” pentru a alege un dosar de fiecare dată.
:::

## Mac, Windows și Linux

Aplicațiile sunt la fel pe orice calculator. Se schimbă tastatura: scurtăturile sunt scrise automat pentru calculatorul respectiv. Vezi [Taste, mouse-uri și touchpad-uri](common:keys).

## Tablete și ecrane tactile

Unele aplicații acceptă atingerea (un deget desenează sau selectează, două degete ciupesc pentru zoom și pan). Ajutorul fiecărei aplicații spune dacă le acceptă. Pe iPad, folosiți Safari sau Chrome. O tastatură ajută la aplicațiile care folosesc comenzi scrise.

## Cel mai vechi browser și sistem

Acestea au fost citite din codul aplicațiilor 0.7, nu presupuse: fiecare fișier a fost analizat, iar fiecare funcție de limbaj folosită a fost verificată în datele publicate de compatibilitate ale browserelor. Sub aceste versiuni, aplicațiile nici nu pot porni, deoarece browserul nu înțelege codul.

| | Cea mai veche versiune care poate porni aplicațiile |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium 94 |
| Firefox | 93 |
| Safari (Mac, iPad, iPhone) | 16.4 (macOS 13.3, iPadOS și iOS 16.4) |

CadCraft Studio include propriul motor web pe Windows, deci are nevoie de Windows 10 sau 11; pe Mac folosește pe cel al sistemului, deci are nevoie de macOS 13.3 sau mai nou. Setări › Actualizări în Studio arată pe ce rulează copia instalată.

Aceasta este cea mai veche versiune care *pornește*, citită din cod. Nu este o listă de browsere vechi în care am rulat aplicațiile, așa că un browser mai vechi care pornește poate totuși să nu aibă o funcție.

## Ce are nevoie calculatorul

Acestea sunt minimumuri planificate pentru aplicații, nu cerințe măsurate:

- 8 GB de memorie (16 GB sunt recomandați pentru modelele federate mari).
- Un cip grafic cu WebGL 2 pentru aplicațiile 3D. Dacă o vizualizare 3D rămâne goală, verificați că accelerarea hardware este activată în setările browserului.
- Un ecran de cel puțin 1280 pixeli lățime pentru barele de instrumente complete; ecranele mai mici le încadrează.

Fișierele foarte mari (seturi mari de planuri, modele mari) folosesc mult din memoria unei filă de browser. Închideți alte file grele dacă o aplicație încetinește.
