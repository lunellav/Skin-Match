from flask import Flask, request, jsonify, session
from flask_cors import CORS
import pymysql.cursors

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = "123456"

connection = pymysql.connect(host='localhost',
                             user='root',
                             password='password',
                             database='skin_match_db',
                             cursorclass=pymysql.cursors.DictCursor,
                             charset='utf8mb4')

@app.route("/login", methods=["POST"])
def login():
    username = request.form.get("username")
    password = request.form.get("password")
    
    with connection.cursor(pymysql.cursors.DictCursor) as cursor:
        query = "SELECT User_id, Password FROM Users WHERE User_name = %s"
        cursor.execute(query, (username,))
        user = cursor.fetchone()
        
        if user and user["Password"] == password:
            session["user_id"] = user["User_id"]
            return jsonify({"message": "Login successful!", "success": True})
        else:
            return jsonify({"message": "Invalid username or password", "success": False}), 401

@app.route("/logout", methods=["POST"])
def logout():
    session.pop("user_id", None)
    return jsonify({"message": "Logged out successfully"})

# @app.route("/login", methods=["POST"])
# def login():
@app.route("/register", methods=["POST"])
def register():
    #updated to use AUTO_INCREMENT lemme know if anything breaks
    username = request.form.get("username")
    password = request.form.get("password")
    confirm_password = request.form.get("confirm_password")
    skintype = request.form.get("skintype")
    skingoals = request.form.getlist("skingoals")

    if password != confirm_password:
        return jsonify({"message": "Passwords do not match!"}), 400
    if not skingoals:
        return jsonify({"message": "Please select at least 1 skincare goal!"}), 400
    if len(skingoals) > 3:
        return jsonify({"message": "You can select at most 3 skincare goals!"}), 400

    try:
        with connection.cursor() as cursor:
            query = """
                SELECT * FROM Users WHERE User_name = %s
            """
            cursor.execute(query, (username,))
            account = cursor.fetchone()

            if account != None:
                return jsonify({"message": "Username not available!"}), 400
            
            # insert new user
            query_user = """
                INSERT INTO Users (User_name, Password, Skin_type) 
                VALUES (%s, %s, %s)
            """
            cursor.execute(query_user, (username, password, skintype))

            cursor.execute("SELECT MAX(User_id) AS max_id FROM Users")
            user_id = cursor.fetchone()["max_id"]

            # user goals insert
            query_goal = """
                INSERT INTO User_Goals (User_id, Goal_name) 
                VALUES (%s, %s)
            """
            for goal in skingoals:
                cursor.execute(query_goal, (user_id, goal))

            connection.commit()
            
            # set session to logged in
            session["user_id"] = user_id

        return jsonify({"message": "Success!"}) #return render html in the future, currently return json for testing purpose
    except Exception as e:
        connection.rollback()
        print(f"Registration error: {e}")
        return jsonify({"message": "An error occurred during registration."}), 500

#update user information, including password, skin type and skin goals
@app.route("/profile", methods=["GET","POST","DELETE"])
def profile():
    msg = ""
    user_id = session.get("user_id")
    if user_id is None:
        return jsonify({"message": "User not logged in!"}), 401
    
    if (request.method == "GET"):
        with connection.cursor() as cursor:
            query = """
                    SELECT User_name, Password, Skin_type
                    FROM Users 
                    WHERE User_id = %s
            """
            cursor.execute(query, (user_id,))
            user_info = cursor.fetchone()
            
            query = """
                    SELECT Goal_name 
                    FROM User_Goals 
                    WHERE User_id = %s
            """
            cursor.execute(query, (user_id,))
            user_goals = [row["Goal_name"] for row in cursor.fetchall()]

            query = """ 
                    SELECT Product_id, Product_name, Brand_name
                    FROM User_Products NATURAL JOIN Products
                    WHERE User_id = %s
            """
            cursor.execute(query, (user_id,))
            user_products = cursor.fetchall()
            #render html
            return jsonify({"username": user_info["User_name"], "skin_type": user_info["Skin_type"], "skingoals": user_goals, "user_products": user_products})
    elif (request.method == "POST"
        and "username" in request.form 
        and "password" in request.form 
        and "confirm_password" in request.form
        and "skintype" in request.form
        and "skingoals" in request.form
        ):

        username = request.form.get("username")
        password = request.form.get("password")
        confirm_password = request.form.get("confirm_password") 
        skintype = request.form.get("skintype")
        skingoals = request.form.getlist("skingoals")

        if password and confirm_password and password != confirm_password:
            return jsonify({"message": "Passwords do not match!"}), 400
        if len(skingoals) == 0:
            return jsonify({"message": "Please select at least 1 skincare goal!"})
        if len(skingoals) > 3:
            return jsonify({"message": "You can select at most 3 skincare goals!"})

        try:
            with connection.cursor() as cursor:

                query = """
                SELECT * FROM Users WHERE User_id = %s
                """
                cursor.execute(query, (user_id,))
                current_username = cursor.fetchone()

                query = """
                SELECT * FROM Users WHERE User_name = %s
                """
                cursor.execute(query, (username,))
                account = cursor.fetchone()
                if account != None and account != current_username:
                    return jsonify({"message":"Account already exists!"})

                cursor.execute("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED")
                cursor.execute("START TRANSACTION")

                # update Users table
                query = """
                UPDATE Users 
                SET User_name = %s, Password = %s, Skin_type = %s 
                WHERE User_id = %s
                """
                cursor.execute(query, (username, password, skintype, user_id,))
                
                # update User_Goals table: delete old goals and insert new goals
                query = """
                DELETE FROM User_Goals WHERE User_id = %s
                """
                cursor.execute(query, (user_id,))
                
                for goal in skingoals:
                    query = """
                        INSERT INTO User_Goals (User_id, Goal_name) 
                        VALUES (%s, %s)
                    """
                    cursor.execute(query, (user_id, goal,))

                # Advanced Query1
                aq1 = """
                SELECT UG.Goal_name, COUNT(DISTINCT PG.Product_id) AS Matching_product_count
                FROM User_Goals UG
                LEFT JOIN Product_Goals PG ON UG.Goal_name = PG.Goal_name
                LEFT JOIN Products P ON PG.Product_id = P.Product_id
                WHERE UG.User_id = %s
                GROUP BY UG.Goal_name
                ORDER BY Matching_product_count DESC;
                """
                cursor.execute(aq1, (user_id,))
                goal_coverage = cursor.fetchall()

                # Advanced Query2
                aq2 = """
                SELECT Product_id, Product_name, Brand_name, Price_usd,
                ROUND(
                    (COUNT(DISTINCT Goal_name) / (SELECT COUNT(*) FROM User_Goals UG2 WHERE UG2.User_id = %s)) * 100, 2
                    ) AS Match_percentage
                FROM Products NATURAL JOIN Product_Goals NATURAL JOIN User_Goals UG
                WHERE UG.User_id = %s
                GROUP BY Product_id
                HAVING COUNT(DISTINCT Goal_name) > 0
                ORDER BY Match_percentage DESC
                LIMIT 3
                """
                cursor.execute(aq2, (user_id, user_id,))
                match_percentage_rec = cursor.fetchall()
                
                connection.commit()
                return jsonify({
                        "message": "You have successfully updated your profile!",
                        "username": username,
                        "skin_type": skintype,
                        "skingoals": skingoals,
                        "goal_coverage": goal_coverage,
                        "match_percentage_recommendations": match_percentage_rec})
        except Exception as e:
            connection.rollback()
            return jsonify({
                "message": "An error occurred while updating your profile. Please try again.",
                "error": str(e)
                }), 500
    elif (request.method == "DELETE"):
        with connection.cursor() as cursor:
            query = """
            DELETE FROM Users WHERE User_id = %s
            """
            cursor.execute(query, (user_id,))
            connection.commit()
            session.pop("user_id", None)
            return jsonify({"message": "Your account has been deleted!"})
        
    #return render html
    return jsonify({"message": "Please fill out the form!"}) 

@app.route("/profile/product/<product_id>", methods=["DELETE"])
def delete_user_product(product_id):
    user_id = session.get("user_id")
    if user_id is None:
        return jsonify({"message": "User not logged in!"}), 401
    with connection.cursor() as cursor:
        query = """
                DELETE FROM User_Products 
                WHERE User_id = %s AND Product_id = %s
        """
        cursor.execute(query, (user_id, product_id,))
        connection.commit()
        return jsonify({"message": "Product removed from your profile!"})

@app.route("/products", methods=["GET"])
def recommend_products():
    user_id = session.get("user_id")
    if user_id is None:
        return jsonify({"message": "User not logged in!"}), 401
    with connection.cursor() as cursor:
        query = """
        CALL RecommendProducts(%s);
        """
        cursor.execute(query, (user_id, ))
        results = cursor.fetchall()
        return jsonify(results)


@app.route("/products/<product_id>", methods=["GET"])
def product_details(product_id):
    user_id = session.get("user_id")
    if user_id is None:
        return jsonify({"message": "User not logged in!"}), 401

    with connection.cursor() as cursor:
        query = """
            SELECT User_name, Rating, Is_recommended, Review_text, Review_title, Product_Reviews.Skin_type
            FROM Products JOIN Product_Reviews ON Products.Product_id = Product_Reviews.Product_id JOIN Users ON Users.User_id = Product_Reviews.User_id
            WHERE Products.Product_id = %s
        """
        cursor.execute(query, (product_id,))
        results = cursor.fetchall()
        return jsonify(results)


@app.route("/review", methods=["GET","POST"])
def product_review():
    user_id = session.get("user_id")
    if user_id is None:
        return jsonify({"message": "User not logged in!"}), 401

    with connection.cursor() as cursor:
        if (request.method == "POST" 
            and "Rating" in request.form 
            and "Is_recommended" in request.form 
            and "Review_text" in request.form
            and "Review_title" in request.form
            ):
            product_id = request.form["Product_id"]
            rating = request.form["Rating"]
            is_recommended = request.form["Is_recommended"]
            review_text = request.form["Review_text"]
            review_title = request.form["Review_title"]

            query = """
            INSERT IGNORE INTO Product_Reviews (User_id, Product_id, Rating, Is_recommended, Review_text, Review_title, Skin_type)
            VALUES (%s, %s, %s, %s, %s, %s, (SELECT Skin_type FROM Users WHERE User_id = %s))
            """
            cursor.execute(query, (user_id, product_id, rating, is_recommended, review_text, review_title, user_id,))
            connection.commit()
            return jsonify({"message": "Your review has been submitted!"})

        elif (request.method == "POST"):
            return jsonify({"message": "Please fill out the form!"}), 400

        

@app.route("/products/<product_id>/add", methods=["GET","POST"])
def add_product(product_id):
    user_id = session.get("user_id")
    if user_id is None:
        return jsonify({"message": "User not logged in!"}), 401
    with connection.cursor() as cursor:
        if request.method == "POST":
            # add product     
            query = """
                INSERT IGNORE INTO User_Products (User_id, Product_id)
                VALUES (%s, %s)
            """
            cursor.execute(query, (user_id, product_id,))
            connection.commit()
            return jsonify({
                "message": "Product added successfully!",
                "product_id": product_id
            })
        
    return jsonify({"message": "Invalid request method!"})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
