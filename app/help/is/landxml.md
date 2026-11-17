---
title: Skipti á LandXML
summary: Opnaðu LandXML frá annarri mannvirkjahugbúnaði sem nýtt verkefni, fluttu út punkta, yfirborð, veglínur, snið og lagnanetið sem LandXML 1.2, og veistu hvað kemst ekki með.
keywords: landxml, xml, innflutningur, útflutningur, skipti, tin, yfirborð, veglína, langsnið, lagnanet, samvirkni, gagnaskipti
from: 870d5ece
---

LandXML er opna skiptisniðið sem flest mannvirkjaforrit lesa og skrifa. CivilCraft les og skrifar LandXML 1.2. Ef þú hefur notað Civil 3D eru innflutnings- og útflutningsgluggar þess í LandXML næst því sem hér er; hér eru engir valkostir að taka, og athugasemdirnar segja þér hvað var skilið eftir.

## Opna LandXML-skrá

1. Smelltu á {{ui:Opna}} (eða ýttu á {{key:Mod+O}}) og veldu `.xml`- eða `.landxml`-skrána, eða slepptu henni á grunnmyndina.
2. Ef núverandi verkefni hefur óvistaðar breytingar spyr CivilCraft fyrst. Veldu {{ui:Vista afrit}}, {{ui:Ekki vista}} eða {{ui:Hætta við}}.
3. Nýtt **verkefni** er búið til. Stöðustikan segir hvað var lesið, til dæmis „Opnaði site.xml: 412 punktar, 2 yfirborð, 3 veglínur.“
4. Skoðaðu reitinn undir **Yfirborð**-staðreyndunum. Hann listar allt sem var sleppt eða breytt, til dæmis:
   - „Aðeins fyrsta yfirborðið („EG“) var opnað; skráin hefur 1 til viðbótar.“
   - „Veglínan „Ramp A“ hefur þætti sem CivilCraft getur ekki teiknað enn (ekki línur, bogar eða klóþoíð-spírallar); henni var sleppt.“
   - „Reglur lagnanetsins voru ekki í skránni; bráðabirgðagildin eru í notkun — stilltu þínar undir **Verkefni**.“

Hvað verður að hverju:

| Í skránni | Í CivilCraft |
|---|---|
| Einingar (Imperial eða Metric) | **Einingar** verkefnisins (fet eða metrar) |
| Heiti verkefnis | **Heiti** verkefnisins |
| CgPoints | punktar verkefnisins; lýsingin (eða kóðinn) gefur hópinn |
| Fyrsta TIN-yfirborðið | núverandi landið, notað eins og það er („Surface (from LandXML)“) |
| Hver veglína úr línum, bogum og klóþoíð-spírölum | veglína með PI, radíusum og spírallengdum endurbyggðum úr bogunum |
| Fyrsta hönnunarsnið hverrar veglínu | hönnunarsnið hennar, með parabólískum lóðréttum bogum |
| Fyrsta lagnanet | lagnanetið, með kantkótum, sigþróm og innskotum |
| Eiginlínur úr línum og bogum | eiginlínur, bogar varðveittir; úr öðru forriti byrja þær sem **Aðeins teiknað** |

Allan lista yfir þætti og eigindi er í [LandXML: hvað er lesið og skrifað](topic:landxml-reference).

:::note
Yfirborð sem er lesið úr LandXML er ekki endurbyggt þegar þú breytir punktahópum eða teiknar brotlínur. Smelltu á {{ui:Byggja yfirborðið upp aftur úr punktunum}} í hlutanum **Yfirborð** til að byggja það úr punktunum í staðinn ({{key:Mod+Z}} skilar LandXML-yfirborðinu aftur).
:::

## Flytja út LandXML

1. Smelltu á {{ui:LandXML}} í **Útflutnings**-hópnum.
2. Vafrinn sækir `<name>.xml`. Stöðustikan segir hvað fór inn, til dæmis „Flutti út LandXML 1.2: 276 punktar, 2 yfirborð, 1 veglína, lagnanetið. Pallar eru ekki hluti af LandXML hér; mótaða yfirborðið er það.“

Skráin hefur:

- **Einingar**: bandarísk survey-fet eða metrar.
- **CgPoints**: alla punkta með númerinu sem nafni, lýsingu sinni og hópnum sem kóða.
- **Surfaces**: núverandi landið sem TIN, með brotlínum og ytri mörkum sem gagnagrunnsgögn; og, þegar pallar eða vegstæði móta landið, annað TIN-yfirborð sem heitir „Proposed“.
- **Alignments**: línur, boga og klóþoíð-spírallar með stöðvunum sínum, hver með langsniði sem geymir núverandi landið tekið sem sýni meðfram henni og hönnunarsniðið (PVI og parabólískir bogar) þegar það hefur að minnsta kosti tvo PVI.
- **PipeNetworks**: brunnar með kantkótum sínum, sigþróm og innskoti fyrir hverja lögn, og lagnirnar með þvermáli, lengd og halla.
- **PlanFeatures**: allar eiginlínur sem línur og bogar með kótanum í hvorum enda og til hvers þær eru notaðar.

## Hvað kemst ekki með

- Pallar og vegstæði sem hlutir. Niðurstaða þeirra er í „Proposed“-yfirborðinu.
- Veglínur með villum (til dæmis skarandi bogar): sleppt og taldar í stöðuskilaboðunum.
- Lagnir án beggja innskota og net með færri en tvo brunna.
- Kantkóti sem er tekinn úr yfirborðinu er skrifaður sem fastur kantkóti. Þegar hann er opnaður aftur heldur brunnurinn þeirri tölu jafnvel þótt yfirborðið breytist.
- Lagnareglur (minnsti halli, þekja, fall): LandXML hefur ekki stað fyrir þær.
- Birtingarstillingar og yfirborðsval punktahópa: vistaðu CivilCraft-verkefni fyrir þær.

Við opnun les CivilCraft ekki spírala aðra en klóþoíð, grindaryfirborð, punkta sem vísa aðeins í aðra punkta, lóðir (parcels), spírala í eiginlínum, vegi (roadways) eða mælingargögn. Hvert þeirra er nefnt í athugasemdunum, aldrei giskað á.

## Fram og til baka

Til að afhenda verk einhverjum sem notar aðra mannvirkjahugbúnað og fá það aftur: fluttu út LandXML, leyfðu þeim að breyta, og opnaðu LandXML þeirra sem nýtt verkefni. Geymdu þitt eigið `.civilcraft.json` líka: það er eina skráin sem geymir allt sem CivilCraft þekkir.
