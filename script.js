let cart = []; // Массив для хранения товаров в корзине

let products = {
    "ecigs": [],
    "snys":[],
    "drinks":[],
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
        showToast("Доступ запрещён.");
        window.location.href = "https://ya.ru/"; // Закрываем сайт
    });
}

function formatPrice(price) {
    return `${new Intl.NumberFormat('ru-RU').format(price)}`;
}

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

// Функция для загрузки изображения на сервер
async function uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('https://tabachoook.ru/api/upload-image', {
        method: 'POST',
        body: formData,
        priority: 'high', // Повышаем приоритет
        headers: {
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.imageUrl;
}

let initialScrollPosition = window.scrollY; // Сохраняем изначальное положение прокрутки

// Обработка формы с предварительным обновлением данных
document.getElementById("product-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    await loadProducts(); // Обновляем данные перед выполнением действий

    const id = document.getElementById("product-id").value || Date.now(); // Используем существующий ID или создаем новый
    const name = document.getElementById("product-name").value;
    const brand = document.getElementById("product-brand").value;
    const line = document.getElementById("product-line").value; // Получаем значение линейки
    const description = document.getElementById("product-description").value;
    const price = parseFloat(document.getElementById("product-price").value);
    const image = document.getElementById("product-image").value;
    const stock = parseInt(document.getElementById("product-stock").value);
    const category = document.getElementById("product-category").value;

    if (!products[category]) {
        products[category] = []; // Создаём новую категорию, если её нет
    }

    const updatedProduct = {
        ...(name && { name }),
        ...(brand && { brand }),
        ...(line && { line }), // Добавляем линейку
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
        showToast("Обновление товара!");
    } else {
        // Если это новый товар, добавляем его
        const newProduct = { id: Number(id), name, brand, line, description, price, image, stock, category };
        products[category].push(newProduct);
        showToast("Новый товар!");
    }

    renderSubCategories("product-sub-categories", category);
    renderLines("product-lines", category, brand);

    renderProducts(category, brand); // Обновляем отображение товаров
    renderProductList(category, brand);
    document.getElementById("product-form").reset(); // Очищаем форму
    saveProducts(); // Сохраняем данные
});

// Обработчик для кнопки "Добавить/Изменить товар"
document.getElementById("save-product-button").addEventListener("click", () => {
    // Восстанавливаем изначальное положение прокрутки
    window.scrollTo({ top: initialScrollPosition, behavior: "smooth" }); // Плавная прокрутка
});

// Рендер списка товаров в админ-панели с фильтрацией
function renderProductList(category = null, brand = null, line = null) {
    const productList = document.getElementById("product-list");
    productList.innerHTML = ""; // Очищаем список

    // Если категория не указана, используем все категории
    const categoriesToRender = category ? [category] : Object.keys(products);

    // Перебираем категории
    categoriesToRender.forEach(currentCategory => {
        // Фильтруем товары по категории, бренду и линейке
        const filteredProducts = products[currentCategory].filter(product => {
            return (!brand || product.brand === brand) && (!line || product.line === line);
        });

        // Если в категории нет товаров после фильтрации, пропускаем её
        if (filteredProducts.length === 0) return;

        // Создаем контейнер для категории
        const categoryContainer = document.createElement("div");
        categoryContainer.classList.add("category-container");

        // Добавляем заголовок категории
        const categoryTitle = document.createElement("h2");
        if (currentCategory === "ecigs") {
            categoryTitle.textContent = "Электронные сигареты";
        } else if (currentCategory === "snys") {
            categoryTitle.textContent = "Снюс";
        } else if (currentCategory === "drinks") {
            categoryTitle.textContent = "Напитки";
        } else {
            categoryTitle.textContent = currentCategory; // Название категории по умолчанию
        }
        categoryContainer.appendChild(categoryTitle);

        // Перебираем отфильтрованные товары в категории
        filteredProducts.forEach(product => {
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
                <p>Линейка: ${product.line}</p>
                <p>Описание: ${product.description}</p>
                <p>Цена: ${formatPrice(product.price)} руб.</p>
                <p>Наличие: ${product.stock} шт.</p>
                <button onclick="editProduct('${currentCategory}', ${product.id})">Изменить</button>
                <button onclick="deleteProduct('${currentCategory}', ${product.id})">Удалить</button>
                <button onclick="duplicateProduct('${currentCategory}', ${product.id})">Дублировать</button>
                <button onclick="handleOutOfStock('${currentCategory}', ${product.id})">Нет в наличии</button>
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
    // Сохраняем текущее положение прокрутки
    initialScrollPosition = window.scrollY;

    const product = products[category].find(p => p.id === id); // Находим товар по ID
    if (product) {
        document.getElementById("product-id").value = product.id; // Сохраняем ID в скрытое поле
        document.getElementById("product-name").value = product.name; // Заполняем форму данными товара
        document.getElementById("product-brand").value = product.brand;
        document.getElementById("product-line").value = product.line; // Заполняем поле линейки
        document.getElementById("product-description").value = product.description;
        document.getElementById("product-price").value = product.price;
        document.getElementById("product-image").value = product.image;
        document.getElementById("product-stock").value = product.stock;
        document.getElementById("product-category").value = category;
    }
    window.scrollTo({ top: 0, behavior: "smooth" }); // Плавная прокрутка
}

// Удаление товара
function deleteProduct(category, id) {
    products[category] = products[category].filter(p => p.id !== id); // Удаляем товар из массива
    renderProducts(category); // Обновляем отображение товаров
    renderProductList(category);
    saveProducts(); // Сохраняем данные
}

// Дублирование товара
function duplicateProduct(category, id) {
    // Сохраняем текущее положение прокрутки
    initialScrollPosition = window.scrollY;

    const product = products[category].find(p => p.id === id); // Находим товар по ID

    if (product) {
        // Генерируем новый ID
        const newId = Date.now();

        // Копируем данные товара
        const duplicatedProduct = {
            ...product,
            id: newId, // Новый ID
        };

        // Вставляем данные в форму
        document.getElementById("product-id").value = ""; // Очищаем ID (новый товар)
        document.getElementById("product-name").value = duplicatedProduct.name;
        document.getElementById("product-brand").value = duplicatedProduct.brand;
        document.getElementById("product-line").value = duplicatedProduct.line;
        document.getElementById("product-description").value = duplicatedProduct.description;
        document.getElementById("product-price").value = duplicatedProduct.price;
        document.getElementById("product-image").value = duplicatedProduct.image;
        document.getElementById("product-stock").value = duplicatedProduct.stock;
        document.getElementById("product-category").value = category;

        // Прокручиваем страницу к форме
        window.scrollTo({ top: 0, behavior: "smooth" });

        showToast("Товар успешно дублирован. Заполните форму и сохраните новый товар.");
    }
}

// Нет в наличии товара
function handleOutOfStock(category, id) {
    const product = products[category].find(p => p.id === id); // Находим товар по ID
    if (product) {
        product.stock = 0; // Устанавливаем количество товара на 0
        showToast(`Товар "${product.name}" теперь отсутствует на складе.`);
        renderProducts(category); // Обновляем отображение товаров
        renderProductList(category);
        saveProducts(); // Сохраняем данные
    }
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
            console.log('Товары загружены с сервера:', data);
        } else {
            console.error('Ошибка при загрузке товаров:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

//рендер категорий
let currentCategory = null; // Переменная для хранения текущей выбранной категории
let currentBrand = null;
function renderCategories() {
    const categoriesContainer = document.getElementById("categories");
    const productcategoriesContainer = document.getElementById("product-categories");

    // Проверяем, что оба контейнера существуют
    if (!categoriesContainer || !productcategoriesContainer) {
        console.error("Один из контейнеров не найден!");
        return;
    }

    // Очищаем оба контейнера
    categoriesContainer.innerHTML = "";
    productcategoriesContainer.innerHTML = "";

    const categories = Object.keys(products); // Получаем список категорий

    categories.forEach(category => {
        // Создаём кнопку для categoriesContainer
        const button1 = createCategoryButton(category);
        categoriesContainer.appendChild(button1);

        // Создаём кнопку для productcategoriesContainer
        const button2 = createCategoryButton(category);
        productcategoriesContainer.appendChild(button2);
    });
}

// Функция для создания кнопки категории
function createCategoryButton(category) {
    const button = document.createElement("button"); // Создаём кнопку
    if (category === "ecigs") {
        button.textContent = "Электронные сигареты";
    } else if (category === "snys") {
        button.textContent = "Снюс";
    } else if (category === "drinks") {
        button.textContent = "Напитки";
    } else {
        button.textContent = category; // Отображаем название категории по умолчанию
    }

    // Добавляем обработчик для кнопки
    button.addEventListener("click", () => {
        const brandsContainer = document.getElementById("sub-categories");
        const linesContainer = document.getElementById("lines");
        const productBrandsContainer = document.getElementById("product-sub-categories");
        const productLinesContainer = document.getElementById("product-lines");

        // Проверяем, если текущая категория уже выбрана - сворачиваем всё
        if (currentCategory === category) {
            if (brandsContainer) brandsContainer.style.display = "none";
            if (linesContainer) linesContainer.style.display = "none";
            if (productBrandsContainer) productBrandsContainer.style.display = "none";
            if (productLinesContainer) productLinesContainer.style.display = "none";
            currentCategory = null;
            currentBrand = null;
            renderSortButtons(false);
            clearProducts()
            return;
        }

        // Иначе показываем бренды и скрываем линейки
        if (brandsContainer) {
            brandsContainer.style.display = "flex";
            renderSubCategories("sub-categories", category);
        }
        if (linesContainer) {
            linesContainer.style.display = "none";
            linesContainer.innerHTML = "";
        }
        if (productBrandsContainer) {
            productBrandsContainer.style.display = "flex";
            renderSubCategories("product-sub-categories", category);
        }
        if (productLinesContainer) {
            productLinesContainer.style.display = "none";
            productLinesContainer.innerHTML = "";
        }

        currentCategory = category; // Обновляем текущую категорию
        renderSortButtons(false);
        currentBrand = null;
        clearProducts(); // Очищаем контейнер с товарами
    });

    return button; // Возвращаем созданную кнопку
}

// Рендер брендов
function renderSubCategories(containerId, category) {
    const brandsContainer = document.getElementById(containerId);
    brandsContainer.innerHTML = "";
    brandsContainer.style.display = "flex";

    if (!brandsContainer) {
        console.error("Контейнер брендов не найден!");
        return;
    }

    const brands = [...new Set(products[category].map(product => product.brand))];

    // Кнопка "Все бренды" (старая логика - просто скрывает/показывает бренды)
    if (category !== "drinks" && category !== "snys") {
        const allBrandsButton = document.createElement("button");
        allBrandsButton.textContent = "Все бренды";
        allBrandsButton.addEventListener("click", () => {
            const brandButtons = brandsContainer.querySelectorAll(".brand-button");
            brandButtons.forEach(button => {
                if (button.style.display === "none") {
                    button.style.display = "flex"; // Показываем кнопки
                } else {
                    button.style.display = "none"; // Скрываем кнопки
                }
            });
        });
        brandsContainer.appendChild(allBrandsButton);
    }

    // Остальной код (рендер кнопок брендов)
    brands.forEach(brand => {
        const button = document.createElement("button");
        button.textContent = brand;
        button.classList.add("brand-button");
        button.style.display = "flex"; // По умолчанию видимы

        button.addEventListener("click", () => {
            const linesContainer = document.getElementById("lines");
            const productLinesContainer = document.getElementById("product-lines");

            if (currentBrand === brand) {
                linesContainer.style.display = "none";
                productLinesContainer.style.display = "none";
                currentBrand = null;
                productcurrentBrand = null;
            } else {
                currentBrand = brand;
                productcurrentBrand = brand;
                renderLines("lines", category, brand);
                renderLines("product-lines", category, brand);
                linesContainer.style.display = "flex";
                productLinesContainer.style.display = "flex";
            }
            renderSortButtons(false);
            clearProducts();
        });

        brandsContainer.appendChild(button);
    });
}

// Рендер линеек
function renderLines(containerId, category, brand = null) {
    const linesContainer = document.getElementById(containerId);
    linesContainer.innerHTML = ""; // Очищаем контейнер
    linesContainer.style.display = "flex"; // Показываем контейнер с линейками

    // Фильтруем линейки по выбранному бренду
    const lines = [...new Set(products[category]
        .filter(product => !brand || product.brand === brand) // Фильтруем по бренду
        .map(product => product.line) // Получаем линейки
    )];

    // Создаём кнопку "Все линейки" только если линеек больше одной
    if (lines.length > 1) {
        const allLinesButton = document.createElement("button");
        allLinesButton.textContent = (category === "drinks" || category === "snys") ? "Все бренды" : "Все линейки";
        allLinesButton.addEventListener("click", () => {
            renderProducts(category, brand);
            renderProductList(category, brand);
            renderSortButtons(true); // Показываем кнопки сортировки
        });
        linesContainer.appendChild(allLinesButton);
    }

    // Добавляем кнопки для каждой линейки
    lines.forEach(line => {
        const button = document.createElement("button");
        button.textContent = line; // Устанавливаем текст кнопки
        button.addEventListener("click", () => {
            renderProducts(category, brand, line);
            renderProductList(category, brand, line);
            renderSortButtons(true); // Показываем кнопки сортировки
        });
        linesContainer.appendChild(button); // Добавляем кнопку в контейнер линеек
    });
    // Скрываем кнопки сортировки при первом рендере линеек
    renderSortButtons(false);
}

// Очистка рендера товаров
function clearProducts() {
    const productsContainer = document.getElementById("products");
    if (productsContainer) {
        productsContainer.innerHTML = ""; // Очищаем контейнер
    }
    const products_Container = document.getElementById("product-list");
    if (products_Container) {
        products_Container.innerHTML = ""; // Очищаем контейнер
    }
}

//Рендер товаров
function renderProducts(category, brand, line) {
    const productsContainer = document.getElementById("products");
    productsContainer.innerHTML = ""; // Очищаем контейнер

    // Фильтруем товары по категории, бренду и линейке
    const filteredProducts = products[category].filter(product => {
        return (!brand || product.brand === brand) && (!line || product.line === line);
    });

    filteredProducts.forEach(product => {
        const card = document.createElement("div");
        card.classList.add("product-card");

        // Проверяем наличие товара
        const isOutOfStock = product.stock <= 0;
        if (isOutOfStock) {
            card.classList.add("out-of-stock");
        }

        // Блок для изображения
        const imageContainer = document.createElement("div");
        imageContainer.classList.add("image-container");

        if (isOutOfStock) {
            const outOfStockText = document.createElement("p");
            outOfStockText.textContent = "Нет в наличии";
            outOfStockText.classList.add("out-of-stock-text");
            imageContainer.appendChild(outOfStockText);
        } else {
            const image = document.createElement("img");
            image.src = product.image;
            image.alt = product.name;
            imageContainer.appendChild(image);
        }

        // Информация о товаре
        const title = document.createElement("h2");
        title.textContent = product.name;

        const description = document.createElement("p");
        description.textContent = product.description;

        const stock = document.createElement("p");
        stock.textContent = isOutOfStock ? "Нет в наличии" : `В наличии: ${product.stock} шт.`;

        const price = document.createElement("p");
        price.classList.add("price");
        price.textContent = `Цена: ${formatPrice(product.price)} руб.`;

        // Основные элементы карточки
        card.appendChild(imageContainer);
        card.appendChild(title);
        card.appendChild(description);
        card.appendChild(price);
        card.appendChild(stock);

        // Элементы управления только для товаров в наличии
        if (!isOutOfStock) {
            // Контейнер для управления количеством
            const quantityContainer = document.createElement("div");
            quantityContainer.classList.add("quantity-container");

            // Кнопка уменьшения количества
            const decreaseBtn = document.createElement("span");
            decreaseBtn.classList.add("quantity-btn", "decrease"); // Добавляем класс decrease
            decreaseBtn.title = "Уменьшить количество";

            decreaseBtn.addEventListener("click", () => {
                if (parseInt(quantityInput.value) > 1) {
                    quantityInput.value = parseInt(quantityInput.value) - 1;
                }
            });

            // Поле ввода количества
            const quantityInput = document.createElement("input");
            quantityInput.type = "number";
            quantityInput.min = 1;
            quantityInput.max = product.stock;
            quantityInput.value = 1;
            quantityInput.classList.add("quantity-input");

            quantityInput.addEventListener("input", (e) => {
                const value = parseInt(e.target.value);
                if (isNaN(value) || value < 1) {
                    e.target.value = 1;
                } else if (value > product.stock) {
                    e.target.value = product.stock;
                }
            });
            // Кнопка увеличения количества
            const increaseBtn = document.createElement("span");
            increaseBtn.classList.add("quantity-btn");
            increaseBtn.innerHTML = "+";
            increaseBtn.title = "Увеличить количество";

            increaseBtn.addEventListener("click", () => {
                if (parseInt(quantityInput.value) < product.stock) {
                    quantityInput.value = parseInt(quantityInput.value) + 1;
                }
            });

            // Добавляем элементы управления количеством
            quantityContainer.appendChild(decreaseBtn);
            quantityContainer.appendChild(quantityInput);
            quantityContainer.appendChild(increaseBtn);
            card.appendChild(quantityContainer);

            // Кнопка добавления в корзину
            const addToCartButton = document.createElement("button");
            addToCartButton.classList.add("add-to-cart-btn");

            // Проверяем, есть ли товар в корзине
            const cartItem = cart.find(item => item.id === product.id);
            if (cartItem) {
                addToCartButton.classList.add("in-cart");
                addToCartButton.innerHTML = `В корзине ${cartItem.quantity} шт.`;
            } else {
                addToCartButton.textContent = "Добавить в корзину";
            }

            addToCartButton.addEventListener("click", () => {
                const quantity = parseInt(quantityInput.value);
                if (quantity > 0 && quantity <= product.stock) {
                    addToCart(product, quantity);
                    // После добавления обновляем текст кнопки
                    const updatedCartItem = cart.find(item => item.id === product.id);
                    addToCartButton.classList.add("in-cart");
                    addToCartButton.innerHTML = `В корзине ${updatedCartItem.quantity} шт.`;
                } else {
                    showToast("Укажите корректное количество.");
                }
            });
            card.appendChild(addToCartButton);
        }

        productsContainer.appendChild(card);
    });
}

// Функция для обновления состояния кнопки
function updateCartButtonState(productId) {
    const button = document.querySelector(`.add-to-cart-btn[data-product-id="${productId}"]`);
    if (!button) return;

    const product = products.find(p => p.id === productId);
    const inCart = cart.some(item => item.id === productId);

    if (product.stock <= 0) {
        button.textContent = "Нет в наличии";
        button.classList.add('out-of-stock');
        button.disabled = true;
    } else if (inCart) {
        button.textContent = "В корзине";
        button.classList.add('in-cart');
        button.disabled = false;
    } else {
        button.textContent = "Добавить в корзину";
        button.classList.remove('in-cart', 'out-of-stock');
        button.disabled = false;
    }
}


//Добавление товара в корзину
function addToCart(product, quantity) {
    if (quantity > product.stock) {
        showToast("Недостаточно товара на складе.");
        return;
    }

    // Проверяем, есть ли товар уже в корзине по ID
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        // Если товар уже есть в корзине, увеличиваем его количество
        const newQuantity = existingItem.quantity + quantity;

        // Проверяем, не превышает ли новое количество доступный запас
        if (newQuantity > product.stock) {
            showToast("Недостаточно товара на складе.");
            return;
        }

        existingItem.quantity = newQuantity; // Обновляем количество
    } else {
        // Если товара нет в корзине, добавляем его
        cart.push({
            id: product.id, // Уникальный идентификатор
            name: product.name,
            description: product.description,
            price: product.price,
            quantity: quantity,
            stock: product.stock, // Сохраняем stock
        });
    }

    saveCart(); // Сохраняем корзину
    renderCartButton(); // Обновляем кнопку корзины
    updateCartButtonState(product.id); // Обновляем состояние кнопки
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
        });
    } else {
        // Если корзина пуста, скрываем кнопку
        cartButton.classList.add("hidden");
    }
}

// Удаление товара из корзины
function removeFromCart(index) {
    // Сохраняем ID товара перед удалением (если нужно)
    const removedProductId = cart[index]?.id;

    cart.splice(index, 1); // Удаляем товар из массива по индексу
    saveCart(); // Сохраняем корзину в localStorage
    renderCartItems(); // Обновляем отображение корзины
    renderCartButton(); // Обновляем кнопку корзины

    //Обновить состояние конкретной кнопки товара
    if (removedProductId) {
        updateCartButtonState(removedProductId);
    }

    // Перерисовываем товары, чтобы обновить все кнопки
    renderProducts(currentCategory, currentBrand);
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

        // Отображаем информацию о товаре с кнопками +/-
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <span>${item.name} - ${formatPrice(item.price)} руб. x ${item.quantity} = ${formatPrice(item.price * item.quantity)} руб.</span>
                <p>${item.description}</p>
            </div>
            <div class="cart-item-controls">
                <div class="cart-quantity-controls">
                    <span class="cart-quantity-btn decrease" data-index="${index}">-</span>
                    <input type="number" class="cart-quantity" value="${item.quantity}" min="1" max="${item.stock}" data-index="${index}">
                    <span class="cart-quantity-btn increase" data-index="${index}">+</span>
                </div>
                <span class="remove-item" data-index="${index}">&times;</span>
            </div>
        `;

        cartItems.appendChild(cartItem);
        total += item.price * item.quantity;
    });

    // Добавляем обработчики для кнопок +/-
    document.querySelectorAll(".cart-quantity-btn.decrease").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const index = e.target.getAttribute("data-index");
            if (cart[index].quantity > 1) {
                cart[index].quantity--;
                saveCart();
                renderCartItems();
                renderProducts(currentCategory, currentBrand);
            }
        });
    });

    document.querySelectorAll(".cart-quantity-btn.increase").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const index = e.target.getAttribute("data-index");
            if (cart[index].quantity < cart[index].stock) {
                cart[index].quantity++;
                saveCart();
                renderCartItems();
                renderProducts(currentCategory, currentBrand);
            } else {
                showToast("Недостаточно товара на складе");
            }
        });
    });

    // Обработчики для прямого ввода количества (оставляем как было)
    document.querySelectorAll(".cart-quantity").forEach(input => {
        input.addEventListener("change", (e) => {
            const index = e.target.getAttribute("data-index");
            const newQuantity = parseInt(e.target.value);
            const maxStock = cart[index].stock;

            if (newQuantity > 0 && newQuantity <= maxStock) {
                cart[index].quantity = newQuantity;
                saveCart();
                renderCartItems();
                renderProducts(currentCategory, currentBrand);
            } else {
                showToast("Недостаточно товара на складе.");
                e.target.value = cart[index].quantity;
            }
        });
    });

    // Удаление товара из корзины
    document.querySelectorAll(".remove-item").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const index = e.target.getAttribute("data-index");
            cart.splice(index, 1); // Удаляем товар из корзины
            saveCart();
            renderCartItems();
            renderCartButton();
            renderProducts(currentCategory, currentBrand);
        });
    });

    // Добавляем общую сумму
    const totalElement = document.createElement("div");
    totalElement.classList.add("cart-total");
    totalElement.textContent = `Итого: ${formatPrice(total)} руб.`;
    cartItems.appendChild(totalElement);
}

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

        userChatId = userData.id; // Получаем chat_id пользователя
        tgUsername = userData.username || userData.first_name || "Не указан";

        // Отправляем POST-запрос для проверки, является ли пользователь админом
        fetch('https://tabachoook.ru/check-admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: userData.username }),
        })
            .then(response => response.json())
            .then(data => {
                const adminLoginButton = document.getElementById("admin-login");
                if (data.isAdmin) {
                    adminLoginButton.style.display = "block"; // Показываем кнопку
                } else {
                    adminLoginButton.style.display = "none"; // Скрываем кнопку
                }
            })
            .catch(error => {
                console.error('Ошибка при проверке доступа:', error);
            });
    } else {
        console.error('Данные пользователя отсутствуют в initDataUnsafe');
    }
} else {
    console.error('Telegram.WebApp недоступен');
}

const adminLoginButton = document.getElementById('admin-login');

adminLoginButton.addEventListener('click', () => {
    // Переключаем видимость админ-панели
    document.getElementById("admin-panel").classList.toggle("hidden");
    // Переключаем видимость списка товаров (если нужно)
    document.getElementById("toggle-product-list").classList.toggle("hidden");
});

// маска для номера длины
document.getElementById('pickup-phone').addEventListener('input', function (e) {
    let x = e.target.value.replace(/\D/g, '').match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
    e.target.value = !x[1] ? ''
        : '+7'
        + (x[2] ? ' (' + x[2] : '')
        + (x[3] ? ') ' + x[3] : '')
        + (x[4] ? '-' + x[4] : '')
        + (x[5] ? '-' + x[5] : '');
});

// При фокусе - если поле пустое, ставим +7
document.getElementById('pickup-phone').addEventListener('focus', function (e) {
    if (!e.target.value) {
        e.target.value = '+7';
    }
});
//
// Единый обработчик для всех полей
['pickup-name', 'pickup-phone'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateSubmitButton);
});

// Флаги для отслеживания взаимодействия с полями
const fieldTouched = {
    name: false,
    phone: false
};

// Обработчики потери фокуса (blur) — поле было затронуто
document.getElementById('pickup-name').addEventListener('blur', function () {
    fieldTouched.name = true;
    updateSubmitButton();
});

document.getElementById('pickup-phone').addEventListener('blur', function () {
    fieldTouched.phone = true;
    updateSubmitButton();
});

// Основная функция валидации
function updateSubmitButton() {
    const name = document.getElementById('pickup-name').value.trim();
    const phone = document.getElementById('pickup-phone').value;

    const isNameValid = name.length >= 2;
    const isPhoneValid = phone.match(/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/);
    const isCartValid = cart.length > 0;

    // Подсветка полей
    const nameField = document.getElementById('pickup-name');
    const phoneField = document.getElementById('pickup-phone');

    // Для поля имени (подсвечиваем только если было затронуто)
    if (fieldTouched.name) {
        nameField.style.borderColor = isNameValid ? '#4CAF50' : 'red';
    } else {
        nameField.style.borderColor = ''; // Стандартный цвет
    }

    // Для поля телефона (подсвечиваем только если было затронуто)
    if (fieldTouched.phone) {
        phoneField.style.borderColor = isPhoneValid ? '#4CAF50' : 'red';
    } else {
        phoneField.style.borderColor = ''; // Стандартный цвет
    }

    // Обновляем кнопку
    const submitButton = document.getElementById('submit-button');
    submitButton.disabled = !(isNameValid && isPhoneValid && isCartValid);
    submitButton.style.opacity = submitButton.disabled ? '0.6' : '1';
}

// Обработчик для подсчета символов
document.getElementById('order-comment').addEventListener('input', function (e) {
    const comment = e.target.value;
    const counter = document.getElementById('comment-counter');

    counter.textContent = comment.length; // Просто обновляем счётчик
});

// Оформление самовывоза
document.getElementById("pickup-form").addEventListener("submit", async (e) => {
    e.preventDefault(); // Отменяем стандартное поведение формы
        document.activeElement.blur();

    const submitButton = document.getElementById("submit-button"); // Предположим, у кнопки есть id="submit-button"
    const spinner = document.createElement("span"); // Создаем элемент для спиннера
    spinner.className = "spinner"; // Добавляем класс для стилизации спиннера

    // Проверяем, не заблокирована ли кнопка
    if (submitButton.disabled) {
        showToast("Пожалуйста, подождите 3 секунды перед повторной отправкой.");
        return;
    }

    submitButton.disabled = true; // Блокируем кнопку
    submitButton.appendChild(spinner); // Добавляем спиннер на кнопку

    if (cart.length === 0) {
        showToast("Ваша корзина пуста. Добавьте товары перед оформлением заказа.");
        submitButton.disabled = false; // Разблокируем кнопку
        spinner.remove(); // Убираем спиннер
        return; // Прерываем выполнение функции
    }

    const name = document.getElementById("pickup-name").value; // Имя пользователя
    const phone = document.getElementById("pickup-phone").value; // Телефон пользователя
    const comment = document.getElementById("order-comment").value;

    let tgUsername = "Не указан"; // Значение по умолчанию

    if (typeof Telegram !== 'undefined' && Telegram.WebApp && Telegram.WebApp.initDataUnsafe && Telegram.WebApp.initDataUnsafe.user) {
        tgUsername = Telegram.WebApp.initDataUnsafe.user.username || "Не указан";
    }

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
            price: formatPrice(item.price),
            quantity: item.quantity, // Добавляем количество
        })),
        total: formatPrice(total), // Общая сумма заказа
        userChatId,
        comment,
    };

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
            showToast(`Спасибо, ${name}! Ваш заказ оформлен. Мы свяжемся с вами по номеру ${phone}.`);
            cart = [];
            saveCart(); // Сохраняем корзину
            renderCartButton(); // Обновляем кнопку корзины
            document.getElementById("cart-modal").style.display = "none"; // Скрываем корзину
        } else {
            showToast("Ошибка при оформлении заказа. Попробуйте ещё раз.");
        }
    } catch (error) {
        console.error("Ошибка:", error);
        showToast("Произошла ошибка при отправке данных.");
    } finally {
        // Устанавливаем задержку в 3 секунды перед разблокировкой кнопки
        setTimeout(() => {
            submitButton.disabled = false; // Разблокируем кнопку
            spinner.remove(); // Убираем спиннер
        }, 3000); // 3000 мс = 3 секунды
    }
});

//Закрытие клавиатуры
document.addEventListener('click', function (event) {
    // 1. Оптимизированный список исключений
    const keepKeyboardOpen = [
        'input:not([type=submit])',  // Исключаем submit-кнопки
        'textarea',
        'select',
        '[contenteditable="true"]',
        '.keep-keyboard-open'  // Кастомный класс для исключений
    ];

    // 2. Быстрая проверка через closest()
    if (!event.target.closest(keepKeyboardOpen.join(','))) {
        // 3. Оптимизированная проверка активного элемента
        requestAnimationFrame(() => {
            const active = document.activeElement;
            const inputTypes = ['INPUT', 'TEXTAREA', 'SELECT'];

            if (active && inputTypes.includes(active.tagName)) {
                // 4. Дополнительная проверка для contenteditable
                if (active.hasAttribute('contenteditable')) {
                    active.blur();
                } else if (!active.disabled && !active.readOnly) {
                    active.blur();
                }
            }
        });
    }
});

let sortDirection = {
    price: "asc", // Направление сортировки по цене
    name: "asc"   // Направление сортировки по названию
};

// Сортировка товаров
function sortProducts(key, direction = "asc") {
    const productsContainer = document.getElementById("products");
    const productCards = Array.from(productsContainer.children);

    productCards.sort((a, b) => {
        if (key === "price") {
            // Функция для извлечения числа из форматированной цены
            const extractPrice = (element) => {
                const priceText = element.querySelector(".price").textContent;
                // Удаляем всё, кроме цифр и запятых/точек (для десятичных цен)
                const numberString = priceText
                    .replace(/[^\d,.]/g, '')  // Оставляем только цифры, запятые и точки
                    .replace(',', '.');        // Меняем запятую на точку (если есть)
                return parseFloat(numberString) || 0; // Если что-то пошло не так, вернём 0
            };

            const aPrice = extractPrice(a);
            const bPrice = extractPrice(b);

            return direction === "asc" ? aPrice - bPrice : bPrice - aPrice;
        } else {
            // Сортировка по названию (оставляем без изменений)
            const aValue = a.querySelector("h2").textContent;
            const bValue = b.querySelector("h2").textContent;
            return direction === "asc"
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }
    });

    // Перерисовываем товары
    productsContainer.innerHTML = "";
    productCards.forEach(card => productsContainer.appendChild(card));
}

// Переключение направления сортировки
function toggleSortDirection(key) {
    sortDirection[key] = sortDirection[key] === "asc" ? "desc" : "asc"; // Переключаем направление
    return sortDirection[key];
}

// Рендер кнопок сортировки
function renderSortButtons(show = false) {
    const sortContainer = document.getElementById("sort-buttons");
    sortContainer.innerHTML = ""; // Очищаем контейнер

    // Показываем кнопки только если show = true
    if (!show) {
        sortContainer.style.display = "none";
        return;
    }

    sortContainer.style.display = "flex"; // Показываем контейнер

    const sortByNameButton = document.createElement("button");
    sortByNameButton.textContent = `Сортировать по названию ${sortDirection.name === "asc" ? "▲" : "▼"}`;
    sortByNameButton.addEventListener("click", () => {
        const direction = toggleSortDirection("name"); // Переключаем направление
        sortProducts("name", direction); // Сортируем по названию
        renderSortButtons(true); // Обновляем кнопки
    });

    const sortByPriceButton = document.createElement("button");
    sortByPriceButton.textContent = `Сортировать по цене ${sortDirection.price === "asc" ? "▲" : "▼"}`;
    sortByPriceButton.addEventListener("click", () => {
        const direction = toggleSortDirection("price"); // Переключаем направление
        sortProducts("price", direction); // Сортируем по цене
        renderSortButtons(true); // Обновляем кнопки
    });

    sortContainer.appendChild(sortByNameButton);
    sortContainer.appendChild(sortByPriceButton);
}

// Загрузка данных с Telegram
async function loadTelegramData() {
    return new Promise((resolve, reject) => {
        try {
            Telegram.WebApp.ready(); // Инициализация Telegram Web App
            console.log('Данные Telegram загружены');
            resolve();
        } catch (error) {
            console.error('Ошибка при загрузке данных Telegram:', error);
            reject(error);
        }
    });
}

// Загрузка данных с сервера
async function loadProduct() {
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
            console.log('Товары загружены с сервера:', data);
        } else {
            console.error('Ошибка при загрузке товаров:', response.status, response.statusText);
            throw new Error('Ошибка при загрузке товаров');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        throw error;
    }
}

function showToast(message) {
    // Создаем блокирующий оверлей
    const overlay = document.createElement('div');
    overlay.className = 'toast-overlay';

    // Ваш существующий код toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <span>${message}</span>
        <button class="toast-close-btn">OK</button>
    `;

    // Добавляем элементы в DOM
    document.body.appendChild(overlay);
    overlay.appendChild(toast);

    // Показываем с анимацией
    setTimeout(() => {
        overlay.classList.add('show');
        toast.classList.add('show');
    }, 10);

    // Обработчик закрытия
    toast.querySelector('.toast-close-btn').addEventListener('click', () => {
        overlay.classList.remove('show');
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
            overlay.remove();
        }, 300);
    });
}

// Функция для создания звёзд фона сайта
function createBackgroundStars() {
    const starsContainer = document.getElementById('background-stars');
    const numStars = 60; // Уменьшенное количество звёзд
    const starColors = ['#ffffff', '#aaf', '#ffa', '#f90', '#f00'];

    // Получаем размеры документа
    const documentWidth = document.documentElement.scrollWidth;
    const documentHeight = document.documentElement.scrollHeight;

    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        // Случайное положение в пределах документа
        const x = Math.random() * documentWidth;
        const y = Math.random() * documentHeight;
        star.style.left = `${x}px`;
        star.style.top = `${y}px`;

        // Случайный цвет
        const color = starColors[Math.floor(Math.random() * starColors.length)];
        star.style.backgroundColor = color;
        star.style.boxShadow = `0 0 5px ${color}, 0 0 10px ${color}`;

        // Случайная задержка анимации
        const delay = Math.random() * 2;
        star.style.animationDelay = `${delay}s`;

        // Случайное движение
        const moveX = (Math.random() - 0.5) * 200;
        const moveY = (Math.random() - 0.5) * 200;
        star.style.animation = `moveStar ${5 + Math.random() * 10}s linear infinite alternate`;

        starsContainer.appendChild(star);
    }
}

// Инициализация
document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById('loader');
    const progressElement = document.querySelector('.progress');
    const mainContent = document.getElementById('main-content');
    const starsContainer = document.getElementById('loader-stars');

    // Создаём звёзды
    const numStars = 50; // Количество звёзд
    const starColors = ['#ffffff', '#aaf', '#ffa', '#f90', '#f00']; // Белый, голубой, жёлтый, оранжевый, красный

    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        // Случайное положение
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;

        // Случайный цвет
        const color = starColors[Math.floor(Math.random() * starColors.length)];
        star.style.backgroundColor = color;
        star.style.boxShadow = `0 0 5px ${color}, 0 0 10px ${color}`;

        // Случайная задержка анимации
        const delay = Math.random() * 2;
        star.style.animationDelay = `${delay}s`;

        // Случайное движение
        const moveX = (Math.random() - 0.5) * 200; // Случайное смещение по X
        const moveY = (Math.random() - 0.5) * 200; // Случайное смещение по Y
        star.style.animation = `moveStar ${5 + Math.random() * 10}s linear infinite alternate`;

        starsContainer.appendChild(star);
    }

    // Функция для обновления прогресса
    function updateProgress(progress) {
        progressElement.textContent = `${Math.round(progress)}%`;
    }

    // Функция для плавного увеличения прогресса
    function animateProgress(targetPercent, duration) {
        return new Promise((resolve) => {
            const startTime = performance.now();
            const startPercent = parseFloat(progressElement.textContent);

            function step(currentTime) {
                const elapsedTime = currentTime - startTime;
                const progress = Math.min(elapsedTime / duration, 1);
                const currentPercent = startPercent + (targetPercent - startPercent) * progress;

                updateProgress(currentPercent);

                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    resolve();
                }
            }

            requestAnimationFrame(step);
        });
    }

    // Функция для завершения загрузки
    function completeLoading() {
        // Плавное исчезновение загрузчика
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
            mainContent.classList.remove('hidden'); // Показать основной контент

            // Вызов функций после завершения загрузки
            showAgeVerification(); // Показываем окно подтверждения возраста
            loadCart(); // Загружаем корзину из localStorage
            renderCategories(); // Рендерим категории
            renderSortButtons(); // Рендерим кнопки сортировки
            createBackgroundStars();//фон сайта
            updateSubmitButton();//Обновление кнопки оформления заказа
            // Скрываем корзину при загрузке страницы
            const cartModal = document.getElementById("cart-modal");
            cartModal.style.display = "none";
        }, 500); // Задержка для завершения анимации opacity
    }

    // Функция для исчезновения звёзд
    function fadeOutStars() {
        const stars = document.querySelectorAll('.star');
        let starsRemaining = stars.length; // Счётчик оставшихся звёзд

        stars.forEach((star, index) => {
            setTimeout(() => {
                // Останавливаем анимацию движения
                star.style.animation = 'none';

                // Добавляем класс для исчезновения
                star.classList.add('fade-out');

                // Обрабатываем завершение анимации
                const handleAnimationEnd = () => {
                    star.remove(); // Удаляем звезду из DOM после завершения анимации
                    starsRemaining--; // Уменьшаем счётчик оставшихся звёзд

                    // Если все звёзды исчезли, завершаем загрузку
                    if (starsRemaining === 0) {
                        completeLoading(); // Завершаем загрузку после исчезновения всех звёзд
                    }

                    // Удаляем обработчик события после завершения
                    star.removeEventListener('animationend', handleAnimationEnd);
                };

                // Добавляем обработчик события animationend
                star.addEventListener('animationend', handleAnimationEnd);
            }, index * 50); // Задержка для каждой звезды (50 мс между звёздами)
        });
    }

    // Задержка для загрузки
    setTimeout(async () => {
        try {
            // Первая часть: загрузка данных с Telegram (0% → 50%)
            await loadTelegramData(); // Загрузка данных с Telegram
            await animateProgress(50, 1000); // Плавное увеличение до 50%

            // Вторая часть: загрузка данных с сервера (50% → 100%)
            await loadProduct(); // Загрузка данных с сервера
            await animateProgress(100, 1000); // Плавное увеличение до 100%

            // Если всё успешно, начинаем исчезновение звёзд
            fadeOutStars();
        } catch (error) {
            // В случае ошибки показываем знак бесконечности и не открываем основной сайт
            progressElement.textContent = '∞';
            console.error('Ошибка при загрузке:', error);
            showToast('Ошибка загрузки данных с сервера. Пожалуйста, попробуйте позже.');
        }
    }, 1000); // Время загрузки в миллисекундах (3995 секунд)
});
