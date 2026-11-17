---
title: Kuratibu za ardhi na za ndani
summary: Fanya kazi katika kuratibu za ardhi (uso) zilizopimwa kutoka gridi kwa kipengele cha jumla cha kipimo unachoandika au kukokotoa katika nukta, au katika gridi ya eneo dhahania iliyofungwa kwenye mfumo kwa pointi mbili za udhibiti.
keywords: kuratibu za ardhi, kuratibu za uso, gridi hadi ardhi, kipengele cha jumla cha kipimo, csf, kipengele cha pamoja, kipengele cha gridi, kipengele cha miinuko, kipengele cha usawa wa bahari, convergence, pembe ya ramani, kipengele cha kipimo, kuratibu dhahania, kuratibu za ndani, gridi ya eneo, 5000 5000, pointi za udhibiti, urekebishaji, pointi mbili, kosa la kufunga
from: 3d7453de
---

Kuratibu za state plane na UTM ni kuratibu za **gridi**: makadirio ya ramani hunyoosha au kukunja umbali kidogo (sehemu kadhaa kwa milioni), na kadri eneo lilivyo juu, ndivyo umbali uliopimwa ardhini unavyotofautiana na wa gridi. Tafiti nyingi kwa hiyo hukabidhi kuratibu za **ardhi**, zilizopimwa ili umbali wa mpango ulingane na umbali uliopimwa ardhini, au gridi ya eneo **dhahania** (5000, 5000 katika nukta ya udhibiti). CivilCraft inahifadhi namba zako kama zilivyo na kurekodi zinavyohusiana na gridi, ili latitudo na longitudo, faili za GIS na tabaka za ramani bado zitue mahali pake sahihi.

Fungua {{ui:Kuratibu}} katika kikundi cha {{ui:GIS}}, chagua (au acha) mfumo, kisha chagua chini ya **Kuratibu za gridi, ardhi au za ndani**:

| Chaguo | Kuratibu zako ni | Zinavyohusiana na gridi |
|---|---|---|
| {{ui:Gridi}} | Za mfumo wenyewe (mwanzo) | Namba zile zile |
| {{ui:Ardhi}} | Zilizopimwa kwa umbali wa ardhini | gridi = msingi + kipengele cha pamoja × (ardhi − msingi) |
| {{ui:Ya ndani}} | Gridi dhahania ya eneo | Imesogezwa, imegeuzwa na kupimwa hadi gridi kwa pointi mbili za udhibiti |

Chochote unachochagua kinahifadhiwa na mradi na ni hatua moja ya kutendua; hakuna kinachosogea.

## Kuratibu za ardhi

1. Chagua {{ui:Ardhi}}.
2. Andika **Kipengele cha jumla cha kipimo** kutoka kwenye utafiti (kwa mfano `0.99987`), au ukikokotoe:
   1. Chini ya **Kokotoa kipengele katika nukta**, nukta inaanza katikati ya mradi. Chagua {{ui:Chagua nukta kwenye mpango}} na ubofye mahali (kubofya karibu na nukta ya utafiti kunachukua nukta hiyo), au andika E na N.
   2. Mwinuko unatoka kwenye uso pale; andika mwingine ukihitaji.
   3. Chagua {{ui:Hesabu}}. CivilCraft inaonyesha:
      - **Kipengele cha gridi k**: jinsi makadirio ya ramani yanavyonyoosha umbali pale.
      - **Kipengele cha miinuko**: jinsi umbali unavyokuwa mfupi kwenye ellipsoid kuliko kwenye urefu huo.
      - **Kipengele cha pamoja** = k × kipengele cha miinuko: umbali wa gridi = umbali wa ardhi × hiki.
      - **Convergence**: pembe kutoka kaskazini ya gridi hadi kaskazini ya kweli pale (azimuth ya kijiografia = azimuth ya gridi + convergence).
   4. Chagua kitufe cha {{ui:Matumizi}} chini ya namba ili kuweka kipengele cha pamoja kwenye kisanduku.
3. Weka **Nukta ya msingi**, ambapo kuratibu za ardhi na za gridi zinafanana. Inaanza 0, 0: mamlaka nyingi zinazochapisha kuratibu za ardhi hupima kuhusu asili, kwa hiyo kuratibu za ardhi zinabaki karibu na za gridi. Tafiti zingine hupima kuhusu nukta ya udhibiti ya mradi: fuata alichosema utafiti.
4. Chagua {{ui:Tumia}}.

:::warning
Mwinuko unachukuliwa kama urefu juu ya ellipsoid. CivilCraft haina modeli ya geoid, kwa hiyo pale geoid inaposhuka au kupanda m 30 (ft 100) kutoka ellipsoid, kipengele cha miinuko kinapotoka kwa takriban 5 ppm. Utafiti unapotaja kipengele chake cha pamoja, andika hicho.
:::

## Kuratibu za ndani (dhahania)

1. Chagua {{ui:Ya ndani}}.
2. Kwa **Pointi ya udhibiti 1**, andika namba ya nukta ya utafiti (au chagua {{ui:Chagua}} na ubofye kwenye mpango). Kuratibu zake za ndani zinaonyeshwa kando yake.
3. Andika **gridi** E na N yake, au latitudo na longitudo yake kwenye kisanduku cha tatu (kwa mfano `30.2672, -97.7431`).
4. Fanya vivyo hivyo kwa **Pointi ya udhibiti 2**, iwe mbali na ya kwanza iwezekanavyo.
5. CivilCraft inaonyesha **Kipimo** na **Mzunguko** zilizopatikana, na inakukumbusha: **Pointi mbili daima zinatoshea kikamilifu — kagua ya tatu.**
6. Toa **Pointi ya ukaguzi** kwa njia ile ile. CivilCraft inaonyesha umbali ambao utoshelevu unaiweka kutoka kuratibu za gridi ulizoandika (kosa lake la kufunga, katika vitengo vya mradi na katika sehemu kwa milioni). Kosa kubwa la kufunga linamaanisha nukta mbaya, kosa la kuandika, au kuratibu katika kitengo kingine.
7. Chagua {{ui:Tumia}}.

Kipimo kilicho mbali na 1 (zaidi ya 0.5 hadi 2) kinakataliwa: kagua nukta na vitengo vyake.

## Kilichokaguliwa

- Kipengele cha kipimo na convergence vinalingana na PROJ (pyproj 3.7.1 na PROJ 9.5.1), maktaba ya kuratibu ambayo programu nyingi za GIS hutumia, ndani ya sehemu 1 kwa bilioni katika zaidi ya mifumo 300 yenye makadirio ya kuhifadhi umbo (state plane, UTM, transverse Mercator, Lambert conformal conic), na kwenye kivinjari kwa nukta iliyochaguliwa kwenye mpango.
- Hatua za ardhi na za ndani zinabadilika kurudi na kwenda kwa sehemu 1 kwa bilioni; pointi mbili za udhibiti zinarudisha kipimo na mzunguko vilivyozitengeneza; pointi ya ukaguzi iliyo mbali 0.05 ft inaonyesha kosa la kufunga la 0.05 ft.
