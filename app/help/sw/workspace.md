---
title: Skrini, sehemu kwa sehemu
summary: Ziara ya kila upau na paneli ya CivilCraft kwa jina lake kwenye skrini, kuanzia upau wa zana hadi upau wa hali.
keywords: kiolesura, skrini, upau wa zana, paneli, sifa, upau wa hali, mwonekano wa wasifu, mpangilio, ziara, ui
from: 76272010
---

CivilCraft ina skrini moja tu. Hakuna vichupo wala mipangilio mingi. Paneli za kando zinaweza kuhamishwa, kuelea au kwenda dirishani lao: tazama [Panga paneli na tumia kifuatilizi cha pili](common:arrange-panels). Kuanzia juu hadi chini na kushoto kwenda kulia:

- **upau wa programu** (alama ya CadCraft, jina la programu, toleo, Kuhusu, hali ya skrini, Msaada, Hifadhi kwa matumizi ya nje ya mtandao, Karatasi na Modeli)
- **upau wa zana** wenye makundi saba ya vitufe
- **paneli ya kushoto**: Eneo, Nukta, Uso, Onyesho na, mara utakapoingiza baadhi, tabaka za GIS
- **mpango** katikati, na **mwonekano wa wasifu** chini yake ukiwa wazi
- **paneli ya kulia**: Sifa za kitu kilichochaguliwa
- **upau wa hali** chini kabisa

## Upau wa programu

Upau mwembamba kabisa juu unamilikiwa na tovuti ya CadCraft, si CivilCraft yenyewe.

- Menyu ya toleo inaonyesha toleo unalotumia.
- {{ui:About CivilCraft}} inafungua ukurasa wa programu kwenye tovuti.
- {{ui:Full screen}} inazunguka aina za skrini: skrini nzima, kisha skrini nzima bila upau, kisha kurudi kwa kawaida. {{key:Ctrl+Shift+F}} hufanya vivyo hivyo kwenye kila mfumo, pamoja na Mac (ni ufunguo wa Control hapo, si Command). Upau ukiwa umefichwa, sogeza kielekezi hadi ukingo wa juu ili kuurudisha.
- {{ui:Help}} (au {{key:F1}}) inafungua msaada huu kwenye paneli ya kando; {{key:F1}} au {{key:Esc}} inaufunga.
- {{ui:Save for offline}} inaweka CivilCraft kwenye kivinjari hiki ili ifunguke bila muunganisho; kisha inaonyesha {{ui:Offline ready}}. Tazama [Faili unazoweza kufungua, kuhifadhi na kuhamisha](topic:files#online-and-offline).
- {{ui:Paper}} na {{ui:Model}} zinabadilisha kati ya mandhari nyepesi na nyeusi. Mpango na wasifu vinafuata mandhari; PDF daima huchapishwa kwenye nyeupe.

## Upau wa zana

Kila kundi lina lebo ndogo juu ya vitufe vyake. Elekeza kielekezi kwenye kitufe ili kuona kidokezo chake na ufunguo wake.

| Kundi | Vitufe | Vinachofanya |
|---|---|---|
| Faili | {{ui:New}}, {{ui:Open}}, {{ui:Save}} | Anza upya, fungua faili ya nukta, LandXML au mradi, hifadhi mradi kama kipakuliwa |
| Hamisha | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | Andika LandXML 1.2, R12 DXF au DWG ya mpango, au chapisha mpango kwa PDF |
| Uso | {{ui:Breakline}}, {{ui:Boundary}} | Chora mstari wa kuvunja kupitia nukta za upimaji; chora mpaka wa nje |
| Usanifu | {{ui:Alignment}}, {{ui:Pad}}, {{ui:Pipes}}, {{ui:Profile}} | Chora mpangilio wa njia, pedi, mstari wa mabomba; onyesha au ficha mwonekano wa wasifu |
| Hariri | {{ui:Undo}}, {{ui:Redo}}, {{ui:Copy}}, {{ui:Paste}}, {{ui:More}} | Tendua, rudia, nakili na bandika nukta za upimaji; {{ui:More}} inashikilia Kata, Bandika mahali pale, Nakili mara mbili, Futa, Chagua nukta zote na Usichague chochote |
| GIS | {{ui:Coordinates}}, {{ui:Import}}, {{ui:Export}}, {{ui:Map}} | Weka mfumo wa viwianishi, ingiza na hamisha faili za GIS, onyesha tabaka za ramani chini ya mpango |
| Mwonekano | {{ui:Select}}, {{ui:Fit}}, {{ui:3D}} | Chagua na usogeze vitu; kuza kuonyesha kila kitu; onyesha eneo kwa 3D ([Tazama eneo kwa 3D](topic:site-3d)) |

Zana ya kuchora inabaki imebonyezwa wakati inafanya kazi. Kuibofya tena, kubonyeza {{key:Esc}} au kubonyeza {{key:V}} kunarudi kwenye {{ui:Select}}. {{ui:Undo}}, {{ui:Redo}}, {{ui:Copy}} na vitu vya {{ui:More}} vinakuwa kijivu vinapokosa kufanya kazi; kidokezo kinaeleza sababu (kwa mfano "Chagua nukta za upimaji kwanza"). Kila kitufe kimeorodheshwa kwenye [Marejeo ya upau wa zana](topic:toolbar).

Kwenye dirisha nyembamba upau wa zana unasogea pembeni.

## Paneli ya kushoto

### Eneo

- **Jina**: jina la mradi. Linataja kila faili unayohifadhi au kuhamisha na linachapishwa kwenye ukanda wa kichwa wa PDF.
- **Vipimo**: {{ui:US feet}} au {{ui:Metres}}. Hii inaeleza maana ya namba. Kubadilisha **hakubadilishi** viwianishi; tazama [Vipimo, vituo na miundo ya namba](topic:units-and-stations).

### Nukta

Ikiwa tupu, inakueleza jinsi ya kufungua faili ya nukta. Ikiwa na nukta, inaonyesha jina la faili, idadi ya nukta na zingapi zina mwinuko, kisha jedwali la **vikundi vya nukta**: mstari mmoja kwa kila neno la kwanza la maelezo (GRD, FL, TBS …), pamoja na hesabu na chaguo la **Uso**:

- {{ui:Points}}: nukta zinaingia kwenye uso (chaguo-msingi kwa kila kikundi).
- {{ui:Breakline}}: nukta za kikundi zinaunganishwa, kwa mpangilio wa namba za nukta, kuwa mstari mmoja wa kuvunja.
- {{ui:Left out}}: kikundi hakigusi uso.

### Uso

Takwimu za ardhi iliyopo: nukta, pembetatu, mwinuko wa chini kabisa na wa juu kabisa, mwinuko wa wastani, eneo la 2D na 3D, mistari ya kuvunja na kama kuna mpaka. Chini ya takwimu, kisanduku kinaorodhesha chochote ambacho mjenzi wa uso alilazimika kurekebisha au hakuweza kufanya. Kisha:

- **Ukingo mrefu zaidi wa nje**: 0 inahifadhi kila pembetatu ya nje; namba inakata pembetatu ndefu nyembamba kutoka nje.
- Viungo vinavyoonekana pale vinapohusika: {{ui:Remove the boundary}}, {{ui:Remove drawn breaklines}} na, kwa uso uliosomwa kutoka LandXML, {{ui:Rebuild the surface from the points}}.

### Onyesho

- **Uso**: {{ui:Existing ground}} au {{ui:Proposed (graded)}}. Ya pili inapatikana mara pedi au koridoo inapousawazisha bila matatizo.
- **Contours every**, **Major every** na **Bands** (idadi ya mikanda ya rangi).
- Visanduku vya kukagua: {{ui:Contours}}, {{ui:Contour labels}}, {{ui:Triangles}}, {{ui:Elevation bands}}, {{ui:Slope arrows}}, {{ui:Points}}, {{ui:Point labels}}, {{ui:Breaklines}}, {{ui:Surface edge}}, {{ui:Pipes}}.
- Hadithi ya mwinuko wa mikanda inaonekana mikanda ikiwa imewashwa.

Mipangilio ya onyesho inahifadhiwa pamoja na mradi lakini si hatua za kutendua: {{key:Mod+Z}} haiwahi kurudisha kisanduku cha kukagua.

## Mpango

Mpango unaonyesha nukta, uso na kila kitu unachokibuni, katika mwonekano wa juu na kaskazini juu. Gurudumu la kipanya kuza mahali kielekezi kilipo, buruta nafasi tupu kusogeza. Orodha kamili iko kwenye [Vitufe na kipanya](topic:keyboard).

- Kwenye mradi usio na kitu, kisanduku chenye kichwa **Anza na nukta za upimaji** kinaorodhesha hatua za kwanza na kutoa {{ui:Open the sample site}}.
- Kiboresho cha kuchora kikiwa hai, kidokezo juu ya mpango kinaeleza nini cha kubofya na jinsi ya kumaliza.
- Kuangusha faili juu ya mpango kunaonyesha "Angusha faili ya nukta, LandXML au mradi".
- Vitu vilivyochaguliwa vinaangaziwa. Mpangilio wa njia au pedi uliochaguliwa unaonyesha vishikio vya mraba kwenye PI zake au pembe zake; muundo uliochaguliwa unaonyesha kishikio kimoja. Buruta kishikio ili kusogeza.
- Nukta za upimaji zilizochaguliwa zina pete. {{key:Shift}} na bofya inaongeza au kuondoa nukta; {{key:Shift}} na buruta inachora kisanduku (au, ukizungusha kuzunguka, lasso) kinachoongeza nukta zilizo ndani yake. Tazama [Chagua, nakili na bandika nukta za upimaji](topic:copy-paste-points).

## Mwonekano wa wasifu

Bonyeza {{key:R}} au bofya {{ui:Profile}} kuufungua chini ya mpango. Upau wake una:

- orodha ya mipangilio ya njia (inawezeshwa mipangilio miwili au zaidi inapokuwepo)
- {{ui:Add PVIs}}: wakati umebonyezwa, bofya kwenye wasifu kuongeza PVI ({{key:I}} inabadilisha hali)
- kisomo cha kituo, ardhi, mwinuko wa muundo, mteremko na kukata au kujaza chini ya kielekezi
- kitufe cha kufunga

Wasifu unaonyesha ardhi iliyopo, wasifu wa muundo, mteremko kwenye kila tanjenti, kituo na mwinuko wa kila PVI, L na K ya kila mkunjo wa wima pamoja na BVC na EVC yake, pointi za juu na chini, na ukuzaji wima. Daima unatoshea mpangilio wote wa njia: haukuzi wala kusogea. Kusogeza kielekezi kando yake kunaweka nukta kwenye mpangilio wa njia kwenye mpango.

## Paneli ya kulia: Sifa

Kichwa chake kinasema kinachoonyesha.

- **Mradi** (hakuna kilichochaguliwa): mipangilio ya njia na pedi kama viungo, kizuizi cha **Kazi ya ardhi**, na kizuizi cha **Mtandao wa mabomba** pamoja na kanuni zake na matatizo yake.
- **Mpangilio wa njia**: jina, kituo cha kuanzia, urefu, jedwali la PI, mikunjo, jedwali la PVI na takwimu za wasifu wa muundo, na mipangilio ya **Koridoo**.
- **Pedi**: jina, mwinuko, miteremko ya kukata na kujaza, eneo, takwimu za mchana na kazi ya ardhi.
- **Muundo** au **Bomba**: ukubwa, kingo, mabomba ya chini, mteremko, kifuniko na matatizo yoyote.
- **Nukta** na namba yake: viwianishi vya nukta, mwinuko, maelezo na kundi (kwa kusoma tu).

Sehemu zinaanza kutumika ukibonyeza {{key:Enter}} au ukitoka kwenye sehemu. Thamani isiyokubaliwa inawekwa alama kuwa batili na hakuna kinachobadilika.

## Upau wa hali

- **E** na **N**: mashariki na kaskazini chini ya kielekezi.
- **Ardhi** mwinuko hapo (na **Iliyosawazishwa** pale pedi au koridoo ilipobadilisha), au "Nje ya uso".
- Mpangilio wa njia ulio karibu zaidi (au uliochaguliwa) pamoja na **Sta** na ofseti (**L** au **R**) chini ya kielekezi.
- Upande wa kulia, ujumbe: kilichotokea sasa hivi, au kwa nini kitu kilikataliwa. Ujumbe unafutika wenyewe baada ya sekunde chache.

## Visanduku vya mazungumzo

- **Ingiza nukta**: hufungua kwa kila faili ya nukta. Tazama [Ingiza nukta za upimaji](topic:import-points).
- **Chapisha mpango kwa PDF**: tazama [Chapisha mpango kwa PDF](topic:plot-pdf).
- **Mabadiliko ambayo hayajahifadhiwa**: inauliza kabla ya {{ui:New}} au kufungua mradi au faili ya LandXML kutupa kazi ambayo haijahifadhiwa. {{ui:Save a copy}} inapakua mradi kwanza.

## Skrini ndogo

Hadi pikseli 760 kwa upana, kama kwenye simu, mpango unahifadhi skrini: upau wa zana ni safu moja inayosogea pembeni, na paneli zinafunguka kama karatasi kutoka upau chini. {{ui:Tools}} inaficha upau wa zana, na {{ui:Move}} inauweka chini.
