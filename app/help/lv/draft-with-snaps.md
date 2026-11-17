---
title: Zīmēšana ar piesaistēm, izvēlētiem stūriem un pārvietošana, kopēšana, pagriešana
summary: Novietojiet trases, platformas, zemesgabalus un raksturlīnijas precīzi uz jau esošiem punktiem un stūriem, ierakstiet vai izvēlieties stūra austrumu un ziemeļu koordinātes, pagrieziet tangenti uz diviem punktiem un pārvietojiet, kopējiet vai pagrieziet objektu par attālumu vai leņķi.
keywords: piesaiste, piesaistes, osnap, piesaiste pie punkta, piesaiste pie stūra, pi, virsotne, stūris, izvēle, krustiņš, austrumi, ziemeļi, koordinātes, ierakstītas koordinātes, tangente, virziens, azimuts, pārvietot, kopēt, pagriezt, pārveidot, kopēt pagrieztu, dublēt, alt, brīvs punkts, zīmēšana
from: 49864dda
---

Jauns versijā 0.9: zīmējot, kursors nolaižas uz punktiem un stūriem, kas jau atrodas plānā, un platformas, zemesgabala vai raksturlīnijas stūri var ierakstīt vai izvēlēties. Šī tēma izskaidro trīs rīkus.

## Ko jūs darīsiet

- Zīmēt ar piesaistēm, lai jauna trase, platforma, zemesgabals vai līnija sākas un beidzas tieši uz kaut kā esoša.
- Iestatīt stūra austrumu un ziemeļu koordinātes, ierakstot tās vai izvēloties vietu plānā.
- Pagriezt trases tangenti uz diviem izvēlētiem punktiem.
- Pārvietot, kopēt vai pagriezt visu objektu.

## Soļi

1. Izvēlieties zīmēšanas rīku, piemēram, {{ui:Trase}}, {{ui:Platforma}}, {{ui:Zemesgabals}} vai {{ui:Raksturlīnija}}. Pārvietojiet kursoru tuvu uzmērījuma punktam, trases PI, platformas, zemesgabala vai masas stūrim, raksturlīnijas virsotnei vai ūdens konstrukcijai. Parādās marķieris ar uzrakstu (PI, Stūris, Virsotne, Konstrukcija vai Punkts un tā numurs) un austrumu un ziemeļu koordinātēm, uz kurām tas nolaidīsies. Noklikšķiniet, lai novietotu punktu tur.
2. Lai novietotu punktu brīvi, turiet nospiestu {{key:Alt}}, kamēr noklikšķināt. Piesaiste izslēdzas.
3. Izvēlieties platformu, zemesgabalu vai raksturlīniju. Rekvizītos bloks {{ui:Stūri}} uzskaita katru stūri ar lodziņu Austrumi un lodziņu Ziemeļi. Ierakstiet jaunus skaitļus vai nospiediet krustiņa pogu blakus stūrim un noklikšķiniet vietā plānā. Stūris pieņem šīs austrumu un ziemeļu koordinātes. Nospiediet {{key:Esc}}, lai atceltu izvēli. Krustiņš darbojas tikai plānā: vispirms aizveriet 3D skatu.
4. Lai pagrieztu tangenti, izvēlieties trasi. Rekvizītos zem {{ui:Tangente no diviem punktiem}} izvēlieties tangenti, nospiediet {{ui:Pirmais punkts}} un noklikšķiniet plānā, nospiediet {{ui:Otrais punkts}} un vēlreiz noklikšķiniet, tad nospiediet {{ui:Iestatīt virzienu}}. Tangente pagriežas, lai ietu no pirmā punkta uz otro, un paturēs savu garumu.
5. Lai pārvietotu, kopētu vai pagrieztu, izvēlieties trasi, platformu, zemesgabalu vai raksturlīniju. Rekvizītos zem {{ui:Pārvietot, kopēt un pagriezt}} ierakstiet {{ui:Pārvietot uz austrumiem}} un {{ui:Pārvietot uz ziemeļiem}} (negatīvi skaitļi iet uz rietumiem un dienvidiem) un nospiediet {{ui:Pārvietot}} vai {{ui:Kopēt}}. Vai nospiediet {{ui:Attālums no diviem punktiem}} un noklikšķiniet punktu, no kura pārvietot, un punktu, uz kuru pārvietot.
6. Lai pagrieztu, ierakstiet leņķi laukā {{ui:Pagriezt pretēji pulksteņrādītāja virzienam}} (grādos), tad nospiediet {{ui:Pagriezt}} vai {{ui:Kopēt pagrieztu}}. Tas griežas ap savu stūru vidu, ja vien blakus leņķim ar krustiņu neizvēlaties punktu, ap kuru griezt.

## Piezīmes

- Kopēšana atstāj oriģinālu savā vietā, un pēc tam kopija tiek atlasīta.
- Katra pārvietošana, kopēšana, pagriešana, izvēlētais stūris un pagrieztā tangente ir viens atsaukšanas solis.
- Piesaistes sasniedz 10 ekrāna pikseļus no kursora. Piesaistes marķieris tikai piedāvā vietu; nekas nemainās, kamēr nenoklikšķināt.
- Tas pats krustiņš ir pie trases PI rindām. Skat. [Trases](topic:alignment), [Zemesgabali](topic:parcels) un [Raksturlīnijas](topic:feature-lines).
