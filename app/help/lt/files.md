---
title: Failai, kuriuos galite atidaryti, įrašyti ir eksportuoti
summary: Įkelkite taškų failus, LandXML ir CivilCraft projektus; išveskite projektus, LandXML, DXF ir PDF; sužinokite, ką kiekvienas failas išsaugo, kur jie įrašomi ir kas keičiasi neprisijungus.
keywords: atidaryti, įrašyti, eksportuoti, importuoti, failų formatai, csv, txt, landxml, xml, dxf, pdf, json, atsisiųsti, projekto failas
from: 82bff559
---

CivilCraft atidaro failus iš jūsų kompiuterio ir įrašo juos atsisiųsdamas atgal į jį. Niekas neįkeliama ir nieko nesaugoma serveryje. Taip pat žr. [Jūsų failai](common:your-files).

## Ką atidaro

Spustelėkite {{ui:Open}} (arba paspauskite {{key:Mod+O}}) ir pasirinkite failą, arba vilkite failą iš {{pick:mac=Finder|windows=Failų naršyklė|linux=jūsų failų tvarkyklė}} į planą. Vienu metu – vienas failas; failai didesni nei 200 MB atmetami. LandXML arba projekto failas, didesnis nei 32 MB, skaitomas dalimis po maždaug 4 MB, o ne kaip vienas didelis tekstas. Kol atidaromas LandXML, tikėkitės, kad jis naudos maždaug 13 kartų failo dydį atmintyje (69 MB failas mūsų bandyme naudojo apie 0.9 GB).

| Rūšis | Failų pavadinimai | Kas nutinka |
|---|---|---|
| Taškų failas | `.csv`, `.txt`, `.pnt`, `.xyz` (bet koks teksto failas) | Atsidaro dialogas **Importuoti taškus**. Taškai pakeičia projekto taškus; trasos, aikštelės ir vamzdžiai lieka. |
| LandXML | `.xml`, `.landxml` | Iš failo sukuriamas **naujas projektas** (jūsų pirmiausia paklausiama, jei dabartiniame projekte yra neįrašytų pakeitimų). |
| CivilCraft projektas | `.civilcraft.json` (bet koks `.json`) | Projektas atidaromas taip, kaip buvo įrašytas (jūsų pirmiausia paklausiama, jei dabartiniame projekte yra neįrašytų pakeitimų). |

CivilCraft nustato pagal failo galūnę, tada pagal pirmuosius simbolius: tekstas, prasidedantis `{`, skaitomas kaip projektas, prasidedantis `<` – kaip LandXML, o visa kita – kaip taškų failas. Failas, kurį atidarymo langas išjungia, vis tiek gali būti įmestas į planą.

:::note
Importavus taškų failą į projektą, kuriame jau yra taškų, jie pakeičiami be klausimo, o anuliavimo istorija išvaloma (bet kurio failo atidarymas pradeda naują anuliavimo istoriją). Jei paviršius buvo sukurtas iš LandXML, importavus taškus jis vėl tampa paviršiumi, sukurtu iš taškų. Jei galbūt norėsite senųjų taškų, pirma įrašykite projektą.
:::

Išsamiau: [Taškų failų formatai](topic:point-file-formats), [LandXML: kas nuskaitoma ir įrašoma](topic:landxml-reference).

## Ką įrašo

{{ui:Save}} ({{key:Mod+S}}) įrašo du failus vieną šalia kito, pavadintus pagal **Pavadinimas** kairiajame skydelyje: `<name>.civilcraft.json` – projektas, kurį toliau redaguojate, ir `<name>.ifc` – tas pats projektas kaip IFC 4.3 kitoms programoms (žr. [IFC eksportas ir importas](topic:ifc)). Kiekvienas failas nurodo kitą, o IFC taip pat turi suspaustą projekto kopiją, todėl IFC, išsiųstas atskirai, vis tiek atsidaro visiškai redaguojamas.

- **Studio programoje** abu failai įrašomi vienas šalia kito, toje pačioje vietoje.
- **Chrome ir Edge** naršyklėse pirmą kartą įrašant paklausiama aplanko, ir abu failai įrašomi į jį; vėlesni įrašai eina į tą patį aplanką. Atšaukus aplanko klausimą, abu failai atsisiunčiami.
- **Kitose naršyklėse** abu failai atsisiunčiami, pirmiausia projekto failas.

Atidarant bet kurį failą ieškoma kito. Atidarykite abu kartu (arba įmeskite abu), arba tik vieną: Studio programoje kitas randamas tame pačiame aplanke; naršyklėje CivilCraft paprašo jį pridėti arba leidžia tęsti su turimu. Jei IFC po CivilCraft įrašymo pakeitė kita programa arba vienas failas senesnis už kitą, projektas atidaromas iš naujesnio brėžinio, o **Problemos** skydelis paaiškina, kas nutiko, su mygtukais **Įrašyti dabar** (vėl įrašo abu failus) ir **Rodyti IFC geometriją kaip nuorodą**. IFC atskirai, kurį pakeitė kita programa, atidaromas iš savo projekto kopijos su tuo, kas dar sutampa: trasos, kurias ji pakeitė, perima jos geometriją; objektai, kuriuos ji pašalino, išmetami; likę jos pakeitimai išvardijami, bet neperimami. Projekto failas, įrašytas prieš 0.7.1 versiją, atidaromas kaip anksčiau.

Projekto failas išsaugo:

- kiekvieną tašką (numerį, koordinates, aukštį, aprašymą) ir taškų failo, iš kurio jie atėjo, pavadinimą
- paviršiaus nustatymus: grupių pasirinkimus, nubrėžtas lūžio linijas, ribą, ilgiausią išorinį kraštą ir iš LandXML nuskaitytą TIN
- rodymo nustatymus
- trasas su jų PI, spinduliais ir pradine stotimi, jų projektinius profilius (PVI ir lankų ilgius) bei koridoriaus nustatymus
- aikšteles ir vamzdynų tinklą su jo taisyklėmis

Anuliavimo istorijos neišsaugo. Paviršiai, horizontalės, dienos šviesos linijos ir tūriai neįrašomi; jie atkuriami iš įrašytų įvesties duomenų, kai projektas atidaromas. Projekto failas iš naujesnės CivilCraft versijos atmetamas, o pranešime nurodoma jo versija.

## Ką eksportuoja

| Mygtukas | Failas | Turinys |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: taškai, esamas gruntas (ir paruoštas paviršius, jei toks yra) kaip TIN paviršiai, trasos, žemės ir projektiniai profiliai, vamzdynų tinklas |
| {{ui:DXF}} | `<name>.dxf` | R12 DXF: plano linijos taip, kaip jos rodomos, pavadintuose sluoksniuose |
| {{ui:DWG}} | `<name>.dwg` | Ta pati linijų grafika kaip DWG brėžinys, pasirinktu formatu (nuo 2000 iki 2018) |
| {{ui:PDF}} | `<name>.pdf` | Vektorinis plano brėžinys lape, pasirinktu mastelyje |
| {{ui:GLB}} arba {{ui:OBJ}} (3D vaizdo juostoje) | `<name>-3d.glb`, `<name>-3d.obj` | Tai, ką 3D vaizdas rodo kaip 3D modelį: metrai, Y aukštyn, tikras mastelis, apie įrašytą vietinę pradžios tašką |

Ką kiekvienas iš jų palieka: [Mainų LandXML](topic:landxml), [Eksportuoti planą į DXF](topic:dxf-export) (taip pat DWG), [Spausdinti planą į PDF](topic:plot-pdf), [Eksportuoti vietą 3D](topic:export-3d).

## Kur keliauja failai

Įrašyti ir eksportuoti failai keliauja ten, kur jūsų naršyklė laiko atsisiuntimus, paprastai į aplanką Atsisiuntimai. Norėdami pasirinkti aplanką kiekvieną kartą:

:::chromium
Atidarykite naršyklės **Parametrai**, tada **Atsisiuntimai**, ir įjunkite **Klausti, kur įrašyti kiekvieną failą prieš atsisiunčiant**.
:::

:::firefox
Atidarykite **Parametrai**, tada **Bendra**, ir skiltyje **Failai ir programos** pasirinkite **Visada klausti, kur įrašyti failus**.
:::

:::safari
Atidarykite **Safari > Parametrai > Bendra** ir nustatykite **Failų atsisiuntimo vieta** į **Klausti kiekvieno atsisiuntimo**.
:::

Jei įrašote du kartus tuo pačiu pavadinimu, naršyklė antram failui gali pridėti numerį, pavyzdžiui `Site (1).civilcraft.json`. Kitą kartą atidarykite naujausią.

## Prisijungus ir neprisijungus

CivilCraft veikia tik jūsų kompiuteryje, nepriklausomai nuo ryšio: atidarant failas nuskaitomas naršyklėje, įrašant – atsisiunčiamas. Kad CivilCraft atidarytumėte be jokio ryšio, pirmiausia įrašykite jį naudoti neprisijungus:

1. Būdami prisijungę, spustelėkite {{ui:Save for offline}} viršutinėje programos juostoje.
2. Mygtukas skaičiuoja („Įrašoma 12 iš 30“), o tada rodo {{ui:Offline ready}}. CivilCraft yra mažas (apie 0.6 MB), todėl tai užtrunka akimirką. Įrašyta kopija apima šią pagalbą ir pavyzdinę vietą.
3. Be ryšio atidarykite tą patį adresą (arba jo žymę). Viskas veikia, įskaitant {{ui:Open the sample site}}.

Kitos mygtuko būsenos:

- {{ui:Could not save}}: kai kurie failai neatsisiųsti. Patikrinkite ryšį ir spustelėkite, kad bandytumėte dar kartą.
- {{ui:Offline not available}}: šis naršyklės langas negali išsaugoti kopijos neprisijungus (privatūs langai ir kai kurie valdomi kompiuteriai tai blokuoja). Naudokite įprastą langą.

Spustelėkite {{ui:Offline ready}}, kad pamatytumėte, kada kopija įrašyta, ir pasirinktumėte vieną iš dviejų veiksmų: {{ui:Save again (get the newest version)}} arba {{ui:Remove the offline copy}}. Prieš vizitą objekte įrašykite iš naujo, kad kopija atitiktų naujausią versiją. Daugiau – [Neprisijungus](common:offline).

:::offline
Dabar esate neprisijungę. Jei CivilCraft buvo įrašytas naudoti neprisijungus, viskas veikia, įskaitant pavyzdinę vietą. Jei ne, dirbkite toliau šiame skirtuke, bet jo neperkraukite, kol vėl neprisijungsite; be įrašytos kopijos {{ui:Open the sample site}} nepavyksta su pranešimu „Pavyzdžio nepavyko įkelti“.
:::

:::tip
Lauko darbams įrašykite CivilCraft naudoti neprisijungus ir taškų failus perkelkite į patį nešiojamąjį kompiuterį. Projektai ir eksportai be ryšio įrašomi kaip atsisiuntimai, todėl galite importuoti dienos matavimus, patikrinti paviršių ir įrašyti projektą vietoje.
:::

Debesų saugojimas dar nepasiekiamas, o darbalaukio versijų dar nėra. Šiuo metu failai, kuriuos įrašote, yra vienintelė kopija: laikykite juos ten, kur daromos atsarginės kopijos.

## Priedai, kuriuos naudoja failas

Kai įrašote projektą su duomenimis iš priedo (Statybos reglamento žymės arba Adreso į vietą šaltinis), failas įrašo, kurie priedai ir kokių versijų. Atidarius jį kompiuteryje, kuriame šio priedo nėra, virš plano rodoma juosta, kuri tai nurodo ir siūlo pridėti priedą iš jūsų paskyros sąrašo. Įrašas yra tik pastaba: failas atsidaro bet kuriuo atveju.

## Anuliavimas iš Studio

CadCraft Studio programoje kiekvienas CivilCraft baigtas žingsnis pranešamas Studio, todėl jo projekto lygio anuliavimas gali atšaukti paskutinį žingsnį tarp programų. Studio anuliuoja žingsnį tik tada, kai CivilCraft savo anuliavimo steke yra tokioje būsenoje, kokią žingsnis paliko; atidarius kitą failą, jis šį langą praleidžia.

## Uždarant su neįrašytais pakeitimais

Kai projektas turi neįrašytų pakeitimų ir uždarote skirtuką, perkraunate ar paliekate puslapį, naršyklė klausia, ar tikrai norite išeiti. Jos formuluotė ir išvaizda priklauso naršyklei, todėl CivilCraft jos pakeisti negali. {{ui:New}}, taip pat projekto ar LandXML failo atidarymas vietoj to klausia CivilCraft savo dėžutėje **Neįrašyti pakeitimai**, su mygtukais {{ui:Cancel}}, {{ui:Don’t save}} ir {{ui:Save a copy}}.
