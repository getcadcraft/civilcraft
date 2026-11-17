---
title: Stíll lags eftir eigind
summary: Litaðu hluti GIS-lags eftir gildum reits (einn lit fyrir hvert gildi, eða eftir talnabilum), stærðu punkta eftir tölu, litaðu marghyrninga og sýndu skýringu á grunnmyndinni.
keywords: táknfræði, stíll, litur, flokkað, stigskipt, einstök gildi, jöfnt bil, hlutfallsskipting, náttúruleg skil, jenks, litróf, litblinda, skýring, stærð, punktar, litun, flokkar, gis
from: a3a69add
---

Opnaðu valmynd lags með **þremur punktum** í lagalistanum **GIS-lög** og veldu {{ui:Stíll eftir eiginleika…}}.

## Þrír stílar

- **Eitt tákn:** litur lagsins, eins og áður.
- **Flokkað:** einn litur fyrir hvert ólíkt gildi í hvaða reit sem er. Allt að átta gildi fá átta Okabe-Ito litina (valdir til að haldast aðgreindir fyrir algengustu tegundir litblindu); með fleiri gildum fær hvert hinna sjö algengustu sinn lit og hin deila gráum flokki, **Annað**. Hlutir án gildis eru gráir.
- **Stigskipt:** talnareitur er skorinn í 2 til 9 bil, hvert með lit af litrófi. Gildi á skilum fer í neðra bilið.

## Hvernig bilin eru skorin

| Aðferð | Skil |
|---|---|
| Jafnt bil | Bilið frá minnsta til stærsta gildis er skipt í jafnbreið bil. Gildi 0 til 30 í þremur bilum: 0, 10, 20, 30. |
| Hlutfallsskipting | Um jafn margir hlutir í hverju bili. Skilin eru lesin úr röðuðum gildum með venjulegri beinlínuinnskotun: fyrir 1 til 10 í tveimur bilum eru skilin 5.5. |
| Náttúruleg skil (Jenks) | Skurðirnir sem skilja minnsta dreifingu eftir innan hvers bils, svo klasar líkra gilda haldast saman. Með fleiri en 1,500 gildum vinnur það með 1,500 jafnt dreifðum gildum og segir það. |

## Litir

Viridis og Cividis ganga frá dökku yfir í ljóst með jafnri breytingu á birtu, þannig að röð bilanna má lesa jafnvel í gráu eða með litblindu. Blues er frá ljósu yfir í dökkt. Rautt til blátt er tvíátta litróf fyrir gildi í kringum miðju. **Snúa litunum við** snýr hverju þeirra við. Glugginn telur upp bilin og fjölda hluta í hverju áður en þú beitir honum.

## Stærð, fylling og skýring

- **Stærð punkta eftir** talnareit gerir ferning hvers punkts stærri eftir því sem gildið er hærra, á milli stærðanna tveggja sem þú gefur (hálf hliðin, í mm á pappír).
- **Lita innan marghyrninga** fyllir hvern marghyrning í flokkslit sínum (göt haldast tóm). Liturinn er á skjánum; teikningar og DXF/DWG sýna lituðu útlínurnar.
- **Sýna skýringu á grunnmyndinni** teiknar flokkana, fjölda þeirra og stærðarbilið neðst til vinstri á grunnmyndinni. Skýringin er á skjánum; hún er ekki á teikningu.
- Til að merkja hluti með reit, notaðu **Merkja með** í sömu valmynd.

Stíllinn er vistaður í verkefnaskránni. Útgáfa sem þekkir ekki stíla opnar skrána með lit lagsins. Teikningar, DXF og DWG bera flokkana sem aðskilin lög sem heita eftir laginu og flokknum, í þeim næsta af níu grunnlitum CAD. Lag með fleiri en 200,000 hluti er teiknað í einum lit.
