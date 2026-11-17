---
title: Gumawa ng horizontal alignment
summary: Gumuhit ng alignment ayon sa mga PI nito, itakda ang radius ng kurba at ang start station, ilipat ang mga PI, at basahin ang curve data, station at offset.
keywords: alignment, walang solusyon, hindi kasya ang kurba, pinakamalaking radius, pinakamaliit na radius, minimum radius, design speed, overlap, centerline, pi, horizontal curve, radius, stationing, tangent, gumawa ng alignment, layout ng alignment, pc, pt, station offset
from: 8c5df4aa
---

Ang alignment sa CivilCraft ay kadena ng mga tangent sa pamamagitan ng mga point of intersection (PI), na may pabilog na kurba sa anumang panloob na PI na may radius. Naka-station ito mula sa start station na pipiliin mo. Maraming alignment ang maaaring nasa isang proyekto.

## Gumuhit ng alignment

1. Pindutin ang {{key:A}}, o i-click ang {{ui:Alignment}} sa grupong **Design**.
   Sinasabi ng hint: "Alignment: i-click ang mga PI nang sunud-sunod. Enter o double-click ang tapos, Backspace ang huli, Esc ang pagkansela."
2. I-click ang unang PI (ang simula ng alignment).
3. I-click ang bawat susunod na PI nang sunud-sunod. Sumusunod ang pulang linya sa pointer at ipinapakita ang haba at bearing ng tangent na iginuguhit mo, halimbawa "212.40 ft  N 63°12'05" E".
4. I-click ang huling PI (ang dulo ng alignment).
5. Pindutin ang {{key:Enter}}.
   Iginuhit ang alignment na may stationing at napili ito. Sinasabi ng status bar, halimbawa, "Alignment 1: 386.36 ft, mga kurbang 100 ft ang radius kung saan ito kasya. I-edit ang radius sa Properties; Profile (R) para idisenyo ang grade nito."

Habang gumuguhit: inaalis ng {{key:Backspace}} ang huling PI, kinakansela ng {{key:Esc}}, at ang pag-drag sa bakanteng espasyo ay nag-pa-pan nang hindi nagdaragdag ng PI.

:::warning
Tapusin gamit ang {{key:Enter}}. Tinatapos din ng double-click, pero sa build na ito ay nabubura nito ang PI na dinoble-click mo. I-click nang isang beses ang huling PI, saka pindutin ang {{key:Enter}}.
:::

Bawat panloob na PI ay binibigyan ng kurba na 100 ft (30 m sa proyektong metro), o ang pinakamalaking buong radius na kasya sa kalahati ng bawat tangent kung hindi kasya ang 100 ft. Ang napakatalim o diretsong PI ay walang kurba.

## Itakda ang radius at coordinates

Kapag napili ang alignment, ipinapakita ng kanang panel ang **Alignment**:

1. **Pangalan** at **Start station**. I-type ang station bilang `10+00` (feet) o `0+500` (metro), o bilang simpleng numero. Tingnan ang [Mga unit, station at format ng numero](topic:units-and-stations).
2. Ang **Haba** at **End station** ay kinakalkula para sa iyo.
3. Ipinapakita ng talaan ng **PIs** ang **Easting** at **Northing** ng bawat PI, at ang **Radius** ng bawat panloob na PI. I-type ang bagong halaga at pindutin ang {{key:Enter}}.
   - Ang radius na 0 ay gumagawa ng angle point na walang kurba.
   - Hindi kailanman nagkakaroon ng radius ang una at huling PI.
   - Inaalis ng maliit na x sa dulo ng hilera ang PI na iyon (hindi bababa sa dalawa ang kailangan ng alignment).
4. Basahin ang listahan ng **Curves**: para sa bawat kurba, ang PC at PT station nito, radius R, deflection Δ at direksyon (kaliwa o kanan), haba L, tangent T, external E at chord.
5. Ang linyang nasa ilalim ng mga kurba ay nagbibigay ng bearing ng unang tangent.

## Kapag hindi kasya ang kurba

Kung kailangan ng mga kurba ng mas maraming tangent kaysa sa mayroon sa pagitan ng mga PI nila, walang solusyon ang alignment: hindi ito tama ang pagkaguhit hangga't hindi mo ito naaayos, at hindi ito isinasama sa mga LandXML export. Nagpapakita ang pulang kahon ng dahilan, sa mga numero, at nag-aalok ng kung ano ang kasya:

- "Kailangan ng mga kurba sa PI 2 at PI 3 ng 240.00 ft na tangent sa pagitan nila (130.00 + 110.00), pero 180.00 ft ang layo ng mga PI." — o, kapag isa lang sa kanila ang may kurba, "Kailangan ng kurba sa PI 2 ng 240.00 ft na tangent patungo sa PI 1 …".
- May button para sa bawat PI na nagtatakda ng **pinakamalaking radius na kasya** doon, habang nananatiling pareho ang kabilang kurba (dapat ding kasya sa isa pang tangent ng PI). Kapag may kurba ang dalawang PI, pinaliliit ng **Both** ang dalawang radius nang proporsyonal para magdikit lang sila.
- Kapag mas mahaba sa tangent ang isang kurba lang, sinasabi ng kahon na walang kurba sa kabilang PI ang kasya habang ganito kalaki ito.
- Hindi maaaring lagyan ng kurba ang PI na biglang bumabalik; iniaalok ng kahon ang **No curve at PI n**.

Isang hakbang ang bawat button: ibinabalik ng {{key:Mod+Z}} ang mga radius. Ibinababa sa 0.01 ang mga radius na iniaalok para laging kasya ang mga ito.

### Pinakamababang radius ng disenyo

I-type ang **Design minimum radius** (halimbawa mula sa design speed mo) para masuri ang bawat kurba laban dito; iwanang walang laman kung wala. Ang kurbang mas mababa dito ay nakalista na may button para sa **pinakamaliit na radius na tumutugon sa minimum**, kapag kasya ang radius na iyon. Kapag hindi ito kasya, sinasabi ng kahon at ibinibigay ang pinakamalaking radius na pinapayagan ng mga tangent, para malaman mong ilipat ang isang PI o ibaba ang minimum.

## Ilipat ang mga PI sa plano

1. Habang aktibo ang {{ui:Select}}, i-click ang alignment para piliin ito. Lumilitaw ang mga square grip sa mga PI nito.
2. I-drag ang isang grip. Susunod ang alignment, ang stationing, profile at corridor nito.
3. Bitawan. Isang hakbang sa undo ang paggalaw.

Hindi pa available ang pagdaragdag ng PI sa pagitan ng dalawang umiiral na PI: burahin ang alignment at iguhit muli, o i-type ang bagong coordinates ng mga PI na mayroon ka.

## Basahin ang station at offset

Ilagay ang pointer sa ibabaw ng plano. Ipinapakita ng status bar ang pinakamalapit na alignment (o ang napili) kasama ang station at offset, **L** o **R** habang tumitingin pa-up-station, halimbawa "Alignment 1: Sta 2+15.30, offset 18.42 R". Kapag lampas sa alinmang dulo, idinadagdag nito ang "(beyond the end)".

## Ano ang iginuguhit

Sa plano, sa DXF at sa PDF: ang centerline (tangent bilang linya, kurba bilang totoong arko), isang tik kada 50 ft (20 m) na may mas mahabang tik at label ng station kada 100 unit, at mga tik ng PC at PT na may label ng kanilang station.

## Burahin ang alignment

Piliin ito at pindutin ang {{key:Delete}}, o i-click ang {{ui:Delete}} sa toolbar o sa ibaba ng kanang panel. Kasama nitong mabubura ang profile at corridor nito. Ibinabalik ito ng {{key:Mod+Z}}.

:::mac
Sa Mac keyboard, ang key na may label na **delete** ay {{key:Backspace}} para sa browser at hindi nito binubura ang napiling bagay. Pindutin ang {{key:Delete}} (Fn at delete), o gamitin ang button na {{ui:Delete}}.
:::

## Susunod

- [Magdisenyo ng vertical profile](topic:profile).
## Design speed at klase

Sa ilalim ng Properties ng alignment, ang **Design speed** (km/h o mph) at **Design class** ay itinatago kasama ng alignment, sine-save sa proyekto at isinusulat sa IFC (Pset_RoadDesignCriteriaCommon). Walang talaang nag-uugnay ng bilis sa minimum na radius ang CivilCraft, kaya walang sinusuri mula sa mga ito: itakda ang **Minimum radius** ayon sa sarili mong design standard.

## Spirals

Maaaring may clothoid spiral sa alinmang dulo ang isang kurba: tangent, spiral, kurba, spiral, tangent. Sa talaan ng PI, mag-type ng haba sa **Spiral in** at **Spiral out** para sa PI na may radius. Nananatili kung nasaan ang PI; lumalapit ang kurba para magkaroon ng puwang, kaya lumalaki ang distansya ng tangent ayon sa offset ng spiral. Maaaring magkaiba ang dalawang haba, at ang PI na may isang haba lang ay magkakaroon ng spiral sa dulong iyon lamang.

Ang listahan ng kurba ay nagbabasa na ngayon ng TS, SC, CS at ST (tangent hanggang spiral, spiral hanggang kurba, kurba hanggang spiral, spiral hanggang tangent) kasama ang anggulo ng spiral θs, ang mga distansya ng tangent at ang external distance. Tumatakbo ang mga station sa kahabaan ng mga spiral gaya ng ibang lugar. Tinatanggihan ang mga spiral na pinagsamang mas malaki ang lihis kaysa sa kurba, kasama ang PI na pinangalanan; ang spiral na mas mahaba sa pinapayagan ng tangent ay overlap, gaya ng alinmang kurba. Ginagamit ng superelevation ang spiral bilang runoff nito (tingnan ang [Corridor](topic:corridor)).
