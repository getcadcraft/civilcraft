---
title: Fișiere pe care le puteți deschide, salva și exporta
summary: Fișiere cu puncte, LandXML și proiecte CivilCraft pentru import; proiecte, LandXML, DXF și PDF pentru export; ce păstrează fiecare, unde ajung fișierele și ce se schimbă offline.
keywords: deschidere, salvare, export, import, formate de fișiere, csv, txt, landxml, xml, dxf, pdf, json, descărcare, fișier de proiect
from: 82bff559
---

CivilCraft deschide fișiere de pe calculator și le salvează descărcându-le înapoi pe calculator. Nimic nu se încarcă și nimic nu se păstrează pe un server. Vedeți și [Fișierele proprii](common:your-files).

## Ce deschide

Faceți clic pe {{ui:Deschidere}} (sau apăsați {{key:Mod+O}}) și alegeți un fișier, ori trageți fișierul din {{pick:mac=Finder|windows=File Explorer|linux=managerul de fișiere}} pe plan. Un fișier pe rând; fișierele de peste 200 MB sunt refuzate. Un fișier LandXML sau de proiect de peste 32 MB este citit în bucăți de circa 4 MB, niciodată ca un singur bloc de text; în timpul deschiderii unui LandXML, așteptați-vă ca fișierul să folosească aproximativ de 13 ori dimensiunea sa în memorie (un fișier de 69 MB a folosit circa 0.9 GB în testul nostru).

| Tip | Nume de fișiere | Ce se întâmplă |
|---|---|---|
| Fișier de puncte | `.csv`, `.txt`, `.pnt`, `.xyz` (orice fișier text) | Se deschide caseta **Import puncte**. Punctele înlocuiesc punctele proiectului; aliniamentele, platformele și conductele rămân. |
| LandXML | `.xml`, `.landxml` | Se creează un **proiect nou** din fișier (vi se cere confirmare dacă cel curent are modificări nesalvate). |
| Proiect CivilCraft | `.civilcraft.json` (orice `.json`) | Proiectul se deschide așa cum a fost salvat (vi se cere confirmare dacă cel curent are modificări nesalvate). |

CivilCraft decide după terminația fișierului, apoi după primele caractere: textul care începe cu `{` este citit ca proiect, cel care începe cu `<` ca LandXML, orice altceva ca fișier de puncte. Un fișier pe care caseta de deschidere îl lasă estompat poate fi totuși trimis pe plan.

:::note
Importul unui fișier de puncte într-un proiect care are deja puncte le înlocuiește fără întrebare și șterge istoricul anulărilor (deschiderea oricărui fișier este un început nou pentru anulare). Dacă suprafața provine dintr-un LandXML, importul de puncte o transformă înapoi într-o suprafață construită din puncte. Salvați mai întâi dacă este posibil să doriți înapoi vechile puncte.
:::

Detalii: [Formate de fișiere de puncte](topic:point-file-formats), [LandXML: ce se citește și ce se scrie](topic:landxml-reference).

## Ce salvează

{{ui:Salvare}} ({{key:Mod+S}}) scrie două fișiere alăturate, denumite după **Nume** din panoul din stânga: `<nume>.civilcraft.json`, proiectul pe care îl continuați să îl editați, și `<nume>.ifc`, același proiect ca IFC 4.3 pentru alte programe (vedeți [Export și import IFC](topic:ifc)). Fiecare fișier îl menționează pe celălalt, iar IFC mai conține și o copie comprimată a proiectului, astfel încât un IFC trimis singur se deschide în continuare complet editabil.

- **În Studio** ambele fișiere sunt scrise unul lângă altul, în același loc.
- **În Chrome și Edge** la prima salvare se cere un dosar, iar ambele fișiere sunt scrise în el; salvările următoare merg în același dosar. Renunțați la întrebarea despre dosar pentru a descărca ambele fișiere.
- **În celelalte browsere** ambele fișiere se descarcă, întâi fișierul de proiect.

La deschiderea oricăruia dintre fișiere, CivilCraft caută celălalt. Deschideți ambele împreună (sau trageți ambele), ori deschideți unul singur: în Studio, celălalt este găsit în același dosar; într-un browser, CivilCraft vă cere să îl adăugați sau să continuați cu cel pe care îl aveți. Dacă IFC-ul a fost modificat de alt program după ce CivilCraft l-a salvat, ori dacă un fișier este mai vechi decât celălalt, proiectul se deschide din cel mai nou model, iar panoul **Probleme** explică ce s-a întâmplat, cu **Salvare acum** (scrie din nou ambele fișiere) și **Afișare geometrie IFC ca referință**. Un IFC singur, modificat de alt program, se deschide din copia sa de proiect cu ceea ce încă se potrivește: aliniamentele modificate își iau geometria din el, obiectele șterse sunt lăsate deoparte, iar restul modificărilor sunt listate, nu preluate. Un fișier de proiect dinainte de versiunea 0.7.1 se deschide ca până acum.

Fișierul de proiect păstrează:

- fiecare punct (număr, coordonate, cotă, descriere) și numele fișierului de puncte din care provin
- setările suprafeței: alegerile de grup, liniile de rupere desenate, limita, cea mai lungă margine exterioară și un TIN citit dintr-un LandXML
- setările de afișare
- aliniamentele cu punctele lor de intersecție (PI), razele și kilometrajul de start, profilele de proiect (PVI și lungimile curbelor) și setările coridorului
- platformele și rețeaua de conducte cu regulile ei

Nu păstrează istoricul anulărilor. Suprafețele, curbele de nivel, liniile de racordare cu terenul și volumele nu sunt stocate; ele sunt reconstruite din datele salvate la deschiderea proiectului. Un fișier de proiect dintr-o versiune mai nouă de CivilCraft este refuzat, cu un mesaj care îi indică versiunea.

## Ce exportă

| Buton | Fișier | Conținut |
|---|---|---|
| {{ui:LandXML}} | `<nume>.xml` | LandXML 1.2: puncte, terenul existent (și suprafața amenajată, dacă există) ca suprafețe TIN, aliniamente, profiluri ale terenului și de proiect, rețeaua de conducte |
| {{ui:DXF}} | `<nume>.dxf` | Desen R12 DXF al liniilor din plan așa cum sunt afișate, pe straturi denumite |
| {{ui:DWG}} | `<nume>.dwg` | Aceleași linii ca desen DWG, în formatul ales (de la 2000 la 2018) |
| {{ui:PDF}} | `<nume>.pdf` | Trasare vectorială a planului pe o foaie, la o scară aleasă |
| {{ui:GLB}} sau {{ui:OBJ}} (pe bara vizualizării 3D) | `<nume>-3d.glb`, `<nume>-3d.obj` | Ceea ce arată vizualizarea 3D ca model 3D: metri, Y în sus, scară reală, în jurul unei origini locale înregistrate |

Ce lasă fiecare la o parte: [LandXML de schimb](topic:landxml), [Exportarea planului în DXF](topic:dxf-export) (și DWG), [Trasarea planului în PDF](topic:plot-pdf), [Exportarea amplasamentului în 3D](topic:export-3d).

## Unde ajung fișierele

Fișierele salvate și exportate ajung unde le pune browserul descărcările, de obicei în dosarul Descărcări. Pentru a alege un dosar de fiecare dată:

:::chromium
Deschideți **Setări** ale browserului, apoi **Descărcări**, și activați **Întreabă unde să salvezi fiecare fișier înainte de descărcare**.
:::

:::firefox
Deschideți **Setări**, apoi **General**, și la **Fișiere și aplicații** alegeți **Întreabă întotdeauna unde să salvați fișierele**.
:::

:::safari
Deschideți **Safari > Setări > General** și setați **Locația descărcărilor** la **Întreabă la fiecare descărcare**.
:::

Dacă salvați de două ori cu același nume, browserul poate adăuga un număr la al doilea fișier, de exemplu `Site (1).civilcraft.json`. Deschideți data viitoare cel mai nou.

## Online și offline

CivilCraft funcționează doar pe calculatorul dumneavoastră în ambele cazuri: deschiderea citește fișierul în browser, salvarea îl descarcă. Pentru a deschide CivilCraft fără nicio conexiune, salvați-l mai întâi pentru lucru offline:

1. Cât timp sunteți online, faceți clic pe {{ui:Salvare pentru offline}} din bara de sus a aplicației.
2. Butonul numără în sus („Se salvează 12 din 30”) și apoi afișează {{ui:Pregătit pentru offline}}. CivilCraft este mic (circa 0.6 MB), deci durează puțin. Copia salvată include acest ajutor și site-ul de probă.
3. Fără conexiune, deschideți aceeași adresă (sau un marcaj al ei). Totul funcționează, inclusiv {{ui:Deschidere site de probă}}.

Celelalte stări ale butonului:

- {{ui:Nu s-a putut salva}}: unele fișiere nu s-au descărcat. Verificați conexiunea și faceți clic din nou pentru a încerca.
- {{ui:Modul offline nu este disponibil}}: această fereastră de browser nu poate păstra o copie offline (ferestrele private și unele calculatoare administrate o blochează). Folosiți o fereastră obișnuită.

Faceți clic pe {{ui:Pregătit pentru offline}} pentru a vedea când a fost salvată copia, cu două opțiuni: {{ui:Salvare din nou (obținere a celei mai noi versiuni)}} și {{ui:Eliminare a copiei offline}}. Salvați din nou înainte de o vizită pe teren, astfel încât copia să corespundă celei mai noi versiuni. Mai multe în [Offline](common:offline).

:::offline
Sunteți offline acum. Dacă CivilCraft a fost salvat pentru lucru offline, totul funcționează, inclusiv site-ul de probă. Dacă nu, puteți continua să lucrați în această filă, dar nu o reîncărcați până nu reveniți online; fără o copie salvată, {{ui:Deschidere site de probă}} eșuează cu mesajul „Site-ul de probă nu a putut fi încărcat”.
:::

:::tip
Pentru lucru pe teren, salvați CivilCraft pentru lucru offline și aduceți fișierele de puncte pe chiar laptopul. Proiectele și exporturile se salvează ca descărcări și fără conexiune, astfel încât puteți importa măsurătorile unei zile, verifica suprafața și salva proiectul pe șantier.
:::

Salvarea în cloud nu este disponibilă încă, iar versiunile pentru desktop nu au apărut încă. Deocamdată, fișierele pe care le salvați sunt singura copie: păstrați-le undeva unde există copii de siguranță.

## Programe suplimentare folosite de un fișier

Când salvați un proiect care conține date dintr-un program suplimentar (bifele de reglementări de construcție sau o sursă de adresă către amplasament), fișierul înregistrează ce programe suplimentare și ce versiuni. Dacă îl deschideți pe un calculator care nu le are, o bară deasupra planului vă spune și vă oferă să le adăugați din lista contului dumneavoastră. Înregistrarea este doar o notă: fișierul se deschide oricum.

## Anularea din Studio

În CadCraft Studio, fiecare pas terminat în CivilCraft este transmis către Studio, astfel încât anularea la nivel de proiect din Studio poate retrage ultimul pas din toate aplicațiile. Studio anulează un pas doar când stiva de anulare a CivilCraft este exact așa cum a lăsat-o acel pas; după ce deschideți alt fișier, aceasta sare peste această fereastră.

## Închiderea cu modificări nesalvate

Când proiectul are modificări nesalvate și închideți fila, reîncărcați pagina sau părăsiți pagina, browserul întreabă dacă doriți să plecați. Textul și aspectul acestei întrebări aparțin browserului și nu pot fi schimbate de CivilCraft. {{ui:Nou}} și deschiderea unui proiect sau a unui fișier LandXML cer confirmare în caseta proprie a CivilCraft, **Modificări nesalvate**, cu {{ui:Anulare}}, {{ui:Nu salva}} și {{ui:Salvare copie}}.
