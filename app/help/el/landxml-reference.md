---
title: LandXML: τι διαβάζεται και τι γράφεται
summary: Τα στοιχεία και τα χαρακτηριστικά LandXML 1.2 που διαβάζει και γράφει το CivilCraft, ένα προς ένα, και όσα παραλείπει.
keywords: landxml, xml, cgpoints, επιφάνεια, tin, γραμμές θραύσης, όριο, χάραξη, coordgeom, μηκοτομή, profalign, pvi, paracurve, pipenetworks, struct, αγωγός, planfeatures, planfeature, γραμμή χαρακτηριστικού, σχήμα
from: ca3cf359
---

Το CivilCraft γράφει LandXML 1.2 με το επίσημο namespace και τη θέση του σχήματος. Διαβάζει κάθε αρχείο του οποίου το ριζικό στοιχείο είναι το `LandXML` και παίρνει τα παρακάτω στοιχεία με βάση το όνομά τους (τα προθέματα namespace αγνοούνται· η έκδοση δεν ελέγχεται). Ο αναγνώστης XML του δέχεται μόνο τις πέντε τυπικές οντότητες και τις αριθμητικές αναφορές χαρακτήρων· δεν φορτώνει ποτέ DTD ή εξωτερικό αρχείο. Για τα βήματα, δείτε [Ανταλλαγή LandXML](topic:landxml).

Το LandXML γράφει τις συντεταγμένες με πρώτη τη βόρεια συντεταγμένη: ένα σημείο είναι «N E» ή «N E Z».

## Γράφεται

| Στοιχείο | Τι γράφει το CivilCraft |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, εμβαδά σε τετραγωνικά πόδια, όγκοι σε κυβικές γιάρδες, διάμετροι σε ίντσες) ή `Metric` (meter, square meter, cubic meter, millimeter) |
| `Project` | `name` = το όνομα του έργου |
| `Application` | όνομα CivilCraft, κατασκευαστής CadCraft |
| `CgPoints` / `CgPoint` | `name` = αριθμός σημείου, `desc` = περιγραφή, `code` = ομάδα· κείμενο «N E Z» (ή «N E» χωρίς στάθμη) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw ή ccw, `radius`, `length`, `staStart`, `chord`, `delta` (μοίρες), `tangent`, `external`, `midOrd`· `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | το υπάρχον έδαφος κατά μήκος της χάραξης, ως ζεύγη χιλιομέτρησης και στάθμης (`PntList2D`), χωρισμένο εκεί όπου βγαίνει από την επιφάνεια |
| `Profile` / `ProfAlign` | η μελέτη μηκοτομής (με όνομα «<χάραξη> design»): `PVI` για τα άκρα και τις γωνίες, `ParaCurve` με `length` για τις κατακόρυφες καμπύλες |
| `Surfaces` / `Surface` | `name` και `desc`· πρώτα το υπάρχον έδαφος, μετά «Proposed» όταν διαμορφώνουν έδαφος πλατφόρμες ή διάδρομοι |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (μόνο υπάρχον έδαφος) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (μόνο υπάρχον έδαφος, όταν υπάρχει) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`· `Pnts` / `P` με `id`· `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm ή sanitary |
| `Struct` | `name`, `elevRim` (το χείλος που χρησιμοποιείται, ορισμένο ή από την επιφάνεια), `elevSump`· `Center`· `CircStruct` με `diameter`· `Invert` με `elev`, `flowDir` in ή out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`· `CircPipe` με `diameter` |
| `PlanFeatures` / `PlanFeature` | ένα για κάθε γραμμή χαρακτηριστικού: `name`· `CoordGeom` με `Line` (`length`, `Start`, `End`) και `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`· `Start` και `End` ως «N E Z», `Center` ως «N E»)· `Feature` `code="CivilCraft"` με `Property` για τη χρήση και για το αν είναι κλειστό |

Δεν γράφονται: πλατφόρμες και διάδρομοι ως αντικείμενα (το αποτέλεσμά τους είναι η επιφάνεια «Proposed»), χαράξεις με σφάλματα, αγωγοί χωρίς και τις δύο στάθμες πυθμένα (invert), κανόνες δικτύου.

## Διαβάζεται

| Στοιχείο | Τι παίρνει το CivilCraft |
|---|---|
| `Units` | Το `Imperial` ή `Metric` και το `linearUnit` του αποφασίζουν αν θα είναι πόδια ή μέτρα. Μια άγνωστη μονάδα καταγράφεται. |
| `Project` | Το `name` γίνεται το όνομα του έργου. |
| `CgPoints` / `CgPoint` (και εμφωλευμένα) | όνομα (ή `oID`), «N E» ή «N E Z», `desc` (ή `code`) ως περιγραφή |
| `Surface` με `Definition surfType="TIN"` | `Pnts` και `Faces` ως υπάρχον έδαφος (μόνο η πρώτη επιφάνεια)· οι αόρατες έδρες (`i="1"`) παραλείπονται |
| `SourceData` / `Breaklines` | γραμμές θραύσης 3D, διατηρούνται με την επιφάνεια |
| `SourceData` / `Boundaries` | το εξωτερικό όριο |
| `Alignment` / `CoordGeom` | στοιχεία `Line` και `Curve`· τα PI ξαναχτίζονται από το `PI` κάθε καμπύλης, ή από το `Center` και τις εφαπτομένες της· `staStart` |
| `Profile` / `ProfAlign` | `PVI` και `ParaCurve` (με `length`)· η πρώτη μελέτη μηκοτομής με τουλάχιστον δύο PVI |
| `PlanFeatures` / `PlanFeature` | κάθε μία ως γραμμή χαρακτηριστικού: `Line`, `Curve` (τα `Start`, `Center`, `End` και `rot` της) και `IrregularLine` (`PntList3D` ή `PntList2D`), ενωμένα από άκρο σε άκρο (ένα κενό ενώνεται με ευθύ τμήμα και καταγράφεται)· κλειστή όταν τελειώνει εκεί που ξεκίνησε· η χρήση και το κλειστό από το δικό της `Feature` του CivilCraft, αλλιώς **Μόνο σχεδίαση**. Σημεία χωρίς στάθμη παίρνουν 0 (καταγράφεται). |
| `Spiral` | σπείρες κλοθοειδούς δίπλα σε `Curve` (είσοδος και έξοδος· διαβάζονται ως PI με ακτίνα και μήκη σπειρών, γράφονται πίσω με `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | το πρώτο δίκτυο που έχει αγωγούς: `Struct` (`Center`, `elevRim`, `elevSump`, διάμετρος `CircStruct`, `Invert` ανά αγωγό) και `Pipe` (`refStart`, `refEnd`, διάμετρος `CircPipe`) |

## Παραλείπεται, και αναφέρεται στις σημειώσεις

- Επιφάνειες μετά την πρώτη, επιφάνειες πλέγματος (grid) και άλλες επιφάνειες που δεν είναι TIN
- Χαράξεις που περιέχουν στοιχεία `IrregularLine` ή `Chain`, σπείρες άλλες από κλοθοειδείς, σπείρα ανάμεσα σε δύο καμπύλες, ή χαράξεις χωρίς γεωμετρία
- Μελέτες μηκοτομής μετά την πρώτη· κατακόρυφες καμπύλες `CircCurve` και `UnsymParaCurve` (τα PVI τους διατηρούνται χωρίς καμπύλη)
- Σημεία που αναφέρονται μόνο σε άλλα σημεία (`pntRef`), και σημεία χωρίς αναγνώσιμες συντεταγμένες
- Επαναλαμβανόμενα ονόματα σημείων (διατηρείται το πρώτο)
- Όρια απόκρυψης, εμφάνισης και data-clip· γραμμές θραύσης χωρίς σημεία 3D
- Δίκτυα αγωγών μετά το πρώτο· τύποι δικτύου άλλοι από storm και sanitary (διαβάζονται ως storm)
- Ορθογώνια, εισόδου και εξόδου κατασκευάσματα (διαβάζονται ως κυκλικά)· αγωγοί και κανάλια ωοειδή, ελλειπτικά και κουτιαστά (διαβάζονται ως κυκλικοί αγωγοί χωρίς μέγεθος)
- Στοιχεία `Spiral` σε γραμμές χαρακτηριστικών
- `Parcels`, `Roadways`, `GradeModel` και `Survey`

Τα προφίλ εδάφους (`ProfSurf`) σε ένα αρχείο δεν χρησιμοποιούνται: το CivilCraft δειγματοληπτεί το έδαφος από την ίδια την επιφάνεια.

## Μηνύματα όταν ένα αρχείο δεν ανοίγει

| Μήνυμα | Σημασία |
|---|---|
| «Είναι XML, αλλά όχι LandXML (το ριζικό του στοιχείο είναι <…>).» | Το αρχείο είναι άλλο είδος XML. |
| «… δεν έχει σημεία, επιφάνειες TIN ή χαράξεις που μπορεί να διαβάσει το CivilCraft.» | Όλα όσα περιέχει το αρχείο είναι στη λίστα των παραλειπόμενων. Οι σημειώσεις που ακολουθούν λένε τι υπήρχε. |
| «Ασυμφωνία κλείσιμου ετικέτας …», «Ετικέτα χωρίς κλείσιμο …», «Το αρχείο τελειώνει μέσα σε …» | Το αρχείο είναι κατεστραμμένο ή κομμένο. |
