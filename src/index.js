const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.get('/', (req, res) => res.send('Our server'));

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
