---
title: Mga check ng power line
summary: Ano ang tinitingnan ng CivilCraft sa bawat linya at kable, laging up to date: clearance, spacing, swing, uplift, support load at sizing, fitting, stay, foundation, nawawalang data, koneksyon, overload at voltage drop.
keywords: checks, clearance, ground clearance, obstacle, crossing, phase spacing, insulator swing, uplift, support load, nominal load, sizing, foundation, stay, guy, fitting, crossarm, voltage drop, overload, missing data, disconnected
from: e6a0da47
---

Inililista ng **Checks** sa seksyong Power lines ang bawat problema, pula para sa mga bumabagsak at amber para sa mga babala. I-click ang isa para piliin ang linya, support, kable o kagamitang tinutukoy nito; ang mga support at span na bumabagsak ay binibilogan ng pula sa plan habang bukas ang workspace.

:::warning
Design aid lamang ito: mga check ng design mo laban sa sarili mong mga patakaran, hindi certification.
:::

## Clearance

Sinusundan ang pinakamababang phase ng conductor sa bawat span at sa bawat load case. Ang pinakamababang clearance nito sa ibabaw ng ground ay dapat umabot sa **Clearance rule** ng linya. Kapag tumatawid ang span sa isang **obstacle** (iginuhit gamit ang {{ui:Obstacle}}: isang point o linya, na may taas nito sa ibabaw ng ground at sarili nitong clearance rule), sinusuri din ang clearance sa ibabaw ng obstacle sa parehong paraan.

**Binibilang din ang anumang inilagay ng Landscape workspace sa ibabaw ng ground.** Ang mga single plant (ang korona nila sa mature na lapad at taas), hedge at planting bed (ang pinakamataas na species sa mga ito) at pader (ang tuktok nila) ay mga obstacle sa ilalim ng linya, nang hindi na kailangang iguhit muli. Pinapanatili nila ang mga rule na itinakda sa {{ui:Load cases and limits…}}: **Landscape plants under a line** (sa mga halimbawang set ay *Trees and plants*, 3 m) at **Landscape walls under a line** (*Building*); piliin ang **Not checked** para hindi sila isama. Sinusukat ang clearance nang tuwid pataas mula sa tuktok ng halaman o pader hanggang sa conductor sa lugar kung saan tumatawid ang span dito; hindi sinusuri ang distansya sa gilid papunta sa korona sa tabi ng linya. Ang paggalaw ng puno o ang pagtaas ng pader ay agad nagbabago sa mga check.

Sarili mong mga patakaran ang clearance rule mo; buksan ang mga ito gamit ang **Rules…** sa tabi ng anumang **Clearance rule** (o sa {{ui:Load cases and limits…}}) para magdagdag, magpalit ng pangalan, magbago o magtanggal.

## Spacing at swing

- **Phase spacing** na kailangan: k·√(sag + haba ng insulator) + U/150, gamit ang sag ng hot case at ang boltaheng U sa kV (karaniwang anyo; ang k ay sa rule set mo). Ikinukumpara sa phase spacing ng crossarm.
- **Insulator swing** sa suspension support, sa ilalim ng wind case: atan(transverse load ÷ vertical load), kumpara sa pinakamalaking swing ng rule set.
- **Uplift**: ang suspension support na mas mababa sa mga kapitbahay nito ay maaaring hilahin pataas sa lamig; minamarkahan ito.

## Support load at sizing

Para sa bawat support at load case, kasama ang bawat conductor ng linya:

- **Transverse**: wind kada metro × wind span (kalahati ng dalawang span), dagdag ang 2·H·sin(turn ÷ 2) sa isang liko.
- **Kasama ang linya**: ang pagkakaiba ng tension ng dalawang panig sa dead-end o anggulo; sa suspension support, yelo lamang sa isang panig (bawat span ay kinukwenta nang hiwalay, na nasa ligtas na panig).
- **Vertical**: vertical load kada metro × weight span (sa pagitan ng pinakamababang punto sa magkabilang panig) dagdag ang kagamitan.

Ang horizontal load ay dinadala sa nominal point ng support (equivalent load = load × taas ng attachment ÷ taas ng nominal point) at ikinukumpara sa **nominal load** nito × factor ng rule set. Kapag masyadong mahina, iminumungkahi ang pinakamaliit na support ng parehong materyal sa library mo na kayang magdala nito. Ang support na may **stay** ay ipinapasa ang horizontal load sa stay, na nagdadala ng load ÷ sin(anggulo ng stay) at sinusuri laban sa sarili nitong rating.

Sinusuri ang mga fitting (clamp, insulator, crossarm) laban sa kanilang rated load: ang anchoring fitting ay nagdadala ng tension ng conductor, ang suspension fitting ng bahagi nito ng vertical at transverse load. Ang **foundation** na ipinapakita ay ang lalim ng support sa lupa at butas na bahagyang mas malapad kaysa sa paa nito.

## Data, koneksyon at kuryente

- Isang item na may walang lamang kailangang field, o isang key na wala sa library.
- Isang dulo ng cable route, o kagamitan, na hindi konektado kahit saan.
- **Voltage drop** at **current** mula sa bawat source (kagamitang minarkahang source) patungo sa mga load (kW at power factor sa kagamitan), sa kahabaan ng overhead span at kable: √3·I·L·(R cos φ + X sin φ), na may R sa 20 °C. Kapag higit sa current rating ng kable, o higit sa drop na pinapayagan ng rule set, minamarkahan ito.
