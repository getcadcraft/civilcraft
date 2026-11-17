---
title: Fur DWG ama DXF sida khadad
summary: Fur khadadka naqshadda qorshaha, layer kasta oo keliya, isticmaal kontuurradeeda, polilayn 3D iyo xuduudaha xidhan ee dusha, oo u beddel bloogyada barooyinka barooyin sahan.
keywords: hubinta sahanka, sare-u-kaca qoraalka, dwg, dxf, cad, naqshad, khadad, khadka jejebinta, kontuur, xuduud, polilayn, polilayn 3d, layer-yada, khariidadda aasaasiga, topo, naqshadda sahanka, bloogyada, tixraacyada bloogyada, barooyin sahan oo ka bloogyada, sifooyinka, barta gelinta
from: da0f4c58
---

Sahan dhul-badan badanaa wuxuu u yimaadaa naqshad: kontuurrada oo ah polilayn sare-u-kac, khadadka jejebinta oo ah polilayn 3D, iyo xuduudda goobta oo ah polilayn xidhan. CivilCraft wuxuu furaa **meesha moodeelka** naqshadda oo layer-yo qorshaha ah, wuxuuna khadadkaas si toos ah ugu beddeli karaa dusha.

## Fur naqshadda

1. Guji {{ui:Xariiqyada}} qaybta **Dusha** (ama {{ui:Fur}}, ama ku rid faylka qorshaha) oo dooro fayl `.dwg` ama `.dxf`. Naqshaddu waxa la akhriyaa kombiyuutarkan; waxba lama soo dejin. DWG 2000 ilaa 2018 iyo ASCII DXF waa la akhriyaa.
2. Wada-hadalka **Xariiqyada** wuxuu liistaa layer-yada naqshadda ee hayaa khadad, qaabab xidhan ama barooyin, iyo inay leeyihiin **sare-u-kac**. Layer-yada damaysan naqshadda waxay ku bilaabmaan aan la calaamadin. Qoraal, hatches, cabbir iyo waxyaabo kale oo aan khad ahayn waa la tiriyaa oo waa la reebaa (wada-hadalku wuxuu sheegaa kuwa).
3. Calaamee **Unitiyada naqshadda**. Marka naqshaddu sheegto unitiyadeeda, CivilCraft wuu u beddelaa unitiyada mashruuca (millimitir ilaa mitir, mitir ilaa feet, inch ilaa feet). Naqshad feet ah waxa loo akhriyaa sida US survey feet iyada oo aan la cabbirin: labadaba way ka duwan yihiin 2 qaybood halkii milyan, cabbirka isku-xirka state plane oo taas loo cabbiro wuxuu u rari lahaa feet. Marka naqshaddu aan sheegin unitiyadeeda, tirooyinkeedu waxa lagu akhriyaa unitiyada mashruuca; dooro unitiga saxda ah liiska haddii aysan ahayn.
4. Ku **Isticmaal dusha**, dooro waxa layer kasta siinayo dusha (ama ka reeb **Kaliya tus**). Layer-yada loo magacaabo sida kontuurrada (TOPO, CONT, CNTR) oo leh sare-u-kac waxay ku bilaabmaan sida khadka jejebinta.
5. Guji {{ui:Ku dar}}. Layer-yada waxay ka muuqdaan **Layer-yada GIS** panel-ka bidix; isticmaal kasta waxa la dhigaa dusha. Qaybta kasta waa tallaabo gaar ah: {{key:Mod+Z}} wuxuu mid mid dib u celiyaa.

## Waxa layer kasta bixin karo

| Layer-ku wuxuu hayaa | Isticmaal dusha |
|---|---|
| Kontuurro (polilayn sare-u-kac) | Khadka jejebinta oo sare-u-kaca khadka laftiisa, ama ELEV field |
| Polilayn 3D | Khadka jejebinta oo sare-u-kacooda |
| Xuduud xidhan | Xuduudda dusha (qaabka xidhan ee ugu weyn, ama midka aad doorato) |
| Barooyin sare-u-kac leh | Barooyinka sahanka, oo lagu sharaxo magaca layer-ka |
| Khadad sare-u-kac 0 (khadka qorshaha) | Waxba: wuxuu ku sii jiraa qorshaha sida naqshad aasaasi ah |

Naqshad uu CivilCraft qoray waxay hayaa khadadka muuqaalkeeda oo ah polilayn 3D oo xusuusta qaansooyinkooda. Wada-hadalku markaas wuxuu tusayaa **Khadadka muuqaalka**: ka tag inay soo celiyaan sida khadadka muuqaal oo qaansooyinkooda iyo isticmaalkooda (hal tallaabo undo), ama ka reeb si ay u akhrisan yihiin sida layer kasta oo kale.

Hadhow, isticmaal {{ui:Isticmaal dusha}} ee menyuga layer-ka ku hoos **Layer-yada GIS** si aad u samayso wax layer aad kaliya tustay.

## Barooyinka sahanka ee bloogyada

Naqshadaha sahanku badanaa barooyinkooda ku qaadaan bloogyo: calaamad yar oo ah rasaas kasta, oo leh sifooyin lambarka barta, sharraxaadda iyo sare-u-kaca. Marka naqshaddu leedahay tixraacyada bloogyada, wada-hadalku wuxuu leeyahay qayb **Barooyinka sahanka ee bloogyada**:

1. Calaamee bloogyada la qaadanayo (miiska wuxuu sheegayaa tirada tixraacyada kasta, layer-yada ay ku yaallaan, iyo sifooyinka), ama calaamee layer-yo si aad u qaadato dhammaan tixraacyada bloogyada ku jira.
2. Dooro meesha uu ka yimaado **lambarka**, **sharraxaadda** iyo **sare-u-kaca** barta kasta: sifo, magaca bloogga ama layer-ka, lambarrada xor ah ee xiga, ama Z-ka barta gelinta. CivilCraft wuxuu ku bilaabaa sifooyinka caadiga ah (PT, DESC, ELEV iyo kuwa la mid ah), wuxuuna sare-u-kaca ka qaadaa sifo oo keliya marka bloogyadu ku yaallaan eber.
3. Ka reeb layer-yada khadadka haddii aad doonayso barooyinka kaliya, kadibna guji {{ui:Ku dar}}.

Tixraac kasta wuxuu noqdaa hal barta sahan ah oo ku taal barta gelinteeda. Kaliya tixraacyada lagu dhigay meesha moodeelka ayaa la tiriyaa; bloogyada ku jira bloogyo kale lama tirinayo. Lambarrada hore mashruuca ama laba jeer naqshadda ku isticmaalan, waxay helaan lambar cusub oo ka dambeeya kan ugu sarreeya; sifada sare-u-kaca oo aan lambar ahayn barta waxay uga tagtaa sare-u-kac la’aan; wadada xaaladda ayaa tiriyaa labadaba. Naqshadda lama beddelo, barta kasta waxay xusuusataa bloogeeda: sifooyinkeeda waxay tusaysaa **Laga bloogga** oo leh bloogga, layer-ka iyo handle-ka. Ku darista barooyinka waa hal tallaabo, marka {{key:Mod+Z}} dhammaantood wuu tirtiraa.

## Heerarka qoraal ahaan iyo hubinta

Sare-u-kac calaamad ah oo qoraal ah (ama sifo bloog oo aan ahayn bloogga barta sahanka) ma aha khad. Qaybta **Heerarka sahanka iyo hubinta** waxay qaadan kartaa iyaga sida barooyin sahan, waxayna liistaa wixii qaldan naqshadda: unitiyada, nidaamka isku-xirka, fogaanta ka xagga zero, kontuurro siman, sare-u-kac aan caadi ahayn, iyo barooyin labajibaaran. Eeg [Hubinta naqshadda sahanka markii la soo geliyo](topic:survey-check).

## Akhrinta naqshadda

- Qaansooyinka, goobaha, ellipses-ka, qaybaha polilayn-ka ee foorar leh iyo splines-ka waxay noqdaan qaybo toosan oo gaaban (5° ilaa ugu badnaan).
- Tixraacyada bloogyada waxa lagu sawiraa meesha lagu dhigay, bloogyada ku jira bloog kale sidoo kale; wixii bloog ku hayo layer 0 waxay qaadaan layer-ka tixraaca.
- Shayada lagu sawiray diyaarad kale (jihada extrusion ee kala duwan) waxa lagu dhigaa isku-xirka adduunka.
- Shay kasta wuxuu helaa saddex goob: LAYER, TYPE (nooca shayga) iyo ELEV (sare-u-kaciisa marka dhammaan barooyinkiisu wadaagaan mid).
- Isku-xirka waa la qaadaa sidii uu yahay: naqshaddu waa inuu isticmaalaa isku-xirka mashruuca (tusaale ahaan isla state plane zone). Naqshadaha xiriiran (xrefs) lama furo: fur kuwaas si gaar ah.

:::tip
Naqshad kontuur ah ayaa siinaysa dusha ugu wanaagsan marka lagu daro dhowr sare-u-kac goobaha buurta sare iyo godadka, halkaas oo kontuurrada keligood ay ka tagaan saddexagalo siman. Ku dar iyagoo barooyin sahan ah, ama layer-ka barooyinka ee naqshadda.
:::
