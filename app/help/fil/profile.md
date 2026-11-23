---
title: I-design ang vertical profile
summary: Buksan ang profile view, magsimula ng design profile mula sa ground, magdagdag at mag-drag ng PVI, itakda ang haba ng vertical curve, at basahin ang grade, K value at mataas at mababang punto.
keywords: profile, vertical alignment, pvi, vertical curve, grade, k value, crest, sag, bvc, evc, profile view, tapos na grade, fg, profile ng umiiral na ground, mga feature line sa profile, pagtawid, naka-project, curb, ditch, mga label
from: dbb1f32d
---

Bawat alignment ay may isang design profile: isang listahan ng mga PVI (station at elevation) na pinag-uugnay ng tuwid na grade, na may simetrikong parabolic na vertical curve sa anumang panloob na PVI na may haba. Kinukuha para sa iyo ang profile ng umiiral na ground mula sa surface.

## Buksan ang profile view

1. Piliin ang alignment (i-click ito gamit ang {{ui:Piliin}}).
2. Pindutin ang {{key:R}}, o i-click ang {{ui:Profile}} sa toolbar, o ang {{ui:Profile view}} sa ibaba ng right panel.
   Bumubukas ang profile view sa ilalim ng plano kasama ang umiiral na ground sa kahabaan ng alignment. Kapag dalawa o higit pang alignment, pumili ng isa sa listahan sa kaliwa ng profile bar.

Sa umpisa, ipinapakita ng view ang buong alignment at iniuunat ang mga elevation para punuin ang panel; nakalimbag sa kaliwang ibabang sulok ang exaggeration, halimbawa "Vertical exaggeration 10×".

## Mag-zoom at mag-pan sa profile

- **Zoom:** ikot ang mouse wheel (o pinch sa trackpad) at mag-zoom ang view sa paligid ng pointer. Pindutin ang {{key:Shift}} para mag-zoom sa mga station lamang, o ang {{key:Alt}} para mag-zoom sa mga elevation lamang (nagbabago nito ang exaggeration). Kapag nakatutok ang profile view, nagza-zoom sa gitna ang plus at minus na key.
- **Pan:** i-drag gamit ang kanan o gitnang mouse button, o mag-swipe gamit ang dalawang daliri sa trackpad.
- **Fit:** i-double-click ang profile o pindutin ang {{key:F}} para ipakitang muli ang buong alignment.

Pinananatili ng pag-edit ng PVI ang zoom na pinili mo; hindi ito bumabalik sa fit.

Igalaw ang pointer sa kahabaan ng profile: ipinapakita ng bar ang station, ground at design elevation, ang grade at ang cut o fill doon, at may tuldok na sumusunod sa alignment sa plano.

## Simulan ang design profile

1. Sa right panel sa ilalim ng **Design profile**, i-click ang {{ui:Simulan mula sa ground}}.
   Dalawang PVI ang ilalagay sa ground sa dalawang dulo ng alignment, na pinag-uugnay ng isang tuwid na grade. Sinasabi ng status bar: "Nagsimula ang design profile sa ground sa magkabilang dulo. I-on ang {{ui:Magdagdag ng PVI}} at mag-click para magdagdag ng grade break; bigyan ang mga ito ng curve length sa table."

Kung hindi tumatawid ang alignment sa surface, lalabas ang "Walang ground sa ilalim ng alignment na ito para simulan." Pagkatapos, magdagdag ng PVI sa pamamagitan ng pag-click (sa susunod na seksyon).

## Magdagdag ng PVI

1. Pindutin ang {{key:I}}, o i-click ang {{ui:Magdagdag ng PVI}} sa profile bar. Nananatiling nakapindot ito.
2. I-click sa profile kung saan mo gustong grade break. Idinaragdag ang isang PVI sa station at elevation na iyon, binilog sa 0.01, at pinipili ito.
3. Magdagdag ng kasing dami ng kailangan mo, saka pindutin muli ang {{key:I}} para itigil ang pagdaragdag.

Tinatanggihan ang click kung may PVI na doon na ("May PVI na sa …"). Laging nananatili sa pagkakasunod ng station ang mga PVI.

## Mag-snap habang nagdaragdag o nag-drag

Nakabukas sa umpisa ang **Snap** button sa profile bar. Habang nakabukas ito, ang PVI na idinaragdag o i-drag mo ay dumidikit sa pinakamalapit na PVI, punto sa ground, station ng PVI o linya ng ground, at may label sa tabi ng marker na nagsasabi kung alin. Pindutin at hawakan ang {{key:Alt}} para sa malayang punto, saanman.

## Ayusin ang mga PVI

- **I-drag** ang PVI sa profile para igalaw ito. Hindi ito makakalampas sa katabi nito. Isang undo step ang paggalaw.
- **I-type** ang eksaktong halaga sa PVI table sa right panel: **Station**, **Elevation**, **Slope %** at **Curve L** (haba ng vertical curve). Pindutin ang {{key:Enter}} pagkatapos ng bawat isa.
- **Pick** ng halaga mula sa profile: naghihintay ng isang click sa profile view ang maliit na button sa tabi ng station o elevation ng PVI at ilalagay ang halagang iyon. Dumidikit ang click gaya ng Magdagdag ng PVI; pindutin at hawakan ang {{key:Alt}} para sa malayang punto; kinakansela ito ng {{key:Esc}}.
- Ang **Slope %** ay ang grade ng tangent na nagsisimula sa PVI na iyon at papunta sa susunod. Kapag ito ay itinype, gumagalaw ang elevation ng **susunod** na PVI (hindi kailanman gumagalaw ang station nito). Kung naka-lock ang susunod na PVI, ang elevation ng naunang PVI ang gagalaw sa halip.
- **I-lock** ang PVI gamit ang padlock sa dulo ng row nito. Hindi naka-drag ang naka-lock na PVI, at hindi ito gumagalaw sa pag-edit ng slope. Kung naka-lock ang magkabilang dulo ng tangent, hindi mababago ang slope nito: sinasabi ito ng status bar, at kailangan mo munang i-unlock ang isang dulo. Naka-save sa file ang lock.
- **Tanggalin** ang PVI gamit ang x sa dulo ng row nito, o piliin ito (i-click) at pindutin ang {{key:Delete}}. Kapag nakatutok ang profile view, tinatanggal din ito ng {{key:Backspace}}.

Hindi kailanman nagkakaroon ng curve ang una at huling PVI.

## Mga vertical curve

1. I-type ang haba sa **Curve L** para sa panloob na PVI, halimbawa 200.
2. Iginuguhit ang curve na nakasentro sa PVI. Ipinapakita ng profile at ng right panel ang uri nito (crest o sag), L at K, ang BVC at EVC station at elevation, at ang mataas o mababang punto nito kapag mayroon sa loob ng curve.

Kinukuha ang K mula sa L (K = L hinati sa algebraic difference ng mga grade, sa porsyento). Ang L ang itine-type mo; hindi pa available ang direktang pag-type ng K.

Kapag hindi kasya ang vertical curve, ipinapaliwanag ng pulang kahon kung bakit: tumatama ito sa PVI o curve bago ito, o lumalampas sa susunod na PVI, at kung gaano kalaki ang espasyo sa panig na iyon (kailangan ng curve ang kalahati ng haba nito sa bawat panig ng PVI nito). Itinatakda ng button nito ang **pinakamahabang curve na kasya**, kasama ang K nito, bilang isang hakbang ({{key:Mod+Z}} ang bumabawi nito). O ilayo ang mga PVI sa isa't isa.

## Basahin ang mga datos

Sa ilalim ng PVI table, may listahang nagbibigay ng bawat grade sa porsyento ("Grade 1: +1.25%") at bawat curve, halimbawa "Crest at 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", saka "High point 1+62.40, 254.12".

Kung hindi umaabot ang mga PVI sa magkabilang dulo ng alignment, sinasabi ito ng isang tala. Binubuo lamang ang corridor kung saan nagpo-overlap ang profile at alignment.

## Mga feature line sa profile

Lumalabas din ang mga feature line sa profile view, para makita mo ang curb, ditch o tuktok ng pader laban sa profile ng kalsada.

- Kung saan **tumatawid** ang feature line sa alignment, nagpapakita ang profile ng maliit na diamond sa station at elevation na iyon, may label ng pangalan ng linya at elevation nito doon (ang sariling elevation ng linya, kinuha sa segment na tumatawid).
- I-type ang distansya sa {{ui:Kasama ang nasa loob ng}} para iguhit din ang mga feature line na **tumatakbo sa tabi** ng alignment sa loob ng distansyang iyon, bilang dashed na linya sa sarili nilang elevation. Kapag walang laman o 0, pagtawid lang ang ipinapakita.
- Sumusunod ang mga marka at label sa bawat pagbabago: igalaw ang vertex, mag-type ng grade o itaas ang linya, at agad ipinapakita ng profile ang mga bagong elevation.
- I-click ang diamond ng pagtawid para piliin ang feature line na iyon; iginuguhit ang napiling linya sa highlight color.
- Itinatago o ipinapakita ng {{ui:Feature lines}} sa profile bar ang lahat ng ito. Naka-save kasama ng proyekto ang dalawang setting.

Tingnan ang [Feature lines](topic:feature-lines).

## Susunod

- [I-sweep ang road corridor](topic:corridor) sa kahabaan ng alignment at ng profile na ito.
- Isinusulat ang profile sa LandXML kasama ng alignment; tingnan ang [Exchange LandXML](topic:landxml).
