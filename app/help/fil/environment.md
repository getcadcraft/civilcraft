---
title: Shade, solar yield at outdoor comfort
summary: Pag-aralan ang anino na inihahagis ng mga mass ng gusali sa isang araw o isang season, tingnan ang animation nito, kalkulahin kung gaano karaming kuryente ang magagawa ng solar panel sa bubong at dingding sa karaniwang taon, tingnan kung gaano kaginhawa ang kalsadang katabi ng gusali (UTCI), at kumuha ng screening reading ng pedestrian wind comfort.
keywords: shade study, anino, sun hours, animation, solar, PV, photovoltaic, panels, yield, kWh, EPW, weather file, UTCI, thermal comfort, outdoor comfort, heat stress, wind
from: 96e7af4d
---

Nasa ilalim ng **Sun hours** sa **Properties** ng isang mass ang seksyong **Environment**. Ginagamit nito ang mass na iginuhit mo bilang mga gusali.

## Mag-load ng weather file

Pumili ng typical-year weather file (**.epw**) para sa iyong bayan. Libre ang mga ito mula sa EnergyPlus weather site at sa climate.onebuilding.org. Nananatili ang file sa iyong browser para sa pagbisitang ito. Kailangan ito ng solar yield at ng comfort study; gumagana ang shade study kahit wala ito kapag may coordinate system ang proyekto.

## Shade study

Pumili ng date (o i-tick ang **Season** at isang huling date at step sa araw) at isang time zone, saka **Patakbuhin ang shade study**. Makakakuha ka ng mapa ng mga oras ng araw, o ng anino, sa lupa sa paligid ng mass; isang table kung gaano karaming lupa ang nasa anino sa buong araw; at isang animation ng araw na maaari mong i-play o hakbang-hakbangin. Iniingatan ng **I-save ang map**, **I-save ang animation frames** (lahat ng frame sa iisang larawan) at **I-save ang hours** (CSV) ang mga resulta.

Itinuturing na patag ang lupa sa antas ng pinakamababang mass. Para sa anino sa dalisdis na lupa, gamitin ang **Sun hours**, na binabasa ang terrain.

## Solar yield

Itakda ang panel efficiency, kung gaano kalaking bahagi ng bawat bubong at dingding ang natatakpan, at ang system losses, saka **Patakbuhin ang solar yield**. Para sa bawat bubong at dingding, makukuha mo ang kuryenteng magagawa ng isang metro kuwadradong panel sa karaniwang taon, kung gaano karami nito ang inaalis ng mga kalapit na mass, at ang kabuuan para sa bawat mass. Nakasulat sa simpleng salita ang modelo sa tabi ng button: planning estimate ito mula sa karaniwang taon, hindi garantiya.

## Outdoor comfort

**Patakbuhin ang comfort** ay kinukuwenta ang Universal Thermal Climate Index (UTCI) para sa taong nakatayo sa bukas na lupa at sa tabi ng unang mass (sa timog, hilaga, silangan at kanluran), kasama ang anino ng bawat mass. Ipinapakita nito kung gaano karaming langit ang nakikita, ang average na UTCI sa araw, at ang mga oras na higit sa 32 (heat stress) at mas mababa sa 0 (cold stress).

## Wind (screening)

**Patakbuhin ang wind study** ay nilulutas ang daloy ng hangin sa paligid ng mass nang isang beses para sa bawat direksyon ng hangin na umiihip sa iyong weather file (4, 8, 12 o 16 na direksyon), sa paligid na pipiliin mo (bukas na lupa, suburb o sentro ng lungsod), saka pinagsasama ang hourly wind ng buong taon. Kinukulayan ng mapa ang lupa ayon sa comfort class, mula berde (**sitting**) hanggang **standing**, **strolling** at **walking**, hanggang pula (**uncomfortable**): ang aktibidad na ang limit speed (4, 6, 8 at 10 m/s) ay nalalampasan nang hindi lalampas sa 5 % ng mga oras. Nagbibigay ang pangalawang table ng NEN 8100 grade (A hanggang E) batay sa bahagi ng mga oras na lumalampas ang hangin sa 5 m/s. Pinaparami ng gust factor ang hourly mean para makuha ang epektibong gust.

Paano ito gumagana, sa simpleng salita: isang lattice-Boltzmann large-eddy flow solver (sarili naming gawa, nasa library na `lib/wind`) sa isang kahon sa paligid ng mga gusali, isang wind-speed profile na tumataas kasabay ng taas ayon sa napiling roughness, at ang bilis na mga 1.5 m sa itaas ng lupa na inihahambing sa bilis sa unahan sa 10 m. Mabilis at magaspang ang **Screening**; mas maraming cell ang gamit ng **Standard** at mas matagal itong tumakbo. Kung sinasabi ng panel na magaspang ang grid (mas mababa sa 10 cell sa ibabaw ng pinakamataas na gusali), o nagbabago pa rin ang daloy, paniwalaan nang kaunti ang mapa.

**Ano ito hindi.** Nasuri ang solver sa mga textbook flow (isang channel, isang lid-driven cavity) at pinatakbo sa isang cube para tingnan kung tama ang wake at ang pagbilis ng hangin sa mga sulok. **Hindi** ito na-validate laban sa mga sukat sa wind tunnel ng mga gusali, kaya may label na unvalidated ang bawat resulta. Huwag itong gamitin para sa design value, wind load o planning certificate: dapat patakbuhin at patunayan ng wind engineer ang tamang pag-aaral. Ang patag na lupa, makinis na dingding ng gusali, ang shortcut sa roughness ng weather station at ang threshold table ay mga pinasimple; maaaring magkaiba ang mga threshold sa criteria na ginagamit ng iyong awtoridad.

## Wind gamit ang OpenFOAM (add-on)

Experimental ang built-in na wind engine sa itaas. Para sa tunay na flow solver, i-on ang add-on na **Pedestrian wind (OpenFOAM)** sa **Mga setting > Add-on** (naka-off ito hanggang gawin mo). GPL-licensed na software ito na sarili nito, nakahiwalay sa iba pang bahagi ng CadCraft, at hindi kasama ang OpenFOAM: ikaw ang mag-i-install nito. Pagkatapos, nakalista ang OpenFOAM sa **Engine** sa wind block.

Ang kailangang i-set up, isang beses:
1. **I-install ang OpenFOAM** (ang ESI v-series mula sa openfoam.com; nasubukan ang add-on sa v2512). Sa Ubuntu o Debian (pati sa loob ng WSL sa Windows): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, saka `sudo apt install openfoam2512-default`. Nag-i-install ito sa ilalim ng `/usr/lib/openfoam/openfoam2512`. Kailangan ng CadCraft ang `blockMesh`, `snappyHexMesh` at `simpleFoam` para tumakbo. (Gumagana rin ang mas lumang `openfoam` 1912 package sa sariling archive ng Ubuntu, pero bumabagsak ang function objects nito; binabasa ng add-on ang mga result file nang sarili nito.)
2. **Simulan ang helper** mula sa `runner` folder ng add-on gamit ang Node.js: `node cc-openfoam-runner.mjs serve`. Kung wala sa search path ang OpenFOAM, bigyan ito ng maliit na `runner.json` na may path sa `etc/bashrc` ng OpenFOAM (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) at simulan ito gamit ang `--config runner.json`. Nakikinig ang helper sa computer na ito lamang at naglalabas ng token.
3. **I-paste ang token** sa mga field ng add-on sa wind block (nananatili ang address na `http://127.0.0.1:8765`) at pindutin ang **Suriin ang helper**.

Pagkatapos, gumagana ang **Patakbuhin ang wind study** nang isang kaso bawat direksyon ng hangin sa weather file: nagiging surface (STL) ang iyong mga mass sa isang kahon na sinukat ayon sa karaniwang gabay (5 taas ng gusali sa paligid at pataas, 10 sa likod), mina-mesh gamit ang blockMesh at snappyHexMesh, tinatakbo bilang steady k-epsilon RANS na may atmospheric boundary layer inlet sa roughness na pipiliin mo, at ang bilis sa 1.5 m ay binabasa pabalik at ginagawang parehong Lawson at NEN 8100 class. Walang umaalis sa iyong computer.

**Ano ang nasuri.** Sinasabi ito nang tahasan ng teksto sa itaas ng mga resulta, at bahagi ito ng bawat na-save na CSV. Nasubukan nang walang OpenFOAM ang case writing ng add-on, ang pagbasa ng resulta at ang buong pipeline, at isang cube ang napatakbo sa totoong OpenFOAM sa tatlong laki ng mesh (nasa project notes ang mga numero). **Hindi** ito na-validate laban sa mga sukat sa wind tunnel ng mga gusali. Isa itong screening reading, hindi design value at hindi certificate. Madalas mag-over-predict ng turbulence ang standard k-epsilon sa harap ng mga gusali; patag ang lupa, makinis ang mga dingding, at walang terrain o halaman.
