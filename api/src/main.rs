extern crate log;
extern crate simple_logger;
extern crate tokio;

use actix_web::{web, App, HttpServer};
use simple_logger::SimpleLogger;
use std::io::Result;
use std::sync::*;

mod db;
mod routes;

fn init_log() {
	SimpleLogger::new().init().unwrap();
	log::set_max_level(log::LevelFilter::Info);
}

#[actix_rt::main]
async fn main() -> Result<()> {
	init_log();
	let client = web::Data::new(Mutex::new(db::init().await.unwrap()));
	HttpServer::new(move || {
		App::new()
			.app_data(client.clone())
			.service(web::scope("/").configure(routes::export_routes))
	})
	.bind("127.0.0.1:8080")?
	.run()
	.await
}
