---
title: Failai, kuriuos galite atidaryti, įrašyti ir eksportuoti
summary: Įkeliami taškų failai, LandXML ir CivilCraft projektai; išsaugomi projektai, LandXML, DXF ir PDF; nurodyta, ką kiekvienas failas saugo, kur jie įrašomi ir kas keičiasi neprisijungus.
keywords: atidaryti, įrašyti, eksportuoti, importuoti, failų formatai, csv, txt, landxml, xml, dxf, pdf, json, atsisiuntimas, projekto failas
from: a7debb61
---

CivilCraft atidaro failus iš jūsų kompiuterio, o įrašo juos atsisiųsdama atgal į kompiuterį. Niekas neįkeliama ir nieko nelaikoma serveryje. Taip pat žr. [Jūsų failai](common:your-files).

## Ką ji atidaro

Spustelėkite {{ui:Atidaryti}} (arba paspauskite {{key:Mod+O}}) ir pasirinkite failą, arba įmeskite failą iš {{pick:mac=Finder|windows=Failų naršyklė|linux=jūsų failų tvarkyklė}} į planą. Vienu metu – vienas failas; failai, didesni nei 200 MB, nepriimami.

| Rūšis | Failų pavadinimai | Kas nutinka |
|---|---|---|
| Taškų failas | `.csv`, `.txt`, `.pnt`, `.xyz` (bet koks tekstinis failas) | Atsidaro langas **Importuoti taškus**. Taškai pakeičia projekto taškus; trasos, aikštelės ir vamzdžiai lieka. |
| LandXML | `.xml`, `.landxml` | Iš failo sukuriamas **naujas projektas** (jūsų paklausiama pirma, jei dabartiniame projekte yra neįrašytų pakeitimų). |
| CivilCraft projektas | `.civilcraft.json` (bet koks `.json`) | Projektas atsidaro taip, kaip buvo įrašytas (jūsų paklausiama pirma, jei dabartiniame projekte yra neįrašytų pakeitimų). |

CivilCraft nustato pagal failo galūnę, o paskui pagal pirmuosius simbolius: tekstas, prasidedantis `{`, skaitomas kaip projektas, prasidedantis `<` – kaip LandXML, o visa kita – kaip taškų failas. Failą, kurį atidarymo langas pilkai išjungia, vis tiek galima įmesti į planą.

:::note
Taškų failo importavimas į projektą, kuriame jau yra taškų, pakeičia juos neklausiant ir išvalo anuliavimo istoriją (atidarant bet kurį failą anuliavimas prasideda iš naujo). Jei paviršius buvo gautas iš LandXML, importavus taškus jis vėl tampa paviršiumi, sudarytu iš taškų. Jei galbūt norėsite grąžinti senus taškus, pirmiausia įrašykite.
:::

Išsamiau: [Taškų failų formatai](topic:point-file-formats), [LandXML: kas nuskaitoma ir įrašoma](topic:landxml-reference).

## Ką ji įrašo

{{ui:Įrašyti}} ({{key:Mod+S}}) įrašo du failus greta, pavadinti pagal kairiajame skydelyje esantį lauką **Pavadinimas**: `<name>.civilcraft.json` – projektas, kurį toliau redaguosite, ir `<name>.ifc` – tas pats projektas IFC 4.3 formatu, skirtas kitoms programoms (žr. [IFC eksportas ir importas](topic:ifc)). Kiekvienas failas nurodo kitą, o IFC failas taip pat turi suspaustą projekto kopiją, todėl IFC failas, išsiųstas atskirai, vis tiek atsidaro visiškai redaguojamas.

- **Studio** programoje abu failai įrašomi vienas šalia kito, toje pačioje vietoje.
- **Chrome** ir **Edge** naršyklėse pirmą kartą įrašant klausiama aplanko ir abu failai įrašomi į jį; vėlesni įrašymai eina į tą patį aplanką. Atšaukus aplanko klausimą, vietoj to abu failai atsisiunčiami.
- **Kitose naršyklėse** abu failai atsisiunčiami, pirma projekto failas.

Atidarant bet kurį failą, ieškoma kito. Atidarykite abu kartu (arba įmeskite abu), arba atidarykite vieną: Studio programoje kitas failas randamas tame pačiame aplanke; naršyklėje CivilCraft paklausia, ar jį pridėti, ar tęsti tik su turimu. Jei po to, kai CivilCraft įrašė IFC failą, jį pakeitė kita programa arba vienas failas yra senesnis už kitą, projektas atsidaro iš naujesnės versijos, o **Problemos** skydelyje parodoma, kas nutiko, su mygtukais **Įrašyti dabar** (vėl įrašo abu failus) ir **Rodyti IFC geometriją kaip nuorodą**. Atskirai atidarytas IFC failas, kurį pakeitė kita programa, atsidaro iš savo projekto kopijos su tuo, kas dar atitinka: trasos, kurias ji pakeitė, įgyja jos geometriją, pašalinti objektai neįtraukiami, o likę jos pakeitimai išvardijami, bet nepritaikomi. Projekto failas, sukurtas prieš 0.7.1, atsidaro kaip anksčiau.

Projekto faile išsaugoma:

- kiekvienas taškas (numeris, koordinatės, aukštis, aprašymas) ir taškų failo, iš kurio jie atėjo, pavadinimas
- paviršiaus parametrai: grupių pasirinkimai, nubrėžtos lūžio linijos, riba, ilgiausias išorinis kraštas ir iš LandXML nuskaitytas TIN
- rodymo parametrai
- trasos su jų PI, spinduliais ir pradine stacionaža, jų projektiniai profiliai (PVI ir kreivių ilgiai) ir koridoriaus parametrai
- aikštelės ir vamzdynų tinklas su jo taisyklėmis

Anuliavimo istorija neišsaugoma. Paviršiai, horizontalės, išpjovų ir užpylimų ribos (dienos šviesos linijos) ir tūriai neįrašomi; atidarant projektą jie atkuriami iš įrašytų duomenų. Naujesnės CivilCraft versijos projekto failas atmetamas, o pranešime nurodoma jo versija.

## Ką ji eksportuoja

| Mygtukas | Failas | Turinys |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: taškai, esamas gruntas (ir suplanuotas paviršius, jei jis yra) kaip TIN paviršiai, trasos, gruntiniai ir projektiniai profiliai, vamzdynų tinklas |
| {{ui:DXF}} | `<name>.dxf` | R12 DXF plano linijų taip, kaip jos rodomos, pavadintuose sluoksniuose |
| {{ui:DWG}} | `<name>.dwg` | Tos pačios linijos kaip DWG brėžinys, pasirinktu formatu (nuo 2000 iki 2018) |
| {{ui:PDF}} | `<name>.pdf` | Plano vektorinis atvaizdas lape, pasirinktu mastelių |
| {{ui:GLB}} arba {{ui:OBJ}} (3D vaizdo juostoje) | `<name>-3d.glb`, `<name>-3d.obj` | 3D vaizde matomas 3D modelis: metrais, Y ašis viršuje, tikru mastelių, apie įrašytą vietinį pradžios tašką |

Ko kiekvienas neįtraukia: [LandXML mainai](topic:landxml), [Eksportuoti planą į DXF](topic:dxf-export) (DWG taip pat), [Išvesti planą į PDF](topic:plot-pdf), [Eksportuoti statybvietę 3D formatu](topic:export-3d).

## Kur keliauja failai

Įrašyti ir eksportuoti failai atsiranda ten, kur naršyklė deda atsisiuntimus, paprastai aplanke Atsisiuntimai. Kad kiekvieną kartą pasirinktumėte aplanką:

:::chromium
Atidarykite naršyklės **Parametrai**, tada **Atsisiuntimai** ir įjunkite **Klausti, kur įrašyti kiekvieną failą prieš atsisiunčiant**.
:::

:::firefox
Atidarykite **Parametrai**, tada **Bendra**, ir skiltyje **Failai ir programos** pasirinkite **Visada klausti, kur įrašyti failus**.
:::

:::safari
Atidarykite **Safari > Parametrai > Bendra** ir nustatykite **Failų atsisiuntimo vieta** į **Klausti kiekvieno atsisiuntimo**.
:::

Jei įrašote du kartus tuo pačiu pavadinimu, naršyklė antram failui gali pridėti numerį, pavyzdžiui `Site (1).civilcraft.json`. Kitą kartą atidarykite naujausią.

## Prisijungus ir neprisijungus

Abiem atvejais CivilCraft veikia tik jūsų kompiuteryje: atidarant failas nuskaitomas naršyklėje, įrašant – atsisiunčiamas. Kad CivilCraft atidarytumėte visiškai be ryšio, pirmiausia įrašykite ją naudojimui neprisijungus:

1. Būdami prisijungę, viršutinėje programos juostoje spustelėkite {{ui:Įrašyti neprisijungus}}.
2. Mygtukas skaičiuoja ("Įrašoma 12 iš 30") ir tada rodo {{ui:Paruošta neprisijungus}}. CivilCraft yra nedidelė (apie 0.6 MB), todėl tai užtrunka akimirką. Įrašytoje kopijoje yra ir ši žinynas, ir pavyzdinė statybvietė.
3. Be ryšio atidarykite tą patį adresą (arba jo žymę). Viskas veikia, įskaitant {{ui:Atidaryti pavyzdinę statybvietę}}.

Kiti mygtuko būsenos:

- {{ui:Nepavyko įrašyti}}: kai kurie failai neatsisiuntė. Patikrinkite ryšį ir spustelėkite dar kartą.
- {{ui:Naudojimas neprisijungus negalimas}}: šis naršyklės langas negali laikyti kopijos neprisijungus (privatūs langai ir kai kurie valdomi kompiuteriai tai blokuoja). Naudokite įprastą langą.

Spustelėkite {{ui:Paruošta neprisijungus}}, kad pamatytumėte, kada kopija įrašyta; yra du pasirinkimai: {{ui:Įrašyti dar kartą (gauti naujausią versiją)}} ir {{ui:Pašalinti kopiją neprisijungus}}. Prieš vizitą į statybvietę įrašykite dar kartą, kad kopija atitiktų naujausią versiją. Daugiau – [Neprisijungus](common:offline).

:::offline
Dabar esate neprisijungę. Jei CivilCraft buvo įrašyta naudojimui neprisijungus, viskas veikia, įskaitant pavyzdinę statybvietę. Jei ne, toliau dirbkite šiame skirtuke, bet neperkraukite jo, kol vėl nebūsite prisijungę; be įrašytos kopijos {{ui:Atidaryti pavyzdinę statybvietę}} nepavyksta su pranešimu „Pavyzdinės statybvietės įkelti nepavyko“.
:::

:::tip
Darbui lauke įrašykite CivilCraft naudojimui neprisijungus ir taškų failus perkelkite tiesiai į nešiojamąjį kompiuterį. Projektai ir eksportai be ryšio įrašomi kaip atsisiuntimai, todėl galite importuoti vienos dienos matavimus, patikrinti paviršių ir įrašyti projektą statybvietėje.
:::

Debesies įrašymas dar neprieinamas, o darbalaukio versijos dar neišleistos. Šiandien jūsų įrašyti failai yra vienintelė kopija: laikykite juos vietoje, kur daromos atsarginės kopijos.

## Priedai, kuriuos naudoja failas

Įrašant projektą, kuriame yra priedo duomenų (Statybos reglamentų žymės arba Adreso į statybvietę šaltinis), failas įrašo, kurie priedai ir kokios versijos naudojami. Atidarius jį kompiuteryje, kuriame to priedo nėra, virš plano rodoma juosta apie tai ir siūlo pridėti jį iš jūsų paskyros sąrašo. Įrašas yra tik pastaba: failas atsidaro bet kuriuo atveju.

## Anuliavimas iš Studio

CadCraft Studio viduje kiekvienas CivilCraft žingsnis, kurį baigiate, pranešamas Studio, todėl jos projekto lygmens anuliavimas gali atšaukti paskutinį žingsnį per visas programas. Studio atšaukia žingsnį tik tada, kai CivilCraft savo anuliavimo istorija yra būtent tokia, kokią paliko tas žingsnis; atidarius kitą failą ji praleidžia šį langą.

## Uždarant su neįrašytais pakeitimais

Kai projekte yra neįrašytų pakeitimų ir uždarote skirtuką, perkraunate arba paliekate puslapį, naršyklė klausia, ar norite išeiti. Jos tekstas ir išvaizda priklauso naršyklei, CivilCraft jų pakeisti negali. {{ui:Naujas}}, taip pat projekto ar LandXML failo atidarymas vietoj to klausia CivilCraft savame lange **Neįrašyti pakeitimai** su {{ui:Atšaukti}}, {{ui:Neįrašyti}} ir {{ui:Įrašyti kopiją}}.
