// SPDX-License-Identifier: Apache-2.0
//! K.1 spike (0.4 part 2): monstertruck (the truck fork with fillets) on the same test parts as
//! ../truck, plus fillets. Native (`cargo run --release --bin k1m`) and wasm32 (`run_case` / `out_ptr`).
use monstertruck_meshing::prelude::*;
use monstertruck_modeling::builder::SweepAngle;
use monstertruck_modeling::*;
use std::f64::consts::PI;

pub const CASES: [&str; 13] = [
    "plate-1hole",
    "plate", "bracket", "bracket-touch", "bracket-inset", "shaft", "shaft-bore", "tee", "plate-step",
    "fillet-1", "fillet-top4", "fillet-plate-hole", "chamfer-1",
];

fn cuboid(x0: f64, y0: f64, z0: f64, dx: f64, dy: f64, dz: f64) -> Solid {
    let v = builder::vertex(Point3::new(x0, y0, z0));
    let e: Edge = builder::extrude(&v, Vector3::new(dx, 0.0, 0.0));
    let f: Face = builder::extrude(&e, Vector3::new(0.0, dy, 0.0));
    builder::extrude(&f, Vector3::new(0.0, 0.0, dz))
}

fn cylinder(base: Point3, axis: Vector3, r: f64, h: f64) -> Solid {
    let u = if axis.x.abs() < 0.9 { Vector3::unit_x() } else { Vector3::unit_y() };
    let side = (u - axis * axis.dot(u)).normalize();
    let v = builder::vertex(base + side * r);
    let w: Wire = builder::revolve(&v, base, axis, SweepAngle::Closed, 4);
    let f: Face = builder::try_attach_plane(vec![w]).unwrap();
    builder::extrude(&f, axis * h)
}

fn revolve(pts: &[(f64, f64)]) -> Solid {
    let vs: Vec<Vertex> = pts.iter().map(|&(x, z)| builder::vertex(Point3::new(x, 0.0, z))).collect();
    let n = vs.len();
    let wire: Wire = (0..n).map(|i| builder::line(&vs[i], &vs[(i + 1) % n])).collect();
    let face: Face = builder::try_attach_plane(vec![wire]).unwrap();
    builder::revolve(&face, Point3::origin(), Vector3::unit_z(), SweepAngle::Closed, 4)
}

pub struct Report {
    pub name: &'static str,
    pub ok: bool,
    pub message: String,
    pub expected: f64,
    pub volume: f64,
    pub triangles: usize,
    pub open_edges: usize,
    pub faces: usize,
    pub step_bytes: usize,
    pub step: String,
}

fn mesh_stats(mesh: &PolygonMesh) -> (f64, usize, usize) {
    let pos = mesh.positions();
    let mut weld: std::collections::HashMap<(i64, i64, i64), usize> = Default::default();
    let id: Vec<usize> = pos.iter().map(|p| {
        let k = ((p.x * 1e5).round() as i64, (p.y * 1e5).round() as i64, (p.z * 1e5).round() as i64);
        let n = weld.len();
        *weld.entry(k).or_insert(n)
    }).collect();
    let (mut vol, mut tris) = (0.0, 0);
    let mut edges: std::collections::HashMap<(usize, usize), i32> = Default::default();
    for tri in mesh.tri_faces() {
        let (a, b, c) = (pos[tri[0].pos], pos[tri[1].pos], pos[tri[2].pos]);
        vol += a.to_vec().dot(b.to_vec().cross(c.to_vec())) / 6.0;
        tris += 1;
        let (i, j, k) = (id[tri[0].pos], id[tri[1].pos], id[tri[2].pos]);
        if i == j || j == k || k == i { continue; }
        for (p, q) in [(i, j), (j, k), (k, i)] {
            *edges.entry((p.min(q), p.max(q))).or_default() += 1;
        }
    }
    (vol, tris, edges.values().filter(|&&k| k != 2).count())
}

fn step_of(solid: &Solid) -> String {
    use monstertruck_io::step::save;
    save::CompleteStepDisplay::new(save::StepModel::from(&solid.compress()), Default::default()).to_string()
}

/// Edges of `s` whose both ends satisfy `pick` (straight edges chosen by position).
fn edges_where(s: &Solid, pick: impl Fn(Point3) -> bool) -> Vec<Edge> {
    let mut out: Vec<Edge> = vec![];
    for e in s.boundaries()[0].edge_iter() {
        if pick(e.front().point()) && pick(e.back().point()) && !out.iter().any(|o| o.is_same(&e)) {
            out.push(e);
        }
    }
    out
}

fn fillet_solid(s: Solid, pick: impl Fn(Point3) -> bool, r: f64, chamfer: bool) -> std::result::Result<Solid, String> {
    let edges = edges_where(&s, pick);
    if edges.is_empty() { return Err("no edge picked".into()); }
    let mut shell = s.into_boundaries().pop().unwrap();
    let mut opt = FilletOptions::default();
    opt.radius = RadiusSpec::Constant(r);
    if chamfer { opt.profile = FilletProfile::Chamfer; }
    fillet_edges(&mut shell, &edges, Some(&opt)).map_err(|e| format!("fillet: {e:?}"))?;
    Solid::try_new(vec![shell]).map_err(|e| format!("solid: {e:?}"))
}

pub fn run(name: &str) -> Report {
    let tol: f64 = std::env::var("K1_TOL").ok().and_then(|v| v.parse().ok()).unwrap_or(0.01);
    let mut rep = Report { name: "", ok: false, message: String::new(), expected: 0.0, volume: 0.0, triangles: 0, open_edges: 0, faces: 0, step_bytes: 0, step: String::new() };
    let cut = |a: &Solid, b: &Solid| monstertruck_solid::difference(a, b, tol).map_err(|e| format!("difference: {e:?}"));
    let or = |a: &Solid, b: &Solid| monstertruck_solid::or(a, b, tol).map_err(|e| format!("or: {e:?}"));
    let quarter = |r: f64| r * r - PI * r * r / 4.0;
    let built: std::result::Result<Solid, String> = match name {
        "plate" | "plate-step" => {
            rep.expected = 100.0 * 60.0 * 10.0 - 4.0 * PI * 16.0 * 10.0;
            let mut s = Ok(cuboid(0.0, 0.0, 0.0, 100.0, 60.0, 10.0));
            for (x, y) in [(15.0, 15.0), (85.0, 15.0), (15.0, 45.0), (85.0, 45.0)] {
                let c = cylinder(Point3::new(x, y, -1.0), Vector3::unit_z(), 4.0, 12.0);
                s = s.and_then(|s| cut(&s, &c));
            }
            s
        }
        "plate-1hole" => {
            rep.expected = 100.0 * 60.0 * 10.0 - PI * 16.0 * 10.0;
            cut(&cuboid(0.0, 0.0, 0.0, 100.0, 60.0, 10.0), &cylinder(Point3::new(50.0, 30.0, -1.0), Vector3::unit_z(), 4.0, 12.0))
        }
        "bracket" => {
            rep.expected = 80.0 * 40.0 * 8.0 + 8.0 * 40.0 * 52.0 - PI * 25.0 * 8.0;
            or(&cuboid(0.0, 0.0, 0.0, 80.0, 40.0, 8.0), &cuboid(0.0, 0.0, 0.0, 8.0, 40.0, 60.0))
                .and_then(|s| cut(&s, &cylinder(Point3::new(-1.0, 20.0, 40.0), Vector3::unit_x(), 5.0, 10.0)))
        }
        "bracket-touch" => {
            rep.expected = 80.0 * 40.0 * 8.0 + 8.0 * 40.0 * 52.0;
            or(&cuboid(0.0, 0.0, 0.0, 80.0, 40.0, 8.0), &cuboid(0.0, 0.0, 8.0, 8.0, 40.0, 52.0))
        }
        "bracket-inset" => {
            rep.expected = 80.0 * 40.0 * 8.0 + 8.0 * 30.0 * 52.0;
            or(&cuboid(0.0, 0.0, 0.0, 80.0, 40.0, 8.0), &cuboid(5.0, 5.0, 4.0, 8.0, 30.0, 56.0))
        }
        "shaft" => {
            rep.expected = PI * 100.0 * 50.0 + PI * (625.0 - 100.0) * 8.0;
            Ok(revolve(&[(0.0, 0.0), (25.0, 0.0), (25.0, 8.0), (10.0, 8.0), (10.0, 50.0), (0.0, 50.0)]))
        }
        "shaft-bore" => {
            rep.expected = PI * (100.0 - 9.0) * 50.0 + PI * (625.0 - 100.0) * 8.0;
            Ok(revolve(&[(3.0, 0.0), (25.0, 0.0), (25.0, 8.0), (10.0, 8.0), (10.0, 50.0), (3.0, 50.0)]))
        }
        "tee" => {
            rep.expected = 2.0 * PI * 100.0 * 60.0 - 16.0 / 3.0 * 1000.0;
            or(&cylinder(Point3::new(-30.0, 0.0, 0.0), Vector3::unit_x(), 10.0, 60.0),
               &cylinder(Point3::new(0.0, -30.0, 0.0), Vector3::unit_y(), 10.0, 60.0))
        }
        "fillet-1" => {
            // one top edge of a 50 mm cube, r 5
            rep.expected = 125000.0 - quarter(5.0) * 50.0;
            fillet_solid(cuboid(0.0, 0.0, 0.0, 50.0, 50.0, 50.0), |p| p.z > 49.9 && p.y < 0.1, 5.0, false)
        }
        "chamfer-1" => {
            rep.expected = 125000.0 - 12.5 * 50.0;
            fillet_solid(cuboid(0.0, 0.0, 0.0, 50.0, 50.0, 50.0), |p| p.z > 49.9 && p.y < 0.1, 5.0, true)
        }
        "fillet-top4" => {
            // the four top edges, vertical edges sharp: the fillets mitre at the corners, so the removed
            // volume = each full-length fillet − the overlap ∫0..r (r − √(r² − s²))² ds = r³(5/3 − π/2) per corner
            let r: f64 = 5.0;
            rep.expected = 125000.0 - 4.0 * quarter(r) * 50.0 + 4.0 * r.powi(3) * (5.0 / 3.0 - PI / 2.0);
            fillet_solid(cuboid(0.0, 0.0, 0.0, 50.0, 50.0, 50.0), |p| p.z > 49.9, r, false)
        }
        "fillet-plate-hole" => {
            // fillet after a boolean: the plate with holes, its four top outer edges r 2
            let r: f64 = 2.0;
            let runs = quarter(r) * (2.0 * 100.0 + 2.0 * 60.0);
            let corner = -4.0 * r.powi(3) * (5.0 / 3.0 - PI / 2.0);
            rep.expected = 100.0 * 60.0 * 10.0 - 4.0 * PI * 16.0 * 10.0 - runs - corner;
            let mut s = Ok(cuboid(0.0, 0.0, 0.0, 100.0, 60.0, 10.0));
            for (x, y) in [(15.0, 15.0), (85.0, 15.0), (15.0, 45.0), (85.0, 45.0)] {
                let c = cylinder(Point3::new(x, y, -1.0), Vector3::unit_z(), 4.0, 12.0);
                s = s.and_then(|s| cut(&s, &c));
            }
            s.and_then(|s| fillet_solid(s, |p| p.z > 9.9 && (p.x < 0.1 || p.x > 99.9 || p.y < 0.1 || p.y > 59.9), r, false))
        }
        _ => Err("unknown case".into()),
    };
    rep.name = CASES.iter().find(|c| **c == name).copied().unwrap_or("?");
    let solid = match built { Ok(s) => s, Err(e) => { rep.message = e.replace('"', "'"); return rep; } };
    rep.faces = solid.face_iter().count();
    let mesh = solid.triangulation(tol).to_polygon();
    let (v, t, o) = mesh_stats(&mesh);
    rep.volume = v.abs();
    rep.triangles = t;
    rep.open_edges = o;
    if matches!(name, "plate-step" | "bracket" | "tee" | "shaft" | "fillet-1" | "fillet-top4") {
        let s = step_of(&solid);
        rep.step_bytes = s.len();
        rep.step = s;
    }
    let err = (rep.volume - rep.expected).abs() / rep.expected;
    rep.ok = err < 0.005 && o == 0;
    rep.message = format!("volume error {:.4} %", err * 100.0);
    rep
}

pub fn json(r: &Report) -> String {
    format!(
        "{{\"name\":\"{}\",\"ok\":{},\"message\":\"{}\",\"expected\":{},\"volume\":{},\"triangles\":{},\"open_edges\":{},\"faces\":{},\"step_bytes\":{}}}",
        r.name, r.ok, r.message, r.expected, r.volume, r.triangles, r.open_edges, r.faces, r.step_bytes
    )
}

static mut OUT: Vec<u8> = Vec::new();

#[no_mangle]
pub extern "C" fn run_case(i: u32) -> u32 {
    let name = CASES.get(i as usize).copied().unwrap_or("?");
    let r = std::panic::catch_unwind(|| run(name));
    let s = match r { Ok(r) => json(&r), Err(_) => format!("{{\"name\":\"{name}\",\"ok\":false,\"message\":\"panic\"}}") };
    unsafe { OUT = s.into_bytes(); (*std::ptr::addr_of!(OUT)).len() as u32 }
}

#[no_mangle]
pub extern "C" fn out_ptr() -> *const u8 { unsafe { (*std::ptr::addr_of!(OUT)).as_ptr() } }
