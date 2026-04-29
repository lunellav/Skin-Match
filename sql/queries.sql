USE skin_match_db;

DELIMITER //
CREATE PROCEDURE RecommendProducts(IN current_user_id INT)
BEGIN 
    CREATE TEMPORARY TABLE Review_stats AS
    SELECT Product_id, COUNT(*) AS Num_reviews, ROUND(AVG(Rating), 2) AS Avg_rating,
    CASE 
        WHEN Product_id IN (SELECT Product_id
                        FROM Product_Reviews pr NATURAL JOIN Products JOIN Users ON (pr.Skin_type = Users.Skin_type)
                        WHERE Users.User_id = current_user_id
                        GROUP BY Product_id
                        HAVING AVG(Rating) > 4)
                        THEN "Recommended by users with your skin type!"
        ELSE ''
        END Skintype_reviews
    FROM Product_Reviews
    GROUP BY Product_id;

    CREATE TEMPORARY TABLE Recommended_products AS
    SELECT Product_id, Product_name, Brand_name, Price_usd
                FROM Products NATURAL JOIN Product_Goals NATURAL JOIN User_Goals UG
                WHERE UG.User_id = current_user_id
                GROUP BY Product_id
                HAVING COUNT(*) = (SELECT COUNT(*) FROM User_Goals UG2 WHERE UG2.User_id = current_user_id)
    EXCEPT
    SELECT Product_id, Product_name, Brand_name, Price_usd 
    FROM Users NATURAL JOIN User_Products NATURAL JOIN Products 
    WHERE User_id = current_user_id;

    SELECT Product_id, Product_name, Brand_name, Price_usd, Num_reviews, Avg_rating, Skintype_reviews
    FROM Review_stats NATURAL JOIN Recommended_products;

    DROP TEMPORARY TABLE IF EXISTS Review_stats;
    DROP TEMPORARY TABLE IF EXISTS Recommended_products;
END //

CREATE TRIGGER AddReviewedProduct
AFTER INSERT ON Product_Reviews
FOR EACH ROW
BEGIN
    INSERT IGNORE INTO User_Products (User_id, Product_id)
    VALUES (NEW.User_id, NEW.Product_id);
END//

DELIMITER ;
    


