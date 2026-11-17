---
title: Buuin at pinuhin ang surface
summary: Paano tina-triangulate ng CivilCraft ang umiiral na lupa, at kung paano ito hubugin gamit ang mga breakline group, iginuhit na breakline, panlabas na boundary at ang pinakamahabang panlabas na gilid.
keywords: tin, surface, triangulation, breakline, boundary, umiiral na lupa, eg, gumawa ng surface, delaunay, triangles, max edge, panlabas na boundary
from: b9eea3f3
---

Mayroong isang umiiral na ground surface bawat proyekto sa CivilCraft. Isa itong TIN (triangulated irregular network) na binuo mula sa mga punto mo, at awtomatikong nag-a-rebuild sa tuwing nagbabago ang isang input. Walang "rebuild" na command at walang lumang surface.

## Ano ang pumapasok sa surface

- Bawat punto na may elevation sa isang group na nakatakda sa {{ui:Points}}.
- Bawat group na nakatakda sa {{ui:Breakline}}, pinagdurugtong ayon sa numero ng punto.
- Bawat breakline na iginuhit mo gamit ang tool na {{ui:Breakline}}.
- Ang panlabas na boundary, kung gumuhit ka nito.
- Ang setting na **Longest outside edge**.

Hindi tumatawid sa breakline ang mga triangle: sinusunod ng surface ang breakline, saka ginagawang pantay hangga't maaari sa paligid nito (Delaunay sa iba pang bahagi).

## Gawing breakline ang mga naka-code na linya

1. Sa kaliwang panel sa ilalim ng **Points**, hanapin ang group (halimbawa FL).
2. Itakda ang **Surface** nito sa {{ui:Breakline}}.
   Nagre-rebuild ang surface, iginuguhit ang linya sa kulay kahel (kapag naka-on ang {{ui:Breaklines}} sa ilalim ng **Display**), at tumataas ng isa ang **Breaklines** sa surface facts.
3. Suriin ang linya sa plano. Dapat itong dumaan mula punto hanggang punto, ayon sa pagkakasunod ng pagkakasukat dito. Kung paliko-liko ito, may higit sa isang linya ang group, o hindi nakanumero nang sunud-sunod ang mga punto: ibalik ang group sa {{ui:Points}} at iguhit ang mga linya nang manu-mano (susunod na seksyon).

## Gumuhit ng breakline sa pamamagitan ng mga punto

1. Pindutin ang {{key:B}}, o i-click ang {{ui:Breakline}} sa grupong **Surface**.
   Sinasabi ng hint: "Breakline: i-click ang mga survey point nang sunud-sunod (kukunin nito ang kanilang elevation). Tapos ang Enter."
2. Ilapit ang pointer sa isang punto. May maliit na kahel na parisukat na nagmamarka sa punto na kukunin nito.
3. I-click ang mga punto ng linya, isa-isa. Pinangalanan ng bawat click ang punto at ang elevation nito sa status bar.
4. Pindutin ang {{key:Enter}} para tapusin.
   Sinasabi ng status bar na "Naidagdag ang Breakline 1; na-rebuild ang surface."

Dapat tumama ang mga click sa survey point na may elevation; ang click sa ibang lugar ay tinatanggihan na may "I-click ang survey point na may elevation: kinukuha ng breakline ang elevation ng mga punto." Inaalis ng {{key:Backspace}} ang huling punto; kinakansela ng {{key:Esc}} ang buong linya.

:::warning
Tapusin gamit ang {{key:Enter}}. Tinatapos din ng double-click, pero sa build na ito ay nabubura nito ang punto na dinoble-click mo. I-click nang isang beses ang huling punto, saka pindutin ang {{key:Enter}}.
:::

Para tanggalin ang lahat ng iginuhit na breakline nang sabay-sabay, i-click ang {{ui:Alisin ang iginuhit na breakline}} sa seksyong **Surface**. Para tanggalin lamang ang huli, gamitin ang {{key:Mod+Z}}. Hindi pa maaaring piliin o i-edit isa-isa ang mga iginuhit na breakline.

## Gumuhit ng panlabas na boundary

Pinuputol ng boundary ang surface sa lugar na pinagkakatiwalaan mo, halimbawa ang limitasyon ng survey, para mawala ang mahahabang triangle sa ibabaw ng mga sulok na hindi nasurvey.

1. Pindutin ang {{key:O}}, o i-click ang {{ui:Boundary}}.
2. I-click ang mga sulok, sunod-sunod sa paligid ng lugar. May ipinapakitang may tuldok na linya ang hugis.
3. Pindutin ang {{key:Enter}}.
   Sinasabi ng status bar na "Naitakda ang boundary; nawala ang mga triangle sa labas nito." Sinasabi ng **Boundary** sa surface facts na "Yes" at kung ilang sulok ito.

Mga dapat tandaan:

- Iisa lang ang boundary. Ang pagguhit ng isa pa ay pumapalit dito. Inaalis ito ng {{ui:Alisin ang boundary}}.
- Pagbabawas lamang ang kaya nito: ang boundary na lumalampas sa mga punto ay pinuputol pabalik sa kanilang outline, may tala na "Lumampas ang boundary sa mga punto; pinutol ito pabalik sa kanilang outline."
- Kinukuha ng mga sulok nito ang elevation nila mula sa surface, kaya tumpak na sinusunod ng gilid ang lupa.
- Hindi pa available ang mga Hide (inner) boundary.

## Putulin ang mahahabang triangle sa labas

Kung walang boundary, pinupuno ng surface ang buong outline ng mga punto, kasama ang mahahaba at manipis na triangle sa ibabaw ng mga malukong gilid.

1. Sa **Surface**, mag-type ng haba sa **Longest outside edge** at pindutin ang {{key:Enter}}. Magsimula sa humigit-kumulang dalawa o tatlong beses ng karaniwang agwat ng iyong pagkakasukat.
2. Tinatanggal ang mga panlabas na triangle na mas mahaba ang panlabas na gilid kaysa roon, unti-unting papasok hanggang sa maging sapat na maikli ang bawat panlabas na gilid. Hindi kailanman tinatanggal ang gilid na breakline.
3. Mag-type ng 0 para ibalik ang lahat ng triangle.

## Basahin ang surface report

Sa ilalim ng surface facts, may kahon na naglilista ng ginawa ng builder. Kapag may ochre na bar sa kaliwa, impormasyon ito; kapag pulang bar, may error ito at walang surface.

| Mensahe | Ibig sabihin |
|---|---|
| "3 punto ang nasa parehong lugar ng iba at sumali dito." | Ang mga punto na mas malapit sa 0.0001 sa plano ay naging iisang vertex (ang una ang itinatago). |
| "2 lugar ang may dalawang magkaibang elevation …" | Ang mga punto na magkapatong, o mga breakline na nagsasalubong, ay hindi nagkakasundo sa taas. Nananaig ang elevation ng breakline, saka ang una. |
| "1 piraso ng breakline ang hindi maipasok sa surface." | Napakaikli o halos nagkakapatong na piraso ng breakline ang hindi kasya; suriin ang lugar na iyon. |
| "Kailangan ng surface ng hindi bababa sa tatlong punto na may elevation." | Kulang ang mga punto: suriin ang pagkakasunod ng column at ang mga group. |
| "Nasa iisang linya ang lahat ng punto: walang triangle." | Walang lapad ang mga punto, halimbawa isang iisang traverse line. |
| "Hindi nagsasalubong ang boundary at ang mga punto." | Nasa ibang lugar ang boundary, kadalasan dahil sa halo ng unit o coordinate. |
| "Walang natirang triangle sa loob ng boundary." | Masyadong maliit o mali ang pwesto ng boundary. |

## Surface na binasa mula sa LandXML

Kapag nagbukas ka ng LandXML, ginagamit ang unang TIN surface nito gaya ng dati: ang heading na **Surface** ay nagsasabing "Surface (from LandXML)" at naka-gray out ang **Longest outside edge**. Habang ginagamit ang surface na iyon, hindi nito binabago ang mga breakline group, iginuhit na breakline at bagong boundary. Para buuin ang surface mula sa mga punto ng file, i-click ang {{ui:Buuin muli ang surface mula sa mga punto}}. Ibinabalik ng {{key:Mod+Z}} ang LandXML surface.

## Kaugnay

- [Basahin ang contours, elevation at slope](topic:contours).
- [Mag-import ng survey points](topic:import-points).
