---
title: Koridoriaus šablonai ir reljefo šablonai
summary: Kurkite mažus, pakartotinai naudojamus šablonus (bordiūras ir latakas, šaligatvis, siena, griovys), statykite koridorių iš jų pagal pikketą su atskirtomis kairiąja ir dešiniąja puse, skaidykite trasą į kelis koridorius ir uždenkite sluoksniuotas medžiagas ant reljefo.
keywords: šablonas, šablonai, šablonų biblioteka, šablono kūrimas, tipinis skerspjūvis, skerspjūvio dalis, komponentai, taškų kodai, galo sąlyga, išėjimas, griovys, atraminė siena, bordiūras, latakas, šaligatvis, ruožai, pikketų ruožai, keli koridoriai, kairė ir dešinė, reljefo šablonas, derlingasis sluoksnis, danga, pagrindas, uždengimas, medžiagos, kiekiai
from: ce70e58b
---

**Šablonas** – tai mažas skerspjūvis, kurį nubrėžiate vieną kartą ir pakartotinai naudojate: taškai su poslinkiais, nuolydžiais ir taškų kodais bei komponentai su medžiagomis. Koridorius gali būti sudarytas iš šablonų pagal pikketą, kiekviena pusė su savo dangos šablonais ir savo galo sąlyga, o tuos pačius šablonus galima uždengti ant reljefo.

:::warning
Pavyzdiniai šablonai yra vietos rezervuotojai, nuo kurių pradėti. Jų skaičiai nepaimti iš jokio standarto ar agentūros. Inžinierius turi patikrinti kiekvieną šabloną ir kiekvieną jam įvestą reikšmę prieš naudojant projekte.
:::

## Atidaryti šablonus

Atidarykite {{ui:Paviršius}} › {{ui:Daugiau}} › {{ui:Koridoriaus šablonai…}} (arba įveskite {{cmd:TEMPLATES}}). Lange yra trys sąrašai:

- **Šiame projekte**: šablonai, kuriuos naudoja šio projekto koridoriai ir reljefo šablonai. Jie išsaugomi projekto faile.
- **Mano biblioteka**: šablonai, laikomi šioje naršyklėje ir siūlomi kiekviename projekte. Norėdami išsaugoti projekto šabloną, naudokite {{ui:Įrašyti į Mano biblioteką}}.
- **Pavyzdžiai**: dvi eismo juostos su sluoksniais, bordiūras ir latakas, šaligatvis, išėjimas, griovys, atraminė siena, derlingasis sluoksnis žemiau reljefo ir danga ant reljefo. Kiekvienas pažymėtas „Skirta inžinieriaus patikrinimui“.

{{ui:Naudoti šiame projekte}} nukopijuoja bibliotekos ar pavyzdžio šabloną į projektą. {{ui:Eksportuoti šio projekto šablonus}} išsaugo juos kaip `.cctemplates.json` failą, o {{ui:Importuoti failą}} nuskaito vieną į projektą ir Mano biblioteką. Failą naudokite šablonams bendrinti arba perkelti į kitą kompiuterį.

## Sukurti šabloną

{{ui:Naujas šablonas}} (arba {{ui:Redaguoti}} projekto šablone) atidaro šablono redaktorių. Braižykite dešinę pusę iš šablono 0,0 taško į išorę; kairėje pusėje tas pats šablonas naudojamas į išorę į kairę.

1. Suteikite pavadinimą ir rūšį: **Danga** (kitas šablonas prisijungia prie jo galo), **Galo sąlyga** (jis susitinka su gruntu) arba **Reljefo šablonas**.
2. Pridėkite **reikšmes**: pavadintus skaičius, pavyzdžiui pločio `w` arba nuolydžio `s`. Skaičių langelis bet kurioje šablono vietoje priima skaičių arba reikšmės pavadinimą; `-t` yra reikšmė `t`, paversta neigiama. Koridorius gali suteikti kiekvienam šablono panaudojimui savas reikšmes, todėl vienas bordiūro šablonas tinka kiekvienam bordiūro aukščiui.
3. Pridėkite **taškus** eile. Kiekvienas dedamas iš ankstesnio taško (arba 0,0 taško) pagal savo apribojimą:

| Apribojimas | Ką nustato taškas |
|---|---|
| Poslinkis pagal nuolydį | Poslinkis į išorę ir nuolydis (pakilimas tenkant nuotoliui; −0.02 reiškia 2 % nuokalnę) |
| Poslinkis ir pakilimas | Poslinkis ir pakilimas |
| Tiesiai aukštyn arba žemyn | Tik pakilimas |
| Šoninis nuolydis iki grunto | Iš jo taško iki grunto: iškasos santykiu, kai gruntas aukščiau, ir pylimo santykiu, kai žemiau |
| Iki grunto | Poslinkis, tada tiesiai aukštyn arba žemyn iki grunto |
| Atraminė siena | Siena nurodyto storio: iškasoje jos viršus susitinka su gruntu kelio paviršiuje, pylime kelias eina per ją, o jos išorinis paviršius nusileidžia iki grunto |

   Pažymėkite **Viršus** taškams, per kuriuos eina baigtas paviršius. Paskutinis viršutinis taškas yra vieta, kur toje pusėje prasideda kitas šablonas. **Tikslas** leidžia koridoriui perkelti tašką: jo poslinkį ar aukštį paima iš linijos.
4. Pridėkite **komponentus**: uždaras formas per taškų kodus (`0` yra 0,0 taškas), kiekviena su pavadinimu, medžiaga ir rūšimi. Jų plotai duoda tūrius.

Brėžinys seka kiekvieną pakeitimą tikru mastu, o sąrašas po juo nurodo, kas netinka (taškas, kuris pasiekia gruntą prieš galą, reikšmė, kurios šablonas neturi, komponentas be ploto). {{ui:Pridėti į šį projektą}} arba {{ui:Įrašyti}} išsaugo jį kaip vieną anuliavimo žingsnį.

## Sudaryti koridorių iš šablonų

Pasirinkite trasą su koridoriumi ir jos **Ypatybėse** įjunkite {{ui:Statyti pagal šablonus pagal pikketą}}. Koridorius prasideda nuo dviejų eismo juostų ir išėjimo pavyzdžių abiejose pusėse.

- **Ruožai.** Kiekvienas ruožas prasideda pikketu ir eina iki kito ruožo pradžios. {{ui:Pridėti ruožą}} prideda vieną; pakeiskite jo pradžios pikketą jo langelyje.
- **Kairė ir dešinė atskirai.** Kiekviena ruožo pusė turi savo sąrašą **Danga**, einantį nuo centrinės linijos į išorę, ir savo **Galo sąlygą**: išėjimą, griovį, sieną arba bet kurį šabloną, kuris liečia gruntą. Be galo sąlygos pusė išeina iki koridoriaus iškasos ir pylimo nuolydžių. {{ui:Kopijuoti iš kairės į dešinę}} nukopijuoja pusę.
- **Reikšmės ir tikslai.** Po kiekvienu šablonu vienoje pusėje yra langelis kiekvienai reikšmei (tuščias = paties šablono reikšmė) ir, taškui, kuris priima tikslą, – linija, kurią perkelia charakteristinė linija ar kito koridoriaus linija.
- **Nuo** ir **Iki** riboja koridorių tam tikra trasos dalimi.

Pjūviai, planų linijos kiekvienam taškų kodui, projektuojamas paviršius, nužymėjimas ir žemės darbai visa tai seka. Ypatybėse kiekvieno komponento tūris rodomas pagal pusę ir ruožą (vidutiniai galų plotai išilgai centrinės linijos). Viražas ir koridoriaus kraštų tikslai nenaudojami, kol koridorius statomas iš šablonų.

## Keli koridoriai vienoje trasoje

Skiltyje **Koridoriai šioje trasoje** {{ui:Pridėti koridorių}} prideda koridorių likusiai trasos daliai: pirmasis koridorius gauna pabaigos pikketą viduryje (arba išlaiko savąjį), o naujasis prasideda ten su paskutinio pirmojo koridoriaus ruožo šablonais. Kiekvienas koridorius turi savo pavadinimą, pikketų ruožą, šablonus ir žemės darbus. Išjunkite vieną su jo {{ui:Įjungta}} langeliu. Kur du ruožai persidengia, vėlesnis koridorius formuojamas virš ankstesniojo.

## Reljefo šablonai

Reljefo šablonas uždengia šablono sluoksnius ant reljefo nuo jo 0,0 taško: sluoksnis žemiau 0,0 taško patenka į gruntą (derlingasis sluoksnis, kurį reikia nuimti), o sluoksnis aukščiau jo guli ant grunto (pagrindas ir danga automobilių aikštelėje). Plotis ir nuolydžiai nesvarbūs, svarbus tik kiekvieno komponento gylis aukščiau ar žemiau 0,0 taško.

Atidarykite {{ui:Paviršius}} › {{ui:Daugiau}} › {{ui:Reljefo šablonai…}} (arba įveskite {{cmd:TERRAINTEMPLATES}}); blokas taip pat yra projekto **Ypatybėse**. {{ui:Pridėti reljefo šabloną}} prideda vieną su derlingojo sluoksnio pavyzdžiu. Kiekvienam pasirinkite:

- **šabloną** (jo reikšmes galima pakeisti tik šiam),
- **reljefą**: esamą gruntą arba projektuojamą paviršių,
- **formą**, kuri jį apkarpo: visą reljefą, sklypą, aikštelę arba uždarą charakteristinę liniją. Keli reljefo šablonai gali naudoti skirtingas formas tame pačiame reljefe.

Kiekvienas sluoksnis rodo savo storį, plano plotą ir tūrį. Tūris – tai plano plotas, padaugintas iš storio, storis matuojamas tiesiai žemyn; plotas matuojamas tinklelyje, be to pateikiamas ir uždengtas (nuožulnus) plotas. Formos braižomos plane sluoksnyje C-TOPO-TMPL. Reljefo šablonai nekeičia projektuojamo paviršiaus.

## Medžiagos ir kiekiai

Projekto **Žemės darbų** bloke išvardytos **Medžiagos iš šablonų**: kiekvienas koridoriaus komponentas ir reljefo šablono sluoksnis su savo tūriu. {{ui:Siųsti į TakeoffCraft}} įrašo juos į kiekių failą po iškasos ir pylimo, po vieną įrašą, kubiniais jardais (pėdų projektams) arba kubiniais metrais.

## Failai

Šablonai, ruožai, papildomi koridoriai ir reljefo šablonai išsaugomi projekto faile. Projektas, kuris jų nenaudoja, išsaugomas kaip anksčiau, o senesnės CivilCraft versijos atidaro projektą, kuriame jie naudojami (jos ignoruoja šablonus ir sukuria paties koridoriaus tipinį skerspjūvį).
