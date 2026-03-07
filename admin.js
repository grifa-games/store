/**
 * GRIFA ADMIN - Full Functional Logic
 */

let products = JSON.parse(localStorage.getItem('grifa_products')) || [];
let orders = JSON.parse(localStorage.getItem('grifa_orders')) || [];
let banners = JSON.parse(localStorage.getItem('grifa_banners')) || [];
let coupons = JSON.parse(localStorage.getItem('grifa_coupons')) || [];

// --- Security ---
const ADMIN_CODE = "1962684120112026";

function checkAdminAccess() {
    const input = document.getElementById('admin-passcode-input').value.trim();
    const error = document.getElementById('admin-login-error');
    const overlay = document.getElementById('admin-login-overlay');

    if (input === ADMIN_CODE) {
        overlay.classList.remove('show');
        overlay.style.setProperty('display', 'none', 'important');
        sessionStorage.setItem('grifa_admin_authenticated', 'true');
        initAdmin();
    } else {
        error.style.display = 'block';
        setTimeout(() => { error.style.display = 'none'; }, 2000);
    }
}

// Check on load
document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('grifa_admin_authenticated') === 'true') {
        const overlay = document.getElementById('admin-login-overlay');
        if (overlay) {
            overlay.classList.remove('show');
            overlay.style.setProperty('display', 'none', 'important');
        }
        initAdmin();
    }
});

// --- Tab Management ---
function switchTab(tabId, el) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));

    const targetTab = document.getElementById(tabId + '-tab');
    if (targetTab) targetTab.classList.add('active');
    if (el) el.classList.add('active');

    if (tabId === 'messages') {
        initAdminChatList();
    }
}

// --- Stats ---
function renderStats() {
    const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;

    const statElements = document.querySelectorAll('.stat-card p');
    if (statElements.length >= 3) {
        statElements[0].textContent = totalSales.toLocaleString() + ' دج';
        statElements[1].textContent = pendingOrders;
        statElements[2].textContent = products.length;
    }
}

// --- Product Management ---
function renderProductsTable() {
    const table = document.getElementById('admin-products-table');
    if (!table) return;

    table.innerHTML = products.map((p, i) => `
        <tr>
            <td>${p.name}</td>
            <td>${p.cat}</td>
            <td>${p.price} دج</td>
            <td>${p.stock || '∞'}</td>
            <td>
                <button class="action-btn delete" onclick="deleteProduct(${p.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function openAddProductModal() {
    document.getElementById('product-modal').classList.add('show');
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
}

document.getElementById('product-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const newProduct = {
        id: Date.now(),
        name: e.target.elements[0].value,
        desc: e.target.elements[1].value,
        price: parseFloat(e.target.elements[2].value),
        cat: e.target.elements[3].value,
        img: e.target.elements[4].value,
        delivery: e.target.elements[5].value
    };

    products.push(newProduct);
    localStorage.setItem('grifa_products', JSON.stringify(products));
    renderProductsTable();
    renderStats();
    closeModal();
    alert("تمت إضافة المنتج بنجاح مع بيانات التسليم!");
});

function deleteProduct(id) {
    if (confirm("هل أنت متأكد من حذف المنتج؟")) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem('grifa_products', JSON.stringify(products));
        renderProductsTable();
        renderStats();
    }
}

// --- Order Management ---
function renderOrdersTable() {
    const table = document.getElementById('admin-orders-table');
    if (!table) return;

    table.innerHTML = orders.map(o => `
        <tr>
            <td>${o.id}</td>
            <td>${o.name} <br> <small>${o.phone}</small></td>
            <td>${o.total || 0} دج</td>
            <td>
                <select onchange="updateStatus('${o.id}', this.value)" style="background:var(--bg-dark); color:white; border:1px solid var(--border-color); border-radius:4px; padding:4px;">
                    <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>قيد الانتظار</option>
                    <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>جاري التجهيز</option>
                    <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>تم الشحن</option>
                    <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>اكتمل</option>
                </select>
            </td>
            <td>
                <button class="action-btn delete" onclick="deleteOrder('${o.id}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function updateStatus(id, status) {
    orders = orders.map(o => o.id === id ? { ...o, status } : o);
    localStorage.setItem('grifa_orders', JSON.stringify(orders));
    renderStats();
}

function deleteOrder(id) {
    if (confirm("حذف الطلب؟")) {
        orders = orders.filter(o => o.id !== id);
        localStorage.setItem('grifa_orders', JSON.stringify(orders));
        renderOrdersTable();
        renderStats();
    }
}

// --- Banner Management ---
function renderBannersTable() {
    const table = document.getElementById('admin-banners-table');
    if (!table) return;

    table.innerHTML = banners.map((b, i) => `
        <tr>
            <td><img src="${b.img}" style="height:40px; border-radius:4px;"></td>
            <td>${b.title}</td>
            <td>${b.desc}</td>
            <td>
                <button class="action-btn delete" onclick="deleteBanner(${i})"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function openAddBannerModal() {
    document.getElementById('banner-modal').classList.add('show');
}

document.getElementById('banner-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const newBanner = {
        title: e.target.elements[0].value,
        desc: e.target.elements[1].value,
        img: e.target.elements[2].value
    };

    banners.push(newBanner);
    localStorage.setItem('grifa_banners', JSON.stringify(banners));
    renderBannersTable();
    closeModal();
});

function deleteBanner(index) {
    banners.splice(index, 1);
    localStorage.setItem('grifa_banners', JSON.stringify(banners));
    renderBannersTable();
}

// --- Coupon Management ---
function renderCouponsTable() {
    const table = document.getElementById('admin-coupons-table');
    if (!table) return;

    table.innerHTML = coupons.map((c, i) => `
        <tr>
            <td style="font-family: 'Orbitron'; color: var(--accent);">${c.code}</td>
            <td>${c.discount}%</td>
            <td><span style="color:var(--success)">نشط</span></td>
            <td>
                <button class="action-btn delete" onclick="deleteCoupon(${i})"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function openAddCouponModal() {
    document.getElementById('coupon-modal').classList.add('show');
}

document.getElementById('coupon-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const newCoupon = {
        code: e.target.elements[0].value.toUpperCase(),
        discount: parseInt(e.target.elements[1].value)
    };

    coupons.push(newCoupon);
    localStorage.setItem('grifa_coupons', JSON.stringify(coupons));
    renderCouponsTable();
    closeModal();
});

function deleteCoupon(index) {
    coupons.splice(index, 1);
    localStorage.setItem('grifa_coupons', JSON.stringify(coupons));
    renderCouponsTable();
}

// --- Chat & Messages Management ---
let activeChatUserId = null;
let chatMessagesUnsubscribe = null;

function initAdminChatList() {
    console.log("Initializing Admin Chat List...");
    db.collection('chats').orderBy('lastTimestamp', 'desc').onSnapshot(snapshot => {
        const listContainer = document.getElementById('admin-chat-list');
        let unreadTotal = 0;

        if (snapshot.empty) {
            listContainer.innerHTML = '<p style="padding: 20px; color: #666; text-align: center;">لا يوجد محادثات نشطة</p>';
            return;
        }

        listContainer.innerHTML = snapshot.docs.map(doc => {
            const data = doc.data();
            if (data.unread) unreadTotal++;

            return `
                <div class="chat-item ${activeChatUserId === doc.id ? 'active' : ''} ${data.unread ? 'unread' : ''}" 
                     onclick="openChat('${doc.id}', '${data.userName || data.userEmail}')"
                     style="padding: 15px; border-bottom: 1px solid #222; cursor: pointer; transition: 0.3s; position: relative;">
                    <div style="font-weight: bold; margin-bottom: 5px;">${data.userName || 'مستخدم مجهول'}</div>
                    <div style="font-size: 0.8rem; color: #888; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${data.lastMessage || ''}</div>
                    ${data.unread ? '<div style="position: absolute; top: 15px; left: 15px; width: 8px; height: 8px; background: var(--error); border-radius: 50%;"></div>' : ''}
                </div>
            `;
        }).join('');

        const unreadBadge = document.getElementById('unread-count');
        if (unreadTotal > 0) {
            unreadBadge.textContent = unreadTotal;
            unreadBadge.style.display = 'flex';
        } else {
            unreadBadge.style.display = 'none';
        }
    });
}

function openChat(userId, userName) {
    activeChatUserId = userId;

    // UI Updates
    document.getElementById('active-chat-header').style.visibility = 'visible';
    document.getElementById('admin-chat-input-area').style.visibility = 'visible';
    document.getElementById('chat-user-name').textContent = userName;

    // Mark as read
    db.collection('chats').doc(userId).update({ unread: false });

    // Switch active class in list
    document.querySelectorAll('.chat-item').forEach(el => el.classList.remove('active'));

    // Listen for messages
    if (chatMessagesUnsubscribe) chatMessagesUnsubscribe();

    const messagesContainer = document.getElementById('admin-chat-messages');
    messagesContainer.innerHTML = '';

    chatMessagesUnsubscribe = db.collection('chats').doc(userId).collection('messages')
        .orderBy('timestamp', 'asc')
        .onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                    renderAdminMessage(change.doc.data());
                }
            });
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });
}

function renderAdminMessage(msg) {
    const container = document.getElementById('admin-chat-messages');
    const div = document.createElement('div');
    // Admin uses .user style for self (green), .admin for user (gray)
    div.className = `msg ${msg.sender === 'admin' ? 'user' : 'admin'}`;

    let content = '';
    if (msg.text) content += `<div>${msg.text}</div>`;
    if (msg.image) content += `<img src="${msg.image}" style="max-width: 200px; border-radius: 8px; cursor: pointer;" onclick="window.open('${msg.image}')">`;

    const time = msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }) : '';
    content += `<span class="time">${time}</span>`;

    div.innerHTML = content;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

async function sendAdminMessage() {
    const input = document.getElementById('admin-chat-input');
    const text = input.value.trim();
    if (!text || !activeChatUserId) return;

    try {
        await db.collection('chats').doc(activeChatUserId).collection('messages').add({
            text: text,
            sender: 'admin',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        await db.collection('chats').doc(activeChatUserId).set({
            lastMessage: text,
            lastTimestamp: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        input.value = '';
    } catch (e) {
        console.error("Admin Chat Error:", e);
    }
}

// --- Grant Order Logic ---
function openGrantOrderModal() {
    const select = document.getElementById('grant-product-select');
    select.innerHTML = products.map(p => `<option value="${p.id}">${p.name} (${p.price} دج)</option>`).join('');
    document.getElementById('grant-order-modal').classList.add('show');
}

async function confirmGrantOrder() {
    if (!activeChatUserId) return;

    const productId = document.getElementById('grant-product-select').value;
    const deliveryCode = document.getElementById('grant-product-code').value;
    const product = products.find(p => p.id == productId);

    if (!deliveryCode) {
        alert("يرجى إدخال كود التفعيل أولاً");
        return;
    }

    // Get user info from chat doc
    const chatDoc = await db.collection('chats').doc(activeChatUserId).get();
    const userData = chatDoc.data();

    const orderData = {
        id: 'GF-MANUAL-' + Math.floor(Math.random() * 9000 + 1000),
        userId: activeChatUserId,
        email: userData.userEmail,
        name: userData.userName,
        items: [{ ...product, delivery: deliveryCode }],
        total: product.price,
        status: 'completed',
        date: new Date().toLocaleString('ar-DZ'),
        payment: 'Manual Grant'
    };

    try {
        // 1. Save order to Firestore
        await db.collection('orders').doc(orderData.id).set(orderData);

        // 2. Add to local orders
        orders.push(orderData);
        localStorage.setItem('grifa_orders', JSON.stringify(orders));

        // 3. Send message in chat
        await db.collection('chats').doc(activeChatUserId).collection('messages').add({
            text: `✅ تم إرسال طلبك بنجاح! تفقد بريدك الإلكتروني: ${orderData.email}`,
            sender: 'admin',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 4. Close modal and refresh
        closeModal();
        renderOrdersTable();
        alert("تم منح الطلبية وإرسالها بنجاح!");
    } catch (e) {
        console.error("Grant Error:", e);
        alert("حدث خطأ أثناء منح الطلبية");
    }
}

// --- Bootstrap ---
function initAdmin() {
    renderStats();
    renderProductsTable();
    renderOrdersTable();
    renderBannersTable();
    renderCouponsTable();

    // Default chat list sync if tab is refreshed
    if (document.getElementById('messages-tab').classList.contains('active')) {
        initAdminChatList();
    }
}

document.addEventListener('DOMContentLoaded', initAdmin);
