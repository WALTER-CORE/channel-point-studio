const express = require("express"); 
const cors = require("cors"); 
// rest of the code remains same
const app = express();
app.use(cors()); 
const PORT = process.env.PORT || 8000;
app.get('/', (req, res) => res.send('Our server'));
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});