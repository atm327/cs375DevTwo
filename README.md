# Recipe Meal Planner

A web application that helps you find recipes, plan meals, and manage your pantry. 
Built with HTML, CSS, JavaScript, and Node.js using the Spoonacular API.

## Features

- Search recipes by ingredients or recipe name
- View detailed recipe information
- Plan meals using a calendar interface
- Manage pantry inventory
- Generate shopping lists

## Setup

1. Clone the repository
```bash
git clone [your-repository-url]
cd [repository-name]
```

2. Install dependencies
```bash
npm install
```

3. Set up Spoonacular API
- Get your API key from [Spoonacular API](https://spoonacular.com/food-api)
- Add your API key to `env.json`
```json
{
    "api_key": "your-api-key-here",
    "api_url": "https://api.spoonacular.com/recipes"
}
```

4. Start the server
```bash
node server.js
```

5. Open in browser
- Go to `http://localhost:3000`
- You should see the recipe search page

## Usage

- **Search Recipes**: Enter ingredients or recipe names in the search bar
- **View Recipe Details**: Click on any recipe card to see detailed information
- **Plan Meals**: Use the calendar page to schedule meals
- **Manage Pantry**: Track your ingredients in the pantry page

## Files

- `index.html`: Main recipe search page
- `calendar.html`: Meal planning calendar
- `pantry.html`: Pantry management
- `server.js`: Node.js server
- `public/`: Frontend files

## Contributors

- Pujan Pokharel
- Aiden Mastronardo

## Course Information

Created for CS375 Web Development