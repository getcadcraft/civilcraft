---
title: ဒီဇိုင်း ဒေါင်လိုက် profile
summary: profile view ကို ဖွင့်ရန်၊ မြေပြင်မှ design profile စတင်ရန်၊ PVI များ ထည့်ရန်နှင့် ဆွဲရန်၊ vertical curve အရှည်များ သတ်မှတ်ရန်၊ grade၊ K တန်ဖိုးနှင့် အမြင့်ဆုံး/အနိမ့်ဆုံး အမှတ်များကို ဖတ်ရန်။
keywords: profile, vertical alignment, pvi, vertical curve, grade, k value, crest, sag, bvc, evc, profile view, finished grade, fg, existing ground profile, feature lines in profile, crossings, projected, curb, ditch, labels, ပရိုဖိုင်, ဒေါင်လိုက် alignment, pvi, vertical curve, grade, k တန်ဖိုး, crest, sag, bvc, evc, profile view, ပြီးစီးသော grade, fg, ရှိပြီးသား မြေပြင် profile, profile ထဲ feature line များ, ဖြတ်ကျော်မှုများ, projected, curb, ditch, labels
from: dbb1f32d
---

alignment တစ်ခုစီတွင် design profile တစ်ခု ရှိသည်- PVI များ (station နှင့် elevation) စာရင်းဖြစ်ပြီး ဖြောင့်သော grade များဖြင့် ချိတ်ထားသည်၊ အလယ်ပိုင်း PVI တစ်ခုတွင် အရှည်ရှိပါက symmetric parabolic vertical curve ပါဝင်သည်။ ရှိပြီးသား မြေပြင် profile ကို surface မှ သင့်အတွက် နမူနာယူပေးသည်။

## profile view ကို ဖွင့်ခြင်း

1. alignment ကို ရွေးပါ (၎င်းကို {{ui:ရွေးရန်}} ဖြင့် နှိပ်ပါ)။
2. {{key:R}} ကို နှိပ်ပါ၊ သို့မဟုတ် toolbar ရှိ {{ui:ပရိုဖိုင်}} ကို နှိပ်ပါ၊ သို့မဟုတ် ညာဘက် panel အောက်ရှိ {{ui:ပရိုဖိုင်ကြည့်ရန်}} ကို နှိပ်ပါ။
   profile view သည် plan အောက်တွင် ဖွင့်ပြီး alignment တစ်လျှောက် ရှိပြီးသား မြေပြင်ကို ပြသည်။ alignment နှစ်ခု သို့မဟုတ် ထို့ထက်ပိုရှိလျှင် profile bar ၏ ဘယ်ဘက်ရှိ စာရင်းမှ တစ်ခုကို ရွေးပါ။

view သည် alignment တစ်ခုလုံးကို ပြသပြီး elevation များကို panel ကို ဖြည့်ရန် ဆန့်ထားသည်; exaggeration ကို ဘယ်ဘက်အောက်ထောင့်တွင် ပြသည်၊ ဥပမာ "Vertical exaggeration 10×"။

## profile ကို zoom နှင့် pan လုပ်ခြင်း

- **Zoom:** mouse wheel (သို့မဟုတ် trackpad ပေါ်တွင် pinch) ကို လှည့်ပါ၊ view သည် pointer ကို အလယ်ထားပြီး zoom ဝင်သည်။ {{key:Shift}} ကို ဖိထားလျှင် station များကိုသာ zoom၊ {{key:Alt}} ကို ဖိထားလျှင် elevation များကိုသာ zoom (exaggeration ပြောင်းသည်)။ profile view အာရုံရောက်နေစဉ် အပေါင်းနှင့် အနှုတ် ခလုတ်များက အလယ်ကို အခြေခံ၍ zoom လုပ်သည်။
- **Pan:** လက်ယာ သို့မဟုတ် အလယ် mouse ခလုတ်ဖြင့် ဆွဲပါ၊ သို့မဟုတ် trackpad ပေါ်တွင် လက်ညှိုးနှစ်ချောင်းဖြင့် ပွတ်ပါ။
- **Fit:** profile ကို နှစ်ချက်နှိပ်ပါ သို့မဟုတ် {{key:F}} ကို နှိပ်ပြီး alignment တစ်ခုလုံးကို ပြန်ပြပါ။

PVI ကို တည်းဖြတ်ခြင်းသည် သင်ရွေးထားသော zoom ကို ထိန်းထားသည်; fit သို့ ပြန်မခုန်ပါ။

profile ပေါ်တွင် pointer ကို ရွှေ့ပါ: bar က station၊ မြေပြင်နှင့် design elevation များ၊ grade နှင့် ထိုနေရာရှိ cut သို့မဟုတ် fill ကို ပြသည်၊ plan ရှိ alignment ပေါ်တွင် အစက်တစ်ခု လိုက်သည်။

## design profile စတင်ခြင်း

1. ညာဘက် panel ရှိ **Design profile** အောက်တွင် {{ui:မြေပြင်မှ စတင်ရန်}} ကို နှိပ်ပါ။
   PVI နှစ်ခုကို alignment ၏ အဆုံးနှစ်ခုတွင် မြေပြင်ပေါ် ထားပြီး ဖြောင့်သော grade တစ်ခုဖြင့် ချိတ်ထားသည်။ status bar က "Design profile started at the ground at both ends. Turn on Add PVIs and click to add grade breaks; give them a curve length in the table." ဟု ပြောသည်။

alignment က မြေပြင်ကို မဖြတ်လျှင် "This alignment has no ground under it to start from." ကို ရမည်။ ထိုအခါ နှိပ်ခြင်းဖြင့် PVI များ ထည့်ပါ (နောက်အပိုင်း)။

## PVI များ ထည့်ခြင်း

1. {{key:I}} ကို နှိပ်ပါ၊ သို့မဟုတ် profile bar ရှိ {{ui:PVI များ ထည့်ရန်}} ကို နှိပ်ပါ။ ၎င်းသည် နှိပ်ထားသည်အတိုင်း ရှိနေသည်။
2. grade break လိုသော နေရာကို profile တွင် နှိပ်ပါ။ PVI တစ်ခုကို ထို station နှင့် elevation တွင် 0.01 သို့ ပတ်ပြီး ထည့်ကာ ရွေးထားသည်။
3. လိုသလောက် ထည့်ပါ၊ ထို့နောက် ထပ်ထည့်ခြင်းကို ရပ်ရန် {{key:I}} ကို ထပ်နှိပ်ပါ။

PVI ရှိပြီးသား နေရာတွင် နှိပ်လျှင် ငြင်းပယ်သည် ("There is already a PVI at …")။ PVI များသည် အမြဲ station အစဉ်အတိုင်း ရှိနေသည်။

## ထည့်ခြင်း သို့မဟုတ် ဆွဲခြင်းအတွင်း Snap

profile bar ရှိ **Snap** ခလုတ်သည် အစမှ ဖွင့်ထားသည်။ ဖွင့်ထားစဉ်တွင် သင်ထည့်သော သို့မဟုတ် ဆွဲသော PVI သည် အနီးဆုံး PVI၊ ground point၊ PVI station သို့မဟုတ် ground line ပေါ်သို့ ကျသည်၊ marker ဘေးရှိ label က မည်သည်ကို ပြောသည်။ အခမဲ့ အမှတ်အတွက် {{key:Alt}} ကို ဖိထားပါ၊ ဘယ်နေရာမဆို ရနိုင်သည်။

## PVI များ ညှိခြင်း

- profile ရှိ PVI ကို **ဆွဲ** ပြီး ရွှေ့ပါ။ ၎င်း၏ အိမ်နီးချင်းများကို ကျော်မသွားနိုင်ပါ။ ရွှေ့ခြင်းသည် undo အဆင့်တစ်ခု ဖြစ်သည်။
- ညာဘက် panel ရှိ PVI table တွင် တိကျသော တန်ဖိုးများကို **ရိုက်** ပါ: **Station**၊ **Elevation**၊ **Slope %** နှင့် **Curve L** (vertical curve အရှည်)။ တစ်ခုစီပြီးနောက် {{key:Enter}} ကို နှိပ်ပါ။
- profile မှ တန်ဖိုးကို **ရွေး**: PVI ၏ station သို့မဟုတ် elevation ဘေးရှိ သေးငယ်သော ခလုတ်သည် profile view ရှိ နှိပ်မှုတစ်ခုကို စောင့်ပြီး ထိုတန်ဖိုးကို ထည့်ပေးသည်။ နှိပ်မှုသည် Add PVIs ကဲ့သို့ snap လုပ်သည်; အခမဲ့ အမှတ်အတွက် {{key:Alt}} ကို ဖိထားပါ; {{key:Esc}} ဖြင့် ပယ်ဖျက်သည်။
- **Slope %** သည် ထို PVI မှ စတင်ပြီး နောက်တစ်ခုသို့ သွားသော tangent ၏ grade ဖြစ်သည်။ ရိုက်ထည့်လျှင် **နောက်** PVI ၏ elevation ရွှေ့သည် (station မရွှေ့ပါ)။ နောက် PVI ကို လော့ခ်ချထားလျှင် ယခင် PVI ၏ elevation ရွှေ့သည်။
- PVI ကို အတန်း၏ အဆုံးရှိ လော့ခ် (padlock) ဖြင့် **လော့ခ်ချ** ပါ။ လော့ခ်ချထားသော PVI ကို ဆွဲ၍ မရပါ၊ slope တည်းဖြတ်ခြင်းက ၎င်းကို မရွှေ့ပါ။ tangent ၏ အဆုံးနှစ်ခုစလုံး လော့ခ်ချထားလျှင် ၎င်း၏ slope ပြောင်းမရပါ: status bar က ထို့ကို ပြောပြပြီး အဆုံးတစ်ခုကို အရင် ဖြုတ်ပါ။ လော့ခ်သည် ဖိုင်ထဲ သိမ်းသည်။
- PVI ကို အတန်း၏ အဆုံးရှိ x ဖြင့် **ဖယ်ရှား** ပါ၊ သို့မဟုတ် ရွေး (နှိပ်) ပြီး {{key:Delete}} ကို နှိပ်ပါ။ profile view အာရုံရှိနေစဉ် {{key:Backspace}} ကလည်း ဖယ်ရှားသည်။

ပထမဆုံးနှင့် နောက်ဆုံး PVI များသည် curve မရပါ။

## Vertical curve များ

1. အလယ်ပိုင်း PVI အတွက် **Curve L** တွင် အရှည် ရိုက်ပါ၊ ဥပမာ 200။
2. curve သည် PVI ၌ အလယ်ထားပြီး ဆွဲသည်။ profile နှင့် ညာဘက် panel က ၎င်း၏ အမျိုးအစား (crest သို့မဟုတ် sag)၊ L နှင့် K၊ BVC နှင့် EVC station နှင့် elevation များ၊ curve အတွင်း ရှိလျှင် ၎င်း၏ အမြင့်ဆုံး သို့မဟုတ် အနိမ့်ဆုံး အမှတ်ကို ပြသည်။

K ကို L မှ တွက်သည် (K = L ÷ grade များ၏ ဂဏန်းသင်္ချာ ကွာခြားချက်၊ ရာခိုင်နှုန်းဖြင့်)။ သင်သည် L ကို ရိုက်သည်; K ကို တိုက်ရိုက် ရိုက်ခြင်းမှာ အခု မရနိုင်သေးပါ။

vertical curve မကိုက်ညီလျှင် အနီရောင် အကွက်က အကြောင်းပြောသည်- ၎င်းသည် ရှေ့ရှိ PVI သို့မဟုတ် curve ထဲသို့ ပြန်ဝင်သွားသည်၊ သို့မဟုတ် နောက်တစ်ခု PVI ကို ကျော်သွားသည်၊ နှင့် ထိုဘက်တွင် အခန်းဘယ်လောက် ရှိကြောင်း ပြသည် (curve သည် PVI ၏ နှစ်ဘက်စလုံး ၌ အရှည်၏ တဝက်လိုသည်)။ ခလုတ်က **ကိုက်ညီသော အရှည်ဆုံး curve** ကို K နှင့်အတူ အဆင့်တစ်ခုအဖြစ် သတ်မှတ်သည် ({{key:Mod+Z}} ဖြင့် ပြန်ဖျက်နိုင်သည်)။ သို့မဟုတ် PVI များကို ခွာပါ။

## အချက်အလက်များ ဖတ်ခြင်း

PVI table အောက်ရှိ စာရင်းသည် grade တစ်ခုစီကို ရာခိုင်နှုန်းဖြင့် ("Grade 1: +1.25%") နှင့် curve တစ်ခုစီကို ဥပမာ "Crest at 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)" ဟု ပေးပြီး၊ ထို့နောက် "High point 1+62.40, 254.12" ကို ပြသည်။

PVI များက alignment ၏ အဆုံးနှစ်ခုစလုံးသို့ မရောက်လျှင် မှတ်ချက်တစ်ခု ပြသည်။ corridor ကို profile နှင့် alignment ထပ်သော နေရာတွင်သာ တည်ဆောက်သည်။

## profile ထဲ feature line များ

feature line များကိုလည်း profile view တွင် ပြသည်၊ ထို့ကြောင့် curb၊ ditch သို့မဟုတ် နံရံထိပ်ကို လမ်း၏ profile ဘေးတွင် မြင်နိုင်သည်။

- feature line တစ်ခုက alignment ကို **ဖြတ်ကျော်** လျှင် profile က ထို station နှင့် elevation တွင် စတုဂံ အကွက်ငယ် (diamond) ပြပြီး လိုင်း၏ အမည်နှင့် ထိုနေရာရှိ elevation ဖြင့် label လုပ်သည် (ဖြတ်ကျော်သော အပိုင်းအလိုက် တွက်ချက်သော လိုင်း၏ ကိုယ်ပိုင် elevation)။
- {{ui:ဘေးတွင် အတွင်း}} ထဲ အကွာအဝေး ရိုက်ပါ၊ ထိုအကွာအဝေးအတွင်း alignment ၏ **ဘေးတွင် ပြေးသော** feature line များကိုလည်း ၎င်းတို့၏ ကိုယ်ပိုင် elevation တွင် dashed လိုင်းများအဖြစ် ဆွဲပါ။ အလွတ် သို့မဟုတ် 0 က ဖြတ်ကျော်မှုများကိုသာ ပြသည်။
- အမှတ်အသားများနှင့် label များသည် ပြောင်းလဲမှု တိုင်းကို လိုက်သည်: vertex တစ်ခုကို ရွှေ့ပါ၊ grade ရိုက်ပါ၊ သို့မဟုတ် လိုင်းကို မြှင့်ပါ၊ profile က elevation အသစ်ကို ချက်ချင်း ပြသည်။
- ဖြတ်ကျော်မှု diamond ကို နှိပ်ပြီး feature line ကို ရွေးပါ; ရွေးထားသော လိုင်းကို highlight အရောင်ဖြင့် ဆွဲသည်။
- profile bar ရှိ {{ui:Feature line များ}} သည် အားလုံးကို ဖျောက်ခြင်း သို့မဟုတ် ပြခြင်း ဖြစ်သည်။ ဆက်တင်နှစ်ခုစလုံးကို ပရောဂျက်နှင့်အတူ သိမ်းသည်။

[Feature lines](topic:feature-lines) ကို ကြည့်ပါ။

## နောက်တစ်ခု

- alignment နှင့် ဤ profile တစ်လျှောက် [Sweep a road corridor](topic:corridor)။
- profile ကို alignment နှင့်အတူ LandXML သို့ ရေးသည်; [Exchange LandXML](topic:landxml) ကို ကြည့်ပါ။
