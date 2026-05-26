class BookingCalendar {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.currentDate = new Date();
        this.selectedDate = null;
        this.selectedTime = null;
        this.availableSlots = [];
        
        // Byt denna till din produktions-URL senare!
        this.API_BASE = 'http://localhost:3001/api'; 

        this.init();
    }

    init() {
        this.renderInitialHTML();
        this.renderCalendar();
    }

    renderInitialHTML() {
        this.container.innerHTML = `
            <div class="booking-widget-container">
                <div class="booking-header">
                    <h3>Boka ett 1:1 Möte</h3>
                    <p>Välj en tid som passar dig för rådgivning</p>
                </div>
                
                <!-- STEG 1: Kalender -->
                <div id="booking-step-1" class="booking-step">
                    <div class="calendar-controls" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <button id="cal-prev" style="background:none;border:none;color:white;cursor:pointer;padding:5px;"><i class="fas fa-chevron-left"></i></button>
                        <strong id="cal-month" style="font-size:1.1rem;"></strong>
                        <button id="cal-next" style="background:none;border:none;color:white;cursor:pointer;padding:5px;"><i class="fas fa-chevron-right"></i></button>
                    </div>
                    
                    <div class="calendar-grid">
                        <div class="calendar-day-header">Mån</div>
                        <div class="calendar-day-header">Tis</div>
                        <div class="calendar-day-header">Ons</div>
                        <div class="calendar-day-header">Tor</div>
                        <div class="calendar-day-header">Fre</div>
                        <div class="calendar-day-header">Lör</div>
                        <div class="calendar-day-header">Sön</div>
                    </div>
                    <div id="cal-days" class="calendar-grid"></div>
                </div>

                <!-- STEG 2: Tider -->
                <div id="booking-step-2" class="booking-step hidden">
                    <button id="btn-back-1" style="background:none;border:none;color:#94a3b8;cursor:pointer;margin-bottom:10px;"><i class="fas fa-arrow-left"></i> Tillbaka till kalender</button>
                    <h4 style="margin:0 0 10px 0; color:#e2e8f0;">Tillgängliga tider för <span id="display-date"></span></h4>
                    <div id="time-slots-container" class="time-slots">
                        <!-- Tider renderas här -->
                    </div>
                </div>

                <!-- STEG 3: Formulär -->
                <div id="booking-step-3" class="booking-step hidden">
                    <button id="btn-back-2" style="background:none;border:none;color:#94a3b8;cursor:pointer;margin-bottom:10px;"><i class="fas fa-arrow-left"></i> Tillbaka till tider</button>
                    <h4 style="margin:0 0 15px 0; color:#e2e8f0;">Bekräfta bokning</h4>
                    <p style="font-size:0.9rem; color:#94a3b8; margin-top:0;">Tid: <strong id="display-datetime" style="color:white;"></strong></p>
                    
                    <form id="booking-form" class="booking-form">
                        <input type="text" id="b-name" placeholder="Ditt namn *" required>
                        <input type="email" id="b-email" placeholder="Din e-postadress *" required>
                        <textarea id="b-reason" rows="3" placeholder="Vad vill du diskutera? *" required></textarea>
                        <button type="submit" class="btn-book" id="btn-submit-booking">Boka Möte</button>
                    </form>
                </div>

                <!-- STEG 4: Bekräftelse -->
                <div id="booking-step-4" class="booking-step hidden booking-success">
                    <i class="fas fa-check-circle"></i>
                    <h4>Bokning Bekräftad!</h4>
                    <p>En kallelse har skickats till din e-post.</p>
                    <button id="btn-new-booking" style="background:none;border:none;color:#8b5cf6;text-decoration:underline;cursor:pointer;margin-top:15px;">Gör en ny bokning</button>
                </div>

            </div>
        `;

        // Event listeners
        document.getElementById('cal-prev').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });
        document.getElementById('cal-next').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });
        
        document.getElementById('btn-back-1').addEventListener('click', () => this.showStep(1));
        document.getElementById('btn-back-2').addEventListener('click', () => this.showStep(2));
        document.getElementById('btn-new-booking').addEventListener('click', () => {
            this.selectedDate = null;
            this.selectedTime = null;
            this.showStep(1);
            this.renderCalendar();
        });
        
        document.getElementById('booking-form').addEventListener('submit', (e) => this.submitBooking(e));
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const monthNames = ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"];
        document.getElementById('cal-month').innerText = `${monthNames[month]} ${year}`;

        const daysContainer = document.getElementById('cal-days');
        daysContainer.innerHTML = '';

        const firstDay = new Date(year, month, 1).getDay(); // 0 = Sön, 1 = Mån
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Fixa så veckan börjar på måndag (Sön = 7 istället för 0 för enklare beräkning)
        let emptyDays = firstDay === 0 ? 6 : firstDay - 1;

        for (let i = 0; i < emptyDays; i++) {
            daysContainer.innerHTML += `<div></div>`;
        }

        const today = new Date();
        today.setHours(0,0,0,0);

        for (let i = 1; i <= daysInMonth; i++) {
            const dateObj = new Date(year, month, i);
            const dateStr = dateObj.toISOString().split('T')[0];
            
            const isPast = dateObj < today;
            const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6; // Standard: inaktivera helger
            const isDisabled = isPast || isWeekend;

            const dayEl = document.createElement('div');
            dayEl.className = `calendar-day ${isDisabled ? 'disabled' : ''}`;
            if (this.selectedDate === dateStr) dayEl.classList.add('selected');
            
            dayEl.innerText = i;
            
            if (!isDisabled) {
                dayEl.addEventListener('click', () => this.handleDateSelect(dateStr, i, month, year));
            }
            
            daysContainer.appendChild(dayEl);
        }
    }

    async handleDateSelect(dateStr, day, month, year) {
        this.selectedDate = dateStr;
        const monthNames = ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"];
        document.getElementById('display-date').innerText = `${day} ${monthNames[month]}`;
        
        this.showStep(2);
        const slotsContainer = document.getElementById('time-slots-container');
        slotsContainer.innerHTML = '<div class="booking-loading"><i class="fas fa-spinner fa-spin"></i> Laddar tider...</div>';

        try {
            const res = await fetch(`${this.API_BASE}/availability`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: dateStr })
            });
            
            if (!res.ok) throw new Error('Network response was not ok');
            const data = await res.json();
            
            this.availableSlots = data.availableSlots || [];
            this.renderTimeSlots();
            
        } catch (error) {
            console.error('Error fetching availability:', error);
            slotsContainer.innerHTML = '<div style="grid-column:1/-1;color:#ef4444;text-align:center;">Kunde inte ladda tider. Kontrollera att backend körs!</div>';
        }
    }

    renderTimeSlots() {
        const slotsContainer = document.getElementById('time-slots-container');
        slotsContainer.innerHTML = '';

        if (this.availableSlots.length === 0) {
            slotsContainer.innerHTML = '<div style="grid-column:1/-1;color:#94a3b8;text-align:center;padding:1rem;">Inga tider tillgängliga detta datum.</div>';
            return;
        }

        this.availableSlots.forEach(time => {
            const btn = document.createElement('button');
            btn.className = 'time-slot-btn';
            btn.innerText = time;
            btn.addEventListener('click', () => {
                // Ta bort selected från andra
                document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.selectedTime = time;
                
                // Gå till formulär
                setTimeout(() => {
                    document.getElementById('display-datetime').innerText = `${this.selectedDate} kl. ${this.selectedTime}`;
                    this.showStep(3);
                }, 300);
            });
            slotsContainer.appendChild(btn);
        });
    }

    async submitBooking(e) {
        e.preventDefault();
        
        const name = document.getElementById('b-name').value;
        const email = document.getElementById('b-email').value;
        const reason = document.getElementById('b-reason').value;
        
        const btn = document.getElementById('btn-submit-booking');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Bokar...';
        btn.disabled = true;

        try {
            const res = await fetch(`${this.API_BASE}/book`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name, email, reason,
                    date: this.selectedDate,
                    time: this.selectedTime
                })
            });

            const data = await res.json();
            
            if (res.ok && data.success) {
                this.showStep(4);
            } else {
                throw new Error(data.error || 'Något gick fel.');
            }
            
        } catch (error) {
            console.error("Booking error:", error);
            alert(error.message);
        } finally {
            btn.innerHTML = 'Boka Möte';
            btn.disabled = false;
        }
    }

    showStep(stepNum) {
        document.querySelectorAll('.booking-step').forEach(el => el.classList.add('hidden'));
        document.getElementById(`booking-step-${stepNum}`).classList.remove('hidden');
    }
}

// Gör den tillgänglig globalt
window.BookingCalendar = BookingCalendar;
