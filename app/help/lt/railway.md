---
title: Geležinkelio kelio projektavimas
summary: Padarykite trasą geležinkeliu: bėgių pereinamieji lankai (klotoidė, kubinė parabolė, Bloss, Helmert, sinusinė pusbangė, sinusoidė), viražas kiekviename lanke su pusiausvyros viražu, viražo trūkumu ir pertekliumi, viražo ir kelio geometrijos ribos kaip įspėjimai, išvažos ir kryžminės išvažos pagal stotį, išilgai linijos nubrėžtas laisvos erdvės apvalkalas ir kelias su bėgiais, pabėgiais ir balastu, sukurtas kaip koridorius plane, pjūviuose, profilyje, 3D ir kiekiuose.
keywords: geležinkelis, bėgis, geležinkelis, kelias, traukinys, metro, tramvajus, viražas, superelevacija, viražo trūkumas, viražo perteklius, pusiausvyros viražas, perėjimas, pereinamasis lankas, klotoidė, kubinė parabolė, bloss, helmert, sinusinė pusbangė, kosinusas, vėžė, standartinė vėžė, plati vėžė, metrinė vėžė, siaura vėžė, pabėgis, pabėgis, skersinis, balastas, pabalastinis sluoksnis, pagrindas, berma, kelių ašių atstumas, 60E1, 54E1, UIC60, 115RE, 136RE, viražo nuolydis, viražo kitimo sparta, išvaža, stržė, stržės, kryžminė išvaža, kryžiukas, kryžiuko numeris, ilgis iki kryžiuko, uždarymo lankas, nukrypimo greitis, laisvas tarpas, laisvos erdvės apvalkalas, konstrukcijų gabaritas, krovinio gabaritas, kinematinis apvalkalas, peronas, perono tarpas, kelių tarpas, nuolydis, vertikalusis lankas, mažiausias spindulys, LandXML viražas
from: 99de9745
---

Bet kuri trasa gali būti geležinkelio kelias. Tada jos lankams pridedami bėgių pereinamieji lankai ir viražas (bėgių superelevacija), o jos koridorius sukuriamas kaip kelias: bėgiai ant pabėgių, ant balasto sluoksnio, įrengti į gruntą kaip kelyje. Išvažos ir kryžminės išvažos dedamos pagal stotį, o išilgai kelio galima nubrėžti laisvos erdvės apvalkalą ir patikrinti jį pagal tai, kas stovi šalia kelio.

Visi toliau pateikiami skaičiai yra **laikinos reikšmės**, o ne standartai. Geležinkeliai savo ribas nustato pagal linijos greitį, kelio tipą ir šalį; nustatykite jas pagal savo geležinkelio standartą. CivilCraft nepateikia nacionalinės lentelės.

## Padarykite trasą geležinkelio trasa

1. Pasirinkite trasą ir savybėse raskite **Geležinkelis**.
2. Pažymėkite **Ši trasa yra geležinkelio kelias**. Kiekvienas pakeitimas – vienas anuliavimo žingsnis.
3. Trasos savybių viršuje nustatykite **Projektinis greitis**: tai linijos greitis, pagal kurį tikrinamas viražas. **Lėčiausi traukiniai** (Geležinkelio bloke) yra greitis, pagal kurį tikrinamas viražo perteklius.

## Pereinamieji lankai

Kiekvienam lankui PI lentelėje nustatykite spiralės ilgį kiekviename gale (**Spiralė įeinant**, **Spiralė išeinant**), tada Geležinkelio bloko lankų lentelėje arba **Pereinamasis lankas kiekvienam lankui** pasirinkite jo rūšį:

| Rūšis | Kreivumas pereinamajame lanke |
|---|---|
| Klotoidė | didėja tolygiai (kelių spiralė) |
| Kubinė parabolė | y = x³ / (6·R·L), kur L matuojamas išilgai liestinės; pats lankas šiek tiek ilgesnis |
| Bloss | 3u² − 2u³ viso kreivumo (u = ilgio dalis): pradeda ir baigiasi švelniai |
| Helmert | dvi parabolės: 2u², tada 1 − 2(1 − u)² |
| Sinusinė pusbangė | (1 − cos πu) / 2 |
| Sinusoidė | u − sin(2πu) / 2π |

Visi, išskyrus kubinę parabolę, pasisuka per L / 2R, kaip ir klotoidė. Stotys skaičiuojamos pagal tikrąjį ilgį. LandXML išsaugo rūšį (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Viražas

Kiekvieno lanko **Viražas** įveskite milimetrais. Lentelėje kiekvienam lankui rodoma:

- **Pusiausvyros viražas** = G·v² / (g·R), kur G – atstumas tarp bėgių ašių (**Bėgių ašys**: vėžė pliusas bėgio galvutės plotis, jei jo neįvedate). Kai G = 1500 mm, tai įprastinė formulė 11,8·V² / R (V km/h, R m).
- **Trūkumas** = pusiausvyros viražas prie linijos greičio − taikomas viražas.
- **Perteklius** = taikomas viražas − pusiausvyros viražas prie lėčiausių traukinių greičio.
- **Nuolydis**: didžiausias viražo nuolydis išilgai jo nuolydžių, mm per metrą.

Viražas per kiekvieną pereinamąjį lanką didėja pagal jo kreivumo formą: tiesiai klotoidei ar kubinei parabolei, pagal Bloss kreivę Bloss rūšiai ir t. t. Lanko galas be pereinamojo lanko viražą įgauna prieš jį esančioje tiesėje, tiek, kiek reikia viražo nuolydžio ribai, ir apie tai įspėjama: tada viražas keičiasi tose vietose, kur kreivumas nesikeičia.

**Viražas sukasi apie** nurodo, kuris bėgis lieka ant projektinio profilio: **žemesnysis bėgis** (įprasta), **vidinis bėgis** arba **kelio ašis** (kiekvienas bėgis pasislenka per pusę viražo). Projektinis profilis – tai bėgio viršus.

**Viražo diagrama** nubraižo kiekvieno bėgio aukštį virš profilio išilgai stočių; profilio vaizde bei plano ir profilio lapuose tas pats pateikiamas kaip juosta po profiliu.

## Viražo ribos ir įspėjimai

**Didžiausias taikomas viražas**, **Didžiausias viražo trūkumas**, **Didžiausias viražo perteklius**, **Stačiausias viražo nuolydis** ir **Greičiausias viražo kitimas** (nuolydis prie linijos greičio, mm/s) tikrinami kiekviename lanke. Reikšmė, viršijanti ribą, yra įspėjimas Geležinkelio bloke ir Problemų skydelyje, nurodant ribą ir rastą reikšmę. Jei projektinis greitis nenurodytas, trūkumas ir kitimo sparta netikrinami (apie tai pranešama pastaba).

## Kelias

Nustatykite **Vėžę** (standartinė 1435 mm, plati, metrinė ar siaura iš išankstinių nustatymų arba savo), **Bėgio profilį** (60E1, 54E1, 49E1, 115RE, 136RE: tik paskelbti jų matmenys), **Kelių** skaičių ir jų **Kelių ašių atstumą**, tada **Pabėgiai ir balastas**: pabėgių medžiaga, ilgis, plotis, gylis ir tarpas; balasto gylis po pabėgiu (prie žemesniojo bėgio), petys, nuolydis, kiek jo viršus žemiau pabėgių; pabalastinio sluoksnio gylis, berma už balasto pagrindo ir pagrindo skersinis nuolydis.

Paspauskite **Sukurti kelią**. Tai įjungia trasos koridorių, sukurtą kaip kelią pagal projektinį profilį: bėgiai ir pabėgiai pasvyra su viražu, pagrindas – ne. Pjūvių nuolydžiai nuo koridoriaus iškasų ir pylimų bermos krašto eina į išorę, o kelias nuolaidžiai susijungia su projektuojamu paviršiumi kaip kelyje.

- **Planas**: abu kiekvieno kelio bėgiai (sluoksnis C-RAIL-TRAK) ir, jei kelių daugiau nei vienas, kiekvieno kelio ašis (C-RAIL-CNTR), ekrane, DXF, DWG, PDF bei plano ir profilio lapuose.
- **Pjūviai**: pabėgiai, bėgiai, balasto ir pabalastinio sluoksnio apatinės linijos kiekviename pjūvyje.
- **3D**: bėgiai, kiekvienas pabėgis ir balasto sluoksnis (Rodyti › Kelias), taip pat GLB, OBJ ir USD formatais.
- **Kiekiai**: kelio ilgis, bėgiai (abu kiekvieno kelio bėgiai, išilgai kiekvieno kelio savosios linijos), pabėgiai, balasto sluoksnis ir balastas be pabėgių, bei pabalastinis sluoksnis, skaičiuojami vidutinių galų plotų metodu tarp pjūvių.

## Kelio geometrijos patikros

Be viražo, Geležinkelio blokas tikrina pačią liniją pagal dar šešias ribas (visos – laikinos reikšmės, jas nustatote patys):

- **Stačiausias projektinio profilio nuolydis**, mm per metrą.
- **Mažiausias vertikaliojo lanko spindulys** kaip koeficientas k pagal R ≥ k·V² (R metrais, V km/h). Parabolinio vertikaliojo lanko, kurio ilgis L tarp dviejų nuolydžių, spindulys lygus L, padalytam iš nuolydžio pokyčio.
- **Trumpiausias vertikalusis lankas**.
- **Mažiausias lanko spindulys** plane (0 išjungia patikrą).
- **Trumpiausias lankas arba tiesė**, kaip kelionės sekundės prie linijos greičio: įspėjama, jei apskritiminis lankas arba tiesė tarp dviejų lankų trumpesni nei šis atstumas. 1,8 s – įprastinė taisyklė „pusė greičio km/h, metrais“.
- **Viražo trūkumo kitimo sparta** per kiekvieną pereinamąjį lanką, mm/s prie linijos greičio.

**Kelio geometrija** pateikia rastą stačiausią nuolydį ir kiekvieną vertikalųjį lanką su jo spinduliu bei spinduliu, kurio reikia linijos greičiui. Vertikalusis lankas, esantis pereinamajame lanke ar viražo nuolydyje, gauna pastabą. Jei nėra projektinio profilio ar projektinio greičio, patikros, kurioms jų reikia, praleidžiamos ir apie tai pranešama pastaba.

## Išvažos ir kryžminės išvažos

Skyrelyje **Išvažos ir kryžminės išvažos** paspauskite **Pridėti išvažą**. Ji dedama ilgiausioje tiesėje; lentelėje nustatykite:

- **Stržės galo stotis**: vieta, kurioje išvaža prasideda šioje trasoje.
- **Kryžiukas**: kryžiuko numeris N (1:N). Kryžiuko kampas yra 2·atan(1 / 2N).
- **Pusė**: kairė arba dešinė, žiūrint didėjančios stoties kryptimi.
- **Kryžminės išvažos atstumas** metrais: jei didesnis už 0, išvaža tampa kryžmine išvaža į lygiagretų kelią tiek toli (dvi išvažos ir tiesė tarp jų).

Lentelėje rodomas **Ilgis iki kryžiuko** (nuo stržės galo iki kryžiuko), uždarymo lanko **Spindulys** ir **Nukrypimo greitis**, kurį tas spindulys leidžia pagal jūsų viražo trūkumo ribą ir be viražo. **Sudaryti jos kelią** nukrypstantį kelią paverčia atskira trasa (stržė, uždarymo lankas, tada tiesiai pagal kryžiuko kampą) su tais pačiais geležinkelio nustatymais, paruošta pailginti.

Plane nubrėžiami kiekvienos išvažos du nukrypstantys bėgiai, jos ašis, žymė stržės gale ir kryžiuke bei „1:N“ (sluoksnis C-RAIL-TURN), ekrane ir DXF, DWG, PDF bei lapuose. 3D rodinys nubraižo nukrypstančius bėgius pagrindinio kelio lygyje.

Forma yra **laikina reikšmė**: tiesi stržė ir vienas uždarymo lankas pagal kryžiuko numerį. Pastatyta išvaža atitiks geležinkelio standartą ir gamintojo brėžinį. Įspėjimai: išvaža, kuri išeina už trasos ribų, yra lanke, pereinamajame lanke, viraže ar vertikaliajame lanke, arba persidengia su kita išvaža; taip pat pastaba, kai linijos greitis viršija jos nukrypimo greitį.

## Laisvos erdvės apvalkalas

Pažymėkite **Nubrėžti laisvos erdvės apvalkalą išilgai šio kelio**. Pasirinkite **Kontūrą** (du laikinos formos kontūrai arba **Savas kontūras**, įvestas kaip vienas taškas eilutėje: poslinkis nuo kelio ašies, tada aukštis virš bėgio viršaus, metrais), **Transporto priemonės ilgį** ir **Bogių ašis**, o jei yra – **Perono kraštą** (pusę, atstumą nuo kelio ašies, aukštį virš bėgio).

Kiekvienoje stotyje kontūras pasvirsta su viražu apie žemesnįjį bėgį ir išplatėja dėl lanko: transporto priemonės vidurys pasislenka į vidų per b² / 8R, galai – į išorę per (L² − b²) / 8R (b – bogių ašys, L – transporto priemonės ilgis, R – spindulys toje vietoje, sekant pereinamąjį lanką). Blokas nubrėžia pjūvį tiesėje ir ten, kur apvalkalas plačiausias, ir pateikia:

- **plačiausią apvalkalą** ir kur jis yra,
- **kelių ašių atstumus**, palyginti su ašių atstumais, kurių reikia dviem gretimiems apvalkalams,
- **laisvą vietą prie perono krašto** arba kiek jis įsiterpia,
- kiekvieną elementų liniją, vamzdžių konstrukciją ir kitą geležinkelio trasą, rastus **apvalkalo viduje**.

Elementų linija su aukščio žymėmis vertinama pagal kontūrą jos aukštyje virš bėgio; be projektinio profilio arba taškui be aukščio ji vertinama tik plane, apie tai sąraše pranešama. Plane rodomos dvi apvalkalo kraštinės (sluoksnis C-RAIL-CLRN) ir kryžiukas kiekvienam daiktui apvalkalo viduje.

Siūlomi kontūrai yra **laikinos reikšmės, o ne jokios geležinkelio vėžės**. Prieš remdamiesi rezultatu, įveskite savo geležinkelio konstrukcijų gabaritą.

## Kitose programose

- **LandXML**: geležinkelio trasa įrašoma su savo pereinamaisiais lankais (spiType) ir bloku `Cant`: vėžė, pasukimo taškas, linijos greitis bei stotis, kurioje kiekvienas viražo nuolydis prasideda ir baigiasi, su taikomu viražu, pusiausvyros viražu ir trūkumu. LandXML failas su bloku `Cant` atidarant ta trasa tampa geležinkelio trasa su tais viražais.
- **IFC**: trasa su savo viražo segmentais, bėgiai, pabėgiai, balastas ir pabalastinis sluoksnis.

## Dar neįgyvendinta

Išvažos IFC eksporte, išvažų šeimos už vienintelio uždarymo lanko ribų (lenkti stržės, slankiojantys kryžiukai, slydimo išvažos, rombai), kinematinio gabarito taisyklės (apvalkalas – fiksuotas kontūras su lanko nuokrypiu), viršutinės laidų linijos ir signalizacija.

**Kuris standartas.** Geležinkelio bloke „Cituojamas standartas“ pasirenkama Nėra arba Europinis (UIC ir EN). Pasirinkus Europinis, nurodomi dokumentai, kuriuos cituoja europiniai projektai (EN 13803 trasos parametrams, EN 13232 stržėms ir kryžiams, EN 15273 gabaritams, EN 13848 kelio geometrijos kokybei), o kiekvienai ribai atsiranda laukelis, kuriame įrašomas ją atitinkantis punktas. Jokia standarto reikšmė nėra įdėta: viražo, trūkumo, pertekliaus, nuolydžio ir kitimo ribos, išvažos geometrija bei konstrukcijų gabaritas vis dar yra laikinos reikšmės, ir langas apie tai praneša. Geležinkelių inžinierius kiekvieną reikšmę tikrina pagal paties standarto tekstą ir šalia jos įrašo punktą, kol nieko nesukūrė. Pietų Afrika ir AREMA lentelės šiame leidime nepateiktos.
