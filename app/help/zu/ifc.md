---
title: Ukuthumela nokungenisa i-IFC
summary: Londoloza iphrojekthi yonke njengefayela elilodwe le-IFC ku-IFC 4.3, IFC4 noma IFC2x3 (ama-alignment, imigwaqo, imisebenzi yomhlaba, izindawo, izindonga, amapayipi), futhi uvule amafayela e-IFC ngama-alignment nezindawo zawo.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, umzila, ifcalignment, umgwaqo, ifcroad, imisebenzi yomhlaba, tin, okunikezwayo, ukuthenga, thumela i-ifc, ngenisa i-ifc
from: 6b998bcf
---

I-IFC iyifomethi evulekile yokushintshanisa abaningi abaklienti bomphakathi abayicelayo njengento okunikezwayo. I-CivilCraft ibhala iphrojekthi yonke ifayela elilodwa le-IFC futhi ifunda ama-alignment nezindawo kubuyiswe kumafayela e-IFC.

## Ukuthumela

1. Chofoza {{ui:IFC}} eqenjini le-**Thumela** (kuzitayela ze-ribbon: {{ui:Okuphumayo}} › {{ui:Thumela}} › {{ui:IFC}}).
2. Khetha isikimu. **IFC 4.3 ADD2** yeyokuqala futhi yeyokuzenzakalela: yona enama-alignment, imigwaqo nemisebenzi yomhlaba. Khetha IFC4 noma IFC2x3 kuphela uma isofthiwe yomamukeli ingafundi 4.3.
3. Ingxoxo ichaza ukuthi ifayela liyobamba ini nokuthi isikimu osikhethile sishiyani. Chofoza {{ui:Export IFC}}.
   Ifayela lidawunilodwa njenge-"*igama lephrojekthi*-ifc4x3.ifc", "-ifc4.ifc" noma "-ifc2x3.ifc". I-CivilCraft ikhumbula isikimu osikhethe ekugcineni.

## Yini isikimu ngasinye siyibambe

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Ama-alignment | IfcAlignment enesakhiwo sayo esiyisicaba (imigqa, amaxhaphozi ajikelezayo, izintambo ze-clothoid) nesakhiwo sayo esimi ngokuqondile (ukuthambeka, amajika we-parabolic), amajika wayo (IfcCompositeCurve, IfcGradientCurve), isiteshi sokuqala nemicimbi yokuphakama kwangaphandle kwegoloqho | Umugqa ongu-3D kwisivakalisi somhlaba (civil element) | Umugqa ongu-3D kwiproxy |
| Amakhoridoro | IfcRoad enezingxenye zomgwaqo; amalane, izinhlangothi zomgwaqo, imifudlana nezindlela zabahambi ngezinyawo njenge-IfcPavement, amakhabhu njenge-IfcKerb, imigqa yokutshala; ungqimba ngalunye lwendlela njenge-IfcCourse nobukhulu, impahla nevolumu yalo; izindonga eziseceleni njenge-IfcEarthworksCut ne-IfcEarthworksFill nevolumu yokusika nokugcwalisa; isivinini sokuklama nesigaba | Izinto zesivakalisi zibizwa ngokuthi zinjani, ziqoqwe ngomgwaqo ngamunye | Amaproxy, aqoqwe ngomgwaqo ngamunye |
| Ubuso | IfcGeographicElement TERRAIN nenethiwekhi ye-triangulated irregular (TIN) | Amasethi obuso anama-triangle | Amamodeli obuso asekelwe ezindaweni (amafayela amakhulu) |
| Amapedi nezindonga | Umphezulu wepedi, amathambeka ayo njengemisebenzi yomhlaba, izindonga zokubamba njenge-IfcWall RETAININGWALL | Okufanayo, udonga njengohlobo lodonga oluchazwe umsebenzisi | Okufanayo, uhlobo lodonga ku-ObjectType |
| Amanethiwekhi amapayipi | IfcPipeSegment ne-IfcDistributionChamberElement ku-IfcDistributionSystem | Okufanayo | IfcFlowSegment namagumbi ku-IfcSystem |
| Ukubhekiselwa emhlabeni | IfcProjectedCRS ne-IfcMapConversion | Okufanayo | ePSet_ProjectedCRS ne-ePSet_MapConversion esiteshini |

Ireyili (i-alignment enesi-**Railway** esivuliwe) ifakwa ku-IFC 4.3 njenge-IfcRailway: izinguquko zayo njengezinhlobo zazo (clothoid, cubic parabola, Bloss, Helmert, sine half-wave njenge-cosine curve, sine), i-cant yayo njenge-IfcAlignmentCant, nomugqa wayo njengamagxala, izinsimbi zokubamba namazinga, nesisekelo esingaphansi kwawo. I-IFC4 ne-IFC2x3 zithola izingxenye ezifanayo njengezivakalisi zomhlaba noma amaproxy. Ukuvula ireyili ye-IFC 4.3 kubuyisela izinguquko zayo ne-cant.

Kuyo yonke ifayela kuqukethe futhi amapaseli (ama-footprint), izitshalo nezakhiwo zangaphandle zeWorkspace yeLandscape, nezindawo zezakhiwo (ngayinye yiIfcBuilding nezitezi zayo), zonke esiteshini esisodwa. Amasethi wezakhiwo aqukethe okwaklanywa: izitelishi, ukwakheka, amathambeka okusika nokugcwalisa, ububanzi nenani lemigwaqo, ukungena kwamapayipi ngaphansi, imiphetho yamamanholo, nokuphakama kodonga; izilinganiso (ubude, izindawo, amavolumu) ngamasethi e-IfcElementQuantity.

## Amayunithi nezixhumanisi

Ifayela lisemayunithini ubude besiphrojekthi (imitha, noma amayadi wesivivinyo waseMelika); izindawo namavolumu asemamitheni ayisikwele nasekhubeni. Uma unesistimu yezixhumanisi (GIS › Izixhumanisi) ifayela libekwa emephini: i-easting nenorthing yomthombo wayo, nokuzungeza nesilinganiso sesistimu yomhlaba (yendawo), kuvela ekuguqulweni kwemephu. Ngaphandle kwayo ifayela liqopha umthombo wayo wendawo kumasethi wezici futhi alibekwa emephini.

## Ukungenisa

Vula ifayela le-.ifc nge-{{ui:Open}} noma liwise phansi epulanini. Ingxoxo yokungenisa ichaza ukuthi ifayela linani ini:

- **Ama-alignment** kusuka ku-IFC 4.3 (izakhiwo eziyisicaba nezimi ngokuqondile) namajika wama-alignment we-IFC 4x1 aba ama-alignment e-CivilCraft anamaPI, izinhlangothi, ubude bezintambo nama-PVI. Ama-alignment i-model yamaPI ye-CivilCraft engeke iwabambe (ama-compound curves, izintambo phakathi kwamajika amabili, anqamula noma aphele ejikeni) ayingenisiwe, nengxoxo ichaza ukuthi kungani.
- **Ubuso**: khetha okuzoba umhlaba ovele ukhona, noma gcina okweprojekthi.
- **Konke okunye** (nobuso bokunye) kungaboniswa kubukeka be-3D njengereferensi. Izakhi zereferensi zihlala phakathi kwephrojekthi evulekile; azilondolozwa kufayela leprojekthi.

Ifayela elibhalwe yi-CivilCraft ku-IFC4 noma IFC2x3 libuyisa ama-alignment ayo ngokuphelele kusuka emasethini wezici zawo.

## Akukakhiwa

- Ukwehla kwendlela kubhalwa njengemicimbi yokuphakama kwangaphandle nasemigwaqweni yomgwaqo (i-cant yeyoreyili kuphela).
- Ukulondoloza izakhi zereferensi kufayela leprojekthi, nokungenisa amanethiwekhi amapayipi noma amapedi kusuka ku-IFC njengezinto ezihlelekayo.
