---
title: Hanna lárétta veglínu
summary: Teiknaðu veglínu eftir skurðpunktum hennar (PI), settu radíus boga og upphafsstöð, færðu PI, og lestu ferilgögn, stöð og frávik.
keywords: veglína, engin lausn, bogi passar ekki, stærsti radíus, minnsti radíus, lágmarksradíus, hönnunarhraði, skörun, miðlína, pi, láréttur bogi, radíus, stöðvasetning, snertill, búa til veglínu, skipulag veglínu, pc, pt, stöð frávik
from: 8c5df4aa
---

Veglína í CivilCraft er keðja snertla milli skurðpunkta (PI), með hringboga í hverjum innri PI sem hefur radíus. Hún er stöðvamerkt frá upphafsstöð sem þú velur. Verkefni getur haldið mörgum veglínum.

## Teiknaðu veglínuna

1. Ýttu á {{key:A}}, eða smelltu á {{ui:Veglína}} í hópnum **Hönnun**.
   Ábendingin segir „Veglína: smelltu á PI í röð. Enter eða tvísmellur lýkur, Backspace fjarlægir síðasta, Esc hættir við.“
2. Smelltu á fyrsta PI (upphaf veglínunnar).
3. Smelltu á hvern næsta PI í röð. Rauð lína fylgir bendlinum og sýnir lengd og stefnu snertilsins sem þú ert að teikna, til dæmis „212.40 ft  N 63°12'05" E“.
4. Smelltu á síðasta PI (lok veglínunnar).
5. Ýttu á {{key:Enter}}.
   Veglínan er teiknuð með stöðvamerkingum og er valin. Stöðustikan segir til dæmis „Veglína 1: 386.36 ft, bogar með 100 ft radíus þar sem þeir passa. Breyttu radíusum í Eiginleikum; Langsnið (R) til að hanna halla hennar.“

Meðan teiknað er: {{key:Backspace}} fjarlægir síðasta PI, {{key:Esc}} hættir við, og að draga á tóman flöt færir skjámyndina til án þess að bæta við PI.

:::warning
Ljúktu með {{key:Enter}}. Tvísmellur lýkur einnig, en í þessari útgáfu fjarlægir hann PI-ið sem þú tvísmelltir á. Smelltu einu sinni á síðasta PI, og ýttu svo á {{key:Enter}}.
:::

Sérhver innri PI fær boga með 100 ft radíus (30 m í metraverkefni), eða stærsta heila radíus sem passar í helming hvers snertils ef 100 ft passar ekki. Mjög skarpir PI, eða PI þar sem línan heldur beint áfram, fá engan boga.

## Stilltu radíusa og hnit

Með valinni veglínu sýnir hægra spjaldið **Veglína**:

1. **Heiti** og **Upphafsstöð**. Skrifaðu stöð sem `10+00` (fet) eða `0+500` (metrar), eða sem venjulega tölu. Sjá [Einingar, stöðvar og talnasnið](topic:units-and-stations).
2. **Lengd** og **Lokastöð** eru reiknuð fyrir þig.
3. Taflan **PI** listar austur- og norðurhnit hvers PI, og **Radíus** fyrir hvern innri PI. Skrifaðu nýtt gildi og ýttu á {{key:Enter}}.
   - Radíus 0 gerir hornpunkt án boga.
   - Fyrsti og síðasti PI fá aldrei radíus.
   - Litla x-ið við enda línu fjarlægir þann PI (veglína heldur að minnsta kosti tveimur).
4. Lestu listann **Bogar**: fyrir hvern boga, PC- og PT-stöðvar, radíus R, beygju Δ og stefnu (vinstri eða hægri), lengd L, snertil T, ytri fjarlægð E og streng.
5. Línan undir bogunum gefur stefnu fyrsta snertilsins.

## Þegar bogi passar ekki

Ef bogar þurfa meira snertilsrými en er á milli PI þeirra, hefur veglínan enga lausn: hún er ekki rétt teiknuð fyrr en þú lagar hana, og hún er felld út úr LandXML-útflutningi. Rauður reitur segir af hverju, með tölum, og býður það sem myndi passa:

- „Bogarnir við PI 2 og PI 3 þurfa 240.00 ft af snertli á milli sín (130.00 + 110.00), en PI-in eru 180.00 ft frá hvor öðrum.“ — eða, þegar aðeins einn þeirra er með boga, „Bogi við PI 2 þarf 240.00 ft af snertli í átt að PI 1 …“.
- Hnappur fyrir hvern PI setur **stærsta radíus sem passar** þar, með hinum boganum óbreyttum (hann þarf einnig að passa við hinn snertil PI-sins). Þar sem báðir PI eru með boga minnkar **Both** báða radíusana í hlutfalli þannig að þeir mætast rétt.
- Þegar einn bogi einn og sér er lengri en snertillinn segir reiturinn að enginn bogi á hinum PI geti passað meðan hann er svo stór.
- PI sem beygir beint til baka getur ekki tekið boga; reiturinn býður **Enginn bogi við PI n**.

Hver hnappur er eitt skref: {{key:Mod+Z}} skilar radíusunum aftur. Boðnir radíusar eru námundaðir niður í 0.01 svo þeir passi alltaf.

### Lágmarksradíus hönnunar

Skrifaðu inn **Lágmarksradíus hönnunar** (til dæmis út frá hönnunarhraða) til að láta alla boga athugaða gegn honum; skildu eftir autt fyrir engan. Bogi undir honum er birtur með hnappi fyrir **minnsta radíus sem uppfyllir lágmarkið**, þegar sá radíus passar. Þegar hann passar ekki segir reiturinn það og gefur stærsta radíus sem snertlarnir leyfa, svo þú vitir að þurfa að færa PI eða lækka lágmarkið.

## Færðu PI á grunnmyndinni

1. Með {{ui:Velja}} virkt, smelltu á veglínuna til að velja hana. Ferningsgrip birtast við PI-in.
2. Dragðu grip. Veglínan, stöðvamerking hennar, langsnið og gangur fylgja.
3. Slepptu. Færslan er eitt afturkallsskref.

Að bæta PI á milli tveggja sem fyrir eru er ekki í boði enn: fjarlægðu veglínuna og teiknaðu hana aftur, eða skrifaðu ný hnit fyrir PI-in sem þú átt.

## Lestu stöð og frávik

Færðu bendilinn yfir grunnmyndina. Stöðustikan sýnir næstu veglínu (eða þá völdu) með stöð og frávik, **L** eða **R** þegar horft er upp stöðvar, til dæmis „Veglína 1: Sta 2+15.30, frávik 18.42 R“. Handan annars hvors enda bætir hún við „(handan endans)“.

## Hvað er teiknað

Á grunnmyndinni, í DXF og í PDF: miðlínan (snertlar sem línur, bogar sem sannir bogar), merki á 50 ft (20 m) fresti með lengra merki og stöðvamerkingu á hverjum 100 einingum, og PC- og PT-merki merkt með stöðvum sínum.

## Eyða veglínu

Veldu hana og ýttu á {{key:Delete}}, eða smelltu á {{ui:Eyða}} í tækjastikunni eða neðst á hægra spjaldinu. Langsnið hennar og vegstæði fara með. {{key:Mod+Z}} kemur henni til baka.

:::mac
Á Mac-lyklaborði er takkinn merktur **delete** {{key:Backspace}} í vafranum og eyðir ekki valinu. Ýttu á {{key:Delete}} (Fn og delete), eða notaðu hnappinn {{ui:Eyða}}.
:::

## Næst

- [Hanna lóðrétt langsnið](topic:profile).
## Hönnunarhraði og flokkur

Undir eiginleikum veglínunnar eru **Hönnunarhraði** (km/h eða mph) og **Hönnunarflokkur** geymd með veglínunni, vistuð í verkefninu og skrifuð í IFC (Pset_RoadDesignCriteriaCommon). CivilCraft hefur enga töflu sem tengir hraða við lágmarksradíus, svo ekkert er athugað út frá þeim: stilltu **Lágmarksradíus** út frá þínum eigin hönnunarstaðli.

## Spírallar

Bogi getur haft klóþoíðaspírall í hvorum enda: snertill, spírall, bogi, spírall, snertill. Í PI-töflunni skaltu skrifa lengd í **Spírall inn** og **Spírall út** fyrir PI sem hefur radíus. PI stendur kyrr; boginn færist inn til að skapa rými, svo snertilfjarlægðin vex um frávik spírallsins. Lengdirnar tvær mega vera ólíkar, og PI með aðeins eina lengd fær spírall aðeins í þeim enda.

Listinn yfir boga sýnir þá TS, SC, CS og ST (snertill í spírall, spírall í boga, bogi í spírall, spírall í snertil) með spíralhorninu θs, snertilfjarlægðunum og ytri fjarlægð. Stöðvar ganga eftir spírölunum eins og alls staðar annars staðar. Spírallar sem saman beygja meira en bogi gerir eru hafnaðir með nafngreindum PI; spírall lengri en snertillinn leyfir er skörun, eins og fyrir hvaða boga sem er. Yfirhækkun notar spírallinn sem útsláttarsvæði (sjá [Vegstæði](topic:corridor)).
