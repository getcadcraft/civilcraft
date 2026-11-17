---
title: Panga mpangilio wa mlalo wa njia
summary: Chora mpangilio kwa PI zake, weka radius za mikunjo na kituo cha kuanzia, sogeza PI, na usome data ya mikunjo pamoja na kituo na mkengeuko.
keywords: mpangilio wa njia, hakuna suluhisho, mkunjo hauingii, radius kubwa zaidi, radius ndogo zaidi, radius ya chini, kasi ya usanifu, mwingiliano, mstari wa katikati, pi, mkunjo wa mlalo, radius, kuweka vituo, tanjenti, unda mpangilio, mpangilio wa mlalo, pc, pt, kituo na mkengeuko
from: 8c5df4aa
---

Mpangilio wa njia katika CivilCraft ni mnyororo wa tanjenti zinazopitia pointi za makutano (PI), kukiwa na mkunjo wa duara katika PI yoyote ya ndani yenye radius. Unapewa vituo kuanzia kituo cha kuanzia unachochagua. Mradi mmoja unaweza kuwa na mipangilio mingi.

## Chora mpangilio

1. Bonyeza {{key:A}}, au bofya {{ui:Mpangilio wa njia}} katika kundi la **Usanifu**.
   Kidokezo kinasema "Mpangilio wa njia: bofya PI kwa mpangilio. Enter au bofya mara mbili kumaliza, Backspace huondoa ya mwisho, Esc hughairi."
2. Bofya PI ya kwanza (mwanzo wa mpangilio).
3. Bofya kila PI inayofuata kwa mpangilio. Mstari mwekundu hufuata kielekezi na kuonyesha urefu na mwelekeo wa tanjenti unayoichora, kwa mfano "212.40 ft  N 63°12'05" E".
4. Bofya PI ya mwisho (mwisho wa mpangilio).
5. Bonyeza {{key:Enter}}.
   Mpangilio unachorwa na vituo vyake na unachaguliwa. Upau wa hali unasema, kwa mfano, "Mpangilio 1: 386.36 ft, mikunjo ya radius 100 ft pale inapoingia. Hariri radius katika Sifa; Wasifu wa urefu (R) kubuni mteremko wake."

Wakati wa kuchora: {{key:Backspace}} huondoa PI ya mwisho, {{key:Esc}} hughairi, na kuburuta kwenye nafasi tupu husogeza mwonekano bila kuongeza PI.

:::warning
Maliza kwa {{key:Enter}}. Kubofya mara mbili pia kunamaliza, lakini katika toleo hili hudondosha PI uliyobofya mara mbili. Bofya PI ya mwisho mara moja, kisha bonyeza {{key:Enter}}.
:::

Kila PI ya ndani hupata mkunjo wa 100 ft (30 m katika mradi wa mita), au radius kubwa zaidi nzima inayoingia katika nusu ya kila tanjenti ikiwa 100 ft haiingii. PI kali sana au zilizonyooka moja kwa moja hazipati mkunjo.

## Weka radius na kuratibu

Mpangilio ukichaguliwa, paneli ya kulia inaonyesha **Mpangilio wa njia**:

1. **Jina** na **Kituo cha kuanzia**. Andika kituo kama `10+00` (futi) au `0+500` (mita), au kama nambari tupu. Tazama [Vipimo, vituo na miundo ya nambari](topic:units-and-stations).
2. **Urefu** na **Kituo cha mwisho** vinahesabiwa kwa ajili yako.
3. Jedwali la **PI** linaorodhesha **Mashariki** na **Kaskazini** ya kila PI, na **Radius** kwa kila PI ya ndani. Andika thamani mpya kisha bonyeza {{key:Enter}}.
   - Radius ya 0 hufanya PI ya pembe bila mkunjo.
   - PI ya kwanza na ya mwisho hazina radius kamwe.
   - Alama ndogo ya x mwishoni mwa safu huondoa PI hiyo (mpangilio hubaki na angalau mbili).
4. Soma orodha ya **Mikunjo**: kwa kila mkunjo, vituo vyake vya PC na PT, radius R, mkengeuko wa pembe Δ na mwelekeo (kushoto au kulia), urefu L, tanjenti T, umbali wa nje E na chord.
5. Mstari chini ya mikunjo unatoa mwelekeo wa tanjenti ya kwanza.

## Mkunjo usipoingia

Mikunjo ikihitaji tanjenti zaidi ya iliyopo kati ya PI zao, mpangilio hauna suluhisho: haujachorwa kwa usahihi hadi uurekebishe, na unaachwa nje ya mauzo ya LandXML. Kisanduku chekundu kinaeleza kwa nambari kwa nini, na kinatoa kile kitakachoingia:

- "Mikunjo kwenye PI 2 na PI 3 inahitaji 240.00 ft ya tanjenti kati yao (130.00 + 110.00), lakini PI ziko umbali wa 180.00 ft." — au, pale mkunjo mmoja tu upo, "Mkunjo kwenye PI 2 unahitaji 240.00 ft ya tanjenti kuelekea PI 1 …".
- Kitufe kwa kila PI huweka **radius kubwa zaidi inayoingia** hapo, huku mkunjo mwingine ukibaki kama ulivyo (pia lazima liingie katika tanjenti nyingine ya PI). Pale PI zote mbili zina mikunjo, **Zote mbili** hupunguza radius zote mbili kwa uwiano ili zikutane tu.
- Mkunjo mmoja ukiwa mrefu kuliko tanjenti peke yake, kisanduku kinasema kwamba hakuna mkunjo kwenye PI nyingine unaoweza kuingia wakati ule ni mkubwa.
- PI inayogeuka moja kwa moja nyuma haiwezi kupokea mkunjo; kisanduku kinatoa **Hakuna mkunjo kwenye PI n**.

Kila kitufe ni hatua moja: {{key:Mod+Z}} hurejesha radius za awali. Radius zinazopendekezwa hushushwa hadi 0.01 ili ziingie kila wakati.

### Radius ya chini ya usanifu

Andika **Radius ya chini ya usanifu** (kwa mfano kutokana na kasi yako ya usanifu) ili kila mkunjo uangaliwe dhidi yake; iache tupu kama hakuna. Mkunjo ulio chini yake huorodheshwa na kitufe cha **radius ndogo zaidi inayotimiza kiwango cha chini**, pale radius hiyo inapoingia. Isipoingia, kisanduku kinasema hivyo na kutoa radius kubwa zaidi ambayo tanjenti zinaruhusu, ili ujue kusogeza PI au kupunguza kiwango cha chini.

## Sogeza PI kwenye mpango

1. Kikiwa {{ui:Chagua}} kimewashwa, bofya mpangilio ili kuuchagua. Vishikio vya mraba vinaonekana kwenye PI zake.
2. Buruta kishikio. Mpangilio, vituo vyake, wasifu na ukanda vinafuata.
3. Achia. Hatua hiyo ni hatua moja ya kutendua.

Kuongeza PI kati ya mbili zilizopo bado hakupatikani: ondoa mpangilio na uuchore upya, au andika kuratibu mpya za PI ulizonazo.

## Soma kituo na mkengeuko

Sogeza kielekezi juu ya mpango. Upau wa hali unaonyesha mpangilio ulio karibu zaidi (au ule uliochaguliwa) pamoja na kituo na mkengeuko, **L** au **R** ukiangalia kuelekea kituo kinachofuata, kwa mfano "Mpangilio 1: Sta 2+15.30, mkengeuko 18.42 R". Nje ya ncha yoyote, huongeza "(nje ya mwisho)".

## Kinachochorwa

Kwenye mpango, katika DXF na PDF: mstari wa katikati (tanjenti kama mistari, mikunjo kama tao halisi), alama ndogo kila 50 ft (20 m) pamoja na alama ndefu zaidi na lebo ya kituo kila vitengo 100, na alama za PC na PT zenye lebo za vituo vyake.

## Futa mpangilio

Chagua mpangilio kisha bonyeza {{key:Delete}}, au bofya {{ui:Futa}} kwenye upau wa zana au chini kabisa ya paneli ya kulia. Wasifu wake na ukanda wake vinafutwa pamoja nao. {{key:Mod+Z}} huirejesha.

:::mac
Kwenye kibodi ya Mac, kitufe chenye jina **delete** ni {{key:Backspace}} kwa kivinjari na hakifuti kitu kilichochaguliwa. Bonyeza {{key:Delete}} (Fn na delete), au tumia kitufe cha {{ui:Futa}}.
:::

## Ifuatayo

- [Sanifu wasifu wima](topic:profile).

## Kasi na daraja la usanifu

Chini ya Sifa za mpangilio, **Kasi ya usanifu** (km/h au mph) na **Daraja la usanifu** vinahifadhiwa pamoja na mpangilio, vinahifadhiwa katika mradi na kuandikwa kwenye IFC (Pset_RoadDesignCriteriaCommon). CivilCraft haina jedwali linalounganisha kasi na radius ya chini, kwa hiyo hakuna kinachokaguliwa kutokana nazo: weka **Radius ya chini** kutokana na kiwango chako mwenyewe cha usanifu.

## Spirali

Mkunjo unaweza kuwa na spirali ya clothoid katika kila ncha: tanjenti, spirali, mkunjo, spirali, tanjenti. Katika jedwali la PI, andika urefu katika **Spirali ya kuingia** na **Spirali ya kutoka** kwa PI yenye radius. PI inabaki pale ilipo; mkunjo unasogea ndani ili kupata nafasi, hivyo umbali wa tanjenti unaongezeka kwa mkengeuko wa spirali. Urefu hizo mbili zinaweza kutofautiana, na PI yenye urefu mmoja pekee hupata spirali upande huo tu.

Orodha ya mikunjo kisha inasomeka TS, SC, CS na ST (tanjenti hadi spirali, spirali hadi mkunjo, mkunjo hadi spirali, spirali hadi tanjenti) pamoja na pembe ya spirali θs, umbali wa tanjenti na umbali wa nje. Vituo vinaendelea kando ya spirali kama kila mahali pengine. Spirali ambazo kwa pamoja zinageuza zaidi ya mkunjo zinakataliwa, pamoja na PI iliyotajwa; spirali ndefu kuliko tanjenti inavyoruhusu ni mwingiliano, kama kwa mkunjo wowote. Mwinuko wa kuegemea hutumia spirali kama eneo lake la mpito (tazama [Ukanda](topic:corridor)).
