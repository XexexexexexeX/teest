let isAdmin = true; // Флаг для проверки, вошёл ли администратор
let cart = []; // Массив для хранения товаров в корзине

let products = {
    liquids: [],
    ecigs: [],
    cartridges: []
};

const Fetch_URL = ('https://tabachoook.ru/api/products');

// Предупреждение о возрасте
function showAgeVerification() {
    const modal = document.getElementById("age-verification-modal");
    modal.style.display = "flex"; // Показываем модальное окно

    document.getElementById("age-yes").addEventListener("click", () => {
        modal.style.display = "none"; // Скрываем модальное окно
    });

    document.getElementById("age-no").addEventListener("click", () => {
        alert("Доступ запрещён.");
        window.location.href = "https://ya.ru/"; // Закрываем сайт
    });
}

// Вход в админ-панель
document.getElementById("admin-login").addEventListener("click", () => {
    const password = prompt("Введите пароль:");
    if (password === "admin123") { // Простой пароль для примера
        isAdmin = true;
        document.getElementById("admin-panel").classList.remove("hidden"); // Показываем админ-панель
        document.getElementById("toggle-product-list").classList.remove("hidden");
        renderProductList(); // Рендерим список товаров
    } else {
        alert("Неверный пароль!");
    }
});

// Функция для сворачивания/разворачивания списка товаров
function toggleProductList() {
    const productList = document.getElementById("product-list");
    const toggleButton = document.getElementById("toggle-product-list");

    if (productList.classList.contains("hidden")) {
        // Если список скрыт, показываем его
        productList.classList.remove("hidden");
    } else {
        // Если список видим, скрываем его
        productList.classList.add("hidden");
    }
}

// Добавьте обработчик события для кнопки
document.getElementById("toggle-product-list").addEventListener("click", toggleProductList);

// Обработка формы с предварительным обновлением данных
document.getElementById("product-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    await loadProducts(); // Обновляем данные перед выполнением действий

    const id = document.getElementById("product-id").value || Date.now(); // Используем существующий ID или создаем новый
    const name = document.getElementById("product-name").value;
    const brand = document.getElementById("product-brand").value;
    const description = document.getElementById("product-description").value;
    const price = parseFloat(document.getElementById("product-price").value);
    const image = document.getElementById("product-image").value;
    const stock = parseInt(document.getElementById("product-stock").value);
    const category = document.getElementById("product-category").value;

    const updatedProduct = {
        ...(name && { name }),
        ...(brand && { brand }),
        ...(description && { description }),
        ...(!isNaN(price) && { price }),
        ...(image && { image }),
        ...(!isNaN(stock) && { stock }),
    };

    const existingProductIndex = products[category].findIndex(p => p.id === Number(id));

    if (existingProductIndex !== -1) {
        // Если товар существует, обновляем его
        products[category][existingProductIndex] = {
            ...products[category][existingProductIndex],
            ...updatedProduct,
        };
        alert("Обновление товара!");
    } else {
        // Если это новый товар, добавляем его
        const newProduct = { id: Number(id), name, brand, description, price, image, stock, category };
        products[category].push(newProduct);
        alert("Новый товар!");
    }

    renderProductList(); // Рендерим список товаров
    renderProducts(category, brand); // Обновляем отображение товаров
    document.getElementById("product-form").reset(); // Очищаем форму
    saveProducts(); // Сохраняем данные
});

// Рендер списка товаров в админ-панели
function renderProductList() {
    const productList = document.getElementById("product-list");
    productList.innerHTML = ""; // Очищаем список

    // Перебираем категории
    Object.keys(products).forEach(category => {
        // Создаем контейнер для категории
        const categoryContainer = document.createElement("div");
        categoryContainer.classList.add("category-container");

        // Добавляем заголовок категории
        const categoryTitle = document.createElement("h2");
        categoryTitle.textContent = category === "liquids" ? "Жидкости" :
            category === "ecigs" ? "Электронные сигареты" :
                "Картриджи"; // Название категории
        categoryContainer.appendChild(categoryTitle);

        // Перебираем товары в категории
        products[category].forEach(product => {
            const productItem = document.createElement("div");
            productItem.classList.add("product-item");

            // Добавляем картинку товара
            const productImage = document.createElement("img");
            productImage.src = product.image; // URL картинки
            productImage.alt = product.name; // Альтернативный текст
            productImage.classList.add("product-image");

            // Содержимое товара (текст и кнопки)
            const productContent = document.createElement("div");
            productContent.classList.add("product-content");

            productContent.innerHTML = `
                <h3>${product.name}</h3>
                <p>Бренд: ${product.brand}</p>
                <p>Описание: ${product.description}</p>
                <p>Цена: ${product.price} руб.</p>
                <p>Наличие: ${product.stock} шт.</p>
                <button onclick="editProduct('${category}', ${product.id})">Изменить</button>
                <button onclick="deleteProduct('${category}', ${product.id})">Удалить</button>
            `;

            // Добавляем содержимое и картинку в карточку
            productItem.appendChild(productContent);
            productItem.appendChild(productImage); // Картинка справа
            categoryContainer.appendChild(productItem); // Добавляем товар в категорию
        });

        productList.appendChild(categoryContainer); // Добавляем категорию в список
    });
}

// Редактирование товара
function editProduct(category, id) {
    const product = products[category].find(p => p.id === id); // Находим товар по ID
    if (product) {
        document.getElementById("product-id").value = product.id; // Сохраняем ID в скрытое поле
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
async function saveProducts() {
    try {
        const response = await fetch('https://tabachoook.ru/api/products/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(products) // Отправляем все товары
        });

        if (response.ok) {
            console.log('Товары успешно сохранены на сервере');
        } else {
            console.error('Ошибка при сохранении товаров');
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

// Загрузка данных
async function loadProducts() {
    try {
        const response = await fetch('https://tabachoook.ru/api/products', {
            method: 'POST', // Используем POST вместо GET
            headers: {
                'Content-Type': 'application/json', // Указываем тип содержимого
            },
            body: JSON.stringify({}), // Пустое тело запроса (или можно передать параметры, если нужно)
        });

        if (response.ok) {
            const data = await response.json(); // Получаем данные
            products = data; // Обновляем глобальный объект products
            renderProductList(); // Рендерим список товаров
            console.log('Товары загружены с сервера:', data);
        } else {
            console.error('Ошибка при загрузке товаров:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Ошибка:', error);
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

        const stock = document.createElement("p"); // Количество на складе
        stock.textContent = `В наличии ${product.stock} шт.`;

        const price = document.createElement("p"); // Создаём цену
        price.classList.add("price"); // Добавляем класс
        price.textContent = `Цена: ${product.price} руб.`; // Устанавливаем текст цены

        const quantityInput = document.createElement("input"); // Поле для ввода количества
        quantityInput.type = "number";
        quantityInput.min = 1;
        quantityInput.max = product.stock; // Максимальное количество — количество на складе
        quantityInput.value = 1; // Значение по умолчанию
        quantityInput.classList.add("quantity-input");

        // Ограничение ввода
        quantityInput.addEventListener("input", (e) => {
            const value = parseInt(e.target.value);
            if (value > product.stock) {
                e.target.value = product.stock; // Устанавливаем максимальное значение
            } else if (value < 1) {
                e.target.value = 1; // Устанавливаем минимальное значение
            }
        });

        const addToCartButton = document.createElement("button"); // Создаём кнопку
        addToCartButton.textContent = "Добавить в корзину"; // Устанавливаем текст кнопки
        addToCartButton.addEventListener("click", () => {
            const quantity = parseInt(quantityInput.value);
            if (quantity > 0 && quantity <= product.stock) {
                addToCart(product, quantity); // Добавляем товар в корзину с указанным количеством
            } else {
                alert("Укажите корректное количество.");
            }
        });

        card.appendChild(image); // Добавляем изображение в карточку
        card.appendChild(title); // Добавляем заголовок в карточку
        card.appendChild(description); // Добавляем описание в карточку
        card.appendChild(price); // Добавляем цену в карточку
        card.appendChild(stock); // Добавляем наличие в карточку
        card.appendChild(quantityInput); // Добавляем поле для ввода количества
        card.appendChild(addToCartButton); // Добавляем кнопку в карточку

        productsContainer.appendChild(card); // Добавляем карточку в контейнер
    });
}
// Добавление в корзину с количеством
function addToCart(product, quantity) {
    if (quantity > product.stock) {
        alert("Недостаточно товара на складе.");
        return;
    }
    // Добавляем товар в корзину вместе с количеством и stock
    cart.push({
        name: product.name,
        description: product.description,
        price: product.price,
        quantity: quantity,
        stock: product.stock, // Сохраняем stock
    });
    saveCart(); // Сохраняем корзину
    renderCartButton(); // Обновляем кнопку корзины
}

// Рендер кнопки корзины
function renderCartButton() {
    const cartButton = document.getElementById("cart-button");

    if (cart.length > 0) {
        // Если в корзине есть товары, показываем кнопку
        cartButton.textContent = `Корзина (${cart.length})`; // Обновляем текст кнопки
        cartButton.classList.remove("hidden"); // Показываем кнопку
        cartButton.addEventListener("click", () => {
            const cartModal = document.getElementById("cart-modal");
            cartModal.style.display = "flex"; // Показываем корзину
            renderCartItems(); // Рендерим товары в корзине
            console.log("Корзина:", cart); //111111111111111111111111111111111111111111111111111111111111111111
        });
    } else {
        // Если корзина пуста, скрываем кнопку
        cartButton.classList.add("hidden");
    }
}

// Удаление товара из корзины
function removeFromCart(index) {
    cart.splice(index, 1); // Удаляем товар из массива по индексу
    console.log("Корзина после удаления:", cart); // Отладка
    saveCart(); // Сохраняем корзину в localStorage
    renderCartItems(); // Обновляем отображение корзины
    renderCartButton(); // Обновляем кнопку корзины
}

// Сохранение корзины
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart)); // Сохраняем корзину в localStorage
}

// Загрузка корзины
function loadCart() {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
        cart = JSON.parse(savedCart); // Загружаем корзину из localStorage

        // Удаляем товары с undefined категорией
        cart = cart.filter(item => item.category !== undefined);

        saveCart(); // Сохраняем обновленную корзину
        renderCartButton(); // Обновляем кнопку корзины
    }
}

// Рендер товаров в корзине
function renderCartItems() {
    const cartItems = document.getElementById("cart-items");
    cartItems.innerHTML = ""; // Очищаем контейнер

    let total = 0; // Общая сумма

    cart.forEach((item, index) => {
        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item"); // Добавляем класс для стилизации

        // Отображаем информацию о товаре (название, описание, цена, количество) и крестик для удаления
        cartItem.innerHTML = `
            <span>${item.name} - ${item.price} руб. x ${item.quantity} = ${item.price * item.quantity} руб.</span>
            <p>${item.description}</p>
            <input type="number" class="cart-quantity" value="${item.quantity}" min="1" max="${item.stock}" data-index="${index}">
            <span class="remove-item" data-index="${index}">&times;</span>
        `;

        cartItems.appendChild(cartItem); // Добавляем товар в корзину
        total += item.price * item.quantity; // Считаем общую сумму
    });

    // Добавляем обработчики событий для изменения количества
    document.querySelectorAll(".cart-quantity").forEach(input => {
        input.addEventListener("input", (e) => {
            const index = e.target.getAttribute("data-index"); // Получаем индекс товара
            const newQuantity = parseInt(e.target.value); // Новое количество
            const maxStock = cart[index].stock; // Используем сохранённое значение stock

            if (newQuantity > maxStock) {
                e.target.value = maxStock; // Устанавливаем максимальное значение
            } else if (newQuantity < 1) {
                e.target.value = 1; // Устанавливаем минимальное значение
            }
        });

        input.addEventListener("change", (e) => {
            const index = e.target.getAttribute("data-index"); // Получаем индекс товара
            const newQuantity = parseInt(e.target.value); // Новое количество
            const maxStock = cart[index].stock; // Используем сохранённое значение stock

            if (newQuantity > 0 && newQuantity <= maxStock) {
                cart[index].quantity = newQuantity; // Обновляем количество
                saveCart(); // Сохраняем корзину
                renderCartItems(); // Перерисовываем корзину
            } else {
                alert("Недостаточно товара на складе.");
                e.target.value = cart[index].quantity; // Возвращаем предыдущее значение
            }
        });
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

console.log(cart);

// Закрытие корзины
document.getElementById("close-cart").addEventListener("click", () => {
    document.getElementById("cart-modal").style.display = "none"; // Скрываем корзину
});



let userChatId = null;
let tgUsername = "Не указан"; // Значение по умолчанию

if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
    Telegram.WebApp.ready(); // Инициализация WebApp

    if (Telegram.WebApp.initDataUnsafe && Telegram.WebApp.initDataUnsafe.user) {
        const userData = Telegram.WebApp.initDataUnsafe.user;
        console.log('Данные пользователя:', userData);

        userChatId = userData.id; // Получаем chat_id пользователя
        tgUsername = userData.username || userData.first_name || "Не указан";
    } else {
        console.error('Данные пользователя отсутствуют в initDataUnsafe');
    }
} else {
    console.error('Telegram.WebApp недоступен');
}

// Оформление самовывоза
document.getElementById("pickup-form").addEventListener("submit", async (e) => {
    e.preventDefault(); // Отменяем стандартное поведение формы

    if (cart.length === 0) {
        alert("Ваша корзина пуста. Добавьте товары перед оформлением заказа.");
        return; // Прерываем выполнение функции
    }

    const name = document.getElementById("pickup-name").value; // Имя пользователя
    const phone = document.getElementById("pickup-phone").value; // Телефон пользователя

    // Рассчитываем общую сумму заказа
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Формируем данные для отправки
    const orderData = {
        name,
        phone,
        tgUsername,
        items: cart.map(item => ({
            name: item.name,
            description: item.description,
            price: item.price,
            quantity: item.quantity, // Добавляем количество
        })),
        total, // Общая сумма заказа
        userChatId,
    };

    console.log('Данные заказа:', orderData);
    
    try {
        // Отправляем данные на сервер
        const response = await fetch('https://tabachoook.ru/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            alert(`Спасибо, ${name}! Ваш заказ оформлен. Мы свяжемся с вами по номеру ${phone}.`);
            cart = [];
            saveCart(); // Сохраняем корзину
            renderCartButton(); // Обновляем кнопку корзины
            document.getElementById("cart-modal").style.display = "none"; // Скрываем корзину
        } else {
            alert("Ошибка при оформлении заказа. Попробуйте ещё раз.");
        }
    } catch (error) {
        console.error("Ошибка:", error);
        alert("Произошла ошибка при отправке данных.");
    }
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
