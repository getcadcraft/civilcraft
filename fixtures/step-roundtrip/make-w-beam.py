import sys, math
from OCP.BRepPrimAPI import BRepPrimAPI_MakeBox, BRepPrimAPI_MakeHalfSpace, BRepPrimAPI_MakeCylinder
from OCP.BRepAlgoAPI import BRepAlgoAPI_Fuse, BRepAlgoAPI_Cut
from OCP.BRepFilletAPI import BRepFilletAPI_MakeFillet
from OCP.BRepBuilderAPI import BRepBuilderAPI_MakeFace
from OCP.ShapeUpgrade import ShapeUpgrade_UnifySameDomain
from OCP.gp import gp_Pnt, gp_Pln, gp_Dir, gp_Ax2
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_EDGE
from OCP.TopoDS import TopoDS
from OCP.BRepAdaptor import BRepAdaptor_Curve
from OCP.STEPControl import STEPControl_Writer, STEPControl_AsIs
from OCP.GProp import GProp_GProps
from OCP.BRepGProp import BRepGProp
# W8x31-like: d 203, bf 203, tf 11, tw 7.2, root r 10; length 900 along X; ends mitred 30 deg and 45 deg; two bolt holes in the web
d, bf, tf, tw, r, L = 203.0, 203.0, 11.0, 7.2, 10.0, 900.0
bot = BRepPrimAPI_MakeBox(gp_Pnt(0, -bf/2, 0), L, bf, tf).Shape()
top = BRepPrimAPI_MakeBox(gp_Pnt(0, -bf/2, d-tf), L, bf, tf).Shape()
web = BRepPrimAPI_MakeBox(gp_Pnt(0, -tw/2, tf), L, tw, d-2*tf).Shape()
s = BRepAlgoAPI_Fuse(BRepAlgoAPI_Fuse(bot, web).Shape(), top).Shape()
u = ShapeUpgrade_UnifySameDomain(s, True, True, True); u.Build(); s = u.Shape()
fl = BRepFilletAPI_MakeFillet(s)
ex = TopExp_Explorer(s, TopAbs_EDGE); seen = 0
while ex.More():
    e = TopoDS.Edge_s(ex.Current()); c = BRepAdaptor_Curve(e)
    p0, p1 = c.Value(c.FirstParameter()), c.Value(c.LastParameter())
    if abs(p0.X()-p1.X()) > L-1 and abs(abs(p0.Y())-tw/2) < 1e-6 and (abs(p0.Z()-tf) < 1e-6 or abs(p0.Z()-(d-tf)) < 1e-6):
        fl.Add(r, e); seen += 1
    ex.Next()
s = fl.Shape()
def cut_plane(shape, pnt, nrm, inside):
    f = BRepBuilderAPI_MakeFace(gp_Pln(pnt, nrm)).Face()
    hs = BRepPrimAPI_MakeHalfSpace(f, inside).Solid()
    return BRepAlgoAPI_Cut(shape, hs).Shape()
a = math.radians(30)
s = cut_plane(s, gp_Pnt(0, 0, 0), gp_Dir(-math.cos(a), 0, math.sin(a)), gp_Pnt(-100, 0, 300))
b = math.radians(45)
s = cut_plane(s, gp_Pnt(L, 0, d), gp_Dir(math.cos(b), 0, -math.sin(b)), gp_Pnt(L+300, 0, -100))
for x in (300.0, 380.0):
    h = BRepPrimAPI_MakeCylinder(gp_Ax2(gp_Pnt(x, -20, d/2), gp_Dir(0, 1, 0)), 11.0, 40).Shape()
    s = BRepAlgoAPI_Cut(s, h).Shape()
g = GProp_GProps(); BRepGProp.VolumeProperties_s(s, g)
w = STEPControl_Writer(); w.Transfer(s, STEPControl_AsIs); w.Write(sys.argv[1])
print('fillet edges', seen, 'volume', g.Mass())
