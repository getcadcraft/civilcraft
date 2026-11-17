---
title: Skadu, sonopbrengs en buitekomfort
summary: Bestudeer die skadu wat jou geboumassas oor 'n dag of 'n seisoen werp, sien 'n animasie daarvan, bereken hoeveel elektrisiteit sonpanele op die dakke en mure in 'n tipiese jaar sou maak, sien hoe gemaklik die straat langs 'n gebou is (UTCI), en kry 'n voorlopige lesing van voetgangerswindgemak.
keywords: skadustudie, skadu, sonure, animasie, sonkrag, PV, fotovoltaïes, panele, opbrengs, kWh, EPW, weerlêer, UTCI, termiese gemak, buitekomfort, hitte-spanning, wind
from: 96e7af4d
---

Die **Omgewing**-afdeling sit onder **Sonure** in 'n massa se **Eienskappe**. Dit gebruik die massas wat jy geteken het as die geboue.

## Laai 'n weerlêer

Kies 'n tipiese-jaar-weerlêer (**.epw**) vir jou dorp. Hulle is gratis van die EnergyPlus-weerwebwerf en van climate.onebuilding.org. Die lêer bly in jou blaaier vir hierdie besoek. Die sonopbrengs en die gemaklikheidstudie het dit nodig; die skadustudie werk sonder dit wanneer die projek 'n koördinaatstelsel het.

## Skadustudie

Kies 'n datum (of merk **Seisoen** en 'n laaste datum en 'n stap in dae) en 'n tydsone, en dan **Voer skadustudie uit**. Jy kry 'n kaart van die sonure, of van die skadu, op die grond rondom die massas; 'n tabel van hoeveel van die grond deur die dag beskadu is; en 'n animasie van die dag wat jy kan speel of stap-vir-stap deurgaan. **Stoor kaart**, **Stoor animasie-rame** (al die rame op een prent) en **Stoor ure** (CSV) hou die resultate.

Die grond word as plat geneem op die vlak van die laagste massa. Vir skadu op hellende grond gebruik **Sonure**, wat die terrein lees.

## Sonopbrengs

Stel die paneel se doeltreffendheid in, hoeveel van elke dak en muur bedek is en die stelselverliese, en dan **Voer sonopbrengs uit**. Vir elke dak en muur kry jy die elektrisiteit wat 'n vierkante meter paneel in 'n tipiese jaar sou maak, hoeveel daarvan die naburige massas wegneem, en 'n totaal vir elke massa. Die model word in gewone woorde langs die knoppie uitgeskryf: dit is 'n beplanningskatting uit 'n tipiese jaar, nie 'n waarborg nie.

## Buitekomfort

**Voer gemak uit** bereken die Universele Termiese Klimaatindeks (UTCI) vir 'n staande persoon op oop grond en langs die eerste massa (suid-, noord-, oos- en westkante), met die skadu van elke massa. Dit wys hoeveel lug gesien word, die gemiddelde dag-UTCI, en die ure bo 32 (hitte-spanning) en onder 0 (koue-spanning).

## Wind (voorlopig)

**Voer windstudie uit** los die lugvloei om jou massas een keer op vir elke windrigting wat in jou weerlêer waai (4, 8, 12 of 16 rigtings), oor die omgewing wat jy kies (oop land, voorstad of stadsentrum), en tel dan die hele jaar se uurlikse wind bymekaar. Die kaart kleur die grond volgens gemaklikheidsklas, van groen (**sit**) deur **staan**, **stap** en **loop** tot rooi (**ongemaklik**): die aktiwiteit waarvan die grensspoed (4, 6, 8 en 10 m/s) vir hoogstens 5 % van die ure oorskry word. 'n Tweede tabel gee die NEN 8100-graad (A tot E) uit die aandeel ure waarin die wind 5 m/s oorskry. Die rukfaktor vermenigvuldig die uurlikse gemiddelde om 'n effektiewe ruk te gee.

Hoe dit werk, in gewone woorde: 'n gitter-Boltzmann-groot-werwelingvloeioplosser (ons eie, in die biblioteek `lib/wind`) in 'n boks rondom die geboue, 'n windspoedprofiel wat met hoogte styg oor die gekose ruheid, en die spoed ongeveer 1.5 m bo die grond vergeleke met die spoed stroomop by 10 m. **Voorlopig** is vinnig en growwe; **Standaard** gebruik meer selle en loop baie langer. As die paneel sê die rooster is growwe (minder as 10 selle oor die hoogste gebou), of die vloei was nog besig om te verander, glo die kaart minder.

**Wat dit nie is nie.** Die oplosser is nagegaan op handboekvloeie (’n kanaal, ’n deksel-gedrewe holte) en op 'n kubus uitgevoer om te sien dat die windskaduwee en die spoedverhoging by die hoeke reg lyk. Dit is **nie** teen windtunnelmetings van geboue gevalideer nie, so elke resultaat is as ongevalideer gemerk. Moenie dit gebruik vir 'n ontwerpwaarde, 'n windlas of 'n beplanningsertifikaat nie: 'n windingenieur moet 'n behoorlike studie uitvoer en bevestig. Die plat grond, gladde geboumure, die weerstasie-ruheid-kortpad en die drempeltabel is vereenvoudigings; die drempels kan verskil van die kriteria wat jou owerheid gebruik.

## Wind met OpenFOAM (byvoeging)

Die ingeboude windmotor hierbo is eksperimenteel. Vir 'n behoorlike vloeioplosser, skakel die **Voetganger-wind (OpenFOAM)**-byvoeging aan in **Instellings > Byvoegings** (dit is af totdat jy dit doen). Dit is sy eie GPL-gelisensieerde sagteware, apart gehou van die res van CadCraft, en dit sluit OpenFOAM nie in nie: jy installeer dit self. Dan lys **Motor** in die wind-blok OpenFOAM.

Wat jy eenmalig opstel:
1. **Installeer OpenFOAM** (die ESI v-reeks van openfoam.com; die byvoeging is met v2512 getoets). Op Ubuntu of Debian (ook binne WSL op Windows): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, en dan `sudo apt install openfoam2512-default`. Dit installeer onder `/usr/lib/openfoam/openfoam2512`. CadCraft benodig `blockMesh`, `snappyHexMesh` en `simpleFoam` om te werk. (Die ouer `openfoam` 1912-pakket in Ubuntu se eie argief werk ook, maar sy funksie-voorwerpe val; die byvoeging lees dan self die resultaatlêers.)
2. **Begin die hulpprogram** vanuit die byvoeging se `runner`-vouer met Node.js: `node cc-openfoam-runner.mjs serve`. As OpenFOAM nie op die soekpad is nie, gee dit 'n klein `runner.json` met die pad na OpenFOAM se `etc/bashrc` (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) en begin dit met `--config runner.json`. Die hulpprogram luister net op hierdie rekenaar en druk 'n token uit.
3. **Plak die token** in die byvoeging se velde in die wind-blok (die adres bly `http://127.0.0.1:8765`) en druk **Kontroleer die hulpprogram**.

Dan werk **Voer windstudie uit** een geval per windrigting in die weerlêer: jou massas word 'n oppervlak (STL) in 'n boks wat volgens die gewone riglyn gegroot is (5 geboushoogtes rond en bo, 10 agter), met blockMesh en snappyHexMesh gemaas, as 'n bestendige k-epsilon RANS met 'n atmosferiese grenslaag-invoer oor die ruheid wat jy kies, en die spoed by 1.5 m word teruggelees en omgeskakel na dieselfde Lawson- en NEN 8100-klasse. Niks verlaat jou rekenaar nie.

**Wat is nagegaan.** Die teks hierbo sê dit gewoon en is deel van elke gestoorde CSV. Die byvoeging se saakskryf, resultaatlesing en die hele pyplyn is sonder OpenFOAM getoets, en 'n enkele kubus is by drie maaswydtes deur werklike OpenFOAM gedraai (die syfers is in die projeknotas). Dit is **nie** teen windtunnelmetings van geboue gevalideer nie. Dit is 'n voorlopige lesing, nie 'n ontwerpwaarde nie en nie 'n sertifikaat nie. Standaard k-epsilon oorskat turbulensie voor geboue, die grond is plat, mure is glad en daar is geen terrein of plantegroei nie.
