---
title: Izliekums un spriegums
summary: Jūsu slodžu gadījumi (temperatūra, vējš, ledus) un sprieguma ierobežojumi, kā CivilCraft aprēķina katra posma spriegumu un vilkšanas tabulas.
keywords: izliekums, spriegums, slodzes gadījums, temperatūra, vējš, ledus, asimetrisks ledus, noteicošais posms, ekvivalentais posms, stāvokļa maiņa, katenāra, vilkšanas tabula, pārraušanas stiprība, ikdienas spriegums
from: f8876c35
---

## Slodžu gadījumi un ierobežojumi

{{ui:Vairāk}} › {{ui:Slodžu gadījumi un ierobežojumi…}} rediģē noteikumus, kurus ievēro katra līnija projektā.

- **Slodžu gadījumi**: temperatūra, vēja spiediens uz vadu (Pa) un radiālais ledus (mm, ar tā blīvumu). Pirmais gadījums ir atskaites.
- **Sprieguma ierobežojumi**: vadu pārraušanas stiprības daļa horizontālajam spriegumam vai lielākajam spriegumam balstā vienā slodzes gadījumā. Vai ievadiet horizontālo spriegumu pats.
- **Atstatumi**: atstatums, ko vads atstāj virs zemes, ceļa, ēkas un tā tālāk. Pievienojiet, pārdēvējiet un noņemiet tos: tie ir jūsu. Zemāk izvēlieties noteikumus **Ainavas augi zem līnijas**, **Ainavas sienas zem līnijas** un **Pazemes krustojumi**.
- **Gadījumi, ko izmanto pārbaudes**: kurš gadījums dod lielāko izliekumu (karsts), izolatora novirzi (vējš), ledu un ledu vienā balsta pusē.
- **Faktori**: fāzu atstarpes koeficients k, lielākā izolatora novirze, koeficients balstu un savienojumu slodzēm, līkuma leņķi, kas padara leņķa un gala balstus, mazākais segums virs apraktiem kabeļiem un lielākais sprieguma kritums.

## Paketes: noteikumi un bibliotēka valstij

Neviena valsts noteikumi nav iebūvēti CivilCraft. **Pakete** glabā noteikumu kopu un bibliotēku vienā failā (`.cclinepack.json`), valstij, tīkla operatoram vai uzņēmumam:

- **Saglabāt kā paketi…** {{ui:Slodžu gadījumi un ierobežojumi…}} ieraksta parādīto noteikumu kopu un jūsu bibliotēku (vai, ja jūsu bibliotēkā vēl nekā nav, šajā projektā izmantotos vienumus). Vispirms ierakstiet **Valsts vai reģions**.
- **Atvērt noteikumu kopu vai paketi…** nolasa paketi, noteikumu failu vai bibliotēkas failu. Paketes noteikumi tiek rādīti dialogā (noklikšķiniet **Lietot**, lai tos izmantotu), un tās vienumi nonāk jūsu bibliotēkā.
- Citu kopīgotās paketes ir uzskaitītas papildinājumu lapā sadaļā **Elektrolīniju paketes**. Divas piemēra paketes rāda formātu; tās nav nevienas valsts noteikumi.

Katra pakete tiek pārbaudīta, kad to atver, kā jebkurš fails. Pārbaudiet katru vērtību pret piemērojamo standartu, pirms kaut ko veidot.

Divas piemēra noteikumu kopas ir, lai sāktu: **Piemērs: auksts klimats** un **Piemērs: mērens klimats**. To skaitļi nenāk no nevienā standarta: iestatiet vērtības, ko dod jūsu standarts. {{ui:Saglabāt noteikumus}} un {{ui:Atvērt noteikumus…}} kopīgo noteikumu kopu kā failu.

## Kā aprēķina spriegumu

Katram posmam starp gala balstiem:

1. **Noteicošais posms** ir √(ΣL³ ÷ ΣL) no tā posmiem.
2. Katrs ierobežojums tiek pārvērsts horizontālā spriegumā atskaites gadījumā caur **stāvokļa maiņas vienādojumu** uz noteicošā posma: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. Visstingrākais nosaka spriegumu.
3. Katra slodzes gadījuma spriegums seko no tā, un katra posma forma ir precīzā **katenāra** caur tiem diviem stiprinājuma punktiem (ieskaitot posmus slīpumā): izliekums no hordas, garums un spriegums katrā galā.

Slodze uz metru gadījumā: svars plus ledus (ledus laukums × blīvums × g) vertikāli; vēja spiediens × apledojušais diametrs horizontāli.

## Vilkšanas tabulas

{{ui:Vairāk}} › {{ui:Vilkšanas tabulas…}} uzskaita katram posmam horizontālo spriegumu un katra posma izliekumu katrā noteikumu kopas temperatūrā (sākumā no −5 °C līdz 40 °C pa 5 °C), mierīgā gaisā. Saglabājiet tās, kā arī balstu tabulu, kā CSV.

Neskaitīts: vada lēnā deformācija gadu gaitā un jauna vada izstiepšanās. Pievienojiet tās caur temperatūrām, kurās jūs velkat.
