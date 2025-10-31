import express from 'express';
const app = express();
app.use(express.json());

app.get('/drivers/search', (req, res) => {
  const { lat, lng } = req.query;
  res.json({ id: 1, name: 'Driver A', distance: 1.2, lat, lng });
});

app.get('/healthz', (_, res) => res.json({ status: 'ok' }));
app.listen(3002, () => console.log('DriverService running on port 3002'));
