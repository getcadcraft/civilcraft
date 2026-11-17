---
title: "Loftslagsbreytingar: flóð, hiti og gróðureldar 2050 og 2080"
summary: Í Heimilisfang í svæði skaltu hækka flóðahæð svæðisins fyrir framtíðarloftslag, meta áhættu gróðurelda og breyta veðurskrá, til samanburðar við núverandi, úr loftslagsgagnapakka (SSP2-4.5 og SSP5-8.5, 2050 og 2080).
keywords: loftslag, loftslagsbreytingar, framtíð, 2050, 2080, ssp, cmip6, sviðsmynd, sjávarborð, flóð, grunnflóðahæð, bfe, fema, hiti, veðurskrá, epw, mótun, gróðureldur, kjarreldur
from: b0d2ee38
---

Loftslagstölurnar koma úr **gagnapakka**, ekki úr forritinu. Kveiktu á viðbótinni {{ui:Loftslagsframtíðir}} í Stillingar › Viðbætur, eða hlaðaðu inn eigin pakkaskrá í reitinn {{ui:Loftslagsframtíð}}.

:::warning
Pakkinn sem fylgir viðbótinni er **sýnishorn**: þrír staðir (Denver, Miami, Jóhannesarborg), eitt loftslagslíkan og fimm ár í hverju 20 ára tímabili. Hann er þarna til að prófa verkfærin, **ekki til hönnunar**. Fullur pakki er smíðaður með `tools/climate/build-pack.mjs` úr NEX-GDDP-CMIP6-gögnum NASA.
:::

## Hvar það er

Yfirborð › Meira › Heimilisfang í svæði. Stilltu punktinn, bættu við lögum (FEMA-flóðalag gefur grunnflóðahæðina) og ýttu á hnappinn sem les svæðið. Undir línum svæðisins er reiturinn {{ui:Loftslagsframtíð}}: veldu **Sviðsmynd** (SSP2-4.5 eða SSP5-8.5) og **Ár** (2050 = 2041-2060, 2080 = 2071-2090, bæði miðað við 1995-2014). Staður pakkans næst punktinum er notaður, eða sá sem þú velur; langt frá öllum stöðum eru hnattrænu meðalbreytingarnar notaðar og spjaldið segir það.

## Hönnunarflóðahæð

Núverandi hæð er grunnflóðahæð FEMA þegar flóðalagið hafði hana (fet, NAVD 88), annars skrifarðu þína eigin. Veldu tegund flóðs (strandflóð, árflóð eða úrhellisflóð, eða bæði), flóðdýpið á svæðinu fyrir úrkomuhlutann, og frírými ef þú vilt. {{ui:Hækka flóðahæðina}} sýnir núverandi og framtíðarhæð hlið við hlið, hluta sjávarborðs og úrkomu, og forsendurnar: öll hækkun sjávarborðs er bætt við strandhæð; rennsli áa hækkar einu á móti einu með mestu úrkomu á blautasta degi og dýpi fylgir rennslinu upphafið 0,6 (Manning, breiður farvegur); hlutarnir eru lagðir saman.

:::warning
Mat á breytingunni, ekki flóðarannsókn. Hönnunarflóðahæðin er ákvörðun yfirvaldsins eða verkfræðingsins þíns.
:::

## Áhætta gróðurelda (aðeins forskoðun)

Næsti gróður, hallinn upp frá honum og fjarlægðin gefa band frá mjög lágu til öfgafulls, núverandi og framtíðar (framtíðin margfaldar með breytingu pakkans á eldveðurstuðlinum). **Aðeins forskoðun:** okkar eigin afstæði kvarði til að sjá hvort svæði þurfi fulla gróðureldamat; ekki byggingarreglugerðareinkunn.

## Hiti: framtíðar veðurskrá

Veldu núverandi `.epw`-skrá og {{ui:Búa til framtíðar veðurskrána}}: hún er mótuð með birtri tilfærslu- og teygjuaðferð (Belcher, Hacker og Powell 2005) og hitinn er borinn saman (meðal- og hæsti hiti, hönnunarhiti, klukkustundir yfir 30 °C og 35 °C, hitastigsdagar). {{ui:Vista framtíðar veðurskrána}} vistar hana fyrir Umhverfisspjaldið, orkuathugun BimCraft eða þín eigin verkfæri.

## Hvaðan tölurnar koma

NASA NEX-GDDP-CMIP6 (niðurskalað úttak CMIP6-líkana, CC BY 4.0 fyrir hvert líkan) fyrir hita, raka, sólskin, rigningu og eldveður; hnattrænt meðaltal IPCC AR6 fyrir hækkun sjávarborðs nema pakkinn hafi staðbundnar tölur. Spjaldið sýnir uppruna pakkans, leyfi og dagsetningu.
