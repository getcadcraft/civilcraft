---
title: Koordinates-ka dhulka iyo kuwa maxalliga ah
summary: Ka shaqee koordinates-ka dhulka (dusha) oo laga qaaday shabakadda iyada oo loo jeediyay isku dhafan-ka cabbirka ee aad qortid ama aad xisaabiso dhibic, ama shabakad goob la malaynayo oo la xidhiidhsan nidaamka laba dhibcood oo xakameyn ah.
keywords: koordinates-ka dhulka, koordinates-ka dusha, shabakad ilaa dhul, isku dhafan-ka cabbirka, csf, isku dhafan, cabbirka shabakadda, cabbirka dhererka, cabbirka badda, convergence, geesta khariidaynta, cabbirka, koordinates-ka la malaynayo, koordinates-ka maxalliga ah, shabakadda goobta, 5000 5000, dhibcaha xakameynta, localization, calibration, laba-dhibic, misclosure
from: 3d7453de
---

Koordinates-ka state plane iyo UTM waa koordinates **shabakad**: saadaasha khariidadu way ballaadhisaa ama yareysaa masaafooyinka yar (tobanaan qaybood halkii milyan), oo meesha sare ee goobta ay tahay, masaafada dhulka la cabbiray way ka duwan tahay tan shabakadda. Sidaas darteed sahamiyo badani waxay gaarsiiyaan koordinates-ka **dhulka**, oo la cabbiray si masaafooyinka qorshaha ay ula mid noqdaan masaafooyinka dhulka lagu cabbiray, ama shabakad goob **la malaynayo** (5000, 5000 dhibic xakameyn). CivilCraft wuxuu ilaaliyaa tirooyinkaaga siday yihiin wuxuuna diiwaan geliyaa siday ula xidhiidhaan shabakadda, sidaas darteed latitude iyo longitude, faylasha GIS iyo lakabyada khariidadda weli meesha saxda ah ayay ku dhacaan.

Fur {{ui:Isku-xirka}} kooxda {{ui:GIS}}, dooro (ama ilaali) nidaamka, kadibna dooro hoosta **Shabakad, dhul ama koordinates maxalli ah**:

| Doorasho | Koordinates-kaagu waa | Sida ay ula xidhiidhaan shabakadda |
|---|---|---|
| {{ui:Shabakad}} | Nidaamka laftiisa (bilowga) | Tirooyin isku mid ah |
| {{ui:Dhul}} | Cabbir loo beddelay masaafooyinka dhulka | grid = base + combined factor × (ground − base) |
| {{ui:Gudaha}} | Shabakad goob la malaynayo | Dhaqaaqay, wareegay oo cabbir loo beddelay shabakadda laba dhibcood oo xakameyn ah |

Waxkasta oo aad dooratid waa la kaydiyaa mashruuca waana hal tallaabo oo dib loo noqdo; waxba ma dhaqaaqo.

## Koordinates-ka dhulka

1. Dooro {{ui:Dhul}}.
2. Qor **Isku dhafan-ka cabbirka** sahanka ka yimid (tusaale ahaan `0.99987`), ama xisaabi:
   1. Hoosta **Xisaabi cabbirka dhibic**, dhibicu wuxuu ka bilaabmaa badhka dhexe ee mashruuca. Dooro {{ui:Dooro barta qorshaha}} oo riix meesha (riix ku dhow dhibic sahan wuxuu qaadaa dhibcaas), ama qor E iyo N.
   2. Dhererka waxa uu ka yimaadaa dusha halkaas; qor mid kale haddii loo baahdo.
   3. Dooro {{ui:Xisaabi}}. CivilCraft wuxuu muujinayaa:
      - **Cabbirka shabakadda k**: sida saadaasha khariidadu u fidiso masaafooyinka halkaas.
      - **Cabbirka dhererka**: sida masaafooyinka ellipsoid-ka uga gaaban yihiin dhererkaas.
      - **Isku dhafan** = k × cabbirka dhererka: masaafada shabakadda = masaafada dhulka × tan.
      - **Convergence**: xagga u dhexeeya waqooyiga shabakadda iyo waqooyiga run halkaas (azimuth-ka geodetic = azimuth-ka shabakadda + convergence).
   4. Dooro badhanka {{ui:Isticmaal}} ee tirooyinka hoosta si isku dhafanka uu u galo sanduuqa.
3. Deji **Barta saldhigga**, halkaas oo koordinates-ka dhulka iyo shabakadda isku mid yihiin. Wuxuu ka bilaabmaa 0, 0: badi gobolada ku daabacaya koordinates-ka dhulka waxay cabbiraan iyagoo ku saleysan bilowga, sidaas darteed koordinates-ka dhulka waxay sii dhowaadaan kuwa shabakadda. Sahamiyo qaarkood waxay cabbiraan barta xakameynta mashruuca: isticmaal waxa sahanku sheegayo.
4. Dooro {{ui:Codso}}.

:::warning
Dhererka waxa loo qaataa sida dhererka ka sare ellipsoid-ka. CivilCraft ma laha moodel geoid, sidaas darteed halka geoid-ku 30 m (100 ft) hoosaysa ama sarreeyo ellipsoid-ka, cabbirka dhererku wuxuu ka dhaadheer yahay qiyaastii 5 ppm. Marka sahanku sheego isku dhafankiisa, qor kaas.
:::

## Koordinates-ka maxalliga ah (la malaynayo)

1. Dooro {{ui:Gudaha}}.
2. Dhibcaha xakameynta **1**, qor lambarka dhibcaha sahanka (ama dooro {{ui:Dooro}} oo riix qorshaha). Koordinates-ka maxalliga ah waxay ku muuqdaan dhinaciisa.
3. Qor **shabakadda** E iyo N, ama latitude iyo longitude-kiisa sanduuqa saddexaad (tusaale ahaan `30.2672, -97.7431`).
4. Samee sidaas dhibcaha xakameynta **2**, kolka ugu fog ee ugu dhow ee koowaad.
5. CivilCraft wuxuu muujinayaa **Cabbirka** iyo **Jeexjeexa** la helay, wuxuuna xusuusinayaa: **Laba dhibic had iyo jeer si sax ah ayay ku habboonaadaan — hubi saddexaad.**
6. Dhibic **hubinta** ku sii si la mid ah. CivilCraft wuxuu muujinayaa inta ay ku fogaato koordinates-ka shabakadda aad qortay (misclosure-ka, cutubyada mashruuca iyo qaybo halkii milyan). Misclosure weyn waxay ka dhigan tahay dhibic qaldan, qalad qorista, ama koordinates cutub kale.
7. Dooro {{ui:Codso}}.

Cabbir ka fog 1 (ka baxsan 0.5 ilaa 2) waa la diidaa: hubi dhibcaha iyo cutubyadooda.

## Waxa la hubiyay

- Cabbirka iyo convergence-ka waxay la mid yihiin PROJ (pyproj 3.7.1 oo leh PROJ 9.5.1), maktabadda koordinates-ka ee barnaamijyada GIS badan isticmaalaan, ilaa 1 qayb halkii bilyan oo ku saabsan in ka badan 300 nidaam oo leh saadaalin conformal (state plane, UTM, transverse Mercator, Lambert conformal conic), iyo browser-ka dhibic laga doortay qorshaha.
- Tillaabooyinka dhulka iyo kuwa maxalliga ah waxay u beddelaan dhinac ilaa dhinac ilaa 1 qayb halkii bilyan; laba dhibcood xakameyn waxay soo celinayaan cabbirka iyo jeexjeexa ay ku abuurmeen; dhibic hubin 0.05 ft ka fog waxay muujinayaa misclosure 0.05 ft.
