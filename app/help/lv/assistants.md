---
title: Ļaut MI asistentam strādāt ar jūsu objektu
summary: Ieslēdziet asistentus iestatījumos, lai asistents jūsu datorā varētu lasīt atvērto objektu (punktus, virsmas, tilpumus, garenprofilus, zemesgabalus), pievienot uzmērījuma punktus un saglabāt vai eksportēt LandXML un DWG caur CadCraft Studio. Līdz to ieslēgsiet, tas ir izslēgts.
keywords: mi, asistents, mcp, skripts, automatizācija, studio, punkti, augstums, pikets, nobīde, trase, tilpums, izrakums, uzbērums, garenprofils, zemesgabals, landxml, dwg, usd, mapes, atļaujas, atvienot, aktivitāte
from: d0356582
---

## Ko jūs uzzināsit

Kā ļaut MI asistentam (jebkuram asistentam, kas runā MCP) strādāt ar atverto objektu, ko tas var un nevar darīt, un kā to apturēt.

## Ko asistents var darīt CivilCraft

| Tas pieprasa | Ko tas saņem | Nepieciešams |
|---|---|---|
| Objekts | Nosaukums, mērvienības, koordinātu sistēma, punktu grupas, trases, virsmas, platformas, zemesgabali un caurules | Lasīt |
| Uzmērījuma punkti | Numurs, austrumi, ziemeļi, augstums un apraksts pēc grupas, pēc apraksta vai kastē | Lasīt |
| Virsmas augstumi | Esošais terēns (vai izlīdzinātā virsma) jebkuros punktos, ko tas nosauc | Lasīt |
| Pikets un nobīdes | Punktu pikets un nobīde gar trasi vai staciju koordinātes un terēna augstums | Lasīt |
| Garenprofils | Terēna, projektētā profila un izlīdzinātās virsmas augstumi gar trasi, ik pēc tik pēdām vai metriem | Lasīt |
| Izrakums un uzbērums | Tilpumi starp esošo terēnu un izlīdzināto virsmu (arī katrai platformai un koridoram) vai starp terēnu un līmeni | Lasīt |
| Zemesgabali | Stūri, platība (akros vai hektāros), perimetrs un juridiskais apraksts | Lasīt |
| Atlase | Punkti, ko tas nosauc, tiek atlasīti plānā, it kā jūs tos būtu izvēlējies | Rediģēt |
| Jauni uzmērījuma punkti | Punkti, pievienoti ar numuriem, ko tas dod, vai nākamajiem brīvajiem. Katrs izsaukums ir viens solis, ko var atsaukt | Rediģēt |
| Saglabāt | CivilCraft pašu {{ui:Saglabāt}} | Saglabāt |
| LandXML vai DWG | Tie paši faili, kas pogām {{ui:LandXML}} un {{ui:DWG}} | Eksports |
| Objekts 3D | OpenUSD (.usdz, .usda vai .usdc) terēna, izlīdzinātās virsmas, platformu un cauruļu, kā to eksportē 3D skats | Eksports |
| Augi un augu specifikācija | Augi, kas atrasti augu sarakstā pēc jebkura nosaukuma, un augu specifikācijas skaitļi | Lasīt |
| Stādīšana un izlīdzināšana | Augi, dobe vai dzīvžogs novietoti, vai pievienota platforma, valnis, ieplaka vai izlīdzināšanas laukums, katrs kā viens solis, ko var atsaukt, ar tā izrakumu un uzbērumu | Rediģēt |
| Laistīšanas pārbaude | Katras zonas plūsma, spiediens, kas vajadzīgs tās vārstā un padevē, sliktākā gadījuma spiediens, darbības laiki, problēmas un materiālu saraksts, kā aprēķina palīgs, ko pārbauda laistīšanas projektētājs | Lasīt |

Tas strādā ar atvērto objektu. Studio tas var arī saglabāt un eksportēt izvēlētās mapēs (zemāk); bez mapes tā faili tiek lejupielādēti tāpat kā pogām.

## Ieslēgt

Asistenti piekļūst CivilCraft caur CadCraft Studio jūsu datorā; parastajai pārlūkprogrammai nav piekļuves.

1. Atveriet {{ui:Iestatījumi}} un izvēlieties cilni **CivilCraft**.
2. Zem **Asistenti** atzīmējiet **Ļaut MI asistentiem un skriptiem izmantot CivilCraft**.
3. **Lasīt** jums jau ir atzīmēts. Atzīmējiet **Rediģēt**, **Saglabāt** vai **Eksportēt** tikai tad, kad asistentam tie vajadzīgi.
4. Lai ļautu tam saglabāt un eksportēt mapē, izvēlieties {{ui:Pievienot mapi…}} zem **Mapes, ko tas drīkst izmantot**, un izvēlieties mapi Studio dialogā. {{ui:Noņemt}} to atņem uzreiz; jebkurš cits ceļš tiek noraidīts.
5. Savienojiet asistentu Studio (Studio rāda adresi un iestatījumus, ko ielīmēt tajā).

## Kamēr asistents ir savienots

Piezīme labā paneļa augšdaļā parāda, kurš asistents ir savienots un ko tas var darīt. Noklikšķiniet uz {{ui:Atvienot}}, lai tūlīt beigtu tā sesiju; lai turpinātu, tam jāsavienojas vēlreiz.

**Aktivitāte** zem **Asistenti** iestatījumos uzskaita katru asistenta izsaukumu, jaunākos vispirms, ar atzīmi, vai tas izdevās.

:::tip
Jautājiet vienkāršiem vārdiem, piemēram: „kāds ir terēna augstums ik pēc 50 pēdām gar Galveno ielu?”, „cik lielu izrakumu un uzbērumu prasa platformas?” vai „pievienojiet kontrolpunktu šajās koordinātēs”. Asistents lasa objektu un atbild vai veic izmaiņu kā vienu soli, ko var atsaukt.
:::

## Bez CivilCraft atvēršanas

CadCraft failu serveris asistentiem (`npx @getcadcraft/mcp`) un `cadcraft` komandrinda atver saglabātus CivilCraft projektus (`.civilcraft.json`) un punktu failus ar CivilCraft pašu kodu, bez loga: tie paši lasīšanas rīki, punktu pievienošana, projekta saglabāšana, LandXML un objekts 3D kā OpenUSD. `cadcraft convert site.civilcraft.json site.xml` raksta LandXML no komandrindas. LandXML atvēršanai, DWG eksportam un Ainavu darbvietas rīkiem joprojām vajadzīgs CivilCraft logs.

## Izslēgt

Noņemiet atzīmi no **Ļaut MI asistentiem un skriptiem izmantot CivilCraft**. Katrs asistents tiek nekavējoties atvienots, un iestatījums tiek saglabāts nākamreizei.

## Skatīt arī

- [Receptes MI asistentiem](common:assistants-recipes): darba piemēri, katrs ar izsauktajiem rīkiem.
- [Horizontālās trases izveide](topic:alignment)
- [Virsmas veidošana un precizēšana](topic:build-surface)
- [Atlasīt, kopēt un ielīmēt uzmērījuma punktus](topic:copy-paste-points)
- [CivilCraft iestatījumi](topic:settings)
