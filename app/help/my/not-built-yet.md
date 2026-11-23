---
title: မတည်ဆောက်ရသေးပါ
summary: ဤ CivilCraft build သည် မလုပ်နိုင်သေးသည့်အရာများနှင့် ယနေ့ အစားထိုး လုပ်ရမည့်အရာများ။
keywords: missing, limitations, roadmap, not available, spirals, widening, dwg, dxf, inlets, detention, cross sections, coming later, limits, ပျောက်နေသော, ကန့်သတ်ချက်များ, လမ်းပြမြေပုံ, မရနိုင်, spirals, ကျယ်ပြန့်စေခြင်း, dwg, dxf, inlets, detention, အပိုင်းဖြတ်များ, နောက်မှ ရလာမည်, ကန့်သတ်ချက်များ
from: b91588d4
---

CivilCraft သည် အစောပိုင်း ဖြစ်သေးသည်။ ဤစာမျက်နှာသည် လက်ရှိ build မလုပ်နိုင်သည့်အရာများကို စာရင်းပြုစုထားသည်၊ ထို့ကြောင့် ရှာစရာမလို။ ဤနေရာရှိ တစ်ခုမျှ ရက်စွဲဖြင့် ကတိမပေးထားပါ။

## အမှတ်များ

| မတည်ဆောက်ရသေးသည် | ယနေ့ အစားထိုး |
|---|---|
| ပထမဖိုင်သို့ ဒုတိယအမှတ်ဖိုင်ကို ထည့်ခြင်း | ဖိုင်များကို text editor သို့မဟုတ် spreadsheet တွင် အရင် ပေါင်းပါ |
| အမှတ် text ဖိုင် ထုတ်ခြင်း | LandXML ထုတ်ပါ (အမှတ်များသည် CgPoints အဖြစ် ထွက်သည်)၊ GIS {{ui:ထုတ်ရန်}} (P၊ N၊ E၊ Z နှင့် D field များပါသော အမှတ်များ) ကို သုံးပါ၊ သို့မဟုတ် အမှတ်များကို spreadsheet သို့ {{ui:ကူးရန်}} |
| အမှတ် label style များ၊ description key တစ်ခုစီအတွက် သင်္ကေတများ၊ line code မှ curve (arc) များ၊ ပရောဂျက်များကြား မျှဝေရန် description key ဖိုင် | Label များက နံပါတ်၊ အမြင့်နှင့် description (သို့မဟုတ် ထိုထက်နည်းသည်) ကို ပြသည် ([CivilCraft settings](topic:settings)); key များကို ပရောဂျက်ဖိုင်ထဲ သိမ်းထားသည် |
| ယူနစ် ပြောင်းခြင်း | မသွင်းမီ ဖိုင်ကို ပြောင်းပါ; **Units** က အညွှန်းပြန်ပြောင်းသည်သာ |

## Surfaces

| မတည်ဆောက်ရသေးသည် | ယနေ့ အစားထိုး |
|---|---|
| အမှတ်များမှ တည်ဆောက်သော surface တစ်ခုထက် ပို၍ | ပရောဂျက်တစ်ခုလျှင် surface တစ်ခု |
| (အတွင်းပိုင်း) နယ်နိမိတ်များကို ဖျောက်ခြင်း | **Longest outside edge** သို့မဟုတ် အပြင်ဘက် နယ်နိမိတ်ကို သုံးပါ |
| ဆွဲထားသော breakline တစ်ခုကို ရွေးခြင်း သို့မဟုတ် တည်းဖြတ်ခြင်း | {{key:Mod+Z}}၊ သို့မဟုတ် {{ui:ဆွဲထားသော breakline များကို ဖယ်ရှားရန်}} ပြီး ပြန်ဆွဲပါ |
| LandXML မှ ဖတ်ထားသော surface (breakline၊ နယ်နိမိတ်) ကို တည်းဖြတ်ခြင်း | {{ui:အမှတ်များမှ မျက်နှာပြင်ကို ပြန်တည်ဆောက်ရန်}} |
| elevation grid မှ ပြုလုပ်ထားသော surface ကို တည်းဖြတ်ခြင်း | အခြား ရွေးချယ်မှုများဖြင့် grid ကို ပြန်သွင်းပါ |
| coordinate system ပြောင်းသောအခါ LandXML မှ ဖတ်ထားသော surface ကို ပြောင်းခြင်း | အရင် {{ui:အမှတ်များမှ မျက်နှာပြင်ကို ပြန်တည်ဆောက်ရန်}} |
| အမည်ပါ spot elevation နှင့် slope တန်ဖိုးများ | status bar တွင် ဖတ်ပါ၊ သို့မဟုတ် Landscape workspace ရှိ **Slope analysis** ဖြင့် surface ကို slope အလိုက် အရောင်ချပါ ([Grading for landscape](topic:landscape-grading#grading-checks)) |

## Alignments နှင့် profiles

| မတည်ဆောက်ရသေးသည် | ယနေ့ အစားထိုး |
|---|---|
| clothoid မဟုတ်သော spiral များ၊ curve နှစ်ခုကြား spiral (compound transitions) | curve ၏ အဆုံးရှိ clothoid spiral များ ရနိုင်သည်; အခြားများကို နာမည်ပေးထားပြီး LandXML import တွင် ကျော်သည် |
| PI နှစ်ခုကြားတွင် PI ထည့်ခြင်း | alignment ကို ပြန်ဆွဲပါ၊ သို့မဟုတ် PI coordinate များကို ပြန်ရိုက်ပါ |
| object များမှ alignment များ၊ offset များ၊ ကျယ်ပြန့်စေခြင်းများ | PI များဖြင့် ဆွဲပါ |
| vertical curve အတွက် K ရိုက်ခြင်း | L ရိုက်ပါ (K ကို ပြသည်) |
| စက်ဝိုင်းနှင့် မညီမျှသော vertical curve များ | Symmetric parabolic curve များသာ |
| alignment တစ်ခုလျှင် design profile တစ်ခုထက် ပို၍ | alignment variant တစ်ခုလျှင် တစ်ခု |
| profile view ကို zoom ခြင်း၊ profile အောက်ရှိ profile bands | profile view သည် alignment တစ်ခုလုံးကို ကိုက်ညီစေသည်; [plan and profile sheets](topic:plan-profile-sheets) တွင် ထုတ်ပါ |
| DWG သို့မဟုတ် LandXML ရှိ sections | PDF အဖြစ် Section sheets; နေရာများနှင့် ပမာဏများ၏ {{ui:CSV}} |
| angle ဖြင့် sample lines၊ သို့မဟုတ် လမ်းတစ်လျှောက် မတူသော အကျယ်များ | alignment တစ်ခုလုံးအတွက် ဘက်တစ်ခုစီ အကျယ်တစ်ခု |

## Corridors

| မတည်ဆောက်ရသေးသည် | ယနေ့ အစားထိုး |
|---|---|
| median များ၊ barrier များနှင့် template များကို လှည့်သော superelevation | template များအဖြစ် ဆွဲပါ ([corridor ပုံစံများ](topic:corridor-templates)); station အလိုက် template များသည် superelevation ကို မယူသေးပါ |
| နယ်ဒေသနှစ်ခု၏ template များကြား တဖြည်းဖြည်း ပြောင်းလဲမှု (transitions၊ tapers) | station တွင် template ကို ပြောင်းပါ၊ သို့မဟုတ် taper အဖြစ် ဆွဲထားသော မျဉ်းသို့ point တစ်ခုအတွက် width ပစ်မှတ် ပေးပါ |
| လှည့်ခြင်း အနားတစ်ခုအကြောင်း၊ LandXML ရှိ superelevation | circular curve များပေါ်တွင် superelevation သည် centerline ပတ်လည် လှည့်သည်; lane ကို feature line သို့ width ပစ်မှတ်ဖြင့် ကျယ်စေပါ |
| side slope များအတွက် ပစ်မှတ်များ (daylight မှ မျဉ်း သို့မဟုတ် surface သို့)၊ ကိုယ်ပိုင် corridor surface များ | ပစ်မှတ်များက pavement နှင့် shoulder အနားများကို ရွှေ့သည် ([Corridors](topic:corridor)); corridor ကို proposed surface ထဲ grade လုပ်သည် |
| curb return၊ turning lane နှင့် island များကို junction ထဲ grade လုပ်ခြင်း၊ ဘေးလမ်း အဆုံးကို skew ပေါ်ရှိ အဓိကလမ်း အနားသို့ ဖြတ်ခြင်း၊ လမ်းကြောင်းကို plan တွင် လမ်းနှင့် ချိတ်ခြင်း (အလျားနှင့် ဧရိယာတွင်) | တွေ့ဆုံသော လမ်းများကို ထောင့်မှန် ချိတ်ဆက်ပြီး အဓိကလမ်း၏ အနားကို ဖွင့်ကာ ဘေးလမ်းကို ထိုနေရာသို့ ညှင်းပါးစွာ ပြောင်း ([Where roads meet](topic:corridor#where-roads-meet-roads-pads-and-paths)); လမ်းကြောင်းသည် proposed surface နှင့် 3D တွင် လမ်း၏ အနားတွင် ရပ်သည် |
| LandXML roadway အဖြစ် ထုတ်ထားသော corridor များ၊ alignment တစ်ခုပေါ် ဒုတိယ corridor ကို IFC export တွင် | proposed surface ကို ထုတ်သည် |
| proposed surface ကို ပြောင်းသော terrain template များ၊ 3D တွင် သို့မဟုတ် sections တွင် | အလွှာတစ်ခုစီ၏ ဧရိယာနှင့် ပမာဏများကို ပေးသည် ([Terrain templates](topic:corridor-templates#terrain-templates)) |
| အရှိန်၊ ဘီးလျော့ခြင်း၊ လှည့်ချိန်၊ လှည့်ထားသော trailer များ သို့မဟုတ် ကိုယ်ထည်ရှင်းလင်းမှုပါသော swept path များ၊ စံ design vehicle စာကြည့်တိုက်၊ vehicle ကို ဆွဲ၍ ဆွဲထားသော swept path | အနိမ့်အရှိန် swept path များကို feature line သို့မဟုတ် alignment တစ်လျှောက်၊ သင့်ကိုယ်ပိုင် vehicle အရွယ်အစားဖြင့် ([Vehicle swept paths](topic:swept-paths)) |

## မြေပြင်ညှိခြင်းနှင့် ပမာဏများ

| မတည်ဆောက်ရသေးသည် | ယနေ့ အစားထိုး |
|---|---|
| Benches၊ design ထဲ ဖွင့်ထားသော feature line များ၊ အခြားနေရာမှ feature line သို့ grading | feature line ကို ပိတ်ပါ ([Feature lines](topic:feature-lines))၊ သို့မဟုတ် ရှိပြီးသား မြေပြင်၏ breakline အဖြစ် သုံးပါ |
| feature line ၏ vertex ကို ထည့်ခြင်း သို့မဟုတ် ဖျက်ခြင်း | မျဉ်းကို ပြန်ဆွဲပါ၊ သို့မဟုတ် ၎င်း၏ အဆင့်ဆင့် offset ကို ပြုလုပ်ပါ |
| ဆွဲထားသော breakline များတွင် arc များ (survey အမှတ်များ၏ ဖြတ်ကျော်ဖြင့်)၊ feature line များတွင် spiral များ | arc ပါသော feature line ကို ဆွဲပြီး ရှိပြီးသား မြေပြင်၏ breakline အဖြစ် သုံးပါ |
| အကွာအဝေး၊ အမြင့် သို့မဟုတ် အခြား surface သို့ grading | daylight ကို ရှိပြီးသား မြေပြင်သို့သာ |
| pad ထောင့် ထည့်ခြင်း သို့မဟုတ် ဖျက်ခြင်း | pad ကို ဖျက်ပြီး ပြန်ဆွဲပါ |
| TIN-to-TIN (prism) ပမာဏများ၊ grid cell အရွယ်အစား ရွေးခြင်း | grid နည်းလမ်း၊ cell အရွယ်အစားကို သင့်အတွက် ရွေးပေးသည် |
| ပွမ်းခြင်းနှင့် ကျုံ့ခြင်း၊ မြေဆီလွှာ၊ ကတ္တရာအနက်များ | ဖော်ပြထားသော ကိန်းဂဏန်းများတွင် factor များကို ကိုယ်တိုင် အသုံးပြုပါ |
| အခမဲ့သယ်ယူခြင်းနှင့် အလွန်သယ်ယူခြင်း ကုန်ကျစရိတ်၊ မတူသော alignment များကြား သယ်ယူခြင်း၊ ပလန်ပေါ်တွင် နေရာချထားသော borrow pit နှင့် စွန့်ပစ်နေရာများ | balance point များ၊ ရွှေ့ထားသော ပမာဏများနှင့် ပျမ်းမျှ သယ်ယူအကွာအဝေး ပါသော mass-haul diagram |

## ပိုက်ကွန်ရက်များ

| မတည်ဆောက်ရသေးသည် | ယနေ့ အစားထိုး |
|---|---|
| ပရောဂျက်တစ်ခုလျှင် ကွန်ရက် တစ်ခုထက် ပို၍ | storm နှင့် sanitary အတွက် ပရောဂျက် သီးခြား |
| ရေမိန်းများ- ရေအရည်အသွေးနှင့် အသက်၊ စည်းမျဉ်းအခြေခံ ထိန်းချုပ်မှု၊ အခြား valve အမျိုးအစားများ (flow control၊ throttle၊ sustaining)၊ power ဖြင့် ပေးသော ပန့်များ၊ ဖိအားအပေါ် မူတည်သော ဝယ်လိုအား၊ Darcy–Weisbach ရွေးချယ်မှု၊ နံရံထူနှင့် ဖိအားအတန်းပါသော ပိုက် catalogue။ ဖိအားကွန်ရက်၏ ကျန်အပိုင်းသည် lab တွင် ရှိသည်: [Water mains](topic:water-mains) | ၎င်းတို့ကို ရေဖြန့်ဝေမှု software တွင် စစ်ပါ; sanitary design flow များသည် [Sanitary design flows](topic:sanitary-design) တွင် ရှိသည် |
| အချိန်နှင့်အမျှ ညစ်ပတ်စီးဆင်းမှု (hydrograph၊ dynamic routing၊ storage၊ ပန့်များ၊ overflow) | [Sanitary design flows](topic:sanitary-design) သည် design စာရွက်က သုံးသော steady peak flow ကို ပေးသည် |
| Inlet စွမ်းရည်၊ gutter spread၊ detention routing၊ hydrograph၊ junction coefficient တစ်ခုထက် အခြား energy loss များ | အခြား software တွင် စစ်ပါ; flow၊ အရွယ်အစားနှင့် grade line များသည် [Storm drainage](topic:storm-drainage) တွင် ရှိသည် |
| PDF plot၊ DWG၊ DXF သို့မဟုတ် LandXML ထဲ catchment များ၊ surface မှ catchment များ (watershed) | catchment များကို လက်ဖြင့် ဆွဲပါ; ပရောဂျက်ဖိုင်ထဲ သိမ်းထားသည် |
| ပိုက် catalog များ၊ စက်ဝိုင်းမဟုတ်သော ပိုက်များ၊ ထောင့်မှန်ဘောက်စ် သို့မဟုတ် ပိုက်လုံး မဟုတ်သော ဖွဲ့စည်းပုံများ (ကုန်းပစ်၊ အဆင့်များ၊ benching)၊ drainage အမျိုးအစား စာကြည့်တိုက် | ဘောင်များမှ structure အမျိုးအစားများ ([Pipe network](topic:pipe-network)); အချင်းရှိ ပိုက်များ |
| profile view ထဲ ပိုက်များ၊ ကွေးသော ပိုက်များ | ညာဘက် panel ထဲမှ invert နှင့် cover ကို ဖတ်ပါ |

## Parcels

| မတည်ဆောက်ရသေးသည် | ယနေ့ အစားထိုး |
|---|---|
| ဧရိယာ သို့မဟုတ် မျက်နှာစာဖြင့် ကွက်များ ခွဲခြင်း၊ ၎င်းတို့ပတ်လည် မျဉ်းများမှ parcel များ၊ right-of-way | parcel တစ်ခုစီကို ထောင့်များဖြင့် ဆွဲပါ၊ သို့မဟုတ် ၎င်း၏ calls များကို ရိုက်ပါ |
| plan ပေါ် curve table နှင့် line table များ၊ လက်ဖြင့် ရွှေ့ထားသော label များ | course တိုင်းကို ၎င်းနှင့်အတူ label လုပ်ထားသည် |
| LandXML ထဲ parcel များ | parcel များကို ပရောဂျက်ဖိုင်ထဲ သိမ်းပြီး PDF၊ DWG နှင့် DXF သို့ ထွက်သည် |

## Traverse များ

| မတည်ဆောက်ရသေးသည် | ယနေ့ အစားထိုး |
|---|---|
| least-squares adjustment၊ transit rule၊ ထောင့်များကို အကွာအဝေးများနှင့် အချိန်ချိန်ခြင်း | compass rule |
| deflection angle များ၊ zenith angle များနှင့် slope distance များ၊ trigonometric leveling ဖြင့် အမြင့်များ | အလျားလိုက် အကွာအဝေးနှင့် ထောင့်များကို မှန်အောင် လျှော့ပါ၊ သို့မဟုတ် bearing များ |
| Side shot များ၊ data collector မှ raw data ဖိုင်များ | အမှတ်များကို point file အဖြစ် သွင်းပါ |

## Staking

| မတည်ဆောက်ရသေးသည် | ယနေ့ အစားထိုး |
|---|---|
| Offset stake များ (stake မှ နောက်ပြန် သတ်မှတ်ထားသော reference အမှတ်များ)၊ catch point ရှိ slope stake များ | လိုအပ်သော offset များတွင် stake လုပ်ပါ၊ shoulder ကို ကျော်ပါ |
| Stake များကို data collector ၏ ကိုယ်ပိုင် format သို့ တိုက်ရိုက်ပို့ခြင်း | CSV ကို data collector အများစု၏ office software တွင် ဖွင့်နိုင်သည် |
| ပိုက်များ၊ pad များနှင့် parcel များကို staking လုပ်ခြင်း | alignment အနီးရှိ survey အမှတ်များ၊ သို့မဟုတ် parcel ၏ course များကို သုံးပါ |

## ဖိုင်များနှင့် output

| မတည်ဆောက်ရသေးသည် | ယနေ့ အစားထိုး |
|---|---|
| DWG သို့မဟုတ် DXF မှ စာသား၊ hatch နှင့် dimension များ၊ paper space၊ ချိတ်ထားသော ပုံဆွဲများ (xrefs)၊ binary DXF | model space ၏ linework ဖွင့်နိုင်သည် ([Open a DWG or DXF as linework](topic:open-dwg-dxf)); ချိတ်ထားသော ပုံဆွဲများကို ၎င်းတို့ကိုယ်ပိုင် ဖွင့်ပါ |
| အမှတ်များစွာကို တစ်ပြိုင်နက် ဆွဲ၍ ရွှေ့ခြင်း | ဖြတ်ပြီး ကူးထည့်ပါ၊ သို့မဟုတ် တစ်ခုချင်း တည်းဖြတ်ပါ |
| Portrait စာရွက်များ၊ ကိုယ်ပိုင် title block များ၊ သင်စီစဉ်သော viewport များ၊ DWG ထဲ plan နှင့် profile စာရွက်များ | PDF တစ်ခုလျှင် landscape plan စာရွက်တစ်ရွက်၊ သို့မဟုတ် alignment တစ်လျှောက် plan နှင့် profile စာရွက်များ (PDF) |
| အမြင့် bands နှင့် profiles ကို ပုံနှိပ်ခြင်း | Bands များသည် screen အတွက်သာ; လိုအပ်လျှင် screenshot ယူပါ |
| layer အမည်များ၊ အရောင်များ သို့မဟုတ် label style များ ပြောင်းခြင်း | DXF ထုတ်ပြီးနောက် CAD program တွင် ပြောင်းပါ |
| Cloud သိမ်းခြင်းနှင့် version history | `.civilcraft.json` ဖိုင်များကို သိမ်းပြီး backup လုပ်ပါ; ပရောဂျက်တစ်ခုကို အတူလုပ်ရန် CadCraft Studio ထဲ live session ကို သုံးပါ ([Design one site together, live](topic:work-live)) |
| iPad နှင့် iPhone အတွက် CadCraft Studio၊ Google Play မှ | စက်ပေါ်ရှိ browser တွင် CivilCraft ကို သုံးပါ; Android တွင် CadCraft Studio ကို getcadcraft.com/download မှ APK ဖြင့် ထည့်ပါ |
| point သို့မဟုတ် project ဖိုင် အများအပြား တစ်ပြိုင်နက် ဖွင့်ခြင်း | တစ်ကြိမ်လျှင် ဖိုင်တစ်ခု (အတူတူ ပါသော GIS ဖိုင်များ၊ ဥပမာ shapefile ၏ အစိတ်အပိုင်းများ၊ အတူ ဖွင့်သည်) |

## Landscape

| မတည်ဆောက်ရသေးသည် | ယနေ့ အစားထိုး |
|---|---|
| ထုတ်လုပ်သူများ၏ ခေါင်းများနှင့် နော်ဇယ်များ | ယေဘုယျ ခေါင်းများ၊ သို့မဟုတ် ဖိုင်မှ ကိုယ်ပိုင် ခေါင်းများ ထည့်ပါ; ထုတ်လုပ်သူ ဒေတာသည် ခွင့်ပြုချက် ပေးသည့်အခါ ဝင်လာသည် |
| drip line များအတွက် အများဆုံး ဘေးအကျယ်အလျား၊ အချိန်အလိုက် စီးဆင်းမှု၊ ပန့်များ၊ loop ပါသော ပိုက်ကွန်ရက်များ | drip လမ်းကြောင်းများကို ထုတ်လုပ်သူ ထုတ်ပြန်ထားသော အလျားအတွင်း ထားပါ; စစ်ဆေးမှုအတွက် branching ကွန်ရက် လိုအပ်သည် |
| ကွေးညွတ်သော freeform object ၏ အတိအကျ ပုံသဏ္ဌာန်၊ မြေအောက် ပမာဏကို အတိအကျ တိုင်းခြင်း | convex hull ကို grade လုပ်ပြီး မြေအောက် ပမာဏသည် ခန့်မှန်းချက်ဖြစ်သည် (Properties တွင် ဖော်ပြသည်) |
| BimCraft နှင့် ModelCraft ၏ ကိုယ်ပိုင် Place from library ထဲ အပင်များ | Landscape IFC ကို ထုတ်ပြီး BimCraft တွင် အဆောက်အအုံဘေးတွင် ဖွင့်ပါ |
| 3D view ထဲ အသေးစိတ် အပင် မော်ဒယ်များ (အရွက်၊ အကိုင်း၊ ရာသီများ)၊ 3D view ထဲ freeform object နှင့် ရေပိုက်ကွန်ရက် | အပင်များသည် အပင်စာရင်းမှ အရွယ်အစားရသော ရိုးရှင်းသော ပုံသဏ္ဌာန်အဖြစ် 3D တွင် ပြသည် ([View the site in 3D](topic:site-3d)); ModelCraft ၏ scatter က အပင် ပုံများ ပြုလုပ်သည် |
| surface ပေါ်တွင် ဘေးမှ grade လုပ်ထားသော အဆင့်ကို ထိန်းသည့် hardscape နံရံများ | platform သို့မဟုတ် pad တစ်ခုကို ဒေါင်လိုက် ဘေးများ ပေးပါ: ၎င်းတို့သည် surface ပေါ်ရှိ ထိန်းနံရံများ ဖြစ်သည် ([Grading](topic:grading)) |
| သင့်ကိုယ်ပိုင် SVG symbol များတွင် transform များ၊ သင့်ကိုယ်ပိုင် GLB အပင် မော်ဒယ်များ၏ texture နှင့် အရောင်များ၊ compressed GLB ဂျီသြမေတြီ | ပထမ ဒရော်ဝင်း program တွင် transform များကို ပြန်ညှိပါ; မော်ဒယ်များကို အပင်၏ အရောင်ဖြင့် ဆွဲသည်; GLB ကို compression မပါဘဲ ထုတ်ပါ ([Plant graphics](topic:plant-graphics)) |
| သင့် Library account ထဲ သိမ်းထားသော ကိုယ်ပိုင် အပင်စာရင်း (app ထဲမှ တည်းဖြတ်သည်) | ပရောဂျက်၏ ကိုယ်ပိုင် စာရင်းကို Plant table ထဲ တည်းဖြတ်ပြီး plants ဖိုင်အဖြစ် သိမ်းပါ |
| ပြတင်းပေါက်မပါဘဲ AI assistant များအတွက် landscape tool များ (file server နှင့် command line) | CivilCraft ပြတင်းပေါက် ဖွင့်ထားစဉ်တွင် အလုပ်လုပ်သည် ([Let an AI assistant work with your site](topic:assistants)) |

## လျှပ်စစ်ကြိုးများ (Power lines)

| မတည်ဆောက်ရသေးသည် | ယနေ့ အစားထိုး |
|---|---|
| နိုင်ငံ၏ စံချိန် built in (load case များ၊ clearance များ၊ factor များ) | သင့်စံ၏ တန်ဖိုးများကို {{ui:Load cases နှင့် ကန့်သတ်ချက်များ…}} တွင် သတ်မှတ်ပြီး သင့်စာကြည့်တိုက်နှင့်အတူ pack အဖြစ် သိမ်း၍ ပြန်သုံးမျှဝေပါ ([Packs](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| conductor မှ သစ်ပင် အပေါ်ယံ သို့မဟုတ် လမ်းကြောင်းဘေးရှိ နံရံသို့ ဘေးဘက်အကွာအဝေး | လိုင်းဖြတ်သော အပင်များနှင့် နံရံများအပေါ် ဒေါင်လိုက် clearance ([Power-line checks](topic:power-line-checks#clearances)) |
| conductor creep နှင့် conductor အသစ်၏ ဆန့်ခြင်း | stringing table ရှိ အပူချိန်များမှတစ်ဆင့် ထည့်တွက်ပါ |
| မြေအောက်ကေဘယ်များ၏ thermal rating (ထားပုံမှ လက်ရှိ rating) | သင့် supplier ၏ လက်ရှိ rating ကို cable item တွင် ရိုက်ပါ |
| Short-circuit၊ protection နှင့် earthing လေ့လာမှုများ | သီးသန့် လျှပ်စစ် program ကို သုံးပါ; CivilCraft သည် ကွန်ရက်၏ အလျားနှင့် ကေဘယ်များကို ပေးသည် |
| အဖွဲ့ဝင်တစ်ခုချင်း ဒီဇိုင်းလုပ်သော lattice tower များနှင့် မြေထဲ stay anchor များ | ထောက်ပံ့မှုများကို nominal load ဖြင့်၊ stay များကို rated load ဖြင့် စစ်သည် |
| ဖတ်သော program တွင် `.DON` လေ့လာမှုဖိုင် | ထို program တွင် ဖိုင်ကို စစ်ပါ; စမ်းသပ်နိုင်ရန် နမူနာ ပို့ပေးပါ |
| 3D view နှင့် IFC ထဲ လျှပ်စစ်ကြိုးများ | plan၊ လိုင်း profile၊ sheet များနှင့် GIS layer များ |
| ပြတင်းပေါက်မပါဘဲ AI assistant များအတွက် လျှပ်စစ်ကြိုး tool များ | CivilCraft ပြတင်းပေါက် ဖွင့်ထားစဉ်တွင် အလုပ်လုပ်သည် ([Let an AI assistant work with your site](topic:assistants)) |

## အဆောက်အအုံ ထုထည်များ

| မတည်ဆောက်ရသေးသည် | ယနေ့ အစားထိုး |
|---|---|
| ဇုန်ဖွဲ့ခြင်း ကုဒ်များ သို့မဟုတ် မြို့တစ်မြို့၏ စည်းမျဉ်းများ စာကြည့်တိုက် | သင့်ဥပဒေ မှ ကန့်သတ်ချက်များကို ရိုက်ပါ ([Zoning limits](topic:zoning-limits)) |
| နံရံများပေါ် ကောင်းကင်အလင်း (facade daylight)၊ လေ | [Sun hours](topic:sun-hours) သည် တိုက်ရိုက်နေရောင်ကိုသာ ရေတွက်သည် |
| သစ်ပင်၊ အပင် သို့မဟုတ် ထုထည်အဖြစ် မဆွဲထားသော အရာများမှ အရိပ် | ပတ်ဝန်းကျင် အဆောက်အအုံများကို ထုထည်အဖြစ် ဆွဲပါ |
| ထုထည်များပေါ် အမိုးပုံသဏ္ဌာန်များ | အမိုးပြား ထုထည်များ |
| ထုထည်ကို BimCraft တွင် ဖွံ့ဖြိုးစေသည့်အခါ အပေါက်များ၊ အမိုးများနှင့် နံရံအမျိုးအစားများ | BimCraft သည် အထပ်တိုင်းနှင့် ကြမ်းပြင်တွင် ရိုးရှင်းသော အပြင်နံရံများ ဖန်တီးသည်; ကျန်ရှိသည်များကို ထိုနေရာတွင် ထည့်ပါ |

## GIS နှင့် coordinate system များ

| မတည်ဆောက်ရသေးသည် | ယနေ့ အစားထိုး |
|---|---|
| File Geodatabase; KML style များ၊ icon များ၊ ground overlay များနှင့် network link များ | ပထမ GeoPackage၊ shapefile သို့မဟုတ် GeoJSON သို့ ပြောင်းပါ; KML placemark များကို style မပါဘဲ ဖတ်သည် |
| GIS feature များ သို့မဟုတ် ၎င်းတို့၏ attribute များကို တည်းဖြတ်ခြင်း | GIS program တွင် တည်းဖြတ်ပြီး ပြန်သွင်းပါ။ Analyze panel က layer အသစ်များ (buffer၊ overlay၊ join၊ selection) ပြုလုပ်ပြီး ဧရိယာနှင့် အလျား field များ ထည့်သည်၊ သို့သော် feature ကို နေရာတွင် မတည်းဖြတ်ပါ |
| Network နှင့် raster analysis၊ အဆုံးပြားသို့မဟုတ် စတုရန်းအဆုံးရှိ buffer များနှင့် တစ်ဘက်တည်း buffer များ၊ attribute table တွင် row ထည့်ခြင်း/ဖျက်ခြင်း သို့မဟုတ် field အမျိုးအစား ပြောင်းခြင်း၊ လက်ဖြင့် class အရောင်များ၊ plot ထဲ style legend | Select ဖြင့် feature များ ရွေးပြီး ထိုမှ layer ဖန်တီးပါ; flat အဆုံးများကို မပေးပါ။ attribute ဖြင့် အရောင်ချခြင်းနှင့် attribute table တို့ကို ပြုလုပ်ပြီးပြီ: [Style a layer by an attribute](topic:gis-symbology) နှင့် [Work with a layer's attribute table](topic:gis-table) ကို ကြည့်ပါ |
| Label style များ (အရွယ်အစား၊ နေရာချထားမှု) နှင့် တစ်ခုနှင့်တစ်ခု ရှောင်သော label များ | Label များသည် အရွယ်တစ်မျိုးတည်း ဖြစ်ပြီး feature များ ပြွတ်သိပ်သည့်နေရာတွင် ထပ်နိုင်သည် |
| ဒေတာ datum အမျိုးအစားများနှင့် geoid မော်ဒယ်များ | Elevation များကို ဖိုင်က ပေးသည့်အတိုင်း သုံးသည်; vertical datum ကို ကိုယ်တိုင် စစ်ပါ |
| NAD27 မှ NAD83 မှလွဲ၍ ဒေသအလိုက် grid shift များ (OSTN15၊ အခြား datum များအတွက် NTv2 ကို ဖိုင်ထည့်လျှင် အလုပ်လုပ်သည်)၊ grid များစွာ တစ်ပြိုင်နက်၊ vertical grid များ | သင့် datum အတွက် grid ဖိုင်ကို ကိုယ်တိုင် ထည့်ပါ; ပရောဂျက်တစ်ခုလျှင် grid တစ်ခု |
| DXF သို့မဟုတ် 3D ထုတ်ယူမှုထဲ မြေပုံ layer များ | မြေပုံ layer များသည် PDF plot ထဲ ဝင်ပြီး DWG ဘေးတွင် ပုံအဖြစ် |
| လက်မှတ် (sign-in)၊ key သို့မဟုတ် token လိုအပ်သော မြေပုံ server များ | အများပြည်သူ ဝန်ဆောင်မှုများ၊ သို့မဟုတ် georeferenced ပုံဖိုင်ကို သုံးပါ |
| surface၊ ground model သို့မဟုတ် elevation-grid နှင့် LiDAR tool များမှ LAS သို့မဟုတ် LAZ ဖိုင်များ ရေးခြင်း | surface များကို GeoTIFF elevation grid အဖြစ် ထုတ်ပါ။ [Point clouds](topic:point-clouds) add-on သည် ရှင်းလင်းထားသော cloud ကို LAS 1.4 သို့မဟုတ် LAZ အဖြစ် ရေးသည် |
| LiDAR intensity၊ အရောင်နှင့် return များ၊ band အများအပြားရှိ elevation grid များ၊ 200 MB ထက်ကြီးသော grid သို့မဟုတ် LiDAR ဖိုင်များ | LiDAR ကို class အလိုက်သာ စစ်သည်၊ grid များသည် ပထမ band ကို သုံးသည်; ကြီးသော ဖိုင်များကို အရင် tile အဖြစ် ဖြတ်ပါ |

## Input

| မတည်ဆောက်ရသေးသည် | ယနေ့ အစားထိုး |
|---|---|
| touch ဖြင့် box ရွေးခြင်း (၎င်းသည် {{key:Shift}} လိုအပ်သည်) | survey အမှတ်တစ်ခုစီကို ရှည်ရှည်နှိပ်ပြီး ထည့်ပါ |
| ဆွဲနေစဉ် ရိုက်ထည့်သော coordinate များ သို့မဟုတ် အကွာအဝေးများ | ကြမ်းကြမ်း ဆွဲပြီး PI table ထဲ alignment ၏ PI coordinate တိကျစွာ ရိုက်ပါ |
| pad ထောင့်များနှင့် structure များအတွက် coordinate ရိုက်ခြင်း | ၎င်းတို့၏ grip များကို ဆွဲပါ; တိကျမှုအတွက် zoom ဝင်ပြီး status bar ရှိ E နှင့် N ကို စောင့်ကြည့်ပါ |
| အရာဝတ္ထုများ (survey အမှတ်များ ကလွဲ၍) ကို snap လုပ်ခြင်း | zoom ဝင်ပြီး status bar ကို စောင့်ကြည့်ပါ |

## 3D view

| မတည်ဆောက်ရသေးသည် | ယနေ့ အစားထိုး |
|---|---|
| 3D view ထဲ ဆွဲခြင်း သို့မဟုတ် တည်းဖြတ်ခြင်း | plan ထဲ ဆွဲပြီး တည်းဖြတ်ပါ; 3D view က တည်းဖြတ်မှုတိုင်းကို လိုက်ပြောင်းသည် |
| 3D ထဲ နှိပ်ခြင်းဖြင့် corridor feature line သို့မဟုတ် GIS feature များ ရွေးခြင်း | plan ထဲ နှိပ်ပါ |
| ကြီးထားသော view သို့မဟုတ် ပေထွာ ထုတ်ခြင်း | ထုတ်ယူမှုများသည် မီတာဖြင့် အစစ်အမှန် အတိုင်း ဖြစ်သည်; [Export the site in 3D](topic:export-3d) ကို ကြည့်ပါ |
| GLB သို့မဟုတ် OBJ ထုတ်ယူမှု ထဲ label များ၊ 3D ထဲ label အရွယ်အစားနှင့် style များ | label များသည် 3D view ထဲမှာသာ ပြသည်၊ အရွယ်တစ်မျိုးတည်း; [View the site in 3D](topic:site-3d) ကို ကြည့်ပါ |
| ဓာတ်ပုံများမှ texture များ၊ ဗီဒီယိုအဖြစ် မောင်းသွားခြင်းကို မှတ်တမ်းတင်ခြင်း၊ ဆိုက်ပြင်ပမှ အရိပ်များ၊ 3D view ထဲ နေ့အချိန်ကို ပြခြင်း | မြေပုံ layer များကို surface ပေါ် ချပေးသည်; တစ်ချိန်တည်း မောင်းနှင်ခြင်းနှင့် နေ၏ နေရာ; [sun hours](topic:sun-hours) သည် plan ပေါ် တစ်ရက် သို့မဟုတ် ရာသီအတွက် |
