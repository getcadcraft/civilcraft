---
title: Imigqa ye-feature line
summary: Dweba imigqa ye-3D oyigredayo i-vertex nge-vertex, wenze ama-offset anezinyathelo ayo, bese uyisebenzisa njengemigqa yokuphula womhlaba noma njengamaphedi athambekile kuklama.
keywords: arc, curve, radius, 3d arc, helix, curved curb, grade overlay, elevation overlay, grade arrows, feature line, grade, slope, elevation, stepped offset, offset, breakline, curb, ditch, berm, sloped pad, daylight, grading, 3d polyline
from: d55b25fb
---

Umugqa we-feature umugqa onokuphakama ku-vertex ngayinye: umpetho, umugqa wokugeleza womfudlana, uphezulu webhemu, umphetho wephedi elithambekile. Usetha okuphakama kwawo ngenombolo noma ngethambeka, uwukopisha ngakohlangothi ngesinyathelo esiphezulu noma esiphansi, bese ukhetha okwenza imiphezulu kuwo.

## Dweba eyodwa

1. Khetha **Umphezulu** › {{ui:Okuningi}} › {{ui:Umugqa we-feature}}, noma cindezela {{key:L}}.
2. Chofoza ama-vertex alo epulanini. Ukuchofoza iphoyinti lokuhlola kuthatha indawo nokuphakama kwalelo phoyinti; kwenye indawo ngayinye i-vertex ithatha ukuphakama komhlaba okhona lapho.
3. Cindezela {{key:Enter}} ukuqeda umugqa ovulekile, noma chofoza i-vertex yokuqala futhi ukuze uwuvale.

Umugqa omusha uyakhethwa futhi uqala njengomugqa wokuphula womhlaba okhona, uhlala emhlabathini.

## Amajika

Isigaba singaba ijika epulanini ezigcinele zalo zingaphansi kokuphakama okuhlukile: ukubuya kompetho, umfudlana ogobile, irampu eyaphendukayo. Ithambeka lalo lihamba ngokulinganayo ijika, nobude balo bulinganiswa ngaphezu komgogodla.

- **Ngesikhathi udweba:** cindezela {{key:C}} (esikrinini esithintekayo, {{ui:Ijika}} ebhalwe ngaphezu kwepulani) ukuvula amajika. Ngemva kwe-vertex, chofoza iphoyinti evini, bese uchofoza lapho ijika liphela khona. Cindezela {{key:C}} futhi ukuze uthole izigaba eziqondile. {{key:Backspace}} ukhipha iphoyinti evini kuqala.
- **Ngemva kwalokho:** ku-**Izakhiwo**, thayipha iradiyasi nendlela ejikelezayo ebhokisini le-**Ijika** le-vertex, isibonelo `50 L` noma `50 R` (ngakwesobunxele noma ngakwesokudla uma uhamba emugqeni), bese ucindezela {{key:Enter}}. Hlanza ibhokisi ukuze isigaba sibe eqondile futhi. Iradiyasi encane kunengxenye yesigaba iyenqatshwa.

Umugqa okhethiwe ubonisa iradiyasi yalo ngalinye ecaleni kwethambeka lakhe. **Ubude** buhamba ngamajika epulanini; **Ubude be-3D** nabo babala ukukhuphuka nokwehla. Ama-offset anezinyathelo agcina amajika: ijika ngaphandle kwejika lilandela liyakhula, eliphakathi liyancipha, futhi i-offset edlula isikhungo sejika iyenqatshwa.

Imiphezulu, umbono we-3D kanye ne-DXF ne-DWG zithatha ijika ngalinye njengezingcezu ezimfushane ezingqondile ezihlala phakathi kuka-0.01 kwijika. I-LandXML iwagcina njengamajika (bona **Amajika kwamanye amafayela** ngezansi).

## Setha ukuphakama namathambeka

**Izakhiwo** zidweba ama-vertex ngebanga lawo emugqeni, **Ukuphakama** kwawo kanye **Ithambeka elilandelayo** (ngamaphesenti). Thayipha noma yikuphi bese ucindezela {{key:Enter}}:

- Ukuphakama kuhambisa leyo vertex kuphela.
- Ithambeka lisetha ukuphakama ekugcineni kwesigaba; ama-vertex alandelayo ahlala lapho ekhona, ngakho ithambeka lesigaba esilandelayo liyashintsha.

Futhi ku-**Izakhiwo**:

| Isenzo | Yenza ini |
|---|---|
| **Phakamisa noma wehlisa konke nge** | Yengeza ukuphakama othayipha kuwo wonke ama-vertex. |
| {{ui:Ukuphakama okuvela emhlabeni}} | Ibuyisela wonke ama-vertex emhlabathini okhona (ama-vertex angaphandle komphezulu agcina okwawo, futhi adweshwa uhlu). |
| {{ui:Ithambeka elilodwa, kusukela kokuqala kuya kokugcina}} | Igcina ukuphakama kokuqala nokokugcina futhi ibeka ama-vertex phakathi ethambekeni elilodwa elilinganayo. |

Umugqa okhethiwe ubonisa ukuphakama kwawo ku-ama-vertex namathambeka awo ngaphezu kwezigaba epulanini. Donsa i-vertex nge-{{ui:Khetha}} ukuze uyihambise; ukuphakama kwayo kuyahlala.

## Ama-offset anezinyathelo

Ngaphansi kwe-**Ama-offset anezinyathelo**, thayipha **Ibanga** (elihle ngakwesokudla kwendlela yomugqa, elingalungile ngakwesobunxele), bese ubhala ukuphakama (phezulu noma phansi ngokufana) noma ithambeka ngamaphesenti, bese uchofoza {{ui:Yenza umugqa osukiwe}}. Ikhophi ingumugqa omusha we-feature: isibonelo isibuyelo sompetho ngo-0.5 ft ecaleni nango-0.5 ft ephakeme, noma umphetho womfudlana ongu-6 ft ngaphandle ku-2 %. Ibanga elingakwenza ikhophi iphindeke ngokwayo ebhendeni elibukhali liyanqatshwa.

## Amathambeka nokuphakama esikrinini

Cindezela {{key:E}}, noma tshekela **Amathambeka nokuphakama kwemigqa ye-feature** ngaphansi kwe-**Isibonisi**, ukuze ubone ithambeka lemigqa ye-feature ngayinye ngesigaba ngasinye (nomcibisholo omncane oqondisa ukwehla) nokuphakama kwayo ku-vertex. Akhombisa esikrinini kuphela: akukho okungezwa emdwebweni, futhi i-PDF, i-DXF ne-DWG zihlala njengoba zinjalo. Izigaba ezimfushane namavertex ahlanganyelwe awanamalebula kuze kube yilapho usondeza. Umugqa okhethiwe njalo ubonisa amathambeka nokuphakama kwawo.

## Esibukweni sephrofayili

Umugqa we-feature odlula umzila ubonakala kwibuka yephrofayili yalowo mzila, negama lawo nokuphakama endaweni yokudlula; imigqa egijima ecaleni kwawo nayo ingabonakala. Bona [Klama iphrofayili eqondile](topic:profile).

## Imiphezulu yenza ini ngayo

Khetha **Sebenzisa**:

| Sebenzisa | Okwenzekayo |
|---|---|
| Umugqa wokuphula womhlaba okhona | Umhlaba okhona udlula kulo mugqa ngokuphakama kwawo, njengomugqa wokuphula odweshwe. |
| Ogredwe ekwakhiweni | Umugqa **ovaliwe** uba ipheda elithambekile: umphezulu ohlongozwayo ngaphakathi kuwo ugredwa kuya emphethelweni walo. Vula **Ukukhanya kumhlaba** ukuze usebenzise amathambeka okusika nokugcwalisa (ngokuthe tshe kuya ku-1 eqondile) kusuka emphethelweni walo kuya emhlabeni, njengoba iphedi yenza; ithambeka ngalinye liqala ekuphakameni komphetho lapho. |
| Kudwetshwe kuphela | Ihlala epulanini futhi iphuma ku-DXF, DWG nePDF (ungqimba C-GRAD-FEAT, ama-3D polyline), kodwa imiphezulu iyayinaka. |

Imithamo, izigaba nombono we-3D kuhlanganisa imigqa ye-feature egredwe ekwakhiweni, njengamaphedi. Ushintsho ngalunye luyisinyathelo esisodwa: {{key:Mod+Z}} luyalihlehlisa.

## Ukwabelana ngemigqa nethimba lakho

Kumdwebo ovulwe kumafayela akho efu ku-CadCraft Studio, kwiplani lethimba, **Izakhiwo** zephrojekthi (lapho kungakhethiwe lutho) zinesigaba se-**Ithimba** ene-{{ui:Imigqa yeqembu…}}: imigqa ethimba lakho elabelane ngayo, ngayinye nenguqulo yayo, ngaphandle kokukhetha umugqa we-feature kuqala. Khetha umugqa ukuze uwabelane, uphushe inguqulo entsha, uthathe eyethimba, noma uyeke ukwabelana. Ngaphandle kwalesi simiso isigaba sitshela ukuthi sidinga ni.

## Amajika kwamanye amafayela

| Ifayela | Okwenzekela umugqa we-feature onamajika |
|---|---|
| Iphrojekthi ye-CivilCraft | Igcinwa ngokuqondile. |
| LandXML | Ibhalwa njengesici sepulani esinemigqa namajika ngokuphakama kwawo, futhi ifundwa kabusha namajika ayo. Umugqa we-feature ovela kwenye inhlelo ungena njengo-**Kudwetshwe kuphela**: khetha **Sebenzisa** kwawo ukuze uwufake emphezulwini. |
| DWG ne-DXF | I-3D polyline ayikwazi ukugcina ijika, ngakho umugqa ubhalwa njengezingcezu ezimfushane ezihlala phakathi kuka-0.01 kwejika ngalinye. I-CivilCraft iphinde iphawule emdwebweni ukuthi yiziphi izingcezu ezaziwuba amajika: uma uvula umdwebo njengemigqa, {{ui:Imigqa ye-feature line}} ibuyisela imigqa njengemigqa ye-feature namajika ayo. Amanye amahlelo abona i-3D polyline ejwayelekile. |
