---
title: Lăsarea unui asistent AI să lucreze cu amplasamentul
summary: Activați asistenții în Setări, ca un asistent de pe calculator să poată citi amplasamentul deschis (puncte, suprafețe, volume, profiluri, parcele), să adauge puncte de releveu, să salveze și să exporte LandXML sau DWG, prin CadCraft Studio. Dezactivat până la activarea lui.
keywords: ai, asistent, mcp, script, automatizare, studio, puncte, altitudine, stație, decalaj, ax, volum, debleu, rambleu, profil, parcelă, landxml, dwg, usd, dosare, permisiuni, deconectare, activitate
from: d0356582
---

## Ce veți învăța

Cum se permite unui asistent AI (orice asistent care vorbește MCP) să lucreze cu amplasamentul deschis, ce poate și ce nu poate face și cum se oprește.

## Ce poate face un asistent în CivilCraft

| Cere | Primește | Necesită |
|---|---|---|
| Amplasamentul | Numele, unitățile, sistemul de coordonate, grupurile de puncte, axele, suprafețele, platformele, parcelele și conductele | Citire |
| Puncte de releveu | Număr, est, nord, altitudine și descriere, pe grup, după descriere sau în interiorul unei casete | Citire |
| Altitudini ale suprafeței | Terenul natural (sau terenul amenajat) în orice puncte pe care le numește | Citire |
| Stații și decalaje | Stația și decalajul punctelor de-a lungul unui ax, sau coordonatele și altitudinea terenului pentru stații | Citire |
| Un profil | Altitudinile terenului, ale profilului de proiectare și ale suprafeței amenajate de-a lungul unui ax, la fiecare câteva ft sau m | Citire |
| Debleu și rambleu | Volumele dintre terenul natural și suprafața amenajată (și fiecare platformă și coridor), sau între teren și un nivel | Citire |
| Parcele | Colțuri, suprafață (în acri sau hectare), perimetru și descrierea cadastrală | Citire |
| O selecție | Punctele numite sunt selectate pe plan, ca și cum le-ați fi ales | Editare |
| Puncte noi de releveu | Puncte adăugate cu numerele date sau cu următoarele libere. Fiecare apel este un pas pe care îl puteți anula | Editare |
| Salvare | {{ui:Salvare}} propriu CivilCraft | Salvare |
| LandXML sau DWG | Aceleași fișiere ca butoanele {{ui:LandXML}} și {{ui:DWG}} | Export |
| Amplasamentul în 3D | OpenUSD (.usdz, .usda sau .usdc) al terenului, suprafeței amenajate, platformelor și conductelor, așa cum îl exportă vederea 3D | Export |
| Plante și lista de plantare | Plante găsite în lista de plante după orice nume și numărul din lista de plantare | Citire |
| Plantare și amenajare | Plante, un strat sau un gard viu plasat, ori o platformă, o bermă, un șanț sau o zonă de amenajare adăugate, fiecare câte un pas pe care îl puteți anula, cu debleul și rambleul său | Editare |
| Verificare de irigare | Debitul fiecărei zone, presiunea necesară la vana sa și la alimentare, cea mai defavorabilă înălțime, duratele de funcționare, problemele și lista de materiale, ca instrument de calcul pe care un proiectant de irigații îl verifică | Citire |

Lucrează cu amplasamentul deschis. În Studio poate salva și exporta și în dosare pe care le alegeți (mai jos); fără dosar, fișierele sale se descarcă așa cum se descarcă cele ale butoanelor.

## Activarea

Asistenții ajung la CivilCraft prin CadCraft Studio de pe calculator; browserul obișnuit nu are acces.

1. Deschideți {{ui:Setări}} și alegeți fila **CivilCraft**.
2. Sub **Asistenți**, bifați **Permite asistenților AI și scripturilor să folosească CivilCraft**.
3. **Citire** este bifată implicit. Bifați **Editare**, **Salvare** sau **Export** doar când asistentul are nevoie de ele.
4. Pentru a-i permite să salveze și să exporte într-un dosar, alegeți {{ui:Adăugare dosar…}} sub **Dosare pe care le poate folosi** și selectați dosarul în caseta de dialog din Studio. {{ui:Eliminare}} îl retrage imediat; orice altă cale este refuzată.
5. Conectați asistentul în Studio (Studio arată adresa și setările de introdus în el).

## Cât timp un asistent este conectat

O notă din partea de sus a panoului din dreapta spune ce asistent este conectat și ce poate face. Faceți clic pe {{ui:Deconectare}} pentru a încheia imediat sesiunea sa; trebuie să se reconecteze ca să continue.

**Activitatea**, sub **Asistenți** din Setări, listează fiecare apel făcut de asistent, cele mai noi primele, cu indicația dacă a reușit.

:::tip
Întrebați în cuvinte simple, de exemplu „ce altitudine are terenul la fiecare 50 ft de-a lungul Main Street?”, „cât debleu și rambleu au nevoie platformele?” sau „adaugă un punct de control la aceste coordonate”. Asistentul citește amplasamentul și răspunde sau face modificarea ca un singur pas pe care îl puteți anula.
:::

## Fără să deschideți CivilCraft

Serverul de fișiere CadCraft pentru asistenți (`npx @getcadcraft/mcp`) și linia de comandă `cadcraft` deschid proiecte CivilCraft salvate (`.civilcraft.json`) și fișiere de puncte cu codul propriu al CivilCraft, fără fereastră: aceleași instrumente de citire, adăugarea de puncte, salvarea proiectului, LandXML și amplasamentul în 3D ca OpenUSD. `cadcraft convert site.civilcraft.json site.xml` scrie LandXML din linia de comandă. Deschiderea LandXML, exportul DWG și instrumentele spațiului de lucru Landscape au nevoie încă de fereastra CivilCraft.

## Oprirea

Debifați **Permite asistenților AI și scripturilor să folosească CivilCraft**. Fiecare asistent este deconectat imediat, iar setarea este păstrată pentru data viitoare.

## Vezi și

- [Rețete pentru asistenții AI](common:assistants-recipes): exemple lucrate, fiecare cu instrumentele pe care le apelează.
- [Trasarea unui ax orizontal](topic:alignment)
- [Construirea și rafinarea suprafeței](topic:build-surface)
- [Selectarea, copierea și lipirea punctelor de releveu](topic:copy-paste-points)
- [Setările CivilCraft](topic:settings)
