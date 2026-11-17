---
title: Galing sa ibang civil software
summary: Paano nagkakatugma ang mga pamilyar na civil design workflow sa CivilCraft, at ang mga pagkakaiba na nakakalito sa mga bihasang user sa unang oras.
keywords: paglipat, migrate, pamilyar, pagkakaiba, workflow, commands, pagma-map, cogo, corridor, grading, pipe network, styles, command line
from: feae37d6
---

Kung gumamit ka na ng Civil 3D, alam mo na ang mga ideya sa CivilCraft: mga punto at point group, TIN surface na may breakline at boundary, alignment ayon sa PI, profile ayon sa PVI, assembly na inihahagis sa mga corridor, grading hanggang daylight, gravity pipe network, LandXML. Ang iba ay halos lahat ng nakapaligid sa mga ito: walang drawing file, walang command line (maliban kung pipiliin mo ang menu style na {{ui:Drafting classic}}), walang style, walang Prospector at walang settings dialog. Maliit at nakatutok na tool sa browser ang CivilCraft, at sa build na ito ay kaunti lamang ng ginagawa ng isang buong civil package. Ipinapakita ng pahinang ito kung paano nakamapa sa alam mo ang nandito.

:::tip
Kung gusto mo ang ribbon ng Civil 3D, piliin ang menu style na {{ui:Civil ribbon}} sa {{ui:Mga setting}} › {{ui:CivilCraft}} › {{ui:Mga menu, key at mouse}}: mga tab na Home, Surfaces, Modify, Geolocation, View at Output, ang gitnang button ang nag-pa-pan, at ang {{key:Shift}} kasama ang gitnang button ang nag-o-orbit sa 3D view. Kung nagta-type ka ng mga command, nagdaragdag ang {{ui:Drafting classic}} ng command line (ALIGNMENT, PAD, PROFILE, ZOOM …). Tingnan ang [Mga menu, key at mouse](topic:menus-keys-and-mouse).
:::

## Mapa ng workflow

| Ang gusto mong gawin | Pamilyar na paraan | Sa CivilCraft |
|---|---|---|
| Mag-import ng survey points | Mag-import ng point file format | {{ui:Buksan}}, saka tingnan ang pagkakasunod ng column sa **Import points** ([Mag-import ng survey points](topic:import-points)) |
| Pag-uri-uriin ang mga punto | Point group, description key | Awtomatikong group ayon sa unang salita ng deskripsyon; walang description key |
| I-edit ang isang punto | Point editor, grip | I-click ito at mag-type sa Properties, o i-drag ([I-edit ang survey point](topic:edit-points)) |
| Buuin ang umiiral na lupa | Gumawa ng surface, magdagdag ng point group bilang data | Awtomatiko: nagre-rebuild ang surface sa tuwing nagbabago ang mga input nito |
| Magdagdag ng breakline | Magdagdag ng breakline mula sa polyline o feature line | Itakda ang point group sa {{ui:Breakline}}, o i-click ang mga punto gamit ang tool na {{ui:Breakline}} ({{key:B}}) |
| Putulin ang surface | Panlabas na boundary, hide boundary, pinakamahabang triangle | {{ui:Boundary}} ({{key:O}}, panlabas lamang) at **Longest outside edge** |
| Ipakita ang contour | Surface style | **Display** sa kaliwang panel: interval, major every, label, band, slope arrow |
| Ilatag ang centerline | Mga tool sa paggawa ng alignment, mga setting ng kurba at spiral | {{ui:Alignment}} ({{key:A}}): i-click ang mga PI, {{key:Enter}}; ang radius at haba ng spiral ay nasa talaan ng PI |
| Gumawa ng profile view | Wizard ng profile view, band | {{ui:Profile}} ({{key:R}}): isang profile view sa ilalim ng plano, laging nakakasya |
| Idisenyo ang grade | Mga tool sa profile layout | {{ui:Simulan mula sa ground}}, {{ui:Magdagdag ng PVI}} ({{key:I}}), i-drag ang mga PVI, i-type ang **Curve L** |
| Gumawa ng kalsada | Assembly, subassembly, corridor, target, region | Lagyan ng tsek ang **Sweep an assembly along the design profile** sa ilalim ng alignment; isang lane, shoulder at side slope sa bawat gilid, o bawat gilid na binuo mula sa mga bahagi (gutter, curb, sidewalk …) |
| Mag-grade ng pad | Feature line, grading group, grading criteria | {{ui:Pad}} ({{key:G}}): isang patag na pad na may cut at fill slope hanggang daylight |
| Kuwentahin ang earthwork | Volume surface, volume dashboard | **Earthwork** sa kanang panel, grid method, nag-a-update nang live |
| Ilatag ang storm o sanitary | Pipe network na may parts list, rules | {{ui:Pipes}} ({{key:P}}): i-click ang mga structure pababa ng agos; tatlong rule na itinatakda mo; awtomatikong invert |
| Makipagpalitan sa iba | LandXML import at export | {{ui:Buksan}} ang LandXML file; {{ui:LandXML}} para mag-export ([Makipagpalitan ng LandXML](topic:landxml)) |
| Ipadala ang linework sa CAD | Export sa DWG | {{ui:DWG}} (format na 2000 hanggang 2018) o {{ui:DXF}} (R12) |
| Mag-plot | Layout, viewport, sheet set | {{ui:PDF}}: isang landscape na sheet ng plano sa napiling scale; plan at profile sheet at section sheet bilang PDF |
| Magbahagi ng trabaho sa pagitan ng mga file | Data shortcut, reference | Hindi available: isang proyekto bawat file |
| Undo | Undo | {{key:Mod+Z}} at {{key:Mod+Y}}, 200 hakbang; hindi hakbang sa undo ang mga setting ng display |

## Mga pagkakaibang nakakalito sa mga tao

**Walang command line** maliban kung pipiliin mo ang menu style na {{ui:Drafting classic}}. Ang mga tool ay mga button sa toolbar at iisang letra: {{key:A}} alignment, {{key:G}} pad, {{key:P}} pipes, {{key:B}} breakline, {{key:O}} boundary, {{key:R}} profile, {{key:I}} magdagdag ng PVI, {{key:V}} select, {{key:F}} fit. Sa ibang menu style, walang nangyayari kapag nag-type ka ng pangalan ng command. Tingnan ang [Mga key at mouse](topic:keyboard).

**Tinatapos ng Enter; mapanganib ang double-click.** I-click nang isang beses ang huling punto, saka pindutin ang {{key:Enter}}. Sa build na ito, tinatapos din ng double-click, pero nabubura nito ang punto na dinoble-click mo. Hindi tinatapos o inuulit ng right-click; nag-pa-pan lang ito kapag dina-drag mo.

**Laging dinamiko ang lahat.** Kapag binago mo ang isang point group, radius, PVI o slope ng pad, agad na nagta-update ang surface, contour, corridor, daylight line at volume. Walang ire-rebuild at walang lumang bagay.

**Walang drawing object.** Ang plano ay view ng disenyo, hindi drawing na maaari mong i-edit gamit ang CAD command. Hindi ka makapagdagdag ng sarili mong linya o teksto, makapagpalit ng kulay ng layer, o makapag-explode ng kahit ano. I-export sa DXF at tapusin ang drawing sa isang CAD program.

**Walang style.** Nakapirmi ang mga kulay, kapal ng linya, laki ng label at pangalan ng layer (tingnan ang [Mga layer ng plano](topic:plan-layers)). Inililipat ng Paper at Model sa app bar ang pagitan ng maliwanag at madilim na screen.

**Isa sa bawat isa.** Isang umiiral na ground surface, isang graded na resulta, isang pipe network bawat proyekto. Maraming alignment at pad ang okay.

**Label lang ang mga unit.** Ang pagpili ng {{ui:US feet}} o {{ui:Metres}} ay walang kino-convert. Walang drawing scale. Opsyonal ang coordinate system: itakda ito sa ilalim ng {{ui:Coordinates}} at walang gumagalaw, sinasabi lang nito kung ano ang ibig sabihin ng mga numero (tingnan ang [Itakda ang coordinate system ng proyekto](topic:coordinate-systems)). Itinuturing na US survey feet ang feet kapag isinusulat sa LandXML.

**Sumasali ang mga breakline group ayon sa pagkakasunod ng numero ng punto.** Ang group na nakatakda sa {{ui:Breakline}} ay nagiging iisang linya sa lahat ng punto nito, ayon sa numero. Ang magkasamang code (dalawang flowline na parehong naka-code na "FL") ay gumagawa ng iisang paliko-likong linya; iguhit ang mga iyon nang manu-mano.

**Magkapareho ang itsura ng station, pero magkaiba ang metro.** Gumagamit ang feet ng 100 ft na station (12+34.56); gumagamit ang metro ng 1000 m na station (1+234.567).

**Delete sa Mac.** Ang key ng Mac na may label na delete ay Backspace para sa browser. Gamitin ang Fn at delete, o ang button na {{ui:Delete}}, para burahin ang napiling bagay.

**Mga download ang mga file.** Nagda-download ng `.civilcraft.json` file ang {{ui:Save}} sa bawat pagkakataon; walang "save over the open file". May kopya sa pagbawi ng hindi pa nase-save na gawa na itinatago sa browser na ito ([Bawiin ang hindi nase-save na gawa](common:recover)). Kapag nagbukas ka ng point file, pinapalitan nito ang mga punto nang hindi nagtatanong. Tingnan ang [Mga file na maaari mong buksan, i-save at i-export](topic:files).

**Ikaw ang nagtatakda ng mga rule.** Ang mga rule ng pipe network at ang corridor assembly ay nagsisimula sa mga placeholder na hindi pamantayan. Itakda ang sarili mo bago pagkatiwalaan ang anumang check.

**Batay sa grid ang mga volume.** Nagmumula ang cut at fill sa pinong grid sa pagitan ng dalawang surface, sa loob ng daylight line, nang walang swell o shrink. Malapit sila sa TIN-to-TIN volume pero hindi eksaktong pareho.

## Ano ang wala pa

Mga spiral na hindi clothoid, assembly na nagbabago sa kahabaan ng kalsada, sloped na pad, kapasidad at detention ng inlet, parts catalog, pipe sa profile, layout ng parcel at pagsukat ng lot, least-squares adjustment at survey database, pagbubukas ng DWG, at marami pa. Ang buong listahan, kasama ang gagawin sa ngayon, ay nasa [Hindi pa nagagawa](topic:not-built-yet).
