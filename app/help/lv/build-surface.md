---
title: Virsmas veidošana un precizēšana
summary: Kā CivilCraft triangulē esošo terēnu un kā to veidot ar lūzumlīniju grupām, zīmētām lūzumlīnijām, ārējo robežu un garāko ārējo malu.
keywords: tin, virsma, triangulācija, lūzumlīnija, robeža, esošais terēns, eg, izveidot virsmu, delonē, trijstūri, maksimālā mala, ārējā robeža
from: b9eea3f3
---

CivilCraft katram projektam ir viena esošā terēna virsma. Tā ir TIN (triangulēts neregulārs tīkls), kas veidots no jūsu punktiem, un tā pārbūvējas automātiski katru reizi, kad mainās kāda ievade. Nav „pārbūves” komandas un nav novecojušas virsmas.

## Kas ieiet virsmā

- Katrs punkts ar augstumu grupā, kas iestatīta uz {{ui:Punkti}}.
- Katra grupa, kas iestatīta uz {{ui:Lūzumlīnija}}, savienota punktu numuru secībā.
- Katra lūzumlīnija, ko zīmējat ar {{ui:Lūzumlīnija}} rīku.
- Ārējā robeža, ja to zīmējat.
- Iestatījums **Garākā ārējā mala**.

Trijstūri nekad nešķērso lūzumlīniju: virsma tiek piespiesta sekot tai un pēc tam padarīta pēc iespējas vienmērīgāka ap to (visur citur — Delonē).

## Pārvērst kodētas līnijas lūzumlīnijās

1. Kreisajā panelī zem **Punkti** atrodiet grupu (piemēram, FL).
2. Iestatiet tās **Virsma** izvēli uz {{ui:Lūzumlīnija}}.
   Virsma pārbūvējas, līnija tiek zīmēta oranžā krāsā (ja zem **Attēlojums** ieslēgts {{ui:Lūzumlīnijas}}), un **Lūzumlīnijas** virsmas datos palielinās par vienu.
3. Pārbaudiet līniju plānā. Tai jāiet no punkta uz punktu tajā secībā, kādā līnija tika mērīta. Ja tā zigzagē, grupā ir vairāk nekā viena līnija vai punkti nav sanumurēti secīgi: iestatiet grupu atpakaļ uz {{ui:Punkti}} un zīmējiet līnijas ar roku (nākamajā sadaļā).

## Zīmēt lūzumlīniju caur punktiem

1. Nospiediet {{key:B}} vai noklikšķiniet uz {{ui:Lūzumlīnija}} grupā **Virsma**.
   Palīgteksts saka: „Lūzumlīnija: noklikšķiniet uzmērījuma punktus secībā (tā ņem to augstumus). Enter pabeidz.”
2. Pārvietojiet rādītāju tuvu punktam. Mazs oranžs kvadrāts atzīmē punktu, ko tas ņems.
3. Noklikšķiniet līnijas punktus viens pēc otra. Katrs klikšķis nosauc punktu un tā augstumu statusa joslā.
4. Nospiediet {{key:Enter}}, lai pabeigtu.
   Statusa josla saka: „Lūzumlīnija 1 pievienota; virsma tika pārbūvēta.”

Klikšķiem jānokrīt uz uzmērījuma punkta, kuram ir augstums; klikšķis citur tiek noraidīts ar: „Noklikšķiniet uz uzmērījuma punkta ar augstumu: lūzumlīnija ņem punktu augstumus.” {{key:Backspace}} noņem pēdējo punktu; {{key:Esc}} atceļ visu līniju.

:::warning
Pabeidziet ar {{key:Enter}}. Dubultklikšķis arī pabeidz, bet šajā versijā noņem punktu, uz kura veicāt dubultklikšķi. Noklikšķiniet uz pēdējā punkta vienreiz un pēc tam nospiediet {{key:Enter}}.
:::

Lai uzreiz noņemtu visas zīmētās lūzumlīnijas, noklikšķiniet uz {{ui:Noņemt zīmētās lūzumlīnijas}} sadaļā **Virsma**. Lai noņemtu tikai pēdējo, izmantojiet {{key:Mod+Z}}. Zīmētās lūzumlīnijas vēl nevar atlasīt vai rediģēt pa vienai.

## Zīmēt ārējo robežu

Robeža apgriež virsmu līdz apgabalam, kam uzticaties, piemēram, uzmērījuma robežām, lai garie trijstūri pāri neuzmērītiem stūriem pazūd.

1. Nospiediet {{key:O}} vai noklikšķiniet uz {{ui:Robeža}}.
2. Noklikšķiniet stūrus secīgi apkārt apgabalam. Punktētā līnija rāda formu.
3. Nospiediet {{key:Enter}}.
   Statusa josla saka: „Robeža iestatīta; trijstūri ārpus tās ir noņemti.” **Robeža** virsmas datos saka „Jā” un stūru skaitu.

Ko vajag zināt:

- Ir viena robeža. Zīmējot citu, tā aizstājas. {{ui:Noņemt robežu}} to noņem.
- Robeža var tikai atņemt: robeža, kas sniedzas pāri punktiem, tiek apgriezta līdz to kontūrai, ar piezīmi: „Robeža sniedzas pāri punktiem; tā tika apgriezta līdz to kontūrai.”
- Tās stūri ņem augstumus no virsmas, tāpēc mala precīzi seko terēnam.
- Slēptās (iekšējās) robežas vēl nav pieejamas.

## Apgriezt garos ārējos trijstūrus

Bez robežas virsma aizpilda visu punktu kontūru, ieskaitot garus, šaurus trijstūrus pāri ieliektām malām.

1. Virsmā ierakstiet garumu laukā **Garākā ārējā mala** un nospiediet {{key:Enter}}. Sāciet ar aptuveni divām vai trīs reizēm jūsu tipiskā mērījumu soļa garumu.
2. Ārējie trijstūri, kuru ārējā mala ir garāka par to, tiek noņemti, virzoties iekšup, līdz katra ārējā mala ir pietiekami īsa. Mala, kas ir lūzumlīnija, nekad netiek noņemta.
3. Ierakstiet 0, lai atkal paturētu visus trijstūrus.

## Lasīt virsmas atskaiti

Zem virsmas datiem kastē uzskaitīts, ko veidotājs darīja. Ar ohras krāsas joslu kreisajā pusē tā ir informācija; ar sarkanu joslu tā satur kļūdu un virsmas nav.

| Ziņojums | Nozīme |
|---|---|
| „3 punkti atradās tajā pašā vietā kā cits un tika apvienoti ar to.” | Punkti, kas plānā ir tuvāk par 0.0001, kļuva par vienu virsotni (paturot pirmo). |
| „2 vietām ir divi dažādi augstumi …” | Punkti viens uz otra vai krustojošas lūzumlīnijas atšķiras augstumā. Lūzumlīnijas augstums uzvar, tad pirmais. |
| „1 lūzumlīnijas daļu nevarēja piespiest virsmā.” | Ļoti īsa vai gandrīz pārklājusies lūzumlīnijas daļa neiederējās; pārbaudiet šo vietu. |
| „Virsmai vajadzīgi vismaz trīs punkti ar augstumiem.” | Par maz punktu: pārbaudiet kolonnu secību un grupas. |
| „Visi punkti atrodas uz vienas līnijas: nav trijstūru.” | Punktiem nav platuma, piemēram, viena traversa līnija. |
| „Robeža nepārklājas ar punktiem.” | Robeža ir citur, bieži mērvienību vai koordinātu sajaukums. |
| „Robežas iekšpusē nav palicis neviens trijstūris.” | Robeža ir pārāk maza vai nepareizi novietota. |

## Virsma, nolasīta no LandXML

Atverot LandXML, tiek izmantota tā pirmā TIN virsma kā tāda: sadaļas virsraksts saka „Virsma (no LandXML)”, un **Garākā ārējā mala** ir pelēkota. Kamēr šī virsma tiek izmantota, lūzumlīniju grupas, zīmētās lūzumlīnijas un jauna robeža to nemaina. Lai veidotu virsmu no faila punktiem, noklikšķiniet uz {{ui:Pārbūvēt virsmu no punktiem}}. {{key:Mod+Z}} atgriež LandXML virsmu.

## Saistītie raksti

- [Lasīt horizontāles, augstumus un slīpumus](topic:contours).
- [Importēt uzmērījuma punktus](topic:import-points).
