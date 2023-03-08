const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const PORT = process.env.PORT || 4001;

const scrapperRouter = require('./src/routes/scrapper.routes');

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.all('/*', function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
  });

app.get('/', (req, res) => {
  res.json({'message': 'Welcome to Prop Server'});
})

app.use('', scrapperRouter);

app.listen(PORT, () => {
  console.log(`server is running on PORT:${PORT}`);
});
