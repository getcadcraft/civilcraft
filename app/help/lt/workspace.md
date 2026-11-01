---
title: Ekranas dalis po dalies
summary: Ekskursija po kiekvieną CivilCraft juostą ir skydelį pagal jų ekrane matomus pavadinimus – nuo įrankių juostos iki būsenos juostos.
keywords: sąsaja, ekranas, įrankių juosta, skydeliai, savybės, būsenos juosta, profilio vaizdas, išdėstymas, ekskursija, ui
from: 76272010
---

CivilCraft turi vieną ekraną. Skirtukų ir išdėstymų nėra. Šoniniai skydeliai gali būti perkeliami, plaukti arba atsidaryti savo lange: žr. [Išdėstykite skydelius ir naudokite antrą monitorių](common:arrange-panels). Iš viršaus į apačią ir iš kairės į dešinę:

- **programos juosta** (CadCraft ženklas, programos pavadinimas, versija, Apie, ekrano režimas, Žinynas, Įrašyti neprisijungus, Popierius ir Modelis)
- **įrankių juosta** su septyniomis mygtukų grupėmis
- **kairysis skydelis**: Vietovė, Taškai, Paviršius, Rodymas ir, kai kuriuos importuosite, GIS sluoksniai
- **planas** viduryje, o po juo – **profilio vaizdas**, kai jis atidarytas
- **dešinysis skydelis**: pasirinkto objekto **Savybės**
- **būsenos juosta** apačioje

## Programos juosta

Plona juosta pačiame viršuje priklauso CadCraft svetainei, o ne pačiai CivilCraft.

- Versijos meniu rodo, kokia versija veikia.
- {{ui:Apie CivilCraft}} atidaro programos puslapį svetainėje.
- {{ui:Visas ekranas}} perjungia ekrano režimus: visas ekranas, tada visas ekranas su paslėptomis juostomis, ir vėl įprastas režimas. {{key:Ctrl+Shift+F}} veikia tą patį visose platformose, įskaitant Mac (ten tai Control klavišas, o ne Command). Kai juostos paslėptos, perkelkite žymeklį į viršutinį kraštą, kad jos vėl atsirastų.
- {{ui:Žinynas}} (arba {{key:F1}}) atidaro šį žinyną šoniniame skydelyje; {{key:F1}} arba {{key:Esc}} jį uždaro.
- {{ui:Įrašyti neprisijungus}} įrašo CivilCraft šioje naršyklėje, kad ji atsidarytų be ryšio; tada rodoma {{ui:Paruošta neprisijungus}}. Žr. [Failai, kuriuos galite atidaryti, įrašyti ir eksportuoti](topic:files#online-and-offline).
- {{ui:Popierius}} ir {{ui:Modelis}} perjungia šviesią ir tamsią temą. Planas ir profilis seka temą; PDF visada išvedami ant baltos spalvos.

## Įrankių juosta

Kiekvienos grupės mygtukų viršuje yra nedidelė etiketė. Užvedę žymeklį ant mygtuko, pamatysite jo patarimą ir klavišą.

| Grupė | Mygtukai | Ką daro |
|---|---|---|
| Failas | {{ui:Naujas}}, {{ui:Atidaryti}}, {{ui:Įrašyti}} | Pradėti iš naujo, atidaryti taškų failą, LandXML ar projektą, įrašyti projektą kaip atsisiuntimą |
| Eksportas | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | Įrašyti LandXML 1.2, R12 DXF arba DWG planą, arba išvesti planą į PDF |
| Paviršius | {{ui:Lūžio linija}}, {{ui:Riba}} | Nubrėžti lūžio liniją per topografinius taškus; nubrėžti išorinę ribą |
| Projektavimas | {{ui:Trasa}}, {{ui:Aikštelė}}, {{ui:Vamzdžiai}}, {{ui:Profilis}} | Nubrėžti trasą, aikštelę, vamzdžių ruožą; rodyti arba slėpti profilio vaizdą |
| Redagavimas | {{ui:Anuliuoti}}, {{ui:Perdaryti}}, {{ui:Kopijuoti}}, {{ui:Įklijuoti}}, {{ui:Daugiau}} | Anuliuoti, perdaryti, kopijuoti ir įklijuoti topografinius taškus; {{ui:Daugiau}} turi Iškirpti, Įklijuoti vietoje, Dubliuoti, Naikinti, Pasirinkti visus taškus ir Nieko nepasirinkti |
| GIS | {{ui:Koordinatės}}, {{ui:Importuoti}}, {{ui:Eksportuoti}}, {{ui:Žemėlapis}} | Nustatyti koordinačių sistemą, importuoti ir eksportuoti GIS failus, rodyti žemėlapio sluoksnius po planu |
| Vaizdas | {{ui:Pasirinkti}}, {{ui:Pritaikyti}}, {{ui:3D}} | Rinktis ir perkelti objektus; priartinti, kad matytųsi viskas; rodyti statybvietę 3D ([Peržiūrėti statybvietę 3D](topic:site-3d)) |

Braižymo įrankis lieka nuspaustas, kol yra aktyvus. Spustelėjus jį dar kartą, paspaudus {{key:Esc}} arba {{key:V}} grįžtama prie {{ui:Pasirinkti}}. {{ui:Anuliuoti}}, {{ui:Perdaryti}}, {{ui:Kopijuoti}} ir {{ui:Daugiau}} punktai, kai negali veikti, pilkai išjungiami; patarime nurodoma priežastis (pavyzdžiui, „Pirmiausia pasirinkite topografinius taškus“). Kiekvienas mygtukas išvardytas [Įrankių juostos nuorodoje](topic:toolbar).

Siauame lange įrankių juosta slenka į šonus.

## Kairysis skydelis

### Vietovė

- **Pavadinimas**: projekto pavadinimas. Juo pavadinamas kiekvienas įrašomas ar eksportuojamas failas, jis spausdinamas PDF antraštės juostoje.
- **Vienetai**: {{ui:JAV pėdos}} arba {{ui:Metrai}}. Tai nurodo, ką reiškia skaičiai. Pakeitus koordinatės **nekonvertuojamos**; žr. [Vienetai, stacionažai ir skaičių formatai](topic:units-and-stations).

### Taškai

Kai tuščia, rodoma, kaip atidaryti taškų failą. Kai yra taškų, rodomas failo pavadinimas, taškų skaičius ir kiek jų turi aukštį, tada **taškų grupių** lentelė: po vieną eilutę kiekvienam aprašymo pirmajam žodžiui (GRD, FL, TBS …), su skaičiumi ir **Paviršiaus** pasirinkimu:

- {{ui:Taškai}}: taškai eina į paviršių (numatytoji reikšmė kiekvienai grupei).
- {{ui:Lūžio linija}}: grupės taškai sujungiami į vieną lūžio liniją pagal taškų numerio tvarką.
- {{ui:Neįtraukta}}: grupė neliečia paviršiaus.

### Paviršius

Esamo grunto duomenys: taškai, trikampiai, žemiausias ir aukščiausias aukštis, vidutinis aukštis, 2D ir 3D plotas, lūžio linijos ir ar yra riba. Po duomenimis langelyje išvardyta viskas, ką paviršiaus kūrėjas turėjo ištaisyti ar negalėjo atlikti. Toliau:

- **Ilgiausias išorinis kraštas**: 0 palieka visus išorinius trikampius; skaičius nukerpa ilgus plonus trikampius iš išorės.
- Nuorodos, kurios atsiranda, kai jos taikomos: {{ui:Pašalinti ribą}}, {{ui:Pašalinti nubrėžtas lūžio linijas}} ir, paviršiui, nuskaitytam iš LandXML, {{ui:Atkurti paviršių iš taškų}}.

### Rodymas

- **Paviršius**: {{ui:Esamas gruntas}} arba {{ui:Projektuojamas (su nuolydžiais)}}. Antrasis pasiekiamas, kai aikštelė ar koridorius be problemų suplanuojami.
- **Horizontalės kas**, **Pagrindinės kas** ir **Juostos** (spalvų juostų skaičius).
- Žymės langeliai: {{ui:Horizontalės}}, {{ui:Horizontalių žymos}}, {{ui:Trikampiai}}, {{ui:Aukščių juostos}}, {{ui:Šlaitų rodyklės}}, {{ui:Taškai}}, {{ui:Taškų žymos}}, {{ui:Lūžio linijos}}, {{ui:Paviršiaus kraštas}}, {{ui:Vamzdžiai}}.
- Kai juostos įjungtos, rodoma aukščių juostų legenda.

Rodymo parametrai įrašomi kartu su projektu, bet nėra anuliavimo žingsniai: {{key:Mod+Z}} niekada nepanaikina žymės langelio.

## Planas

Plane rodomi taškai, paviršius ir viskas, ką projektuojate, plano vaizde su šiaurę viršuje. Ratuku priartinkite žymeklio vietoje, tempkite tuščią erdvę, kad slinktumėte. Pilnas sąrašas – [Klavišai ir pelė](topic:keyboard).

- Tuščiame projekte langelis **Pradėkite nuo topografinių taškų** išvardija pirmuosius žingsnius ir siūlo {{ui:Atidaryti pavyzdinę statybvietę}}.
- Kol aktyvus braižymo įrankis, viršutinėje plano dalyje patarimas nurodo, ką spustelėti ir kaip baigti.
- Tempiant failą per planą, rodoma „Įmeskite taškų failą, LandXML ar projektą“.
- Pasirinkti objektai paryškinami. Pasirinkta trasa ar aikštelė rodo kvadratines rankenėles savo PI ar kampuose; pasirinkta konstrukcija rodo vieną rankenėlę. Tempkite rankenėlę, kad ją perkeltumėte.
- Pasirinkti topografiniai taškai turi žiedą. {{key:Shift}} ir spustelėjimas prideda arba pašalina tašką; {{key:Shift}} ir tempimas nubrėžia langelį (arba, aplink juos nutempus, lasą), kuris prideda jame esančius taškus. Žr. [Pasirinkite, kopijuokite ir įklijuokite topografinius taškus](topic:copy-paste-points).

## Profilio vaizdas

Paspauskite {{key:R}} arba spustelėkite {{ui:Profilis}}, kad jis atsidarytų po planu. Jo juostoje yra:

- trasų sąrašas (įjungtas, kai yra dvi ar daugiau trasų)
- {{ui:Pridėti PVI}}: kol jis nuspaustas, spustelėjimas profilyje prideda PVI ({{key:I}} jį perjungia)
- rodmuo po žymekliu: stacionažas, gruntas, projektinis aukštis, nuolydis ir išpjova ar užpylimas
- uždarymo mygtukas

Profilyje rodomas esamas gruntas, projektinis profilis, kiekvieno tiesiojo ruožo nuolydžiai, kiekvieno PVI stacionažas ir aukštis, kiekvienos vertikalios kreivės L ir K su jos BVC ir EVC, aukštieji ir žemieji taškai bei vertikalus perdėjimas. Jis visada telpa visą trasą: nei priartinama, nei slenkama. Judinant žymeklį palei profilį, trasa plane pažymima tašku.

## Dešinysis skydelis: Savybės

Jo antraštėje nurodoma, ką rodo.

- **Projektas** (nieko nepasirinkta): trasos ir aikštelės kaip nuorodos, blokas **Žemės darbai** ir blokas **Vamzdynų tinklas** su jo taisyklėmis ir problemomis.
- **Trasa**: pavadinimas, pradinis stacionažas, ilgis, PI lentelė, kreivės, projektinio profilio PVI lentelė ir duomenys bei **Koridoriaus** parametrai.
- **Aikštelė**: pavadinimas, aukštis, išpjovos ir užpylimo nuolydžiai, plotas, dienos šviesos duomenys ir žemės darbai.
- **Konstrukcija** arba **Vamzdis**: dydžiai, viršutiniai kraštai, dugnai, nuolydis, danga ir visos problemos.
- **Taškas** ir jo numeris: taško koordinatės, aukštis, aprašymas ir grupė (tik skaitymui).

Laukeliai įsigalioja paspaudus {{key:Enter}} arba išėjus iš lauko. Nepriimta reikšmė pažymima kaip neteisinga, ir niekas nesikeičia.

## Būsenos juosta

- **E** ir **N**: rytų ir šiaurės koordinatės po žymekliu.
- **Grunto** aukštis ten (ir **Suplanuota**, kur aikštelė ar koridorius jį pakeitė) arba „Už paviršiaus“.
- Artimiausia trasa (arba pasirinkta) su **Sta** ir poslinkiu (**L** arba **R**) po žymekliu.
- Dešinėje – pranešimai: kas ką tik nutiko arba kodėl kažkas atmesta. Pranešimas po kelių sekundžių pats išnyksta.

## Langai

- **Importuoti taškus**: atsidaro su kiekvienu taškų failu. Žr. [Importuokite topografinius taškus](topic:import-points).
- **Išvesti planą į PDF**: žr. [Išvesti planą į PDF](topic:plot-pdf).
- **Neįrašyti pakeitimai**: klausia prieš {{ui:Naujas}} arba projekto ar LandXML failo atidarymą, kai būtų prarasti neįrašyti darbai. {{ui:Įrašyti kopiją}} pirma atsisiunčia projektą.

## Maži ekranai

Iki 760 pikselių pločio, pavyzdžiui telefone, planas išlaiko ekraną: įrankių juosta – viena eilutė, slenkanti į šonus, o skydeliai atsidaro kaip lakštai iš juostos apačioje. {{ui:Įrankiai}} paslepia įrankių juostą, o {{ui:Perkelti}} ją perkelia į apačią.
