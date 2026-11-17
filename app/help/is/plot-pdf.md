---
title: Teikna grunnmynd út í PDF
summary: Teiknaðu allt eða núverandi sýn út sem vigur-PDF á venjulegu blaði í verk- eða metrískum mælikvarða, í litum laga eða svörtu.
keywords: teikning, prentun, pdf, blað, mælikvarði, pappírsstærð, grunnmyndarblað, birta, titilreitur, norðurör, mælistika
from: 9af396ca
---

{{ui:PDF}} teiknar grunnmyndina út sem vigur-PDF á einu blaði, með titilræmu, norðurör og mælistiku. PDF-skráin er búin til í vafranum og sótt; hún fer ekki í gegnum prentglugga vafrans.

## Teikna út

1. Stilltu grunnmyndina undir **Birting**: yfirborðið sem sýnt er, hæðarlínubilið og hvað er á. Teikningin fylgir þessum stillingum.
2. Ef þú vilt aðeins hluta svæðisins, aðdraðu og hliðraðu grunnmyndinni að honum.
3. Smelltu á {{ui:PDF}} í hópnum **Flytja út**, eða ýttu á {{key:Mod+P}}. Glugginn **Teikna grunnmynd út í PDF** opnast.
4. Veldu **Svæði**: {{ui:Allt}} eða {{ui:Það sem er á skjánum}}.
5. Veldu **Pappír**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 eða A1. Verkefni í fetum byrja á Tabloid, verkefni í metrum á A3. Blöð eru alltaf lárétt.
6. Veldu **Mælikvarða**. Listinn merkir stærsta mælikvarðann sem passar með „(fits)“ og velur hann.
   - Fet: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Metrar: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Veldu **Blek**: {{ui:Litir laga}} eða {{ui:Svart}}.
8. Lestu línuna undir valkostunum. Hún gefur stærð svæðisins á pappír og stærð blaðsins, til dæmis „Svæðið er 297 × 222 mm við 1" = 40' á 432 × 279 mm blaði (lárétt).“
9. Smelltu á {{ui:Sækja PDF}}.
   Vafrinn sækir `<name>.pdf`. Stöðustikan segir „Teiknað <name>.pdf við 1" = 40'.“

Ef svæðið er stærra en blaðið í valda mælikvarðanum er teikningin miðjuð og jaðrarnir klipptir af. Veldu mælikvarðann merktan „(fits)“ eða stærra blað.

## Það sem er á blaðinu

- Grunnmyndin, miðjuð á teiknisvæðinu, sem sönn vigur: hæðarlínur, merkingar, veglínur með stöðvun, vegbelti, flatir og skurðlínur, pípur, punktar.
- Línuþykktir eftir lögum: veglínur, flatir og pípur þykkari; þríhyrningar og minni hæðarlínur þunnar.
- Titilræma meðfram neðri brún með **Heiti** verkefnisins, mælikvarðanum, athugasemd um hæðarlínubilið og hvaða yfirborð er (núverandi eða mótað), og dagsetningu og útgáfu hægra megin.
- Norðurör í efra hægra horni (norður á grunnmynd er upp) og mælistika í titilræmunni.
- Kortalög undir grunnmyndinni (mynd, kortaflísar eða kortaþjónusta), þegar **Kortalög undir grunnmyndinni** er hakað við: þau eru teiknuð sem ein mynd af öllu teiknisvæðinu við 150 punkta á tommu, undir línuverkinu, og heimildarnóta kortsins fer í titilræmuna. CivilCraft bíður í allt að 8 sekúndur eftir kortamyndum sem enn berast; ef einhverjar vantar segir stöðustikan það.

Texti notar innbyggt Helvetica í PDF-skránni. Stafir utan Vestur-Evrópu-stafrófsins (Windows-1252) prentast sem „?“ og skilaboðin telja þá.

## Það sem er ekki teiknað

- Hæðarbönd.
- Langsniðsyfirlitið. Teikning langsniða er ekki tiltæk enn.
- Fleiri en eitt blað (fyrir veglínu, notaðu [grunnmynda- og langsniðsblöð](topic:plan-profile-sheets)), sýnigluggar, sérsniðinn titilreitur eða lóðrétt blöð.

:::note
Glugginn segir að hallaörvar séu aðeins á skjánum. Í þessari útgáfu eru hallaörvar sem eru kveiktar undir **Birting** teiknaðar (og fluttar út í DXF). Slökktu á þeim fyrir teikningu ef þú vilt þær ekki.
:::

## Prentun á pappír

Opnaðu sótta PDF-skrá í hvaða PDF-skoðara sem er og prentaðu hana í 100% (raunstærð) svo mælikvarðinn haldist réttur. „Passa á síðu“ breytir mælikvarðanum.
