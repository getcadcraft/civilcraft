---
title: Jūsu elektrolīniju bibliotēka
summary: Veidojiet savus vadītājus, pazemes kabeļus, balstus, iekārtas un tranšeju tipus kategorijās, ko nosaucat, un kopīgojiet tos kā failus.
keywords: bibliotēka, vadītājs, kabelis, stabs, balsts, šķērssija, izolators, armatūra, stiepe, vanta, transformators, skapis, savienojums, tranšeja, kategorija, csv, imports, eksports
from: 88733744
---

Sadaļa **Bibliotēka** elektrolīniju darbvietā satur katru vienumu, ko var izmantot līnija vai kabelis. Nekas tajā nav piesaistīts valstij vai ražotājam: jūs veidojat vienumus, ar kuriem strādājat.

## Trīs vienumu veidi

| Veids | Kur atrodas | Vai to var mainīt? |
|---|---|---|
| **Piemēri** | Iekļauti CivilCraft, ar vispārīgiem skaitļiem, ko esam aprēķinājuši no materiālu īpašībām | Nē: vispirms {{ui:Kopēt uz manu bibliotēku}} |
| **Projektā** | Nāca kopā ar atvērto projekta failu | Nē: vispirms {{ui:Kopēt uz manu bibliotēku}} |
| **Mani** | Jūsu paši vienumi, glabājas šajā pārlūkprogrammā | Jā, un izmaiņas saglabājas uzreiz |

Katrs projekts glabā katra izmantotā vienuma kopiju, tāpēc projekts atveras jebkurā datorā ar saviem vadītājiem un stabiem.

:::warning
Piemēru vienumi ir tikai piemēri: pārbaudiet katru skaitli pret sava piegādātāja datiem. Pazemes kabeļiem tīši nav norādīta strāvas vērtība, jo tā ir atkarīga no tā, kā kabelis ieklāts.
:::

## Vienuma izveide

1. Sadaļā **Bibliotēka** izvēlieties **Veidu** (gaisvadu vadītāji, pazemes kabeļi, balsti, iekārtas vai tranšeju tipi).
2. Noklikšķiniet uz {{ui:Jauna vienība}} vai izvēlieties piemēru un noklikšķiniet uz {{ui:Kopēt uz manu bibliotēku}} vai {{ui:Dublēt}}.
3. Aizpildiet tā laukus. Lauki, kas atzīmēti ar `*`, ir tie, ko pārbaudes prasa; vienums, kuram trūkst kāda lauka, ir atzīmēts ar `!` un uzskaitīts sadaļā **Pārbaudes**, kad to izmanto līnija.
4. Piešķiriet tam **Kategoriju**, ar `/` starp līmeņiem: `Overhead/LV/Bundled`, `Supports/Concrete/12 m`. Koks seko jūsu kategorijām.

Ko katrs veids prasa:

| Veids | Nepieciešams pārbaudēm |
|---|---|
| Gaisvadu vadītājs | šķērsgriezums, diametrs, masa uz metru, pārrāvuma stiprība, elastības modulis, termiskā izplešanās |
| Pazemes kabelis | dzīslas, šķērsgriezums, spriegums, diametrs, pretestība, strāvas vērtība |
| Balsts | kopējais garums, nominālā slodze (ņemta punktā zem augšas), dziļums zemē |
| Iekārta | tās tips; novērtētā slodze šķērssijām, armatūrai un stiepēm; fāzu atstatums un zudums šķērssijām; garums izolatoriem; leņķis stiepēm |
| Tranšejas tips | dziļums, platums, pārsegs virs kabeļiem |

## Kopīgošana

- {{ui:Saglabāt manu bibliotēku}} saglabā visus jūsu vienumus vienā `.cclines.json` failā; {{ui:Atvērt bibliotēku…}} to nolasa atpakaļ (vienumi ar tādu pašu atslēgu tiek aizstāti).
- {{ui:Saglabāt kā CSV}} saglabā veidu, ko skatāt, kā izklājlapu; {{ui:Atvērt bibliotēku…}} nolasa CSV šāda veida failu atpakaļ. Kolonnas var būt jebkurā secībā; fails ar semikolu var izmantot decimālkomatu.
