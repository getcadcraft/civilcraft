---
title: မီးရထားလမ်း ဒီဇိုင်းဆွဲခြင်း
summary: လမ်းကြောင်းကို မီးရထားလမ်းအဖြစ် ပြုလုပ်ခြင်း: ရထားလမ်းအကူးအပြောင်းများ (clothoid၊ cubic parabola၊ Bloss၊ Helmert၊ sine half-wave၊ sine)၊ ကွေ့တိုင်းရှိ cant နှင့် ၎င်း၏ equilibrium cant၊ deficiency နှင့် excess၊ cant နှင့် လမ်းဖွဲ့စည်းပုံ ကန့်သတ်ချက်များကို သတိပေးချက်အဖြစ်၊ station အလိုက် turnout နှင့် crossover များ၊ လမ်းကြောင်းတလျှောက် ရွှေ့ဆွဲထားသော clearance envelope၊ ရထားလမ်း၊ sleeper နှင့် ballast bed ပါဝင်သော corridor အဖြစ် တည်ဆောက်ထားသည့် လမ်း — plan၊ section၊ profile၊ 3D နှင့် ပမာဏများတွင်။
keywords: railway, rail, railroad, track, train, metro, tram, cant, superelevation, cant deficiency, cant excess, equilibrium cant, transition, transition curve, clothoid, cubic parabola, bloss, helmert, sine half-wave, cosine, gauge, standard gauge, broad gauge, metre gauge, narrow gauge, sleeper, tie, crosstie, ballast, sub-ballast, formation, cess, track centres, 60E1, 54E1, UIC60, 115RE, 136RE, cant gradient, rate of change of cant, turnout, switch, points, crossover, frog, frog number, lead, closure curve, diverging speed, clearance, clearance envelope, structure gauge, loading gauge, kinematic envelope, platform, platform gap, track spacing, gradient, vertical curve, minimum radius, LandXML cant, မီးရထား, ရထားလမ်း, ရထား, မြေအောက်ရထား, လမ်းပေါ်ရထား, ကွေ့, အကူးအပြောင်း, အလျား, အကျယ်, ဘောင်ကန့်သတ်ချက်, ရထားလမ်းအကွာအဝေး, ခင်းကျင်းချက်
from: 99de9745
---

 မည်သည့် လမ်းကြောင်းမဆို ရထားလမ်း ဖြစ်နိုင်သည်။ ထို့နောက် ၎င်း၏ ကွေ့များသည် ရထားလမ်းအကူးအပြောင်း (rail transitions) နှင့် cant (ရထားလမ်းများ၏ superelevation) ကို ရရှိပြီး ၎င်း၏ corridor ကို လမ်းတစ်ခုအဖြစ် တည်ဆောက်သည်- sleeper များပေါ်ရှိ ရထားလမ်းများနှင့် ballast bed၊ လမ်းကဲ့သို့ မြေပြင်ထဲသို့ ဆင်းစောက်ပြီး ပြင်ဆင်ထားသည်။ Turnout နှင့် crossover များကို station အလိုက် ထည့်နိုင်ပြီး clearance envelope ကို လမ်းတလျှောက် ရွှေ့ဆွဲ၍ ဘေးရှိ အရာဝတ္ထုများနှင့် စစ်ဆေးနိုင်သည်။

အောက်ပါ ဂဏန်းတိုင်းသည် **နေရာယာယီ** တန်ဖိုးများဖြစ်ပြီး စံနှုန်း မဟုတ်ပါ။ ရထားလမ်းများသည် လိုင်းအမြန်နှုန်း၊ လမ်းအမျိုးအစားနှင့် နိုင်ငံအလိုက် ကန့်သတ်ချက်များ သတ်မှတ်ကြသည်၊ ထို့ကြောင့် ကိုယ်ပိုင် ရထားလမ်း စံနှုန်းမှ သတ်မှတ်ပါ။ CivilCraft တွင် နိုင်ငံတစ်ခုလုံးအတွက် ဇယားကို ပါဝင်မပေးပါ။

## လမ်းကြောင်းကို ရထားလမ်း ပြုလုပ်ခြင်း

1. လမ်းကြောင်းကို ရွေးပြီး Properties ထဲမှ **Railway** ကို ရှာပါ။
2. **This alignment is a railway track** ကို အမှတ်အသားလုပ်ပါ။ ပြောင်းလဲမှုတိုင်းသည် undo တစ်ဆင့် ဖြစ်သည်။
3. လမ်းကြောင်း Properties အပေါ်ရှိ **Design speed** ကို သတ်မှတ်ပါ- ၎င်းသည် cant ကို စစ်ဆေးမည့် လိုင်းအမြန်နှုန်း ဖြစ်သည်။ **Slowest trains** (Railway block ထဲတွင်) သည် cant excess ကို စစ်ဆေးမည့် အမြန်နှုန်း ဖြစ်သည်။

## အကူးအပြောင်းများ

PI ဇယား (**Spiral in**၊ **Spiral out**) တွင် ကွေ့တိုင်းအတွက် အစနှင့် အဆုံး နှစ်ဖက်စလုံးတွင် spiral အလျား ရိုက်ထည့်ပါ။ ထို့နောက် Railway block ရှိ ကွေ့ဇယားတွင် သို့မဟုတ် **Transition for every curve** ဖြင့် အမျိုးအစားကို ရွေးပါ-

| အမျိုးအစား | အကူးအပြောင်းတလျှောက် curvature |
|---|---|
| Clothoid | တစ်ညီတည်း တိုးလာသည် (လမ်း spiral) |
| Cubic parabola | y = x³ / (6·R·L)၊ L ကို tangent တလျှောက် တိုင်းသည်၊ ကွေးကိုယ်တိုင်က အနည်းငယ် ပိုရှည်သည် |
| Bloss | ပြည့်ဝ curvature ၏ 3u² − 2u³ (u = အလျား၏ ဝေစု)၊ စနှင့် အဆုံးတွင် နူးညံ့စွာ စတင်သည် |
| Helmert | parabola နှစ်ခု၊ 2u² ထို့နောက် 1 − 2(1 − u)² |
| Sine half-wave | (1 − cos πu) / 2 |
| Sine | u − sin(2πu) / 2π |

Cubic parabola မှလွဲ၍ အားလုံးသည် clothoid ကဲ့သို့ L / 2R ဖြင့် ကွေ့သည်။ Station များသည် အမှန်အလျားတလျှောက် ရေတွက်သည်။ LandXML သည် အမျိုးအစားကို ထိန်းသိမ်းသည် (spiType clothoid၊ cubicParabola၊ bloss၊ biquadratic၊ cosine၊ sinusoid)။

## Cant

ကွေတိုင်းရဲ့ **Cant** ကို မီလီမီတာဖြင့် ရိုက်ထည့်ပါ။ ဇယားက ကွေတိုင်းအလိုက် အောက်ပါတို့ကို ပြသသည်-

- **Equilibrium** cant = G·v² / (g·R)၊ G သည် ရထားလမ်းများ၏ ဗဟိုအကွာအဝေး (**Rail centres**၊ gauge နှင့် ရထားလမ်းခေါင်းအကျယ်ပေါင်း၊ သင်ရိုက်မထည့်သော်လည်း)။ G = 1500 mm ဖြစ်လျှင် ၎င်းသည် ရင်းနှီးသော 11.8·V² / R ဖြစ်သည် (V km/h၊ R m)။
- **Deficiency** = လိုင်းအမြန်နှုန်းရှိ equilibrium − အသုံးပြုထားသော cant။
- **Excess** = အသုံးပြုထားသော cant − အနှေးဆုံးရထားများ၏ အမြန်နှုန်းရှိ equilibrium။
- **Ramp**: ၎င်း၏ ramp များတလျှောက် cant gradient အမြင့်ဆုံး၊ mm per metre ဖြင့်။

Cant သည် အကူးအပြောင်းတစ်ခုစီ၌ တဖြည်းဖြည်း တက်လာပြီး ၎င်း၏ curvature ပုံသဏ္ဍာန်အတိုင်း ဖြစ်သည်- clothoid သို့မဟုတ် cubic parabola အတွက် မျဉ်းဖြောင့်၊ Bloss အတွက် Bloss ပုံသဏ္ဍာန်၊ စသည်ဖြင့်။ အကူးအပြောင်းမရှိသော ကွေ့အဆုံးသည် ရှေ့ရှိ မျဉ်းဖြောင့်ပေါ်တွင် cant gradient ကန့်သတ်ချက်က လိုအပ်သလောက် ရှည်ရှည် တက်ပြီး ထိုသို့ ဖော်ပြသည်။ ထိုအခါ cant သည် curvature မပြောင်းသော နေရာတွင် ပြောင်းသည်။

**Cant turns about** သည် မည်သည့် ရထားလမ်းက ဒီဇိုင်း profile ပေါ်တွင် ရပ်တည်မည်ကို ဖော်ပြသည်- **the low rail** (အသုံးများသည်)၊ **the inner rail** သို့မဟုတ် **the track centre** (ရထားလမ်းတစ်ခုစီသည် cant ၏ ထက်ဝက် ရွေ့သည်)။ ဒီဇိုင်း profile သည် ထိုနေရာရှိ ရထားလမ်းခေါင်း၏ထိပ် ဖြစ်သည်။

**Cant diagram** သည် station များတလျှောက် profile အပေါ် ရထားလမ်းတစ်ခုစီ၏ အမြင့်ကို ဆွဲပြသည်။ Profile view နှင့် plan နှင့် profile ရွက်များတွင် profile အောက်ရှိ band အဖြစ် တူညီစွာ ပါဝင်သည်။

## Cant ကန့်သတ်ချက်များနှင့် သတိပေးချက်များ

**Most applied cant**၊ **Most cant deficiency**၊ **Most cant excess**၊ **Steepest cant gradient** နှင့် **Fastest change of cant** (လိုင်းအမြန်နှုန်းရှိ gradient၊ mm/s) တို့ကို ကွေတိုင်းတိုင်းတွင် စစ်ဆေးသည်။ ကန့်သတ်ချက်ထက်ကျော်သော တန်ဖိုးသည် Railway block နှင့် Problems panel တွင် သတိပေးချက် ဖြစ်ပြီး ကန့်သတ်ချက်နှင့် တွေ့ရှိသော တန်ဖိုးကို ပြသည်။ Design speed မရှိလျှင် deficiency နှင့် ပြောင်းလဲနှုန်းကို စစ်ဆေးမည် မဟုတ်ပါ (မှတ်ချက်ဖြင့် ပြောပြသည်)။

## ရထားလမ်း

**Gauge** (စံ 1435 mm၊ broad၊ metre သို့မဟုတ် narrow preset များ၊ သို့မဟုတ် ကိုယ်ပိုင်တန်ဖိုး) ကို သတ်မှတ်ပါ၊ **Rail section** (60E1၊ 54E1၊ 49E1၊ 115RE၊ 136RE- ၎င်းတို့၏ ထုတ်ပြန်ထားသော ပမာဏများသာ)၊ **Tracks** အရေအတွက်နှင့် **Track centres**၊ ထို့နောက် **Sleepers and ballast**- sleeper ပစ္စည်း၊ အလျား၊ အကျယ်၊ အနက်နှင့် အကွာအဝေး၊ sleeper အောက်ရှိ ballast အနက် (low rail ဘက်တွင်)၊ shoulder၊ slope၊ ၎င်း၏ထိပ်သည် sleeper များအောက် အဘယ်မျှနက်သည်၊ sub-ballast အနက်၊ ballast toe ကျော်သော cess၊ နှင့် formation ၏ cross fall။

**Build the track** ကို နှိပ်ပါ။ ၎င်းသည် လမ်းကြောင်း၏ corridor ကို ဖွင့်ပြီး ဒီဇိုင်း profile တလျှောက် လမ်းအဖြစ် တည်ဆောက်သည်- ရထားလမ်းများနှင့် sleeper များသည် cant နှင့်အတူ စောင်းသည်၊ formation မစောင်းပါ။ Daylight slope များသည် corridor ၏ cut နှင့် fill slope များရှိ cess အစွန်းမှ ဆင်းသည်၊ ရထားလမ်းသည် လမ်းကဲ့သို့ ထောက်လှမ်းထားသော မြေပြင်သို့ ဆင်းစောက်သည်။

- **Plan**: ရထားလမ်းတစ်ခုစီ၏ ရထားလမ်းနှစ်ခုစလုံး (layer C-RAIL-TRAK) နှင့် ရထားလမ်း တစ်ခုထက်ပိုရှိလျှင် ရထားလမ်းတစ်ခုစီ၏ ဗဟို (C-RAIL-CNTR)၊ မျက်နှာပြင်၊ DXF၊ DWG၊ PDF နှင့် plan နှင့် profile ရွက်များတွင်။
- **Sections**: sleeper များ၊ ရထားလမ်းများ၊ ballast နှင့် sub-ballast ၏ အောက်ခြေများ၊ section အားလုံးတွင်။
- **3D**: ရထားလမ်းများ၊ sleeper တိုင်းနှင့် ballast bed (Show › Track)၊ GLB၊ OBJ နှင့် USD တွင်လည်း။
- **Quantities**: လမ်းအလျား၊ ရထားလမ်း (ရထားလမ်းတစ်ခုစီ၏ ကိုယ်ပိုင်လိုင်းတလျှောက် ရထားလမ်းနှစ်ခုစလုံး)၊ sleeper များ၊ ballast bed နှင့် sleeper ထည့်မတွက်သော ballast၊ နှင့် sub-ballast၊ section များကြား average end area နည်းဖြင့်။

## လမ်းဖွဲ့စည်းပုံ စစ်ဆေးချက်များ

Cant ဘေးတွင် Railway block သည် လိုင်းကိုယ်တိုင်ကို နောက်ထပ် ကန့်သတ်ချက် ခြောက်ခုဖြင့် စစ်ဆေးသည် (အားလုံး နေရာယာယီ၊ အားလုံး သင်ကိုယ်တိုင် သတ်မှတ်ရန်)-

- ဒီဇိုင်း profile ၏ **Steepest gradient**၊ mm per metre ဖြင့်။
- **Least vertical curve radius**၊ factor k အဖြစ် R ≥ k·V² (R m၊ V km/h)။ ကြားနေ gradient နှစ်ခုကြား အလျား L ရှိ parabolic vertical curve ၏ radius သည် L ကို gradient ပြောင်းလဲမှုဖြင့် စားသည်။
- **Shortest vertical curve**။
- Plan ရှိ **Least curve radius** (0 ဖြင့် စစ်ဆေးမှု ပိတ်သည်)။
- **Shortest arc or straight**၊ လိုင်းအမြန်နှုန်းရှိ ခရီးသွားချိန် စက္ကန့်အဖြစ်- ထိုအကွာအဝေးထက် တိုသော စက်ဝိုင်း arc သို့မဟုတ် ကွေနှစ်ခုကြားရှိ မျဉ်းဖြောင့်ကို သတိပေးသည်။ 1.8 s သည် "km/h ရှိ အမြန်နှုန်း၏ ထက်ဝက်၊ မီတာဖြင့်" ဟု ရင်းနှီးသော စံဖြစ်သည်။
- အကူးအပြောင်းတလျှောက် **Rate of change of cant deficiency**၊ လိုင်းအမြန်နှုန်းရှိ mm/s ဖြင့်။

**Track geometry** သည် တွေ့ရှိသော steepest gradient နှင့် vertical curve တိုင်းကို ၎င်း၏ radius နှင့် လိုင်းအမြန်နှုန်းလိုအပ်သော radius နှင့်အတူ ဖော်ပြသည်။ အကူးအပြောင်း သို့မဟုတ် cant ramp ပေါ်ရှိ vertical curve တွင် မှတ်ချက် ပါလာသည်။ ဒီဇိုင်း profile သို့မဟုတ် ဒီဇိုင်း အမြန်နှုန်း မရှိလျှင် ၎င်းတို့ လိုအပ်သော စစ်ဆေးချက်များကို ကျော်ပြီး မှတ်ချက်ဖြင့် ပြောပြသည်။

## Turnout နှင့် crossover များ

**Turnouts and crossovers** အောက်တွင် **Add a turnout** ကို နှိပ်ပါ။ ၎င်းကို အရှည်ဆုံး မျဉ်းဖြောင့်ပေါ်တွင် ထားသည်၊ ဇယားတွင် သတ်မှတ်ပါ-

- **Switch toe station**- turnout သည် ဤလမ်းကြောင်းပေါ်တွင် စသည့်နေရာ။
- **Frog**- frog နံပါတ် N (1:N)။ Frog ထောင့်သည် 2·atan(1 / 2N) ဖြစ်သည်။
- **Side**- ဘယ် သို့မဟုတ် ညာ၊ station တိုးရာဘက်ကို ကြည့်သည်။
- **Crossover spacing** မီတာဖြင့်- 0 ထက်ကြီးလျှင် turnout သည် ထိုအကွာအဝေးရှိ ဘေးညီ ရထားလမ်းသို့ crossover ဖြစ်လာသည် (turnout နှစ်ခုနှင့် ၎င်းတို့ကြား မျဉ်းဖြောင့်)။

ဇယားတွင် **Lead** (switch toe မှ frog)၊ closure curve ၏ **Radius** နှင့် သင်၏ cant deficiency ကန့်သတ်ချက်နှင့် cant မရှိဘဲ ထို radius က ခွင့်ပြုသော **Diverging speed** ကို ပြသည်။ **Make its track** သည် ကွဲထွက်လမ်းကြောင်းကို ကိုယ်ပိုင် လမ်းကြောင်းအဖြစ် ပြောင်းသည် (switch၊ closure curve၊ ထို့နောက် frog ထောင့်ဖြင့် တည့်တည့်)၊ တူညီသော ရထားလမ်း ဆက်တင်များဖြင့်၊ အရှည်ချဲ့ရန် အဆင်သင့်။

Plan သည် turnout တစ်ခုစီ၏ ကွဲထွက်ရထားလမ်းနှစ်ခု၊ ၎င်း၏ centreline၊ switch toe နှင့် frog တွင် tick နှင့် "1:N" (layer C-RAIL-TURN) ကို ဆွဲသည်၊ မျက်နှာပြင်၊ DXF၊ DWG၊ PDF နှင့် ရွက်များတွင်။ 3D view သည် ကွဲထွက်ရထားလမ်းများကို ပင်မလမ်း၏ အဆင့်တွင် ဆွဲသည်။

ပုံသဏ္ဍာန်သည် **နေရာယာယီ** ဖြစ်သည်- frog နံပါတ်မှ ပြတ်သား switch တစ်ခုနှင့် closure curve တစ်ခု။ တည်ဆောက်ထားသော turnout သည် ရထားလမ်း စံနှင့် ထုတ်လုပ်သူ ပုံဆွဲနှင့် လိုက်နာသည်။ သတိပေးချက်များ- လမ်းကြောင်းမှ ထွက်သွားသော၊ ကွေ၊ အကူးအပြောင်း၊ cant သို့မဟုတ် vertical curve ပေါ်တွင်ရှိသော၊ သို့မဟုတ် အခြား turnout နှင့် ထပ်နေသော turnout၊ နှင့် လိုင်းအမြန်နှုန်းသည် ၎င်း၏ diverging speed ထက်ကျော်သည့်အခါ မှတ်ချက်။

## Clearance envelope

**Sweep a clearance envelope along this track** ကို အမှတ်အသားလုပ်ပါ။ **Outline** ကို ရွေးပါ (နေရာယာယီ ပုံသဏ္ဍာန် နှစ်ခု၊ သို့မဟုတ် **Your own outline** ဖြင့် မျဉ်းတစ်ကြောင်းစီ အမှတ်တစ်ခုအဖြစ် ရိုက်ထည့်ပါ- ရထားလမ်းဗဟိုမှ offset၊ ထို့နောက် ရထားလမ်းထိပ်အထက် အမြင့်၊ မီတာဖြင့်)၊ **Vehicle length** နှင့် **Bogie centres**၊ ရှိလျှင် **Platform edge** (ဘက်၊ ရထားလမ်းဗဟိုမှ အကွာအဝေး၊ ရထားလမ်းအထက် အမြင့်)။

Station တိုင်းတွင် outline ကို low rail ကို ဗဟိုပြုပြီး cant ဖြင့် စောင်းပြီး ကွေဖြင့် ကျယ်လာသည်- ယာဉ်၏ အလယ်သည် b² / 8R ဖြင့် အတွင်းသို့ ရွေ့သည်၊ ၎င်း၏ အဆုံးများသည် (L² − b²) / 8R ဖြင့် အပြင်သို့ ရွေ့သည် (b = bogie centres၊ L = ယာဉ်အလျား၊ R = ထိုနေရာ၏ radius၊ အကူးအပြောင်းကို လိုက်သည်)။ Block သည် မျဉ်းဖြောင့်တွင်နှင့် အကျယ်ဆုံးနေရာတွင် section ကို ဆွဲပြပြီး အောက်ပါတို့ကို ဖော်ပြသည်-

- **widest envelope** နှင့် ၎င်း၏ နေရာ၊
- **track centres** ကို နှစ်ဖက်ဘေးရှိ envelope နှစ်ခုက လိုအပ်သော centres နှင့် နှိုင်းယှဉ်ထားသည်၊
- **platform edge** တွင် ကျန်ရှိသော နေရာ၊ သို့မဟုတ် အတွင်းဘက်သို့ ဝင်နေသည့် အကွာအဝေး၊
- **envelope အတွင်း** တွေ့ရသော feature line တိုင်း၊ pipe structure နှင့် အခြား ရထားလမ်း လမ်းကြောင်း။

အမြင့်ရှိ feature line ကို ၎င်း၏ ရထားလမ်းအထက် အမြင့်ရှိ outline နှင့် စစ်ဆေးသည်၊ ဒီဇိုင်း profile မရှိလျှင် သို့မဟုတ် အမြင့်မရှိသော အမှတ်အတွက်၊ plan တွင်သာ စစ်ဆေးပြီး စာရင်းက ထိုသို့ ပြောပြသည်။ Plan သည် envelope ၏ အစွန်းနှစ်ဖက် (layer C-RAIL-CLRN) ကို ပြပြီး အတွင်းရှိ အရာတိုင်းတွင် လက်ကျော်ဖြင့် ပြသည်။

ပေးထားသော outline များသည် **နေရာယာယီများ ဖြစ်ပြီး မည်သည့် ရထားလမ်း gauge မှ မဟုတ်ပါ**။ ရလဒ်ကို မှီခိုမီ သင့်ရထားလမ်း၏ structure gauge ကို ရိုက်ထည့်ပါ။

## အခြား ပရိုဂရမ်များတွင်

- **LandXML**: ရထားလမ်းလမ်းကြောင်းကို ၎င်း၏ အကူးအပြောင်းများ (spiType) နှင့် `Cant` block ဖြင့် ရေးသည်- gauge၊ rotation point၊ လိုင်းအမြန်နှုန်း၊ နှင့် cant ramp တစ်ခုစီ စတင်ပြီး ဆုံးသည့် station၊ အသုံးပြုထားသော cant၊ equilibrium cant နှင့် deficiency ပါဝင်သည်။ `Cant` block ပါသော LandXML ဖိုင်ကို ဖွင့်လျှင် ထိုလမ်းကြောင်းကို ထို cant များဖြင့် ရထားလမ်း ဖြစ်စေသည်။
- **IFC**: cant segment များ၊ ရထားလမ်းများ၊ sleeper များ၊ ballast နှင့် sub-ballast ပါဝင်သော လမ်းကြောင်း။

## ဆောက်လုပ်ထားခြင်း မရှိသေးသော အရာများ

IFC export ထဲရှိ turnout များ၊ တစ်ခုတည်းသော closure curve ထက်ကျော်သော turnout မိသားစုများ (ကွေးသော switch များ၊ swing-nose frog များ၊ slip များ၊ diamond များ)၊ kinematic gauge စည်းမျဉ်းများ (envelope သည် curve throw ပါသော ပုံသေ outline ဖြစ်သည်)၊ လေကြောင်းဝါယာကြိုးများနှင့် အချက်ပြစနစ်။

**မည်သည့် စံနှုန်း။** Railway block တွင် "Standard to cite" သည် None သို့မဟုတ် European (UIC နှင့် EN) ကို ယူသည်။ European ကို ရွေးလျှင် ဥရောပပရောဂျက်များ ကိုးကားသော စာရွက်စာတမ်းများ (alignment parameter များအတွက် EN 13803၊ switch နှင့် crossing များအတွက် EN 13232၊ gauge များအတွက် EN 15273၊ track geometry အရည်အသွေးအတွက် EN 13848) ကို ပြပြီး ကန့်သတ်ချက်တိုင်းအတွက် ၎င်း၏ ရင်းမြစ် clause အတွက် ကွက်လပ်ကို ပေးသည်။ မည်သည့် စံနှုန်းမှ ဂဏန်းကိုမျှ တည်ဆောက်ပြီးသား မပါဝင်ပါ- cant၊ deficiency၊ excess၊ gradient နှင့် rate ကန့်သတ်ချက်များ၊ turnout ဂျီဩမေတြီနှင့် structure gauge သည် အားလုံး နေရာယာယီ ဖြစ်ဆဲဖြစ်ပြီး ဝင်းဒိုးက ထိုသို့ ပြောပြသည်။ ရထားလမ်းအင်ဂျင်နီယာသည် တန်ဖိုးတိုင်းကို စံနှုန်း၏ စာသားဖြင့် စစ်ဆေးပြီး ၎င်းဘေးတွင် clause ကို ရိုက်ထည့်ရမည်၊ မတည်ဆောက်မီ။ South Africa နှင့် AREMA ဇယားများသည် ဤထုတ်ဝေမှုတွင် မပါဝင်ပါ။
