// Consolidated DOMContentLoaded listener for all initialization
document.addEventListener('DOMContentLoaded', () => {
    // Core variables
    const video = document.getElementById('hero-video');
    const textContents = document.querySelectorAll('.text-content');
    const scrollDown = document.querySelector('.scroll-down');
    const navToggle = document.querySelector('.nav-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const contentContainer = document.querySelector('.content-container');
    const hero = document.querySelector('.hero');
    const chatToggle = document.querySelector('.chat-toggle');
    let currentTextIndex = 0;
    let currentIndex = 0; // For review carousel
    let touchStartY = 0;
    let hasScrolledPastHero = false;
    let hasClickedToggle = false;
    let selectedItems = []; // Unified order items array
    let isChatOpen = false;
    let orderState = 0;
    let orderDetails = { type: '', size: '', option: '' };
    let reservationDetails = { date: '', time: '', partySize: '' };
    let activeCard = null;
    const customizedItems = {};

    // Define addOns array
    const addOns = [
        { name: 'Eggs', price: 30 },
        { name: 'Caramelized Onions', price: 25 },
        { name: 'Cheese', price: 30 },
        { name: 'Pima Kari (Chillies)', price: 35 },
        { name: 'Caramelized Pineapple', price: 40 },
        { name: 'Truffle Mayo', price: 40 },
        { name: 'Sweet Cherkins', price: 40 },
        { name: 'Extra 150g Beef', price: 140 },
        { name: 'Extra Chicken', price: 110 },
        { name: 'Salad', price: 70 }
    ];

    // Function to update the cart count
    function updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = selectedItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
            cartCount.textContent = totalItems;
            console.log('Cart count updated:', totalItems);
        } else {
            console.warn('Cart count element (.cart-count) not found');
        }
    }

    // Mobile layout adjustment
    if (window.innerWidth <= 768) {
        const aboutContent = document.querySelector('.about-content');
        const aboutText = document.querySelector('.about-text');
        if (aboutContent && aboutText) {
            const storySection = aboutText.querySelector('.story-section');
            const journeySection = aboutText.querySelector('.journey-section');
            const ownerImageContainer = document.querySelector('.owner-image-container');
            const ownerImageSection = document.querySelector('.owner-image-section');

            if (storySection && journeySection && ownerImageContainer && ownerImageSection) {
                aboutText.remove();
                aboutContent.appendChild(storySection);
                aboutContent.appendChild(ownerImageContainer);
                aboutContent.appendChild(journeySection);
                aboutContent.appendChild(ownerImageSection);
            } else {
                console.warn('Mobile layout elements missing:', { storySection, journeySection, ownerImageContainer, ownerImageSection });
            }
        }
    }

    // Navigation Toggle
    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            navToggle.innerHTML = mobileMenu.classList.contains('active')
                ? '<i class="fas fa-times"></i>'
                : '<i class="fas fa-bars"></i>';
        });
    }

    // Video Handling
    if (video && contentContainer) {
        video.addEventListener('timeupdate', () => {
            contentContainer.classList.toggle('hidden', video.currentTime >= 28);
        });
        video.addEventListener('loadedmetadata', () => {
            if (scrollDown) scrollDown.style.opacity = '1';
        });
    }

    // Mobile Touch Handling
    window.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    // Nav Link Hover Effects
    document.querySelectorAll('.nav-right a').forEach(link => {
        link.addEventListener('mouseover', () => {
            link.style.transform = 'translateY(-3px)';
        });
        link.addEventListener('mouseout', () => {
            link.style.transform = 'translateY(0)';
        });
    });

    // Burger Animation
    const container = document.querySelector('.owner-image-container');
    const burger = document.querySelector('.burger-wrapper');
    if (container && burger) {
        const containerHeight = container.clientHeight;
        const burgerHeight = burger.offsetHeight;
        const maxY = containerHeight - burgerHeight;
        let y = 0, v = 0, lastTime = null;
        const g = 1000;

        function animate(currentTime) {
            if (!lastTime) lastTime = currentTime;
            const dt = (currentTime - lastTime) / 1000;
            v += g * dt;
            y += v * dt;
            if (y >= maxY) {
                y = maxY;
                v = -v;
            }
            burger.style.top = `${y}px`;
            lastTime = currentTime;
            requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
    }

    // ScrollReveal Animations
    if (typeof ScrollReveal !== 'undefined') {
        const sr = ScrollReveal({
            reset: true,
            distance: '100px',
            duration: 1500,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            viewFactor: 0.2
        });
        sr.reveal('.about-heading', { origin: 'top', delay: 200 });
        sr.reveal('.owner-image-container', { origin: 'bottom', delay: 400 });
        sr.reveal('.about-text', { origin: 'left', delay: 600 });
        sr.reveal('.social-links', { origin: 'right', delay: 800 });
        sr.reveal('.map-container', { origin: 'left', delay: 300 });
        sr.reveal('.contact-info', { origin: 'right', delay: 600 });
        sr.reveal('.menu-section', { origin: 'bottom', distance: '50px', duration: 1000 });
    }

    // Review Carousel
    const cards = document.querySelectorAll('.review-card');
    if (cards.length) {
        function updateCards() {
            cards.forEach(card => card.classList.remove('active', 'prev', 'next'));
            cards[currentIndex].classList.add('active');
            const prevIndex = (currentIndex - 1 + cards.length) % cards.length;
            const nextIndex = (currentIndex + 1) % cards.length;
            cards[prevIndex].classList.add('prev');
            cards[nextIndex].classList.add('next');
        }
        function goToNext() {
            currentIndex = (currentIndex + 1) % cards.length;
            updateCards();
        }
        updateCards();
        setInterval(goToNext, 3000);
    }

    // Review Filtering
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filter = button.dataset.filter;
            cards.forEach(card => {
                card.style.display = (filter === 'all' || card.dataset.rating === filter) ? 'block' : 'none';
            });
        });
    });

    // Review Form
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for your review!');
            reviewForm.reset();
        });
    }

    // Auto-Rotate Text
    if (textContents.length) {
        setInterval(() => {
            textContents[currentTextIndex].classList.remove('active');
            currentTextIndex = (currentTextIndex + 1) % textContents.length;
            textContents[currentTextIndex].classList.add('active');
        }, 5000);
        textContents[0].classList.add('active');
    }

    // About Section Animation
    const aboutSection = document.querySelector('.about');
    if (aboutSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    document.querySelector('.vertical-line')?.classList.add('animate-vertical');
                    document.querySelector('.about-heading')?.classList.add('reveal');
                    setTimeout(() => {
                        document.querySelector('.owner-image-container')?.classList.add('reveal');
                        document.querySelectorAll('.horizontal-line').forEach(line => line.classList.add('animate-horizontal'));
                        setTimeout(() => {
                            document.querySelector('.about-text')?.classList.add('reveal');
                            document.querySelector('.social-links')?.classList.add('reveal');
                        }, 800);
                    }, 1500);
                }
            });
        }, { threshold: 0.3 });
        observer.observe(aboutSection);
    }

    // Typing Animation
    const typingElement = document.getElementById('typing-text');
    if (typingElement) {
        const typedTextElement = typingElement.querySelector('.typed-text');
        const cursorElement = typingElement.querySelector('.cursor');
        const text = "Mauritius best burgers";
        let index = 0;

        function type() {
            if (index < text.length) {
                typedTextElement.textContent += text.charAt(index);
                index++;
                setTimeout(type, 150);
            } else {
                cursorElement.style.display = 'none';
            }
        }

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                type();
                observer.unobserve(typingElement);
            }
        }, { threshold: 0.5 });
        observer.observe(typingElement);
    }

    // Explore More Button
    const exploreMoreBtn = document.getElementById('explore-more');
    const menuSection = document.getElementById('menu');
    if (exploreMoreBtn && menuSection) {
        exploreMoreBtn.addEventListener('click', () => {
            menuSection.classList.toggle('expanded');
            exploreMoreBtn.textContent = menuSection.classList.contains('expanded') ? 'Show Less' : 'Explore More';
        });
    }

    // Chat Functionality
    function toggleChatWindow() {
        hasClickedToggle = true;
        chatToggle.classList.remove('spun', 'active');
        const chatWindow = document.querySelector('.chat-window');
        isChatOpen = !isChatOpen;
        chatWindow.style.display = isChatOpen ? 'block' : 'none';
        if (isChatOpen) {
            const chatMessages = document.getElementById('chatMessages');
            chatMessages.innerHTML = '';
            displayMessage('Hey, I am your personal assistant here to help you navigate and place your order.', false);
            if (selectedItems.length) {
                let orderSummary = 'Your current order:<br>';
                let total = 0;
                selectedItems.forEach(item => {
                    const priceNum = parseInt(item.price.replace(/[^0-9]/g, ''), 10);
                    orderSummary += `- ${item.name}${item.customizations ? ` (${item.customizations})` : ''} ${item.quantity > 1 ? `x${item.quantity}` : ''}: ${item.price}<br>`;
                    total += priceNum * item.quantity;
                });
                orderSummary += `Total: ${total}Rs`;
                displayMessage(orderSummary, false);
                displayMessage("Click on more items to add to your order or type 'done' to finalize.", false);
            } else {
                displayMessage("You haven’t selected any items yet. Click on menu items to add them to your order.", false);
            }
        }
    }

    function displayMessage(message, isUser = false) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        messageDiv.innerHTML = `<p>${message}</p><span class="timestamp">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    const botResponses = {
        'hi': 'Hello! How can I assist you today? 🍔 Type "order" to place an order or "book" to make a reservation.',
        'menu': 'Our menu features classics like the Cheeseburger, Bacon Deluxe, BBQ Chicken Burger, Veggie Delight, and more! Would you like to place an order? Type "order" to start.',
        'order': 'Great! Please let me know the burger type and size you would like to order.',
        'book': 'Awesome! Let’s make a reservation. Please tell me the date (e.g., "2025-03-28").',
        'hours': 'We are open from 10:00 AM to 11:00 PM every day.',
        'location': 'We are located at Maravann Burger P9C9+3C3, Flic en Flac, Mauritius, MU 10001. Visit us anytime!',
        'bye': 'Goodbye! Have a delicious day!',
        'default': 'I’m sorry, I didn’t understand that. Type "order" to place an order, "book" to make a reservation, or ask about "menu", "hours", or "location".',
        'thank you': 'You’re welcome!'
    };

    function handleUserInput() {
        const input = document.getElementById('userInput');
        const message = input.value.trim();
        if (!message) return;
        displayMessage(message, true);
        input.value = '';
        const chatMessages = document.getElementById('chatMessages');
        const typing = document.createElement('div');
        typing.className = 'typing-indicator';
        typing.textContent = 'Burger Bot is typing...';
        chatMessages.appendChild(typing);

        setTimeout(() => {
            typing.remove();
            let response;

            if (orderState === 0) {
                response = botResponses[Object.keys(botResponses).find(k => message.toLowerCase().includes(k)) || 'default'];
                if (response === botResponses['order']) orderState = 1;
                else if (response === botResponses['book']) orderState = 3;
                else if (message.toLowerCase() === 'done' && selectedItems.length) {
                    let summary = 'Here is your order summary:<br>';
                    let total = 0;
                    selectedItems.forEach(item => {
                        const priceNum = parseInt(item.price.replace(/[^0-9]/g, ''), 10);
                        summary += `- ${item.name}${item.customizations ? ` (${item.customizations})` : ''} ${item.quantity > 1 ? `x${item.quantity}` : ''}: ${priceNum * item.quantity}Rs<br>`;
                        total += priceNum * item.quantity;
                    });
                    summary += `Total: ${total}Rs`;
                    response = summary;
                }
            } else if (orderState === 1) {
                const [type, size] = message.split(' ');
                orderDetails.type = type || 'Unknown';
                orderDetails.size = size || 'Medium';
                response = 'Would you like delivery or pickup?';
                orderState = 2;
            } else if (orderState === 2) {
                orderDetails.option = message.toLowerCase().includes('delivery') ? 'Delivery' : 'Pickup';
                const whatsappNumber = orderDetails.option === 'Delivery' ? '+23059330011' : '+23057110755';
                const orderText = `Hello, I would like to place an order: Burger Type: ${orderDetails.type}, Size: ${orderDetails.size}, Option: ${orderDetails.option}`;
                const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(orderText)}`;
                response = `🎉 Your order is placed!<br>Summary: ${orderDetails.type}, ${orderDetails.size}, ${orderDetails.option}<br><a href="${whatsappLink}" target="_blank" style="color: green;">Finalize on WhatsApp</a>`;
                orderState = 0;
                orderDetails = { type: '', size: '', option: '' };
            } else if (orderState === 3) {
                reservationDetails.date = message;
                response = 'What time would you like to book? (e.g., "18:00")';
                orderState = 4;
            } else if (orderState === 4) {
                reservationDetails.time = message;
                response = 'How many people will be in your party? (e.g., "4")';
                orderState = 5;
            } else if (orderState === 5) {
                reservationDetails.partySize = message;
                const whatsappLink = `https://wa.me/+23057110755?text=${encodeURIComponent(`Reservation: Date: ${reservationDetails.date}, Time: ${reservationDetails.time}, Party Size: ${reservationDetails.partySize}`)}`;
                response = `🎉 Reservation booked!<br>Summary: ${reservationDetails.date}, ${reservationDetails.time}, ${reservationDetails.partySize}<br><a href="${whatsappLink}" target="_blank" style="color: green;">Confirm on WhatsApp</a>`;
                orderState = 0;
                reservationDetails = { date: '', time: '', partySize: '' };
            }
            displayMessage(response);
        }, 1000);
    }

    if (chatToggle) chatToggle.addEventListener('click', toggleChatWindow);
    const userInput = document.getElementById('userInput');
    if (userInput) userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserInput();
    });

    // Chat Notification Cycle
    if (hero && chatToggle) {
        window.addEventListener('scroll', () => {
            if (hero.getBoundingClientRect().bottom < 0 && !hasScrolledPastHero) {
                hasScrolledPastHero = true;
                chatToggle.classList.add('glowing');
                setTimeout(() => {
                    if (!hasClickedToggle) {
                        chatToggle.classList.add('spun');
                        setTimeout(() => {
                            if (!hasClickedToggle) chatToggle.classList.add('active');
                            setTimeout(() => {
                                if (!hasClickedToggle) chatToggle.classList.remove('active');
                                setTimeout(() => {
                                    if (!hasClickedToggle) chatToggle.classList.remove('spun');
                                    setTimeout(() => {
                                        if (!hasClickedToggle) setTimeout(arguments.callee, 2000);
                                    }, 500);
                                }, 300);
                            }, 2000);
                        }, 500);
                    }
                }, 3000);
            }
        });
    }

    // Menu Interaction
    function initializeMenuInteraction() {
        const menuCards = document.querySelectorAll('.menu-card');
        console.log('Initializing menu interaction for', menuCards.length, 'cards');
        menuCards.forEach(card => {
            const customizeBtn = card.querySelector('.customize-btn');
            if (customizeBtn) {
                customizeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    activateCard(card);
                });
            }
            const backButton = card.querySelector('.back-button');
            if (backButton) {
                backButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deactivateCard();
                });
            }
            const closeButton = card.querySelector('.close-panel');
            if (closeButton) {
                closeButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deactivateCard();
                });
            }

            const decreaseBtn = card.querySelector('.quantity-decrease');
            const increaseBtn = card.querySelector('.quantity-increase');
            const quantityValue = card.querySelector('.quantity-value');
            if (decreaseBtn && increaseBtn && quantityValue) {
                decreaseBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const val = parseInt(quantityValue.textContent) || 1;
                    if (val > 1) quantityValue.textContent = val - 1;
                });
                increaseBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    quantityValue.textContent = (parseInt(quantityValue.textContent) || 1) + 1;
                });
            }

            const addToCartBtn = card.querySelector('.add-to-cart-btn');
            if (addToCartBtn) {
                addToCartBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    console.log('Add to Cart clicked for card:', card);
                    addToCart(card);
                });
            } else {
                console.warn('Add to Cart button not found in card:', card);
            }

            card.addEventListener('click', (e) => {
                if (card.classList.contains('active')) {
                    e.stopPropagation();
                } else {
                    activateCard(card);
                }
            });
        });
    }

    function activateCard(card) {
        if (activeCard) deactivateCard();
        activeCard = card;
        card.classList.add('active');
        const panel = card.querySelector('.customization-panel');
        if (panel) {
            panel.style.display = 'flex';
            requestAnimationFrame(() => {
                panel.classList.add('show');
            });
            document.querySelector('.cards-container')?.classList.add('selecting');
            populateIngredients(card);
            populateAddOns(card);
            populateCookingLevels(card);
            const quantityValue = card.querySelector('.quantity-value');
            if (quantityValue) quantityValue.textContent = '1';

            panel.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        } else {
            console.warn('Customization panel not found in card:', card);
        }
    }

    function deactivateCard() {
        if (!activeCard) return;
        const panel = activeCard.querySelector('.customization-panel');
        if (panel) {
            panel.classList.remove('show');
            setTimeout(() => {
                panel.style.display = 'none';
                activeCard.classList.remove('active');
                document.querySelector('.cards-container')?.classList.remove('selecting');
                activeCard = null;
            }, 500);
        }
    }

    function populateIngredients(card) {
        const ingredientsList = card.querySelector('.ingredients-list');
        if (!ingredientsList) {
            console.warn('Ingredients list not found in card:', card);
            return;
        }
        ingredientsList.innerHTML = '';
        const itemId = card.dataset.id;
        const ingredients = card.dataset.ingredients?.split(', ') || [];

        if (!customizedItems[itemId]) {
            customizedItems[itemId] = {
                ingredients: ingredients.map(ingredient => ({
                    name: ingredient,
                    removable: !ingredient.toLowerCase().includes('patty') && !ingredient.toLowerCase().includes('bun'),
                    removed: false
                })),
                addOns: addOns.map(addOn => ({
                    name: addOn.name,
                    selected: false
                }))
            };
        }

        customizedItems[itemId].ingredients.forEach(ingredient => {
            const item = document.createElement('div');
            item.className = `ingredient-item ${ingredient.removable ? 'removable' : 'non-removable'} ${ingredient.removed ? 'removed' : ''}`;
            item.innerHTML = `<span>${ingredient.name}</span><span class="ingredient-status">${ingredient.removable ? (ingredient.removed ? 'Removed' : 'Click to remove') : 'Required'}</span>`;
            if (ingredient.removable) {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    ingredient.removed = !ingredient.removed;
                    item.classList.toggle('removed');
                    item.querySelector('.ingredient-status').textContent = ingredient.removed ? 'Removed' : 'Click to remove';
                });
            }
            ingredientsList.appendChild(item);
        });
    }

    function populateAddOns(card) {
        const addOnsList = card.querySelector('.add-ons-list');
        if (!addOnsList) {
            console.warn('Add-ons list not found in card:', card);
            return;
        }
        addOnsList.innerHTML = '';
        const itemId = card.dataset.id;

        if (!customizedItems[itemId]) {
            customizedItems[itemId] = {
                ingredients: [],
                addOns: addOns.map(addOn => ({
                    name: addOn.name,
                    selected: false
                }))
            };
        }

        addOns.forEach(addOn => {
            const item = document.createElement('div');
            item.className = 'add-on-item';
            item.dataset.addOn = addOn.name;
            const isSelected = customizedItems[itemId].addOns.find(a => a.name === addOn.name)?.selected || false;
            item.innerHTML = `
                <span>${addOn.name} (+${addOn.price}Rs)</span>
                <span class="add-on-status">${isSelected ? 'Added' : ''}</span>
            `;
            if (isSelected) item.classList.add('added');
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const addOnObj = customizedItems[itemId].addOns.find(a => a.name === addOn.name);
                if (addOnObj) {
                    addOnObj.selected = !addOnObj.selected;
                    item.classList.toggle('added');
                    item.querySelector('.add-on-status').textContent = addOnObj.selected ? 'Added' : '';
                }
            });
            addOnsList.appendChild(item);
        });
    }

    function populateCookingLevels(card) {
        const cookingLevelSection = card.querySelector('.cooking-level-section');
        const cookingLevelOptions = card.querySelector('.cooking-level-options');
        if (!cookingLevelSection || !cookingLevelOptions) {
            console.warn('Cooking level elements not found in card:', card);
            return;
        }

        const itemId = card.dataset.id;
        const ingredients = card.dataset.ingredients || '';

        if (ingredients.toLowerCase().includes('beef patty')) {
            cookingLevelSection.style.display = 'block';
            const currentCookingLevel = customizedItems[itemId]?.cookingLevel || 'medium';
            const options = ['Rare', 'Medium-Rare', 'Medium', 'Medium-Well', 'Well-Done'];
            cookingLevelOptions.innerHTML = options.map(option => `
                <label>
                    <input type="radio" name="cooking-level-${itemId}" value="${option.toLowerCase()}" ${currentCookingLevel === option.toLowerCase() ? 'checked' : ''}>
                    ${option}
                </label>
            `).join('');

            cookingLevelOptions.querySelectorAll('input[type="radio"]').forEach(radio => {
                radio.addEventListener('change', (e) => {
                    if (!customizedItems[itemId]) customizedItems[itemId] = {};
                    customizedItems[itemId].cookingLevel = e.target.value;
                });
            });
        } else {
            cookingLevelSection.style.display = 'none';
            if (customizedItems[itemId]) delete customizedItems[itemId].cookingLevel;
        }
    }

    function addToCart(card) {
        console.log('addToCart called for card:', card);
        const itemId = card.dataset.id;
        if (!itemId) {
            console.error('Item ID not found on card:', card);
            return;
        }

        const nameElement = card.querySelector('h3');
        const priceElement = card.querySelector('.price');
        const quantityElement = card.querySelector('.quantity-value');

        if (!nameElement || !priceElement || !quantityElement) {
            console.error('Required elements missing:', { nameElement, priceElement, quantityElement });
            return;
        }

        const name = nameElement.textContent;
        const basePriceStr = priceElement.textContent;
        const basePrice = parseInt(basePriceStr.replace(/[^0-9]/g, ''), 10) || 0;
        const quantity = parseInt(quantityElement.textContent) || 1;

        console.log('Item details:', { itemId, name, basePrice, quantity });

        // Ensure customizedItems[itemId] is initialized
        if (!customizedItems[itemId]) {
            customizedItems[itemId] = {
                ingredients: (card.dataset.ingredients?.split(', ') || []).map(ingredient => ({
                    name: ingredient,
                    removable: !ingredient.toLowerCase().includes('patty') && !ingredient.toLowerCase().includes('bun'),
                    removed: false
                })),
                addOns: addOns.map(addOn => ({
                    name: addOn.name,
                    selected: false
                }))
            };
        }

        const removedIngredients = customizedItems[itemId].ingredients.filter(i => i.removed).map(i => i.name);
        const selectedAddOns = customizedItems[itemId].addOns.filter(a => a.selected).map(a => a.name);
        const cookingLevel = customizedItems[itemId].cookingLevel || '';

        const addOnsTotal = selectedAddOns.reduce((sum, addOnName) => {
            const addOn = addOns.find(a => a.name === addOnName);
            return sum + (addOn ? addOn.price : 0);
        }, 0);

        const totalPrice = basePrice + addOnsTotal;
        const priceStr = `${totalPrice}Rs`;

        const customizations = [
            ...removedIngredients.map(ing => `without ${ing}`),
            ...selectedAddOns.map(addOn => `with ${addOn}`),
            cookingLevel ? `cooked ${cookingLevel}` : ''
        ].filter(Boolean).join(', ');

        const existingItem = selectedItems.find(item => item.id === itemId && item.customizations === customizations);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            selectedItems.push({ id: itemId, name, price: priceStr, quantity, customizations });
        }

        console.log('Updated selectedItems:', selectedItems);
        updateCartCount();
        showOrderNotice();
        deactivateCard();
        updateOrderSummary();
    }

    function showOrderNotice() {
        let notice = document.getElementById('order-notice');
        if (!notice) {
            notice = document.createElement('div');
            notice.id = 'order-notice';
            notice.style.cssText = 'position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: var(--flag-yellow); color: #000; padding: 10px 20px; border-radius: 5px; z-index: 1001; font-weight: bold;';
            document.body.appendChild(notice);
        }
        notice.textContent = 'Item added to your order 👍';
        notice.style.display = 'block';
        setTimeout(() => notice.style.display = 'none', 2000);
    }

    // Order Summary and Checkout
    const orderSummaryContent = document.querySelector('.order-summary-content');
    const emptyOrderMessage = document.querySelector('.empty-order-message');
    const clearOrderBtn = document.getElementById('clear-order-btn');
    const checkoutOrderBtn = document.getElementById('checkout-order-btn');
    const orderModal = document.getElementById('order-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const completeOrderBtn = document.getElementById('complete-order-btn');
    const modalOrderItems = document.getElementById('modal-order-items');
    const modalOrderTotal = document.getElementById('modal-order-total');

    function updateOrderSummary() {
        if (!orderSummaryContent || !emptyOrderMessage) {
            console.warn('Order summary elements not found');
            return;
        }
        const itemsContainer = orderSummaryContent.querySelector('.order-items-container');
        const totalElement = orderSummaryContent.querySelector('.order-total');
        if (itemsContainer) orderSummaryContent.removeChild(itemsContainer);
        if (totalElement) orderSummaryContent.removeChild(totalElement);

        if (!selectedItems.length) {
            emptyOrderMessage.style.display = 'flex';
            if (checkoutOrderBtn) {
                checkoutOrderBtn.disabled = true;
                checkoutOrderBtn.style.opacity = '0.5';
                checkoutOrderBtn.style.cursor = 'not-allowed';
            }
            return;
        }
        emptyOrderMessage.style.display = 'none';
        if (checkoutOrderBtn) {
            checkoutOrderBtn.disabled = false;
            checkoutOrderBtn.style.opacity = '1';
            checkoutOrderBtn.style.cursor = 'pointer';
        }

        const newItemsContainer = document.createElement('div');
        newItemsContainer.className = 'order-items-container';
        let total = 0;

        selectedItems.forEach((item, index) => {
            const priceNum = parseInt(item.price.replace(/[^0-9]/g, ''), 10) || 0;
            const itemTotal = priceNum * (item.quantity || 1);
            total += itemTotal;
            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';
            orderItem.innerHTML = `
                <div class="order-item-name">
                    <button class="order-item-remove" data-index="${index}"><i class="fas fa-times"></i></button>
                    ${item.name}${item.customizations ? ` (${item.customizations})` : ''} ${item.quantity > 1 ? `x${item.quantity}` : ''}
                </div>
                <div class="order-item-price">${itemTotal}Rs</div>
            `;
            newItemsContainer.appendChild(orderItem);
        });

        const newTotal = document.createElement('div');
        newTotal.className = 'order-total';
        newTotal.innerHTML = `<div class="order-total-label">Total:</div><div class="order-total-amount">${total}Rs</div>`;
        orderSummaryContent.appendChild(newItemsContainer);
        orderSummaryContent.appendChild(newTotal);

        document.querySelectorAll('.order-item-remove').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(button.dataset.index);
                if (selectedItems[index].quantity > 1) {
                    selectedItems[index].quantity -= 1;
                } else {
                    selectedItems.splice(index, 1);
                }
                updateCartCount();
                updateOrderSummary();
            });
        });
    }

    if (clearOrderBtn) clearOrderBtn.addEventListener('click', () => {
        selectedItems = [];
        updateCartCount();
        updateOrderSummary();
    });

    if (checkoutOrderBtn) checkoutOrderBtn.addEventListener('click', () => {
        if (!selectedItems.length) {
            alert('Your order is empty. Please add items first.');
            return;
        }
        updateModalContent();
        if (orderModal) {
            orderModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });

    if (closeModalBtn) closeModalBtn.addEventListener('click', () => {
        if (orderModal) {
            orderModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    if (orderModal) orderModal.addEventListener('click', (e) => {
        if (e.target === orderModal) {
            orderModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    function updateModalContent() {
        if (!modalOrderItems || !modalOrderTotal) {
            console.warn('Modal elements not found');
            return;
        }
        modalOrderItems.innerHTML = '';
        let total = 0;
        selectedItems.forEach(item => {
            const priceNum = parseInt(item.price.replace(/[^0-9]/g, ''), 10) || 0;
            const itemTotal = priceNum * (item.quantity || 1);
            total += itemTotal;
            const summaryItem = document.createElement('div');
            summaryItem.className = 'summary-item';
            summaryItem.innerHTML = `<span>${item.name}${item.customizations ? ` (${item.customizations})` : ''} ${item.quantity > 1 ? `x${item.quantity}` : ''}</span><span>${itemTotal}Rs</span>`;
            modalOrderItems.appendChild(summaryItem);
        });
        modalOrderTotal.textContent = `${total}Rs`;
    }

    if (completeOrderBtn) completeOrderBtn.addEventListener('click', () => {
        const deliveryOption = document.querySelector('input[name="delivery-option"]:checked')?.value || 'delivery';
        const whatsappNumber = deliveryOption === 'delivery' ? '+23059330011' : '+23057110755';
        let orderText = `Hello, I would like to place an order:\n\n`;
        let total = 0;
        selectedItems.forEach(item => {
            const priceNum = parseInt(item.price.replace(/[^0-9]/g, ''), 10) || 0;
            const itemTotal = priceNum * (item.quantity || 1);
            total += itemTotal;
            orderText += `- ${item.name}${item.customizations ? ` (${item.customizations})` : ''} ${item.quantity > 1 ? `x${item.quantity}` : ''}: ${itemTotal}Rs\n`;
        });
        orderText += `\nTotal: ${total}Rs\nOption: ${deliveryOption === 'delivery' ? 'Delivery' : 'Pickup'}`;
        const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(orderText)}`;
        window.open(whatsappLink, '_blank');
        if (orderModal) {
            orderModal.classList.remove('active');
            document.body.style.overflow = '';
        }
        selectedItems = [];
        updateCartCount();
        updateOrderSummary();
    });

    // Reservation Modal Handling
    const modal = document.getElementById('reservation-modal');
    const reserveTriggers = document.querySelectorAll('.reserve-trigger');
    const closeModal = document.querySelector('.modal .close');

    if (modal && reserveTriggers && closeModal) {
        reserveTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                modal.style.display = 'flex';
                setTimeout(() => {
                    modal.classList.add('active');
                }, 10);
            });
        });

        closeModal.addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 300);
            }
        });

        const reservationForm = document.getElementById('reservation-form');
        if (reservationForm) {
            reservationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const date = document.getElementById('res-date')?.value;
                const time = document.getElementById('res-time')?.value;
                const partySize = document.getElementById('party-size')?.value;
                const name = document.getElementById('name')?.value;
                const contact = document.getElementById('contact')?.value;

                if (date && time && partySize && name && contact) {
                    const message = `Reservation: Date: ${date}, Time: ${time}, Party Size: ${partySize}, Name: ${name}, Contact: ${contact}`;
                    const whatsappLink = `https://wa.me/+23057110755?text=${encodeURIComponent(message)}`;
                    window.open(whatsappLink, '_blank');
                    modal.classList.remove('active');
                    setTimeout(() => {
                        modal.style.display = 'none';
                    }, 300);
                    alert('Reservation request sent via WhatsApp!');
                } else {
                    alert('Please fill in all fields.');
                }
            });
        }
    }

    // Initialize Components
    initializeMenuInteraction();
    updateOrderSummary();
    updateCartCount();
});
