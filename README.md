# SkinMatch – Skincare Recommendation Web App

SkinMatch is a full-stack web application that recommends skincare products based on a user’s skin type and skincare goals. The platform helps users discover products through personalized suggestions and real user reviews.

## Features

- Personalized product recommendations based on skin type and goals  
- User preference selection and profile flow  
- Product browsing with detailed reviews and ratings  
- Interactive product display with popup review interface  
- Backend-driven recommendation logic using SQL queries  

## Tech Stack

**Frontend**
- React (JavaScript)
- CSS (custom styling)

**Backend**
- Python (Flask)
- REST APIs

**Database**
- MySQL

## My Contributions

This was a team project for a database systems course. My contributions included:

- Built the frontend UI using React, including product display pages and user preference flow  
- Designed and implemented API calls to connect frontend with Flask backend  
- Developed SQL queries for product recommendations based on user skin type and goals  
- Worked on database schema design and integration with backend  
- Implemented interactive UI components such as product popups and review displays  

## How It Works

1. Users create an account and select their skin type and skincare goals  
2. The system stores user preferences in a MySQL database  
3. A recommendation query matches user goals with product attributes and filters by rating  
4. Recommended products are displayed with reviews and ratings for decision-making  

## Running the Project

### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
