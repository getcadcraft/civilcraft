---
title: Mga file na mabubuksan, masasave at ma-export
summary: Mag-import ng point files, LandXML at CivilCraft projects; mag-export ng projects, LandXML, DXF at PDF; ano ang itinatago ng bawat isa, saan napupunta ang mga file, at ano ang nagbabago offline.
keywords: buksan, save, export, import, file formats, csv, txt, landxml, xml, dxf, pdf, json, download, project file
from: 82bff559
---

Nagbubukas ang CivilCraft ng mga file mula sa iyong computer at nagsa-save sa pamamagitan ng pag-download ng mga file pabalik dito. Walangina-upload at walang itinatago sa server. Tingnan din ang [Ang iyong mga file](common:your-files).

## Ano ang nagbubukas

I-click ang {{ui:Open}} (o pindutin ang {{key:Mod+O}}) at pumili ng file, o i-drag ang file mula sa {{pick:mac=Finder|windows=File Explorer|linux=file manager mo}} papunta sa plano. Isang file sa isang pagkakataon; tinatanggihan ang mga file na higit sa 200 MB. Ang LandXML o project file na higit sa 32 MB ay binabasa sa mga piraso na mga 4 MB, hindi bilang isang buong text block; habang bumubukas ang LandXML, asahan na gagamit ito ng humigit-kumulang 13 beses ng laki ng file sa memory (ang 69 MB na file ay gumamit ng mga 0.9 GB sa aming pagsubok).

| Uri | Mga pangalan ng file | Ang nangyayari |
|---|---|---|
| Point file | `.csv`, `.txt`, `.pnt`, `.xyz` (anumang text file) | Bubukas ang **Import points** dialog. Papalitan ng mga point ang mga point ng project; mananatili ang alignments, pads at pipes. |
| LandXML | `.xml`, `.landxml` | Gagawa ng **new project** mula sa file (tatanungin ka muna kung may hindi pa na-save na pagbabago ang kasalukuyan). |
| CivilCraft project | `.civilcraft.json` (anumang `.json`) | Bubukas ang project gaya ng pagkaka-save nito (tatanungin ka muna kung may hindi pa na-save na pagbabago ang kasalukuyan). |

Pinagpapasyahan ng CivilCraft ayon sa dulo ng file, saka ayon sa mga unang character nito: ang text na nagsisimula sa `{` ay binabasa bilang project, ang nagsisimula sa `<` bilang LandXML, at ang iba ay bilang point file. Maaaring i-drop sa plano ang file na naka-gray out sa open box.

:::note
Ang pag-import ng point file sa project na may points na ay papalitan ang mga ito nang hindi nagtatanong, at buburahin ang undo history (ang pagbubukas ng anumang file ay bagong simula para sa undo). Kapag galing sa LandXML ang surface, ibinabalik ng pag-import ng points ito sa surface na binuo mula sa points. I-save muna kung baka gusto mo pang bumalik ang lumang points.
:::

Mga detalye: [Mga format ng point file](topic:point-file-formats), [LandXML: ano ang binabasa at isinusulat](topic:landxml-reference).

## Ano ang sine-save

{{ui:Save}} ({{key:Mod+S}}) ay sumusulat ng dalawang file magkatabi, ayon sa **Name** sa kaliwang panel: `<name>.civilcraft.json`, ang project na patuloy mong ie-edit, at `<name>.ifc`, ang parehong disenyo bilang IFC 4.3 para sa iba pang gumagamit (tingnan ang [Pag-export at pag-import ng IFC](topic:ifc)). Itinatala ng bawat file ang isa, at may dala ring compressed copy ng project ang IFC, kaya ang IFC na ipinadala nang mag-isa ay mabubuksan pa rin nang buo at ma-e-edit.

- **In Studio** parehong isinusulat ang dalawang file magkatabi, sa mismong lugar.
- **In Chrome and Edge** sa unang Save, humihingi ito ng folder at isinusulat ang dalawa roon; ang mga susunod na save ay pupunta sa parehong folder. I-cancel ang tanong sa folder para i-download na lang ang dalawa.
- **In other browsers** dina-download ang dalawang file, mauuna ang project file.

Kapag binuksan ang alinman sa dalawang file, hinahanap nito ang isa pa. Buksan ang dalawa nang magkasama (o i-drop ang dalawa), o buksan ang isa lang: sa Studio, makikita ang isa pa sa parehong folder; sa browser, hihingi ang CivilCraft na idagdag ito, o magpatuloy sa isa na mayroon ka. Kung binago ng ibang programa ang IFC pagkatapos itong i-save ng CivilCraft, o mas luma ang isang file kaysa sa isa, bubukas ang project mula sa mas bagong disenyo at sasabihin ng Problems panel kung ano ang nangyari, kasama ang **Save now** (isinusulat ulit ang dalawang file) at **Show the IFC's geometry as reference**. Ang IFC lang na binago ng ibang programa ay bubukas mula sa kopya nitong project, kasama ang mga bagay na tugma pa rin: ang alignments na binago nito ay kukuha ng geometry nito, ang mga bagay na tinanggal nito ay hindi isasama, at ang iba pa nitong pagbabago ay nakalista, hindi awtomatikong kinukuha. Ang project file mula bago ang 0.7.1 ay bubukas gaya ng dati.

Itinatago ng project file ang:

- bawat point (numero, coordinates, elevation, description) at ang pangalan ng point file na pinanggalingan nila
- ang mga setting ng surface: mga pagpipilian sa group, iginuhit na breaklines, boundary, ang pinakamahabang panlabas na gilid, at isang TIN na binasa mula sa LandXML
- ang mga setting ng display
- alignments kasama ang kanilang PIs, radii at start station, ang kanilang design profiles (PVIs at haba ng curve) at mga setting ng corridor
- pads at ang pipe network kasama ang mga patakaran nito

Hindi nito itinatago ang undo history. Ang surfaces, contours, daylight lines at volumes ay hindi naka-store; muling binubuo ang mga ito mula sa mga na-save na input kapag bumukas ang project. Tinatanggihan ang project file mula sa mas bagong CivilCraft, na may mensaheng nagpapakita ng bersyon nito.

## Ano ang ine-export

| Button | File | Nilalaman |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: points, ang umiiral na lupa (at ang graded surface kapag mayroon) bilang TIN surfaces, alignments, ground at design profiles, ang pipe network |
| {{ui:DXF}} | `<name>.dxf` | R12 DXF ng linework ng plano gaya ng nakikita, sa mga pinangalanang layer |
| {{ui:DWG}} | `<name>.dwg` | Ang parehong linework bilang DWG drawing, sa format na pipiliin mo (2000 hanggang 2018) |
| {{ui:PDF}} | `<name>.pdf` | Vector plot ng plano sa isang sheet, sa sukat na pipiliin mo |
| {{ui:GLB}} o {{ui:OBJ}} (sa bar ng 3D view) | `<name>-3d.glb`, `<name>-3d.obj` | Ang ipinapakita ng 3D view bilang 3D model: sa metro, Y up, totoong sukat, sa paligid ng nakatalang local origin |

Ang hindi isinasama ng bawat isa: [Palitan ng LandXML](topic:landxml), [I-export ang plano sa DXF](topic:dxf-export) (DWG din), [I-plot ang plano sa PDF](topic:plot-pdf), [I-export ang site sa 3D](topic:export-3d).

## Saan napupunta ang mga file

Ang mga na-save at na-export na file ay pupunta kung saan inilalagay ng iyong browser ang mga download, kadalasan sa Downloads folder. Para pumili ng folder sa bawat pagkakataon:

:::chromium
Buksan ang **Settings** ng browser, saka **Downloads**, at i-on ang **Ask where to save each file before downloading**.
:::

:::firefox
Buksan ang **Settings**, saka **General**, at sa ilalim ng **Files and Applications** piliin ang **Always ask you where to save files**.
:::

:::safari
Buksan ang **Safari > Settings > General** at itakda ang **File download location** sa **Ask for each download**.
:::

Kung mag-save ka nang dalawang beses gamit ang parehong pangalan, maaaring lagyan ng numero ng browser ang pangalawang file, halimbawa `Site (1).civilcraft.json`. Buksan ang pinakabago sa susunod.

## Online at offline

Gumagana ang CivilCraft sa iyong computer lang sa alinmang kaso: ang pagbubukas ay binabasa ang file sa browser, ang pag-save ay dina-download ito. Para mabuksan ang CivilCraft nang walang koneksyon, i-save muna ito para sa offline na paggamit:

1. Habang online, i-click ang {{ui:Save for offline}} sa app bar sa itaas.
2. Nagbibilang ang button ("Sine-save 12 sa 30") at pagkatapos ay ipinapakita ang {{ui:Offline ready}}. Maliit ang CivilCraft (mga 0.6 MB), kaya sandali ito. Kasama sa naka-save na kopya ang help na ito at ang sample site.
3. Kapag walang koneksyon, buksan ang parehong address (o bookmark nito). Gumagana ang lahat, kasama ang {{ui:Open the sample site}}.

Ang iba pang estado ng button:

- {{ui:Could not save}}: may ilang file na hindi na-download. Tingnan ang koneksyon at i-click ito para subukan ulit.
- {{ui:Offline not available}}: hindi kayang magtago ng offline na kopya ng window na ito (hinaharangan ito ng mga private window at ng ilang managed computer). Gumamit ng normal na window.

I-click ang {{ui:Offline ready}} para makita kung kailan na-save ang kopya, na may dalawang pagpipilian: {{ui:Save again (get the newest version)}} at {{ui:Remove the offline copy}}. I-save ulit bago ang site visit para tumugma ang kopya sa pinakabagong build. Higit pa sa [Offline](common:offline).

:::offline
Offline ka ngayon. Kung na-save ang CivilCraft para sa offline na paggamit, gumagana ang lahat, kasama ang sample site. Kung hindi, ipagpatuloy ang trabaho sa tab na ito, pero huwag itong i-reload hangga't wala kang koneksyon; kung walang naka-save na kopya, mabibigo ang {{ui:Open the sample site}} na may "The sample could not be loaded".
:::

:::tip
Para sa field use, i-save ang CivilCraft para sa offline na paggamit at dalhin ang iyong point files sa mismong laptop. Ang projects at exports ay sine-save bilang download kahit walang koneksyon, kaya maaari mong i-import ang shots ng isang araw, suriin ang surface, at i-save ang project sa site.
:::

Hindi pa available ang cloud saving, at hindi pa handa ang desktop builds. Sa ngayon, ang mga file na sine-save mo ang tanging kopya: itago ang mga ito sa lugar na may backup.

## Mga add-on na ginagamit ng file

Kapag nag-save ka ng project na may datos mula sa add-on (ang mga tick ng Building regulations, o ang Address to site source), itinatala ng file kung aling add-on at aling bersyon. Kapag binuksan ito sa computer na wala nito, may bar sa itaas ng plano na nagsasabi nito at nag-aalok na idagdag ito mula sa listahan ng iyong account. Tala lang ang record; bubukas ang file sa alinmang paraan.

## Undo mula sa Studio

Sa loob ng CadCraft Studio, bawat hakbang na natapos mo sa CivilCraft ay sinasabi sa Studio, kaya maaaring bawiin ng project-level undo nito ang pinakabagong hakbang sa lahat ng app. Binabawi lang ng Studio ang isang hakbang kapag eksaktong nasa estado iyon ang undo stack ng CivilCraft; pagkatapos mong magbukas ng ibang file, nilalaktawan nito ang window na ito.

## Pagsara na may hindi pa na-save na pagbabago

Kapag may hindi pa na-save na pagbabago ang project at isinara mo ang tab, nire-reload, o umalis sa page, itatanong ng browser kung gusto mo nang umalis. Ang pananalita at itsura nito ay sa browser, at hindi ito mababago ng CivilCraft. Ang {{ui:New}}, at ang pagbubukas ng project o LandXML file, ay nagtatanong sa sariling **Unsaved changes** box ng CivilCraft, na may {{ui:Cancel}}, {{ui:Don’t save}} at {{ui:Save a copy}}.
