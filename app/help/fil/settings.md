---
title: Mga setting ng CivilCraft
summary: Piliin ang ayos ng column para sa mga kinopyang at na-paste na row ng point at para sa paghula ng mga column ng file, kung paano nilalagyan ng numero ang mga na-paste na point, ano ang ipinapakita ng point label, ang corner indicator, ang 3D vertical exaggeration, paano ipinapakita ang latitude at longitude, at kung galing sa internet ang map layer.
keywords: settings, preferences, pnezd, penzd, column order, point rows, renumber, point numbers, start number, point labels, labels, description, elevation, view cube, axis icon, corner indicator, compass, vertical exaggeration, 3d, latitude, longitude, dms, decimal degrees, map layers, internet, privacy
from: 64b9cb92
---

Buksan ang {{ui:Settings}} gamit ang gear sa app bar o {{key:Mod+,}}. Ang unang tab, {{ui:CivilCraft}}, ay naglalaman ng mga setting na pag-aari ng app na ito; ang {{ui:General}} ay naglalaman ng mga setting na pinagsasaluhan ng lahat ng CadCraft app (tema, toolbar, panel). Umiiral lamang sa app ang mga setting ng CivilCraft: dito ninyo ito binabago, at naaalala ito ng browser na ito. Ibinabalik ng {{ui:Reset CivilCraft settings}} ang bawat setting sa panimulang lagay nito.

## Mga row ng point

**P, N, E, Z, D** (ang panimula) o **P, E, N, Z, D**: point, northing, easting, elevation, description, o easting bago ang northing. Ginagamit ito sa tatlong lugar:

- **Copy**: ang mga row na inilalagay ng CivilCraft sa system clipboard para sa spreadsheet.
- **Paste**: mga row na na-paste mula sa spreadsheet o text file na walang header row.
- **Import**: ang hula sa dialog na **Import points** kapag walang header row ang file (ang file na may apat na column ay binabasa bilang PENZ, at tatlo bilang ENZ). Tingnan ang [Point file formats](topic:point-file-formats).

Laging nananaig ang header row na nagpapangalan sa mga column nito, at gayundin ang pagpili sa listahan ng **Columns** ng import dialog.

## Mga numero para sa na-paste na point

- **Keep free numbers** (ang panimula): pinapanatili ng na-paste na point ang numero nito kapag walang point ang may hawak nito; tanging ang nagbabanggang point ang nakakakuha ng bagong numero.
- **Always new numbers**: bawat na-paste na point ay binibigyan ng bagong numero, kahit libre pa ang sarili nitong numero.

**New numbers start at**: iwanang walang laman para magbilang mula sa isang numero na higit sa pinakamataas na numerong ginagamit. I-type ang numero, halimbawa 5000, para bigyan ang mga bagong point ng numero simula 5000; nilalaktawan ang mga numerong nagamit na. Hindi kailanman nagkakapareho ang dalawang point ng numero sa alinmang paraan. Tingnan ang [Select, copy and paste survey points](topic:copy-paste-points#point-numbers-never-clash).

## Mga point label

Ang ipinapakita ng point label kapag naka-on ang {{ui:Point labels}} sa ilalim ng **Display**: **Number**, **Number and elevation**, o **Number, elevation and description** (ang panimula). Pareho ang ipinapakita ng DXF, DWG at PDF export na label gaya ng nasa screen.

## Indicator sa sulok

Ano ang nakalagay sa sulok ng plan at ng 3D view: **View cube** (ang panimula), **Axis icon** o **None**.

- **View cube** (kanan sa itaas). Sa plan, ipinapakita nito ang tuktok, kasama ang compass ring: ang N ay grid north (pataas sa plan). I-click ang alinmang ibang gilid, edge o sulok ng cube, o i-drag ito, at magbubukas ang [3D view](topic:site-3d) na nakatingin mula roon. Ang {{ui:Home}} sa plan cube ay nagkakasya sa plan.
- Sa 3D view, umiikot ang cube kasabay ng view: i-click ang isang gilid, edge o sulok para tumingin mula roon, i-drag ang cube para umikot sa paligid, i-drag ang compass ring para umikot sa vertical, i-click ang isang titik para tumingin mula sa gilid na iyon, at gamitin ang {{ui:Home}} para sa iso view ng buong site. Kapag direktang nakatingin sa isang gilid, ang maliliit na arrow ay lumilipat sa susunod na gilid at ang mga kurbadong arrow ay umiikot ng isang kapat na bilog ang view.
- **Axis icon** (kaliwa sa ibaba): isang maliit na marker na X (silangan) at Y (hilaga) sa plan, X, Y at Z (pataas) sa 3D.

## 3D vertical exaggeration

Gaano kalaki ang iniuunat ng 3D view ang mga elevation: **1×**, **2×** (ang panimula), **3×**, **5×** o **10×**. Ang listahan sa bar ng 3D view ay iisang setting, kaya kapag binago ang alinman, nagbabago ang pareho. Nananatili sa tunay na sukat ang mga volume, profile at 3D export.

## Latitude at longitude

Paano ipinapakita ng status bar ang latitude at longitude ng pointer kapag may coordinate system ang proyekto: **degrees, minutes and seconds** (ang panimula, halimbawa `30°18′00.00″ N`) o **decimal degrees** (`30.300000° N`). Tingnan ang [Set the project's coordinate system](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Map layer mula sa internet

**Off** (ang panimula) o **On**. Kapag naka-on, humihiling ang CivilCraft sa mga map server na idinagdag ninyo ng mga larawan ng lugar na nasa screen. Nananatili sa computer na ito ang inyong drawing; nakikita ng server ang lugar at ang inyong internet address. Habang naka-off, walang map server na tinatanong ng anuman, kahit may proyektong binubuksan na nagpapangalan ng isa; gumagana pa rin ang georeferenced na larawan mula sa file sa alinmang paraan. Tingnan ang [Show map layers under the plan](topic:map-layers).

## Mga AI assistant

**Let AI assistants and scripts use CivilCraft** (naka-off sa umpisa) ay nagpapahintulot sa assistant sa inyong computer na maabot ang bukas na site sa pamamagitan ng CadCraft Studio: **Read** ay naglalarawan sa site at nagbibigay ng point, surface elevation, station, profile, volume at parcel; **Edit** ay nagpapahintulot dito na pumili at magdagdag ng survey point; ang **Save** at **Export** ay nagpapahintulot dito na i-save ang proyekto at sumulat ng LandXML o DWG. **Folders it may use** (sa Studio) ang mga lugar kung saan ito puwedeng mag-save at mag-export. Inililista ng **Activity** ang mga tawag nito. Tingnan ang [Let an AI assistant work with your site](topic:assistants).
