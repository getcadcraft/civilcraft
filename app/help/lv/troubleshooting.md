---
title: Problēmu novēršana
summary: Simptomi, cēloņi un risinājumi problēmām, ar kurām CivilCraft lietotāji saskaras, ar precīziem ziņojumiem, ko rāda lietotne.
keywords: problēmas, kļūdas, nedarbojas, labot, palīdzība, ziņojumi, novērst, noraidīts, trūkst, nepareizi, samainīts, horizontāles trūkst
from: a9f7dedc
---

Ziņojumi parādās statusa joslā apakšā labajā pusē, kreisā un labā paneļa lodziņos un dialogos. Tie citēti šeit tā, kā tos rāda lietotne.

## Failu atvēršana

**"Šis fails ir lielāks par 200 MB; CivilCraft vēl neatver tik lielus failus."**
Sadaliet punktu failu vai samaziniet datus, pirms to atverat.

**"Nevarēja atvērt site.json: Šis nav CivilCraft projekta fails."**
Fails beidzas ar `.json` vai sākas ar `{`, bet nav CivilCraft projekts. Punktu failiem nedrīkst sākties ar `{`.

**"Nevarēja atvērt … Šis projekta fails ir no jaunākas CivilCraft versijas (2. versija)."**
Projekts ir saglabāts jaunākā versijā. Atveriet to tur vai eksportējiet no tā LandXML.

**"Nevarēja atvērt … Šis ir XML, bet ne LandXML (tā saknes elements ir <…>)."**
Fails ir cita veida XML. Eksportējiet LandXML no citas programmas.

**"… nesatur punktus, TIN virsmas vai trases, ko CivilCraft var nolasīt."**
Viss failā ir kaut kas, ko CivilCraft izlaiž (piemēram, tikai režģa virsmas vai tikai spirāļu trases). Pārējā ziņojuma daļā norādīts, kas tajā bija. Skatiet [LandXML: kas tiek nolasīts un rakstīts](topic:landxml-reference).

**"Paraugu nevarēja ielādēt: …"**
{{ui:Atvērt parauglaukumu}} nolasa failu no CadCraft vietnes. Bez savienojuma tas darbojas tikai tad, ja CivilCraft ir saglabāts lietošanai bezsaistē (lietotnes joslas poga rāda {{ui:Gatavs darbam bezsaistē}}). Pārejiet tiešsaistē, noklikšķiniet uz {{ui:Saglabāt bezsaistei}}, un pēc tam tas darbojas arī bezsaistē. Skatiet [Bezsaiste](common:offline).

**{{ui:Saglabāt bezsaistei}} rāda {{ui:Neizdevās saglabāt}}.**
Daži faili netika lejupielādēti. Pārbaudiet savienojumu un noklikšķiniet uz pogas vēlreiz.

**{{ui:Saglabāt bezsaistei}} rāda {{ui:Bezsaiste nav pieejama}}.**
Šis pārlūka logs nevar saglabāt bezsaistes kopiju, parasti tāpēc, ka tas ir privātais logs vai dators ir pārvaldīts. Atveriet CivilCraft parastā logā.

**Bezsaistē lietotne vispār neatveras.**
Tā netika saglabāta lietošanai bezsaistē šajā pārlūkā, vai arī pārlūks notīrīja tās vietnes datus (Safari tā dara vietnēm, kas netiek apmeklētas vairākas nedēļas). Pārejiet tiešsaistē, atveriet CivilCraft un noklikšķiniet uz {{ui:Saglabāt bezsaistei}}.

**Bezsaistes kopija ir vecāka versija.**
Tiešsaistē noklikšķiniet uz {{ui:Gatavs darbam bezsaistē}}, pēc tam uz {{ui:Saglabāt vēlreiz (iegūt jaunāko versiju)}}.

**Fails atvēršanas logā ir pelēks.**
Lodziņā ir redzami tikai punktu faili, LandXML un projektu faili pēc to galotnēm. Vilciet failu uz plāna vai pārdēvējiet to par `.txt`.

## Punktu importēšana

**"No šī faila nevarēja nolasīt punktus."**
Izvēlieties kolonnu secību manuāli sadaļā **Kolonnas**. Ja nekas nedarbojas, atveriet failu teksta redaktorā un pārbaudiet, vai katrā rindā ir viens punkts un tajā ir skaitļi.

**Virsma izskatās spoguļota, pagriezta vai izstiepta līnijā.**
Ziemeļu un austrumu koordinātas ir samainītas. Kopsavilkumā bija teikts "noteikts pēc kolonnu skaita". Sadaļā **Kolonnas** izvēlieties PENZD, nevis PNEZD (vai otrādi), vai importējiet vēlreiz.

**Punkti tālu no pārējiem, un plāns ir attālināts līdz punktiņam.**
Rindā ir koordinātas drukas kļūda, vai arī failā ir sajauktas koordinātu sistēmas. Atrodiet punktu (noklikšķiniet uz tā, lai redzētu tā numuru) un izlabojiet failu.

**Rindas, kas uzskaitītas sadaļā "Rows not read".**
Skatiet tabulu sadaļā [Importēt uzmērījuma punktus](topic:import-points#rows-that-are-not-read).

**Mani vecie punkti ir pazuduši.**
Punktu faila importēšana aizstāj visus punktus un notīra atcelšanas vēsturi. Atveriet saglabāto projektu, lai tos atgūtu.

## Virsma

**"Surface: Not built" ar sarkanu lodziņu.**
Lodziņš norāda iemeslu: "Virsmai vajag vismaz trīs punktus ar augstumiem.", "Visi punkti ir uz vienas līnijas: nav trijstūru.", "Nav punktu ar augstumiem.", "Robeža nepārklājas ar punktiem." vai "Iekšpus robežas nav palicis neviens trijstūris." Pārbaudiet kolonnu secību, punktu grupas (vai tās ir {{ui:Atstāts ārpusē}}?) un robežu.

**Horizontāles šķērso grāvi vai grēdu taisni.**
Šī līnija nav lūzumlīnija. Iestatiet tās grupu uz {{ui:Lūzumlīnija}} vai zīmējiet to ar rīku {{ui:Lūzumlīnija}}. Skatiet [Virsmas izveide un precizēšana](topic:build-surface).

**Lūzumlīnijas grupa zīmē zigzagu.**
Grupā ir vairāk nekā viena līnija, vai arī tās punkti nav numurēti pa līniju. Iestatiet grupu atpakaļ uz {{ui:Punkti}} un zīmējiet katru līniju ar rīku {{ui:Lūzumlīnija}}.

**Gari, plāni trijstūri ārpusē.**
Zīmējiet robežu ({{key:O}}) vai iestatiet **Garākā ārējā mala**.

**Nav nevienas horizontāles, lai gan virsma ir izveidota.**
Vai nu {{ui:Horizontāles}} ir izslēgtas sadaļā **Attēlojums**, vai arī intervāls ir tik mazs, ka būtu vairāk nekā 2,000 horizontāļu līmeņu. Izvēlieties lielāku intervālu.

**Lūzumlīnijas vai robeža neko nemaina.**
Virsma nāk no LandXML ("Surface (from LandXML)"). Tā tiek izmantota kā ir. Noklikšķiniet uz {{ui:Pārbūvēt virsmu no punktiem}}, lai tā tiktu veidota no punktiem.

**"There is no surface yet: open survey points first."**
Lūzumlīnijai, robežai un platformai vajag esošu zemes virsmu. Vispirms importējiet punktus.

**"Click a survey point with an elevation: a breakline takes the points’ elevations."**
Rīks {{ui:Lūzumlīnija}} atlasa tikai uzmērījuma punktus. Tuviniet un noklikšķiniet uz punkta (oranžs kvadrāts rāda to, kuru tas ņems).

## Zīmēšana

**Mans pēdējais punkts pazuda, kad divreiz noklikšķināju, lai pabeigtu.**
Šajā versijā divreiz noklikšķinot tiek pabeigta trase, platforma, lūzumlīnija vai robeža, bet punkts, uz kura divreiz noklikšķinājāt, tiek izmests. Vienreiz noklikšķiniet uz pēdējā punkta un nospiediet {{key:Enter}}. Ja tas jau noticis, izmantojiet {{key:Mod+Z}} un zīmējiet vēlreiz.

**Planšetdatorā nevaru pabeigt zīmējumu.**
Pabeigšanai vajag {{key:Enter}}; ekrāna pogu vēl nav. Pievienojiet tastatūru. Skatiet [Pele, skārienpaliktnis un skārienekrāns](topic:keyboard#mouse-trackpad-and-touch).

**Velkot, lai novietotu punktu, plāns tiek pārvietots.**
Velkot vairāk nekā dažus pikseļus, plāns tiek pārvietots visos rīkos. Noklikšķiniet, nekustinot.

**"An alignment needs at least two points." / "A pad needs at least three corners." / "A pipe run needs at least two structures."**
{{key:Enter}} nospiedāt pārāk agri. Zīmējums tiek atmests; sāciet no jauna.

**Taustiņi, piemēram, A vai G, nedara neko.**
Teksta lodziņš vai saraksts panelī joprojām ir fokusā, tāpēc burti tiek ierakstīti tajā. Vienreiz noklikšķiniet uz plāna un tad nospiediet taustiņu. Mac datorā pārlūks dzēšanas taustiņu uzskata par Backspace: lai izdzēstu atlasi, izmantojiet Fn un Delete.

## Trases un profili

**"The curves at PI 2 and PI 3 overlap: … Use smaller radii."**
Divām līknēm vajag vairāk tangenšu, nekā ir starp to PI. Samaziniet vienu vai abus rādiusus PI tabulā vai pārvietojiet PI tālāk viens no otra.

**"PI 3 turns straight back; it cannot take a curve."**
Trase šajā PI atgriežas pati pār sevi. Pārvietojiet vai noņemiet PI.

**"This alignment has no ground under it to start from."**
Trase atrodas ārpus virsmas. Pārvietojiet to uz virsmas vai pievienojiet PVI, noklikšķinot ar ieslēgtu {{ui:Pievienot PVI}}.

**"The vertical curve at PVI 3 (L = …) starts before the curve or PVI before it ends." / "… runs past the next PVI."**
Saīsiniet līknes garumu vai pārvietojiet PVI tālāk viens no otra.

**"There is already a PVI at …"**
Šajā vietā jau ir PVI. Noklikšķiniet citur vai velciet esošo.

**Profila skats ir tukšs: "Draw an alignment to see its profile."**
Nav trases, vai arī atlasītajai trasei ir kļūdas.

## Koridori un platformas

**"The corridor needs a design profile without errors."**
Sāciet projektētu profilu ({{ui:Sākt no terēna}}) un izlabojiet visas līkņu pārklāšanās.

**"… side slopes run off the surface before meeting the ground." / "… slope lines run off the surface before meeting it …"**
Slīpojums sasniedz virsmas malu, pirms sasniedz zemi. Pārvietojiet projektu no malas iekšā vai tuvāk zemei. Jauna platforma, kas zīmēta daļēji ārpus virsmas, var sākties augstumā 0: ierakstiet reālu augstumu.

**"The corridor’s daylight lines cross …" / "The daylight line crosses itself …"**
Dažādu pušu nogāzes saskaras: asas līknes, šauras platformas, dziļi izrakumi vai augsti uzbērumi. Izmantojiet lielāku rādiusu, šaurāku konstrukciju, platāku platformu vai stāvākas nogāzes.

**"No volumes yet: a pad needs to grade without problems."**
Izlabojiet problēmas, kas uzskaitītas sarkanajā lodziņā virs tā.

**{{ui:Projektētā (ar slīpumiem)}} ir pelēks.**
Neviena platforma vai koridors vēl nav veidots ar slīpumiem.

## Caurules

**"P2 has no inverts yet."**
Noklikšķiniet uz {{ui:Iestatīt tās atzīmes pēc noteikumiem}} vai ierakstiet apakšējās atzīmes.

**"P1: no ground at S1 to start from."**
Augšplūsmas konstrukcija atrodas ārpus virsmas un tai nav malas. Ierakstiet tai malu.

**Katra caurule tiek atzīmēta pēc tam, kad pārvietoju konstrukciju.**
Konstrukcijas pārvietošana nemaina apakšējās atzīmes. Noklikšķiniet uz {{ui:Iestatīt visas atzīmes pēc noteikumiem}}.

Visi tīkla ziņojumi ir paskaidroti sadaļā [Gravitācijas caurulīšu tīkla izveide](topic:pipe-network#read-and-fix-problems).

## Saglabāšana un eksports

**"Nothing to export yet." / "Nothing to plot yet."**
Projekts ir tukšs. Vispirms importējiet punktus.

**Nevaru atrast saglabāto failu.**
Tas atrodas pārlūka lejupielādēs (parasti mapē Lejupielādes). Skatiet [Faili, ko varat atvērt, saglabāt un eksportēt](topic:files#where-the-files-go).

**PDF mērogs uz papīra ir nepareizs.**
Drukājiet 100% vai īstajā izmērā, nevis "fit to page".

**PDF tekstā ir jautājuma zīmes.**
Nosaukumos vai aprakstos ir rakstzīmes ārpus Rietumeiropas rakstzīmju kopas. Statusa ziņojums tās saskaita. Pārdēvējiet ar vienkāršām rakstzīmēm.

**Plāns ir apgriezts malās.**
Mērogs ir par lielu lapai. Izvēlieties mērogu ar atzīmi "(fits)", lielāku lapu vai {{ui:Ekrānā redzamais}}.

**{{key:Mod+P}} atvēra pārlūka drukas dialogu.**
Lapa nebija fokusā. Aizveriet dialogu, noklikšķiniet uz plāna un nospiediet {{key:Mod+P}} vēlreiz vai noklikšķiniet uz {{ui:PDF}}.

## Pati lietotne

**Ekrāns ir tukšs vai rīkjosla nedara neko.**
Izmantojiet aktuālu Chrome, Edge, Firefox vai Safari versiju un pārlādējiet lapu. Skatiet [Pārlūki](common:browsers).

**Lietotne ir lēna ar lielu punktu failu.**
Izslēdziet {{ui:Trijstūri}}, {{ui:Punktu uzraksti}} un {{ui:Augstuma joslas}} un izmantojiet lielāku horizontāļu intervālu. Ļoti lielas virsmas pēc katras izmaiņas pārbūvējas kādu brīdi.

**Pārlūks jautā "Leave site?"**
Projektam ir nesaglabātas izmaiņas. Palieciet, saglabājiet ar {{key:Mod+S}} un tad izejiet.
