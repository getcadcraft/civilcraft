---
title: Mga water surface profile ng ilog
summary: Imodelo ang ilog mula sa ground surface at kuwentahin ang steady water surface profile sa pamamagitan ng standard step method: lebel ng tubig, enerhiya, bilis, Froude number at lawak ng baha sa plan. Lab feature ito; kailangan ng bawat resulta ang pagsusuri ng engineer.
keywords: levee, ineffective flow area, section editor, river, ilog, hydraulics, water surface profile, backwater, standard step, steady flow, 1d, cross sections, manning, roughness, conveyance, critical depth, normal depth, froude, energy grade line, flood extent, floodplain, inundation, bank stations, reach lengths, contraction, expansion, subcritical, supercritical, mixed regime, hydraulic jump
from: fb8bf425
---

Kinukuwenta ng CivilCraft ang steady at one-dimensional na water surface profile sa kahabaan ng ilog: para sa bawat flow na ibibigay ninyo, ang lebel ng tubig sa bawat cross section, mula sa energy balance sa pagitan ng magkakatabing section (ang standard step method). Nasa lab ito habang sinusuri pa.

**Design aid lamang.** Kailangan ng pagsusuri ng isang kwalipikadong engineer ang mga lebel ng tubig bago ito pagkatiwalaan ninuman: ang 1D model ay kasing-galing lamang ng mga section, roughness value, reach length at boundary nito, at hindi nito alam ang tungkol sa tulay, culvert o daloy na lumalabas sa ilog.

## Iguhit ang ilog

1. Buuin muna ang kasalukuyang ground surface (mga point, breakline, o TIN na binuksan ninyo).
2. Sa ilalim ng **Surface** › {{ui:More}}, piliin ang {{ui:River}}.
3. I-click sa kahabaan ng centerline ng ilog **mula upstream hanggang downstream**, saka pindutin ang {{key:Enter}} o mag-double-click.

Gumagawa ang CivilCraft ng section na patayo sa centerline bawat 50 m (200 ft), na may 100 m (300 ft) sa bawat gilid, mula sa lupa. Sinusukat ang river station mula sa downstream na dulo, kaya tumataas ito pataas ng agos. Nagsisimula ang mga bangko bilang hula na 10 m (30 ft) sa magkabilang gilid ng pinakamababang punto ng bawat section.

Para magdagdag ng section kung saan sumisikip ang ilog o may nakatayong structure, piliin ang ilog, i-click ang {{ui:Add a section}} at iguhit ang cut line sa kabila nito (alinman sa dalawang direksyon: iikutin ito para tumakbo mula kaliwa pakanan kapag tinitingnan ang downstream).

## Ayusin ang ilog

Piliin ang ilog para makita ito sa **Properties**:

- **Flow regime**: subcritical (ang karaniwang kaso: kinukuwenta pataas ng agos mula sa downstream boundary), supercritical (kinukuwenta pababa ng agos mula sa upstream boundary) o mixed (pareho, saka ang may mas malaking specific force sa bawat section; may preview).
- **Flow profiles**: isang pangalan at isang flow para sa bawat isa (halimbawa 10-year at 100-year na flow), at ang boundary sa downstream na dulo (at sa upstream na dulo kapag hindi subcritical ang regime): **Normal depth** na may energy slope (ang bed slope ay unang hula lamang), isang **Known water surface** na elevation, o **Critical depth**.
- **Sections from the ground**: ang spacing, gaano kalayo pakaliwa at pakanan, ang hula sa bangko at ang dalawang Manning's n value; ang {{ui:Cut sections again}} ay pumapalit sa mga section (isang undo step).
- **Ang sections table**: para sa bawat section, ang left at right bank offset, ang channel n at ang overbank n, ang reach length papunta sa susunod na section sa downstream (left overbank, channel, right overbank; sinusukat mula sa plan para magsimula) at ang contraction at expansion coefficient (0.1 at 0.3 bilang panimula: unti-unting transition). Binubuksan ng {{ui:Edit}} ang section editor (sa susunod); may tuldok sa tabi nito kapag may levee o ineffective area ang section.

Bawat pagbabago ay isang undo step ({{key:Mod+Z}}).

## I-edit ang section: mga bangko, levee at ineffective area

Ang {{ui:Edit}} sa isang section ay gumuguhit sa ground nito at pinapayagan kayong i-drag ang binabasa ng solver: ang **left at right bank** (hinahati nila ang section sa left overbank, main channel at right overbank), isang **levee** sa alinmang gilid at **ineffective flow area**. Maaari ding ilipat ang bawat handle gamit ang arrow key, at maaaring i-type ang bawat numero sa tabi ng plot. Ang {{ui:Apply}} ay isang undo step.

- Ang **levee** ay may lugar (offset) at crest elevation. Ang lupang lampas nito, palayo sa ilog, ay pinuputol mula sa ilog habang nasa ibaba ng crest ang water surface: hindi kasama ang lawak, wetted perimeter at conveyance nito. Kapag nasa itaas ng crest, muling binibilang ang buong section. Nakatayo ang levee sa labas ng bangkong pinoprotektahan nito; ang nasa loob ng mga bangko ay namamarkahan.
- Ang **ineffective flow area** ay may hawak na tubig pero walang dumadaloy (isang bulsa sa likod ng embankment, patay na tubig sa tabi ng approach ng tulay). Ibigay ang dalawang offset nito at, kung gusto ninyo, isang lebel ng tubig kung saan ito ineffective ({{ui:always}} kapag walang laman): sa itaas ng lebel na iyon, dumadaloy ito tulad ng iba. Namamarkahan ang bahaging tumatakip sa main channel.
- Sa pagitan ng dalawang section, iniiwan ng lawak ng baha na tuyo ang lupa sa likod ng levee na pareho sa dalawang section, habang nasa ibaba ng crest ang water surface doon (tuwid ang linya sa pagitan ng dalawang crest).

## Kuwentahin at basahin ang mga resulta

I-click ang {{ui:Water surface profiles}}. Para sa profile na pipiliin ninyo, makukuha ninyo ang:

- isang **plot** sa kahabaan ng ilog (dumadaloy mula kaliwa pakanan): ilalim ng channel, mga bangko, water surface, energy grade line at critical water surface; ang mga section na nakahawak sa critical depth ay binibilugan;
- isang **table** bawat section: river station, flow, ilalim ng channel, water surface, critical water surface, energy grade line, lalim, bilis sa channel at sa kabuuan, ang Froude number ng channel, flow area, top width, ang flow sa bawat overbank at sa channel, ang energy slope, at mga warning;
- mga **warning** sa malinaw na salita, halimbawa isang section na nakatakda sa critical depth, tubig na lampas sa dulo ng section, o malaking pagbabago sa conveyance sa pagitan ng dalawang section (magdagdag ng section sa gitna).

Ang {{ui:Table (CSV)}}, {{ui:Report}} (plain text na may method, boundary at bawat table) at {{ui:Plot (SVG)}} ay sine-save sa inyong downloads. Bawat isa ay may kasamang linya ng pagsusuri.

I-tsek ang {{ui:Show the flood extent}} sa **Properties** para lagyan ng shade ang basang lugar sa plan para sa piniling profile, kasama ang waterline na iginuhit kung saan zero ang lalim. Sa pagitan ng mga section, pantay ang water surface sa kabuuan ng ilog at nagbabago nang linear ayon sa river station. Nananatiling tuyo ang lupa sa likod ng levee habang nasa ilalim ng crest ang tubig. Nilalagyan pa rin ng shade ang iba pang mababang lupa sa loob ng corridor ng ilog na hindi maaabot ng tubig (halimbawa sa likod ng road embankment): suriin ito.

## Sa drawing at sa Problema

Pumupunta sa plan, PDF at DWG ang mga linya ng ilog sa sarili nilang layer: **C-WATR-CNTR** (ang centerline), **C-WATR-SCTN** (bawat cut line, kasama ang river station nito) at **C-WATR-FLOD** (ang waterline ng lawak ng baha, kapag naka-tsek ang {{ui:Show the flood extent}} para sa isang profile). Pumupunta rin sa **Problema** panel ang mga warning ng ilog (section na nakatakda sa critical depth, tubig na lampas sa dulo ng section, pagbabago sa conveyance na nangangailangan ng mas maraming section, energy balance na hindi nagsara, levee sa loob ng mga bangko), tungkol sa ilog at nakalagay sa section na pinanggalingan nila.

## Paano ito kinukuwenta

- Enerhiya sa pagitan ng dalawang section: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Conveyance sa pamamagitan ng subdivision: hinahati ang bawat overbank kung saan nagbabago ang n nito, K = Σ (1/n)·A·R^(2/3) (1.486/n sa US units); ang channel ay isang piraso, na may composite n kapag nagbago ang n nito. Galing ang α sa kung paano hinahati ang conveyance.
- Friction slope sa pamamagitan ng average conveyance, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², sa ibabaw ng haba ng reach na timbang ayon sa flow.
- Contraction coefficient kapag bumibilis ang daloy pababa ng agos, expansion kapag bumabagal.
- Critical depth = pinakamaliit na specific energy. Bawat lebel ng tubig ay nilulutas sa isang bracket, kaya hindi ito tumatalon sa maling panig ng critical; kapag walang sagot, itinatakda ito sa critical depth at namamarkahan.

Sinusuri ang programa laban sa Manning's normal depth, critical depth sa rectangular channel, at sa halimbawa ni Chow sa backwater (*Open-Channel Hydraulics*, 1959, chapter 10) na independiyenteng in-integrate. Ginagamit ng mga karaniwang 1D river program ang parehong method, kaya lilipat din ang isang manu-manong kuwenta o ang notes ng estudyante.

## Culvert at tulay

Sa **Properties** ng ilog, sa ilalim ng **Culverts and bridges**, inilalagay ng {{ui:Add a culvert}} o {{ui:Add a bridge}} ang isa sa pagitan ng dalawang section (bawat bahagi ay may kahit dalawang section). Hindi nagbabago ang profile sa ibaba nito; ang water surface sa ibabaw mismo nito ay galing sa structure, at nagpapatuloy ang profile pataas ng agos mula roon. Nagdadagdag ang **Results** ng table para sa bawat structure: tailwater, headwater level, aling control ang nangingibabaw, ang flow sa dumaraang bukana at ang flow sa ibabaw ng kalsada o deck. Subcritical flow lamang.

- **Culvert** (box o round, isa o higit pang magkakapantay na barrel). Ang entrance control ay weir flow habang bukas ang pasukan at orifice flow kapag nalubog na, pinaghahalo sa pagitan ng headwater na isa at isa at kalahating beses ang rise. Ang outlet control ay ang energy balance: entrance loss, friction at exit velocity head, sa mas mataas sa tailwater at sa gitnang taas ng critical depth at ng crown, minus ang pagbaba sa kahabaan ng barrel. Ang headwater ay ang mas malaki sa dalawa. Lagyan ng tsek ang **Water can go over the road** at makikibahagi ang weir flow ng kalsada sa flow kasama ng mga barrel.
- **Bridge.** Ang bukana ay ang section sa ibaba ng tulay, hinati sa abutment, na ang bawat pier ay isang lugar na walang dumadaloy. Ang water surface sa bukana ay galing sa section sa ibaba (expansion coefficient), at ang section sa itaas ay galing sa bukana (contraction coefficient). Kung hindi kayang dumaan ng bukana ang flow sa tailwater na iyon, tumatakbo ito sa critical depth at namamarkahan ang tulay bilang choking. Kapag umabot ang tubig sa low chord, pressure flow ito (uri ng sluice habang nasa ilalim ng low chord ang tailwater, nalubog kapag nasa itaas nito), at ang tubig sa ibabaw ng deck ay nagdaragdag ng weir flow; ang lebel sa upstream ay yaong kung saan nagdadagdag sila hanggang sa flow.

Ang mga coefficient (discharge, entrance loss, weir) ay mga round-number na default na i-type. Palitan ang mga ito para sa inyong design. Hindi sila ang fitted chart na inilalathala ng mga culvert design manual, kaya ituring na estimate ang headwater ng culvert na malapit sa limit nito. Ang tubig sa ibabaw ng kalsada o deck, nalubog na pasukan, nasarang bukana at mabilis na daloy sa barrel ay ipinapakita sa **Problema**.

## Unsteady flow

Ang {{ui:Unsteady flow…}} sa **Properties** ng ilog ay nagpapadaan ng flood hydrograph sa mga section. I-type ang inflow bilang oras at flow, isang pares bawat linya, ang downstream slope (normal depth) at kung gaano katagal patakbuhin. Nagsisimula ito sa steady water surface sa unang flow at nilulutas ang buong one-dimensional na equation (ang implicit four-point scheme, may timbang na 0.6 sa oras). Makukuha ninyo ang peak water level at flow sa bawat section kasama ang oras ng bawat isa, isang plot ng flow sa dalawang dulo, at ang volume check (papasok, palabas at ang pagbabagong naiimbak). Sinusuri ito para manatiling steady ang steady flow, ang hakbang sa inflow na nagtatapos sa steady profile ng bagong flow, nagsasara ang volume, at ang bilis ng flood wave laban sa kinematic wave. Subcritical flow, isang reach, walang side inflow, at walang culvert o tulay sa loob ng run.

## Junction

Mga reach na nagsasama ng flow sa iisang outlet: nagdaragdag ang mga flow, at ang water surface sa ulo ng downstream reach ay iniaangat hanggang sa mga dulo ng mga reach na sumasali dito (ang parehong water surface sa junction, ang simpleng method: walang anggulo, walang momentum, kaya angkop ito sa mababang Froude number). Nasa lugar na ang model at mga test (`river-structures.js`); hindi pa naitatayo ang panel para pagsamahin ang dalawang ilog sa plan.

## Hindi pa naitatayo

Mga weir at gate bilang sariling structure, panel para sa junction, mga structure sa loob ng unsteady run, at supercritical unsteady flow. Namamarkahan ng mixed-regime run ang hydraulic jump sa pagitan ng dalawang section pero hindi ito inilalagay.

**Saan nagtatagpo ang mga ilog.** Sa Properties ng ilog, pinangangalanan ng "Flows into" ang ilog na sinasamahan nito. Sabay na nilulutas ang mga ilog na nagsasama, ang ilog na pinupuntahan nila ay nagdadala ng kabuuan ng kanilang mga flow, at bawat isa ay nagtatapos sa water surface ng unang section ng ilog na iyon (ang equal water surface method; inaalis nito ang anggulo at momentum ng mga flow). Para pagsamahin ang pangunahing ilog at isang sapa, gumuhit ng maikling ilog sa ibaba ng junction at paagusin pareho papunta roon. Ipinapakita ng mga resulta ang junction table. Ang mga default sa mga resultang ito (contraction 0.1, expansion 0.3, channel na isang piraso na may composite roughness, ang mixed regime ayon sa specific force) ay mananatili hanggang suriin ng engineer, at sinasabi ito ng Results.
