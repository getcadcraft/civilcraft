---
title: Husplatforme på skrånende grunde
summary: Planér et byggeplateau i en skråning: støttemure som plateaukanter, kortet over afgravning og opfyldning skygget efter dybde med koteangivelser (plan og 3D), et snit tegnet hvor som helst gennem terrænet og det projekterede, samt rampe eller skrånende byggeplateau til indkørsler.
keywords: platform, plateau, husplateau, skrånende grund, skråning, støttemur, afgravning og opfyldning, kort over afgravning og opfyldning, koteangivelser, frit snit, snitlinje, kommunetegninger, indkørsel, rampe, skrånende plateau, planér, svellingsfaktor, jordarbejde
from: daa08a3f
---

Et husplatform er et **byggeplateau** (**Design** › {{ui:Byggeplateau}}): et fladt polygon i én kote, planeret ind i terrænet. Fire ting hjælper på en skråning.

## Støttemure som plateaukanter

Vælg byggeplateauet, og sæt en side til {{ui:Lodret (støttemur)}} i stedet for en skråning (**Egenskaber** › {{ui:Sider og støttemure}}, eller {{ui:Lodret: støttemure}} for alle sider på én gang). Murens højde læses fra terrænet langs den: top ved terrænet, bund ved plateauet, vist i begge ender og på det højeste punkt på planen, med en advarsel, når den er højere end den grænse, du har angivet. Mure og skråninger kan blandes side om side.

## Kortet over afgravning og opfyldning

Markér {{ui:Afgravnings- og opfyldskort}} under **Vis**. Planen skraveres efter, hvor dyb afgravningen eller opfyldningen er, i lige store trin (afgravning varm, opfyldning blå, næsten plan lys) med en signaturforklaring, og **koteangivelser** udskrives på byggeplateauet: kotændringen i punkter på et gitter, og den dybeste afgravning og den højeste opfyldning markeret med ▲. Cellerne er de samme, som jordarbejdsvolumenerne bruger, så kortet og tallene altid stemmer overens.

I 3D-visningen vælger du **Afgravning og opfyldning** fra farvelisten for at lægge de samme farver over terrænet og det projekterede.

En svelle- eller krympefaktor angives i massediagramværktøjet (**Design** › {{ui:Massediagram}}); den anvendes ikke på et byggeplateaus volumener.

## Et frit snit

Under **Terræn** › {{ui:Mere}} vælger du {{ui:Frit tværprofil}}, klikker på punkterne på snitlinjen hvor som helst (den må bøje), og trykker {{key:Enter}}. En dialog tegner snittet: det eksisterende terræn, det planerede projekt (stiplet) og afgravningen og opfyldningen imellem dem, skraveret, med deres arealer (det projekterede tæller kun inden for plateauerne og vejene). {{ui:Overhøjde i lodret målestok}} sættes automatisk, så tegningen passer; {{ui:Gem som SVG}} og {{ui:Gem som CSV}} giver dig en tegning til kommunen og tallene.

## Rampe og skrånende byggeplateauer

Under **Terræn** › {{ui:Mere}} vælger du {{ui:Rampe eller skrånende byggeplateau}}, klikker på den lave ende og derefter på den høje ende, trykker {{key:Enter}}, og angiver bredden, koten i den lave ende og hældningen. Byggeplateauet er et bånd, hvis hjørner bærer disse koter (kanten mellem to hjørner går med konstant hældning), og det planeres ind i terrænet som ethvert andet byggeplateau. Ethvert byggeplateaus hjørner kan også have deres egne koter, så en indkørsel, en rampe eller en skrå terrasse er et byggeplateau med en kote i hvert hjørne.
