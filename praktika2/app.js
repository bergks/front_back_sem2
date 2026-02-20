const express = require('express');
const app = express();
const port = 3000;

let goods = [
    {id: 1, name: 'Chocolate', price: 150},
    {id: 2, name: 'Apples', price: 100},
    {id: 3, name: 'Green tea', price: 240},
    {id: 4, name: 'Oranges', price: 250},
    {id: 5, name: 'Coffee', price: 340},
]

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Главная страница')
})

app.post('/goods', (req, res) => {
    const {name, price} = req.body;

    const newGood = {
        id: Date.now(),
        name,
        price
    }

    goods.push(newGood)
    res.status(201).json(newGood)
})

app.get('/goods', (req, res) => {
    res.json(goods);
});

app.get('/goods/:id', (req, res) => {
    let good = goods.find(u => u.id == req.params.id)
    res.send(JSON.stringify(good))
})

app.patch('/goods/:id', (req, res) => {
    const good = goods.find(g => g.id == req.params.id)
    const {name, price} = req.body

    if (name !== undefined) good.name = name;
    if (price !== undefined) good.price = price;

    res.json(good)
})

app.delete('/goods/:id', (req, res) => {
    goods = goods.filter(g => g.id != req.params.id)
    res.send('OK')
})

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`)
})