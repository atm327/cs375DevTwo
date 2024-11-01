let axios = require("axios");
let express = require("express");
let app = express();
let apiFile = require("../env.json");
let apiKey = apiFile["api_key"]; // use this to make requests
let baseUrl = apiFile["api_url"]; // use this to make requests
let port = 3000;
let hostname = "localhost";
app.use(express.static("public"));

app.get('/findByIngredients', (req, res) => {
  const ingredients = req.query.ingredients;
  const number = req.query.number || 5;
  const url = `${baseUrl}?ingredients=${ingredients}&number=${number}&apiKey=${apiKey}`;
  console.log(url);
  axios.get(url)
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(error => {
      res.status(error.response.status).json({ error: error.response.data.message });
    });
});
app.listen(port, hostname, () => {
  console.log(`http://${hostname}:${port}`);
});
