/**
 * GRIFA GAMES - Core Store Logic (Fixed & Cleaned)
 */

// --- Global Actions & Routing ---
function logout() {
    if (typeof firebase !== 'undefined') {
        firebase.auth().signOut().then(() => {
            localStorage.removeItem('grifa_user');
            window.location.reload();
        });
    } else {
        localStorage.removeItem('grifa_user');
        window.location.reload();
    }
}

function goToCheckout() {
    if (!localStorage.getItem('grifa_user')) {
        window.location.href = 'login.html';
    } else {
        window.location.href = 'checkout.html';
    }
}

function scrollToProducts() {
    const el = document.getElementById('products');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function toggleModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('show');
}

// --- Translations ---
const translations = {
    ar: {
        store_title: "GRIFA GAMES | متجر الألعاب الأول",
        home: "الرئيسية",
        shop: "المتجر",
        track: "تتبع طلباتي",
        search_placeholder: "ابحث عن لعبة...",
        best_sellers: "الألعاب الأكثر مبيعاً",
        sections: "الأقسام",
        categories: {
            "PlayStation": "بلايستيشن",
            "Xbox": "إكس بوكس",
            "Nintendo": "نينتندو",
            "Gift Cards": "بطاقات شحن",
            "PC Games": "ألعاب PC",
            "Subscriptions": "اشتراكات"
        },
        cart_empty: "السلة فارغة",
        add_to_cart: "إضافة للسلة",
        track_modal_title: "تتبع طلباتك",
        track_modal_desc: "أدخل بريدك الإلكتروني لمشاهدة جميع طلباتك وحالتها",
        order_email_placeholder: "بريدك الإلكتروني (test@example.com)",
        track_btn: "تتبع",
        footer_desc: "متجرك الموثوق للحصول على أكواد الألعاب والخدمات الرقمية بأسرع وقت وأقل سعر.",
        quick_links: "روابط سريعة",
        terms: "الشروط والأحكام",
        privacy: "سياسة الخصوصية",
        support: "الدعم الفني",
        follow_us: "تابعنا",
        rights: "جميع الحقوق محفوظة.",
        checkout_title: "إتمام الطلب",
        currency: "دج",
        notif_added: "تمت إضافة المنتج إلى السلة",
        notif_search_empty: "لم يتم العثور على نتائج للبحث",
        status_pending: "قيد الانتظار",
        status_processing: "جاري التجهيز",
        status_shipped: "تم الشحن",
        status_completed: "اكتمل"
    },
    en: {
        store_title: "GRIFA GAMES | #1 Game Store",
        home: "Home",
        shop: "Shop",
        track: "My Orders",
        search_placeholder: "Search for a game...",
        best_sellers: "Best Sellers",
        sections: "Categories",
        categories: {
            "PlayStation": "PlayStation",
            "Xbox": "Xbox",
            "Nintendo": "Nintendo",
            "Gift Cards": "Gift Cards",
            "PC Games": "PC Games",
            "Subscriptions": "Subscriptions"
        },
        cart_empty: "Cart is empty",
        add_to_cart: "Add to Cart",
        track_modal_title: "Track Your Orders",
        track_modal_desc: "Enter your email to see all your orders and their status",
        order_email_placeholder: "Your Email (test@example.com)",
        track_btn: "Track",
        footer_desc: "Your trusted store for game codes and digital services at the best prices.",
        quick_links: "Quick Links",
        terms: "Terms & Conditions",
        privacy: "Privacy Policy",
        support: "Technical Support",
        follow_us: "Follow Us",
        rights: "All rights reserved.",
        checkout_title: "Complete Order",
        currency: "DZD",
        notif_added: "Product added to cart",
        notif_search_empty: "No results found for your search",
        status_pending: "Pending",
        status_processing: "Processing",
        status_shipped: "Shipped",
        status_completed: "Completed"
    }
};

// --- State Management ---
let currentState = {
    lang: localStorage.getItem('grifa_lang') || 'ar',
    theme: localStorage.getItem('grifa_theme') || 'dark',
    products: JSON.parse(localStorage.getItem('grifa_products')) || [],
    banners: JSON.parse(localStorage.getItem('grifa_banners')) || [],
    categories: [
        { name: "PlayStation", icon: "fa-brands fa-playstation" },
        { name: "Xbox", icon: "fa-brands fa-xbox" },
        { name: "Nintendo", icon: "fa-solid fa-gamepad" },
        { name: "Gift Cards", icon: "fa-solid fa-wallet" },
        { name: "PC Games", icon: "fa-solid fa-desktop" },
        { name: "Subscriptions", icon: "fa-solid fa-key" }
    ],
    cart: JSON.parse(localStorage.getItem('grifa_cart')) || [],
    activeCategory: 'all',
    searchQuery: '',
    currentSlide: 0
};

// --- Notifications ---
const notifier = {
    show(msg, type = 'info') {
        const container = document.getElementById('notifications-container');
        if (!container) return;
        const div = document.createElement('div');
        div.className = `notification ${type}`;
        const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
        div.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${msg}</span>`;
        container.appendChild(div);
        setTimeout(() => div.classList.add('show'), 10);
        setTimeout(() => {
            div.classList.remove('show');
            setTimeout(() => div.remove(), 400);
        }, 3000);
    }
};

// --- Core Rendering ---
function renderUI() {
    renderBanners();
    renderCategories();
    renderProducts();
    updateThemeIcon();
}

function renderBanners() {
    const slider = document.getElementById('banner-slider');
    const dots = document.getElementById('slider-dots');
    if (!slider || !dots || currentState.banners.length === 0) return;

    slider.innerHTML = currentState.banners.map(b => `
        <div class="slide" style="background-image: url('${b.img}')">
            <div class="slide-content">
                <h2>${b.title}</h2>
                <p>${b.desc}</p>
                <button class="btn-primary" onclick="scrollToProducts()">${translations[currentState.lang].shop}</button>
            </div>
        </div>
    `).join('');

    dots.innerHTML = currentState.banners.map((_, i) => `
        <div class="dot ${i === currentState.currentSlide ? 'active' : ''}" onclick="goToSlide(${i})"></div>
    `).join('');
}

function renderCategories() {
    const container = document.getElementById('categories-list');
    if (!container) return;
    const t = translations[currentState.lang];

    container.innerHTML = currentState.categories.map(cat => `
        <div class="category-card ${currentState.activeCategory === cat.name ? 'active' : ''}" onclick="setCategory('${cat.name}')">
            <i class="${cat.icon}"></i>
            <h3>${t.categories[cat.name]}</h3>
        </div>
    `).join('');
}

function renderProducts() {
    const container = document.getElementById('products-list');
    if (!container) return;

    const filtered = currentState.products.filter(p => {
        const matchesCat = currentState.activeCategory === 'all' || p.cat === currentState.activeCategory;
        const matchesSearch = p.name.toLowerCase().includes(currentState.searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
    });

    if (filtered.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center;">${translations[currentState.lang].notif_search_empty}</p>`;
        return;
    }

    container.innerHTML = filtered.map(p => `
        <div class="product-card">
            <div class="product-img" style="background-image: url('${p.img}')"></div>
            <div class="product-info">
                <h3>${p.name}</h3>
                <div class="price">${p.price} ${translations[currentState.lang].currency}</div>
                <button class="btn-primary" onclick="addToCart(${p.id})">${translations[currentState.lang].add_to_cart}</button>
            </div>
        </div>
    `).join('');
}

// --- Interaction Logic ---
function moveSlide(dir) {
    currentState.currentSlide -= dir;
    if (currentState.currentSlide < 0) currentState.currentSlide = currentState.banners.length - 1;
    if (currentState.currentSlide >= currentState.banners.length) currentState.currentSlide = 0;
    updateSlider();
}

function goToSlide(i) {
    currentState.currentSlide = i;
    updateSlider();
}

function updateSlider() {
    const slider = document.getElementById('banner-slider');
    const dirMult = document.documentElement.dir === 'rtl' ? 1 : -1;
    slider.style.transform = `translateX(${currentState.currentSlide * 100 * dirMult}%)`;
    renderBanners();
}

function setCategory(cat) {
    currentState.activeCategory = currentState.activeCategory === cat ? 'all' : cat;
    renderCategories();
    renderProducts();
}

function handleSearch(e) {
    currentState.searchQuery = e.target.value;
    renderProducts();
}

function addToCart(id) {
    const product = currentState.products.find(p => p.id === id);
    currentState.cart.push(product);
    localStorage.setItem('grifa_cart', JSON.stringify(currentState.cart));

    updateCartBadge();
    notifier.show(translations[currentState.lang].notif_added, 'success');
}

function updateCartBadge() {
    const badge = document.querySelector('.cart-count');
    if (badge) badge.textContent = currentState.cart.length;
}

function trackOrder() {
    const email = document.getElementById('order-id-input')?.value.trim();
    if (!email) return notifier.show(currentState.lang === 'ar' ? "يرجى إدخال البريد" : "Please enter email", "error");

    const orders = JSON.parse(localStorage.getItem('grifa_orders')) || [];
    const userOrders = orders.filter(o => o.phone === email || o.email === email);

    const resultDiv = document.getElementById('tracking-result');
    if (!resultDiv) return;

    if (userOrders.length > 0) {
        resultDiv.innerHTML = userOrders.map(o => `
            <div class="status-card" style="background:var(--bg-dark); padding:15px; border-radius:8px; margin-bottom:10px; border:1px solid var(--border-color)">
                <p><strong>${o.id}</strong> - ${o.items[0].name}</p>
                <p><span class="status-tag ${o.status}">${translations[currentState.lang]['status_' + o.status]}</span></p>
            </div>
        `).join('');
    } else {
        resultDiv.innerHTML = `<p style="color:var(--error)">${currentState.lang === 'ar' ? "لا توجد طلبات لهذا البريد" : "No orders found."}</p>`;
    }
}

// --- Theme & Lang ---
function toggleTheme() {
    currentState.theme = currentState.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentState.theme);
    localStorage.setItem('grifa_theme', currentState.theme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = document.querySelector('#theme-toggle i');
    if (icon) icon.className = currentState.theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

function toggleLang() {
    currentState.lang = currentState.lang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('grifa_lang', currentState.lang);
    applyLang();
}

function applyLang() {
    const t = translations[currentState.lang];
    document.documentElement.lang = currentState.lang;
    document.documentElement.dir = currentState.lang === 'ar' ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) el.placeholder = t[key];
    });

    renderUI();
}

// --- Bootstrap ---
document.addEventListener('DOMContentLoaded', () => {
    // Initial Data
    if (currentState.products.length === 0) {
        currentState.products = [
            { id: 1, name: "PlayStation Store $50 Card", price: 12500, cat: "PlayStation", img: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=400" },
            { id: 2, name: "Elden Ring Digital Key", price: 8500, cat: "PC Games", img: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&q=80&w=400" },
            { id: 3, name: "Xbox Game Pass 3 Months", price: 4500, cat: "Xbox", img: "https://images.unsplash.com/photo-1605902711622-cfb43c443ffb?auto=format&fit=crop&q=80&w=400" },
            { id: 4, name: "Roblox Gift Card 2000 Robux", price: 3200, cat: "Gift Cards", img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400" }
        ];
        localStorage.setItem('grifa_products', JSON.stringify(currentState.products));
    }
    if (currentState.banners.length === 0) {
        currentState.banners = [
            { title: "اكتشف عالم الألعاب مع GRIFA", desc: "أفضل العروض والرموز الرقمية في مكان واحد", img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200" },
            { title: "بطاقات بلايستيشن و إكس بوكس", desc: "شحن فوري ومضمون لجميع الحسابات", img: "https://images.unsplash.com/photo-1605902711622-cfb43c443ffb?auto=format&fit=crop&q=80&w=1200" }
        ];
        localStorage.setItem('grifa_banners', JSON.stringify(currentState.banners));
    }

    document.documentElement.setAttribute('data-theme', currentState.theme);
    applyLang();
    updateCartBadge();

    updateCartBadge();

    // Check for user
    const user = JSON.parse(localStorage.getItem('grifa_user'));
    if (user) {
        const loginLink = document.getElementById('login-link');
        const userName = document.getElementById('user-name');
        const logoutBtn = document.getElementById('logout-btn');
        if (loginLink) loginLink.style.display = 'none';
        if (userName) {
            userName.style.display = 'block';
            userName.textContent = user.displayName || user.email.split('@')[0];
        }
        if (logoutBtn) logoutBtn.style.display = 'block';
    }
});

/**
 * Shared Email System (EmailJS)
 */
function sendOrderEmail(order) {
    // Configuration for EmailJS
    const SERVICE_ID = "service_xqo6ncm";
    const TEMPLATE_ID = "template_ga2xcxo";
    const PUBLIC_KEY = "UZ-a_H3ZJRVRA5_Ob";

    if (typeof emailjs === 'undefined') {
        console.error("EmailJS SDK not loaded!");
        return;
    }

    emailjs.init(PUBLIC_KEY);

    const templateParams = {
        order_id: order.id,
        customer_name: order.name,
        customer_email: order.email,
        total_amount: order.total + " دج",
        items: order.items.map(i => `${i.name} (${i.delivery || 'جاري المعالجة'})`).join(', '),
        ccp_account: order.ccp_dest || "00799999002764092903",
        from_email: "oussamachorba8@gmail.com"
    };

    if (typeof notifier !== 'undefined') {
        notifier.show("جاري إرسال تفاصيل الطلب إلى الإيميل...", "info");
    }

    emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams)
        .then(() => {
            if (typeof notifier !== 'undefined') {
                notifier.show("تم إرسال الإيميل بنجاح!", "success");
            }
        }, (error) => {
            console.error("EmailJS Error:", error);
            if (typeof notifier !== 'undefined') {
                notifier.show("فشل إرسال الإيميل، لكن الطلب محفوظ في النظام.", "error");
            }
        });
}
