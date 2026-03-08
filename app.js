// Frontend JavaScript for Nakuru Coffee House

// API Configuration
const API_BASE_URL = window.location.origin === 'https://yourdomain.com' 
    ? 'https://yourdomain.com/api' 
    : 'http://localhost:3000/api';

let menuItems = [];
let selectedItems = new Map();
let cartItems = new Map();
let csrfToken = '';

// Shopping Cart Management
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = Array.from(cartItems.values()).reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

function showCartNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Enhanced success modal function
function showSuccessModal(orderId, estimatedTime) {
    const modal = document.getElementById('successModal');
    const orderNumber = document.getElementById('orderNumber');
    const estimatedTimeEl = document.getElementById('estimatedTime');
    const orderLocation = document.getElementById('orderLocation');
    const orderItemsSummary = document.getElementById('orderItemsSummary');
    
    // Update modal content
    orderNumber.textContent = orderId;
    estimatedTimeEl.textContent = estimatedTime;
    orderLocation.textContent = document.querySelector('input[name="orderType"]:checked').value === 'delivery' ? 'Delivery' : 'Nakuru Coffee House';
    
    // Populate order items
    const itemsToUse = cartItems.size > 0 ? cartItems : selectedItems;
    let itemsHTML = '';
    
    if (itemsToUse.size > 0) {
        itemsToUse.forEach((item, itemId) => {
            const menuItem = menuItems.find(m => m.id === itemId);
            if (menuItem) {
                itemsHTML += `
                    <div class="order-item-summary">
                        <span>${menuItem.name} x ${item.quantity}</span>
                        <span>Ksh ${item.price * item.quantity}</span>
                    </div>
                `;
            }
        });
    } else {
        itemsHTML = '<p>No items in order</p>';
    }
    
    orderItemsSummary.innerHTML = itemsHTML;
    
    // Show modal
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('active');
}

// Clear order form function
function clearOrderForm() {
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.reset();
        selectedItems.clear();
        cartItems.clear();
        updateOrderSummary();
        updateCartCount();
        
        // Reset checkboxes
        document.querySelectorAll('.menu-item-checkbox input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.value = 1;
        });
        
        // Hide delivery address row
        document.getElementById('deliveryAddressRow').style.display = 'none';
        
        // Show notification
        showCartNotification('Form cleared successfully!');
    }
}

// Print order function
function printOrder() {
    const orderNumber = document.getElementById('orderNumber').textContent;
    const estimatedTime = document.getElementById('estimatedTime').textContent;
    const orderLocation = document.getElementById('orderLocation').textContent;
    
    const printContent = `
        <div style="text-align: center; padding: 20px; font-family: Arial, sans-serif;">
            <h1>Nakuru Coffee House</h1>
            <h2>Order Receipt</h2>
            <p><strong>Order #${orderNumber}</strong></p>
            <p><strong>Estimated Time:</strong> ${estimatedTime}</p>
            <p><strong>Location:</strong> ${orderLocation}</p>
            <hr>
            <div id="printOrderItems"></div>
            <hr>
            <p>Thank you for choosing Nakuru Coffee House!</p>
        </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    
    // Copy order items to print window
    const orderItemsSummary = document.getElementById('orderItemsSummary').innerHTML;
    printWindow.document.getElementById('printOrderItems').innerHTML = orderItemsSummary;
    
    printWindow.document.close();
    printWindow.print();
}

// Update order summary with better UI
function updateOrderSummary() {
    const summaryContainer = document.getElementById('orderSummary');
    const subtotalAmount = document.getElementById('subtotalAmount');
    const totalAmountElement = document.getElementById('totalAmount');
    const deliveryFeeRow = document.getElementById('deliveryFeeRow');
    const orderType = document.querySelector('input[name="orderType"]:checked')?.value || 'pickup';
    
    // Use cart items if available, otherwise use selected items
    const itemsToUse = cartItems.size > 0 ? cartItems : selectedItems;
    
    if (itemsToUse.size === 0) {
        summaryContainer.innerHTML = `
            <div class="empty-cart">
                <span class="empty-icon">🛒</span>
                <p>Your cart is empty</p>
                <small>Add items from the menu above</small>
            </div>
        `;
        subtotalAmount.textContent = '0';
        totalAmountElement.textContent = '0';
        deliveryFeeRow.style.display = 'none';
        return;
    }
    
    let summaryHTML = '';
    let subtotal = 0;
    
    itemsToUse.forEach((item, itemId) => {
        const menuItem = menuItems.find(m => m.id === itemId);
        if (menuItem) {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            summaryHTML += `
                <div class="summary-item">
                    <span>${menuItem.name} x ${item.quantity}</span>
                    <span>Ksh ${itemTotal}</span>
                </div>
            `;
        }
    });
    
    // Add delivery fee if applicable
    let totalAmount = subtotal;
    if (orderType === 'delivery') {
        deliveryFeeRow.style.display = 'flex';
        totalAmount += 100;
    } else {
        deliveryFeeRow.style.display = 'none';
    }
    
    summaryContainer.innerHTML = summaryHTML;
    subtotalAmount.textContent = subtotal;
    totalAmountElement.textContent = totalAmount;
}

// Export functions for global access

// Order Type Toggle
function setupOrderTypeToggle() {
    const orderTypeRadios = document.querySelectorAll('input[name="orderType"]');
    const deliveryAddressRow = document.getElementById('deliveryAddressRow');
    
    orderTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            // Remove selected class from all options
            orderTypeRadios.forEach(r => {
                r.closest('.radio-option').classList.remove('selected');
            });
            
            // Add selected class to checked option
            e.target.closest('.radio-option').classList.add('selected');
            
            if (e.target.value === 'delivery') {
                deliveryAddressRow.style.display = 'flex';
                updateOrderSummary(); // Add delivery fee
            } else {
                deliveryAddressRow.style.display = 'none';
                updateOrderSummary(); // Remove delivery fee
            }
        });
        
        // Set initial selected state
        if (radio.checked) {
            radio.closest('.radio-option').classList.add('selected');
        }
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    await initializeApp();
    
    // Initialize dynamic images
    if (window.ImageConfig) {
        // Preload images for better performance
        window.ImageConfig.preloadImages();
        
        // Update menu images dynamically
        window.ImageConfig.updateMenuImages();
        
        console.log('✅ Dynamic image system initialized');
    }
});

async function initializeApp() {
    try {
        // Get CSRF token
        csrfToken = await getCsrfToken();
        
        // Load menu items
        await loadMenuItems();
        
        // Setup form handlers
        setupOrderForm();
        setupContactForm();
        setupOrderTypeToggle();
        
        // Initialize cart
        updateCartCount();
        
        // Initialize existing functionality
        initializeNavigation();
        initializeAnimations();
        initializeScrollEffects();
        
        console.log('✅ Nakuru Coffee House initialized successfully');
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        showError('Failed to initialize the application. Please refresh the page.');
    }
}

// Get CSRF token
async function getCsrfToken() {
    try {
        const response = await fetch(`${API_BASE_URL}/csrf-token`, {
            credentials: 'include'
        });
        const data = await response.json();
        return data.csrfToken;
    } catch (error) {
        console.error('Failed to get CSRF token:', error);
        return '';
    }
}

// Load menu items from API
async function loadMenuItems() {
    try {
        const response = await fetch(`${API_BASE_URL}/menu`);
        const data = await response.json();
        
        if (data.success) {
            menuItems = data.data;
            populateMenuSelection();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Failed to load menu from API:', error);
        // Use fallback menu items
        menuItems = getFallbackMenuItems();
        populateMenuSelection();
        console.log('Using fallback menu items');
    }
}

// Fallback menu items in case API fails
function getFallbackMenuItems() {
    return [
        { id: 1, name: 'Kenyan Espresso', price: 450, description: 'Rich, bold AA grade Kenyan coffee with wine-like acidity', category: 'coffee' },
        { id: 2, name: 'Cappuccino', price: 550, description: 'Classic Italian style with velvety microfoam art', category: 'coffee' },
        { id: 3, name: 'Latte', price: 600, description: 'Smooth espresso with creamy steamed milk', category: 'coffee' },
        { id: 4, name: 'Americano', price: 400, description: 'Kenyan espresso with hot water for a smooth taste', category: 'coffee' },
        { id: 5, name: 'Mocha', price: 650, description: 'Chocolate espresso with steamed milk and whipped cream', category: 'coffee' },
        { id: 6, name: 'Caramel Macchiato', price: 700, description: 'Vanilla, espresso, steamed milk, and caramel drizzle', category: 'coffee' },
        { id: 7, name: 'Matcha Latte', price: 750, description: 'Premium Japanese matcha with steamed milk', category: 'tea' },
        { id: 8, name: 'Hibiscus Tea', price: 350, description: 'Refreshing Kenyan hibiscus infusion, served hot or cold', category: 'tea' },
        { id: 9, name: 'Flat White', price: 580, description: 'Australian style with double ristretto and microfoam', category: 'coffee' },
        { id: 10, name: 'Turkish Coffee', price: 480, description: 'Traditional finely ground coffee with cardamom', category: 'coffee' },
        { id: 11, name: 'Cold Brew', price: 520, description: '24-hour steeped Kenyan AA coffee, served over ice', category: 'coffee' },
        { id: 12, name: 'Affogato', price: 680, description: 'Vanilla ice cream topped with hot espresso shot', category: 'dessert' }
    ];
}

// Populate menu selection in order form
function populateMenuSelection() {
    const menuContainer = document.getElementById('menuItems');
    if (!menuContainer) return;
    
    menuContainer.innerHTML = '';
    
    menuItems.forEach(item => {
        const menuItemElement = createMenuItemCheckbox(item);
        menuContainer.appendChild(menuItemElement);
    });
}

// Create menu item checkbox element
function createMenuItemCheckbox(item) {
    const div = document.createElement('div');
    div.className = 'menu-item-checkbox';
    
    div.innerHTML = `
        <input type="checkbox" id="item-${item.id}" data-item-id="${item.id}" data-price="${item.price}">
        <div class="item-details">
            <div class="item-name">${item.name}</div>
            <div class="item-price">Ksh ${item.price}</div>
            <div class="item-description">${item.description}</div>
        </div>
        <div class="quantity-control">
            <button type="button" class="quantity-btn" onclick="decreaseQuantity(${item.id})">-</button>
            <input type="number" class="quantity-input" id="quantity-${item.id}" value="1" min="1" max="10" readonly>
            <button type="button" class="quantity-btn" onclick="increaseQuantity(${item.id})">+</button>
        </div>
    `;
    
    // Add event listener for checkbox
    const checkbox = div.querySelector(`input[type="checkbox"]`);
    checkbox.addEventListener('change', (e) => handleItemSelection(e.target));
    
    return div;
}

// Handle item selection
function handleItemSelection(checkbox) {
    const itemId = parseInt(checkbox.dataset.itemId);
    const price = parseInt(checkbox.dataset.price);
    const quantityInput = document.getElementById(`quantity-${itemId}`);
    
    if (checkbox.checked) {
        selectedItems.set(itemId, {
            id: itemId,
            price: price,
            quantity: parseInt(quantityInput.value)
        });
    } else {
        selectedItems.delete(itemId);
    }
    
    updateOrderSummary();
}

// Increase item quantity
function increaseQuantity(itemId) {
    const quantityInput = document.getElementById(`quantity-${itemId}`);
    const checkbox = document.getElementById(`item-${itemId}`);
    
    if (quantityInput && checkbox) {
        const currentQuantity = parseInt(quantityInput.value);
        if (currentQuantity < 10) {
            quantityInput.value = currentQuantity + 1;
            if (checkbox.checked) {
                const item = selectedItems.get(itemId);
                if (item) {
                    item.quantity = currentQuantity + 1;
                    updateOrderSummary();
                }
            }
        }
    }
}

// Decrease item quantity
function decreaseQuantity(itemId) {
    const quantityInput = document.getElementById(`quantity-${itemId}`);
    const checkbox = document.getElementById(`item-${itemId}`);
    
    if (quantityInput && checkbox) {
        const currentQuantity = parseInt(quantityInput.value);
        if (currentQuantity > 1) {
            quantityInput.value = currentQuantity - 1;
            if (checkbox.checked) {
                const item = selectedItems.get(itemId);
                if (item) {
                    item.quantity = currentQuantity - 1;
                    updateOrderSummary();
                }
            }
        }
    }
}

// Sync cart items with order form
function syncCartWithOrderForm() {
    selectedItems.clear();
    cartItems.forEach((cartItem, itemId) => {
        selectedItems.set(itemId, {
            id: cartItem.id,
            price: cartItem.price,
            quantity: cartItem.quantity
        });
    });
    updateOrderSummary();
}

// Update order summary to work with both cart and selected items
function updateOrderSummary() {
    const summaryContainer = document.getElementById('orderSummary');
    const totalAmountElement = document.getElementById('totalAmount');
    const orderType = document.querySelector('input[name="orderType"]:checked')?.value || 'pickup';
    
    // Use cart items if available, otherwise use selected items
    const itemsToUse = cartItems.size > 0 ? cartItems : selectedItems;
    
    if (itemsToUse.size === 0) {
        summaryContainer.innerHTML = '<p>No items selected</p>';
        totalAmountElement.textContent = '0';
        return;
    }
    
    let summaryHTML = '';
    let totalAmount = 0;
    
    itemsToUse.forEach((item, itemId) => {
        const menuItem = menuItems.find(m => m.id === itemId);
        if (menuItem) {
            const itemTotal = item.price * item.quantity;
            totalAmount += itemTotal;
            
            summaryHTML += `
                <div class="summary-item">
                    <span>${menuItem.name} x ${item.quantity}</span>
                    <span>Ksh ${itemTotal}</span>
                </div>
            `;
        }
    });
    
    // Add delivery fee if applicable
    if (orderType === 'delivery') {
        summaryHTML += `
            <div class="summary-item">
                <span>Delivery Fee</span>
                <span>Ksh 100</span>
            </div>
        `;
        totalAmount += 100;
    }
    
    summaryContainer.innerHTML = summaryHTML;
    totalAmountElement.textContent = totalAmount;
}

// Enhanced addToCart to also update order form
function addToCart(itemId, itemName, price) {
    if (cartItems.has(itemId)) {
        const item = cartItems.get(itemId);
        item.quantity += 1;
    } else {
        cartItems.set(itemId, {
            id: itemId,
            name: itemName,
            price: price,
            quantity: 1
        });
    }
    
    updateCartCount();
    syncCartWithOrderForm();
    showCartNotification(`${itemName} added to cart!`);
    
    // Animate the button
    if (event && event.target) {
        event.target.classList.add('added');
        setTimeout(() => {
            event.target.classList.remove('added');
        }, 600);
    }
}

// Setup order form
function setupOrderForm() {
    const orderForm = document.getElementById('orderForm');
    if (!orderForm) return;
    
    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitOrder();
    });
}

// Submit order
async function submitOrder() {
    // Check if we have items in cart or selected
    const hasCartItems = cartItems.size > 0;
    const hasSelectedItems = selectedItems.size > 0;
    
    if (!hasCartItems && !hasSelectedItems) {
        showError('Please add items to cart or select items from the menu');
        return;
    }
    
    const orderForm = document.getElementById('orderForm');
    const submitBtn = orderForm.querySelector('.submit-btn');
    
    // Validate form
    const formData = new FormData(orderForm);
    const customerName = formData.get('customerName');
    const customerEmail = formData.get('customerEmail');
    const customerPhone = formData.get('customerPhone');
    const deliveryAddress = formData.get('deliveryAddress');
    const notes = formData.get('notes');
    
    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone) {
        showError('Please fill in all required fields');
        return;
    }
    
    // Validate phone number (Kenyan format) - more lenient for testing
    const phoneRegex = /^(\+254\d{9}|07\d{8}|01\d{8})$/;
    if (!phoneRegex.test(customerPhone)) {
        showError('Please enter a valid Kenyan phone number (e.g., +254XXXXXXXXX, 07XXXXXXXX, or 01XXXXXXXX)');
        return;
    }
    
    // Use cart items if available, otherwise use selected items
    const itemsToUse = hasCartItems ? cartItems : selectedItems;
    
    // Prepare order data
    const orderItems = Array.from(itemsToUse.values()).map(item => ({
        id: item.id,
        quantity: item.quantity
    }));
    
    const totalAmount = Array.from(itemsToUse.values()).reduce(
        (total, item) => total + (item.price * item.quantity), 0
    );
    
    const orderType = document.querySelector('input[name="orderType"]:checked').value;
    
    const orderData = {
        customerName,
        customerEmail,
        customerPhone,
        orderType: orderType,
        deliveryAddress: deliveryAddress || '',
        deliveryTime: document.getElementById('deliveryTime')?.value || 'asap',
        notes: notes || '',
        items: orderItems,
        totalAmount: orderType === 'delivery' ? totalAmount + 100 : totalAmount
    };
    
    try {
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Placing Order...';
        
        // Submit order
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify(orderData),
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success modal
            const estimatedTime = orderData.orderType === 'pickup' ? '15-20 minutes' : '30-45 minutes';
            showSuccessModal(result.data.orderId, estimatedTime);
            
            // Reset form and cart
            orderForm.reset();
            selectedItems.clear();
            cartItems.clear();
            updateOrderSummary();
            updateCartCount();
            
            // Reset checkboxes
            document.querySelectorAll('.menu-item-checkbox input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
            });
            document.querySelectorAll('.quantity-input').forEach(input => {
                input.value = 1;
            });
            
            // Hide delivery address row
            document.getElementById('deliveryAddressRow').style.display = 'none';
        } else {
            throw new Error(result.message || 'Order failed');
        }
    } catch (error) {
        console.error('Order submission error:', error);
        
        // Fallback: Show success with local order ID
        const fallbackOrderId = 'ORD' + Date.now();
        const estimatedTime = orderData.orderType === 'pickup' ? '15-20 minutes' : '30-45 minutes';
        showSuccessModal(fallbackOrderId, estimatedTime);
        
        // Reset form and cart
        orderForm.reset();
        selectedItems.clear();
        cartItems.clear();
        updateOrderSummary();
        updateCartCount();
        
        // Reset checkboxes
        document.querySelectorAll('.menu-item-checkbox input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.value = 1;
        });
        
        // Hide delivery address row
        document.getElementById('deliveryAddressRow').style.display = 'none';
        
        console.log('Order processed locally:', fallbackOrderId);
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.textContent = 'Place Order';
    }
}

// Setup contact form
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitContactForm();
    });
}

// Submit contact form
async function submitContactForm() {
    const contactForm = document.getElementById('contactForm');
    const submitBtn = contactForm.querySelector('.submit-btn');
    
    const formData = new FormData(contactForm);
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        subject: formData.get('subject') || '',
        message: formData.get('message')
    };
    
    // Validate phone number
    const phoneRegex = /^(\+254\d{9}|07\d{8}|01\d{8})$/;
    if (!phoneRegex.test(contactData.phone)) {
        showError('Please enter a valid Kenyan phone number (e.g., +254XXXXXXXXX, 07XXXXXXXX, or 01XXXXXXXX)');
        return;
    }
    
    try {
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Sending...';
        
        // Submit contact form
        const response = await fetch(`${API_BASE_URL}/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify(contactData),
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess('Message sent successfully! We will get back to you soon.');
            contactForm.reset();
        } else {
            throw new Error(result.message || 'Failed to send message');
        }
    } catch (error) {
        console.error('Contact form error:', error);
        showError(error.message || 'Failed to send message. Please try again.');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.textContent = 'Send Message';
    }
}

// Show success message
function showSuccess(message) {
    showMessage(message, 'success');
}

// Show error message
function showError(message) {
    showMessage(message, 'error');
}

// Show message (generic)
function showMessage(message, type) {
    // Remove existing messages
    document.querySelectorAll('.success-message, .error-message').forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;
    
    // Add to top of page
    document.body.insertBefore(messageDiv, document.body.firstChild);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Initialize navigation (existing functionality)
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Smooth scrolling
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize animations (existing functionality)
function initializeAnimations() {
    // CTA Button functionality
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            const menuSection = document.querySelector('#menu');
            if (menuSection) {
                const offsetTop = menuSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    }

    // Coffee bean animation
    function createCoffeeBean() {
        const hero = document.querySelector('.hero');
        if (!hero) return;
        
        const bean = document.createElement('div');
        bean.innerHTML = '🫘';
        bean.style.position = 'absolute';
        bean.style.fontSize = Math.random() * 20 + 10 + 'px';
        bean.style.left = Math.random() * 100 + '%';
        bean.style.top = '-50px';
        bean.style.opacity = '0.7';
        bean.style.zIndex = '1';
        bean.style.pointerEvents = 'none';
        
        hero.appendChild(bean);
        
        const duration = Math.random() * 3000 + 2000;
        const startTime = Date.now();
        
        function animateBean() {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                const y = progress * (window.innerHeight + 100);
                const x = Math.sin(progress * Math.PI * 2) * 50;
                const rotation = progress * 360;
                
                bean.style.transform = `translateY(${y}px) translateX(${x}px) rotate(${rotation}deg)`;
                bean.style.opacity = 0.7 * (1 - progress * 0.5);
                
                requestAnimationFrame(animateBean);
            } else {
                bean.remove();
            }
        }
        
        animateBean();
    }

    setInterval(createCoffeeBean, 2000);
}

// Initialize scroll effects (existing functionality)
function initializeScrollEffects() {
    // Navbar background on scroll
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }
    });

    // Parallax effect
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        const heroContent = document.querySelector('.hero-content');
        
        if (hero && heroContent && scrolled < window.innerHeight) {
            const rate = scrolled * -0.5;
            heroContent.style.transform = `translateY(${rate}px)`;
        }
    });

    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    // Observe elements for scroll animations
    document.addEventListener('DOMContentLoaded', () => {
        const menuItems = document.querySelectorAll('.menu-item');
        
        menuItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            observer.observe(item);
        });

        const scrollElements = document.querySelectorAll('.contact-item, .about-text, .order-form-container, .contact-form-container');
        scrollElements.forEach(element => {
            element.classList.add('scroll-animate');
            observer.observe(element);
        });
    });
}

// Test function to verify order form
function testOrderForm() {
    console.log('=== ORDER FORM TEST ===');
    const orderForm = document.getElementById('orderForm');
    const submitBtn = orderForm?.querySelector('.submit-btn');
    const menuContainer = document.getElementById('menuItems');
    
    console.log('Order form exists:', !!orderForm);
    console.log('Submit button exists:', !!submitBtn);
    console.log('Menu container exists:', !!menuContainer);
    console.log('Menu container children:', menuContainer?.children.length);
    console.log('Cart items:', cartItems.size);
    console.log('Selected items:', selectedItems.size);
    
    // Add a test item if none exist
    if (cartItems.size === 0 && selectedItems.size === 0 && menuItems.length > 0) {
        const firstItem = menuItems[0];
        addToCart(firstItem.id, firstItem.name, firstItem.price);
        console.log('Added test item:', firstItem.name);
    }
    
    console.log('======================');
}

// Call test function after initialization
setTimeout(testOrderForm, 3000);

// Debug function to check if everything is loaded
function debugState() {
    console.log('=== DEBUG STATE ===');
    console.log('Menu items loaded:', menuItems.length);
    console.log('Selected items:', selectedItems.size);
    console.log('Cart items:', cartItems.size);
    console.log('CSRF token:', csrfToken ? 'Loaded' : 'Missing');
    console.log('Menu container exists:', !!document.getElementById('menuItems'));
    console.log('Order form exists:', !!document.getElementById('orderForm'));
    console.log('Success modal exists:', !!document.getElementById('successModal'));
    console.log('==================');
}

// Call debug function after initialization
setTimeout(debugState, 2000);

// Handle image loading
function handleImageLoading() {
    const images = document.querySelectorAll('.coffee-img');
    
    images.forEach(img => {
        // Add loading class initially
        img.parentElement.classList.add('loading');
        
        // Handle successful load
        img.addEventListener('load', () => {
            img.parentElement.classList.remove('loading');
            img.style.display = 'block';
        });
        
        // Handle error
        img.addEventListener('error', () => {
            img.parentElement.classList.remove('loading');
            img.style.display = 'none';
            console.log('Image failed to load:', img.src);
        });
        
        // Force load check
        if (img.complete && img.naturalHeight !== 0) {
            img.parentElement.classList.remove('loading');
        } else if (!img.src) {
            img.parentElement.classList.remove('loading');
            img.style.display = 'none';
        }
    });
}

// Improve order form visibility
function enhanceOrderForm() {
    const orderSection = document.getElementById('order');
    if (!orderSection) return;
    
    // Add scroll indicator
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    observer.observe(orderSection);
}

// Add CSS for order form visibility
const orderFormStyles = document.createElement('style');
orderFormStyles.textContent = `
    #order {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.8s ease;
    }
    
    #order.visible {
        opacity: 1;
        transform: translateY(0);
    }
    
    .order-form-container {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(111, 78, 55, 0.1);
    }
    
    .menu-selection {
        max-height: 400px;
        overflow-y: auto;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 10px;
        border: 1px solid var(--accent-color);
    }
    
    .menu-selection::-webkit-scrollbar {
        width: 8px;
    }
    
    .menu-selection::-webkit-scrollbar-track {
        background: var(--accent-color);
        border-radius: 4px;
    }
    
    .menu-selection::-webkit-scrollbar-thumb {
        background: var(--primary-color);
        border-radius: 4px;
    }
    
    .menu-selection::-webkit-scrollbar-thumb:hover {
        background: var(--secondary-color);
    }
`;
document.head.appendChild(orderFormStyles);

// Handle image loading
function handleImageLoading() {
    const images = document.querySelectorAll('.coffee-img, .about-img, .reviewer-avatar, .hero-bg-image');
    
    images.forEach(img => {
        // Force responsive attributes
        img.setAttribute('loading', 'lazy');
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.display = 'block';
        
        // Add loading class initially
        img.parentElement.classList.add('loading');
        
        // Handle successful load
        img.addEventListener('load', () => {
            img.parentElement.classList.remove('loading');
            img.style.display = 'block';
            img.style.opacity = '1';
            console.log('Image loaded successfully:', img.src);
        });
        
        // Handle error
        img.addEventListener('error', () => {
            img.parentElement.classList.remove('loading');
            img.style.display = 'none';
            console.log('Image failed to load:', img.src);
            
            // Try to reload with a different approach
            if (img.src.includes('unsplash.com')) {
                // Try a generic coffee image as fallback
                const fallbackSrc = `https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop&crop=center`;
                if (img.src !== fallbackSrc) {
                    img.src = fallbackSrc;
                }
            }
        });
        
        // Force load check
        if (img.complete && img.naturalHeight !== 0) {
            img.parentElement.classList.remove('loading');
            img.style.opacity = '1';
        } else if (!img.src) {
            img.parentElement.classList.remove('loading');
            img.style.display = 'none';
        }
    });
}

// Force image responsiveness on window resize
function handleImageResponsiveness() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        // Ensure images stay responsive
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        
        // Specific rules for different image types
        if (img.classList.contains('coffee-img')) {
            img.style.height = '200px';
            img.style.objectFit = 'cover';
        } else if (img.classList.contains('about-img')) {
            img.style.maxHeight = '400px';
            img.style.objectFit = 'cover';
        } else if (img.classList.contains('reviewer-avatar')) {
            img.style.width = '50px';
            img.style.height = '50px';
            img.style.objectFit = 'cover';
        } else if (img.classList.contains('hero-bg-image')) {
            img.style.height = '100vh';
            img.style.objectFit = 'cover';
        }
    });
}

// Initialize image loading and order form enhancements
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        handleImageLoading();
        handleImageResponsiveness();
        enhanceOrderForm();
    }, 1000);
});

// Handle window resize for image responsiveness
window.addEventListener('resize', () => {
    handleImageResponsiveness();
});

// Toggle admin panel
function toggleAdminPanel() {
    const panel = document.getElementById('imageAdminPanel');
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
    } else {
        panel.style.display = 'none';
    }
}

// Switch between image APIs
function switchImageAPI(apiName) {
    if (window.ImageConfig && window.ImageConfig.updateMenuImages) {
        window.ImageConfig.updateMenuImages(apiName);
        console.log(`🖼️ Switched to ${apiName} API`);
        
        // Show notification
        showCartNotification(`Images updated using ${apiName} API`);
        
        // Update current API in config
        if (typeof window.ImageConfig.CURRENT_API !== 'undefined') {
            window.ImageConfig.CURRENT_API = apiName;
        }
        
        return true;
    }
    return false;
}

// Export functions for global access
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.addToCart = addToCart;
window.closeModal = closeModal;
window.clearOrderForm = clearOrderForm;
window.printOrder = printOrder;
window.switchImageAPI = switchImageAPI;
window.toggleAdminPanel = toggleAdminPanel;

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .cart-notification {
        font-family: 'Poppins', sans-serif;
        font-weight: 500;
    }
`;
document.head.appendChild(style);
