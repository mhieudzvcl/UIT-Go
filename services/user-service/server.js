import express from 'express';
const app = express();
app.use(express.json());

app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  res.json({ id, name: `User ${id}` });
});

app.get('/healthz', (_, res) => res.json({ status: 'ok' }));
app.listen(3000, () => console.log('UserService running on port 3000'));
