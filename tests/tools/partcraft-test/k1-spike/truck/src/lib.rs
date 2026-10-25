// SPDX-License-Identifier: Apache-2.0
//! K.1 spike (0.4 part 2): truck as PartCraft's exact kernel. Builds the spike's test parts,
//! tessellates them, checks the mesh is closed and its volume against the closed form, and
//! writes STEP. Native (`cargo run --release --bin k1`) and wasm32 (`run_case` / `out_ptr`).
use std::f64::consts::PI;
use truck_meshalgo::prelude::*;
use truck_modeling::*;
use truck_stepio::out;

pub const CASES: [&str; 8] = ["plate", "bracket", "bracket-touch", "bracket-inset", "shaft", "shaft-bore", "tee", "plate-step"];

fn cuboid(x0: f64, y0: f64, z0: f64, dx: f64, dy: f64, dz: f64) -> Solid {
    let v = builder::vertex(Point3::new(x0, y0, z0));
    let e = builder::tsweep(&v, Vector3::new(dx, 0.0, 0.0));
    let f = builder::tsweep(&e, Vector3::new(0.0, dy, 0.0));
    builder::tsweep(&f, Vector3::new(0.0, 0.0, dz))
}

/// Cylinder of radius r along `axis` (unit) from `base`, length h.
fn cylinder(base: Point3, axis: Vector3, r: f64, h: f64) -> Solid {
    let u = if axis.x.abs() < 0.9 { Vector3::unit_x() } else { Vector3::unit_y() };
    let side = (u - axis * axis.dot(u)).normalize();
    let v = builder::vertex(base + side * r);
    let w = builder::rsweep(&v, base, axis, Rad(7.0));
    let f = builder::try_attach_plane(&[w]).unwrap();
    builder::tsweep(&f, axis * h)
}

fn cut(a: &Solid, b: &Solid, tol: f64) -> Option<Solid> {
    let mut b = b.clone();
    b.not();
    truck_shapeops::and(a, &b, tol)
}

/// Closed profile in the XZ plane (x = radius) revolved a full turn about Z.
fn revolve(pts: &[(f64, f64)]) -> Solid {
    let vs: Vec<Vertex> = pts.iter().map(|&(x, z)| builder::vertex(Point3::new(x, 0.0, z))).collect();
    let n = vs.len();
    let wire: Wire = (0..n).map(|i| builder::line(&vs[i], &vs[(i + 1) % n])).collect();
    let face = builder::try_attach_plane(&[wire]).unwrap();
    builder::rsweep(&face, Point3::origin(), Vector3::unit_z(), Rad(7.0))
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

/// Signed volume of a triangle soup + count of edges not shared by exactly two triangles.
fn mesh_stats(mesh: &PolygonMesh) -> (f64, usize, usize) {
    let pos = mesh.positions();
    // Faces are triangulated one by one, so shared boundary points repeat: weld them at 1e-5 mm.
    let mut weld: std::collections::HashMap<(i64, i64, i64), usize> = Default::default();
    let id: Vec<usize> = pos.iter().map(|p| {
        let k = ((p.x * 1e5).round() as i64, (p.y * 1e5).round() as i64, (p.z * 1e5).round() as i64);
        let n = weld.len();
        *weld.entry(k).or_insert(n)
    }).collect();
    let mut vol = 0.0;
    let mut tris = 0;
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
    let open = edges.values().filter(|&&k| k != 2).count();
    (vol, tris, open)
}

fn step_of(solid: &Solid) -> String {
    let compressed = solid.compress();
    out::CompleteStepDisplay::new(out::StepModel::from(&compressed), Default::default()).to_string()
}

pub fn run(name: &str) -> Report {
    let tol: f64 = std::env::var("K1_TOL").ok().and_then(|v| v.parse().ok()).unwrap_or(0.01);
    let mut rep = Report { name: "", ok: false, message: String::new(), expected: 0.0, volume: 0.0, triangles: 0, open_edges: 0, faces: 0, step_bytes: 0, step: String::new() };
    let built: Option<Solid> = match name {
        "plate" | "plate-step" => {
            rep.expected = 100.0 * 60.0 * 10.0 - 4.0 * PI * 16.0 * 10.0;
            let mut s = Some(cuboid(0.0, 0.0, 0.0, 100.0, 60.0, 10.0));
            for (x, y) in [(15.0, 15.0), (85.0, 15.0), (15.0, 45.0), (85.0, 45.0)] {
                let c = cylinder(Point3::new(x, y, -1.0), Vector3::unit_z(), 4.0, 12.0);
                s = s.and_then(|s| cut(&s, &c, tol));
            }
            s
        }
        "bracket" => {
            rep.expected = 80.0 * 40.0 * 8.0 + 8.0 * 40.0 * 52.0 - PI * 25.0 * 8.0;
            let base = cuboid(0.0, 0.0, 0.0, 80.0, 40.0, 8.0);
            let up = cuboid(0.0, 0.0, 0.0, 8.0, 40.0, 60.0);
            truck_shapeops::or(&base, &up, tol).and_then(|s| {
                let c = cylinder(Point3::new(-1.0, 20.0, 40.0), Vector3::unit_x(), 5.0, 10.0);
                cut(&s, &c, tol)
            })
        }
        "bracket-touch" => {
            // the usual CAD case: a second extrude standing on the first one's top face
            rep.expected = 80.0 * 40.0 * 8.0 + 8.0 * 40.0 * 52.0;
            let base = cuboid(0.0, 0.0, 0.0, 80.0, 40.0, 8.0);
            let up = cuboid(0.0, 0.0, 8.0, 8.0, 40.0, 52.0);
            truck_shapeops::or(&base, &up, tol)
        }
        "bracket-inset" => {
            // no coplanar faces at all: the upright sits inside the base's outline and dips into it
            rep.expected = 80.0 * 40.0 * 8.0 + 8.0 * 30.0 * 52.0;
            let base = cuboid(0.0, 0.0, 0.0, 80.0, 40.0, 8.0);
            let up = cuboid(5.0, 5.0, 4.0, 8.0, 30.0, 56.0);
            truck_shapeops::or(&base, &up, tol)
        }
        "shaft" => {
            rep.expected = PI * 100.0 * 50.0 + PI * (625.0 - 100.0) * 8.0;
            Some(revolve(&[(0.0, 0.0), (25.0, 0.0), (25.0, 8.0), (10.0, 8.0), (10.0, 50.0), (0.0, 50.0)]))
        }
        "shaft-bore" => {
            rep.expected = PI * (100.0 - 9.0) * 50.0 + PI * (625.0 - 100.0) * 8.0;
            Some(revolve(&[(3.0, 0.0), (25.0, 0.0), (25.0, 8.0), (10.0, 8.0), (10.0, 50.0), (3.0, 50.0)]))
        }
        "tee" => {
            rep.expected = 2.0 * PI * 100.0 * 60.0 - 16.0 / 3.0 * 1000.0;
            let a = cylinder(Point3::new(-30.0, 0.0, 0.0), Vector3::unit_x(), 10.0, 60.0);
            let b = cylinder(Point3::new(0.0, -30.0, 0.0), Vector3::unit_y(), 10.0, 60.0);
            truck_shapeops::or(&a, &b, tol)
        }
        _ => None,
    };
    rep.name = CASES.iter().find(|c| **c == name).copied().unwrap_or("?");
    let Some(solid) = built else { rep.message = "boolean or build returned None".into(); return rep; };
    rep.faces = solid.face_iter().count();
    let mesh = solid.triangulation(tol).to_polygon();
    let (v, t, o) = mesh_stats(&mesh);
    rep.volume = v.abs();
    rep.triangles = t;
    rep.open_edges = o;
    if name == "plate-step" || name == "bracket" || name == "tee" || name == "shaft" {
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

// ---- wasm32 entry points (no wasm-bindgen: plain exports, JSON in linear memory) ----
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
