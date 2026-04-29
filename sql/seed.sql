USE skin_match_db;

LOAD DATA LOCAL INFILE './data/Users.csv'
INTO TABLE Users
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 ROWS;

LOAD DATA LOCAL INFILE './data/Products.csv'
INTO TABLE Products
FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 ROWS
(Product_id, Product_name, Brand_name, @dummy, @dummy, Price_usd);

LOAD DATA LOCAL INFILE './data/Product_Reviews.csv'
INTO TABLE Product_Reviews
FIELDS TERMINATED BY ',' ENCLOSED BY '"' ESCAPED BY '' LINES TERMINATED BY '\n' IGNORE 1 ROWS
(@dummy, Rating, Is_recommended, @dummy, Review_text, Review_title, Skin_type, Product_id)
SET Review_id = NULL, User_id = -1;

UPDATE Product_Reviews
SET Is_recommended = CASE
WHEN Is_recommended = '1.0' THEN 'Yes'
ELSE 'No'
END;

LOAD DATA LOCAL INFILE './data/Goals.csv'
INTO TABLE Goals
FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 ROWS;

LOAD DATA LOCAL INFILE './data/User_Products.csv'
INTO TABLE User_Products
FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 ROWS;

LOAD DATA LOCAL INFILE './data/User_Goals.csv'
INTO TABLE User_Goals
FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 ROWS;

LOAD DATA LOCAL INFILE './data/Product_Goals.csv'
INTO TABLE Product_Goals
FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 ROWS;