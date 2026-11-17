---
title: Faili unazoweza kufungua, kuhifadhi na kueksporti
summary: Ingiza faili za pointi, LandXML na miradi ya CivilCraft; miradi, LandXML, DXF na PDF hutoka; kila faili huhifadhi nini, faili zinaenda wapi, na nini hubadilika nje ya mtandao.
keywords: fungua, hifadhi, eksporti, ingiza, aina za faili, csv, txt, landxml, xml, dxf, pdf, json, pakua, faili ya mradi
from: 82bff559
---

CivilCraft hufungua faili kutoka kwenye kompyuta yako na huhifadhi kwa kupakua faili kurudi kwenye kompyuta. Hakuna kinachopakiwa na hakuna kinachowekwa kwenye seva. Tazama pia [Faili zako](common:your-files).

## Inachofungua

Bofya {{ui:Open}} (au bonyeza {{key:Mod+O}}) kisha uchague faili, au buruta faili kutoka {{pick:mac=Finder|windows=File Explorer|linux=kidhibiti chako cha faili}} hadi kwenye mpango. Faili moja kwa wakati; faili zilizozidi 200 MB zinakataliwa. Faili ya LandXML au ya mradi yenye zaidi ya 32 MB husomwa kwa vipande vya takriban 4 MB, si kama kipande kimoja cha maandishi; wakati LandXML inafunguka, tarajia itatumia takriban mara 13 ya ukubwa wa faili kwenye kumbukumbu (faili ya 69 MB ilitumia takriban 0.9 GB katika jaribio letu).

| Aina | Majina ya faili | Kinachotokea |
|---|---|---|
| Faili ya pointi | `.csv`, `.txt`, `.pnt`, `.xyz` (faili yoyote ya maandishi) | Kisanduku cha **Ingiza pointi** kinafunguka. Pointi zinachukua nafasi ya pointi za mradi; mipangilio ya njia, pedi na mabomba inabaki. |
| LandXML | `.xml`, `.landxml` | **Mradi mpya** unatengenezwa kutoka faili (utaulizwa kwanza ikiwa uliopo una mabadiliko ambayo hayajahifadhiwa). |
| Mradi wa CivilCraft | `.civilcraft.json` (`.json` yoyote) | Mradi unafunguka kama ulivyohifadhiwa (utaulizwa kwanza ikiwa uliopo una mabadiliko ambayo hayajahifadhiwa). |

CivilCraft huamua kwa mwisho wa faili, kisha kwa herufi zake za kwanza: maandishi yanayoanza na `{` husomwa kama mradi, yanayoanza na `<` kama LandXML, na mengine yote kama faili ya pointi. Faili ambayo kisanduku cha kufungua kinaizima bado inaweza kuachwa kwenye mpango.

:::note
Kuingiza faili ya pointi kwenye mradi ambao tayari una pointi kunabadilisha pointi hizo bila kuuliza, na kunafuta historia ya kutendua (kufungua faili yoyote ni mwanzo mpya wa kutendua). Ikiwa uso ulitoka kwenye LandXML, kuingiza pointi kunaubadilisha urudi kuwa uso uliojengwa kutoka kwa pointi. Hifadhi kwanza ikiwa unaweza kutaka pointi za zamani tena.
:::

Maelezo zaidi: [Miundo ya faili ya pointi](topic:point-file-formats), [LandXML: kinachosomwa na kuandikwa](topic:landxml-reference).

## Inachohifadhi

{{ui:Save}} ({{key:Mod+S}}) huandika faili mbili pamoja, zikiitwa kwa jina la **Jina** kwenye paneli ya kushoto: `<name>.civilcraft.json`, mradi unaoendelea kuuhariri, na `<name>.ifc`, muundo huo huo wa IFC 4.3 kwa programu nyingine (tazama [Eksporti na uingizaji wa IFC](topic:ifc)). Kila faili inarekodi nyingine, na IFC pia hubeba nakala iliyobanwa ya mradi, kwa hiyo IFC iliyotumwa peke yake bado inafunguka ikiwa kamili na inaweza kuhaririwa.

- **Katika Studio** faili zote mbili zinaandikwa karibu kwa karibu, papo hapo.
- **Katika Chrome na Edge** hifadhi ya kwanza inauliza folda na kuandika zote mbili ndani yake; hifadhi zinazofuata zinaenda kwenye folda hiyo hiyo. Ghairi swali la folda ili kupakua zote mbili badala yake.
- **Katika vivinjari vingine** faili zote mbili zinapakuliwa, ile ya mradi kwanza.

Kufungua faili yoyote kunatafuta nyingine. Fungua zote mbili pamoja (au ziburuta pamoja), au fungua moja: katika Studio nyingine inapatikana kwenye folda hiyo hiyo; kwenye kivinjari CivilCraft inakuuliza uiongeze, au uendelee na moja uliyonayo. Ikiwa IFC ilibadilishwa na programu nyingine baada ya CivilCraft kuihifadhi, au faili moja ni kongwe kuliko nyingine, mradi unafunguka kutoka muundo mpya zaidi na paneli ya Matatizo inaeleza kilichotokea, pamoja na **Hifadhi sasa** (huandika faili zote mbili tena) na **Onyesha jiometri ya IFC kama marejeo**. IFC pekee iliyobadilishwa na programu nyingine inafunguka kutoka nakala yake ya mradi ikiwa na kile kinachoendana bado: mipangilio ya njia iliyobadilishwa inachukua jiometri yake, vitu ilivyoviondoa vinaachwa nje, na mabadiliko mengine yameorodheshwa, si kuchukuliwa. Faili ya mradi kutoka kabla ya 0.7.1 inafunguka kama zamani.

Faili ya mradi huhifadhi:

- kila pointi (nambari, viwianishi, mwinuko, maelezo) na jina la faili ya pointi zilikotoka
- mipangilio ya uso: chaguo za vikundi, mistari ya kuvunja iliyochorwa, mpaka, ukingo mrefu zaidi wa nje, na TIN iliyosomwa kutoka LandXML
- mipangilio ya onyesho
- mipangilio ya njia yenye PI zake, radii na station ya kuanzia, wasifu wake wa usanifu (PVI na urefu wa mikunjo) na mipangilio ya korido
- pedi na mtandao wa mabomba pamoja na kanuni zake

Haihifadhi historia ya kutendua. Nyuso, kontua, mistari ya mchana na ujazo hazihifadhiwi; hujengwa upya kutoka kwa ingizo zilizohifadhiwa mradi unapofunguka. Faili ya mradi kutoka CivilCraft mpya zaidi inakataliwa kwa ujumbe unaotaja toleo lake.

## Inachoeksporti

| Kitufe | Faili | Yaliyomo |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: pointi, ardhi iliyopo (na uso uliopangwa ikiwa upo) kama nyuso za TIN, mipangilio ya njia, wasifu wa ardhi na wa usanifu, mtandao wa mabomba |
| {{ui:DXF}} | `<name>.dxf` | DXF R12 ya mistari ya mpango kama inavyoonyeshwa, kwenye tabaka zenye majina |
| {{ui:DWG}} | `<name>.dwg` | Mistari hiyo hiyo kama mchoro wa DWG, katika muundo utakaochagua (2000 hadi 2018) |
| {{ui:PDF}} | `<name>.pdf` | Chapisho la vekta la mpango kwenye karatasi, kwa skeli utakayochagua |
| {{ui:GLB}} au {{ui:OBJ}} (kwenye upau wa mwonekano wa 3D) | `<name>-3d.glb`, `<name>-3d.obj` | Kile mwonekano wa 3D unaonyesha kama modeli ya 3D: mita, Y juu, skeli halisi, kuzunguka asili ya eneo iliyorekodiwa |

Kile kila moja linaacha nje: [LandXML ya kubadilishana](topic:landxml), [Eksporti mpango kwenda DXF](topic:dxf-export) (DWG pia), [Chapisha mpango kuwa PDF](topic:plot-pdf), [Eksporti eneo kwenda 3D](topic:export-3d).

## Mahali faili zinapoenda

Faili zilizohifadhiwa na kueksportiwa huenda popote kivinjari chako kinapoweka vipakuliwa, kwa kawaida folda ya Downloads. Ili kuchagua folda kila wakati:

:::chromium
Fungua **Mipangilio** ya kivinjari, kisha **Vipakuliwa**, na uwashe **Uliza mahali pa kuhifadhi kila faili kabla ya kupakua**.
:::

:::firefox
Fungua **Mipangilio**, kisha **Jumla**, na chini ya **Faili na Programu** chagua **Niulize kila mara mahali pa kuhifadhi faili**.
:::

:::safari
Fungua **Safari > Mipangilio > Jumla** na uweke **Mahali pa kupakua faili** kuwa **Uliza kwa kila upakuaji**.
:::

Ukihifadhi mara mbili kwa jina moja, kivinjari kinaweza kuongeza nambari kwenye faili ya pili, kwa mfano `Site (1).civilcraft.json`. Fungua ile mpya zaidi wakati ujao.

## Mtandaoni na nje ya mtandao

CivilCraft hufanya kazi kwenye kompyuta yako tu kwa njia zote mbili: kufungua husoma faili kwenye kivinjari, kuhifadhi hupakua faili. Ili kufungua CivilCraft bila muunganisho kabisa, ihifadhi kwa matumizi ya nje ya mtandao kwanza:

1. Ukiwa mtandaoni, bofya {{ui:Save for offline}} kwenye upau wa programu juu.
2. Kitufe kinahesabu juu ("Inahifadhi 12 kati ya 30") kisha kinaonyesha {{ui:Offline ready}}. CivilCraft ni ndogo (takriban 0.6 MB), kwa hiyo hii inachukua muda kidogo. Nakala iliyohifadhiwa inajumuisha msaada huu na tovuti ya mfano.
3. Bila muunganisho, fungua anwani ile ile (au alamisho yake). Kila kitu kinafanya kazi, pamoja na {{ui:Fungua tovuti ya mfano}}.

Hali nyingine za kitufe:

- {{ui:Could not save}}: baadhi ya faili hazikupakuliwa. Angalia muunganisho na ubofye ili ujaribu tena.
- {{ui:Offline not available}}: dirisha hili la kivinjari haliwezi kuweka nakala ya nje ya mtandao (madirisha ya faragha na baadhi ya kompyuta zinazosimamiwa huzuia). Tumia dirisha la kawaida.

Bofya {{ui:Offline ready}} kuona wakati nakala ilihifadhiwa, pamoja na chaguo mbili: {{ui:Save again (get the newest version)}} na {{ui:Remove the offline copy}}. Hifadhi tena kabla ya ziara ya eneo ili nakala ilingane na toleo jipya zaidi. Zaidi katika [Nje ya mtandao](common:offline).

:::offline
Sasa hivi uko nje ya mtandao. Ikiwa CivilCraft ilihifadhiwa kwa matumizi ya nje ya mtandao, kila kitu kinafanya kazi, pamoja na tovuti ya mfano. Ikiwa haikuhifadhiwa, endelea kufanya kazi kwenye kichupo hiki, lakini usipakie upya hadi uwe mtandaoni tena; bila nakala iliyohifadhiwa, {{ui:Fungua tovuti ya mfano}} inashindwa na ujumbe "Sampuli haikuweza kupakiwa".
:::

:::tip
Kwa matumizi shambani, hifadhi CivilCraft kwa matumizi ya nje ya mtandao na beba faili zako za pointi kwenye kompyuta ndogo yenyewe. Miradi na eksporti huhifadhiwa kama vipakuliwa bila muunganisho, kwa hiyo unaweza kuingiza vipimo vya siku, kukagua uso na kuhifadhi mradi shambani.
:::

Kuhifadhi mradi mtandaoni bado hakupatikani, na programu za eneo-kazi bado hazijatoka. Kwa sasa, faili unazohifadhi ndizo nakala pekee: zihifadhi mahali panapohifadhiwa nakala.

## Viongezi vinavyotumiwa na faili

Unapohifadhi mradi wenye data kutoka kwa kiongezi (visanduku vya Kanuni za ujenzi, au chanzo cha Anwani hadi eneo), faili hurekodi viongezi vipi na matoleo yao. Ukiifungua kwenye kompyuta isiyo nacho, upau juu ya mpango unasema hivyo na unatoa kukiongeza kutoka orodha ya akaunti yako. Rekodi ni dokezo tu: faili hufunguka kwa vyovyote vile.

## Tendua kutoka Studio

Ndani ya CadCraft Studio, kila hatua unayomaliza katika CivilCraft inaambiwa Studio, kwa hiyo kutendua kwa kiwango cha mradi kwake kunaweza kurudisha hatua ya mwisho kati ya programu. Studio hutendua hatua tu wakati rafu ya kutendua ya CivilCraft iko kama hatua hiyo ilivyoiacha; baada ya kufungua faili nyingine inaruka dirisha hili.

## Kufunga na mabadiliko ambayo hayajahifadhiwa

Mradi ukiwa na mabadiliko ambayo hayajahifadhiwa na ukifunga kichupo, ukipakia upya, au kuondoka kwenye ukurasa, kivinjari kinauliza kama unataka kuondoka. Maneno na muonekano wake ni wa kivinjari, na CivilCraft haiwezi kuvibadilisha. {{ui:New}}, na kufungua mradi au faili ya LandXML, zinauliza kwenye kisanduku cha **Mabadiliko ambayo hayajahifadhiwa** cha CivilCraft chenyewe, chenye {{ui:Cancel}}, {{ui:Don’t save}} na {{ui:Save a copy}}.
