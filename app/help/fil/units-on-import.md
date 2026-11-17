---
title: Mga unit sa import: may sinasabi ang file tungkol sa unit nito, o tatanungin ka muna
summary: Kapag ang drawing o mesh na dinadala mo sa project ay nagsasabi ng unit nito, kino-convert ito ng CivilCraft at sinasabi iyon. Kapag hindi, magtatanong muna ang CivilCraft bago ito basahin at tatandaan ang sagot mo para sa file na iyon.
keywords: mga unit, import, DWG, DXF, STL, OBJ, survey, feet, US survey feet, metro, milimetro, scale, maling laki, masyadong malaki, masyadong maliit, tanong, tanda, INSUNITS, drawing units
from: 60921963
---

## Ano ang gagawin mo

Magdala ng file sa project at tiyaking tama ang laki nito pagpasok.

## Mga hakbang

1. Buksan ang file gaya ng dati: {{ui:Buksan}}, i-drop ito sa plano, o gamitin ang CAD drawing command.
2. Kung nagsasabi ang file ng unit nito, walang itatanong: ipapakita ito ng import dialog bilang **Ayon sa drawing**.
3. Kung hindi, magtatanong ang dialog ng **Mga unit ng** file bago magbukas ang import dialog. Piliin kung ano ang isang unit sa file at i-click ang {{ui:Gamitin ang mga unit na ito}}.
4. {{ui:Kanselahin}} (o {{key:Esc}}) ay lalaktawan ang file. Walang nabasang bahagi nito papasok sa project.

## Aling mga file ang nagsasabi ng kanilang unit

- **DWG at DXF**: ang insertion units ng drawing (`$INSUNITS`). Tinatanong ang file na walang ito. Ang listahang **Drawing units** sa import dialog ay nagsisimula sa sagot mo at puwede pa ring baguhin.
- **STL at OBJ** (free-form na hugis ng landscape): hindi kailanman nagsasabi ng unit. Tinatanong ka.
- **Listahan ng points** (CSV, TXT) at progress survey list: ang listahang nagsasabi ng unit nito sa unang mga linya ay kino-convert, at sinasabi iyon ng status line. Ang walang sinasabi ay tinatanong kapag pinindot mo ang {{ui:I-import}}, bago pumasok ang mga point. Ang latitude at longitude column ay dumadaan sa coordinate system sa halip.
- **Ang Point clouds add-on**: nagtatanong kapag gumawa ka ng cloud na walang sinasabing unit ang file, at nilalagyan ng label ang mga numero ng cloud sa unit na dala nito.
- **IFC at LandXML**: sinasabi ang sa kanila; kino-convert ang mga ito sa mga unit ng project.
- **LAS, LAZ, at elevation raster**: inilalagay ayon sa coordinate system nila; tinatanong ng terrain dialog ang elevation unit kapag hindi ito sinasabi ng file.

## Mabuting malaman

- Naaalala ang sagot para sa file na iyon sa computer na ito, sa bawat CadCraft app. Sa susunod na pumasok ito, hindi ka na tatanungin.
- Para tanungin ulit: ang command palette ({{key:Mod+K}}) › **Tanungin ulit ang mga unit ng mga na-import na file**.
- Ang unit na sinasabi ng listahan ay binabasa mula sa unang walong linya nito: halimbawa ng linyang `units: ft`, o mga column heading na pareho ang unit sa loob ng bracket, gaya ng `Elevation (m)`.
