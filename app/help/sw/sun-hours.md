---
title: Hesabu saa za jua kwenye tovuti
summary: Chagua siku (au msimu) na eneo la saa, kisha uone saa za jua moja kwa moja kwenye kila ukuta wa kila misa ya jengo na kwenye ardhi inayoizunguka, pamoja na ardhi ikichorwa kwenye mpango na namba kama CSV.
keywords: jua, saa za jua, kivuli, ufikiaji wa jua, saa za mchana, uso wa jengo, ukuta, msimu, msimu wa jua (solstice), usawa wa mchana na usiku (equinox), eneo la saa, muda wa mchana, latitudo, longitudo, CSV, raster
from: 4e32a314
---

**Saa za jua** inahesabu saa za jua moja kwa moja zinazofikia kila ukuta wa kila misa ya jengo na ardhi inayoizunguka, kwa siku unayochagua au kwa wastani wa msimu. Misa za majengo na ardhi yenyewe ndizo zinazotoa kivuli; hakuna kingine (hakuna miti, wala majirani ambao hujachora). Mwanga wa anga usio jua la moja kwa moja hauhesabiwi.

## Kabla ya kuanza

Nafasi ya jua inatokana na latitudo na longitudo ya tovuti, ambazo zinatokana na **mfumo wa kuratibu** wa mradi. Mradi usio nao unakataliwa kwa ujumbe: uweke kwanza (**Kuratibu** katika kundi la GIS). Latitudo na longitudo zilizoandikwa kwa mkono zingekuwa kubahatisha, kwa hiyo hakuna kisanduku cha kuziandika.

## Hesabu

Kwenye **Sifa**, chini ya **Misa za majengo**, **Saa za jua**:

1. Chagua **Siku**. Inaanza siku ambayo jua liko chini kabisa ulipo (21 Desemba, au 21 Juni kwenye ulimwengu wa kusini). Kwa msimu, weka alama kwenye **Kwa msimu**, kisha chagua **Siku ya mwisho** na siku ngapi za kupimia zitengane.
2. Andika **Eneo la saa**: jina kama `America/Mexico_City`, au tofauti kutoka UTC kama `-6`. Jina hufuata kanuni za saa za mchana za eneo hilo kwa siku hiyo; tofauti unayoandika inatumika kama ulivyoandika, kwa hiyo tumia ile inayotumika siku hiyo. Mstari chini ya kisanduku unakuambia tofauti iliyopatikana.
3. Chagua mara ngapi jua liwekwe (kila dakika 5, 10, 15 au 30), kisha **Hesabu saa za jua**. Msimu unaendeshwa kwenye wafanyakazi wa chinichini; **Simamisha** inaughairi.

## Utapata nini

- Jedwali kwa kila misa: **ukuta mbaya zaidi**, **wastani** na **ukuta bora zaidi**, kwa saa kwa siku, pamoja na jedwali la kila ukuta kwa upande unaoelekea na saa zake kwa kila ghorofa.
- Ardhi inayozunguka misa, ikichorwa kwenye mpango kutoka giza (hakuna jua) hadi manjano (kiwango cha juu zaidi seli yoyote inachopata), pamoja na ufunguo. Seli chini ya misa zinaachwa tupu. **Onyesha ardhi kwenye mpango** inaizima.
- **Kuta kama CSV** na **Ardhi kama CSV** zinahifadhi namba.

Kwa msimu, takwimu ni wastani kwa siku kwa siku zilizopimwa. Hakuna kinachohifadhiwa kwenye mradi: matokeo ni ya kuangalia, na kuiendesha tena kunayatengeneza upya.

## Ni vizuri kujua

- Ukuta unahesabu wakati kuwa wenye jua pale tu unapoelekea jua na hakuna kinachouzuia. Ukuta unaotazama upande mwingine hupata sifuri.
- Ardhi inapimwa kwenye gridi inayotegemea ukubwa wa tovuti, na nafasi ya jua katikati ya kila hatua ya muda, kwa hiyo saa ziko sahihi hadi ukubwa wa hatua uliyochagua.
- Nafasi ya jua ni fomula ya kiastronomia iliyochapishwa, sahihi hadi takriban dakika moja ya arc.
