extern crate log;
extern crate mongodb;
extern crate simple_logger;
extern crate tokio;

use mongodb::{bson::doc, options::ClientOptions, Client};
use simple_logger::SimpleLogger;

#[tokio::main]
async fn main() -> mongodb::error::Result<()> {
	SimpleLogger::new().init().unwrap();
	log::set_max_level(log::LevelFilter::Info);

	let mut client_options = ClientOptions::parse("mongodb://localhost:27017").await?;

	client_options.app_name = Some("pressure-api".to_string());

	let client = Client::with_options(client_options)?;

	client
		.database("admin")
		.run_command(doc! {"ping": 1}, None)
		.await?;
	log::info!("connected to mongodb");

	for db_name in client.list_database_names(None, None).await? {
		log::info!("{}", db_name);
	}

	Ok(())
}
