use actix_web::{web, Responder};
use mongodb::{Client, Collection};
use std::sync::Mutex;

#[path = "./db.rs"]
mod db;

pub fn export_routes(cfg: &mut web::ServiceConfig) {
	cfg.service(web::resource("/hello").route(web::get().to(hello)));
}

pub async fn hello(data: web::Data<Mutex<Client>>) -> impl Responder {
	let test_db: Collection<db::User> =
		data.lock().unwrap().database("pressure").collection("gert");

	return format!("Hello world!");
}
