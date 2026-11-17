---
title: Šešėliai, saulės derlius ir lauko komfortas
summary: Ištirkite, kokį šešėlį jūsų pastatų masės meta per dieną ar sezoną, pažiūrėkite jo animaciją, įvertinkite, kiek elektros per tipinius metus pagamintų saulės baterijos ant stogų ir sienų, pamatykite, kiek komfortiška gatvė šalia pastato (UTCI), ir gaukite orientacinį pėsčiųjų vėjo komforto įvertinimą.
keywords: šešėlio tyrimas, šešėlis, saulės valandos, animacija, saulė, PV, fotovoltinis, baterijos, derlius, kWh, EPW, orų failas, UTCI, šiluminis komfortas, lauko komfortas, karščio stresas, vėjas
from: 96e7af4d
---

Skiltis **Aplinka** yra po **Saulės valandos** masės **Ypatybėse**. Joje pastatais laikomos masės, kurias nubrėžėte.

## Įkelti orų failą

Pasirinkite tipinių metų orų failą (**.epw**) savo miestui. Jie nemokami iš EnergyPlus orų svetainės ir climate.onebuilding.org. Failas šiam apsilankymui lieka jūsų naršyklėje. Saulės derliui ir komforto tyrimui jo reikia; šešėlio tyrimas veikia be jo, kai projektas turi koordinačių sistemą.

## Šešėlio tyrimas

Pasirinkite datą (arba pažymėkite **Sezoną**, paskutinę datą ir žingsnį dienomis) bei laiko juostą, tada spustelėkite **Vykdyti šešėlio tyrimą**. Gausite žemėlapį su saulės ar šešėlio valandomis aplink mases; lentelę, kiek žemės per dieną būna pavėsyje; ir dienos animaciją, kurią galite paleisti arba peržiūrėti kadrais. **Įrašyti žemėlapį**, **Įrašyti animacijos kadrus** (visi kadrai viename paveikslėlyje) ir **Įrašyti valandas** (CSV) išsaugo rezultatus.

Žemė laikoma lygia, lygiame žemiausios masės aukštyje. Šešėliui šlaituotoje žemėje naudokite **Saulės valandas**, kurios skaito reljefą.

## Saulės derlius

Nustatykite skydelių efektyvumą, kokia dalis kiekvieno stogo ir sienos padengta, ir sistemos nuostolius, tada spustelėkite **Vykdyti saulės derlių**. Kiekvienam stogui ir sienai gausite, kiek elektros kvadratinis metras skydelio pagamintų per tipinius metus, kiek jos atima gretimos masės, ir kiekvienos masės sumą. Modelis paprastais žodžiais išdėstytas šalia mygtuko: tai planavimo įvertinimas pagal tipinius metus, o ne garantija.

## Lauko komfortas

**Vykdyti komfortą** apskaičiuoja Universalųjį šiluminį klimato indeksą (UTCI) stovinčiam žmogui atviroje vietoje ir šalia pirmos masės (pietų, šiaurės, rytų ir vakarų pusės), su kiekvienos masės šešėliu. Rodoma, kiek dangaus matoma, vidutinis dienos UTCI bei valandos virš 32 (karščio stresas) ir žemiau 0 (šalčio stresas).

## Vėjas (orientacinis)

**Vykdyti vėjo tyrimą** kartą išsprendžia oro srautą aplink jūsų mases kiekvienai vėjo krypčiai, kuri pučia jūsų orų faile (4, 8, 12 arba 16 krypčių), per aplinką, kurią pasirenkate (atvira vietovė, priemiestis ar miesto centras), ir tada sudeda visų metų valandinį vėją. Žemėlapis nuspalvina žemę pagal komforto klasę: nuo žalios (**sėdėjimas**) per **stovėjimą**, **pasivaikščiojimą** ir **vaikščiojimą** iki raudonos (**nekomfortiška**): veikla, kurios ribinis greitis (4, 6, 8 ir 10 m/s) viršijamas ne daugiau kaip 5 % valandų. Antroje lentelėje pateikiama NEN 8100 klasė (nuo A iki E) pagal valandų dalį, kai vėjas viršija 5 m/s. Gūsio koeficientas padauginamas iš valandinio vidurkio, kad gautų efektyvų gūsį.

Kaip tai veikia paprastais žodžiais: sprendiklis (mūsų pačių, bibliotekoje `lib/wind`) – lattice-Boltzmann didelių sūkurių srauto sprendiklis – dėžėje aplink pastatus; vėjo greičio profilis, kuris kyla su aukščiu pagal pasirinktą šiurkštumą; ir greitis apie 1,5 m virš žemės lyginamas su greičiu aukštupyje 10 m aukštyje. **Orientacinis** tyrimas greitas ir grubus; **Standartinis** naudoja daugiau langelių ir veikia daug ilgiau. Jei skydelis sako, kad tinklelis grubus (mažiau nei 10 langelių virš aukščiausio pastato) arba srautas dar kito, žemėlapiui tikėkite mažiau.

**Ko tai nėra.** Sprendiklis patikrintas vadovėlinėse srovėse (kanalas, ertmė su judančiu dangčiu) ir paleistas kubui, kad patikrintume, ar sūkurys ir greičio padidėjimas kampuose atrodo teisingai. Jis **nebuvo** patvirtintas palyginus su vėjo tunelio matavimais pastatams, todėl kiekvienas rezultatas pažymėtas kaip nepatvirtintas. Nenaudokite jo projektinei vertei, vėjo apkrovai ar planavimo pažymėjimui: vėjo inžinierius turi atlikti ir patvirtinti tinkamą tyrimą. Plokščia žemė, lygios pastatų sienos, orų stoties šiurkštumo trumpinys ir ribinių verčių lentelė yra supaprastinimai; ribinės vertės gali skirtis nuo jūsų institucijos kriterijų.

## Vėjas su OpenFOAM (priedas)

Aukščiau aprašytas įmontuotas vėjo variklis yra eksperimentinis. Tinkamam srauto sprendikliui įjunkite priedą **Pėsčiųjų vėjas (OpenFOAM)** skiltyje **Parametrai > Priedai** (kol to nepadarysite, jis išjungtas). Tai savo GPL licencijos programinė įranga, atskirta nuo kitos CadCraft dalies, ir ji neįtraukia OpenFOAM: jį įdiegiate patys. Tada **Variklis** vėjo bloke rodo OpenFOAM.

Ko reikia pasiruošti, vieną kartą:
1. **Įdiekite OpenFOAM** (ESI v-serijos iš openfoam.com; priedas testuotas su v2512). Ubuntu ar Debian (taip pat WSL Windows sistemoje): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, tada `sudo apt install openfoam2512-default`. Jis įdiegiamas į `/usr/lib/openfoam/openfoam2512`. Kad CadCraft veiktų, reikia `blockMesh`, `snappyHexMesh` ir `simpleFoam`. (Senesnis `openfoam` 1912 paketas iš Ubuntu archyvo taip pat veikia, bet jo funkcijų objektai stringa; tada priedas pats skaito rezultatų failus.)
2. **Paleiskite pagalbininką** iš priedo aplanko `runner` su Node.js: `node cc-openfoam-runner.mjs serve`. Jei OpenFOAM nėra paieškos kelyje, duokite mažą `runner.json` failą su OpenFOAM `etc/bashrc` keliu (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) ir paleiskite su `--config runner.json`. Pagalbininkas klauso tik šio kompiuterio ir išveda prieigos raktą.
3. **Įklijuokite raktą** į priedo laukus vėjo bloke (adresas lieka `http://127.0.0.1:8765`) ir spustelėkite **Patikrinti pagalbininką**.

Tada **Vykdyti vėjo tyrimą** atlieka po vieną atvejį kiekvienai vėjo krypčiai orų faile: jūsų masės tampa paviršiumi (STL) dėžėje, kurios dydis pagal įprastą gairę (5 pastatų aukščiai į šonus ir aukštyn, 10 už jo), ji suskaidoma su blockMesh ir snappyHexMesh, paleidžiama kaip stacionarus k-epsilon RANS su atmosferos ribinio sluoksnio įėjimu per pasirinktą šiurkštumą; greitis 1,5 m aukštyje nuskaitomas ir paverčiamas tomis pačiomis Lawson ir NEN 8100 klasėmis. Niekas neišeina iš jūsų kompiuterio.

**Kas patikrinta.** Rezultatų virš jų parašyta aiškiai, ir tai yra kiekvieno įrašyto CSV dalis. Priedo atvejų rašymas, rezultatų skaitymas ir visas procesas testuoti be OpenFOAM, o vienas kubas paleistas per tikrą OpenFOAM trijų tinklelio dydžių. Skaičiai pateikti projekto pastabose. Jis **nebuvo** patvirtintas palyginus su vėjo tunelio matavimais pastatams. Tai orientacinis įvertinimas, ne projektinė vertė ir ne pažymėjimas. Standartinis k-epsilon per daug įvertina turbulenciją priešais pastatus, žemė plokščia, sienos lygios, o reljefo ir augmenijos nėra.
