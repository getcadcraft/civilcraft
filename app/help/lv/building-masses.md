---
title: Ēku masu zīmēšana objektā
summary: Zīmējiet ēku masu zemesgabalā, piešķiriet tai stāvus un stāva augstumu, skatiet tās bruto grīdas platību, izvēlieties, kā tā novietojas uz slīpa terēna, bīdiet un velciet tās augstumu 3D, un nosūtiet uz BimCraft vai saglabājiet kā IFC failu.
keywords: masa, masu modelēšana, ēkas masa, tilpums, apbūves laukums, stāvi, stāva augstums, bruto grīdas platība, GFA, slīpums, podijs, izrakums un uzbērums, stumt vilkt, 3D, objekta izpēte, agrīnais projektēšanas posms, IFC, izstrādāt, BimCraft, A-MASS
from: e5a67c16
---

Ēku masa ir apbūves laukums, stāvu skaits un stāva augstums: agrīnais jautājums „cik daudz ēkas šeit ietilpst un ko tas dara ar terēnu”. Masas atrodas plānā ar savu nosaukumu, stāvu skaitu un bruto grīdas platību, iekļaujas PDF izdrukā un DWG un DXF eksportos slāņos `A-MASS` un `A-MASS-TEXT`, un tiek saglabātas projekta failā.

## Zīmēt masu

1. Sadaļā **Rekvizīti**, zem **Ēku masas**, noklikšķiniet uz **Zīmēt masu**. (Tā ir arī rīkjoslas izvēlnē **Vairāk** blakus **Virsma**.)
2. Noklikšķiniet apbūves laukuma stūrus. Klikšķis netālu no zemesgabala stūra vai uzmērījuma punkta ņem šī punkta precīzo vietu.
3. Noklikšķiniet pirmo stūri vēlreiz vai nospiediet {{key:Enter}}, lai pabeigtu. {{key:Backspace}} atņem pēdējo stūri; {{key:Esc}} aptur.

Jaunai masai ir trīs stāvi un 12 ft (3.6 m) stāva augstums, un tā pieder tam zemesgabalam, kurā iekrīt tās vidus.

## Stāvi, augstums un platība

Noklikšķiniet uz masas, lai mainītu tās **Nosaukums**, **Izmantošana**, **Stāvi**, **Stāva augstums** un **Zemesgabals**. **Augstums** ir stāvi reizināti ar stāva augstumu: ierakstiet augstumu, un stāvu skaits kļūst par tuvāko veselo stāvu skaitu (nekad mazāk par vienu). **Apbūves laukums** un **Bruto grīdas platība** (apbūves laukums reizināts ar stāviem) tiek aprēķināti jums.

## Uz slīpa terēna

Terēnu zem masas nolasa no virsmas: esošais terēns vai izlīdzinātais terēns, ja izvēlējāties **Plānotais terēns (izlīdzināts)**. **Uz slīpa terēna** nosaka, kur atrodas pirmais stāvs:

- **Pakāpjveida**: vidējā terēna augstumā zem apbūves laukuma. Zemo pusi aizbēr līdz tam, augsto pusi izrok, un abas gandrīz līdzsvarojas.
- **Podijs**: augstākajā terēnā. Cieta pamatne aizpilda zemo pusi.
- **Izrakums**: zemākajā terēnā. Augstā puse tiek izrakta kalnā.

Rekvizīti rāda terēna diapazonu zem masas, **Pirmā stāva līmeni** un uzbēruma un izrakuma tilpumu starp terēnu un šo līmeni. Apbūves laukuma vieta, kas atrodas ārpus virsmas, tiek izlaista, un Rekvizīti saka, cik tādu ir.

## 3D skatā

Masas tiek zīmētas 3D objekta skatā ar līniju ap katru stāvu un to nosaukumiem virs jumta. **Rādīt** ietver izvēles rūtiņu **Ēku masas**. Noklikšķiniet uz vienas, lai to atlasītu. Ja masa ir atlasīta:

- velciet tās jumtu uz augšu vai uz leju, lai to bīdītu vai vilktu pa vienam stāvam, vai nospiediet {{key:PageUp}} un {{key:PageDown}};
- visa pārvietošana ir viens atsaukšanas solis.

Ielas skats **Braukšana** arī redz masas, un **Saule** met to ēnas uz terēna.

## Nosūtīt tālāk

- **Masas kā IFC** saglabā katru masu kā IFC4 failu: objektu, ēku ar tās stāviem un masu kā ēkas elementu ar tās skaitļiem īpašību kopā `CadCraft_SiteMass`. Ja projektam iestatīta koordinātu sistēma, fails tiek novietots kartē un satur objekta platuma un garuma grādus; bez tās tas neko nesaka par atrašanās vietu.
- **Izstrādāt BimCraft** atver BimCraft jaunā cilnē ar masām. Tur, izvēloties masu, tiek parādīti tās skaitļi un **Izstrādāt šo masu**, kas no apbūves laukuma vienā atsaukšanas solī izveido sienas katrā līmenī un grīdu zem ēkas. Nekas netiek augšupielādēts: fails pārvietojas starp šīs pārlūkprogrammas divām cilnēm.

Skatiet arī **Zonējuma ierobežojumi** un **Saules stundas**.
