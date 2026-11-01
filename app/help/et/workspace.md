---
title: Ekraan, osa kaupa
summary: Iga CivilCraft'i riba ja paneel oma ekraanil oleva nime järgi, tööriistaribalt olekuribani.
keywords: liides, ekraan, tööriistariba, paneelid, omadused, olekuriba, profiilivaade, paigutus, ekskursioon, ui
from: 76272010
---

CivilCraft'il on üks ekraan. Vahelehti ega paigutusi pole. Külgpaneele saab liigutada, ujuvaks muuta või viia eraldi aknasse: vaata [Paneelide paigutamine ja teise monitori kasutamine](common:arrange-panels). Ülevalt alla ja vasakult paremale:

- **rakendusriba** (CadCraft'i logo, rakenduse nimi, versioon, Teave CivilCraft'i kohta, ekraanirežiim, Abi, Salvesta võrguks, Paber ja Mudel)
- **tööriistariba** seitsme nupugrupiga
- **vasakpaneel**: Ala, Punktid, Pind, Kuva ja pärast mõne GIS-faili importimist GIS-kihid
- **plaan** keskel, profiilivaade all, kui see on avatud
- **parempaneel**: valitud objekti omadused
- **olekuriba** allservas

## Rakendusriba

Ülaosas olev õhuke riba kuulub CadCraft'i saidile, mitte CivilCraftile endale.

- Versioonimenüü näitab, millist versiooni käivitad.
- {{ui:Teave CivilCraft'i kohta}} avab rakenduse lehe saidil.
- {{ui:Täisekraan}} vahetab ekraanirežiime: täisekraan, siis täisekraan ilma ribadeta, siis tagasi tavaliseks. {{key:Ctrl+Shift+F}} teeb sama kõigil platvormidel, sh Macil (seal on Control-klahv, mitte Command). Kui ribad on peidetud, too osuti ülaserva, et need tagasi tuua.
- {{ui:Abi}} (või {{key:F1}}) avab selle abi külgpaneelis; {{key:F1}} või {{key:Esc}} sulgeb selle.
- {{ui:Salvesta võrguks}} hoiab CivilCraft'i selles brauseris, nii et see avaneb ilma ühenduseta; siis näitab see {{ui:Valmis ka võrguta}}. Vaata [Failid, mida saad avada, salvestada ja eksportida](topic:files#online-and-offline).
- {{ui:Paber}} ja {{ui:Mudel}} vahetavad heledat ja tumedat teemat. Plaan ja profiil järgivad teemat; PDF-id prinditakse alati valgel.

## Tööriistariba

Igal grupil on väike silt oma nuppude kohal. Hoia osutit nupu kohal, et näha selle vihjet ja klahvi.

| Grupp | Nupud | Mida nad teevad |
|---|---|---|
| Fail | {{ui:Uus}}, {{ui:Ava}}, {{ui:Salvesta}} | Alusta uuesti, ava punktifail, LandXML või projekt, salvesta projekt allalaadimisena |
| Eksport | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | Kirjuta LandXML 1.2, R12 DXF või plaani DWG, või plotti plaan PDF-iks |
| Pind | {{ui:Murdejoon}}, {{ui:Piirjoon}} | Joonista murdejoon mõõdistuspunktide kaudu; joonista välispiir |
| Projekt | {{ui:Trass}}, {{ui:Plats}}, {{ui:Torud}}, {{ui:Pikiprofiil}} | Joonista trass, plats või torustik; näita või peida profiilivaade |
| Redigeerimine | {{ui:Võta tagasi}}, {{ui:Tee uuesti}}, {{ui:Kopeeri}}, {{ui:Kleebi}}, {{ui:Veel}} | Võta tagasi, tee uuesti, kopeeri ja kleebi mõõdistuspunkte; {{ui:Veel}} sisaldab Lõika, Kleebi kohale, Dubleeri, Kustuta, Vali kõik punktid ja Tühista valik |
| GIS | {{ui:Koordinaadid}}, {{ui:Impordi}}, {{ui:Ekspordi}}, {{ui:Kaart}} | Määra koordinaatsüsteem, impordi ja ekspordi GIS-failid, näita plaani all kaardikihte |
| Vaade | {{ui:Vali}}, {{ui:Sobita}}, {{ui:3D}} | Vali ja teisalda asju; suumi nii, et kõik oleks näha; näita ala 3D-na ([Vaata ala 3D-s](topic:site-3d)) |

Joonistustööriist jääb vajutatuks, kuni see on aktiivne. Selle klõpsamine uuesti, klahvi {{key:Esc}} või klahvi {{key:V}} vajutamine viib tagasi nupule {{ui:Vali}}. {{ui:Võta tagasi}}, {{ui:Tee uuesti}}, {{ui:Kopeeri}} ja {{ui:Veel}} loendi kirjed on hallid, kui need ei saa töötada; vihje ütleb põhjuse (näiteks „Vali esmalt mõõdistuspunktid“). Iga nupp on loetletud [Tööriistariba viiteliidis](topic:toolbar).

Kitsal aknal kerib tööriistariba küljele.

## Vasakpaneel

### Ala

- **Nimi**: projekti nimi. See annab nime igale salvestatud või eksporditud failile ja on trükitud PDF-i pealkirjaribale.
- **Ühikud**: {{ui:USA jalad}} või {{ui:Meetrid}}. See ütleb, mida arvud tähendavad. Selle muutmine **ei** teisenda koordinaate; vaata [Ühikud, jaamad ja arvuvormingud](topic:units-and-stations).

### Punktid

Tühjana ütleb see, kuidas punktifaili avada. Kui punkte on, näitab see faili nime, punktide arvu ja mitmel on kõrgus, ning seejärel tabeli **punktirühmadega**: üks rida iga kirjelduse esimese sõna kohta (GRD, FL, TBS …), koos arvuga ja valikuga **Pind**:

- {{ui:Punktid}}: punktid lähevad pinda (vaikimisi kõigi rühmade puhul).
- {{ui:Murdejoon}}: rühma punktid ühendatakse punktinumbrite järjekorras üheks murdejooneks.
- {{ui:Jäetakse välja}}: rühm ei puutu pinda.

### Pind

Faktid olemasoleva maapinna kohta: punktid, kolmnurgad, madalaim ja kõrgeim kõrgus, keskmine kõrgus, 2D- ja 3D-pindala ning murdejooned ja kas on piirjoon. Faktide all on kast, mis loetleb kõik, mida pinnakoostaja pidi parandama või ei saanud teha. Seejärel:

- **Pikim väliserv**: 0 säilitab kõik väliskolmnurgad; arv lõikab pikad ja kitsad väliskolmnurgad ära.
- Lingid ilmuvad, kui need kehtivad: {{ui:Eemalda piir}}, {{ui:Eemalda joonistatud murdejooned}} ja LandXML-ist loetud pinna puhul {{ui:Koosta pind uuesti punktidest}}.

### Kuva

- **Pind**: {{ui:Olemasolev maapind}} või {{ui:Projekteeritud (planeeritud)}}. Teine on saadaval, kui plats või koridor planeerib ilma probleemideta.
- **Samakõrgusjooned iga**, **Põhijoon iga** ja **Vööndid** (värvivööndite arv).
- Märkeruudud: {{ui:Samakõrgusjooned}}, {{ui:Samakõrgusjoonte sildid}}, {{ui:Kolmnurgad}}, {{ui:Kõrgusvööndid}}, {{ui:Nõlvanooled}}, {{ui:Punktid}}, {{ui:Punktide sildid}}, {{ui:Murdejooned}}, {{ui:Pinna serv}}, {{ui:Torud}}.
- Kui vööndid on sees, ilmub vööndite kõrguste legend.

Kuvaseaded salvestatakse projektiga, kuid need ei ole tagasivõtmise sammud: {{key:Mod+Z}} ei pööra märkeruutu kunagi tagasi.

## Plaan

Plaan näitab punkte, pinda ja kõike, mida projekteerid, plaanivaates, põhi üleval. Rullik suumib osuti kohal; lohista tühja ala, et nihutada. Täielik loend on [Klahvid ja hiir](topic:keyboard).

- Tühjal projektil on kast pealkirjaga **Alusta mõõdistuspunktidega**, mis loetleb esimesed sammud ja pakub {{ui:Ava näidisala}}.
- Kui joonistustööriist on aktiivne, ütleb vihje plaani ülaosas, mida klõpsata ja kuidas lõpetada.
- Faili lohistamine plaanile kuvab „Lohista punktifail, LandXML või projekt“.
- Valitud asjad on esile tõstetud. Valitud trassil või platsil on nurkades või PI-del ruudukujulised haarded; valitud rajatisel üks haar. Lohista haarast, et teisaldada.
- Valitud mõõdistuspunktidel on rõngas. {{key:Shift}} ja klõps lisab punkti või eemaldab selle; {{key:Shift}} ja lohistamine joonistab kasti (või ümber punktide lohistades lasso), mis lisab sinna jäävad punktid. Vaata [Vali, kopeeri ja kleebi mõõdistuspunkte](topic:copy-paste-points).

## Profiilivaade

Vajuta {{key:R}} või klõpsa {{ui:Pikiprofiil}}, et see avada plaani all. Selle riba sisaldab:

- trasside loendit (lubatud, kui trasse on kaks või rohkem)
- {{ui:Lisa PVI-d}}: kui see on vajutatud, lisab klõps profiilis PVI-d ({{key:I}} lülitab selle)
- näitu jaama, maapinna, projekteeritud kõrguse, kalde ning väljakaevamise või täite kohta osuti all
- sulgemisnupu

Profiil näitab olemasolevat maapinda, projekteeritud profiili, kallet igal sirgel, iga PVI jaama ja kõrgust, iga vertikaalkõvera L-i ja K-d koos BVC-ga ja EVC-ga, kõrg- ja madalpunkte ning vertikaalset liialdust. See sobitub alati kogu trassiga: ei suumi ega nihuta. Liigutades osutit mööda seda, paneb see plaanile trassil punkti.

## Paremal paneel: Omadused

Pealkiri ütleb, mida ta näitab.

- **Projekt** (midagi pole valitud): trassid ja platsid lingina, plokk **Pinnasetööd** ja plokk **Torustik** koos reeglite ja probleemidega.
- **Trass**: nimi, algjaam, pikkus, PI-tabel, kõverad, projekteeritud profiili PVI-tabel ja faktid ning **Koridori** seaded.
- **Plats**: nimi, kõrgus, väljakaeve- ja täitekalded, pindala, maapinnaga lõikumise faktid ja pinnasetööd.
- **Rajatis** või **Toru**: mõõdud, kaevude pealmised servad, põhjad, kalle, katvus ja probleemid.
- **Punkt** ja selle number: punkti koordinaadid, kõrgus, kirjeldus ja rühm (ainult lugemiseks).

Väljad rakenduvad, kui vajutad {{key:Enter}} või lahkud väljalt. Vastuvõtmata väärtus on märgitud kehtetuks ja midagi ei muutu.

## Olekuriba

- **E** ja **N**: osuti all olev ida- ja põhjakoordinaat.
- **Maapind** seal olev kõrgus (ja **Planeeritud**, kui plats või koridor seda muutis), või „Pinnast väljas“.
- Lähim trass (või valitud trass) koos **Sta** ja nihkega (**L** või **R**) osuti all.
- Paremal sõnumid: mis just juhtus või miks midagi tagasi lükati. Sõnum kaob ise mõne sekundi pärast.

## Dialoogid

- **Impordi punktid**: avaneb iga punktifaili puhul. Vaata [Mõõdistuspunktide import](topic:import-points).
- **Plaani plottimine PDF-iks**: vaata [Plaani plottimine PDF-iks](topic:plot-pdf).
- **Salvestamata muudatused**: küsib enne {{ui:Uus}}-t või projekti või LandXML-faili avamist, kas loobuda salvestamata tööst. {{ui:Salvesta koopia}} laeb esmalt projekti alla.

## Väikesed ekraanid

Kuni 760 pikslit laiuses, nagu telefonil, jätab plaan ekraani alles: tööriistariba on üks rida, mis kerib küljele, ja paneelid avanevad lehtedena alumiselt ribalt. {{ui:Tööriistad}} peidab tööriistariba ja {{ui:Teisaldamine}} paneb selle alla.
