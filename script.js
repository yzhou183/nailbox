class NailBoxApp {
    constructor() {
        this.currentPage = 'home-page';
        this.pageHistory = [];
        this.selectedService = null;
        this.selectedAddons = [];
        this.selectedDate = null;
        this.selectedTime = null;
        this.customerInfo = {};
        this.bookings = JSON.parse(localStorage.getItem('nailbox-bookings') || '[]');
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateServiceSelection();
        this.generateCalendar();
    }

    bindEvents() {
        document.getElementById('book-btn').addEventListener('click', () => {
            this.navigateTo('service-page');
        });

        document.getElementById('my-booking-btn').addEventListener('click', () => {
            this.navigateTo('my-booking-page');
        });

        document.getElementById('next-to-booking').addEventListener('click', () => {
            if (this.validateServiceSelection()) {
                this.navigateTo('booking-page');
            }
        });

        document.getElementById('next-to-info').addEventListener('click', () => {
            if (this.selectedDate && this.selectedTime) {
                this.navigateTo('info-page');
                this.updateBookingSummary();
            }
        });

        document.getElementById('submit-booking').addEventListener('click', () => {
            this.submitBooking();
        });

        document.getElementById('login-btn').addEventListener('click', () => {
            this.loginUser();
        });

        document.getElementById('back-to-home').addEventListener('click', () => {
            this.navigateTo('home-page');
        });

        document.getElementById('view-my-bookings').addEventListener('click', () => {
            this.navigateTo('my-booking-page');
        });

        document.getElementById('customer-name').addEventListener('input', () => {
            this.validateInfoForm();
        });

        document.getElementById('customer-phone').addEventListener('input', () => {
            this.validateInfoForm();
        });

        document.querySelectorAll('input[name="basic-service"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.updateServiceSelection();
                this.animateSelection(radio.closest('.service-item'));
            });
        });

        document.querySelectorAll('input[name="addon"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateServiceSelection();
                this.animateSelection(checkbox.closest('.addon-item'));
            });
        });

        this.bindCalendarEvents();
    }

    navigateTo(pageId) {
        const currentPageEl = document.querySelector('.page.active');
        if (currentPageEl) {
            this.pageHistory.push(this.currentPage);
            currentPageEl.classList.remove('active');
        }

        this.currentPage = pageId;
        const targetPage = document.getElementById(pageId);
        targetPage.classList.add('active');
        
        // Add fade-in animation
        setTimeout(() => {
            targetPage.classList.add('fade-in');
        }, 50);
    }

    goBack() {
        if (this.pageHistory.length > 0) {
            const previousPage = this.pageHistory.pop();
            const currentPageEl = document.querySelector('.page.active');
            if (currentPageEl) {
                currentPageEl.classList.remove('active');
            }
            
            this.currentPage = previousPage;
            document.getElementById(previousPage).classList.add('active');
        }
    }

    validateServiceSelection() {
        const selectedService = document.querySelector('input[name="basic-service"]:checked');
        return selectedService !== null;
    }

    updateServiceSelection() {
        const selectedService = document.querySelector('input[name="basic-service"]:checked');
        const selectedAddons = document.querySelectorAll('input[name="addon"]:checked');
        
        let totalPrice = 0;
        let totalDuration = 0;
        let services = [];

        if (selectedService) {
            const serviceItem = selectedService.closest('.service-item');
            const price = serviceItem.dataset.price;
            const duration = parseInt(serviceItem.dataset.duration) || 0;
            const serviceName = serviceItem.querySelector('h4').textContent;
            
            services.push(serviceName);
            if (price.includes('-')) {
                totalPrice += parseInt(price.split('-')[0]);
            } else {
                totalPrice += parseInt(price);
            }
            totalDuration += duration;

            this.selectedService = {
                name: serviceName,
                price: price,
                duration: duration
            };
        }

        this.selectedAddons = [];
        selectedAddons.forEach(addon => {
            const addonItem = addon.closest('.addon-item');
            const price = addonItem.dataset.price;
            const duration = parseInt(addonItem.dataset.duration) || 0;
            const addonName = addonItem.querySelector('h4').textContent;
            
            services.push(addonName);
            if (price.includes('-')) {
                totalPrice += parseInt(price.split('-')[0]);
            } else {
                totalPrice += parseInt(price);
            }
            totalDuration += duration;

            this.selectedAddons.push({
                name: addonName,
                price: price,
                duration: duration
            });
        });

        document.getElementById('selected-services').innerHTML = 
            services.length > 0 ? `<strong>已选服务:</strong><br>${services.join('<br>')}` : '';
        document.getElementById('total-price').textContent = `总价: $${totalPrice}`;
        document.getElementById('total-duration').textContent = 
            `总时长: ${Math.floor(totalDuration / 60)}小时${totalDuration % 60}分钟`;

        document.getElementById('next-to-booking').disabled = !selectedService;
    }

    generateCalendar() {
        const calendar = document.getElementById('calendar');
        const today = new Date();
        const currentWeek = this.getCurrentWeek(today);
        
        this.updateWeekDisplay(currentWeek);
        this.renderCalendar(currentWeek);
    }

    getCurrentWeek(date) {
        const week = [];
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day;
        startOfWeek.setDate(diff);

        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            week.push(day);
        }
        return week;
    }

    updateWeekDisplay(week) {
        const start = week[0];
        const end = week[6];
        const options = { month: 'short', day: 'numeric' };
        document.getElementById('current-week').textContent = 
            `${start.toLocaleDateString('zh-CN', options)} - ${end.toLocaleDateString('zh-CN', options)}`;
    }

    renderCalendar(week) {
        const calendar = document.getElementById('calendar');
        calendar.innerHTML = '';

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        week.forEach(date => {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.textContent = date.getDate();
            
            const dateStr = date.toDateString();
            
            if (date < today) {
                dayEl.classList.add('unavailable');
            } else {
                dayEl.classList.add('available');
                dayEl.addEventListener('click', () => {
                    this.selectDate(dateStr, dayEl);
                });
            }

            calendar.appendChild(dayEl);
        });
    }

    selectDate(dateStr, dayEl) {
        document.querySelectorAll('.calendar-day.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        dayEl.classList.add('selected');
        this.selectedDate = dateStr;
        this.generateTimeSlots();
    }

    generateTimeSlots() {
        const timeSlotsContainer = document.getElementById('available-times');
        timeSlotsContainer.innerHTML = '';

        const timeSlots = [
            '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
            '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
            '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
        ];

        timeSlots.forEach(time => {
            const timeEl = document.createElement('div');
            timeEl.className = 'time-slot';
            timeEl.textContent = time;
            timeEl.addEventListener('click', () => {
                this.selectTime(time, timeEl);
            });
            timeSlotsContainer.appendChild(timeEl);
        });
    }

    selectTime(time, timeEl) {
        document.querySelectorAll('.time-slot.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        timeEl.classList.add('selected');
        this.selectedTime = time;
        document.getElementById('next-to-info').disabled = false;
    }

    updateBookingSummary() {
        const details = document.getElementById('booking-details');
        let html = `
            <p><strong>预约日期:</strong> ${new Date(this.selectedDate).toLocaleDateString('zh-CN')}</p>
            <p><strong>预约时间:</strong> ${this.selectedTime}</p>
            <p><strong>服务:</strong> ${this.selectedService.name} - $${this.selectedService.price}</p>
        `;

        if (this.selectedAddons.length > 0) {
            html += '<p><strong>增值服务:</strong></p>';
            this.selectedAddons.forEach(addon => {
                html += `<p>• ${addon.name} - $${addon.price}</p>`;
            });
        }

        const totalPrice = this.calculateTotalPrice();
        const totalDuration = this.calculateTotalDuration();
        html += `<p><strong>总价:</strong> $${totalPrice}</p>`;
        html += `<p><strong>总时长:</strong> ${Math.floor(totalDuration / 60)}小时${totalDuration % 60}分钟</p>`;

        details.innerHTML = html;
    }

    calculateTotalPrice() {
        let total = 0;
        
        if (this.selectedService) {
            const price = this.selectedService.price;
            total += price.includes('-') ? parseInt(price.split('-')[0]) : parseInt(price);
        }
        
        this.selectedAddons.forEach(addon => {
            const price = addon.price;
            total += price.includes('-') ? parseInt(price.split('-')[0]) : parseInt(price);
        });
        
        return total;
    }

    calculateTotalDuration() {
        let total = 0;
        
        if (this.selectedService) {
            total += this.selectedService.duration;
        }
        
        this.selectedAddons.forEach(addon => {
            total += addon.duration;
        });
        
        return total;
    }

    validateInfoForm() {
        const name = document.getElementById('customer-name').value.trim();
        const phone = document.getElementById('customer-phone').value.trim();
        
        document.getElementById('submit-booking').disabled = !(name && phone);
    }

    submitBooking() {
        const name = document.getElementById('customer-name').value.trim();
        const phone = document.getElementById('customer-phone').value.trim();
        
        if (!name || !phone) {
            alert('请填写完整信息');
            return;
        }

        const booking = {
            id: Date.now(),
            name: name,
            phone: phone,
            date: this.selectedDate,
            time: this.selectedTime,
            service: this.selectedService,
            addons: this.selectedAddons,
            totalPrice: this.calculateTotalPrice(),
            totalDuration: this.calculateTotalDuration(),
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        this.bookings.push(booking);
        localStorage.setItem('nailbox-bookings', JSON.stringify(this.bookings));

        this.customerInfo = { name, phone };
        this.showConfirmation(booking);
    }

    showConfirmation(booking) {
        const confirmationDetails = document.getElementById('confirmation-details');
        confirmationDetails.innerHTML = `
            <div class="confirmation-details">
                <p><strong>预约号:</strong> ${booking.id}</p>
                <p><strong>姓名:</strong> ${booking.name}</p>
                <p><strong>电话:</strong> ${booking.phone}</p>
                <p><strong>日期:</strong> ${new Date(booking.date).toLocaleDateString('zh-CN')}</p>
                <p><strong>时间:</strong> ${booking.time}</p>
                <p><strong>服务:</strong> ${booking.service.name}</p>
                <p><strong>总价:</strong> $${booking.totalPrice}</p>
            </div>
        `;
        
        this.navigateTo('confirmation-page');
        this.resetBookingData();
    }

    resetBookingData() {
        this.selectedService = null;
        this.selectedAddons = [];
        this.selectedDate = null;
        this.selectedTime = null;
        
        document.querySelectorAll('input[name="basic-service"]').forEach(radio => {
            radio.checked = false;
        });
        
        document.querySelectorAll('input[name="addon"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        document.getElementById('customer-name').value = '';
        document.getElementById('customer-phone').value = '';
        
        this.updateServiceSelection();
    }

    loginUser() {
        const phone = document.getElementById('login-phone').value.trim();
        
        if (!phone) {
            alert('请输入手机号码');
            return;
        }

        const userBookings = this.bookings.filter(booking => booking.phone === phone);
        
        if (userBookings.length === 0) {
            alert('未找到相关预约记录');
            return;
        }

        this.displayUserBookings(userBookings);
    }

    displayUserBookings(bookings) {
        document.querySelector('.login-section').style.display = 'none';
        document.getElementById('booking-list').style.display = 'block';
        
        const bookingsContainer = document.getElementById('bookings');
        bookingsContainer.innerHTML = '';

        bookings.forEach(booking => {
            const bookingEl = document.createElement('div');
            bookingEl.className = 'booking-item';
            bookingEl.innerHTML = `
                <h4>预约 #${booking.id}</h4>
                <p><strong>日期:</strong> ${new Date(booking.date).toLocaleDateString('zh-CN')}</p>
                <p><strong>时间:</strong> ${booking.time}</p>
                <p><strong>服务:</strong> ${booking.service.name}</p>
                <p><strong>总价:</strong> $${booking.totalPrice}</p>
                <span class="booking-status ${booking.status}">${this.getStatusText(booking.status)}</span>
                <div class="booking-actions">
                    <button class="edit-btn" onclick="app.editBooking(${booking.id})">修改</button>
                    <button class="cancel-btn" onclick="app.cancelBooking(${booking.id})">取消</button>
                </div>
            `;
            bookingsContainer.appendChild(bookingEl);
        });
    }

    getStatusText(status) {
        const statusMap = {
            'pending': '等待确认',
            'confirmed': '已确认',
            'cancelled': '已取消'
        };
        return statusMap[status] || status;
    }

    editBooking(bookingId) {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (booking && booking.status !== 'cancelled') {
            alert('预约修改请求已提交，我们会尽快联系您确认新的时间。');
        }
    }

    cancelBooking(bookingId) {
        if (confirm('确定要取消这个预约吗？')) {
            const bookingIndex = this.bookings.findIndex(b => b.id === bookingId);
            if (bookingIndex !== -1) {
                this.bookings[bookingIndex].status = 'cancelled';
                localStorage.setItem('nailbox-bookings', JSON.stringify(this.bookings));
                
                const phone = document.getElementById('login-phone').value.trim();
                const userBookings = this.bookings.filter(booking => booking.phone === phone);
                this.displayUserBookings(userBookings);
                
                alert('预约已取消');
            }
        }
    }

    bindCalendarEvents() {
        document.getElementById('prev-week').addEventListener('click', () => {
            this.navigateWeek(-1);
        });

        document.getElementById('next-week').addEventListener('click', () => {
            this.navigateWeek(1);
        });
    }

    navigateWeek(direction) {
        const currentWeekText = document.getElementById('current-week').textContent;
        const [startStr] = currentWeekText.split(' - ');
        const currentDate = new Date(startStr + ' ' + new Date().getFullYear());
        
        currentDate.setDate(currentDate.getDate() + (direction * 7));
        const newWeek = this.getCurrentWeek(currentDate);
        
        this.updateWeekDisplay(newWeek);
        this.renderCalendar(newWeek);
    }

    animateSelection(element) {
        if (element) {
            element.style.transform = 'scale(0.95)';
            setTimeout(() => {
                element.style.transform = '';
            }, 150);
        }
    }

    showLoading() {
        const loading = document.createElement('div');
        loading.className = 'loading';
        loading.innerHTML = '<div class="loading-spinner"></div>';
        document.body.appendChild(loading);
        return loading;
    }

    hideLoading(loadingElement) {
        if (loadingElement && loadingElement.parentNode) {
            loadingElement.parentNode.removeChild(loadingElement);
        }
    }
}

function goBack() {
    app.goBack();
}

const app = new NailBoxApp();