---
title: Ainavu griezumi un publicējamais komplekts
summary: Griezuma līnijas, kas šķeļ esošo un projektēto zemi, sienas ar pamatiem, bruģējuma un stādījumu laukumu konstrukcijas, kāpnes un augi pieaugušā izmērā savās lapās; viens publicējamais komplekts ar lapu sarakstu, PDF un DWG katrai lapai.
keywords: griezums, šķērsgriezums, fasāde, griezuma marķieris, griezuma līnija, publicēšana, lapu komplekts, lapu saraksts, rasējumu reģistrs, PDF komplekts, DWG katrai lapai
from: 7271ac50
---

{{ui:Levels}} › {{ui:Section line}}: noklikšķiniet sākuma un beigu punktā. Griezumi tiek nosaukti A, B, C… (nosaukumu var mainīt rekvizītos). Griezums gar savu līniju zīmē:

- esošo zemi (punktētu) un projektēto zemi;
- sienas ar to pamatiem tajās vietās, kur līnija tās šķērso;
- bruģējuma un ceļu konstrukcijas, kā arī stādījumu laukumu mulču un augsnes slāni (pēc apgriešanas), kas karājas zem gatavās virsmas;
- kāpnes profilā;
- augus, kas atrodas noteiktā attālumā no līnijas, kā siluetus pieaugušā izmērā.

Rekvizīti nosaka šo attālumu un vertikālo pārspīlējumu. Lapu dialogā **Griezumi** ievieto tos atsevišķās lapās, līdz četriem uz lapas, katru standarta mērogā, kas der.

## Publicējamais komplekts

{{ui:Publish set (.zip)}} lapu dialogā vienā .zip failā izveido:

- vienu PDF, kas atveras ar **lapu sarakstu**, un pēc tam visām ainavu lapām, numurētām L-1, L-2… (stādīšana, reljefs, laistīšana, detaļas, griezumi, darblapas);
- **DWG katrai plāna lapai** ar šīs lapas slāņiem (nosaukumi `L-*` saglabāti) un DWG katram griezuma rasējumam.

Katra griezuma līnija plānā norāda, uz kuras lapas tā atrodas (`A / L-5`); numurs katru reizi tiek aprēķināts no komplekta, tāpēc griezumu pievienošana, noņemšana vai pārdēvēšana maina to numerāciju.
