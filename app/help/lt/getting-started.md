---
title: Pirmieji žingsniai su CivilCraft
summary: Ką daro CivilCraft, kaip ją atidaryti ir pirmosios dešimt minučių su pavyzdine statybvietė – nuo taškų iki horizontalių, kelio ir įrašyto projekto.
keywords: pradžia, pirmas paleidimas, pavyzdinė statybvietė, įvadas, greitas startas, pamoka, pradėti, naujas projektas
from: c9b6dd8e
---

CivilCraft – tai CadCraft šeimos inžinerinio projektavimo ir statybvietės planavimo programa. Ji ima topografinius taškus ir paverčia juos paviršiumi (TIN) su horizontalėmis, tada leidžia išdėstyti trasas su projektiniais profiliais, nubrėžti paprastą kelio koridorių, suplanuoti pastatų aikšteles iki išpjovos ir užpylimo ribos, patikrinti gravitacinį vamzdynų tinklą pagal jūsų taisykles ir matyti išpjovų bei užpylimų tūrius. Ji nuskaito ir įrašo LandXML, planą eksportuoja į DXF ir išveda į PDF.

Jei esate dirbę su Civil 3D, idėjos bus pažįstamos: taškai, taškų grupės, lūžio linijos, trasos pagal PI, profiliai pagal PVI, koridoriai, planiravimas, vamzdynų tinklai. Darbo būdas kitoks ir daug paprastesnis: nėra komandinės eilutės, stilių ir brėžinio failo. Prieš pirmą tikrą darbą perskaitykite [Ateinant iš kitos inžinerinės programinės įrangos](topic:coming-from).

## Ko jums reikia

- Naujausia darbalaukio naršyklė: Chrome, Edge, Firefox arba Safari. Žr. [Naršyklės](common:browsers).
- Pelė arba jutiklinė dalis ir klaviatūra arba jutiklinis ekranas: piešiant ten yra ekrane rodomi mygtukai {{ui:Baigti}}, {{ui:Anuliuoti tašką}} ir {{ui:Atšaukti}} (žr. [Pelė, jutiklinė dalis ir jutiklinis ekranas](topic:keyboard#mouse-trackpad-and-touch)).
- Planas braižomas 2D naudojant naršyklės drobę. [3D vaizdas](topic:site-3d) naudoja naršyklės WebGL grafiką; jei jis negali pasileisti, būsenos juostoje nurodoma priežastis, o planas vis tiek veikia.
- Paskyros nereikia ir nieko neįkeliama. Failai atidaromi jūsų kompiuteryje ir įrašomi kaip atsisiuntimai. Žr. [Jūsų failai](common:your-files).

:::note
CivilCraft šiandien veikia kaip ankstyva naršyklės versija, kuri dar kuriama. Darbalaukio versijos dar nepasiekiamos, o įrašymas debesyje dar neprieinamas. Viskas, ką kuriate, lieka jūsų kompiuteryje, kol įrašote arba eksportuojate.
:::

## Atidaryti CivilCraft

1. Atidarykite CivilCraft naršyklėje.
2. Palaukite, kol ekranas užsipildys: įrankių juosta viršuje, skydelis kairėje, planas viduryje ir dešinėje – **Savybių** skydelis.
3. Tuščiame plane matote langelį pavadinimu **Pradėkite nuo topografinių taškų**. Jame išvardyti pirmieji žingsniai ir yra nuoroda {{ui:Atidaryti pavyzdinę statybvietę}}.

Kad vėliau galėtumėte naudoti CivilCraft be ryšio, programos juostoje spustelėkite {{ui:Įrašyti neprisijungus}} ir palaukite, kol atsiras {{ui:Paruošta neprisijungus}}. Į ją įeina ši žinynas, pavyzdinė statybvietė ir 3D bei GIS bibliotekos. Žr. [Neprisijungus](common:offline). Bet kuriuo metu spauskite {{key:F1}} arba {{ui:Žinynas}}, kad šis žinynas atsidarytų šalia programos.

## Pirmosios dešimt minučių: pavyzdinė statybvietė

Pavyzdinė statybvietė – nedidelis matavimas JAV pėdomis: 276 taškai valstybinės plokštumos koordinatėse, kalnagūbis, griovys su tėkmės linija ir du krantų viršūnių taškai. Ji pateikiama kartu su programa, todėl galite sekti žingsnius be savo failo.

1. Spustelėkite {{ui:Atidaryti pavyzdinę statybvietę}} langelyje ant plano.
   Atsidaro langas **Importuoti taškus**. Jame rašoma „276 taškai nuskaityti kaip PNEZD (pagal antraštės eilutę), atskirti kableliais.“ ir rodomos pirmosios eilutės.
2. Spustelėkite {{ui:Importuoti}}.
   Planas užsipildo taškais, horizontalėmis ir paviršiaus kraštu. Apatinėje būsenos juostoje rašoma, kad taškai importuoti, ir kiek trikampių turi paviršius (546).
3. Pažiūrėkite į kairįjį skydelį, skiltį **Taškai**. Taškai sugrupuoti pagal pirmą jų aprašymo žodį: CP, FL, GRD, RIDGE, TBN, TBS ir TREE.
4. Tos lentelės stulpelyje **Paviršius** nustatykite **FL**, **RIDGE**, **TBN** ir **TBS** į {{ui:Lūžio linija}}.
   Paviršius iš karto perskaičiuojamas. **Paviršiaus** duomenyse dabar rašoma „Lūžio linijos: 4“, o horizontalės aštriai lūžta palei tėkmės liniją ir kalnagūbį, o ne kerta juos.
5. Perkelkite žymeklį per planą. Būsenos juostoje rodomos rytų ir šiaurės koordinatės po žymekliu bei ten esantis grunto aukštis.
6. Skiltyje **Rodymas** nustatykite {{ui:Horizontalės kas}} į 0.5 ft ir įjunkite {{ui:Aukščių juostos}}. Po žymės langeliais atsiranda spalvų skalė su legenda. Baigę išjunkite juostas.

Dabar turite esamo grunto paviršių. Toliau – kelias.

## Nubrėžkite trumpą kelią

1. Paspauskite {{key:A}} (arba spustelėkite {{ui:Trasa}} grupėje **Projektavimas**).
2. Spustelėkite tris taškus per visą statybvietę, vieną po kito. Raudona linija seka žymeklį ir rodo kito tiesiojo ruožo ilgį ir azimutą.
3. Paspauskite {{key:Enter}}, kad baigtumėte. Trasa atsiranda su stacionažu. Dešiniajame skydelyje rodoma **Trasa**: jos ilgis, PI lentelė ir kreivė vidurinėje PI (100 ft spindulys arba mažesnis, jei 100 ft netelpa).
4. Dešiniajame skydelyje, skiltyje **Projektinis profilis**, spustelėkite {{ui:Pradėti nuo grunto}}. Po planu atsidaro profilio vaizdas su esamu gruntu ir tiesia projektine nuolydžio linija nuo pradžios iki galo.
5. Paspauskite {{key:I}}, kad įjungtumėte {{ui:Pridėti PVI}}, tada vieną kartą spustelėkite profilio vaizde arti vidurio. Atsiranda PVI.
6. Dešinėje PVI lentelėje į vidurinio PVI laukelį **Kreivės L** įveskite kreivės ilgį (pavyzdžiui, 100) ir paspauskite {{key:Enter}}. Dabar profilyje yra vertikali kreivė, pažymėta jos K reikšme.
7. Skiltyje **Koridorius** pažymėkite **Ištempti elementų rinkinį palei projektinį profilį**. Kelias suplanuojamas į gruntą: eismo juostos, pakraščiai ir šoniniai nuolydžiai iki išpjovos ir užpylimo ribos. Bloke **Žemės darbai** rodomos išpjovos ir užpylimai.

Nesijaudinkite dėl tikslių reikšmių. Kiekvieną skaičių galima pakeisti dešiniajame skydelyje, o {{key:Mod+Z}} atšaukia paskutinį pakeitimą.

## Įrašykite darbą

1. Įveskite pavadinimą lauke **Pavadinimas** kairiojo skydelio viršuje.
2. Paspauskite {{key:Mod+S}} (arba spustelėkite {{ui:Įrašyti}}). Naršyklė atsisiunčia failą, pavadintą pagal statybvietę, su galūne `.civilcraft.json`. Jame yra taškai, paviršiaus parametrai, trasos, profiliai, koridoriai, aikštelės ir vamzdžiai.
3. Kad vėliau tęstumėte, spustelėkite {{ui:Atidaryti}} (arba paspauskite {{key:Mod+O}}) ir pasirinkite tą failą arba įmeskite jį į planą.

:::warning
Automatinio įrašymo nėra. Jei uždarote skirtuką su neįrašytais pakeitimais, naršyklė klausia, ar išeiti; jei išeisite, pakeitimai prarandami. Įrašykite dažnai.
:::

## Kur eiti toliau

- [Importuokite topografinius taškus](topic:import-points) su savo failais.
- [Sukurkite ir patikslinkite paviršių](topic:build-surface) su lūžio linijomis ir riba.
- [Ekranas dalis po dalies](topic:workspace).
- [Klavišai ir pelė](topic:keyboard).
