---
title: Akhri kontuurada, heerarka iyo naqaska
summary: Deji masaafada kontuurka iyo kontuurada waaweyn, muuji xagaaga heerarka, fallaadaha naqaska iyo saddexagallada, oo akhri heerka dhulka hoosta tusaha.
keywords: kontuur, masaafada kontuurka, kontuurada waaweyn, calaamadaha, xagaaga heerarka, fallaadaha naqaska, saddexagallada, heerka barta, falanqaynta dusha, falanqaynta heerka, falanqaynta naqaska
from: 585e500a
---

Dusha waxaa lagu muujiyaa kontuurro markii ay jirto. Wax kasta oo mawduucan ku jira waxaa lagu dejiyaa **Bandhig** panelka bidix. Dejinta bandhigga waxay beddeshaa kaliya wixii aad aragto (iyo wixii aad dhoofinayso); ma aha tallaabo ka noqo.

## Deji masaafada kontuurka

1. Hoosta **Bandhig**, dooro qiime ku jira **Kontuur kasta**.
   - Fiit: 0.25, 0.5, 1, 2, 5, 10 ama 20 ft.
   - Mitir: 0.1, 0.25, 0.5, 1, 2, 5 ama 10 m.
2. Dooro **Waaweyn kasta**: kontuurka 2aad, 4aad, 5aad ama 10aad.
   Kontuurada waaweyn waxaa lagu sawiraa xarriiq culus, waana lagu calaamadiyaa heerkooda. Waxay ku dhacaan tirooyin buuxa oo ah masaafada waaweyn (marka kontuurada 1 ft tahay oo waaweyn kasta yahay 5aad: 245, 250, 255 …).
3. Demi {{ui:Calaamadaha kontuurka}} haddii calaamadaha ay ku soo xoogaystaan qorshe yar.

Mashruuc cusub wuxuu ku bilaabmaa 1 unit, iyo kontuur kasta oo 5aad oo ah waaweyn. Kontuurada waxay ku foorarsadaan khadadka jebinta; haddii ay si toos ah u gooyaan xarriiq socod ama bir, xarriiqaas weli ma aha khad jebin (eeg [Dhis oo hagaaji dusha](topic:build-surface)).

:::note
Kontuurada waxaa la sawiraa kaliya marka aan ka badnayn 2,000 heer oo u dhexeeya barta ugu hooseysa iyo tan ugu sarraysa. Goob leh fidin badan oo masaafo aad u yar, qorshuhu ma muujinayo kontuur kastaba: dooro masaafo weyn.
:::

## Jilciyi kontuurada

Kontuurada waxaa lagu raadiyaa qaybo toosan, mid kasta oo saddexagal ah dhexdiisa, sidaas darteed waxay leexdaan geesi yar geesaha saddexagal kasta. **Jilcinta kontuurka** oo ku jirta **Bandhig** ayaa geeskaas wareegaya:

- **Midna (qaybo toosan)**: xarriiqyada la raadiyay sida ay yihiin. Waa waxa qoraal cusub ama hore uu muujiyo.
- **Fudud**: geesaha si yar ayaa loo wareejiyaa. Xarriiq weligeed ma u dhaqaaqdo in ka badan 10% jidka ilaa kontuurka xiga, mana uu ka fogaan qaybtiisa toosan in ka badan hal qaybi lixaad dhererkeeda.
- **Xoog**: qalloocan socda. Xarriiq weligeed ma u dhaqaaqdo in ka badan 25% jidka ilaa kontuurka xiga, mana uu ka fogaan qaybtiisa toosan in ka badan saddex meelood meel dhererkeeda.

Labada doorasho midkoodna, kontuur jilcisan weli wuxuu gooyaa saddexagal kasta oo xuduud ah barta isku mid ah ee kontuurka la raadiyay, waxaana uu ku jiraa saddexagalka qayb kasta gooyo, sidaas darteed ma gooyi karo ama taaban karo kontuur kale. Meel kontuurku ku gooyo khad jebin ama xuduud, wuxuu hayaa geeskiisa cad. Xarriiqyada jilcisan ayaa la qorayaa oo la dhoofiyaa (DXF, DWG, PDF, GIS iyo 3D), waxayna leeyihiin geesas badan xarriiqyada la raadiyay.

Jilcintu waxay beddeshaa kaliya xarriiqyada la sawiray. Heerarka, mugga, profiles-ka iyo qaybaha waxaa laga akhriyaa dusha laftiisa. Kontuur uu si toos ah ugu gudbo barta sahanka (barta 250.00 ee kontuurka 250) wuxuu hayaa geesas yar meel kasta oo noocaas ah.

## Dusha ka dambeysa kontuurada

Kontuurada waxay raacaan dusha, dushuna waxay raacaa **Habka kontuurka** hoosta **Dusha** panelka bidix. Caadiga ah, **Saddexagallada oo leh interpolation toos ah**, waxay isku xidhaa barahaaga saddexagallo waxayna hayaan barta iyo khad jebin kasta si sax ah. Hababka kale marka hore waxay ku habboonaysiiyaan shabakad joogto ah barahaaga (kriging, minimum curvature, natural neighbor, inverse distance iyo kuwa kale), taasoo siinaysa kontuur wareegsan intervallada u dhexeeya barta, laakiin ma marayso dhammaan barahaaga si sax ah; warbixinta dusha ee hoosta **Dusha** ayaa sheegaysa intee ka fog tahay natiijadu barahaaga.

**ABOS (approximation based on smoothing)** waa mid ka mid ah hababka shabakadda. Wuxuu leeyahay laba dejin oo gaar ah: **Jilicsanaan** (0.5 ilaa bilow; yar waa jilicsan) iyo **Saxnaan** (1 ilaa bilow: dusha waxaa lagu keenayaa 1% ilaa kala duwanaanshaha sare ee goobta barahaaga; ku qor tiro yar si aad u heshid habboon oo dhow). Haddii aanu gaarin saxnaanta shabakadda uu haysto, warbixinta dusha way sheegaysaa: ku qor **Fogaanta shabakada** oo yar.

## Akhri heer meel kasta

Tusaha u dhaqaajiso qorshaha. Bar-xaaladdu waxay muujinaysaa:

- **E** iyo **N** hoosta tusaha
- **Dhul** iyo heerka dhulka jira halkaas, oo lagu xisaabiyay saddexagalka hoosta tusaha
- **La sameeyay** iyo heerka la soo jeediyay, meesha pad ama kooridor uu dhulka beddelay
- "Dusha ka baxsan" dibadda dusha

Si aad barta sahanka si sax ah u akhrido, dooro {{ui:Dooro}} oo guji barta: panelka midig wuxuu muujinayaa lambarkeeda, bariga (E), waqooyiga (N), heerka, sharaxaadda iyo kooxda.

## Muuji xagaaga heerarka

1. Calaamadee {{ui:Xagaaga heerarka}}.
   Dusha waxaa lagu buuxiyaa midab ka bilaabmaya hoose (buluug-cagaar) ilaa sare (qaxwe-jaalle). Liiska hoosta sanduuqyada hubinta wuxuu muujinayaa kala duwanaanshaha heer kasta.
2. Dooro inta xagaago ah ee **Xagaagaha**: 5, 8, 10 ama 12. Xagaagahu wuxuu kala qaybiyaa kala duwanaanshaha heerka hoose ilaa sare qaybo siman.

Xagaagahu waa kuwo la eegayo oo keliya. Looma dhoofiyo DXF looma qorayo PDF.

## Muuji fallaadaha naqaska

Calaamadee {{ui:Fallaadaha naqaska}}. Fallaad gaaban ayaa saddexagal kasta oo ku filan weyn si ay mid u qabato ayaa u tilmaamaysa dhinaca hoose. Saddexagallada siman fallaad ma helaan. Fallaadahu waa hubin degdeg ah oo ku saabsan jihada biyaha; qiimaha naqaska laftiisa weli lama calaamadin.

## Muuji saddexagallada, barahaaga iyo geeska

- {{ui:Saddexagallada}} waxay sawirtaa geesaha TIN-ka. Shid si aad u hubiso sida dusha ula xidhan tahay barahaaga, gaar ahaan khadadka jebinta iyo dibada.
- {{ui:Barood}} waxay sawirtaa barta sahan kasta; {{ui:Calaamadaha barta}} waxay ku darta lambarkeeda, heerkeeda iyo sharaxaadda (ama ka yar: eeg **Calaamadaha barta** ee [Dejinta CivilCraft](topic:settings)).
- {{ui:Khadadka jebinta}} waxay sawirtaa khadadka jebinta (iyo xuduudka) midab oranji ah.
- {{ui:Xuduudka dusha}} waxay sawirtaa dhamaadka dusha.

## Jira ama la soo jeediyay

Markii pad ama kooridor uu dhulka si nadiif ah u sameeyo, **Dusha** hoosta **Bandhig** waxay bixisaa {{ui:La soo jeediyay (la sameeyay)}}. Kontuurada, xagaagaha iyo fallaadaha markaas waxay muujinayaan dusha la sameeyay, si aad u aragto dhulka cusub iyo iftiinka dibadiisa.

Ku noqo {{ui:Dhulka jira}} si aad u aragto sahanka.

## Wixii la dhoofiyo

Dhoofinta DXF iyo PDF waxay raacaan dejintan: wixii aad damisay looma qorayo, kontuurada waa kuwa dusha la muujiyay. Xagaagaha heerarka weligood looma dhoofiyo.
