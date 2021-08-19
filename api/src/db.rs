use dotenv::dotenv;
use mongodb::{error::Error, options::ClientOptions, Client};
use std::env;

pub struct User {
	pub name: String,
	pub id: String,
	pub secret: String,
	pub pass_salt: String,
	pub pass_hash: String,
}

pub async fn init() -> Result<Client, Error> {
	dotenv().ok();
	let host = env::var("MONGO_HOST").expect("MONGO_HOST is not set");
	let port = env::var("MONGO_PORT").expect("MONGO_PORT is not set");

	let mut client_options = ClientOptions::parse(format!("mongodb://{}:{}", host, port)).await?;

	client_options.app_name = Some("pressure-api".to_string());

	return Client::with_options(client_options);
}
