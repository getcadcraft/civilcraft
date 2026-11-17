---
title: Sag at tension
summary: Ang mga load case mo (temperatura, hangin, yelo) at mga limit ng tension, kung paano kinukuwenta ng CivilCraft ang tension ng bawat section, at ang mga stringing table.
keywords: sag, tension, load case, temperatura, temperature, hangin, wind, yelo, ice, asymmetric ice, ruling span, equivalent span, change of state, catenary, stringing table, breaking strength, everyday stress
from: f8876c35
---

## Load case at mga limit

Ang {{ui:More}} › {{ui:Load cases at limits…}} ay nag-e-edit ng mga panuntunang sinusunod ng bawat linya sa proyekto.

- **Load cases**: isang temperatura, isang wind pressure sa conductor (Pa), at radial ice (mm, kasama ang density nito). Ang unang case ang reference.
- **Tension limits**: isang bahagi ng breaking strength ng conductor, sa horizontal tension o sa pinakamalaking tension sa isang support, sa isang load case. O ibigay ninyo mismo ang horizontal tension.
- **Clearances**: ang clearance na pinapanatili ng conductor sa lupa, kalsada, gusali at iba pa. Magdagdag, palitan ng pangalan at tanggalin ang mga ito: sa inyo ang mga ito. Sa ilalim nila, piliin ang mga panuntunan para sa **Landscape plants under a line**, **Landscape walls under a line** at **Underground crossings**.
- **Cases the checks use**: aling case ang nagbibigay ng pinakamalaking sag (mainit), ang swing ng insulator (hangin), yelo, at yelo sa isang gilid ng support.
- **Factors**: phase spacing factor k, pinakamalaking swing ng insulator, isang factor sa load ng support at fitting, ang mga turn angle na gumagawa ng angle at dead-end support, ang pinakamababang takip sa mga nakabaon na cable, at ang pinakamalaking voltage drop.

## Pack: mga panuntunan at library para sa isang bansa

Walang panuntunan ng anumang bansa na nakabuo sa CivilCraft. Ang **pack** ay nagtatago ng isang rule set at isang library sa iisang file (`.cclinepack.json`), para sa isang bansa, network operator o kumpanya:

- **Save as a pack…** sa {{ui:Load cases at limits…}} ay sumusulat ng rule set na nakikita at ng inyong library (o, kapag wala pang laman ang inyong library, ang mga item na ginagamit ng proyektong ito). I-type muna ang **Country or region**.
- **Open a rule set or pack…** ay nagbabasa ng pack, rules file o library file. Ang mga panuntunan ng pack ay ipinapakita sa dialog (i-click ang **Apply** para gamitin ang mga ito), at ang mga item nito ay napupunta sa inyong library.
- Ang mga pack na ibinabahagi ng iba ay nakalista sa add-ons page sa ilalim ng **Power line packs**. Dalawang halimbawang pack ang nagpapakita ng format; hindi sila panuntunan ng anumang bansa.

Sinusuri ang bawat pack kapag binubuksan, tulad ng alinmang file. Suriin ang bawat value laban sa standard na naaangkop bago magtayo ng anuman.

Dalawang halimbawang rule set ang nandiyan para pagsimulan: **Example: cold climate** at **Example: mild climate**. Walang standard ang pinanggalingan ng mga numero nila: itakda ang mga value na ibinibigay ng inyong standard. Ang {{ui:Save rules}} at {{ui:Open rules…}} ay nagbabahagi ng rule set bilang file.

## Paano kinukuwenta ang tension

Para sa bawat section sa pagitan ng mga dead-end:

1. Ang **ruling span** ay √(ΣL³ ÷ ΣL) ng mga span nito.
2. Ang bawat limit ay ginagawang horizontal tension sa reference case sa pamamagitan ng **change-of-state equation** sa ruling span: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. Ang pinakamahigpit ang nagtatakda ng tension.
3. Ang tension ng bawat load case ay sumusunod mula sa isang iyon, at ang hugis ng bawat span ay ang eksaktong **catenary** sa pagitan ng dalawa nitong attachment point (kasama ang mga span sa slope): sag mula sa chord, haba, at ang tension sa bawat dulo.

Ang load bawat metro sa isang case: bigat plus yelo (ice area × density × g) nang patayo; wind pressure × ang iced diameter nang pahalang.

## Stringing table

Ang {{ui:More}} › {{ui:Stringing tables…}} ay naglilista, para sa bawat section, ng horizontal tension at ng sag ng bawat span sa bawat temperatura ng rule set (−5 °C hanggang 40 °C na tig-5 °C sa umpisa), sa walang hanging hangin. I-save ang mga ito, at ang supports table, bilang CSV.

Hindi kasama: ang creep ng conductor sa paglipas ng mga taon, at ang pag-unat ng bagong conductor. Idagdag ang mga ito sa pamamagitan ng mga temperatura na pinagkakabitan ninyo.
