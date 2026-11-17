---
title: Reikna út úrhellisrennsli, stærðir pípa og vatnshallalínuna
summary: Teikna vatnasvæðin sem renna í hvert mannvirki, leggja saman rennsli niður netið með skynsemisaðferðinni, stilla stærð pípanna með jöfnu Mannings og sjá hvar vatnshallalínan er full eða nær yfirborði.
keywords: regnvatnsræsi, vatnasvæði, skynsemisaðferð, rennslisstuðull, samsöfnunartími, styrkur úrkomu, IDF, Manning, stærð pípa, vatnshallalína, HGL, orkuhallalína, EGL, yfirálag, flóð, útrennslisvatn
from: e44872ec
---

Regnvatnsræsi vinnur á [pípunetinu](topic:pipe-network): teiknaðu netið fyrst, síðan svæðin sem renna í það. Allt birtist undir **Regnvatnsræsi** í hægra spjaldinu þegar ekkert er valið.

## Teikna vatnasvæði

1. Smelltu á **Teikna vatnasvæði** undir **Regnvatnsræsi**.
2. Smelltu á hornin á svæðinu sem rennur í eitt mannvirki. {{key:Enter}} eða tvísmellur lýkur; {{key:Backspace}} tekur síðasta hornið til baka, {{key:Esc}} hættir.
3. Vatnasvæðið rennur í mannvirki innan þess, annars það næsta. **Eiginleikar** þess opnast: stilltu heiti þess, **rennslisstuðul C** (hlutfall úrkomunnar sem rennur af, 0 til 1), **samsöfnunartíma** í mínútum og í hvaða mannvirki það **rennur í**.

**Teikna annað vatnasvæði** í eiginleikum þess byrjar það næsta. Smelltu inni í vatnasvæði á grunnmynd til að velja það; {{key:Delete}} fjarlægir það. Hver breyting er eitt skref: {{key:Mod+Z}} afturkallar hana.

## Stilla hönnunarúrhellið

Styrkur úrkomunnar er i = a ÷ (tc + b) í veldinu c, í in/klst. fyrir verkefni í ft og mm/klst. fyrir verkefni í m. Láttu **Styrk a**, **b** og **c** passa við þinn eigin styrk–lengd–tíðni-feril fyrir endurkomutímabilið sem þú hannar fyrir.

:::warning
Upphafsstyrkferillinn, Manning n (0.013) og tap við mót (0.5) eru bráðabirgðatölur, ekki staðall. Stilltu þær út frá þínum eigin úrkomugögnum og hönnunarviðmiðum.
:::

- **Stysti samsöfnunartími**: engin pípa er reiknuð út við styttri tíma (10 mínútur í upphafi).
- **Manning n**: grófleiki pípanna.
- **Tap við mót**: fallhæðin sem tapast í hverju mannvirki, sem hlutfall af hraðahæðinni V²/2g í pípunni sem fer út úr því.
- **Vatnsborð við útrennsli**: útrennslisvatnið, þar sem síðasta pípan tæmist. Hafðu það autt þegar útrennslið er frjálst.

## Hvernig rennslið leggst saman

Hver pípa ber öll vatnasvæði fyrir ofan sig. Q = C × i × A, þar sem C × A er lagt saman niður netið og i er styrkurinn við lengsta samsöfnunartíma vatnsins sem berst: eigin tími vatnasvæðisins, eða tíminn frá vatnasvæði ofar í rásinni að viðbættum ferðatímanum í gegnum pípurnar (lengd ÷ hraðinn við fulla rennsli). Q er í cu ft/s (A í ekrum) eða m³/s (A í hekturum).

## Stilla stærð pípanna

Taflan undir **Rennsli og hallalínur** sýnir fyrir hverja pípu rennslið, hvað hún ber fullrennandi við sinn halla, hraðann, vatnshallann efst og neðst og hversu djúpt hún rennur.

**Stilla stærð pípanna fyrir þessi rennsli** gefur hverri pípu minnstu staðlaðri stærð sem ber rennsli hennar við eigin halla (12 til 72 in, eða 300 til 1800 mm). Það er eitt skref. Botnkótarnir haldast þar sem þeir eru: ef stærðir breytast skaltu nota **Setja alla botnkóta eftir reglunum** til að halda yfirfyllingunni, og athuga síðan töfluna aftur.

## Lesa hallalínurnar

Vatnshallalínan (HGL) er reiknuð út frá útrennslinu upp eftir ræsinu:

- Pípa sem rennur hálffull hefur HGL við vatnsyfirborðið: botnkótann að viðbættri eðlilegri dýpt.
- Þegar vatnið fyrir neðan er hærra en hvelfing pípunnar, eða hún ber meira en hún getur borið fullrennandi, rennur hún full (yfirálag) og HGL hækkar um núningshallann yfir lengd hennar.
- Við hvert mannvirki er HGL efsta HGL útfarandi pípunnar að viðbættu tapinu við mótið.
- Orkuhallalínan (EGL) er HGL að viðbættri hraðahæðinni.

Pípa sem rennur full er skráð, og það sama gildir um hvert mannvirki þar sem HGL er yfir brúninni: vatnið nær yfirborði þar og mannvirkið er auðkennt með rauðum hring á grunnmynd. Veldu pípu eða mannvirki til að sjá rennsli, dýpt, hraða og báðar hallalínurnar í **Eiginleikum** þess.

## Reikna út úrhellið

Skynsemisaðferðin gefur einn hámarksrennsli fyrir hverja pípu. {{ui:Reikna úrhellið}} (undir niðurstöðunum, í **Eiginleikum** netsins) reiknar í staðinn allt úrhellið: rennsli hvers vatnasvæðis yfir tíma, borið niður pípurnar með ferðatíma sínum og geymslu og lagt saman þar sem þau mætast.

1. Hafðu {{ui:Rigningin varir}} og {{ui:Styrkur úrkomu}} auð til að nota lengsta samsöfnunartíma og úrkomuferilinn hér að ofan, eða skráðu þínar eigin.
2. Ýttu á {{ui:Reikna úrhellið}}. Taflan sýnir fyrir hverja pípu mesta rennsli inn og út, hversu mikið lægra hámark útrennslisins er, hversu stóran hluta fullrar afkastagetu pípunnar það notar og hvaða mínútu það nær hámarki.
3. Hvert útrennsli fær lítið línurit af rennsli yfir tíma og {{ui:Sækja vatnsritið (CSV)}}.

Vatnasvæði skilar úrkomunni meðaltalinni yfir samsöfnunartíma sinn, þannig að úrhelli sem er styttra en það nær lægra hámarki en C × i × A. Hver pípa er reiknuð með Muskingum–Cunge aðferðinni, með vatnsdýptinni sem skynsemisaðferðin fann þegar. Tvær greinar með mismunandi samsöfnunartíma ná ekki hámarki saman, þannig að summa þeirra er lægri en summa hámarkanna.

Þetta líkir ekki eftir yfirálagi, bakvatni, geymslu í mannvirkjum eða flóðum. Pípa sem hefur reiknað hámark yfir fullri afkastagetu sinni er skráð, og vatnið hennar er sent áfram eins og það kæmist fyrir. Notaðu þetta til að sjá tímasetningu og dempun, ekki til að stilla stærð pípunnar. Þetta er reikningshjálp: verkfræðingur yfirfer það.

## Vistað með verkefninu

Vatnasvæðin og úrhellisstillingarnar eru vistaðar í verkefnaskránni. Þau eru ekki enn í PDF-útprentun, DWG eða DXF né LandXML: sjá [Ekki smíðað enn](topic:not-built-yet).
