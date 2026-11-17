---
title: I-style ang layer ayon sa attribute
summary: Kulayan ang mga feature ng GIS layer ayon sa value ng isang field (isang kulay bawat value, o ayon sa saklaw ng numero), laki ng mga punto ayon sa numero, kulayan ang loob ng mga polygon, at magpakita ng legend sa plano.
keywords: symbology, style, kulay, color, categorized, graduated, natatanging value, equal interval, quantile, natural breaks, jenks, ramp, bulag sa kulay, legend, laki, punto, choropleth, klase, gis
from: a3a69add
---

Buksan ang menu na **tatlong tuldok** ng layer sa listahan ng GIS layers at piliin ang {{ui:Style by attribute…}}.

## Tatlong style

- **Iisang symbol:** ang kulay ng layer, gaya ng dati.
- **Categorized:** isang kulay para sa bawat natatanging value ng anumang field. Hanggang walong value ang makakakuha ng walong Okabe-Ito na kulay (pinili para manatiling magkakaiba para sa mga karaniwang uri ng color blindness); kapag mas marami ang value, ang pitong pinakakaraniwan ay may kulay bawat isa at ang iba ay nagbabahagi ng grey na klaseng **Other**. Ang mga feature na walang value ay grey.
- **Graduated:** ang number field ay hinahati sa 2 hanggang 9 na saklaw, bawat isa ay may kulay mula sa ramp. Ang value na nasa break ay napupunta sa mas mababang saklaw.

## Paano hinahati ang mga saklaw

| Paraan | Mga break |
|---|---|
| Pantay na agwat | Ang saklaw mula sa pinakamaliit hanggang pinakamalaking value ay hinahati sa pantay na lapad. Mga value na 0 hanggang 30 sa tatlong saklaw: 0, 10, 20, 30. |
| Quantile | Halos parehong bilang ng feature sa bawat saklaw. Ang mga break ay binabasa mula sa nakaayos na value gamit ang karaniwang straight-line interpolation: para sa 1 hanggang 10 sa dalawang saklaw, ang break ay 5.5. |
| Natural breaks (Jenks) | Ang mga hiwa na nag-iiwan ng pinakakaunting pagkalat sa loob ng bawat saklaw, para magkasama ang mga grupo ng magkakatulad na value. Kapag higit sa 1,500 ang value, gumagana ito sa 1,500 na pantay ang agwat at sinasabi ito. |

## Mga kulay

Ang Viridis at Cividis ay mula madilim papuntang maliwanag na may tuloy-tuloy na pagbabago ng liwanag, kaya mababasa pa rin ang pagkakasunod ng mga saklaw kahit grey o may color blindness. Ang Blues ay mula maliwanag papuntang madilim. Ang Red to blue ay two-way ramp para sa mga value na nasa paligid ng gitna. Binabaligtad ng **Reverse the colours** ang alinman sa mga ito. Inililista ng dialog ang mga saklaw at bilang ng feature sa bawat isa bago mo ilapat.

## Laki, fill at legend

- Ang **Point size by** na may number field ay nagpapalaki sa parisukat ng bawat punto habang lumalaki ang value, sa pagitan ng dalawang laki na ibibigay mo (kalahati ng gilid, sa millimetro sa papel).
- Ang **Tint the inside of polygons** ay pinupunan ang bawat polygon ng kulay ng klase nito (nananatiling walang laman ang mga butas). Nasa screen ang tint; ang plot at DXF/DWG ay nagpapakita ng may kulay na outline.
- Ang **Show a legend on the plan** ay gumuguhit ng mga klase, ang bilang nila at ang saklaw ng laki sa kaliwang ibaba ng plano. Nasa screen ang legend; wala ito sa plot.
- Para lagyan ng label ang mga feature ng field, gamitin ang **Label with** sa parehong menu.

Naka-save ang style sa project file. Ang build na hindi alam ang tungkol sa mga style ay magbubukas ng file gamit ang kulay ng layer. Dinadala ng plot, DXF at DWG ang mga klase bilang hiwalay na layer na pinangalanan ayon sa layer at klase, sa pinakamalapit sa siyam na pangunahing kulay ng CAD. Iisang kulay ang iginuguhit para sa layer na may higit sa 200,000 feature.
