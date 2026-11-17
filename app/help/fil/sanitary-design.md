---
title: Kuwentahin ang sanitary design flow at suriin ang sewer
summary: Ilagay ang mga tao at lugar na pumapasok sa bawat manhole ng sanitary network; idinadagdag ito ng CivilCraft pababa ng network, kinukuwenta ang peak flow gamit ang peaking factor at infiltration, at sinusuri ang kapasidad at bilis ng bawat pipe.
keywords: sanitary, sewer, sanitary sewer, wastewater, design flow, peak flow, peaking factor, harmon, babbitt, infiltration, population, per capita, percent full, self-cleansing, velocity, pipe sizing, design sheet
from: 73ba197a
---

Gumagana ang sanitary design flow sa [pipe network](topic:pipe-network) kapag ang {{ui:Type}} nito ay {{ui:Sanitary}}. Kapag walang napili, ang kanang panel ay nagpapakita ng **Sanitary design flows** kung saan ang storm network ay nagpapakita ng storm drainage.

## Ilagay kung ano ang pumapasok

1. Pumili ng manhole. Sa ilalim ng **Sanitary design flows**, i-type ang {{ui:People entering here}} at ang {{ui:Area entering here}} (ektarya sa metric na proyekto, acre sa feet na proyekto).
2. Para sa tindahan, opisina o industriya, i-type ang katumbas na tao: ang lugar na i-multiply sa bilang ng tao kada ektarya (o acre) na ginagamit ng inyong ahensya. Binibilang ang lugar para sa infiltration sa alinmang paraan.
3. Ulitin para sa bawat manhole kung saan may kumokonekta na kalye o lote. Ang manhole na walang kumokonekta ay nananatili sa 0 ang dalawa.

Ang bawat pipe ay nagdadala ng lahat ng pumapasok sa itaas nitong manhole at sa itaas pa nito. Pumili ng manhole para makita kung ano ang dumadaan dito.

## Ang mga setting

| Setting | Ano ang ibig sabihin |
|---|---|
| {{ui:Flow per person}} | ang karaniwang daloy ng isang tao bawat araw: litro (metric na proyekto) o US gallon (feet na proyekto) |
| {{ui:Infiltration}} | tubig sa lupa na tumatagas papasok: litro bawat segundo bawat ektarya, o gallon bawat araw bawat acre |
| {{ui:Peaking factor}} | Harmon, 1 + 14 / (4 + √P), o Babbitt, 5 / P^0.2, kung saan ang P ay populasyon sa libo |
| {{ui:Peaking factor at least}} / {{ui:Peaking factor at most}} | nakakulong ang factor sa pagitan ng dalawang ito |
| {{ui:Manning n}} | para sa kapasidad at bilis |
| {{ui:Least velocity}} / {{ui:Most velocity}} | sa sarili nitong lalim ng peak flow sa pipe |
| {{ui:Most of full capacity}} | gaano kapuno puwedeng tumakbo ang pipe sa peak, bilang porsyento ng kaya nitong dalhin kapag puno |

Ang mga panimulang value ay placeholder, hindi standard. Gamitin ang mga value na inilalathala ng inyong ahensya.

## Ano ang kinukuwenta nito

Para sa bawat pipe, ayon sa pagkakasunod ng daloy:

- peak flow = tao × flow bawat tao × peaking factor + lugar × infiltration
- kapasidad kapag puno ang daloy (equation ng Manning sa slope ng pipe), at gaano kapuno ito ng peak
- ang normal depth ng peak flow at ang bilis doon

Inililista ng talahanayang **Sanitary results** ang tao, peaking factor, peak flow (L/s, o gpm at cubic feet per second), porsyento ng pagkapuno at bilis ng bawat pipe. Nakalista sa ilalim nito ang mga problema: pipe na mas puno kaysa sa limit, mas mabagal kaysa sa least velocity (maaaring hindi ito maglinis ng sarili), mas mabilis kaysa sa most velocity, o walang fall. Pinipili ng {{ui:Size the pipes for these flows}} para sa bawat pipe ang pinakamaliit na standard na laki (200 mm o 8 inches pataas) na nagdadala ng peak nito sa loob ng limit; binabawi ito ng isang {{key:Mod+Z}}.

:::note
Ito ang steady na peak flow na kinukuwenta ng design sheet, sinuri laban sa nailathalang design sheet hanggang sa nakalimbag nitong rounding. Hindi ito model ng sewer sa paglipas ng panahon: walang hydrograph, storage, pump o overflow. Tingnan ang [Hindi pa naitatayo](topic:not-built-yet).
:::

Gumagamit ang bilis ng equation ng Manning na may parehong n sa bawat lalim. May ilang part-full chart ng mga ahensya na nagpapahintulot na magbago ang n ayon sa lalim, na nagbibigay ng bahagyang mas mababang bilis sa pipe na 60 hanggang 70 porsyentong puno (mga 3 porsyentong mas mababa).
