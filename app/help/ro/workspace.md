---
title: Ecranul, pe părți
summary: Un tur al fiecărei bare și al fiecărui panou din CivilCraft, după numele lor de pe ecran, de la bara de instrumente la bara de stare.
keywords: interfață, ecran, bară de instrumente, panouri, proprietăți, bară de stare, vizualizarea profilului, aspect, tur, ui
from: 76272010
---

CivilCraft are un singur ecran. Nu există file și nu există aspecte alternative. Panourile laterale se pot muta, detașa sau trece într-o fereastră proprie: vedeți [Aranjarea panourilor și folosirea unui al doilea monitor](common:arrange-panels). De sus în jos și de la stânga la dreapta:

- **bara aplicației** (emblema CadCraft, numele aplicației, versiunea, Despre, modul ecran, Ajutor, Salvare pentru offline, Hârtie și Model)
- **bara de instrumente** cu șapte grupuri de butoane
- **panoul din stânga**: Amplasament, Puncte, Model de teren, Afișare și, după ce importați câteva, straturi GIS
- **planul** din mijloc, cu **vizualizarea profilului** sub el, când este deschisă
- **panoul din dreapta**: Proprietățile a ceea ce este selectat
- **bara de stare** de-a lungul părții de jos

## Bara aplicației

Bara subțire de sus aparține site-ului CadCraft, nu CivilCraft în sine.

- Meniul versiunii arată ce versiune rulați.
- {{ui:About CivilCraft}} deschide pagina aplicației de pe site.
- {{ui:Full screen}} parcurge modurile ecranului: ecran complet, apoi ecran complet cu barele ascunse, apoi înapoi la normal. {{key:Ctrl+Shift+F}} face același lucru pe toate platformele, inclusiv pe Mac (acolo este tasta Ctrl, nu Cmd). Cu barele ascunse, mutați indicatorul la marginea de sus pentru a le aduce înapoi.
- {{ui:Help}} (sau {{key:F1}}) deschide acest ajutor într-un panou lateral; {{key:F1}} sau {{key:Esc}} îl închid.
- {{ui:Save for offline}} păstrează CivilCraft în acest browser, astfel încât să se deschidă fără conexiune; apoi afișează {{ui:Offline ready}}. Vedeți [Deschiderea, salvarea și exportul fișierelor](topic:files#online-and-offline).
- {{ui:Paper}} și {{ui:Model}} comută între o temă luminoasă și una întunecată. Planul și profilul urmează tema; PDF-urile se tipăresc mereu pe alb.

## Bara de instrumente

Fiecare grup are o etichetă mică deasupra butoanelor. Treceți cu indicatorul peste un buton pentru a vedea sugestia și tasta sa.

| Grup | Butoane | Ce fac |
|---|---|---|
| Fișier | {{ui:New}}, {{ui:Open}}, {{ui:Save}} | Încep din nou, deschid un fișier cu puncte, LandXML sau proiect, salvează proiectul ca descărcare |
| Export | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | Scriu LandXML 1.2, un DXF R12 sau un DWG al planului, ori trasează planul în PDF |
| Model de teren | {{ui:Breakline}}, {{ui:Boundary}} | Desenează o linie de rupere prin punctele de releveu; desenează limita exterioară |
| Proiectare | {{ui:Alignment}}, {{ui:Pad}}, {{ui:Pipes}}, {{ui:Profile}} | Desenează un ax de traseu, o platformă, o rețea de conducte; arată sau ascunde vizualizarea profilului |
| Editare | {{ui:Undo}}, {{ui:Redo}}, {{ui:Copy}}, {{ui:Paste}}, {{ui:More}} | Anulează, refă, copiază și lipește punctele de releveu; {{ui:More}} conține Decupare, Lipire în aceeași poziție, Duplicare, Ștergere, Selectare toate punctele și Anularea selecției |
| GIS | {{ui:Coordinates}}, {{ui:Import}}, {{ui:Export}}, {{ui:Map}} | Setează sistemul de coordonate, importă și exportă fișiere GIS, arată straturi de hartă sub plan |
| Vizualizare | {{ui:Select}}, {{ui:Fit}}, {{ui:3D}} | Alege și mută lucruri; mărește pentru a arăta totul; arată amplasamentul în 3D ([Vizualizarea amplasamentului în 3D](topic:site-3d)) |

Un instrument de desenare rămâne apăsat cât este activ. Un clic din nou pe el, apăsarea {{key:Esc}} sau apăsarea {{key:V}} revine la {{ui:Select}}. {{ui:Undo}}, {{ui:Redo}}, {{ui:Copy}} și elementele din {{ui:More}} sunt estompate când nu pot acționa; sugestia spune de ce (de exemplu „Mai întâi selectați punctele de releveu”). Fiecare buton este listat în [Referința barei de instrumente](topic:toolbar).

Pe o fereastră îngustă, bara de instrumente se derulează lateral.

## Panoul din stânga

### Amplasament

- **Nume**: numele proiectului. Denumește fiecare fișier salvat sau exportat și este tipărit în bandeau-ul de titlu al PDF-ului.
- **Unități**: {{ui:US feet}} sau {{ui:Metres}}. Spune ce înseamnă numerele. Schimbarea lui **nu** convertește coordonatele; vedeți [Unități, kilometraje și formate de numere](topic:units-and-stations).

### Puncte

Gol, vă spune cum să deschideți un fișier cu puncte. Cu puncte, afișează numele fișierului, numărul de puncte și câte au cotă, apoi un tabel de **grupuri de puncte**: un rând pentru fiecare prim cuvânt din descriere (GRD, FL, TBS …), cu un număr și o alegere la **Model de teren**:

- {{ui:Points}}: punctele intră în model (implicit pentru fiecare grup).
- {{ui:Breakline}}: punctele grupului sunt unite, în ordinea numerelor de punct, într-o singură linie de rupere.
- {{ui:Left out}}: grupul nu atinge modelul de teren.

### Model de teren

Date despre terenul natural: puncte, triunghiuri, cota cea mai joasă și cea mai înaltă, cota medie, suprafața 2D și 3D, liniile de rupere și dacă există o limită. Sub date, o casetă listează orice a trebuit reparat sau nu a putut fi făcut de constructorul modelului. Apoi:

- **Cea mai lungă margine exterioară**: 0 păstrează fiecare triunghi exterior; un număr taie de pe exterior triunghiurile lungi și subțiri.
- Legături care apar când se aplică: {{ui:Remove the boundary}}, {{ui:Remove drawn breaklines}} și, pentru un model citit dintr-un LandXML, {{ui:Rebuild the surface from the points}}.

### Afișare

- **Model de teren**: {{ui:Existing ground}} sau {{ui:Proposed (graded)}}. Al doilea este disponibil odată ce o platformă sau un coridor sistematizează fără probleme.
- **Curbe de nivel la fiecare**, **Major la fiecare** și **Benzi** (numărul de benzi de culoare).
- Casete de bifare: {{ui:Contours}}, {{ui:Contour labels}}, {{ui:Triangles}}, {{ui:Elevation bands}}, {{ui:Slope arrows}}, {{ui:Points}}, {{ui:Point labels}}, {{ui:Breaklines}}, {{ui:Surface edge}}, {{ui:Pipes}}.
- O legendă a cotelor benzilor apare când benzile sunt active.

Setările de afișare se salvează cu proiectul, dar nu sunt pași de anulare: {{key:Mod+Z}} nu readuce niciodată o bifă înapoi.

## Planul

Planul arată punctele, modelul de teren și tot ce proiectați, în vedere de sus, cu nordul în sus. Rotița mărește la indicator, trageți pe spațiul gol pentru a deplasa. Lista completă se află în [Taste și mouse](topic:keyboard).

- Pe un proiect gol, o casetă intitulată **Începeți cu punctele de releveu** listează primii pași și oferă {{ui:Open the sample site}}.
- Cât timp un instrument de desenare este activ, o sugestie din partea de sus a planului spune ce să faceți clic și cum să încheiați.
- Trăgând un fișier peste plan apare mesajul „Lăsați un fișier cu puncte, LandXML sau proiect”.
- Lucrurile selectate sunt evidențiate. Un ax de traseu sau o platformă selectată arată mânere pătrate la PI-urile sau colțurile sale; o structură selectată arată un singur mâner. Trageți un mâner pentru a muta.
- Punctele de releveu selectate au un inel. {{key:Shift}} și un clic adaugă sau scot un punct; {{key:Shift}} și o tragere desenează o casetă (sau, trasă în jurul lor, un lasou) care adaugă punctele din interior. Vedeți [Selectarea, copierea și lipirea punctelor de releveu](topic:copy-paste-points).

## Vizualizarea profilului

Apăsați {{key:R}} sau faceți clic pe {{ui:Profile}} pentru a o deschide sub plan. Bara sa are:

- o listă de axe ale traseelor (activă când există două sau mai multe)
- {{ui:Add PVIs}}: cât timp este apăsat, un clic în profil adaugă un PVI ({{key:I}} comută)
- o citire a kilometrajului, terenului, cotei de proiectare, pantei și debleului sau rambleului sub indicator
- un buton de închidere

Profilul arată terenul natural, profilul de proiectare, pantele pe fiecare tangentă, kilometrajul și cota fiecărui PVI, fiecare curbă verticală cu L și K, cu BVC și EVC, punctele înalte și joase și exagerarea verticală. Mereu încadrează întregul ax al traseului: nu se mărește și nu se deplasează. Mutând indicatorul de-a lungul lui, apare un punct pe axul traseului din plan.

## Panoul din dreapta: Proprietăți

Titlul său spune ce arată.

- **Proiect** (nimic selectat): axele traseelor și platformele ca legături, blocul **Terasamente** și blocul **Rețea de conducte**, cu regulile și problemele sale.
- **Axul traseului**: nume, kilometrajul de start, lungimea, tabelul PI, curbele, tabelul PVI și datele profilului de proiectare și setările **Coridorului**.
- **Platformă**: nume, cotă, pante de debleu și rambleu, suprafață, date despre intersecția cu terenul și terasamente.
- **Structură** sau **Conductă**: dimensiuni, cote ale capacelor, cote ale radierelor, pantă, adâncime de îngropare și orice probleme.
- **Punct** și numărul său: coordonatele, cota, descrierea și grupul punctului (doar citire).

Câmpurile au efect când apăsați {{key:Enter}} sau părăsiți câmpul. O valoare neacceptată este marcată ca invalidă și nimic nu se schimbă.

## Bara de stare

- **E** și **N**: coordonata estică și cea nordică sub indicator.
- **Terenul** la acea locație (și **Sistematizat** unde o platformă sau un coridor a schimbat terenul), sau „În afara modelului”.
- Axul traseului cel mai apropiat (sau cel selectat) cu **Km** și decalajul (**S** sau **D**) sub indicator.
- În dreapta, mesaje: ce tocmai s-a întâmplat sau de ce ceva a fost refuzat. Un mesaj dispare singur după câteva secunde.

## Casete de dialog

- **Import puncte**: se deschide cu orice fișier de puncte. Vedeți [Importul punctelor de releveu](topic:import-points).
- **Trasarea planului în PDF**: vedeți [Trasarea planului în PDF](topic:plot-pdf).
- **Modificări nesalvate**: vă întreabă înainte ca {{ui:New}} sau deschiderea unui proiect ori a unui fișier LandXML să arunce lucrul nesalvat. {{ui:Save a copy}} descarcă mai întâi proiectul.

## Ecrane mici

Până la 760 de pixeli lățime, cum este pe un telefon, planul păstrează ecranul: bara de instrumente este un singur rând care se derulează lateral, iar panourile se deschid ca foi dintr-o bară de jos. {{ui:Tools}} ascunde bara de instrumente, iar {{ui:Move}} o mută jos.
