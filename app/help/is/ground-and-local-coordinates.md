---
title: Jarðhnit og staðbundin hnit
summary: Vinna í jarðhnitum (yfirborðshnitum) sem eru kvörðuð frá netinu með sameinuðum kvarðastuðli sem þú skrifar inn eða reiknar í punkti, eða í gefnu staðarneti sem er tengt hnitakerfinu með tveimur stjórnpunktum.
keywords: jarðhnit, yfirborðshnit, hnit, net í jarðhnit, sameinaður kvarðastuðull, csf, sameinaður stuðull, netstuðull, hæðarstuðull, sjávarmálsstuðull, samleitni, varpunarhorn, kvarðastuðull, gefin hnit, staðbundin hnit, staðarnet, 5000 5000, stjórnpunktar, staðsetning, kvörðun, tveggja punkta, lokunarskekkja
from: 3d7453de
---

Hnit í state plane og UTM eru **net**-hnit: varpun teygir eða minnkar fjarlægðir lítillega (tugi ppm), og því hærra sem staðurinn er, því meira er mæld jarðarfjarlægð frábrugðin netfjarlægðinni. Margar mælingar skila því **jarðhnitum**, kvörðuðum þannig að fjarlægðir á grunnmynd eru jafnar fjarlægðum mældum á jörðu, eða **gefnu** staðarneti (5000, 5000 í stjórnpunkti). CivilCraft heldur tölunum þínum eins og þær eru og skráir hvernig þær tengjast netinu, þannig að breiddar- og lengdargráður, GIS-skrár og kortalög lenda enn á réttum stað.

Opnaðu {{ui:Hnit}} í {{ui:GIS}}-hópnum, veldu (eða haltu) kerfinu, veldu síðan undir **Net, jörð eða staðbundin hnit**:

| Val | Hnitin þín eru | Hvernig þau tengjast netinu |
|---|---|---|
| {{ui:Net}} | Eigin hnit kerfisins (upphafið) | Sömu tölur |
| {{ui:Jörð}} | Kvörðuð að fjarlægðum á jörðu | net = grunnur + sameinaður stuðull × (jörð − grunnur) |
| {{ui:Staðbundið}} | Gefið staðarnet | Færð, snúin og kvörðuð á netið með tveimur stjórnpunktum |

Hvað sem þú velur er vistað með verkefninu og er eitt skref í afturköllun; ekkert hreyfist.

## Jarðhnit

1. Veldu {{ui:Jörð}}.
2. Skrifaðu **Sameinaðan kvarðastuðul** úr mælingunni (til dæmis `0.99987`), eða reiknaðu hann:
   1. Undir **Reikna stuðulinn í punkti** byrjar punkturinn í miðju verkefnisins. Veldu {{ui:Velja punkt á grunnmyndinni}} og smelltu á staðinn (smellur nálægt mælipunkti tekur þann punkt), eða skrifaðu E og N.
   2. Hæðin kemur af yfirborðinu þar; skrifaðu inn aðra ef þú þarft.
   3. Veldu {{ui:Reikna}}. CivilCraft sýnir:
      - **Netkvarðastuðull k**: hversu mikið varpunin teygir fjarlægðir þar.
      - **Hæðarstuðull**: hversu miklu styttri fjarlægðir eru á sporbaugnum en í þeirri hæð.
      - **Sameinaður stuðull** = k × hæðarstuðull: netfjarlægð = jarðarfjarlægð × þetta.
      - **Samleitni**: hornið frá nets-norður til sanns norðurs þar (geodetískur asimút = netasimút + samleitni).
   4. Veldu hnappinn {{ui:Notkun}} undir tölunum til að setja sameinaða stuðulinn í reitinn.
3. Stilltu **Grunnpunktinn**, þar sem jarðhnit og netshnit eru þau sömu. Hann byrjar í 0, 0: flest lögsagnarumdæmi sem birta jarðhnit kvarða um upphafspunktinn, þannig að jarðhnit haldast greinilega nálægt netshnitum. Sumar mælingar kvarða í staðinn um stjórnpunkt verkefnisins: notaðu það sem mælingin segir.
4. Veldu {{ui:Beita}}.

:::warning
Hæðin er tekin sem hæð yfir sporbaugnum. CivilCraft hefur ekkert geoid-líkan, þannig að þar sem geoid er 30 m (100 ft) fyrir neðan eða ofan sporbaugnum er hæðarstuðullinn skakkur um um 5 ppm. Þegar mælingin tilgreinir sameinaðan stuðul sinn, skrifaðu hann inn.
:::

## Staðbundin (gefin) hnit

1. Veldu {{ui:Staðbundið}}.
2. Fyrir **Stjórnpunkt 1** skrifarðu númer mælipunktsins (eða velur {{ui:Velja}} og smellir á hann á grunnmyndinni). Staðbundnu hnitin hans birtast við hliðina á honum.
3. Skrifaðu **net**-E og N þess, eða breiddar- og lengdargráður þess í þriðja reitnum (til dæmis `30.2672, -97.7431`).
4. Gerðu það sama fyrir **Stjórnpunkt 2**, eins langt frá þeim fyrsta og þú getur.
5. CivilCraft sýnir **Kvarða** og **Snúning** sem fundust, og minnir þig á: **Tveir punktar passa alltaf fullkomlega — athugaðu þriðja.**
6. Gefðu **Athugunarpunkt** á sama hátt. CivilCraft sýnir hversu langt passinn setur hann frá netshnitunum sem þú skrifaðir (lokunarskekkju hans, í einingum verkefnisins og ppm). Stór lokunarskekkja þýðir rangan punkt, innsláttarvillu eða hnit í annarri einingu.
7. Veldu {{ui:Beita}}.

Kvarði langt frá 1 (út fyrir 0.5 til 2) er hafnað: athugaðu punktana og einingar þeirra.

## Hvað var prófað

- Kvarðastuðullinn og samleitnin stemma við PROJ (pyproj 3.7.1 með PROJ 9.5.1), hnitasafnið sem flest GIS-forrit nota, innan 1 hluta af milljarði á yfir 300 kerfum með samhverfum varpunum (state plane, UTM, transverse Mercator, Lambert conformal conic), og í vafranum á punkti sem valinn var á grunnmyndinni.
- Skref fyrir jörð og staðbundin hnit umbreytast fram og til baka innan 1 hluta af milljarði; tveir stjórnpunktar skila kvarðanum og snúningnum sem þeir voru gerðir með; athugunarpunktur 0.05 ft frá sýnir lokunarskekkju upp á 0.05 ft.
