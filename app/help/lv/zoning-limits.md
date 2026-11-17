---
title: Pārbaudiet masas pret jūsu ierakstītajām zonējuma robežām
summary: Ierakstiet zemesgabala atkāpes rindu pa rindai, augstuma ierobežojumu, debesu iedarbības plakni, stāvu platības koeficientu un apbūvi, redziet iespējamo aploksni plānā un nolasiet, kuras masas pārkāpj kuru robežu.
keywords: zonējums, atkāpe, atkāpes, priekšā, sānos, aizmugurē, aploksne, iespējamā platība, augstuma ierobežojums, debesu iedarbības plakne, stāvu platības koeficients, koeficients, apbūve, zemesgabals, parcela, noteikumi, kodu pārbaude
from: 3e267b31
---

**CivilCraft nesatur nekādu zonējuma kodu.** Tas nepazīst nevienas pilsētas noteikumus un nesatur to bibliotēku. Katrs šīs lapas skaitlis ir tāds, ko jūs ierakstāt, ņemts no jūsu pašu noteikuma, un katrs rezultāts saka, ka tas mērīts pret ierakstītajām robežām. Tas ir veids, kā redzēt, kā zemesgabala robežas veido ēku, nevis lēmums par to, vai projekts ir atļauts.

## Ierakstiet robežas

Rekvizītos sadaļā **Ēku masas** izvēlieties **Zemesgabalu** (vai izvēlieties masu: tās zemesgabala robežas rādās zem tās). Pēc tam aizpildiet to, kas attiecas; atstājiet lodziņu tukšu, ja nav ierobežojuma:

- **Ielas līnija**: zemesgabala līnija pie ielas. **Priekšas atkāpe** attiecas uz to, **Aizmugures atkāpe** uz līniju, kas atrodas tai pretī, un **Sānu atkāpe** uz pārējām.
- **Augstuma ierobežojums**.
- **Debesu plakne**: tā sākas noteiktā augstumā pie zemesgabala līnijas un paceļas par jūsu ierakstīto summu par katru 1 vienību iekšup, mērot no ielas līnijas vai no katras zemesgabala līnijas (2 nozīmē 2 pret 1). Atļautais augstums virs punkta ir zemākais no plaknes un augstuma ierobežojuma.
- **Stāvu platības koeficients** (masu bruto stāvvietu platība zemesgabalā, dalīta ar zemesgabala laukumu) un **Apbūve** (to pamatnes, dalītas ar zemesgabala laukumu, ierakstītas procentos).

## Aploksne

Atzīmējiet **Rādīt aploksni plānā**, lai to zīmētu slānī `A-MASS-ENVL`. Aploksne ir zemesgabals, ko no katras zemesgabala līnijas samazina tās pašas atkāpe, nobīdes līnijas saskaras stūros ar slīpuma šķautni. Līnija, kas veidota no līknes, tiek uzņemta kā īsas stīgas ar novirzi līdz 0,01 no līknes. Gan izliekti, gan ieliekti zemesgabali darbojas. Ja atkāpes savijas (dziļa atkāpe šaurā vai ļoti ieliektā zemesgabalā), aploksnes nav, un Rekvizīti to saka; izmēģiniet mazākus attālumus.

## Rezultāts

Zem lodziņiem katra masa un katra robeža saņem rindu ar atzīmi vai krustu:

- **atkāpes**: masas daļas platība, kas atrodas ārpus aploksnes;
- **augstums**: masas augstums pret lielāko atļauto pār tās pamatni (vienāda augstuma prizmu ierobežo zemākais atļautais augstums jebkurā no tās stūriem);
- **stāvu platības koeficients** un **apbūve**: visas zemesgabala masas, saskaitītas kopā.
