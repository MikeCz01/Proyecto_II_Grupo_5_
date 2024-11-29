const express = require('express'),
      fs = require('fs').promises,
      app = express(),
      path = require('path'),
      directory = 'files',
      port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('trust proxy', true);

app.use((req, res, next) => {
  console.table([{ Timestamp: new Date().toLocaleString(), Method: req.method, Request: req.originalUrl  }]);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

app.get('/', (req, res) => {
  return res.send('<h1>File manager working</h1>');
});

app.post('/create', async(req, res) => {
  const filename = req.body['filename'] || 'process.json';
  console.log(req.body);
  const content = JSON.stringify([]);
  await fs.writeFile(`${directory}/${filename}`, content, 'utf-8');

  return res.json({ok: true});
});

app.post('/append', async(req, res) => {
  const filename = req.body['filename'] || 'process.json';
  const process = req.body['process'] || {};

  const readText = await fs.readFile(`${directory}/${filename}`);
  const savedProcess = JSON.parse(readText);

  if(!savedProcess || !Array.isArray(savedProcess)){
    savedProcess = [];
  }

  savedProcess.push(process);
  const newContent = JSON.stringify(savedProcess, null, '\t');

  await fs.writeFile(`${directory}/${filename}`, newContent, 'utf-8');
  return res.json({ok: true});
});

app.put('/get-first', async(req, res) => {
  const filename = req.body['filename'] || 'process.json';
  const readText = await fs.readFile(`${directory}/${filename}`);
  const content = JSON.parse(readText);

  if(!Array.isArray(content) || content.length == 0){
    return res.json({ ok: false });
  }

  const process = content.shift();
  const newContent = JSON.stringify(content, null, '\t');

  await fs.writeFile(`${directory}/${filename}`, newContent, 'utf-8');

  return res.json({
    ok: true,
    process
  });
});

app.listen(port, async() => {
  console.clear();
  console.log(`File manager app running on port ${port}`);
  for (const file of await fs.readdir(directory)) {
    if(!file.includes('.gitignore')){
      await fs.unlink(path.join(directory, file));
    }
  }
});