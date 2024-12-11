# Recipe Meal Planner

A web application that helps you find recipes, plan meals, and manage your pantry.
Built with HTML, CSS, JavaScript, Node.js, and PostgreSQL using the Spoonacular API.

## Features

- User authentication with signup/login functionality
- Search recipes by ingredients or recipe name
- Plan meals using a calendar interface
- Manage pantry inventory
- Generate shopping lists based on meal plans and pantry
- Deployed on fly.io with PostgreSQL database

## Setup

1. Clone the repository
`git clone [your-repository-url]
cd [repository-name]`

2. Install dependencies
`npm install`

3. Set up Spoonacular API
- Get your API key from [Spoonacular API](https://spoonacular.com/food-api)
- Copy env_sample.json to env.json and update with your credentials.

4. Set up database and start server
`npm run start:local`

5. Open in browser
- Go to `http://localhost:3000`
- Create an account or login to access features

## Usage

- **Search Recipes**: Enter ingredients or recipe names in the search bar
- **View Recipe Details**: Click on any recipe card to see detailed information
- **Plan Meals**: Use the calendar page to schedule meals for up to two weeks
- **Manage Pantry**: Track your ingredients in the pantry page with categories
- **Shopping Lists**: Generate lists based on meal plans on calendar

## Files

- index.html: Main recipe search page
- calendar.html: Meal planning calendar
- pantry.html: Pantry management
- login.html: User authentication
- server.js: Node.js server
- public/: Frontend files
- setup.sql: Database schema

## Contributors

- Pujan Pokharel
- Aiden Mastronardo

## Course Information

Created for CS375 Web Development at Drexel University