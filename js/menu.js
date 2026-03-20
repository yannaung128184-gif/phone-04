document.addEventListener('DOMContentLoaded', () => {
    // ၁။ Variable များ သတ်မှတ်ခြင်း
    const modal = document.getElementById('orderModal');
    const closeBtn = document.querySelector('.close-btn');
    const orderForm = document.getElementById('orderForm'); // ဒီမှာ တစ်ခါပဲ ကြေညာပါ
    const filterButtons = document.querySelectorAll('.filter-btn');
    const menuItems = document.querySelectorAll('.menu-item');
    const searchInput = document.getElementById('menuSearch');
    const qtyCount = document.getElementById('qty-count');
    const plusBtn = document.getElementById('plus');
    const minusBtn = document.getElementById('minus');
    const totalAmountDisplay = document.getElementById('total-amount');

    let count = 1;
    let currentItemName = '';
    let unitPrice = 0;

    // ဈေးနှုန်းတွက်ချက်သည့် Function
    function updateTotal() {
        const total = unitPrice * count;
        if (totalAmountDisplay) {
            totalAmountDisplay.innerText = total.toLocaleString();
        }
    }

    // ၂။ Category Filter စနစ်
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filterValue = button.getAttribute('data-filter');
            menuItems.forEach(item => {
                if (filterValue === 'all' || item.classList.contains(filterValue)) {
                    item.style.display = "block";
                } else {
                    item.style.display = "none";
                }
            });
        });
    });

    // ၃။ Search စနစ်
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchText = e.target.value.toLowerCase();
            menuItems.forEach(item => {
                const itemName = item.querySelector('h3').innerText.toLowerCase();
                item.style.display = itemName.includes(searchText) ? "block" : "none";
            });
        });
    }

    // ၄။ Quantity (+ / -) လုပ်ဆောင်ချက်
    if (plusBtn && minusBtn) {
        plusBtn.onclick = () => {
            count++;
            qtyCount.innerText = count;
            updateTotal();
        };
        minusBtn.onclick = () => {
            if (count > 1) {
                count--;
                qtyCount.innerText = count;
                updateTotal();
            }
        };
    }

    // ၅။ Add to Cart နှိပ်ရင် Modal ဖွင့်ခြင်း
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemCard = e.target.closest('.menu-item');
            currentItemName = itemCard.querySelector('h3').innerText;
            
            const priceText = itemCard.querySelector('.menu-price').innerText;
            unitPrice = parseInt(priceText.replace(/[^0-9]/g, '')); 
            
            document.getElementById('modalItemName').innerText = currentItemName;
            
            count = 1; 
            qtyCount.innerText = count;
            updateTotal(); 
            
            modal.style.display = 'block';
        });
    });

    // ၆။ Modal ပိတ်ခြင်း
    if (closeBtn) {
        closeBtn.onclick = () => modal.style.display = 'none';
    }
    window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

    // ၇။ Telegram ပို့ခြင်း
    if (orderForm) {
        orderForm.onsubmit = async (e) => {
            e.preventDefault();
            
            const phone = document.getElementById('phone').value;
            const noteInput = document.getElementById('note'); // HTML မှာ id="note" ရှိရပါမယ်
            const note = (noteInput && noteInput.value.trim() !== "") ? noteInput.value : "မရှိပါ";
            const qty = qtyCount.innerText;
            const totalAmount = totalAmountDisplay ? totalAmountDisplay.innerText : "0";
            const photoInput = document.getElementById('payment-ss');
            
            if (!photoInput || !photoInput.files[0]) {
                alert("ကျေးဇူးပြု၍ ငွေလွှဲ Screenshot တင်ပေးပါဦး။");
                return;
            }
            const photoFile = photoInput.files[0];

            const token = '7335432552:AAHBiygwNeNvW9U5axDA1Q816eO7RCBrgcs'; 
            const chat_id = '1730718685'; 

            const captionText = `🛒 **New Order Received!**\n\n` +
                                `☕ Item: ${currentItemName}\n` +
                                `🔢 Quantity: ${qty}\n` +
                                `💰 Total: ${totalAmount} MMK\n` +
                                `📞 Phone: ${phone}\n` +
                                `📝 Note: ${note}`;

            const formData = new FormData();
            formData.append('chat_id', chat_id);
            formData.append('photo', photoFile);
            formData.append('caption', captionText);
            formData.append('parse_mode', 'Markdown');

            try {
                const submitBtn = orderForm.querySelector('.confirm-btn');
                submitBtn.disabled = true;
                submitBtn.innerText = "Sending...";

                const response = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    alert('Order အောင်မြင်စွာ ပေးပို့ပြီးပါပြီ။ ☕');
                    modal.style.display = 'none';
                    orderForm.reset();
                    qtyCount.innerText = "1";
                    updateTotal();
                } else {
                    alert('Telegram ပို့ရာတွင် အမှားရှိနေပါသည်။');
                }
            } catch (error) {
                alert('အင်တာနက် ချိတ်ဆက်မှု မရှိပါ။');
            } finally {
                const submitBtn = orderForm.querySelector('.confirm-btn');
                submitBtn.disabled = false;
                submitBtn.innerText = "Confirm Order & Send Slip";
            }
        };
    }
}); // DOMContentLoaded အပိတ်