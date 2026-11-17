---
title: Plotimi i planimetrisë në PDF
summary: Plotoni gjithçka ose pamjen aktuale në një PDF vektorial në një fletë standarde, me shkallë inxhinierike ose metrike, me ngjyra shtresash ose të zeza.
keywords: plotim, printim, pdf, fletë, shkallë, madhësia e letrës, fletë planimetrie, publikim, bllok titulli, shigjeta e veriut, shtyllë shkalle
from: 9af396ca
---

{{ui:PDF}} plotoi planimetrinë në një PDF vektorial në një fletë, me një shirit titulli, një shigjetë veriu dhe një shtyllë shkalle. PDF-ja bëhet në shfletues dhe shkarkohet; nuk kalon përmes dialogut të printimit të shfletuesit.

## Plotimi

1. Përgatitni planimetrinë te **Shfaqja**: sipërfaqja që shfaqet, intervali i izoipsave dhe çfarë është e ndezur. Plotimi ndjek këto cilësime.
2. Nëse dëshironi vetëm një pjesë të sitit, zmadhoni dhe lëvizni planimetrinë drejt saj.
3. Klikoni {{ui:PDF}} te grupi **Eksporto**, ose shtypni {{key:Mod+P}}.
   Hapet dialogu **Plotimi i planimetrisë në PDF**.
4. Zgjidhni **Zonën**: {{ui:Gjithçka}} ose {{ui:Ç’është në ekran}}.
5. Zgjidhni **Letrën**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 ose A1. Një projekt në këmbë fillon me Tabloid, një projekt në metra me A3. Fletët janë gjithmonë horizontale.
6. Zgjidhni **Shkallën**. Lista shënon me "(futet)" shkallën më të madhe që futet dhe e zgjedh atë.
   - Këmbë: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Metra: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Zgjidhni **Bojën**: {{ui:Ngjyra e shtresave}} ose {{ui:E zezë}}.
8. Lexoni rreshtin nën zgjedhjet. Ai jep madhësinë e sipërfaqes në letër dhe madhësinë e fletës, për shembull "Sipërfaqja është 297 × 222 mm në 1" = 40' në një fletë 432 × 279 mm (horizontale)."
9. Klikoni {{ui:Shkarko PDF}}.
   Shfletuesi shkarkon `<name>.pdf`. Shiriti i statusit thotë "U plotua <name>.pdf në 1" = 40'."

Nëse sipërfaqja është më e madhe se fleta me shkallën që zgjodhët, plotimi qendrohet dhe skajet priten. Zgjidhni shkallën e shënuar "(futet)" ose një fletë më të madhe.

## Çfarë është në fletë

- Planimetria, e qendërzuar në zonën e vizatimit, si vektorë të vërtetë: izoipsët, etiketat, aksët me stacionim, korridoret, platformat dhe vijat e prerjes me terrenin, tubat, pikat.
- Trashësitë e vijave sipas shtresës: aksët, platformat dhe tubat më të trashë; trekëndëshat dhe izoipsët e vogla më të hollë.
- Një shirit titulli përgjatë fundit me **Emrin** e projektit, një shënim të shkallës, të intervalit të izoipsave dhe të sipërfaqes që përdoret (ekzistuese ose e niveluar), dhe datën dhe versionin e ndërtimit në të djathtë.
- Një shigjetë veriu në këndin e sipërm djathtas (veriu i planit është lart) dhe një shtyllë shkalle në shiritin e titullit.
- Shtresat e hartës që shfaqen nën plan (një foto, pllaka harte ose një shërbim harte), kur është shënuar **Shtresat e hartës nën plan**: vizatohen si një imazh i vetëm i gjithë zonës së vizatimit me 150 pika për inç, nën vijat, dhe atribuimi i hartës shkon në shiritin e titullit. CivilCraft pret deri në 8 sekonda për imazhet e hartës që ende po vijnë; nëse disa mungojnë akoma, shiriti i statusit e thotë.

Teksti përdor Helvetica të integruar të PDF-së. Karakteret jashtë grupit Evropian Perëndimor (Windows-1252) printohen si "?", dhe mesazhi i statusit i numëron ato.

## Ç’nuk plotohet

- Brezat e kotës.
- Pamja e profilit. Plotimi i profileve nuk është ende i disponueshëm.
- Më shumë se një fletë (për një aks, përdorni [fletët e planit dhe profilit](topic:plan-profile-sheets)), dritare pamjeje, një bllok titulli të personalizuar ose fletë vertikale.

:::note
Dialogu thotë se shigjetat e pjerrësisë janë vetëm në ekran. Në këtë version, shigjetat e pjerrësisë që janë të ndezura te **Shfaqja** plotohen (dhe eksportohen në DXF). Fikini para plotimit nëse nuk i dëshironi.
:::

## Printimi në letër

Hapni PDF-në e shkarkuar në çdo shikues PDF dhe printojeni në 100% (madhësi reale), që shkalla të mbetet e saktë. "Përshtat në faqe" e ndryshon shkallën.
