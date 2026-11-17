---
title: Gumuhit ng overhead line
summary: Maglagay ng support sa plan, hayaang tukuyin ng CivilCraft ang papel ng bawat support at ang mga seksiyon sa pagitan ng dead-end, at ilipat ang mga support sa plan o sa line profile.
keywords: overhead line, support, pole, span, section, dead-end, angle, suspension, profile, taas, crossarm, stay, guy
from: b8e5e272
---

## Iguhit ito

1. Kailangan mo ng surface: nagmumula rito ang lupa sa ilalim ng linya ([Build a surface](topic:build-surface)). Ang support na walang lupa sa ilalim ay nakalista sa ilalim ng **Checks**; i-type na lang ang **Ground level** nito sa Properties.
2. I-click ang {{ui:Line}} sa grupong Power lines at i-click ang bawat support sa plan.
3. I-double-click ang huli, o pindutin ang Enter.

Makukuha ng linya ang conductor, support at kagamitang huli mong ginamit sa computer na ito (sa unang pagkakataon: mga halimbawa mula sa library). Baguhin ang mga ito sa Properties.

## Ang linya sa Properties

Piliin ang linya (i-click ang isang span) para itakda ang **Conductor**, **Conductors per circuit**, **Circuits**, **Voltage**, ang **Clearance rule** na dapat nitong panatilihin sa ibabaw ng lupa, at ang kagamitang **On every support** (crossarm, insulator, fitting). Inililista ng table ang mga **section** nito kasama ang ruling span ng bawat isa, ang karaniwang tensyon, at ang load case na namamahala rito.

## Mga support

I-click ang support para piliin ito. Sa Properties:

- **Support**: ang library item nito. Kapag masyadong mahina, ilalagay ng {{ui:Gamitin …}} ang pinakamaliit na support ng parehong materyal sa iyong library na kayang magdala ng load.
- **Role**: Automatic, Suspension, Angle o Dead-end. Ang Automatic ay nangangahulugang: ang una at huling support ay dead-end; ang liko na lampas sa anggulo ng rule set ay ginagawang angle support; ang mas malaking liko ay dead-end.
- **Height above ground**: kapag walang laman, kinukuha ito sa library item (ang haba nito na binawasan ng lalim sa lupa).
- **On this support too**: karagdagang kagamitan, gaya ng **stay** (guy). Ang support na may stay ay ipinapasa ang hila ng linya sa stay nito.
- **Existing support**: sinusuri ito gaya ng iba pero hindi kasama sa mga dami.

{{ui:Support}} ay nagdadagdag ng support sa span na pinakamalapit sa click mo. I-drag ang support sa plan para ilipat ito. Inaalis ito ng Delete (dapat may hindi bababa sa dalawa ang linya).

Tumatakbo ang mga section sa pagitan ng dead-end: sa loob ng isang section, malayang dumadaan ang conductor sa mga suspension clamp, kaya iisa ang tensyon para sa buong section.

## Ang line profile

I-click ang {{ui:Profile}} (o ang **Profile** sa Properties ng linya). Ipinapakita ng panel sa ilalim ng plan ang lupa sa kahabaan ng linya, bawat support mula sa lupa hanggang sa tuktok nito, ang pinakamababang phase ng conductor sa **Load case** na pipiliin mo, at ang clearance na dapat panatilihin ng linya bilang dashed line. Pula ang span na hindi pumasa; ang numerong nasa ilalim ng bawat span ay ang pinakamababa nitong clearance.

- **Line** ang pumipili ng overhead line na ipapakita. Ang pagpili ng ibang linya, o isa sa mga support nito, sa plan ay nagpapalipat ng profile dito.
- Ilipat ang pointer sa ibabaw ng profile: sumusunod dito ang guide line, at binabasa ng label ang distansya sa kahabaan ng linya, ang lupa, ang conductor at ang clearance doon (at sinasabi kapag mas mababa sa rule ng linya ang clearance).
- {{ui:Sukatin}} sa bar ng profile: i-click ang dalawang punto para makuha ang distansya sa pagitan, ang pagkakaiba ng taas, ang tuwid na distansya at ang slope sa pagitan nila. Ang click malapit sa lupa, sa conductor o sa tuktok ng support ay dumidikit dito. I-click muli ang {{ui:Sukatin}} para huminto.
- Ang mga balakid na tinatawiran ng linya ay tumatayo mula sa lupa: ang mga iginuhit bilang bar, ang mga halaman ng Landscape bilang korona nila, ang mga pader bilang bar (tingnan ang [Power-line checks](topic:power-line-checks#clearances)). Ang mga cable route at pipe na tinatawiran ng linya ay minamarkahan sa ilalim ng lupa sa kanilang tuktok, kasama ang pangalan nila.

- I-drag ang support sa gilid para ilipat ito sa kahabaan ng linya.
- I-drag ang tuktok nito pataas o pababa para itakda ang taas nito sa ibabaw ng lupa.
