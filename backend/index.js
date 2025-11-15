const express = require("express");
const session = require("express-session");
const cors = require("cors");
const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());

// routes
const restaurantsAPIRoute = require("./routes/restaurants.routes");
app.use("/api", restaurantsAPIRoute);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
