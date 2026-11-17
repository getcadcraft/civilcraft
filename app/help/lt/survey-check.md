---
title: Patikrinti geodezinį brėžinį importuojant
summary: Skaityti aukščius, užrašytus tekstu arba blokų atributais, kaip geodezinius taškus ir patikrinti DWG ar DXF dėl klaidingų vienetų, nesančios koordinačių sistemos, vietos toli nuo pradžios taško, plokščių horizontalių, keistų aukščių ir dvigubų taškų prieš kuriant žemę.
keywords: geodezinė patikra, importo patikra, geodeziniai aukščiai, taškiniai aukščiai, aukščiai tekstu, atributai, vienetai, koordinačių sistema, toli nuo pradžios taško, horizontalės ties nuliu, nukrypę taškai, dublikatai, problemos, kraštovaizdžio architektas, geodezinis brėžinys
from: d46acd24
---

Geodezinis brėžinys gali atrodyti teisingai ir vis tiek būti neteisingas žemei: jo vienetai gali būti spėjami, horizontalės gali gulėti plokščios ties 0 aukščiu, o aukščiai gali būti užrašyti tekstu, kuris visai nėra geometrija. **Geodeziniai aukščiai ir patikra** skyrius {{ui:Linework}} dialoge (žr. [Atidaryti DWG ar DXF kaip linijinę grafiką](topic:open-dwg-dxf)) nuskaito tuos aukščius ir pasako, kas atrodo neteisinga, prieš ką nors pridedant.

## Aukščiai, užrašyti tekstu arba atributuose

Daugelis geodezinių brėžinių pateikia taškinį aukštį kaip mažą tekstą šalia kryžiaus, pavyzdžiui, `104.37` arba `EL 104.37`, arba kaip taško bloko atributą. Tai nėra linijos, todėl linijinės grafikos skaitytuvas jų neima. Skyriuje nurodoma, kiek rado, ir leidžiama paimti juos kaip **geodezinius taškus**:

1. Pažymėkite **Imti … aukščius kaip geodezinius taškus**. Iš pradžių jie nepažymėti, nes ne kiekvienas skaičius brėžinyje yra aukštis.
2. Tekstas skaitomas, kai jis yra aukštis savaime: skaičius su dešimtainiu dalimi (`104.37`, `+104,37`, `-3.50`) arba skaičius po `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` ar `LEVEL`, su pasirenkamu `m`, `ft` ar `'` po jo. Vienas sveikasis skaičius (`12`) skaitomas kaip sklypo ar lapo numeris, o ne aukštis; tokie tekstai kaip `GATE 3` ar data niekada neskaitomi. Teksto formatavimo kodai ignoruojami.
3. Blokų atributams pasirinkite **Blokų atributas, kuriame yra aukštis**. CivilCraft pats randa žymą pavadinimu ELEV, Z, LEVEL, RL ar panašią; jei brėžinyje naudojama kita, pasirinkite ją iš sąrašo. Pasirinkimas įsimenamas tam failo pavadinimui šiame kompiuteryje, todėl jį vėl atidarius pradedama nuo tos pačios žymos. Pasirinkta žyma priima ir sveikuosius skaičius kaip aukščius.
4. Spustelėkite {{ui:Add}}. Taškai sunumeruojami po didžiausio projekto numerio, kiekvienas taškas aprašomas savo sluoksniu (ar bloku), o aukščiai konvertuojami į projekto vienetus kaip ir visas brėžinys. Visa tai yra vienas žingsnis: {{key:Mod+Z}} pašalina taškus.

Tekstas yra savo įterpimo taške (arba jo lygiavimo taške, jei jis turi). Tekstas blokų viduje neskaitomas, o brėžinys niekada nekeičiamas.

## Patikra

Patikra vykdoma su tuo, ką ketinate įtraukti, ir išvardija, ką randa, po vieną eilutę kiekvienai problemos rūšiai:

| Sako | Ką tai reiškia |
|---|---|
| **Vienetai nenurodyti** | Brėžinyje nenurodyta, kokie jo vienetai, todėl jo skaičiai skaitomi kaip projekto vienetai. Patikrinkite vieną atstumą, kurį žinote. |
| **Vienetai konvertuoti** | Brėžinio vienetai skiriasi nuo projekto ir yra perskaičiuojami (pastaba, ne klaida). |
| **Duomenys apima … km** arba **… m** | Apimtis didesnė nei 200 km arba mažesnė nei pusė metro, dažniausiai tai rodo klaidingą vienetą (milimetrai skaitomi kaip metrai arba atvirkščiai). |
| **Nėra koordinačių sistemos** | Projekte jos nėra. Tai įspėjimas, kai duomenys yra toli nuo nulio, kaip valstybinės plokštumos ar nacionalinio tinklelio koordinatės. Žr. [Koordinačių sistemos](topic:coordinate-systems). |
| **Toli nuo pradžios taško** | Duomenys yra daugiau nei 100 km nuo nulio. Toli nuo nulio 3D vaizdai ir eksportai praranda tikslumą ir dreba. |
| **Horizontalių sluoksnis … neturi aukščio** | Sluoksnis, pavadintas kaip horizontalės (TOPO, CONT, CNTR, CONTOUR), turi linijas 0 aukštyje, todėl žemė, sukurta iš jų, būtų plokščia. |
| **Aukščiai lygūs tiksliai 0** | Kai kurie aukščiai yra 0, o tipiškas aukštis toli nuo to: greičiausiai trūksta aukščių. |
| **Aukščiai toli nuo likusių** | Keli aukščiai yra toli už kitų ribų (lyginant su visų aukščių viduriu, todėl stati vietovė su plačiu aukščių intervalu nepažymima), arba virš 9,000 m, arba žemiau -11,000 m. |
| **Taškai ant kito taško** | Du taškai toje pačioje vietoje su tuo pačiu aukščiu arba su skirtingais aukščiais. |

Spustelėjus {{ui:Add}}, tos pačios eilutės patenka į **Problemos**, po vieną kiekvienai rūšiai, su failo pavadinimu, kad galėtumėte grįžti prie jų. Patikra vertina brėžinį; ji jame nieko nekeičia ir neužkerta kelio jį naudoti.

:::tip
Kai patikra sako, kad horizontalės plokščios ties 0 ir yra aukščių tekstu, įtraukite aukščius kaip geodezinius taškus: jie dažnai turi tikrus aukščius, kurių trūksta horizontalių linijoms.
:::

## Ko nepatikrinama

Patikra nelygina brėžinio su antru matavimu, ir ji negali pasakyti, kurioje koordinačių sistemoje yra brėžinys: ji tik parodo, kad sistema nenustatyta.
