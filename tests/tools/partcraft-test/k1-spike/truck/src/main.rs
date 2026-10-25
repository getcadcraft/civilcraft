// SPDX-License-Identifier: Apache-2.0
//! Native runner: one JSON line per case with its build time; STEP files into argv[1] (optional).
fn main() {
    let dir = std::env::args().nth(1);
    for name in k1_truck::CASES {
        let t0 = std::time::Instant::now();
        let r = std::panic::catch_unwind(|| k1_truck::run(name));
        let ms = t0.elapsed().as_secs_f64() * 1000.0;
        match r {
            Ok(r) => {
                if let (Some(d), false) = (&dir, r.step.is_empty()) {
                    std::fs::write(format!("{d}/truck-{name}.step"), &r.step).unwrap();
                }
                println!("{} ms={:.1}", k1_truck::json(&r), ms);
            }
            Err(_) => println!("{{\"name\":\"{name}\",\"ok\":false,\"message\":\"panic\"}} ms={ms:.1}"),
        }
    }
}
