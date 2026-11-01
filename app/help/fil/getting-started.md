---
title: Pagsisimula sa CivilCraft
summary: Ano ang ginagawa ng CivilCraft, paano ito buksan, at ang unang sampung minuto kasama ang sample site, mula sa mga punto hanggang contour, kalsada at naka-save na project.
keywords: simula, unang pagpapatakbo, sample site, panimula, mabilis na pagsisimula, tutorial, magsimula, bagong project
from: c9b6dd8e
---

Ang CivilCraft ay ang app para sa civil at site design ng pamilyang CadCraft. Kumukuha ito ng survey point at ginagawa itong surface (isang TIN) na may contour, saka ka nagla-layout ng alignment na may design profile, nag-i-sweep ng simpleng corridor ng kalsada, nag-a-grade ng building pad hanggang sa daylight, sinusuri ang gravity na network ng tubo laban sa iyong mga patakaran, at nakikita ang cut at fill volume. Nagbabasa at nagsusulat ito ng LandXML, nag-e-export ng plan bilang DXF, at nag-p-plot nito sa PDF.

Kung nagamit mo na ang Civil 3D, pamilyar sa iyo ang mga konsepto: punto, grupo ng punto, breakline, alignment ayon sa PI, profile ayon sa PVI, corridor, grading, network ng tubo. Iba at mas maliit ang paraan ng pagtatrabaho: walang command line, walang style, at walang drawing file. Basahin minsan ang [Coming from other civil software](topic:coming-from) bago ang una mong totoong trabaho.

## Ano ang kailangan mo

- Isang kamakailang desktop browser: Chrome, Edge, Firefox o Safari. Tingnan ang [Browsers](common:browsers).
- Mouse o trackpad at keyboard, o touch screen: may on-screen na {{ui:Tapusin}}, {{ui:Bawiin ang punto}} at {{ui:Kanselahin}} na button ang pagguhit doon (tingnan ang [Mouse, trackpad and touch](topic:keyboard#mouse-trackpad-and-touch)).
- Ang plan ay iginuguhit sa 2D gamit ang canvas ng browser. Ang [3D view](topic:site-3d) ay gumagamit ng WebGL graphics ng browser; kapag hindi ito makapagsimula, sasabihin ng status bar kung bakit, at gumagana pa rin ang plan.
- Walang account at walang upload. Nagbubukas ang mga file sa computer mo at nagse-save bilang download. Tingnan ang [Ang iyong mga file](common:your-files).

:::note
Sa ngayon, tumatakbo ang CivilCraft bilang maagang browser build na ginagawa pa. Wala pa ring desktop build, at wala pa ring cloud saving. Lahat ng ginagawa mo ay nananatili sa computer mo hanggang i-save o i-export mo ito.
:::

## Buksan ang CivilCraft

1. Buksan ang CivilCraft sa browser mo.
2. Hintayin na mapuno ang screen: isang toolbar sa itaas, isang panel sa kaliwa, ang plan sa gitna, at isang panel na **Properties** sa kanan.
3. Sa walang lamang plan, makikita mo ang kahon na may pamagat na **Magsimula sa survey points**. Nakalista rito ang mga unang hakbang at may link, ang {{ui:Buksan ang sample site}}.

Para magamit ang CivilCraft nang walang koneksyon sa susunod, i-click ang {{ui:I-save para sa offline}} sa app bar at hintayin ang {{ui:Handa offline}}. Kasama rito ang help na ito, ang sample site, at ang 3D at GIS library. Tingnan ang [Offline](common:offline). Pindutin ang {{key:F1}} o i-click ang {{ui:Tulong}} anumang oras para buksan ang help na ito sa tabi ng app.

## Ang unang sampung minuto: ang sample site

Ang sample site ay maliit na survey na nasa US feet: 276 na punto sa state plane coordinates, isang ridge, isang swale na may flowline, at dalawang top of bank. Kasama ito ng app, kaya masusundan mo ito nang walang sarili mong file.

1. I-click ang {{ui:Buksan ang sample site}} sa kahon sa plan.
   Bubukas ang dialog na **I-import ang mga punto**. Sinasabi nito ang "276 na punto ang nabasa bilang PNEZD (mula sa header row), pinaghihiwalay ng kuwit." at ipinapakita ang unang mga hilera.
2. I-click ang {{ui:I-import}}.
   Mapupuno ng mga punto, contour at surface edge ang plan. Sasabihin ng status bar sa ibaba na na-import ang mga punto at kung ilang triangle ang surface (546).
3. Tingnan ang kaliwang panel sa ilalim ng **Mga punto**. Pinagpangkat ang mga punto ayon sa unang salita ng deskripsyon nila: CP, FL, GRD, RIDGE, TBN, TBS at TREE.
4. Sa column na **Surface** ng table na iyon, itakda ang **FL**, **RIDGE**, **TBN** at **TBS** sa {{ui:Breakline}}.
   Agad na binubuo muli ang surface. Ang mga fact ng **Surface** ay nagsasabing "Breaklines: 4", at ang mga contour ay biglang yumuyuko sa kahabaan ng flowline at ridge sa halip na tumawid sa mga ito.
5. Ilipat ang pointer sa ibabaw ng plan. Ipinapakita ng status bar ang easting at northing sa ilalim ng pointer at ang ground elevation doon.
6. Sa ilalim ng **Display**, itakda ang {{ui:Contour bawat}} sa 0.5 ft at i-on ang {{ui:Elevation bands}}. Lilitaw ang color ramp na may legend sa ilalim ng mga checkbox. I-off ulit ang mga band kapag tapos ka na.

Mayroon ka nang umiiral na ground surface. Susunod, isang kalsada.

## Mag-layout ng maikling kalsada

1. Pindutin ang {{key:A}} (o i-click ang {{ui:Alignment}} sa grupong **Design**).
2. I-click ang tatlong punto sa buong site, isa-isa. May pulang linyang sumusunod sa pointer at ipinapakita ang haba at bearing ng susunod na tangent.
3. Pindutin ang {{key:Enter}} para tapusin.
   Lumilitaw ang alignment na may stationing. Ipinapakita ng kanang panel ang **Alignment**: haba nito, ang PI table, at ang curve sa gitnang PI (radius na 100 ft, o mas maliit kung hindi kasya ang 100 ft).
4. Sa kanang panel, sa ilalim ng **Design profile**, i-click ang {{ui:Simulan mula sa ground}}.
   Bubukas ang profile view sa ilalim ng plan na may umiiral na ground at tuwid na design grade mula dulo hanggang dulo.
5. Pindutin ang {{key:I}} para i-on ang {{ui:Magdagdag ng PVI}}, saka i-click nang isang beses sa profile view malapit sa gitna. Lumilitaw ang isang PVI.
6. Sa PVI table sa kanan, mag-type ng haba ng curve (halimbawa 100) sa kahon na **Curve L** ng gitnang PVI at pindutin ang {{key:Enter}}. May vertical curve na ang profile, na may label ang K value nito.
7. Sa ilalim ng **Corridor**, lagyan ng tick ang **Sweep an assembly along the design profile**.
   Ang kalsada ay ina-grade sa ground: mga lane, shoulder at side slope hanggang daylight. Ipinapakita ng block na **Earthwork** ang cut at fill.

Huwag mag-alala sa eksaktong halaga. Maaaring baguhin ang bawat numero sa kanang panel, at binabawi ng {{key:Mod+Z}} ang huling pagbabago.

## I-save ang iyong gawa

1. Mag-type ng pangalan sa **Pangalan** sa itaas ng kaliwang panel.
2. Pindutin ang {{key:Mod+S}} (o i-click ang {{ui:I-save}}).
   Dina-download ng browser ang file na ipinangalan sa site, na nagtatapos sa `.civilcraft.json`. Naglalaman ito ng mga punto, mga setting ng surface, alignment, profile, corridor, pad at tubo.
3. Para magpatuloy sa susunod, i-click ang {{ui:Buksan}} (o pindutin ang {{key:Mod+O}}) at piliin ang file na iyon, o i-drop ito sa plan.

:::warning
Walang awtomatikong pag-save. Kapag isinara mo ang tab na may hindi pa na-save na pagbabago, magtatanong ang browser kung gusto mong umalis; kapag umalis ka, mawawala ang mga pagbabago. Madalas mag-save.
:::

## Saan pupunta susunod

- [I-import ang survey points](topic:import-points) gamit ang sarili mong mga file.
- [Buuin at pinuhin ang surface](topic:build-surface) gamit ang breakline at boundary.
- [Ang screen, bahagi-bahagi](topic:workspace).
- [Mga key at mouse](topic:keyboard).
