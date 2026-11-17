---
title: Beygjuferlar ökutækja
summary: Aktu ökutæki með allt að þremur eftirvögnum eftir eiginlínu eða veglínu, áfram eða afturábak, og sjáðu svæðið sem það sveiflar yfir, hjólaferla þess, stýri og hvar það brettist saman (jackknife).
keywords: beygjuferill, beygjusniðmát, ökutækjarakning, hönnunarökutæki, vörubíll, rúta, eftirvagn, hálfeftirvagn, bakkað, bakk, jackknife, liðun, stýrislás, útsveifla, hjólaferill, hleðslubryggja, beygjuradíus
from: 8caafb8a
---

Beygjuferill keyrir ökutæki eftir línu og sýnir landið sem líkami þess fer yfir. Notaðu hann til að athuga hvort vörubíll geti tekið beygju, náð að hleðslubryggju eða bakkað eftirvagni í stöðu án þess að fara af hellulögninni.

## Aka ökutæki eftir línu

1. Teiknaðu línuna sem ökutækið fylgir, í akstursstefnu: eiginlínu (bogar eru í lagi: ýttu á {{key:C}} á meðan þú teiknar hana, sjá [Eiginlínur](topic:feature-lines)) eða veglínu.
2. Veldu hana og smelltu á {{ui:Beygjuferill…}} í **Eiginleikum** hennar.
3. Undir **Byrja frá** veldu ökutæki og stilltu síðan stærðir þess út frá þínu eigin hönnunarökutæki: breidd, framhengi, hjólhaf, afturhengi, spor og **Stýrislás**. Bættu við allt að þremur eftirvögnum, hverjum með staðsetningu tengipunktsins, lengd hans frá tengipunkti að ás, hengi hans og **Mestu liðun**.
4. Veldu **Akstur**: áfram eða afturábak. Smelltu á {{ui:Aka því}}.

:::warning
Ökutækin sem byrjað er frá eru bráðabirgðatölur, ekki staðall. Stilltu stærðirnar út frá hönnunarökutækinu sem verkefnið þitt notar.
:::

## Áfram og afturábak

| Akstur | Hvað fylgir línunni | Hvað CivilCraft reiknar út |
|---|---|---|
| **Áfram** | Miðja framássins | Hvar afturásinn og hver eftirvagn fara, stýrishornið og liðunin |
| **Afturábak** | Miðja síðasta ássins (aftast á eftirvagninum) | Hvar hver eining fram undan fer, og stýringin sem ökumannshúsið þarf til að koma eftirvagninum þangað |

Afturábak er leiðin til að athuga bakkhreyfingu: segðu hvar eftirvagninn á að fara, og CivilCraft segir hvort ökumannshúsið geti það.

## Lesa niðurstöðuna

Beygjuferillinn er teiknaður á grunnmynd í appelsínugulum lit: útlína hans og, strikuð, ferlar ystu hjóla. Veldu hann (smelltu inni í honum) til að sjá í **Eiginleikum**:

- **Ekin lengd**, mesta **Stýrishorn** og **Liðun** miðað við mörk þeirra, og **Útsveipað svæði**.
- Hvert vandamál meðfram línunni, ásamt fjarlægð þess: stýrið umfram lásinn, eða eftirvagn sem snýst umfram liðunarmörk sín (hann brettist saman).
- **Ökutækið meðfram línunni**: færðu sleðann til að sjá ökutækið á hvaða punkti sem er, með stýri og liðun þar.

Breyttu línunni og beygjuferillinn fylgir. {{ui:Breyta ökutækinu…}} breytir stærðunum; **Akstur** skiptir á milli áfram og afturábak. Hver breyting er eitt skref: {{key:Mod+Z}} afturkallar hana. {{key:Delete}} eyðir valda beygjuferlinum (línan helst).

Útlínan og hjólaferlarnir fara í PDF, DXF og DWG á laginu C-ROAD-SWPT.

## Hvernig hann er reiknaður

Hver eining snýst um línu afturássins og er dregin af punktinum fyrir framan hana (framásnum, eða tengipunktinum), lághraða, rennslausa líkaninu sem beygjuferlisathuganir nota. Útsveipað svæði er allar útlínur líkamans í öllum stöðum settar saman. Hraði, hjólagrip, sá tími sem stýrið tekur að snúast, stýrðir eftirvagnar og fríhæðin undir yfirbyggingunni eru ekki líkt eftir.
