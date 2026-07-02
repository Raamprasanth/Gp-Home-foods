const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');

router.get('/stats', async (req, res) => {
    try {
        // Today's boundaries
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch today's bills
        const todaysBills = await Bill.find({
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        // 1. Calculate Today's Revenue
        const revenue = todaysBills.reduce((sum, bill) => sum + bill.total, 0);

        // 2. Bills Generated (Dine-in / Takeaway)
        const bills = todaysBills.length;

        // 3. Delivery Orders (Assume 0 for bills page for now unless it supports delivery)
        const deliveryCount = 0;

        // 4. Recent Orders (limit 5)
        const recentOrders = await Bill.find()
            .sort({ date: -1 })
            .limit(5);

        // 5. Staff count (mocked for now until Employee model is added)
        const staffOnDuty = 7;

        // 6. Top Dishes (Aggregation across all bills)
        const topDishesAgg = await Bill.aggregate([
            { $unwind: "$items" },
            { 
                $group: { 
                    _id: "$items.name", 
                    count: { $sum: "$items.qty" } 
                } 
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const topDishes = topDishesAgg.map((dish, index) => ({
            rank: index + 1,
            name: dish._id,
            count: dish.count,
            percentage: Math.min(100, Math.round((dish.count / 50) * 100)) // mock percentage logic for the UI bar
        }));

        // 7. Weekly Revenue (mocked for now to fit the UI chart)
        const weeklyRevenue = {
            days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            values: [3200, 2850, 4100, 3750, 4820, 6200, 5400]
        };

        const responseData = {
            revenue: revenue || 4820, // fallback
            bills: bills || 38,       // fallback
            deliveryCount: deliveryCount || 14,
            staffOnDuty: staffOnDuty,
            recentOrders: recentOrders.length > 0 ? recentOrders.map(b => ({
                id: b.id || ('B' + String(b.billNo).padStart(4, '0')),
                type: b.table !== '—' ? 'dine-in' : 'takeaway',
                items: b.items.map(i => `${i.name} × ${i.qty}`).join(', '),
                amount: b.total,
                status: 'paid'
            })) : [
                { id: '#0042', type: 'dine-in', items: 'Meals × 2', amount: 380, status: 'paid' },
                { id: '#0041', type: 'delivery', items: 'Dosa, Chutney', amount: 160, status: 'on-the-way' },
                { id: '#0040', type: 'dine-in', items: 'Chettinad × 3', amount: 720, status: 'paid' },
                { id: '#0039', type: 'delivery', items: 'Idli × 4, Sambar', amount: 240, status: 'pending' },
                { id: '#0038', type: 'dine-in', items: 'Filter Kaapi × 6', amount: 180, status: 'paid' }
            ],
            topDishes: topDishes.length > 0 ? topDishes : [
                { rank: 1, name: 'Banana Leaf Meals', count: 42, percentage: 100 },
                { rank: 2, name: 'Masala Dosa', count: 31, percentage: 74 },
                { rank: 3, name: 'Filter Kaapi', count: 28, percentage: 67 },
                { rank: 4, name: 'Chettinad Chicken', count: 19, percentage: 45 },
                { rank: 5, name: 'Idli (2 pcs)', count: 17, percentage: 40 }
            ],
            weeklyRevenue
        };

        res.json(responseData);
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

module.exports = router;
