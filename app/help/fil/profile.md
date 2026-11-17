---
title: Mag-design ng vertical profile
summary: Buksan ang profile view, magsimula ng design profile mula sa ground, magdagdag at mag-drag ng PVI, magtakda ng haba ng vertical curve, at basahin ang grade, K value at high at low point.
keywords: profile, vertical alignment, pvi, vertical curve, grade, k value, crest, sag, bvc, evc, profile view, finished grade, fg, existing ground profile, feature lines in profile, crossings, projected, curb, ditch, labels
from: e9182bfa
---

Ang bawat alignment ay may isang design profile: isang listahan ng PVI (station at elevation) na pinagdudugtong ng tuwid na grade, na may simetrikong parabolic vertical curve sa anumang interior PVI na may haba. Awtomatikong kinukuha mula sa surface ang umiiral na ground profile para sa iyo.

## Buksan ang profile view

1. Piliin ang alignment (i-click ito gamit ang {{ui:Select}}).
2. Pindutin ang {{key:R}}, o i-click ang {{ui:Profile}} sa toolbar, o ang {{ui:Profile view}} sa ibaba ng kanang panel.
   Bubukas ang profile view sa ilalim ng plan na may umiiral na ground sa kahabaan ng alignment. Kapag dalawa o higit pang alignment, pumili ng isa sa listahan sa kaliwa ng profile bar.

Palagi nitong ipinapakita ang buong alignment at iniuunat ang mga elevation para mapuno ang panel; nakalimbag ang exaggeration sa kaliwang ibabang sulok, halimbawa "Vertical exaggeration 10×". Hindi ito nag-zoom o nag-pan.

Igalaw ang pointer sa kahabaan ng profile: ipinapakita ng bar ang station, ang ground at design elevation, ang grade at ang cut o fill doon, at may tuldok na sumusunod sa alignment sa plan.

## Simulan ang design profile

1. Sa kanang panel, sa ilalim ng **Design profile**, i-click ang {{ui:Start from the ground}}.
   Dalawang PVI ang ilalagay sa ground sa dalawang dulo ng alignment, pinagdudugtong ng isang tuwid na grade. Sinasabi ng status bar na "Design profile started at the ground at both ends. Turn on Add PVIs and click to add grade breaks; give them a curve length in the table."

Kapag hindi tumatawid ang alignment sa surface, lalabas ang "This alignment has no ground under it to start from." Kung ganoon, magdagdag ng PVI sa pamamagitan ng pag-click (tingnan ang susunod na seksyon).

## Magdagdag ng PVI

1. Pindutin ang {{key:I}}, o i-click ang {{ui:Add PVIs}} sa profile bar. Mananatili itong nakapindot.
2. I-click sa profile kung saan mo gustong grade break. Idinadagdag ang PVI sa station at elevation na iyon, na naka-round sa 0.01, at pinipili ito.
3. Magdagdag ng kasing dami ng kailangan mo, pagkatapos ay pindutin ulit ang {{key:I}} para tumigil sa pagdaragdag.

Tinatanggihan ang click kung saan may PVI na ("There is already a PVI at …"). Palaging nananatili ang mga PVI sa pagkakasunod ng station.

## Ayusin ang mga PVI

- **I-drag** ang PVI sa profile para igalaw ito. Hindi ito makakalampas sa mga kapitbahay nito. Isang undo step ang bawat galaw.
- **I-type** ang eksaktong value sa PVI table sa kanang panel: **Station**, **Elevation** at **Curve L** (haba ng vertical curve). Pindutin ang {{key:Enter}} pagkatapos ng bawat isa.
- **Alisin** ang PVI gamit ang x sa dulo ng row nito, o piliin ito (i-click) at pindutin ang {{key:Delete}}. Kapag may focus ang profile view, inaalis din ito ng {{key:Backspace}}.

Hindi kailanman nagkakaroon ng curve ang una at huling PVI.

## Vertical curve

1. I-type ang haba sa **Curve L** para sa isang interior PVI, halimbawa 200.
2. Iginuguhit ang curve na nakasentro sa PVI. Ipinapakita ng profile at ng kanang panel ang uri nito (crest o sag), L at K, ang BVC at EVC na station at elevation, at ang high o low point nito kapag may nasa loob ng curve.

Kinukuwenta ang K mula sa L (K = L hinati sa algebraic difference ng mga grade, sa porsyento). Ang L ang tina-type mo; hindi pa available ang direktang pag-type ng K.

Kapag hindi kasya ang vertical curve, may pulang kahon na nagsasabi kung bakit: tumatakbo ito pabalik sa PVI o curve bago nito, o lampas sa susunod na PVI, at kung gaano karaming espasyo ang mayroon sa panig na iyon (kailangan ng curve ang kalahati ng haba nito sa bawat panig ng PVI nito). Itinatakda ng pindutan nito ang **the longest curve that fits**, kasama ang K nito, bilang isang hakbang ({{key:Mod+Z}} ang nag-uundo nito). O ilayo ang mga PVI sa isa't isa.

## Basahin ang mga datos

Sa ilalim ng PVI table, may listahan na nagbibigay ng bawat grade sa porsyento ("Grade 1: +1.25%") at bawat curve, halimbawa "Crest at 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", pagkatapos ay "High point 1+62.40, 254.12".

Kapag hindi umaabot ang mga PVI sa magkabilang dulo ng alignment, may tala na nagsasabi nito. Binubuo ang corridor lamang kung saan nagkakapatong ang profile at alignment.

## Feature line sa profile

Lumalabas din ang mga feature line sa profile view, para makita mo ang kerb, ditch o tuktok ng pader laban sa profile ng kalsada.

- Kapag ang feature line ay **tumatawid** sa alignment, may maliit na diamond ang profile sa station at elevation na iyon, may label na pangalan ng linya at elevation nito roon (ang sariling elevation ng linya, na kinuwenta sa segment na tumatawid).
- Mag-type ng distansya sa {{ui:Alongside within}} para iguhit din ang mga feature line na **tumatakbo sa tabi** ng alignment sa loob ng distansyang iyon, bilang mga putol-putol na linya sa sarili nilang elevation. Ang walang laman o 0 ay nagpapakita lamang ng mga tawiran.
- Sinusundan ng mga marka at label ang bawat pagbabago: igalaw ang vertex, mag-type ng grade o itaas ang linya, at agad ipinapakita ng profile ang bagong elevation.
- I-click ang diamond ng isang tawiran para piliin ang feature line na iyon; ang piniling linya ay iginuguhit sa highlight color.
- Itinatago o ipinapakita ng {{ui:Feature lines}} sa profile bar ang lahat ng ito. Parehong setting ay nase-save kasama ng project.

Tingnan ang [Feature lines](topic:feature-lines).

## Susunod

- [I-sweep ang road corridor](topic:corridor) sa kahabaan ng alignment at profile na ito.
- Ang profile ay isinusulat sa LandXML kasama ng alignment; tingnan ang [Exchange LandXML](topic:landxml).
