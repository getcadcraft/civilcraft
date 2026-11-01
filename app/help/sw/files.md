---
title: Faili unazoweza kufungua, kuhifadhi na kuhamisha
summary: Ingiza faili za nukta, LandXML na miradi ya CivilCraft; hamisha miradi, LandXML, DXF na PDF; kinachohifadhiwa na kila faili, mahali faili zinapoenda, na kinachobadilika nje ya mtandao.
keywords: fungua, hifadhi, hamisha, ingiza, miundo ya faili, csv, txt, landxml, xml, dxf, pdf, json, pakua, faili ya mradi
from: a7debb61
---

CivilCraft hufungua faili kutoka kwenye kompyuta yako na huhifadhi kwa kupakua faili kurudi kwenye kompyuta. Hakuna kinachopakiwa na hakuna kinachohifadhiwa kwenye seva. Tazama pia [Faili zako](common:your-files).

## Inachofungua

Bofya {{ui:Open}} (au bonyeza {{key:Mod+O}}) kisha uchague faili, au buruta faili kutoka {{pick:mac=Finder|windows=File Explorer|linux=kidhibiti chako cha faili}} hadi kwenye mpango. Faili moja kwa wakati mmoja; faili zilizo zaidi ya 200 MB zinakataliwa.

| Aina | Majina ya faili | Kinachotokea |
|---|---|---|
| Faili ya nukta | `.csv`, `.txt`, `.pnt`, `.xyz` (faili yoyote ya maandishi) | Kisanduku cha **Ingiza nukta** kinafunguka. Nukta zinachukua nafasi ya nukta za mradi; mipangilio ya njia, pedi na mabomba vinabaki. |
| LandXML | `.xml`, `.landxml` | **Mradi mpya** unatengenezwa kutoka kwenye faili (utaulizwa kwanza ikiwa mradi wa sasa una mabadiliko ambayo hayajahifadhiwa). |
| Mradi wa CivilCraft | `.civilcraft.json` (`.json` yoyote) | Mradi unafunguka kama ulivyohifadhiwa (utaulizwa kwanza ikiwa mradi wa sasa una mabadiliko ambayo hayajahifadhiwa). |

CivilCraft huamua kwa kuangalia mwisho wa jina la faili, kisha herufi zake za kwanza: maandishi yanayoanza na `{` yanasomwa kama mradi, yanayoanza na `<` kama LandXML, na mengine yote kama faili ya nukta. Faili ambayo kisanduku cha kufungua kinaiotesha kijivu bado inaweza kuangushwa kwenye mpango.

:::note
Kuingiza faili ya nukta kwenye mradi ambao tayari una nukta kunabadilisha nukta hizo bila kuuliza, na kunafuta historia ya kutendua (kufungua faili yoyote ni mwanzo mpya wa kutendua). Ikiwa uso ulitoka kwenye LandXML, kuingiza nukta kunabadilisha uso kuwa uso uliojengwa kutoka kwenye nukta. Hifadhi kwanza ikiwa unaweza kutaka nukta za zamani baadaye.
:::

Maelezo: [Miundo ya faili za nukta](topic:point-file-formats), [LandXML: kinachosomwa na kinachoandikwa](topic:landxml-reference).

## Inachohifadhi

{{ui:Save}} ({{key:Mod+S}}) huandika faili mbili pamoja, zikipewa jina kulingana na **Name** kwenye paneli ya kushoto: `<jina>.civilcraft.json`, mradi unaoendelea kuuhariri, na `<jina>.ifc`, muundo uleule wa usanifu kama IFC 4.3 kwa programu nyingine (tazama [Usafirishaji na uingizaji wa IFC](topic:ifc)). Kila faili inataja nyingine, na IFC pia ina nakala iliyobanwa ya mradi, kwa hiyo IFC inayotumwa peke yake bado inafunguka ikiwa kamili na inaweza kuhaririwa.

- **Katika Studio** faili zote mbili zinaandikwa pamoja, mahali pamoja.
- **Katika Chrome na Edge** uhifadhi wa kwanza unauliza folda na kuandika zote mbili ndani yake; uhifadhi unaofuata unaenda kwenye folda ileile. Ghairi swali la folda ili badala yake zote mbili zipakuliwe.
- **Katika vivinjari vingine** faili zote mbili zinapakuliwa, faili ya mradi kwanza.

Kufungua faili yoyote kunatafuta nyingine. Fungua zote mbili pamoja (au ziangushe pamoja), au fungua moja: katika Studio nyingine inapatikana kwenye folda ileile; kwenye kivinjari CivilCraft inakuuliza uiongeze, au uendelee na moja uliyo nayo. Ikiwa IFC ilibadilishwa na programu nyingine baada ya CivilCraft kuihifadhi, au faili moja ni ya zamani kuliko nyingine, mradi unafunguka kutoka muundo mpya zaidi na kidirisha cha Matatizo kinaeleza kilichotokea, pamoja na **Hifadhi sasa** (huandika faili zote mbili tena) na **Onyesha jiometri ya IFC kama marejeo**. IFC peke yake ambayo programu nyingine imeibadilisha inafunguka kutoka nakala yake ya mradi pamoja na kile kinachoendana: mipangilio ya njia iliyobadilishwa inachukua jiometri yake, vitu ilivyoviondoa vinaachwa, na mabadiliko mengine yanaorodheshwa lakini hayakubaliwi. Faili ya mradi kutoka kabla ya 0.7.1 inafunguka kama zamani.

Faili ya mradi inahifadhi:

- kila nukta (nambari, viwianishi, mwinuko, maelezo) na jina la faili ya nukta zilikotoka
- mipangilio ya uso: chaguo za vikundi, mistari ya kuvunja iliyochorwa, mpaka, ukingo mrefu zaidi wa nje, na TIN iliyosomwa kutoka LandXML
- mipangilio ya onyesho
- mipangilio ya njia pamoja na PI zake, radii na kituo cha kuanzia, wasifu wake wa muundo (PVI na urefu wa mikunjo) na mipangilio ya koridoo
- pedi na mtandao wa mabomba pamoja na kanuni zake

Haihifadhi historia ya kutendua. Nyuso, kontua, mistari ya mchana na ujazo havihifadhiwi; vinajengwa upya kutoka kwenye ingizo zilizohifadhiwa mradi unapofunguka. Faili ya mradi kutoka CivilCraft mpya zaidi inakataliwa kwa ujumbe unaotaja toleo lake.

## Inachohamisha

| Kitufe | Faili | Maudhui |
|---|---|---|
| {{ui:LandXML}} | `<jina>.xml` | LandXML 1.2: nukta, ardhi iliyopo (na uso uliosawazishwa pale ulipo) kama nyuso za TIN, mipangilio ya njia, wasifu wa ardhi na wa muundo, mtandao wa mabomba |
| {{ui:DXF}} | `<jina>.dxf` | R12 DXF ya mistari ya mpango kama inavyoonyeshwa, kwenye tabaka zenye majina |
| {{ui:DWG}} | `<jina>.dwg` | Mistari ileile kama mchoro wa DWG, katika muundo utakaochagua (2000 hadi 2018) |
| {{ui:PDF}} | `<jina>.pdf` | Chapisho la vekta la mpango kwenye karatasi, kwa kipimo utakachochagua |
| {{ui:GLB}} au {{ui:OBJ}} (kwenye upau wa mwonekano wa 3D) | `<jina>-3d.glb`, `<jina>-3d.obj` | Kinachoonyeshwa na mwonekano wa 3D kama modeli ya 3D: mita, Y juu, kipimo halisi, kuzunguka asili ya eneo ya ndani iliyorekodiwa |

Kila moja inaacha nje nini: [Kubadilishana LandXML](topic:landxml), [Hamisha mpango kwenda DXF](topic:dxf-export) (DWG pia), [Chapisha mpango kwenda PDF](topic:plot-pdf), [Hamisha eneo kwa 3D](topic:export-3d).

## Faili zinakwenda wapi

Faili zilizohifadhiwa na kuhamishwa zinakwenda popote kivinjari chako kinapoweka vipakuliwa, kwa kawaida folda ya Vipakuliwa. Ili kuchagua folda kila wakati:

:::chromium
Fungua **Mipangilio** ya kivinjari, kisha **Vipakuliwa**, na uwashe **Uliza mahali pa kuhifadhi kila faili kabla ya kupakua**.
:::

:::firefox
Fungua **Mipangilio**, kisha **Kwa ujumla**, na chini ya **Faili na Programu** chagua **Niulize kila mara mahali pa kuhifadhi faili**.
:::

:::safari
Fungua **Safari > Mipangilio > Kwa ujumla** na uweke **Mahali pa kupakua faili** kuwa **Uliza kwa kila upakuaji**.
:::

Ukihifadhi mara mbili kwa jina moja, kivinjari kinaweza kuongeza nambari kwenye faili ya pili, kwa mfano `Eneo (1).civilcraft.json`. Fungua ile mpya zaidi wakati ujao.

## Mtandaoni na nje ya mtandao

CivilCraft inafanya kazi kwenye kompyuta yako kwa njia zote mbili: kufungua kunasoma faili kwenye kivinjari, kuhifadhi kunaipakua. Ili kufungua CivilCraft bila muunganisho kabisa, ihifadhi kwanza kwa matumizi ya nje ya mtandao:

1. Ukiwa mtandaoni, bofya {{ui:Save for offline}} kwenye upau wa programu juu.
2. Kitufe kinahesabu ("Inahifadhi 12 kati ya 30") kisha kinaonyesha {{ui:Offline ready}}. CivilCraft ni ndogo (karibu 0.6 MB), kwa hiyo hii inachukua muda kidogo. Nakala iliyohifadhiwa inajumuisha msaada huu na eneo la mfano.
3. Bila muunganisho, fungua anwani ile ile (au alamisho yake). Kila kitu kinafanya kazi, ikiwemo {{ui:Open the sample site}}.

Hali nyingine za kitufe:

- {{ui:Could not save}}: baadhi ya faili hazikupakuliwa. Angalia muunganisho na ubofye tena ili ujaribu.
- {{ui:Offline not available}}: dirisha hili la kivinjari haliwezi kuweka nakala ya nje ya mtandao (madirisha binafsi na baadhi ya kompyuta zinazosimamiwa vinazuia). Tumia dirisha la kawaida.

Bofya {{ui:Offline ready}} kuona wakati nakala ilihifadhiwa, pamoja na chaguo mbili: {{ui:Save again (get the newest version)}} na {{ui:Remove the offline copy}}. Hifadhi tena kabla ya ziara ya eneo ili nakala ilingane na toleo jipya zaidi. Maelezo zaidi katika [Nje ya mtandao](common:offline).

:::offline
Sasa uko nje ya mtandao. Ikiwa CivilCraft ilihifadhiwa kwa matumizi ya nje ya mtandao, kila kitu kinafanya kazi, ikiwemo eneo la mfano. Ikiwa haikuhifadhiwa, endelea kufanya kazi kwenye kichupo hiki, lakini usikipakie upya hadi uwe mtandaoni tena; bila nakala iliyohifadhiwa, {{ui:Open the sample site}} inashindwa na ujumbe "Sampuli haikuweza kupakiwa".
:::

:::tip
Kwa matumizi shambani, hifadhi CivilCraft kwa matumizi ya nje ya mtandao na ulete faili zako za nukta moja kwa moja kwenye kompyuta ndogo. Miradi na hamisho zinahifadhiwa kama vipakuliwa bila muunganisho, kwa hiyo unaweza kuingiza vipimo vya siku, kukagua uso, na kuhifadhi mradi shambani.
:::

Uhifadhi wa wingu bado haupatikani, na matoleo ya eneo-kazi bado hayajatoka. Kwa sasa, faili unazohifadhi ndizo nakala pekee: ziweke mahali panapohifadhiwa nakala rudufu.

## Viongezi ambavyo faili inavitumia

Unapohifadhi mradi wenye data kutoka kwenye kiongezi (visanduku vya Kanuni za ujenzi, au chanzo cha Anwani hadi eneo), faili inarekodi viongezi na matoleo yake. Ukiifungua kwenye kompyuta isiyokuwa nacho, upau juu ya mpango unasema hivyo na unatoa kukiongeza kutoka orodha ya akaunti yako. Rekodi ni dokezo tu: faili inafunguka hata hivyo.

## Kutendua kutoka Studio

Ndani ya CadCraft Studio, kila hatua unayoimaliza kwenye CivilCraft inaarifiwa kwa Studio, kwa hiyo kutendua kwa kiwango cha mradi kunaweza kurudisha hatua ya mwisho kwenye programu zote. Studio inatendua hatua tu pale rafu ya kutendua ya CivilCraft ilipo kama hatua ile ilivyoiacha; ukifungua faili nyingine, inaruka dirisha hili.

## Kufunga kukiwa na mabadiliko ambayo hayajahifadhiwa

Mradi ukiwa na mabadiliko ambayo hayajahifadhiwa na ukifunga kichupo, kupakia upya, au kuondoka kwenye ukurasa, kivinjari kinauliza kama unataka kuondoka. Maneno na mwonekano wake ni vya kivinjari, na CivilCraft haiwezi kuvibadilisha. {{ui:New}}, pamoja na kufungua mradi au faili ya LandXML, vinauliza badala yake kwenye kisanduku cha **Mabadiliko ambayo hayajahifadhiwa** cha CivilCraft chenyewe, chenye {{ui:Cancel}}, {{ui:Don’t save}} na {{ui:Save a copy}}.
