---
title: Mag-exchange ng LandXML
summary: Buksan ang LandXML mula sa ibang civil software bilang bagong project, i-export ang mga punto, surface, alignment, profile at pipe network bilang LandXML 1.2, at alamin kung ano ang hindi dadalhin.
keywords: landxml, xml, import, export, exchange, tin, surface, alignment, profile, pipe network, interoperability, pagpapalitan ng data
from: 870d5ece
---

Ang LandXML ang bukas na exchange format na binabasa at isinusulat ng karamihan sa civil program. Nagbabasa at nagsusulat ang CivilCraft ng LandXML 1.2. Kung gumamit ka na ng Civil 3D, ang mga LandXML import at export dialog nito ang pinakamalapit na katulad; dito, walang pagpipiliang kailangang gawin, at sinasabi ng mga tala kung ano ang naiwan.

## Magbukas ng LandXML file

1. I-click ang {{ui:Buksan}} (o pindutin ang {{key:Mod+O}}) at piliin ang `.xml` o `.landxml` na file, o i-drop ito sa plano.
2. Kung may hindi pa nase-save na pagbabago ang kasalukuyang project, unang magtatanong ang CivilCraft. Piliin ang {{ui:I-save ang kopya}}, {{ui:Huwag i-save}} o {{ui:Kanselahin}}.
3. Gagawa ng **bagong project**. Sinasabi ng status bar kung ano ang nabasa, halimbawa "Nabuksan ang site.xml: 412 points, 2 surfaces, 3 alignments."
4. Tingnan ang kahon sa ilalim ng mga detalye ng **Surface**. Inililista nito ang lahat ng nilaktawan o binago, halimbawa:
   - "Ang unang surface lamang ("EG") ang nabuksan; may 1 pa ang file."
   - "Ang alignment na "Ramp A" ay may elementong hindi pa kayang iguhit ng CivilCraft (hindi linya, arko o clothoid spiral); nilaktawan ito."
   - "Walang pipe network rule sa file; ginagamit ang mga placeholder — itakda ang sa iyo sa ilalim ng Project."

Ano ang nagiging ano:

| Sa file | Sa CivilCraft |
|---|---|
| Units (Imperial o Metric) | Ang **Units** ng project (feet o metro) |
| Pangalan ng project | Ang **Name** ng project |
| CgPoints | Ang mga punto ng project; ang paglalarawan (o code) ang nagbibigay ng grupo |
| Ang unang TIN surface | Ang umiiral na ground, ginamit gaya ng dati ("Surface (from LandXML)") |
| Bawat alignment ng linya, arko at clothoid spiral | Isang alignment na may PI, radius at haba ng spiral nito, muling binuo mula sa mga curve |
| Ang unang design profile ng bawat alignment | Ang design profile nito, na may parabolic na vertical curve |
| Ang unang pipe network | Ang pipe network, kasama ang rim, sump at invert nito |
| Plan feature ng linya at arko | Feature line, mga arkong napanatili; mula sa ibang programa, nagsisimula sila bilang **Only drawn** |

Ang buong listahan ng mga elemento at attribute ay nasa [LandXML: ano ang binabasa at isinusulat](topic:landxml-reference).

:::note
Ang surface na nabasa mula sa LandXML ay hindi muling binubuo kapag binago mo ang point group o gumuhit ng breakline. I-click ang {{ui:Buuin muli ang surface mula sa mga punto}} sa seksyong **Surface** para buuin ito mula sa mga punto sa halip ({{key:Mod+Z}} ang magbabalik sa LandXML surface).
:::

## I-export ang LandXML

1. I-click ang {{ui:LandXML}} sa grupong **Export**.
2. Dina-download ng browser ang `<name>.xml`. Sinasabi ng status bar kung ano ang nailagay, halimbawa "Na-export ang LandXML 1.2: 276 points, 2 surfaces, 1 alignment, ang pipe network. Hindi bahagi ng LandXML dito ang mga pad; ang na-grade na surface ay bahagi."

Ang file ay naglalaman ng:

- **Units**: US survey feet o metro.
- **CgPoints**: bawat punto na may numero bilang pangalan, paglalarawan nito, at grupo bilang code.
- **Surfaces**: ang umiiral na ground bilang TIN, kasama ang breakline at outer boundary nito bilang source data; at, kapag may pad o corridor na nagra-grade, pangalawang TIN surface na pinangalanang "Proposed".
- **Alignments**: linya, arko at clothoid spiral kasama ang kanilang station, bawat isa ay may profile na naglalaman ng umiiral na ground na kinuhaan ng sample sa kahabaan nito at ng design profile (PVI at parabolic curve) kapag may kahit dalawang PVI.
- **PipeNetworks**: mga structure kasama ang kanilang rim, sump at invert bawat tubo, at ang mga tubo na may diameter, haba at slope.
- **PlanFeatures**: bawat feature line bilang linya at arko na may elevation sa bawat dulo, at kung saan ito ginagamit.

## Ano ang hindi makakasama sa biyahe

- Mga pad at corridor bilang object. Nasa surface na "Proposed" ang resulta nila.
- Mga alignment na may error (halimbawa, nagkakapatong na curve): hindi isinasama, at binibilang sa status message.
- Mga tubo na walang parehong invert, at mga network na may mas kaunti sa dalawang structure.
- Ang rim na kinuha mula sa surface ay isinusulat bilang nakapirming rim. Kapag binuksan muli, pinananatili ng structure ang numerong iyon kahit magbago ang surface.
- Mga network rule (least slope, cover, drop): walang lugar ang LandXML para sa mga ito.
- Mga display setting at mga pagpili ng surface ng point group: i-save ang CivilCraft project para sa mga ito.

Kapag nagbubukas, hindi binabasa ng CivilCraft ang mga spiral na hindi clothoid, grid surface, punto na tumutukoy lamang sa ibang punto, parcel, spiral sa plan feature, roadway o survey data. Bawat isa ay binabanggit sa mga tala, hindi kailanman hinuhulaan.

## Pabalik-balik na palitan

Para ibigay ang trabaho sa taong gumagamit ng ibang civil software at maibalik ito, i-export ang LandXML, hayaan silang mag-edit, at buksan ang kanilang LandXML bilang bagong project. Panatilihin din ang sarili mong `.civilcraft.json`: ito lamang ang file na nagtatago ng lahat ng alam ng CivilCraft.
