---
title: Geodezinių taškų importas
summary: Atidarykite CSV ar teksto taškų failą, patikrinkite stulpelių tvarką dialoge Importuoti taškus, ištaisykite eilutes, kurių nepavyksta perskaityti, ir surūšiuokite taškus į grupes.
keywords: importuoti taškus, csv, txt, pnezd, penzd, taškų failas, geodezija, cogo taškai, taškų grupės, stulpeliai, šiaurė, rytai
from: ad33d88a
---

Taškų failas yra teksto failas, kuriame kiekvienoje eilutėje yra vienas taškas: taško numeris, šiaurė, rytai, aukštis ir aprašymas bet kokia tvarka, atskirti kableliais, tabuliacijos ženklais, kabliataškiais ar tarpais. CivilCraft jį nuskaito naršyklėje ir iš karto sukuria iš jo paviršių.

## Prieš pradedant

- Žinokite failo stulpelių tvarką, jei galite (PNEZD ir PENZD kompiuteriui atrodo vienodai).
- Žinokite jo vienetus. CivilCraft jų nekonvertuoja: kairiajame skydelyje nustatykite **Vienetai**, kad atitiktų failą (žr. [Vienetai, stotys ir skaičių formatai](topic:units-and-stations)).
- Koordinatės gali būti didelės (valstybinių plokštumų šiaurė ir rytai milijonais yra normalu).

## Importuokite failą

1. Įrankių juostoje spustelėkite {{ui:Atidaryti}} arba paspauskite {{key:Mod+O}} ir pasirinkite failą. Galite jį ir tempti ant plano.
   Atsidaro dialogas **Importuoti taškus** su failo pavadinimu, sąrašu **Stulpeliai**, nustatytu į {{ui:Aptikti}}, santraukos eilute ir pirmaisiais šešiais taškais.
2. Perskaitykite santraukos eilutę. Joje nurodoma, kiek taškų perskaityta, kokia stulpelių tvarka, kaip ta tvarka rasta ir kuo stulpeliai atskirti. Yra trys būdai, kaip randama tvarka:
   - "iš antraštės eilutės": pirmoji eilutė įvardija stulpelius (Taškas, Šiaurė, Rytai, Aukštis, Aprašymas arba X, Y, Z …). Tai saugiausias būdas.
   - "kaip pasirinkta": tvarką pasirinkote sąraše **Stulpeliai**.
   - "nuspėta pagal stulpelių skaičių ir taškų eilučių nustatymą (PNEZD) – patikrinkite, ar šiaurė ir rytai nesukeisti": antraštės nėra arba ji netinkama. Jei jūsų failai paprastai pirmiausia turi rytus, nustatykite **Taškų eilutės** į P, E, N, Z, D [CivilCraft parametruose](topic:settings).
3. Patikrinkite peržiūros lentelę. Jos stulpeliai visada yra **Taškas**, **Šiaurė**, **Rytai**, **Aukštis**, **Aprašymas**, nepriklausomai nuo to, kokia tvarka yra failas. Tikrų objektų šiaurės ir rytų dydžiai paprastai aiškiai skiriasi: jei atrodo, kad jie sukeisti, nuspėjimas buvo neteisingas.
4. Jei tvarka neteisinga, pasirinkite teisingą sąraše **Stulpeliai** (pavyzdžiui, {{ui:PENZD — taškas, rytai, šiaurė, aukštis, aprašymas}}). Santrauka ir peržiūra iš karto atsinaujina.
5. Peržiūros apačioje ieškokite **Neperskaitytos eilutės**. Kiekviena eilutė nurodo failo eilutės numerį, priežastį ir eilutės pradžią. Žr. [Neperskaitytos eilutės](topic:import-points#rows-that-are-not-read).
6. Spustelėkite {{ui:Importuoti}}.
   Taškai atsiranda plane, rodinys priartėja prie jų ir sukuriamas paviršius. Būsenos juostoje rašoma, pavyzdžiui: "Importuota 276 taškai iš site.csv; paviršius: 546 trikampiai."

Jei projektas dar neturėjo pavadinimo, jis įgyja failo pavadinimą.

## Patikrinkite grupes

Kiekvienas taškas priklauso grupei, pavadintai pagal **pirmąjį žodį jo aprašyme**, didžiosiomis raidėmis: "GRD", "FL 12" ir "fl" yra grupės GRD, FL ir FL. Taškai be aprašymo patenka į "(be aprašymo)".

1. Pažiūrėkite į lentelę po **Taškai** kairiajame skydelyje: grupė, taškų skaičius ir **Paviršius** pasirinkimas.
2. Kiekviena grupė pradžioje yra {{ui:Taškai}}. Tėkmės linijas, grindinio kraštus, šlaitų viršus ir papėdes, kalnagūbius bei panašias kodinėmis žymomis pažymėtas linijas pakeiskite į {{ui:Lūžio linija}}. Grupes, kurios neturėtų formuoti grunto (kontrolės taškai, medžių viršūnės, komunaliniai stulpai, matuoti viršuje), nustatykite į {{ui:Neįtraukta}}.
3. Spustelėkite tašką plane (su {{ui:Pasirinkti}}), kad dešiniajame skydelyje pamatytumėte jo numerį, koordinates, aukštį, aprašymą ir grupę.

:::warning
Lūžio linijos grupė sujungia **visus** savo taškus į **vieną** liniją, pagal taško numerio tvarką. Tai veikia, kai kiekviena kodinė linija buvo nufiksuota eilės tvarka su savo kodu. Dvi atskiros tėkmės linijos, abi pažymėtos "FL", tampa viena linija, zigzaguojančia tarp jų. Jei jūsų kodai bendri, naudokite įrankį {{ui:Lūžio linija}} ir spustelėkite kiekvienos linijos taškus (žr. [Paviršiaus kūrimas ir tikslinimas](topic:build-surface)).
:::

## Neperskaitytos eilutės

| Rodoma priežastis | Ką tai reiškia | Ką daryti |
|---|---|---|
| "šiaurė arba rytai nėra skaičius" | Koordinačių stulpelyje yra tekstas | Patikrinkite stulpelių tvarką arba atsitiktinę tekstinę eilutę failo viduryje |
| "aukštis nėra skaičius" | Aukščio stulpelyje yra tekstas | Neteisinga stulpelių tvarka arba aprašymas aukščio stulpelyje |
| "nėra taško numerio" | Taškų stulpelis tuščias | Suteikite taškui numerį arba pasirinkite tvarką be P (NEZD, NEZ …): tada taškai numeruojami 1, 2, 3 … |
| "taškas 12 pasikartoja (paliekamas pirmasis)" | Dvi eilutės turi tą patį numerį | Perskaičiuokite vieną iš jų faile, jei abu yra tikri matavimai |
| "3 stulpeliai, tikėtasi 5 (PNEZD)" | Eilutė trumpa | Sugadinta eilutė arba neteisinga stulpelių tvarka |

Taškas be aukščio paliekamas, bet paviršiuje nenaudojamas. **Taškų** duomenys rodo, kiek taškų turi aukštį.

Eilutės, prasidedančios `#`, `;` arba `//`, yra komentarai ir praleidžiamos. Tuščios eilutės taip pat praleidžiamos.

## Pakeiskite arba pridėkite taškus

Importuojant iš naujo **pakeičiami** visi taškai; jie nepridedami prie esamų. Jūsų trasos, aikštelės, vamzdžiai, nubraižytos lūžio linijos ir riba lieka. Atšaukimo istorija išvaloma, todėl, jei gali prireikti senų taškų, pirmiausia įrašykite projektą. Norėdami sujungti du failus, prieš importuodami sujunkite juos teksto redaktoriuje arba skaičiuoklėje (atkreipkite dėmesį į pasikartojančius taškų numerius).

Taškų CivilCraft viduje dar negalima perkelti, redaguoti ar naikinti. Ištaisykite juos faile ir importuokite iš naujo.

## Susiję

- [Taškų failų formatai](topic:point-file-formats): kiekviena stulpelių tvarka ir kaip atpažįstamos antraštės.
- [Paviršiaus kūrimas ir tikslinimas](topic:build-surface).
