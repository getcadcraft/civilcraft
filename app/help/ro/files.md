---
title: Fișiere care pot fi deschise, salvate și exportate
summary: Fișiere cu puncte, LandXML și proiecte CivilCraft la import; proiecte, LandXML, DXF și PDF la export; ce păstrează fiecare, unde ajung fișierele și ce se schimbă offline.
keywords: deschidere, salvare, export, import, formate de fișiere, csv, txt, landxml, xml, dxf, pdf, json, descărcare, fișier de proiect
from: a7debb61
---

CivilCraft deschide fișiere de pe calculator și salvează prin descărcarea fișierelor înapoi pe calculator. Nimic nu este încărcat și nimic nu este păstrat pe un server. Vedeți și [Fișierele](common:your-files).

## Ce deschide

Faceți clic pe {{ui:Open}} (sau apăsați {{key:Mod+O}}) și alegeți un fișier, sau trageți fișierul din {{pick:mac=Finder|windows=File Explorer|linux=managerul de fișiere}} pe plan. Câte un fișier pe rând; fișierele mai mari de 200 MB sunt refuzate.

| Tip | Nume de fișier | Ce se întâmplă |
|---|---|---|
| Fișier de puncte | `.csv`, `.txt`, `.pnt`, `.xyz` (orice fișier text) | Se deschide dialogul **Import puncte**. Punctele înlocuiesc punctele proiectului; axele traseelor, platformele și conductele rămân. |
| LandXML | `.xml`, `.landxml` | Se creează un **proiect nou** din fișier (vi se cere confirmare înainte, dacă proiectul curent are modificări nesalvate). |
| Proiect CivilCraft | `.civilcraft.json` (orice `.json`) | Proiectul se deschide așa cum a fost salvat (vi se cere confirmare înainte, dacă proiectul curent are modificări nesalvate). |

CivilCraft decide după terminația fișierului, apoi după primele caractere: textul care începe cu `{` este citit ca proiect, textul care începe cu `<` ca LandXML, orice altceva ca fișier de puncte. Un fișier pe care caseta de deschidere îl afișează estompat poate fi totuși tras pe plan.

:::note
Importul unui fișier de puncte într-un proiect care are deja puncte le înlocuiește fără întrebare și golește istoricul anulărilor (deschiderea oricărui fișier este un început nou pentru anulare). Dacă modelul de teren provine dintr-un LandXML, importul de puncte îl transformă înapoi într-un model construit din puncte. Salvați înainte, dacă ați putea dori punctele vechi înapoi.
:::

Detalii: [Formate de fișiere cu puncte](topic:point-file-formats), [LandXML: ce se citește și ce se scrie](topic:landxml-reference).

## Ce salvează

{{ui:Save}} ({{key:Mod+S}}) scrie două fișiere unul lângă altul, denumite după **Nume** din panoul din stânga: `<nume>.civilcraft.json`, proiectul pe care continuați să îl editați, și `<nume>.ifc`, același proiect ca IFC 4.3 pentru alte aplicații (vedeți [Export și import IFC](topic:ifc)). Fiecare fișier îl menționează pe celălalt, iar IFC-ul conține și o copie comprimată a proiectului, astfel încât un IFC trimis singur se poate redeschide complet editabil.

- **În Studio** ambele fișiere sunt scrise unul lângă altul, în același loc.
- **În Chrome și Edge** prima salvare cere un dosar și scrie ambele fișiere în el; salvările ulterioare merg în același dosar. Anulați întrebarea despre dosar pentru a descărca ambele fișiere.
- **În celelalte browsere** ambele fișiere se descarcă, întâi fișierul de proiect.

Deschiderea oricăruia dintre fișiere îl caută pe celălalt. Deschideți ambele împreună (sau trageți ambele), ori deschideți unul singur: în Studio, celălalt se găsește în același dosar; într-un browser, CivilCraft vă întreabă dacă doriți să îl adăugați sau să continuați cu cel pe care îl aveți. Dacă IFC-ul a fost modificat de alt program după ce CivilCraft l-a salvat, sau unul dintre fișiere este mai vechi decât celălalt, proiectul se deschide din cea mai nouă versiune a proiectului, iar panoul Probleme spune ce s-a întâmplat, cu **Salvare acum** (scrie din nou ambele fișiere) și **Afișare geometria IFC-ului ca referință**. Un IFC singur, modificat de alt program, se deschide din copia sa a proiectului, cu ce se potrivește încă: axele traseelor modificate iau geometria sa, obiectele eliminate sunt omise, iar restul modificărilor sunt listate, nu preluate. Un fișier de proiect dinaintea versiunii 0.7.1 se deschide ca înainte.

Fișierul de proiect păstrează:

- fiecare punct (număr, coordonate, cotă, descriere) și numele fișierului de puncte din care provin
- setările modelului de teren: alegerile pentru grupuri, liniile de rupere desenate, limita, cea mai lungă margine exterioară și un TIN citit dintr-un LandXML
- setările de afișare
- axele traseelor cu PI-urile, razele și kilometrajul de start, profilele lor de proiectare (PVI-uri și lungimile curbelor) și setările coridorului
- platformele și rețeaua de conducte cu regulile ei

Nu păstrează istoricul anulărilor. Modelele de teren, curbele de nivel, liniile de intersecție cu terenul și volumele nu sunt stocate; ele sunt reconstruite din datele salvate când se deschide proiectul. Un fișier de proiect dintr-o versiune mai nouă de CivilCraft este refuzat, cu un mesaj care numește versiunea.

## Ce exportă

| Buton | Fișier | Conținut |
|---|---|---|
| {{ui:LandXML}} | `<nume>.xml` | LandXML 1.2: puncte, terenul natural (și modelul de teren sistematizat, dacă există) ca suprafețe TIN, axele traseelor, profilele terenului și de proiectare, rețeaua de conducte |
| {{ui:DXF}} | `<nume>.dxf` | DXF R12 cu liniile planului așa cum sunt afișate, pe straturi denumite |
| {{ui:DWG}} | `<nume>.dwg` | Aceleași linii ca desen DWG, în formatul ales (2000 până la 2018) |
| {{ui:PDF}} | `<nume>.pdf` | Trasare vectorială a planului pe o foaie, la o scară aleasă |
| {{ui:GLB}} sau {{ui:OBJ}} (în bara vizualizării 3D) | `<nume>-3d.glb`, `<nume>-3d.obj` | Ce arată vizualizarea 3D ca model 3D: metri, Y în sus, scară reală, în jurul unei origini locale înregistrate |

Ce lasă fiecare afară: [LandXML de schimb](topic:landxml), [Exportul planului în DXF](topic:dxf-export) (DWG la fel), [Trasarea planului în PDF](topic:plot-pdf), [Exportul amplasamentului în 3D](topic:export-3d).

## Unde ajung fișierele

Fișierele salvate și exportate ajung unde pune browserul descărcările, de obicei în dosarul Descărcări. Pentru a alege un dosar de fiecare dată:

:::chromium
Deschideți **Setări** ale browserului, apoi **Descărcări**, și activați **Întreabă unde să fie salvat fiecare fișier înainte de descărcare**.
:::

:::firefox
Deschideți **Setări**, apoi **General**, și la **Fișiere și aplicații** alegeți **Întreabă întotdeauna unde să fie salvate fișierele**.
:::

:::safari
Deschideți **Safari > Setări > General** și setați **Locul descărcării fișierelor** la **Întreabă la fiecare descărcare**.
:::

Dacă salvați de două ori cu același nume, browserul poate adăuga un număr la al doilea fișier, de exemplu `Amplasament (1).civilcraft.json`. Deschideți data viitoare cel mai nou.

## Online și offline

CivilCraft funcționează doar pe calculatorul dumneavoastră în ambele cazuri: deschiderea citește fișierul în browser, salvarea îl descarcă. Pentru a deschide CivilCraft fără nicio conexiune, salvați-l mai întâi pentru utilizare offline:

1. Cât timp sunteți online, faceți clic pe {{ui:Save for offline}} din bara aplicației de sus.
2. Butonul numără ("Salvare 12 din 30") și apoi afișează {{ui:Offline ready}}. CivilCraft are o dimensiune mică (circa 0,6 MB), deci durează puțin. Copia salvată include acest ajutor și amplasamentul demonstrativ.
3. Fără conexiune, deschideți aceeași adresă (sau un marcaj al ei). Totul funcționează, inclusiv {{ui:Open the sample site}}.

Celelalte stări ale butonului:

- {{ui:Could not save}}: unele fișiere nu s-au descărcat. Verificați conexiunea și faceți clic din nou pentru a încerca.
- {{ui:Offline not available}}: această fereastră de browser nu poate păstra o copie offline (ferestrele private și unele calculatoare administrate o blochează). Folosiți o fereastră normală.

Faceți clic pe {{ui:Offline ready}} pentru a vedea când a fost salvată copia, cu două opțiuni: {{ui:Save again (get the newest version)}} și {{ui:Remove the offline copy}}. Salvați din nou înainte de o vizită pe amplasament, ca să corespundă copia celei mai noi versiuni. Mai multe în [Offline](common:offline).

:::offline
Acum sunteți offline. Dacă CivilCraft a fost salvat pentru utilizare offline, totul funcționează, inclusiv amplasamentul demonstrativ. Dacă nu, puteți continua să lucrați în această filă, dar nu o reîncărcați până nu reveniți online; fără o copie salvată, {{ui:Open the sample site}} eșuează cu mesajul „Eșantionul nu a putut fi încărcat”.
:::

:::tip
Pentru lucrul pe teren, salvați CivilCraft pentru utilizare offline și aduceți fișierele cu puncte pe chiar laptopul. Proiectele și exporturile se salvează ca descărcări și fără conexiune, așa că puteți importa măsurătorile unei zile, verifica modelul de teren și salva proiectul pe teren.
:::

Salvarea în cloud nu este disponibilă încă, iar versiunile pentru desktop nu au apărut încă. Deocamdată, fișierele salvate sunt singura copie: păstrați-le undeva unde există copie de rezervă.

## Adăugiri folosite de un fișier

Când salvați un proiect care conține date dintr-o adăugire (bifele Reglementări de construcție sau o sursă Adresă către amplasament), fișierul înregistrează ce adăugiri și ce versiuni sunt. Dacă îl deschideți pe un calculator care nu le are, o bară deasupra planului spune asta și oferă să le adăugați din lista contului dumneavoastră. Înregistrarea este doar o notă: fișierul se deschide oricum.

## Anularea din Studio

În interiorul CadCraft Studio, fiecare pas finalizat în CivilCraft este comunicat Studio, astfel încât anularea la nivel de proiect din Studio poate anula ultimul pas din toate aplicațiile. Studio anulează un pas doar când stiva de anulare a CivilCraft este exact cum a lăsat-o acel pas; după ce deschideți alt fișier, sare peste această fereastră.

## Închiderea cu modificări nesalvate

Când proiectul are modificări nesalvate și închideți fila, reîncărcați pagina sau părăsiți pagina, browserul întreabă dacă doriți să plecați. Textul și aspectul lui țin de browser și nu pot fi schimbate de CivilCraft. {{ui:New}} și deschiderea unui proiect sau a unui fișier LandXML cer confirmare în propria casetă **Modificări nesalvate** a CivilCraft, cu {{ui:Cancel}}, {{ui:Don’t save}} și {{ui:Save a copy}}.
