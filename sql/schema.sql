CREATE DATABASE skin_match_db;
USE skin_match_db;

CREATE TABLE Users (
User_id INT AUTO_INCREMENT NOT NULL,
User_name VARCHAR(255) UNIQUE NOT NULL,
Password VARCHAR(255) NOT NULL,
Skin_type VARCHAR(255) NOT NULL,
PRIMARY KEY (User_id));

CREATE TABLE Products (
Product_id VARCHAR(255) NOT NULL,
Product_name VARCHAR(255) NOT NULL,
Brand_name VARCHAR(255),
Price_usd DECIMAL(10,2),
PRIMARY KEY (Product_id));

CREATE TABLE Product_Reviews (
Review_id INT AUTO_INCREMENT NOT NULL,
User_id INT NOT NULL,
Rating INT,
Is_recommended VARCHAR(3),
Review_text VARCHAR(2000),
Review_title VARCHAR(255),
Skin_type VARCHAR(255),
Product_id VARCHAR(255) NOT NULL,
PRIMARY KEY (Review_id),
FOREIGN KEY (Product_id) REFERENCES Products(Product_id) ON DELETE CASCADE,
FOREIGN KEY (User_id) REFERENCES Users(User_id) ON DELETE CASCADE);

CREATE TABLE Goals (
Goal_name VARCHAR(255) NOT NULL,
 	PRIMARY KEY (Goal_name));

CREATE TABLE User_Products(
	User_id INT, 
	Product_id VARCHAR(255), 
	PRIMARY KEY(User_id, Product_id),
	FOREIGN KEY(User_id) REFERENCES Users(User_id) ON DELETE CASCADE, 
	FOREIGN KEY(Product_id) REFERENCES Products(Product_id) ON DELETE CASCADE);

CREATE TABLE User_Goals(
	User_id INT, 
	Goal_name VARCHAR(255), 
PRIMARY KEY(User_id, Goal_name),
	FOREIGN KEY(User_id) REFERENCES Users(User_id) ON DELETE CASCADE, 
	FOREIGN KEY(Goal_name) REFERENCES Goals(Goal_name) ON DELETE CASCADE);

CREATE TABLE Product_Goals(
	Product_id VARCHAR(255), 
	Goal_name VARCHAR(255), 
	PRIMARY KEY(Product_id, Goal_name),
	FOREIGN KEY(Product_id) REFERENCES Products(Product_id) ON DELETE CASCADE, 
	FOREIGN KEY(Goal_name) REFERENCES Goals(Goal_name) ON DELETE CASCADE);
