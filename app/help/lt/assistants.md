---
title: Leiskite DI asistentui dirbti su jūsų vietove
summary: Įjunkite asistentus Parametruose, kad kompiuteryje esantis asistentas galėtų skaityti atidarytą vietovę (taškus, paviršius, tūrius, profilius, sklypus), pridėti geodezinės nuotraukos taškus, įrašyti ir eksportuoti LandXML ar DWG per CadCraft Studio. Iki įjungimo išjungta.
keywords: dirbtinis intelektas, DI, asistentas, mcp, scenarijus, automatizavimas, studio, taškai, aukštis, pikietas, poslinkis, trasa, tūris, iškasa, pylimas, profilis, sklypas, landxml, dwg, usd, aplankai, leidimai, atjungti, veikla
from: d0356582
---

## Ko išmoksite

Kaip leisti DI asistentui (bet kuriam asistentui, kalbančiam MCP) dirbti su atidaryta vietove, ką jis gali ir ko negali, ir kaip jį sustabdyti.

## Ką asistentas gali daryti CivilCraft

| Ko prašo | Ką gauna | Reikia |
|---|---|---|
| Vietovė | Pavadinimas, vienetai, koordinačių sistema, taškų grupės, trasos, paviršiai, aikštelės, sklypai ir vamzdžiai | Skaityti |
| Geodezinės nuotraukos taškai | Numeris, rytai, šiaurė, aukštis ir aprašymas pagal grupę, pagal aprašymą arba stačiakampio ribose | Skaityti |
| Paviršiaus aukščiai | Esamas gruntas (arba suformuotas paviršius) bet kuriuose nurodytuose taškuose | Skaityti |
| Pikietai ir poslinkiai | Taško pikietas ir poslinkis palei trasą arba pikietų koordinatės ir grunto aukštis | Skaityti |
| Profilis | Grunto, projektinio profilio ir suformuoto paviršiaus aukščiai palei trasą, kas nurodytą pėdų ar metrų atstumą | Skaityti |
| Iškasos ir pylimai | Tūriai tarp esamo grunto ir suformuoto paviršiaus (taip pat kiekvienai aikštelei ir koridoriui) arba tarp grunto ir lygio | Skaityti |
| Sklypai | Kampai, plotas (su akrais arba hektarais), perimetras ir teisinis aprašymas | Skaityti |
| Pasirinkimas | Nurodyti taškai pažymimi plane, tarsi būtumėte juos pasirinkę patys | Redaguoti |
| Nauji geodezinės nuotraukos taškai | Pridedami taškai su jo nurodytais numeriais arba kitais laisvais. Kiekvienas kvietimas – vienas žingsnis, kurį galite atšaukti | Redaguoti |
| Įrašymas | CivilCraft savo {{ui:Įrašyti}} | Įrašyti |
| LandXML arba DWG | Tie patys failai, kaip ir mygtukų {{ui:LandXML}} ir {{ui:DWG}} | Eksportuoti |
| Vietovė 3D | OpenUSD (.usdz, .usda arba .usdc) grunto, suformuoto paviršiaus, aikštelių ir vamzdžių, kaip 3D vaizdas juos eksportuoja | Eksportuoti |
| Augalai ir augalų žiniaraštis | Augalai, rasti augalų sąraše pagal bet kurį pavadinimą, ir augalų žiniaraščio kiekiai | Skaityti |
| Sodinimas ir vertikalusis planavimas | Įdedami augalai, gėlynas arba gyvatvorė, arba pridedama aikštelė, pylimėlis, griovelis ar reljefo formavimo plotas; kiekvienas – vienas žingsnis, kurį galite atšaukti, su iškasa ir pylimu | Redaguoti |
| Laistymo patikra | Kiekvienos zonos debitas, slėgis, reikalingas prie jos vožtuvo ir tiekimo vietoje, blogiausio atvejo slėgio aukštis, veikimo trukmė, problemos ir medžiagų sąrašas – kaip skaičiavimo pagalba, kurią patikrina laistymo projektuotojas | Skaityti |

Jis veikia su atidaryta vietove. Studio programoje jis taip pat gali įrašyti ir eksportuoti į jūsų pasirinktus aplankus (žemiau); be aplanko jo failai atsisiunčiami taip pat, kaip ir mygtukais.

## Įjunkite

Asistentai pasiekia CivilCraft per CadCraft Studio jūsų kompiuteryje; paprasta naršyklė tam kelio neturi.

1. Atidarykite {{ui:Parametrai}} ir pasirinkite skirtuką **CivilCraft**.
2. Skyriuje **Asistentai** pažymėkite **Leisti DI asistentams ir scenarijams naudoti CivilCraft**.
3. **Skaityti** pažymėtas jums automatiškai. Pažymėkite **Redaguoti**, **Įrašyti** arba **Eksportuoti** tik tada, kai to reikia asistentui.
4. Kad jis galėtų įrašyti ir eksportuoti į aplanką, pasirinkite {{ui:Pridėti aplanką…}} skyriuje **Aplankai, kuriuos gali naudoti**, o Studio dialoge pasirinkite aplanką. {{ui:Pašalinti}} jį iš karto atima; bet koks kitas kelias atmetamas.
5. Prijunkite asistentą Studio programoje (Studio parodo adresą ir nustatymus, kuriuos reikia įklijuoti į jį).

## Kol asistentas prijungtas

Dešiniojo skydelio viršuje pastaboje rodoma, kuris asistentas prijungtas ir ką jis gali daryti. Spustelėkite {{ui:Atjungti}}, kad iš karto baigtumėte jo sesiją; norėdamas tęsti, jis turi prisijungti iš naujo.

**Veikla**, po **Asistentai** Parametruose, išvardija visus asistento iškvietimus, naujausius pirma, su nurodymu, ar jie pavyko.

:::tip
Klauskite paprastais žodžiais, pavyzdžiui: „koks grunto aukštis kas 50 pėdų palei Main Street?“, „kiek iškasų ir pylimų reikia aikštelėms?“ arba „pridėk kontrolinį tašką šiomis koordinatėmis“. Asistentas perskaito vietovę ir atsako arba atlieka pakeitimą kaip vieną žingsnį, kurį galite atšaukti.
:::

## Be CivilCraft lango

CadCraft failų serveris asistentams (`npx @getcadcraft/mcp`) ir `cadcraft` komandinė eilutė atidaro išsaugotus CivilCraft projektus (`.civilcraft.json`) ir taškų failus naudodami paties CivilCraft kodą, be lango: tos pačios skaitymo priemonės, taškų pridėjimas, projekto įrašymas, LandXML ir vietovė 3D kaip OpenUSD. `cadcraft convert site.civilcraft.json site.xml` iš komandinės eilutės įrašo LandXML. LandXML atidarymui, DWG eksportui ir Landscape darbo srities įrankiams vis dar reikia CivilCraft lango.

## Išjunkite

Atžymėkite **Leisti DI asistentams ir scenarijams naudoti CivilCraft**. Visi asistentai iš karto atjungiami, o nustatymas išsaugomas kitam kartui.

## Žr. taip pat

- [Receptai DI asistentams](common:assistants-recipes): darbo pavyzdžiai, kiekvienas su jo kviečiamomis priemonėmis.
- [Horizontaliosios trasos išdėstymas](topic:alignment)
- [Paviršiaus sudarymas ir tobulinimas](topic:build-surface)
- [Geodezinės nuotraukos taškų pasirinkimas, kopijavimas ir įklijavimas](topic:copy-paste-points)
- [CivilCraft nustatymai](topic:settings)
