let isAdmin = false; // Флаг для проверки, вошёл ли администратор
let cart = []; // Массив для хранения товаров в корзине

// Данные о товарах
let products = {
    liquids: [
        {
            id: 1,
            name: "Жидкость Pafos 20000",
            brand: "Pafos",
            description: "Вкус табака, крепость 20 мг/мл.",
            price: 1000,
            image: "https://avatars.mds.yandex.net/get-goods_pic/14530939/hat266cb43543d096949631be4053c09250/square_166",
            stock: 10
        }
    ],
    ecigs: [
        {
            id: 2,
            name: "Электронная сигарета HQD",
            brand: "HQD",
            description: "Мощная и долговечная.",
            price: 3000,
            image: "https://avatars.mds.yandex.net/get-goods_pic/14530939/hat266cb43543d096949631be4053c09250/square_166",
            stock: 5
        }
    ],
    cartridges: [
        {
            id: 3,
            name: "Картридж Pafos",
            brand: "Pafos",
            description: "Сменный картридж для электронных сигарет.",
            price: 800,
            image: "https://avatars.mds.yandex.net/get-goods_pic/14530939/hat266cb43543d096949631be4053c09250/square_166",
            stock: 20
        },
        {
            id: 4,
            name: "Картридж Pafos",
            brand: "Pafos",
            description: "Сменный картридж для электронных сигарет.",
            price: 800,
            image: "https://avatars.mds.yandex.net/get-goods_pic/14530939/hat266cb43543d096949631be4053c09250/square_166",
            stock: 20
        }
    ]
};

// Предупреждение о возрасте
function showAgeVerification() {
    const modal = document.getElementById("age-verification-modal");
    modal.style.display = "flex"; // Показываем модальное окно

    document.getElementById("age-yes").addEventListener("click", () => {
        modal.style.display = "none"; // Скрываем модальное окно
    });

    document.getElementById("age-no").addEventListener("click", () => {
        alert("Доступ запрещён.");
        window.close(); // Закрываем сайт
    });
}

// Вход в админ-панель
document.getElementById("admin-login").addEventListener("click", () => {
    const password = prompt("Введите пароль:");
    if (password === "admin123") { // Простой пароль для примера
        isAdmin = true;
        document.getElementById("admin-panel").classList.remove("hidden"); // Показываем админ-панель
        renderProductList(); // Рендерим список товаров
    } else {
        alert("Неверный пароль!");
    }
});

// Обработка формы
document.getElementById("product-form").addEventListener("submit", (e) => {
    e.preventDefault(); // Отменяем стандартное поведение формы

    const id = Date.now(); // Уникальный ID
    const name = document.getElementById("product-name").value; // Название товара
    const brand = document.getElementById("product-brand").value; // Бренд
    const description = document.getElementById("product-description").value; // Описание
    const price = parseFloat(document.getElementById("product-price").value); // Цена
    const image = document.getElementById("product-image").value; // Ссылка на изображение
    const stock = parseInt(document.getElementById("product-stock").value); // Количество на складе
    const category = document.getElementById("product-category").value; // Категория

    const product = { id, name, brand, description, price, image, stock }; // Создаём объект товара

    // Добавление или обновление товара
    const existingProductIndex = products[category].findIndex(p => p.name === name);
    if (existingProductIndex !== -1) {
        products[category][existingProductIndex] = product; // Обновляем товар
    } else {
        products[category].push(product); // Добавляем новый товар
    }

    renderProductList(); // Рендерим список товаров
    renderProducts(category); // Обновляем отображение товаров
    document.getElementById("product-form").reset(); // Очищаем форму
    saveProducts(); // Сохраняем данные
});

// Рендер списка товаров в админ-панели
function renderProductList() {
    const productList = document.getElementById("product-list");
    productList.innerHTML = ""; // Очищаем список

    Object.keys(products).forEach(category => { // Перебираем категории
        products[category].forEach(product => { // Перебираем товары в категории
            const productItem = document.createElement("div");
            productItem.classList.add("product-item");

            productItem.innerHTML = `
        <h3>${product.name}</h3>
        <p>Бренд: ${product.brand}</p>
        <p>Описание: ${product.description}</p>
        <p>Цена: ${product.price} руб.</p>
        <p>Наличие: ${product.stock} шт.</p>
        <button onclick="editProduct('${category}', ${product.id})">Изменить</button>
        <button onclick="deleteProduct('${category}', ${product.id})">Удалить</button>
      `;

            productList.appendChild(productItem); // Добавляем товар в список
        });
    });
}

// Редактирование товара
function editProduct(category, id) {
    const product = products[category].find(p => p.id === id); // Находим товар по ID
    if (product) {
        document.getElementById("product-name").value = product.name; // Заполняем форму данными товара
        document.getElementById("product-brand").value = product.brand;
        document.getElementById("product-description").value = product.description;
        document.getElementById("product-price").value = product.price;
        document.getElementById("product-image").value = product.image;
        document.getElementById("product-stock").value = product.stock;
        document.getElementById("product-category").value = category;
    }
}

// Удаление товара
function deleteProduct(category, id) {
    products[category] = products[category].filter(p => p.id !== id); // Удаляем товар из массива
    renderProductList(); // Рендерим список товаров
    renderProducts(category); // Обновляем отображение товаров
    saveProducts(); // Сохраняем данные
}

// Сохранение данных
function saveProducts() {
    localStorage.setItem("products", JSON.stringify(products)); // Сохраняем данные в localStorage
}

// Загрузка данных
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        if (response.ok) {
            const products = await response.json();
            const productList = document.getElementById('product-list');
            productList.innerHTML = ''; // Очищаем список

            // Отображаем товары
            Object.keys(products).forEach(category => {
                const categoryTitle = document.createElement('h3');
                categoryTitle.textContent = category.toUpperCase();
                productList.appendChild(categoryTitle);

                products[category].forEach(product => {
                    const productItem = document.createElement('div');
                    productItem.innerHTML = `
                        <p><strong>${product.name}</strong> (${product.brand})</p>
                        <p>${product.description}</p>
                        <p>Цена: ${product.price} руб.</p>
                        <p>На складе: ${product.stock} шт.</p>
                        <img src="${product.image}" alt="${product.name}" width="100">
                        <hr>
                    `;
                    productList.appendChild(productItem);
                });
            });
        } else {
            console.error('Ошибка при загрузке товаров');
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}


document.getElementById('product-form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Предотвращаем стандартную отправку формы

    // Собираем данные из формы
    const productData = {
        name: document.getElementById('product-name').value,
        brand: document.getElementById('product-brand').value,
        description: document.getElementById('product-description').value,
        price: parseFloat(document.getElementById('product-price').value),
        image: document.getElementById('product-image').value,
        stock: parseInt(document.getElementById('product-stock').value),
        category: document.getElementById('product-category').value
    };

    try {
        // Отправляем данные на сервер
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            const data = await response.json();
            alert(data.message); // Уведомление об успехе
            loadProducts(); // Обновляем список товаров (если у вас есть такая функция)
        } else {
            alert('Ошибка при добавлении/изменении товара');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при отправке данных');
    }
});


// Сохранение корзины
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// Загрузка корзины
function loadCart() {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
        cart = JSON.parse(savedCart);
        renderCartButton(); // Обновляем кнопку корзины
    }
}

// Рендер категорий
function renderCategories() {
    const categoriesContainer = document.getElementById("categories");
    categoriesContainer.innerHTML = ""; // Очищаем контейнер

    const categories = Object.keys(products); // Получаем список категорий

    categories.forEach(category => {
        const button = document.createElement("button"); // Создаём кнопку
        button.textContent = category === "liquids" ? "Жидкости" :
            category === "ecigs" ? "Электронные сигареты" :
                "Картриджи"; // Устанавливаем текст кнопки
        button.addEventListener("click", () => renderSubCategories(category)); // Добавляем обработчик
        categoriesContainer.appendChild(button); // Добавляем кнопку в контейнер
    });
}

// Рендер подкатегорий (брендов)
function renderSubCategories(category) {
    const subCategoriesContainer = document.getElementById("sub-categories");
    subCategoriesContainer.innerHTML = ""; // Очищаем контейнер

    const brands = [...new Set(products[category].map(product => product.brand))]; // Получаем уникальные бренды

    brands.forEach(brand => {
        const button = document.createElement("button"); // Создаём кнопку
        button.textContent = brand; // Устанавливаем текст кнопки
        button.addEventListener("click", () => renderProducts(category, brand)); // Добавляем обработчик
        subCategoriesContainer.appendChild(button); // Добавляем кнопку в контейнер
    });
}

// Рендер товаров
function renderProducts(category, brand) {
    const productsContainer = document.getElementById("products");
    productsContainer.innerHTML = ""; // Очищаем контейнер

    const filteredProducts = products[category].filter(product => product.brand === brand); // Фильтруем товары по бренду

    filteredProducts.forEach(product => {
        const card = document.createElement("div"); // Создаём карточку товара
        card.classList.add("product-card"); // Добавляем класс

        const image = document.createElement("img"); // Создаём изображение
        image.src = product.image; // Устанавливаем ссылку на изображение
        image.alt = product.name; // Устанавливаем альтернативный текст

        const title = document.createElement("h2"); // Создаём заголовок
        title.textContent = product.name; // Устанавливаем текст заголовка

        const description = document.createElement("p"); // Создаём описание
        description.textContent = product.description; // Устанавливаем текст описания

        const price = document.createElement("p"); // Создаём цену
        price.classList.add("price"); // Добавляем класс
        price.textContent = `Цена: ${product.price} руб.`; // Устанавливаем текст цены

        const addToCartButton = document.createElement("button"); // Создаём кнопку
        addToCartButton.textContent = "Добавить в корзину"; // Устанавливаем текст кнопки
        addToCartButton.addEventListener("click", () => addToCart(product)); // Добавляем обработчик

        card.appendChild(image); // Добавляем изображение в карточку
        card.appendChild(title); // Добавляем заголовок в карточку
        card.appendChild(description); // Добавляем описание в карточку
        card.appendChild(price); // Добавляем цену в карточку
        card.appendChild(addToCartButton); // Добавляем кнопку в карточку

        productsContainer.appendChild(card); // Добавляем карточку в контейнер
    });
}

// Добавление в корзину
function addToCart(product) {
    cart.push(product); // Добавляем товар в корзину
    saveCart(); // Сохраняем корзину
    renderCartButton(); // Обновляем кнопку корзины
    alert(`${product.name} добавлен в корзину!`); // Показываем уведомление
}

// Рендер кнопки корзины
function renderCartButton() {
    const cartButton = document.getElementById("cart-button");
    cartButton.textContent = `Корзина (${cart.length})`; // Обновляем текст кнопки
    cartButton.classList.remove("hidden"); // Показываем кнопку
    cartButton.addEventListener("click", () => {
        const cartModal = document.getElementById("cart-modal");
        cartModal.style.display = "flex"; // Показываем корзину
        renderCartItems(); // Рендерим товары в корзине
    });
}

// Рендер товаров в корзине
function renderCartItems() {
    const cartItems = document.getElementById("cart-items");
    cartItems.innerHTML = ""; // Очищаем контейнер

    let total = 0; // Общая сумма

    cart.forEach((item, index) => {
        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item"); // Добавляем класс для стилизации

        // Отображаем информацию о товаре и крестик для удаления
        cartItem.innerHTML = `
      <span>${item.name} - ${item.price} руб.</span>
      <span class="remove-item" data-index="${index}">&times;</span>
    `;

        cartItems.appendChild(cartItem); // Добавляем товар в корзину
        total += item.price; // Считаем общую сумму
    });

    // Добавляем обработчики событий для крестиков
    document.querySelectorAll(".remove-item").forEach(button => {
        button.addEventListener("click", (e) => {
            const index = e.target.getAttribute("data-index"); // Получаем индекс товара
            removeFromCart(index); // Удаляем товар из корзины
        });
    });

    document.getElementById("cart-total").textContent = `Общая сумма: ${total} руб.`; // Отображаем общую сумму
}

// Удаление товара из корзины
function removeFromCart(index) {
    cart.splice(index, 1); // Удаляем товар из массива по индексу
    saveCart(); // Сохраняем корзину в localStorage
    renderCartItems(); // Обновляем отображение корзины
    renderCartButton(); // Обновляем кнопку корзины
}

// Сохранение корзины
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart)); // Сохраняем корзину в localStorage
}

// Закрытие корзины
document.getElementById("close-cart").addEventListener("click", () => {
    document.getElementById("cart-modal").style.display = "none"; // Скрываем корзину
});
// Рендер товаров в корзине
function renderCartItems() {
    const cartItems = document.getElementById("cart-items");
    cartItems.innerHTML = ""; // Очищаем контейнер

    let total = 0; // Общая сумма

    cart.forEach((item, index) => {
        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item"); // Добавляем класс для стилизации

        // Отображаем информацию о товаре и крестик для удаления
        cartItem.innerHTML = `
      <span>${item.name} - ${item.price} руб.</span>
      <span class="remove-item" data-index="${index}">&times;</span>
    `;

        cartItems.appendChild(cartItem); // Добавляем товар в корзину
        total += item.price; // Считаем общую сумму
    });

    // Добавляем обработчики событий для крестиков
    document.querySelectorAll(".remove-item").forEach(button => {
        button.addEventListener("click", (e) => {
            const index = e.target.getAttribute("data-index"); // Получаем индекс товара
            removeFromCart(index); // Удаляем товар из корзины
        });
    });

    document.getElementById("cart-total").textContent = `Общая сумма: ${total} руб.`; // Отображаем общую сумму
}

// Удаление товара из корзины
function removeFromCart(index) {
    cart.splice(index, 1); // Удаляем товар из массива по индексу
    saveCart(); // Сохраняем корзину в localStorage
    renderCartItems(); // Обновляем отображение корзины
    renderCartButton(); // Обновляем кнопку корзины
}

// Сохранение корзины
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart)); // Сохраняем корзину в localStorage
}

// Закрытие корзины
document.getElementById("close-cart").addEventListener("click", () => {
    document.getElementById("cart-modal").style.display = "none"; // Скрываем корзину
});
// Рендер товаров в корзине
function renderCartItems() {
    const cartItems = document.getElementById("cart-items");
    cartItems.innerHTML = ""; // Очищаем контейнер

    let total = 0; // Общая сумма

    cart.forEach((item, index) => {
        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item"); // Добавляем класс для стилизации

        // Отображаем информацию о товаре и крестик для удаления
        cartItem.innerHTML = `
      <span>${item.name} - ${item.price} руб.</span>
      <span class="remove-item" data-index="${index}">&times;</span>
    `;

        cartItems.appendChild(cartItem); // Добавляем товар в корзину
        total += item.price; // Считаем общую сумму
    });

    // Добавляем обработчики событий для крестиков
    document.querySelectorAll(".remove-item").forEach(button => {
        button.addEventListener("click", (e) => {
            const index = e.target.getAttribute("data-index"); // Получаем индекс товара
            removeFromCart(index); // Удаляем товар из корзины
        });
    });

    document.getElementById("cart-total").textContent = `Общая сумма: ${total} руб.`; // Отображаем общую сумму
}

// Удаление товара из корзины
function removeFromCart(index) {
    cart.splice(index, 1); // Удаляем товар из массива по индексу
    saveCart(); // Сохраняем корзину в localStorage
    renderCartItems(); // Обновляем отображение корзины
    renderCartButton(); // Обновляем кнопку корзины
}

// Сохранение корзины
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart)); // Сохраняем корзину в localStorage
}

// Закрытие корзины
document.getElementById("close-cart").addEventListener("click", () => {
    document.getElementById("cart-modal").style.display = "none"; // Скрываем корзину
});

// Загрузка корзины
function loadCart() {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
        cart = JSON.parse(savedCart); // Загружаем корзину из localStorage
        renderCartButton(); // Обновляем кнопку корзины
    }
}

// Рендер кнопки корзины
function renderCartButton() {
    const cartButton = document.getElementById("cart-button");
    cartButton.textContent = `Корзина (${cart.length})`; // Обновляем текст кнопки
    cartButton.classList.remove("hidden"); // Показываем кнопку
    cartButton.addEventListener("click", () => {
        const cartModal = document.getElementById("cart-modal");
        cartModal.style.display = "flex"; // Показываем корзину
        renderCartItems(); // Рендерим товары в корзине
    });
}

// Оформление самовывоза
document.getElementById("pickup-form").addEventListener("submit", (e) => {
    e.preventDefault(); // Отменяем стандартное поведение формы
    const name = document.getElementById("pickup-name").value; // Имя пользователя
    const phone = document.getElementById("pickup-phone").value; // Телефон пользователя
    alert(`Спасибо, ${name}! Ваш заказ готов к самовывозу. Мы свяжемся с вами по номеру ${phone}.`); // Показываем уведомление
    cart = []; // Очищаем корзину
    saveCart(); // Сохраняем корзину
    renderCartButton(); // Обновляем кнопку корзины
    document.getElementById("cart-modal").style.display = "none"; // Скрываем корзину
});

// Закрытие корзины
document.getElementById("close-cart").addEventListener("click", () => {
    document.getElementById("cart-modal").style.display = "none"; // Скрываем корзину
});


let sortDirection = {
    price: "asc", // Направление сортировки по цене
    name: "asc"   // Направление сортировки по названию
};

// Сортировка товаров
function sortProducts(key, direction = "asc") {
    const productsContainer = document.getElementById("products");
    const productCards = Array.from(productsContainer.children); // Получаем все карточки товаров

    productCards.sort((a, b) => {
        const aValue = key === "price"
            ? parseFloat(a.querySelector(".price").textContent.replace("Цена: ", "").replace(" руб.", "")) // Получаем цену
            : a.querySelector("h2").textContent; // Получаем название
        const bValue = key === "price"
            ? parseFloat(b.querySelector(".price").textContent.replace("Цена: ", "").replace(" руб.", "")) // Получаем цену
            : b.querySelector("h2").textContent; // Получаем название

        if (key === "price") {
            return direction === "asc" ? aValue - bValue : bValue - aValue; // Сортировка по цене
        } else {
            return direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue); // Сортировка по названию
        }
    });

    productsContainer.innerHTML = ""; // Очищаем контейнер
    productCards.forEach(card => productsContainer.appendChild(card)); // Добавляем отсортированные карточки
}

// Переключение направления сортировки
function toggleSortDirection(key) {
    sortDirection[key] = sortDirection[key] === "asc" ? "desc" : "asc"; // Переключаем направление
    return sortDirection[key];
}

// Рендер кнопок сортировки
function renderSortButtons() {
    const sortContainer = document.getElementById("sort-buttons");
    sortContainer.innerHTML = ""; // Очищаем контейнер

    const sortByNameButton = document.createElement("button");
    sortByNameButton.textContent = `Сортировать по названию ${sortDirection.name === "asc" ? "▲" : "▼"}`;
    sortByNameButton.addEventListener("click", () => {
        const direction = toggleSortDirection("name"); // Переключаем направление
        sortProducts("name", direction); // Сортируем по названию
        renderSortButtons(); // Обновляем кнопки
    });

    const sortByPriceButton = document.createElement("button");
    sortByPriceButton.textContent = `Сортировать по цене ${sortDirection.price === "asc" ? "▲" : "▼"}`;
    sortByPriceButton.addEventListener("click", () => {
        const direction = toggleSortDirection("price"); // Переключаем направление
        sortProducts("price", direction); // Сортируем по цене
        renderSortButtons(); // Обновляем кнопки
    });

    sortContainer.appendChild(sortByNameButton);
    sortContainer.appendChild(sortByPriceButton);
}

// Инициализация
document.addEventListener("DOMContentLoaded", () => {
    showAgeVerification(); // Показываем окно подтверждения возраста
    loadProducts(); // Загружаем товары из localStorage
    loadCart(); // Загружаем корзину из localStorage
    renderCategories(); // Рендерим категории
    renderSortButtons(); // Рендерим кнопки сортировки

    // Скрываем корзину при загрузке страницы
    const cartModal = document.getElementById("cart-modal");
    cartModal.style.display = "none";
});
// Инициализация
document.addEventListener("DOMContentLoaded", () => {
    showAgeVerification(); // Показываем окно подтверждения возраста
    loadProducts(); // Загружаем товары из localStorage
    renderCategories(); // Рендерим категории
    renderSortButtons(); // Рендерим кнопки сортировки
}
);
