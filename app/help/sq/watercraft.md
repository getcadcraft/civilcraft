---
title: WaterCraft: kërkesat, rrjedha për zjarrin, ndërprerjet dhe mosha e ujit
summary: Me shtojcën WaterCraft, kthe klientët në kërkesa mbi tubat e tua të ujit, kontrollo rrjedhën e disponueshme te çdo hidrant, shih cili ndërprerje tubi dëmton më shumë, dhe ndiq moshën e ujit dhe klorin gjatë një dite.
keywords: watercraft, shpërndarja e ujit, kërkesat, klientët, faktori i pikut, modeli i kërkesës, rrjedha për zjarrin, hidrant, presioni i mbetur, kritikaliteti, ndërprerja, seksioni me valvul, mosha e ujit, klori, mbetja, gjurmimi i burimit, skaj i mbyllur, csv, shtojcë
from: 066fb17a
---

WaterCraft është një shtojcë që punon mbi rrjetin e ujit që ke vizatuar tashmë me veglat e Tubave të ujit. Shton një skedë në panelin e djathtë me katër seksione.

:::warning
Vetëm një mjet llogaritjeje. U kontrollua me përgjigje me dorë në rrjete të trilluara, jo në një model të vërtetë të ndonjë kompanie uji. Një inxhinier uji duhet të kontrollojë çdo rezultat. Skenarët, rregullat e kontrollit, valvulat dhe leximet në terren kanë temat e tyre, "Skenarët" dhe "Studimet", në ndihmën e shtojcës WaterCraft.
:::

## Çfarë do të bësh

- Vendos klientët në rrjet si kërkesa.
- Gjej hidrantët që nuk arrijnë rrjedhën që të duhet.
- Gjej tubat kryesorë, humbja e të cilëve ka më shumë rëndësi.
- Gjej ujë të vjetër dhe klor të ulët.

## Hapat

1. Hap {{ui:Cilësimet}} › {{ui:Shtojcat}} dhe ndiz {{ui:WaterCraft (shpërndarja e ujit)}}. Në panelin e djathtë shfaqet një skedë {{ui:WaterCraft}}.
2. Vizato së pari një rezervuar, kryqëzime dhe tuba me veglat e Tubave të ujit (shih [Tubat e ujit](topic:water-mains)). Pa një rrjet skeda të thotë ta bësh këtë.
3. Nën {{ui:Kërkesat}}, ngjit një klient për rresht: id, x, y, lloji, sasia. Zgjidh {{ui:Faktorin e pikut}} dhe {{ui:Modelin orar}} (ditë banimi, ditë tregtare, e sheshtë, ose mbaj modelin siç është). Shtyp {{ui:Kontrollo}} për të parë ku bie çdo klient (kryqëzimi më i afërt), pastaj {{ui:Vendos në rrjet}}. Zhbëje heq kërkesat.
4. Nën {{ui:Rrjedha për zjarrin}}, vendos rrjedhën e nevojshme dhe presionin e mbetur, zgjidh nëse presioni i mbetur mbahet {{ui:Vetëm te hidranti}} ose {{ui:Kudo në sistem (më e rreptë)}}, dhe shtyp {{ui:Gjatësia}}. Çdo hidrant listohet më i keqi i pari, si "përmbush" ose "mungon".
5. Nën {{ui:Cili tub kryesor ka më shumë rëndësi}}, zgjidh {{ui:një tub njëkohësisht}} ose {{ui:një seksion me valvul njëkohësisht}} dhe shtyp {{ui:Gjatësia}}. Çdo ndërprerje tregon kërkesën e shkëputur, kryqëzimet e shkëputura, kryqëzimet që sapo ranë nën presionin minimal dhe presionin më të ulët që mbetet.
6. Nën {{ui:Mosha e ujit dhe klori}}, zgjidh çfarë të ndjekësh (mosha e ujit, klori ose një gjurmim burimi), vendos orët për të ekzekutuar dhe kufijtë që do, dhe shtyp {{ui:Gjatësia}}. Kryqëzimet jashtë kufijve të tu listohen.
7. Shtyp {{ui:Ruaj si CSV}} nën çdo tabelë për ta ruajtur.

## Shënime

- Rrjedha e nevojshme për zjarrin dhe përdorimi për shtëpi ose për akër janë vlera fillestare, jo standarde. Përdor shifrat e vetë kompanisë tënde të ujit.
- Një tub i prerë pjesërisht nga një valvul mbyllet tërësisht, kështu ndërprerja e treguar është pak më e keqe se një e vërtetë.
- Ekzekuto seksionin e cilësisë së ujit mjaft gjatë që modeli ditor të përsëritet para se të lexosh ditën e fundit.
- {{ui:Ndalo}} e përfundon një ekzekutim të gjatë më herët; lista atëherë tregon vetëm atë që u bë.
- Rrjeti yt mbetet në këtë projekt dhe në këtë kompjuter. Asgjë nuk dërgohet askund.
