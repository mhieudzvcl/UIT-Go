const payments = []; // array tạm lưu payment

const processPayment = async (data) => {
  const newPayment = {
    id: (payments.length + 1).toString(),
    amount: data.amount,
    userId: data.userId,
    status: 'completed',
    createdAt: new Date().toISOString(),
  };
  payments.push(newPayment);
  return newPayment;
};

const getPayment = async (id) => {
  return payments.find(p => p.id === id);
};

module.exports = { processPayment, getPayment };
