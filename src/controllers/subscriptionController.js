const Subscription = require('../models/Subscription');
const Transaction = require('../models/Transaction');
const Magazine = require('../models/Magazine');

exports.createSubscription = (req, res) => {
    const userId = req.user.id; // Из authenticateToken
    const { magazineId } = req.body;

    if (!magazineId) {
        return res.status(400).json({ message: 'Magazine ID is required' });
    }

    Magazine.findById(magazineId, (err, magazine) => {
        if (err) return res.status(500).json({ message: 'Error fetching magazine', error: err.message });
        if (!magazine) return res.status(404).json({ message: 'Magazine not found' });

        // Проверка, нет ли уже активной подписки
        Subscription.findActiveByUserAndMagazine(userId, magazineId, (err, existingSubscription) => {
            if (err) return res.status(500).json({ message: 'Database error checking existing subscription', error: err.message });
            if (existingSubscription) {
                return res.status(400).json({ message: 'You already have an active subscription for this magazine.' });
            }

            // Для простоты, подписка на 1 месяц
            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(startDate.getMonth() + 1);

            const subscriptionData = {
                userId,
                magazineId,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                status: 'pending' // Статус 'pending' до оплаты
            };

            Subscription.create(subscriptionData, (err, subResult) => {
                if (err) return res.status(500).json({ message: 'Error creating subscription', error: err.message });

                // Создаем транзакцию в статусе 'pending'
                const transactionData = {
                    subscriptionId: subResult.id,
                    userId,
                    amount: magazine.price,
                    status: 'pending',
                    paymentMethod: 'simulated_card' // или другое
                };
                Transaction.create(transactionData, (err, transResult) => {
                    if (err) {
                        // По-хорошему, тут надо бы откатить создание подписки, но для простоты оставим
                        console.error("Error creating pending transaction:", err.message);
                        return res.status(500).json({ message: 'Subscription created, but failed to create pending transaction', error: err.message });
                    }
                    res.status(201).json({
                        message: 'Subscription initiated. Please proceed to payment.',
                        subscriptionId: subResult.id,
                        transactionId: transResult.id,
                        amount: magazine.price
                    });
                });
            });
        });
    });
};

exports.simulatePayment = (req, res) => {
    const userId = req.user.id;
    const { subscriptionId, transactionId } = req.body; // transactionId можно получить из ответа createSubscription

    if (!subscriptionId || !transactionId) {
        return res.status(400).json({ message: 'Subscription ID and Transaction ID are required' });
    }

    Subscription.findById(subscriptionId, (err, subscription) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
        if (subscription.userId !== userId) return res.status(403).json({ message: 'Forbidden: This is not your subscription' });
        if (subscription.status === 'active') return res.status(400).json({ message: 'Subscription is already active' });

        // Симуляция успешной оплаты
        Transaction.updateStatus(transactionId, 'completed', (err, transUpdateResult) => {
            if (err) return res.status(500).json({ message: 'Error updating transaction status', error: err.message });
            if (transUpdateResult.changes === 0) return res.status(404).json({ message: 'Transaction not found or not updated' });

            Subscription.updateStatus(subscriptionId, 'active', (err, subUpdateResult) => {
                if (err) return res.status(500).json({ message: 'Error activating subscription', error: err.message });
                if (subUpdateResult.changes === 0) return res.status(404).json({ message: 'Subscription not found or not updated' });

                res.json({ message: 'Payment successful. Subscription activated.' });
            });
        });
    });
};