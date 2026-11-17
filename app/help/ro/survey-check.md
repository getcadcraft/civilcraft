---
title: Verificarea unui desen topografic la import
summary: Citiți cotele scrise ca text sau în atribute de bloc ca puncte topografice și verificați un DWG sau DXF pentru unități greșite, lipsa unui sistem de coordonate, o origine îndepărtată, curbe de nivel plate, cote ciudate și puncte duplicate, înainte de a construi terenul din el.
keywords: verificare topografie, verificare import, cote topografice, cote punctuale, cote ca text, atribute, unități, sistem de coordonate, departe de origine, curbe de nivel la zero, valori aberante, puncte duplicate, probleme, arhitect peisagist, desen topografic
from: d46acd24
---

Un desen topografic poate arăta corect și totuși să fie greșit pentru un teren: unitățile lui pot fi ghicite, curbele de nivel pot sta plate la cota 0 sau cotele pot fi scrise ca text care nu este deloc geometrie. Secțiunea **Niveluri topografice și verificare** din caseta de dialog {{ui:Linii}} (vezi [Deschiderea unui DWG sau DXF ca linii](topic:open-dwg-dxf)) citește aceste cote și vă spune ce pare greșit înainte ca ceva să fie adăugat.

## Cote scrise ca text sau în atribute

Multe desene topografice dau o cotă punctuală ca un text mic lângă o cruce, de exemplu `104.37` sau `EL 104.37`, ori ca atribut al unui bloc de punct. Acestea nu sunt linii, deci cititorul de linii le ignoră. Secțiunea listează câte a găsit și vă lasă să le luați ca **puncte topografice**:

1. Bifați **Luați … cote ca puncte topografice**. Nu sunt bifate inițial, pentru că nu fiecare număr dintr-un desen este o înălțime.
2. Textul este citit când este o cotă de sine stătătoare: un număr cu parte zecimală (`104.37`, `+104,37`, `-3.50`), sau un număr după `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` ori `LEVEL`, cu opțional `m`, `ft` sau `'` după el. Un număr întreg singur (`12`) este citit ca număr de lot sau de foaie, nu ca cotă; textul precum `GATE 3` sau o dată nu este citit niciodată. Codurile de formatare a textului sunt ignorate.
3. Pentru atributele de bloc, alegeți **Atributul blocului care conține cota**. CivilCraft găsește singur o etichetă numită ELEV, Z, LEVEL, RL sau similară; alegeți alta din listă dacă desenul folosește una proprie. Alegerea este reținută pentru acel nume de fișier pe acest calculator, deci deschiderea din nou pornește de la aceeași etichetă. O etichetă aleasă ia și numerele întregi ca cote.
4. Faceți clic pe {{ui:Adăugare}}. Punctele sunt numerotate după cel mai mare număr din proiect, fiecare punct este descris cu stratul său (sau blocul său), iar înălțimile sunt convertite în unitățile proiectului ca restul desenului. Totul este un singur pas: {{key:Mod+Z}} înlătură punctele.

Textul se află în propriul punct de inserare (sau în punctul de aliniere, dacă are unul). Textul din blocuri nu este citit, iar desenul nu este modificat niciodată.

## Verificarea

Verificarea se aplică la ceea ce urmează să aduceți și enumeră ce găsește, câte un rând pentru fiecare tip de problemă:

| Ce afișează | Ce înseamnă |
|---|---|
| **Unități nespecificate** | Desenul nu spune care sunt unitățile lui, deci numerele sale sunt citite ca unitățile proiectului. Verificați o distanță pe care o cunoașteți. |
| **Unități convertite** | Unitățile desenului diferă de cele ale proiectului și sunt scalate (o notă, nu o defecțiune). |
| **Datele se întind pe … km** sau **… m** | Întinderea este mai mare de 200 km sau mai mică de o jumătate de metru, ceea ce înseamnă de obicei unitatea greșită (milimetri citiți ca metri sau invers). |
| **Fără sistem de coordonate** | Proiectul nu are niciunul. Este un avertisment când datele se află departe de zero, cum fac coordonatele de stat sau de rețea națională. Vezi [Sisteme de coordonate](topic:coordinate-systems). |
| **Departe de origine** | Datele se află la mai mult de 100 km de zero. Departe de zero, vizualizările 3D și exporturile pierd precizie și se clatină. |
| **Stratul curbelor de nivel … nu are cotă** | Un strat numit ca al curbelor de nivel (TOPO, CONT, CNTR, CONTOUR) conține linii la înălțimea 0, deci un teren construit din ele ar fi plat. |
| **Cote egale cu 0** | Unele cote sunt 0 deși cota tipică este departe de ea: probabil înălțimi lipsă. |
| **Cote departe de restul** | Câteva cote se află mult în afara celorlalte (verificate față de mijlocul tuturor cotelor, deci un amplasament abrupt cu o plajă largă nu este semnalat), sau peste 9,000 m ori sub -11,000 m. |
| **Puncte peste alt punct** | Două puncte în același loc, cu aceeași cotă sau cu cote diferite. |

După ce faceți clic pe {{ui:Adăugare}}, aceleași rânduri merg la **Probleme**, câte unul pentru fiecare tip, cu numele fișierului, ca să vă întoarceți la ele. Verificarea evaluează desenul; nu modifică nimic în el și nu vă împiedică să îl folosiți.

:::tip
Când verificarea spune că curbele de nivel sunt plate la 0 și există cote scrise ca text, luați cotele ca puncte topografice: de multe ori poartă înălțimile reale pe care le lipsesc liniilor curbelor de nivel.
:::

## Ce nu este verificat

Verificarea nu compară desenul cu o a doua topografie și nu poate spune în ce sistem de coordonate se află desenul: vă spune doar că niciunul nu este setat.
