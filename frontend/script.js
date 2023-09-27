async function login() {
	const username = document.getElementById('username').value;
	const response = await fetch('http://localhost:3000/login', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ username })
	});

	if (response.ok) {
		document.getElementById('loginForm').style.display = 'none';
		document.getElementById('productList').style.display = 'block';
		fetchProducts();
	} else {
		alert('Login failed. Please try again.');
	}
}

async function fetchProducts() {
	try {
		const response = await fetch('http://localhost:3000/products');
		if (!response.ok) {
			throw new Error('Failed to fetch products');
		}

		const products = await response.json();
		const productList = document.getElementById('products');
		productList.innerHTML = '';

		products.forEach(product => {
			const listItem = document.createElement('div');
			listItem.classList.add("product__card");

			listItem.innerHTML = `<div class="row">
				<img src="" alt="">
				<div class="product__card-content">
					<h3 class="after-title">${product.name}</h3>
					<p class="text-pro">${product.description}</p>
					<a href="${product.link}">Посилання на подаруннок</a>
				</div>
			</div>`;

			if (product.reservedBy) {
				listItem.innerHTML += ` <button disabled>Reserved</button>`;
			} else {
				listItem.innerHTML += ` <button onclick="reserve('${product._id}')">Reserve</button>`;
			}

			productList.appendChild(listItem);
		});
	} catch (error) {
		console.error('Error fetching products:', error);
	}
}

async function reserve(productId) {
	const username = document.getElementById('username').value;
	const response = await fetch('http://localhost:3000/reserve', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ productId, username })
	});

	if (response.ok) {
		fetchProducts();
	} else {
		alert('Reservation failed. Please try again.');
	}
}