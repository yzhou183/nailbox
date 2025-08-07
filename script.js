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
        this.currentLanguage = localStorage.getItem('nailbox-language') || 'zh';
        
        this.init();
    }

    // 刷新预约数据
    refreshBookings() {
        this.bookings = JSON.parse(localStorage.getItem('nailbox-bookings') || '[]');
        
        // 如果当前在客户预约管理页面，重新显示
        if (this.currentPage === 'my-booking-page' && 
            document.getElementById('booking-list').style.display !== 'none') {
            const phone = document.getElementById('login-phone').value.trim();
            if (phone) {
                const userBookings = this.bookings.filter(booking => booking.phone === phone);
                this.displayUserBookings(userBookings);
            }
        }
        
        // 如果当前在预约时间选择页面，重新生成时间槽
        if (this.currentPage === 'booking-page' && this.selectedDate) {
            this.generateTimeSlots();
        }
        
        // 如果当前在管理员页面，刷新管理员数据
        if (this.currentPage === 'admin-dashboard-page') {
            this.loadAdminDashboard();
        }
    }

    init() {
        this.bindEvents();
        this.updateServiceSelection();
        this.generateCalendar();
        this.initLanguage();
    }

    // 初始化语言设置
    initLanguage() {
        this.updateLanguageButtons(this.currentLanguage);
        this.updateLanguage(this.currentLanguage);
    }

    // 切换语言
    switchLanguage(language) {
        this.updateLanguageButtons(language);
        this.updateLanguage(language);
    }

    // 更新语言按钮状态
    updateLanguageButtons(language) {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`lang-${language}`).classList.add('active');
    }

    // 更新语言显示
    updateLanguage(language) {
        this.currentLanguage = language;
        localStorage.setItem('nailbox-language', language);
        
        // 更新所有带有语言属性的元素
        document.querySelectorAll('[data-zh][data-en]').forEach(element => {
            if (language === 'en') {
                element.textContent = element.getAttribute('data-en');
            } else {
                element.textContent = element.getAttribute('data-zh');
            }
        });
        
        // 更新标题
        document.title = language === 'en' ? 'NailBox - Nail Appointment System' : 'NailBox - 美甲预约管理系统';
    }

    // 下拉菜单控制
    toggleDropdown() {
        const dropdown = document.getElementById('dropdown-content');
        dropdown.classList.toggle('show');
    }

    hideDropdown() {
        const dropdown = document.getElementById('dropdown-content');
        dropdown.classList.remove('show');
    }

    // 停车说明折叠面板控制
    toggleParkingAccordion() {
        const header = document.getElementById('parking-toggle');
        const content = document.getElementById('parking-content');
        
        header.classList.toggle('expanded');
        content.classList.toggle('expanded');
    }

    bindEvents() {
        document.getElementById('book-btn').addEventListener('click', () => {
            this.navigateTo('service-page');
        });

        document.getElementById('my-booking-btn').addEventListener('click', () => {
            this.navigateTo('my-booking-page');
        });

        document.getElementById('menu-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        document.getElementById('admin-menu-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.navigateTo('admin-login-page');
            this.hideDropdown();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            this.hideDropdown();
        });

        document.getElementById('lang-zh').addEventListener('click', () => {
            this.switchLanguage('zh');
        });

        document.getElementById('lang-en').addEventListener('click', () => {
            this.switchLanguage('en');
        });

        document.getElementById('parking-toggle').addEventListener('click', () => {
            this.toggleParkingAccordion();
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

        document.getElementById('refresh-bookings').addEventListener('click', () => {
            this.refreshBookings();
            // 显示刷新动画
            const refreshBtn = document.getElementById('refresh-bookings');
            refreshBtn.textContent = '🔄 刷新中...';
            setTimeout(() => {
                refreshBtn.innerHTML = '🔄 刷新状态';
            }, 1000);
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
        this.bindAdminEvents();
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

        // 获取选中日期的已确认预约
        const bookedTimes = this.getBookedTimesForDate(this.selectedDate);

        timeSlots.forEach(time => {
            const timeEl = document.createElement('div');
            const isBooked = bookedTimes.includes(time);
            
            if (isBooked) {
                timeEl.className = 'time-slot booked';
                timeEl.textContent = time;
                timeEl.title = '该时间段已被预约';
            } else {
                timeEl.className = 'time-slot';
                timeEl.textContent = time;
                timeEl.addEventListener('click', () => {
                    this.selectTime(time, timeEl);
                });
            }
            
            timeSlotsContainer.appendChild(timeEl);
        });
    }

    // 获取指定日期已预约的时间段
    getBookedTimesForDate(selectedDate) {
        if (!selectedDate) return [];
        
        // 确保使用最新的预约数据
        this.bookings = JSON.parse(localStorage.getItem('nailbox-bookings') || '[]');
        
        // 获取该日期所有已确认的预约（不包括已取消和已拒绝的）
        const confirmedBookings = this.bookings.filter(booking => {
            return booking.date === selectedDate && 
                   booking.status === 'confirmed';
        });
        
        return confirmedBookings.map(booking => booking.time);
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

        // 重新从 localStorage 读取最新的预约数据
        this.bookings = JSON.parse(localStorage.getItem('nailbox-bookings') || '[]');
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
            'cancelled': '已取消',
            'rejected': '已拒绝'
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
            // 重新从 localStorage 读取最新数据
            this.bookings = JSON.parse(localStorage.getItem('nailbox-bookings') || '[]');
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

    // Admin Management Functions
    bindAdminEvents() {
        // Admin login
        document.getElementById('admin-login-btn').addEventListener('click', () => {
            this.adminLogin();
        });

        // Admin logout
        document.getElementById('admin-logout').addEventListener('click', () => {
            this.adminLogout();
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchAdminTab(e.target.dataset.tab);
            });
        });

        // Modal events
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeModal();
        });

        document.querySelector('.close-modal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('confirm-booking').addEventListener('click', () => {
            this.confirmBooking();
        });

        document.getElementById('reject-booking').addEventListener('click', () => {
            this.rejectBooking();
        });

        document.getElementById('cancel-confirmed-booking').addEventListener('click', () => {
            this.cancelConfirmedBooking();
        });

        // Click outside modal to close
        document.getElementById('booking-detail-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeModal();
            }
        });
    }

    adminLogin() {
        const username = document.getElementById('admin-username').value.trim();
        const password = document.getElementById('admin-password').value.trim();

        // Simple authentication (in production, use proper authentication)
        if (username === 'admin' && password === 'nailbox123') {
            localStorage.setItem('nailbox-admin-logged-in', 'true');
            this.navigateTo('admin-dashboard-page');
            this.loadAdminDashboard();
        } else {
            alert('用户名或密码错误！\n\n测试账号:\n用户名: admin\n密码: nailbox123');
        }
    }

    adminLogout() {
        if (confirm('确定要退出登录吗？')) {
            localStorage.removeItem('nailbox-admin-logged-in');
            this.navigateTo('home-page');
            // Clear form
            document.getElementById('admin-username').value = '';
            document.getElementById('admin-password').value = '';
        }
    }

    loadAdminDashboard() {
        this.updateAdminStats();
        this.displayAdminBookings('pending');
    }

    updateAdminStats() {
        const pendingBookings = this.bookings.filter(b => b.status === 'pending');
        const confirmedBookings = this.bookings.filter(b => b.status === 'confirmed');
        
        const today = new Date().toDateString();
        const todayBookings = this.bookings.filter(b => 
            new Date(b.date).toDateString() === today && b.status === 'confirmed'
        );

        // Update stat cards
        document.getElementById('pending-count').textContent = pendingBookings.length;
        document.getElementById('confirmed-count').textContent = confirmedBookings.length;
        document.getElementById('today-count').textContent = todayBookings.length;

        // Update tab counts
        document.getElementById('pending-tab-count').textContent = pendingBookings.length;
        document.getElementById('confirmed-tab-count').textContent = confirmedBookings.length;
    }

    switchAdminTab(tabName) {
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`admin-${tabName}-bookings`).classList.add('active');

        // Load bookings for the tab
        this.displayAdminBookings(tabName);
    }

    displayAdminBookings(filter) {
        let bookingsToShow = [];
        
        switch (filter) {
            case 'pending':
                bookingsToShow = this.bookings.filter(b => b.status === 'pending');
                break;
            case 'confirmed':
                bookingsToShow = this.bookings.filter(b => b.status === 'confirmed');
                break;
            case 'all':
                bookingsToShow = this.bookings;
                break;
        }

        // Sort by creation date (newest first)
        bookingsToShow.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const containerId = `admin-${filter}-bookings`;
        const container = document.getElementById(containerId);

        if (bookingsToShow.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📅</div>
                    <p>暂无${this.getFilterText(filter)}预约</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        bookingsToShow.forEach(booking => {
            const bookingEl = this.createAdminBookingItem(booking);
            container.appendChild(bookingEl);
        });
    }

    getFilterText(filter) {
        const filterMap = {
            'pending': '待确认',
            'confirmed': '已确认',
            'all': ''
        };
        return filterMap[filter] || '';
    }

    createAdminBookingItem(booking) {
        const div = document.createElement('div');
        div.className = `admin-booking-item ${booking.status}`;
        
        const bookingDate = new Date(booking.date).toLocaleDateString('zh-CN');
        const createdDate = new Date(booking.createdAt).toLocaleString('zh-CN');
        
        let addonsHtml = '';
        if (booking.addons && booking.addons.length > 0) {
            addonsHtml = '<strong>增值服务:</strong><br>' + 
                booking.addons.map(addon => `• ${addon.name} - $${addon.price}`).join('<br>');
        }

        div.innerHTML = `
            <div class="admin-booking-header">
                <div class="admin-booking-id">预约 #${booking.id}</div>
                <div class="admin-booking-time">${createdDate}</div>
            </div>
            <div class="admin-booking-details">
                <div class="admin-booking-detail">
                    <strong>客户:</strong> ${booking.name} (${booking.phone})
                </div>
                <div class="admin-booking-detail">
                    <strong>日期:</strong> ${bookingDate} ${booking.time}
                </div>
                <div class="admin-booking-detail">
                    <strong>服务:</strong> ${booking.service.name} - $${booking.service.price}
                </div>
                ${addonsHtml ? `<div class="admin-booking-detail">${addonsHtml}</div>` : ''}
                <div class="admin-booking-detail">
                    <strong>总价:</strong> $${booking.totalPrice}
                </div>
                <div class="admin-booking-detail">
                    <strong>总时长:</strong> ${Math.floor(booking.totalDuration / 60)}小时${booking.totalDuration % 60}分钟
                </div>
                <div class="admin-booking-detail">
                    <strong>状态:</strong> 
                    <span class="booking-status ${booking.status}">${this.getStatusText(booking.status)}</span>
                </div>
            </div>
            <div class="admin-booking-actions">
                ${booking.status === 'pending' ? `
                    <button class="quick-confirm-btn" onclick="app.quickConfirmBooking(${booking.id})">
                        快速确认
                    </button>
                    <button class="quick-reject-btn" onclick="app.quickRejectBooking(${booking.id})">
                        拒绝
                    </button>
                ` : ''}
                ${booking.status === 'confirmed' ? `
                    <button class="admin-cancel-btn" onclick="app.adminCancelBooking(${booking.id})">
                        取消预约
                    </button>
                ` : ''}
                <button class="view-detail-btn" onclick="app.viewBookingDetail(${booking.id})">
                    查看详情
                </button>
            </div>
        `;

        return div;
    }

    quickConfirmBooking(bookingId) {
        if (confirm('确定要确认这个预约吗？')) {
            this.updateBookingStatus(bookingId, 'confirmed');
        }
    }

    quickRejectBooking(bookingId) {
        if (confirm('确定要拒绝这个预约吗？')) {
            this.updateBookingStatus(bookingId, 'rejected');
        }
    }

    adminCancelBooking(bookingId) {
        if (confirm('确定要取消这个已确认的预约吗？取消后客户会收到通知。')) {
            this.updateBookingStatus(bookingId, 'cancelled');
        }
    }

    updateBookingStatus(bookingId, status) {
        const bookingIndex = this.bookings.findIndex(b => b.id === bookingId);
        if (bookingIndex !== -1) {
            this.bookings[bookingIndex].status = status;
            this.bookings[bookingIndex].updatedAt = new Date().toISOString();
            localStorage.setItem('nailbox-bookings', JSON.stringify(this.bookings));
            
            // Show success message
            const statusText = status === 'confirmed' ? '确认' : (status === 'rejected' ? '拒绝' : '更新');
            alert(`预约已${statusText}！${status === 'confirmed' ? '系统已自动发送确认通知。' : ''}`);
            
            // Refresh dashboard
            this.loadAdminDashboard();
            
            // Refresh current tab
            const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
            this.displayAdminBookings(activeTab);
        }
    }

    viewBookingDetail(bookingId) {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (!booking) return;

        this.currentBookingId = bookingId;
        const modal = document.getElementById('booking-detail-modal');
        const content = document.getElementById('booking-detail-content');
        
        const bookingDate = new Date(booking.date).toLocaleDateString('zh-CN');
        const createdDate = new Date(booking.createdAt).toLocaleString('zh-CN');
        
        let addonsHtml = '';
        if (booking.addons && booking.addons.length > 0) {
            addonsHtml = `
                <div class="modal-booking-detail">
                    <strong>增值服务:</strong><br>
                    ${booking.addons.map(addon => `• ${addon.name} - $${addon.price} (${addon.duration}分钟)`).join('<br>')}
                </div>
            `;
        }

        content.innerHTML = `
            <div class="modal-booking-detail">
                <strong>预约号:</strong> #${booking.id}
            </div>
            <div class="modal-booking-detail">
                <strong>客户信息:</strong> ${booking.name}
            </div>
            <div class="modal-booking-detail">
                <strong>联系电话:</strong> ${booking.phone}
            </div>
            <div class="modal-booking-detail">
                <strong>预约日期:</strong> ${bookingDate}
            </div>
            <div class="modal-booking-detail">
                <strong>预约时间:</strong> ${booking.time}
            </div>
            <div class="modal-booking-detail">
                <strong>基础服务:</strong> ${booking.service.name} - $${booking.service.price} (${booking.service.duration}分钟)
            </div>
            ${addonsHtml}
            <div class="modal-booking-detail">
                <strong>总价:</strong> $${booking.totalPrice}
            </div>
            <div class="modal-booking-detail">
                <strong>总时长:</strong> ${Math.floor(booking.totalDuration / 60)}小时${booking.totalDuration % 60}分钟
            </div>
            <div class="modal-booking-detail">
                <strong>当前状态:</strong> 
                <span class="booking-status ${booking.status}">${this.getStatusText(booking.status)}</span>
            </div>
            <div class="modal-booking-detail">
                <strong>提交时间:</strong> ${createdDate}
            </div>
            ${booking.updatedAt ? `
                <div class="modal-booking-detail">
                    <strong>更新时间:</strong> ${new Date(booking.updatedAt).toLocaleString('zh-CN')}
                </div>
            ` : ''}
        `;

        // Show/hide action buttons based on status
        const confirmBtn = document.getElementById('confirm-booking');
        const rejectBtn = document.getElementById('reject-booking');
        const cancelBtn = document.getElementById('cancel-confirmed-booking');
        
        if (booking.status === 'pending') {
            confirmBtn.style.display = 'inline-block';
            rejectBtn.style.display = 'inline-block';
            if (cancelBtn) cancelBtn.style.display = 'none';
        } else if (booking.status === 'confirmed') {
            confirmBtn.style.display = 'none';
            rejectBtn.style.display = 'none';
            if (cancelBtn) cancelBtn.style.display = 'inline-block';
        } else {
            confirmBtn.style.display = 'none';
            rejectBtn.style.display = 'none';
            if (cancelBtn) cancelBtn.style.display = 'none';
        }

        modal.style.display = 'flex';
    }

    closeModal() {
        document.getElementById('booking-detail-modal').style.display = 'none';
        this.currentBookingId = null;
    }

    confirmBooking() {
        if (this.currentBookingId && confirm('确定要确认这个预约吗？')) {
            this.updateBookingStatus(this.currentBookingId, 'confirmed');
            this.closeModal();
        }
    }

    rejectBooking() {
        if (this.currentBookingId && confirm('确定要拒绝这个预约吗？')) {
            this.updateBookingStatus(this.currentBookingId, 'rejected');
            this.closeModal();
        }
    }

    cancelConfirmedBooking() {
        if (this.currentBookingId && confirm('确定要取消这个已确认的预约吗？取消后客户会收到通知。')) {
            this.updateBookingStatus(this.currentBookingId, 'cancelled');
            this.closeModal();
        }
    }

}

function goBack() {
    app.goBack();
}

const app = new NailBoxApp();