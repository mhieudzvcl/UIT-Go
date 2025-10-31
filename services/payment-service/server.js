import express from 'express';
const app = express();
app.use(express.json());

app.post('/payments/estimate', (req, res) => {
  const { distance_km } = req.body;
  res.json({ amount: distance_km * 10000 });
});

app.post('/payments/charge', (req, res) => {
  const { trip_id, amount } = req.body;
  res.json({ trip_id, amount, status: 'charged' });
});

app.get('/healthz', (_, res) => res.json({ status: 'ok' }));
app.listen(3003, () => console.log('PaymentService running on port 3003'));
