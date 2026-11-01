---
title: Mga file na mabubuksan, mai-save at ma-export
summary: Point file, LandXML at CivilCraft project ang pumapasok; project, LandXML, DXF at PDF ang lumalabas; ano ang iniingatan ng bawat isa, saan napupunta ang mga file, at ano ang nagbabago offline.
keywords: buksan, i-save, i-export, i-import, format ng file, csv, txt, landxml, xml, dxf, pdf, json, download, project file
from: a7debb61
---

Nagbubukas ang CivilCraft ng mga file mula sa iyong computer at nagse-save sa pamamagitan ng pag-download ng mga file pabalik dito. Walangina-upload at walang itinatago sa server. Tingnan din ang [Ang iyong mga file](common:your-files).

## Ano ang nagbubukas

I-click ang {{ui:Buksan}} (o pindutin ang {{key:Mod+O}}) at pumili ng file, o i-drag ang file mula sa {{pick:mac=Finder|windows=File Explorer|linux=ang file manager mo}} papunta sa plan. Isang file kada beses; ang mga file na mahigit 200 MB ay hindi tinatanggap.

| Uri | Mga pangalan ng file | Ang mangyayari |
|---|---|---|
| Point file | `.csv`, `.txt`, `.pnt`, `.xyz` (anumang text file) | Magbubukas ang dialog na **I-import ang mga punto**. Papalitan ng mga ito ang mga punto ng project; mananatili ang mga alignment, pad at tubo. |
| LandXML | `.xml`, `.landxml` | Gagawa ng **bagong project** mula sa file (tatanungin ka muna kung may hindi pa na-save sa kasalukuyan). |
| CivilCraft project | `.civilcraft.json` (anumang `.json`) | Bubukas ang project gaya ng pagkaka-save nito (tatanungin ka muna kung may hindi pa na-save sa kasalukuyan). |

Tinutukoy ng CivilCraft ang uri ng file ayon sa dulo ng pangalan nito, at pagkatapos ayon sa mga unang karakter nito: ang text na nagsisimula sa `{` ay binabasa bilang project, ang nagsisimula sa `<` bilang LandXML, at ang iba ay bilang point file. Ang file na naka-gray out sa kahon ng pagbubukas ay maaari pa ring i-drop sa plan.

:::note
Kapag nag-import ka ng point file sa project na may mga punto na, papalitan ang mga ito nang hindi nagtatanong, at mabubura ang undo history (ang pagbubukas ng anumang file ay bagong simula para sa undo). Kung galing sa LandXML ang surface, ibabalik ng pag-import ng mga punto ang surface sa surface na gawa sa mga punto. I-save muna kung baka gusto mong bumalik ang lumang mga punto.
:::

Detalye: [Mga format ng point file](topic:point-file-formats), [LandXML: ano ang binabasa at isinusulat](topic:landxml-reference).

## Ano ang sine-save

{{ui:I-save}} ({{key:Mod+S}}) ay sumusulat ng dalawang file nang magkatabi, na ipinangalan sa **Pangalan** sa kaliwang panel: `<name>.civilcraft.json`, ang project na patuloy mong ie-edit, at `<name>.ifc`, ang parehong disenyo bilang IFC 4.3 para sa ibang gumagamit (tingnan ang [Pag-export at pag-import ng IFC](topic:ifc)). Itinatala ng bawat file ang isa, at may dala ring naka-compress na kopya ng project ang IFC, kaya kapag ipinadala ang IFC nang mag-isa ay mabubuksan pa rin itong ganap na naeedit.

- **Sa Studio** ay isinusulat ang dalawang file nang magkatabi, sa mismong lugar.
- **Sa Chrome at Edge** ang unang I-save ay magtatanong ng folder at isusulat ang dalawa roon; ang mga susunod na save ay mapupunta sa parehong folder. I-cancel ang tanong tungkol sa folder para i-download na lang ang dalawa.
- **Sa ibang browser** dina-download ang dalawang file, unang ang project file.

Kapag may binuksan kang isa sa dalawa, hinahanap nito ang kasama. Buksan ang dalawa nang sabay (o i-drop ang dalawa), o isa lang: sa Studio, makikita ang kasama sa parehong folder; sa browser, magtatanong ang CivilCraft kung idaragdag ito, o itutuloy sa hawak mo. Kung binago ng ibang program ang IFC pagkatapos itong i-save ng CivilCraft, o mas luma ang isang file kaysa sa isa, bubukas ang project mula sa mas bagong disenyo at sasabihin ng panel ng Problema kung ano ang nangyari, kasama ang **I-save ngayon** (muling isinusulat ang dalawang file) at **Ipakita ang geometry ng IFC bilang reference**. Ang IFC na mag-isa at binago ng ibang program ay bumubukas mula sa kopya nitong project kasama ang mga tugma pa rin: ang mga alignment na binago nito ay kukuha ng geometry nito, ang mga bagay na tinanggal nito ay hindi isasama, at ang iba pang pagbabago nito ay nakalista, hindi kinuha. Bumubukas gaya ng dati ang project file mula bago ang 0.7.1.

Iniingatan ng project file ang:

- bawat punto (numero, coordinates, elevation, deskripsyon) at ang pangalan ng point file na pinanggalingan nila
- ang mga setting ng surface: mga pinili sa grupo, mga iginuhit na breakline, ang boundary, ang pinakamahabang panlabas na gilid, at isang TIN na binasa mula sa LandXML
- ang mga setting ng display
- mga alignment kasama ang kanilang mga PI, radius at start station, ang kanilang design profile (mga PVI at haba ng curve), at mga setting ng corridor
- mga pad at ang network ng tubo kasama ang mga patakaran nito

Hindi nito iniingatan ang undo history. Hindi naka-imbak ang mga surface, contour, daylight line at volume; muling binubuo ang mga ito mula sa mga na-save na input kapag nagbukas ang project. Tinatanggihan ang project file mula sa mas bagong CivilCraft, na may mensaheng nagsasabi ng bersyon nito.

## Ano ang ine-export

| Pindutan | File | Nilalaman |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: mga punto, ang umiiral na ground (at ang graded surface kung mayroon) bilang TIN surface, mga alignment, ground at design profile, ang network ng tubo |
| {{ui:DXF}} | `<name>.dxf` | R12 DXF ng linya ng plan gaya ng nakikita, sa mga pinangalanang layer |
| {{ui:DWG}} | `<name>.dwg` | Parehong linya bilang DWG drawing, sa format na pipiliin mo (2000 hanggang 2018) |
| {{ui:PDF}} | `<name>.pdf` | Vector plot ng plan sa isang sheet, sa scale na pipiliin mo |
| {{ui:GLB}} o {{ui:OBJ}} (sa bar ng 3D view) | `<name>-3d.glb`, `<name>-3d.obj` | Ang ipinapakita ng 3D view bilang 3D model: sa metro, Y pataas, totoong scale, sa paligid ng naitalang local origin |

Ano ang hindi isinasama ng bawat isa: [Exchange LandXML](topic:landxml), [I-export ang plan sa DXF](topic:dxf-export) (pati DWG), [I-plot ang plan sa PDF](topic:plot-pdf), [I-export ang site sa 3D](topic:export-3d).

## Saan napupunta ang mga file

Ang mga na-save at na-export na file ay napupunta kung saan inilalagay ng browser mo ang mga download, kadalasan sa folder na Downloads. Para pumili ng folder sa bawat pagkakataon:

:::chromium
Buksan ang **Settings** ng browser, pagkatapos ang **Downloads**, at i-on ang **Ask where to save each file before downloading**.
:::

:::firefox
Buksan ang **Settings**, pagkatapos ang **General**, at sa ilalim ng **Files and Applications** piliin ang **Always ask you where to save files**.
:::

:::safari
Buksan ang **Safari > Settings > General** at itakda ang **File download location** sa **Ask for each download**.
:::

Kung dalawang beses kang nag-save gamit ang parehong pangalan, maaaring lagyan ng numero ng browser ang pangalawang file, halimbawa `Site (1).civilcraft.json`. Buksan ang pinakabago sa susunod.

## Online at offline

Sa computer mo lang gumagana ang CivilCraft sa alinmang paraan: binabasa ng browser ang file kapag binubuksan, at dina-download ito kapag ni-save. Para mabuksan ang CivilCraft nang walang anumang koneksyon, i-save muna ito para sa offline na paggamit:

1. Habang online, i-click ang {{ui:I-save para sa offline}} sa app bar sa itaas.
2. Nagbibilang ang button ("Saving 12 of 30") at pagkatapos ay ipinapakita ang {{ui:Handa offline}}. Maliit ang CivilCraft (mga 0.6 MB), kaya may kaunting hintay ito. Kasama sa na-save na kopya ang help na ito at ang sample site.
3. Kapag walang koneksyon, buksan ang parehong address (o bookmark nito). Gumagana ang lahat, kasama ang {{ui:Buksan ang sample site}}.

Ang iba pang estado ng button:

- {{ui:Hindi na-save}}: may ilang file na hindi na-download. Tingnan ang koneksyon at i-click ito para subukang muli.
- {{ui:Hindi available ang offline}}: hindi kayang magtago ng offline na kopya ng window ng browser na ito (hinaharangan ito ng private window at ilang managed na computer). Gumamit ng normal na window.

I-click ang {{ui:Handa offline}} para makita kung kailan na-save ang kopya, na may dalawang pagpipilian: {{ui:I-save ulit (kunin ang pinakabagong bersyon)}} at {{ui:Alisin ang offline copy}}. I-save ulit bago bumisita sa site para tumugma ang kopya sa pinakabagong build. Higit pa sa [Offline](common:offline).

:::offline
Offline ka na ngayon. Kung na-save ang CivilCraft para sa offline na paggamit, gumagana ang lahat, kasama ang sample site. Kung hindi, ituloy ang trabaho sa tab na ito, pero huwag itong i-reload hangga't hindi ka online ulit; kung walang na-save na kopya, mabibigo ang {{ui:Buksan ang sample site}} at lalabas ang "The sample could not be loaded".
:::

:::tip
Para sa field na gamit, i-save ang CivilCraft para sa offline na paggamit at dalhin ang iyong point file sa mismong laptop. Dina-download ang mga project at export kahit walang koneksyon, kaya maaari mong i-import ang mga kuha ng isang araw, suriin ang surface, at i-save ang project sa site.
:::

Wala pang cloud saving, at wala pa ring desktop build. Sa ngayon, ang mga file na ise-save mo ang tanging kopya: itabi ang mga ito sa lugar na may backup.

## Mga add-on na ginagamit ng file

Kapag nag-save ka ng project na may datos mula sa add-on (ang mga tick ng Building regulations, o ang Address to site source), itinatala ng file kung aling mga add-on at aling bersyon ang ginamit. Kapag binuksan ito sa computer na wala nito, sasabihin ng bar sa itaas ng plan at mag-aalok na idagdag ito mula sa listahan ng account mo. Tala lamang ang record; bubukas pa rin ang file.

## Undo mula sa Studio

Sa loob ng CadCraft Studio, sinasabi sa Studio ang bawat hakbang na natapos mo sa CivilCraft, para ang project-level undo nito ay maibalik ang pinakahuling hakbang sa lahat ng app. Ibinabalik lang ng Studio ang isang hakbang kapag eksaktong pareho pa rin ang undo stack ng CivilCraft gaya ng iniwan ng hakbang na iyon; pagkatapos mong magbukas ng ibang file, nilalaktawan nito ang window na ito.

## Pagsara na may hindi pa na-save na pagbabago

Kapag may hindi pa na-save na pagbabago ang project at isinara mo ang tab, nire-reload, o umalis sa page, magtatanong ang browser kung gusto mo bang umalis. Ang pananalita at itsura nito ay sa browser at hindi mababago ng CivilCraft. Ang {{ui:Bago}}, at ang pagbubukas ng project o LandXML file, ay nagtatanong sa sarili nitong kahon ng **Hindi pa na-save na pagbabago** ng CivilCraft, na may {{ui:Kanselahin}}, {{ui:Huwag i-save}} at {{ui:I-save ang kopya}}.
