---
title: WaterCraft: kërkesat, rrjedha për zjarrin, ndërprerjet dhe mosha e ujit
summary: Me shtojcën WaterCraft, shndërro klientët në kërkesa mbi tubat tuaj kryesorë të ujit, kontrollo rrjedhën e disponueshme te çdo hidrant, shiko cila ndërprerje tubi dëmton më shumë dhe ndiq moshën e ujit dhe klorin gjatë një dite.
keywords: watercraft, shpërndarja e ujit, kërkesa, klientë, faktori i pikut, modeli i kërkesës, rrjedha për zjarrin, hidrant, presioni i mbetur, rëndësia, ndërprerja, seksion me valvul, mosha e ujit, klori, mbetja, gjurmimi i burimit, fund i bllokuar, csv, shtojcë
from: 76809f01
---

WaterCraft është një shtojcë që punon mbi rrjetin e ujit që ke vizatuar tashmë me mjetet e Tubave të ujit. Shton një skedë në panelin e djathtë me katër seksione.

:::warning
Vetëm një mjet llogaritjeje. Është kontrolluar me përgjigje të bëra me dorë mbi rrjete të trilluara, jo mbi një model të vërtetë të një shërbimi uji. Një inxhinier uji duhet të kontrollojë çdo rezultat. Nuk ka ende stacione shtytëse, zbërthim të rendit të dytë dhe skenarë.
:::

## Çfarë do të bësh

- Vendos klientët në rrjet si kërkesa.
- Gjej hidrantët që nuk arrijnë rrjedhën që të nevojitet.
- Gjej tubat ku humbja ka më shumë rëndësi.
- Gjej ujë të vjetër dhe klor të ulët.

## Hapat

1. Hap {{ui:Cilësimet}} › {{ui:Shtojcat}} dhe ndiz {{ui:WaterCraft (shpërndarja e ujit)}}. Një skedë {{ui:WaterCraft}} shfaqet në panelin e djathtë.
2. Vizato fillimisht një rezervuar, nyje dhe tuba me mjetet e [Tubave të ujit](topic:water-mains). Pa një rrjet, skeda të thotë ta bësh këtë.
3. Nën {{ui:Kërkesat}}, ngjit një klient për rresht: id, x, y, lloji, sasia. Zgjidh {{ui:Faktori i pikut}} dhe {{ui:Modeli orar}} (ditë banimi, ditë tregtare, e sheshtë, ose mbaj modelin siç është). Shtyp {{ui:Kontrollo}} për të parë ku vendoset çdo klient (nyja më e afërt), pastaj {{ui:Vendos në rrjet}}. {{ui:Zhbëj}} i kthen kërkesat mbrapsht.
4. Nën {{ui:Rrjedha për zjarrin}}, vendos rrjedhën e nevojshme dhe presionin e mbetur, zgjidh nëse mbetja mbahet {{ui:Vetëm te hidranti}} ose {{ui:Në të gjithë sistemin (më i rreptë)}}, dhe shtyp {{ui:Gjatësia}}. Çdo hidrant listohet më i keqi i parë, si plotëson ose mungon.
5. Nën {{ui:Cili tub kryesor ka më shumë rëndësi}}, zgjidh {{ui:një tub në të njëjtën kohë}} ose {{ui:një seksion me valvul në të njëjtën kohë}} dhe shtyp {{ui:Gjatësia}}. Çdo ndërprerje shfaq kërkesën që preket, nyjet e ndara, nyjet që bien tani nën presionin minimal dhe presionin më të ulët që mbetet.
6. Nën {{ui:Mosha e ujit dhe klori}}, zgjidh çfarë të ndjekësh (mosha e ujit, klori ose një gjurmim burimi), vendos orët për t'u ekzekutuar dhe kufijtë që dëshiron, dhe shtyp {{ui:Gjatësia}}. Nyjet jashtë kufijve të tu listohen.
7. Shtyp {{ui:Ruaj si CSV}} nën çdo tabelë për ta mbajtur.

## Shënime

- Rrjedha e nevojshme e zjarrit dhe përdorimi për shtëpi ose për acre janë vlera fillestare, jo standarde. Përdor shifrat e vetë shërbimit tënd të ujit.
- Një tub i prerë pjesërisht nga një valvul mbyllet tërësisht, prandaj ndërprerja e shfaqur është pak më e keqe se një ndërprerje reale.
- Ekzekuto seksionin e cilësisë së ujit mjaft gjatë që modeli ditor të përsëritet para se të lexosh ditën e fundit.
- {{ui:Ndalo}} ndërpret herët një ekzekutim të gjatë; lista tregon atëherë vetëm atë që u krye.
- Rrjeti yt mbetet në këtë projekt dhe në këtë kompjuter. Asgjë nuk dërgohet askund.
