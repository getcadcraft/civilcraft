---
title: Water mains: presyon, daloy, at fire flow
summary: Gumuhit ng pressure network ng junctions, reservoirs, tanks, pipes, pumps, at pressure reducing valves sa plano; kinakalkula ng CivilCraft ang heads, presyon, at daloy (Hazen–Williams, looped networks), ang daloy na available para sa sunog, at isang araw ng demand. Lab feature; kailangang suriin ng engineer ang bawat resulta.
keywords: tubig, water main, water distribution, pressure network, pressure pipe, looped network, hazen-williams, c factor, head loss, residual pressure, fire flow, hydrant, demand, junction, reservoir, tank, pump, pump curve, pressure reducing valve, prv, check valve, extended period, epanet, inp, velocity
from: df46bf6d
---

Ang water mains ang pressure side ng site: mga tubo na laging puno, na itinutulak ng tubig mula sa reservoir, tank, o pump. Kinakalkula ng CivilCraft ang head at presyon sa bawat junction at ang daloy sa bawat pipe, kasama ang looped networks kung saan may higit sa isang daan ang tubig. Nasa lab ito habang sinusuri.

**Tulong lang sa pagkalkula.** Kailangan ng bawat numero ng pagsusuri ng kwalipikadong engineer: nakadepende ang sagot sa mga demand, elevation, laki ng tubo, at roughness value na ibinigay mo, at hindi alam ng steady-state model ang tungkol sa water hammer, kalidad ng tubig, o tunay na gawi ng fire pump.

## Gumuhit ng network

1. Sa ilalim ng **Surface** › {{ui:More}}, piliin ang {{ui:Water mains…}}. Nananatiling bukas ang window habang nagtatrabaho ka sa plano.
2. Piliin ang {{ui:Reservoir}} at i-click ang plano kung nasaan ang supply. Nagsisimula ang head nito 100 ft (30 m) sa itaas ng ground; palitan ito sa Properties.
3. Piliin ang {{ui:Junction}} at i-click ang bawat lugar kung saan may kinukuhang tubig o nagtatagpo ang mga tubo. Kinukuha ng junction ang elevation nito sa ground; mag-type ng iba sa Properties para i-override ito.
4. Piliin ang {{ui:Pipe}}, i-click ang isang node, saka ang node na kinokonektahan nito. Nananatiling aktibo ang tool para sa susunod na pipe. Ang {{ui:Pump}} at {{ui:Pressure reducing valve}} ay iginuguhit sa parehong paraan, mula sa suction (o upstream) node papunta sa delivery (o downstream) node. Ang {{ui:Tank}} ay inilalagay gaya ng junction.
5. Piliin ang junction at i-type ang {{ui:Demand}} nito (gpm, o L/s sa metro project). Piliin ang pipe at itakda ang {{ui:Diameter}} nito (in, o mm) at, kung alam mo, ang Hazen–Williams C nito.

Bawat pagbabago ay isang hakbang ng undo. Binubura ng Delete ang node at ang mga pipe na nagtatapos dito.

## Ano ang ibig sabihin ng bawat bahagi

- **Pipe.** Ang haba ay sinusukat sa kahabaan ng plano maliban kung mag-type ka ng isa. Ang C ay ang Hazen–Williams roughness (130 para magsimula; palitan ang default sa window). Dinadagdagan ng minor loss coefficient K ang pagkawala ng mga liko at fitting. Lagyan ng check ang **Check valve** para sa pipe na hindi dapat magpadaloy ng tubig paatras; ang **Closed** na pipe ay walang dinadaluyan.
- **Reservoir.** Pinagmulan sa nakapirming head, ang antas ng tubig na hawak nito sa itaas ng datum. Nagbibigay o kumukuha ito ng kailangan ng network.
- **Tank.** Antas na nagbabago sa loob ng isang araw. Sa steady results, pinagmulan ito sa kasalukuyang antas nito.
- **Pump.** Isang design point (daloy at head) ang nagbibigay ng karaniwang curve dito: ang head sa zero flow ay 133 % ng design head, at zero ang head sa dobleng design flow. Hindi kailanman itinutulak ng pump ang tubig paatras.
- **Pressure reducing valve.** Pinapanatili ang presyon na itinakda mo sa downstream habang mas mataas ang supply. Kapag mas mababa ang supply, bukas ito at walang pinipigilan; kung tatakbo paatras ang tubig, magsasara ito.

## Basahin ang mga resulta

Ipinapakita ng window ang head at presyon ng bawat node, at ang daloy, velocity, at head loss ng bawat link bawat 1,000 ft (o bawat km), kasama ang mga junction na kulay sa plano: berde ang nasa pagitan ng pinakamababa at pinakamataas mong presyon, pula ang mas mababa, amber ang mas mataas. Ipinapakita ng mga flow arrow ang direksyon. Piliin ang isang node o pipe para basahin ang mga numero nito sa Properties.

Sa ilalim ng mga table ay listahan ng mga dapat tingnan: mababa o mataas na presyon, pipe na mas mabilis sa limitasyon mo, junction na nahiwalay sa lahat ng source, o solver na hindi nag-settle. Nasa Problems panel din ang parehong findings. Itakda ang mga limitasyon sa window (20 psi, 100 psi, at 10 ft/s para magsimula; 140 kPa, 700 kPa, at 3 m/s sa metro project).

## Fire flow

Gumuguhit ang {{ui:Fire flow…}} ng daloy sa isang junction at ipinapakita ang presyon doon at ang pinakamababang presyon saanman sa network. Hinahanap din nito ang daloy na available sa junction na iyon habang pinananatili ng pinakamahinang node sa network ang residual pressure na ibibigay mo. Nananatili ang ibang demand.

## Isang araw ng demand

Pinapatakbo ng {{ui:A day of demand…}} ang network kada oras. Ibigay ang demand pattern sa settings ng file (listahan ng multiplier na inuulit); pinupuno at pinauubos ng daloy papasok at palabas ang mga tank, at puwedeng sundan ng pump ang on/off pattern. Ang tank na umabot sa pinakamataas o pinakamababang antas nito ay pinangalanan sa listahan. Hindi isinasara ng CivilCraft ang inlet o outlet nito para sa iyo, kaya basahin ito bilang "masyadong maliit ang tank na ito o masyadong malaki ang pump".

## EPANET text

Isinusulat ng {{ui:Save as EPANET text (.inp)}} ang network sa plain-text na format na binabasa ng maraming water program, at binabasa ng {{ui:Open EPANET text (.inp)…}} ang isa. Ang naipapasa lang ay kung ano ang namomodelo ng CivilCraft: junctions, reservoirs, tanks, pipes, pumps na may head curve, pressure reducing valves, demand patterns, at mga oras. Ang ibang uri ng valve, pumps na ibinigay sa power, at ibang headloss formula ay pinangalanan at iniiwan. Dapat gamitin ng file ang parehong unit ng project.

## Hydrant, valve, at fitting

Piliin ang junction at lagyan ng check ang **Hydrant** para maglagay ng hydrant doon; piliin ang main at pindutin ang **Add at the middle** para maglagay ng valve, air valve, blow-off, o meter dito. Mga object ng network ang mga ito: gumagalaw sila kasama nito, at isang undo step lang ang nag-aalis sa kanila.

Ipinahihiwatig din ng layout ang mga fitting, at inililista ito ng CivilCraft nang hindi hinihingi: isang **tee** kung saan nagtatagpo ang tatlong main, isang **cross** kung saan apat, isang **bend** (kasama ang anggulo nito) kung saan lumiliko ng 5° o higit pa ang dalawang main, isang **reducer** kung saan nagtatagpo ang dalawang laki, at isang **cap** sa dead end. Binibilang ng {{ui:Fittings schedule (CSV)}} ang mga ito at ang mga main ayon sa laki. Ito ang ipinahihiwatig ng layout, isang take-off na dapat ikumpara sa sarili mong detalye, hindi listahan para mag-order.

Nakalatag ang mains sa ground na binawasan ng cover (4 ft o 1.2 m) para mai-draw at ma-model sa 3D; hindi kailanman nakadepende ang mga presyon sa itaas dito.

## Sa plano at sa mga file

Dinadala ng plano, ng PDF, at ng DWG o DXF ang mains sa **C-WATR-MAIN** kasama ang kanilang laki sa **C-WATR-TEXT**, hydrants sa **C-WATR-HYDR**, valves sa **C-WATR-VALV**, at fittings sa **C-WATR-FITT**. Ang LandXML out ay nagsusulat ng water pipe network (isang structure para sa bawat node, isang pipe para sa bawat main, pinangalanang hydrants); binabasa ito ng LandXML in pabalik bilang water mains, nang walang demand, pumps, o valves, na hindi dala ng LandXML. Isinusulat ng IFC export ang mains bilang pipe segments, hydrants, valves, at fittings sa iisang water system. Nasuri ang mga file na ito laban sa sarili naming reader at writer; subukan ang mga ito sa iba mong program at sabihin sa amin ang sinasabi nila.

## Ano ang wala pa rito

Kalidad at edad ng tubig, control at rules na lampas sa on/off pattern ng pump, ibang uri ng valve, demand ayon sa presyon, pipes na nagbabago ang diameter, at daloy ng sewer sa paglipas ng panahon. Tingnan ang [Hindi pa nagagawa](topic:not-built-yet). Ang sanitary design flows, na ibang kalkulasyon, ay nasa [Sanitary design flows](topic:sanitary-design).
