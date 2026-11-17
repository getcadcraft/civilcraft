---
title: Vipimo, vituo na mpangilio wa namba
summary: Miradi ya futi na mita, jinsi vituo, miteremko, mielekeo, maeneo, ujazo na ukubwa wa bomba vinavyoandikwa na kuandikwa, na kinachotokea unapobadilisha vipimo.
keywords: andika urefu, hesabu, kikokotoo, jumla, sehemu, futi na inchi, 4+7/16, vipimo, futi, futi za US, mita, metri, metric, imperial, muundo wa kituo, kuweka vituo, mteremko, asilimia, mteremko wa pembeni, h:v, mielekeo, yadi za ujazo, kipenyo
from: 0b9b5b6b
---

## Vipimo vya mradi

Mradi uko kwenye **futi za US** au **mita** (**Vipimo** kwenye paneli ya kushoto). Kila kuratibu, mwinuko, urefu na kituo kwenye mradi viko kwenye kipimo hicho.

:::warning
Kubadilisha **Vipimo** kunabadilisha lebo, muundo wa kituo, thamani za awali na jinsi faili zinavyoandikwa. **Haibadilishi** namba yoyote. Eneo lililopimwa kwa futi na kubadilishwa kuwa mita linabaki na namba zilezile, sasa zikisomwa kama mita. Upau wa hali unasema "Vipimo sasa ni mita. Kuratibu hazikubadilishwa." Weka vipimo vilingane na data yako kabla ya kubuni.
:::

Vinavyotegemea vipimo:

| | Futi za US | Mita |
|---|---|---|
| Muundo wa kituo | `12+34.56` (vituo vya futi 100) | `1+234.567` (vituo vya mita 1000) |
| Vipindi vya kontua vinavyotolewa | 0.25 hadi 20 ft | 0.1 hadi 10 m |
| Eneo | sq ft | sq m |
| Ujazo | cu yd | cu m |
| Kipenyo cha bomba na muundo | inchi | milimita |
| Radiasi chaguo-msingi ya mkunjo | 100 ft | 30 m |
| Alama za vituo kwenye mpango | kila 50 ft, lebo kila 100 ft | kila 20 m, lebo kila 100 m |
| Skeli za uchapishaji | 1" = 5' hadi 1" = 1000' | 1:50 hadi 1:10000 |
| Kitengo cha urefu cha LandXML | USSurveyFoot | meter |

Mradi mpya unaanza kwa futi, au kwa mita ikiwa kitengo cha urefu kilicho na nyota kwenye {{ui:Settings}} › {{ui:General}} › {{ui:Units}} ni cha metric. Orodha ya **Vipimo** inaonyesha vitengo vilivyowashwa hapo, na kila mara vile vya mradi wenyewe. Kikiwa na kitengo cha eneo au ujazo kilicho na nyota hapo (ekari, hekta, ekari-futi …), maeneo na ujazo vinaripotiwa kwa kitengo hicho badala ya safu iliyo hapo juu. Tazama [Vipimo, thamani zilizoandikwa na orodha za vipimo](common:unit-lists).

Unapofungua LandXML, mradi unachukua vipimo vya faili. Faili ya futi za kimataifa inafunguka kama mradi wa futi; namba hazibadilishwi.

## Kuandika urefu na jumla

Sanduku lolote linalochukua urefu au mwinuko linasoma zaidi ya namba tupu: bonyeza {{key:Enter}} na sanduku linaonyesha matokeo kwenye vipimo vya mradi.

| Unaandika | Kwenye mradi wa futi | Kwenye mradi wa mita |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | urefu uleule kwa mita |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | kwa futi | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, na nyingine kwa futi za US survey | urefu uleule kwa mita |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | jumla, kwa futi | jumla, kwa mita |

Kipimo chochote cha urefu kutoka jedwali la vipimo vilivyoshirikiwa kinafanya kazi, kwa ukubwa wake halisi: futi za mradi ni futi za US survey, hivyo `10 US ft` ni 10 na `3 ch` (mnyororo wa futi za kimataifa) ni 197.9996. Tumia `+ - * /` na mabano, pamoja na `abs`, `round`, `ceil` na `floor`. Alama ya kistari iliyoandikwa ndani ya urefu ni sehemu yake (`24'-6"`, `6-1/2`); ikiwa kuna nafasi kuuzunguka, inatoa (`24' - 6"` = 23.5 ft). Namba tupu huzidisha au kugawanya urefu, na ni urefu katika vipimo vya mradi inapoongezwa kwa urefu. Ikiwa CivilCraft haiwezi kusoma ulichoandika, sanduku linawekwa alama na upau wa hali unaonyesha mahali.

Vituo si jumla: `10+00` kwenye sanduku la kituo ni kituo 10+00. Miteremko kwa asilimia, namba za nukta na maelezo vinasomwa jinsi vilivyo.

## Vituo

Kituo ni umbali kando ya mpangilio wa njia, unaoandikwa kwa alama ya kujumlisha:

- Futi: sehemu iliyo kabla ya + ni mamia ya futi. `12+34.56` ni 1,234.56 ft.
- Mita: sehemu iliyo kabla ya + ni maelfu ya mita. `1+234.567` ni 1,234.567 m.
- Vituo hasi vinabaki na alama ya minus mbele yake: `-0+50.00`.

Popote unapoandika kituo (**Kituo cha kuanzia**, **Kituo** cha PVI), unaweza kukiandika na + (`12+34.56`) au kama namba tupu (`1234.56`). Nafasi zinapuuzwa.

## Miteremko na mielekeo

- **Miteremko** (wasifu, mabomba, miteremko ya njia za magari na ya mabega) iko kwa asilimia: `+1.25%` inapanda kuelekea kituo kinachofuata, `-0.50%` inashuka.
- **Miteremko ya pembeni** (ukataji na ujazaji wa jukwaa, ukataji na ujazaji wa korido) ni mlalo kwa wima: `3` ina maana 3 : 1, yaani tatu kuvuka kwa moja juu au chini.
- **K** ya mkunjo wima ni urefu wake ugawanywe kwa mabadiliko ya miteremko kwa asilimia.

Mielekeo ni mielekeo ya robo kwa digrii, dakika na sekunde: `N 63°12'05" E`. Mikengeuko ya mikunjo (Δ) inatumia digrii, dakika na sekunde zilezile, pamoja na "kushoto" au "kulia".

## Miyumbo

Miyumbo kutoka mpangilio wa njia ni umbali ulio sawa nao, uliowekwa alama **L** (kushoto) au **R** (kulia) ukitazama kuelekea kituo kinachoongezeka.

## Onyesho la namba

- Kuratibu na miinuko vinaonyesha desimali 2 kwenye paneli na upau wa hali (3 kwa nukta ya upimaji iliyochaguliwa).
- Maeneo na ujazo vinapangwa kwa maelfu: `128,250 sq ft`, `454.9 cu yd`.
- Kuratibu hazipangwi kwa makundi kamwe, ili ziweze kunakiliwa jinsi zilivyo.

## Kuratibu

CivilCraft inafanya kazi kwenye ndege bapa: mashariki kuelekea kulia, kaskazini kuelekea juu. Kazi ya usanifu daima inafanyika kwenye kuratibu zilizopangwa (state plane, UTM au gridi ya eneo). Unaweza kuiambia CivilCraft ni mfumo gani wa kuratibu unaotumia, na kama ni kuratibu za gridi, za ardhi au za eneo; kisha inaonyesha latitudo na longitudo na kuweka faili za GIS na tabaka za ramani, lakini haibadilishi vipimo wala kusogeza kuratibu zako zenyewe. Tazama [Weka mfumo wa kuratibu wa mradi](topic:coordinate-systems) na [Kuratibu za ardhi na za eneo](topic:ground-and-local-coordinates). Thamani kubwa za state plane (mamilioni ya futi) ni sawa; CivilCraft inafanya kazi kulingana na eneo la ndani ili kuhifadhi usahihi.
