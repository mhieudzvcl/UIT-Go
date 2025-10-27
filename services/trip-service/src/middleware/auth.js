import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer '))
    return res.status(401).json({ message: 'Thiếu token' });

  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // chứa { sub, role }
    next();
  } catch (err) {
    res.status(403).json({ message: 'Token không hợp lệ' });
  }
}
