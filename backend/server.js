const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { MongoClient } = require('mongodb');

const mongoURI = 'mongodb://localhost:27017';
const dbName = 'mini-crm';

app.use(bodyParser.json());

// Підключення до MongoDB
MongoClient.connect(mongoURI, { useUnifiedTopology: true })
	.then(client => {
		const db = client.db(dbName);
		const usersCollection = db.collection('users');
		const productsCollection = db.collection('products');

		app.use((req, res, next) => {
			res.setHeader('Access-Control-Allow-Origin', 'http://minicrm');
			res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
			res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
			res.setHeader('Access-Control-Allow-Credentials', 'true'); // Якщо ваш сервер приймає куки, встановіть це значення в true
			next();
		});

		// Роутер для логіну користувача
		app.post('/login', (req, res) => {
			const { username } = req.body;

			// Пошук користувача за логіном
			usersCollection.findOne({ username })
				.then(user => {
					if (!user) {
						// Якщо користувача немає, то додати його до таблиці
						usersCollection.insertOne({ username })
							.then(() => {
								res.status(200).json({ message: 'User created' });
							})
							.catch(error => {
								res.status(500).json({ message: 'Error creating user' });
							});
					} else {
						res.status(200).json({ message: 'User logged in' });
					}
				})
				.catch(error => {
					res.status(500).json({ message: 'Error searching for user' });
				});
		});


		// Роутер для отримання списку продуктів
		app.get('/products', (req, res) => {
			productsCollection.find().toArray()
				.then(products => {
					res.status(200).json(products);
				})
				.catch(error => {
					res.status(500).json({ message: 'Error fetching products' });
				});
		});

		// Роутер для резервування продукту
		app.post('/reserve', (req, res) => {
			const { productId, username } = req.body;
			console.log('Received reservation request:', { productId, username });
			const objectIdProductId = new ObjectId(productId);

			productsCollection.findOne({ _id: objectIdProductId })
				.then(product => {
					if (!product) {
						res.status(404).json({ message: 'Product not found' });
					} else if (product.reservedBy) {
						res.status(400).json({ message: 'Product already reserved' });
					} else {
						productsCollection.updateOne(
							{ _id: objectIdProductId },
							{ $set: { reservedBy: username } }
						)
							.then(() => {
								res.status(200).json({ message: 'Product reserved' });
							})
							.catch(error => {
								res.status(500).json({ message: 'Error reserving product' });
							});
					}
				})
				.catch(error => {
					res.status(500).json({ message: 'Error searching for product' });
				});
		});

		// Запуск сервера на порту 3000
		app.listen(3000, () => {
			console.log('Server is running on port 3000');
		});
	})
	.catch(error => {
		console.error('Error connecting to MongoDB', error);
	});


const User = require('./models/users');
const Product = require('./models/products');



