class App {
    constructor() {
        this.initTabs();
        this.clock = new Clock();
        this.stopwatch = new Stopwatch();
        this.calendar = new Calendar();
        this.settings = new Settings(this.clock);

        // Start loop
        this.update();
    }

    initTabs() {
        const navBtns = document.querySelectorAll('.nav-btn');
        const views = document.querySelectorAll('.view');

        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class
                navBtns.forEach(b => b.classList.remove('active'));
                views.forEach(v => v.classList.remove('active'));

                // Add active class
                btn.classList.add('active');
                const target = btn.dataset.target;
                document.getElementById(target).classList.add('active');
            });
        });
    }

    update() {
        this.clock.update();
        if (this.stopwatch.running) {
            this.stopwatch.updateDisplay();
        }
        requestAnimationFrame(() => this.update());
    }
}

class Clock {
    constructor() {
        this.hoursEl = document.getElementById('hours');
        this.minutesEl = document.getElementById('minutes');
        this.secondsEl = document.getElementById('seconds');
        this.ampmEl = document.getElementById('ampm');
        this.dateEl = document.getElementById('date-display');

        this.timeOffset = 0; // In milliseconds
    }

    update() {
        const now = new Date(Date.now() + this.timeOffset);

        let h = now.getHours();
        const m = now.getMinutes();
        const s = now.getSeconds();
        const ampm = h >= 12 ? 'PM' : 'AM';

        h = h % 12;
        h = h ? h : 12; // 0 should be 12

        this.hoursEl.textContent = this.pad(h);
        this.minutesEl.textContent = this.pad(m);
        this.secondsEl.textContent = this.pad(s);
        this.ampmEl.textContent = ampm;

        // Date
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        this.dateEl.textContent = now.toLocaleDateString(undefined, options);
    }

    pad(num) {
        return num.toString().padStart(2, '0');
    }
}

class Stopwatch {
    constructor() {
        this.startTime = 0;
        this.elapsedTime = 0;
        this.running = false;

        this.minEl = document.getElementById('sw-minutes');
        this.secEl = document.getElementById('sw-seconds');
        this.msEl = document.getElementById('sw-milliseconds');
        this.lapsContainer = document.getElementById('sw-laps');

        this.startBtn = document.getElementById('sw-start');
        this.pauseBtn = document.getElementById('sw-pause');
        this.resetBtn = document.getElementById('sw-reset');
        this.lapBtn = document.getElementById('sw-lap');

        this.initListeners();
    }

    initListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.lapBtn.addEventListener('click', () => this.lap());
    }

    start() {
        this.running = true;
        this.startTime = Date.now() - this.elapsedTime;
        this.toggleControls(true);
    }

    pause() {
        this.running = false;
        this.toggleControls(false);
    }

    reset() {
        this.running = false;
        this.elapsedTime = 0;
        this.startTime = 0;
        this.updateDisplay();
        this.toggleControls(false);
        this.lapsContainer.innerHTML = '';
    }

    lap() {
        if (!this.running) return;

        const lapTime = this.formatTime(this.elapsedTime);
        const lapItem = document.createElement('div');
        lapItem.className = 'lap-item';
        lapItem.innerHTML = `<span>Lap ${this.lapsContainer.children.length + 1}</span> <span>${lapTime}</span>`;
        this.lapsContainer.prepend(lapItem);
    }

    toggleControls(isRunning) {
        if (isRunning) {
            this.startBtn.classList.add('hidden');
            this.pauseBtn.classList.remove('hidden');
        } else {
            this.startBtn.classList.remove('hidden');
            this.pauseBtn.classList.add('hidden');
        }
    }

    updateDisplay() {
        if (this.running) {
            this.elapsedTime = Date.now() - this.startTime;
        }

        const time = this.getParts(this.elapsedTime);
        this.minEl.textContent = this.pad(time.minutes);
        this.secEl.textContent = this.pad(time.seconds);
        this.msEl.textContent = this.pad((time.milliseconds / 10) | 0);
    }

    getParts(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = ms % 1000;
        return { minutes, seconds, milliseconds };
    }

    formatTime(ms) {
        const parts = this.getParts(ms);
        return `${this.pad(parts.minutes)}:${this.pad(parts.seconds)}.${this.pad((parts.milliseconds / 10) | 0)}`;
    }

    pad(num) {
        return num.toString().padStart(2, '0');
    }
}

class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.monthYearEl = document.getElementById('current-month-year');
        this.gridEl = document.querySelector('.calendar-grid');
        this.prevBtn = document.getElementById('prev-month');
        this.nextBtn = document.getElementById('next-month');

        this.prevBtn.addEventListener('click', () => this.changeMonth(-1));
        this.nextBtn.addEventListener('click', () => this.changeMonth(1));

        this.render();
    }

    changeMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.render();
    }

    render() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];

        this.monthYearEl.textContent = `${monthNames[month]} ${year}`;

        // Clear existing days (keep weekdays)
        const weekdays = this.gridEl.querySelectorAll('.weekday');
        this.gridEl.innerHTML = '';
        weekdays.forEach(w => this.gridEl.appendChild(w));

        const firstDayIndex = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const today = new Date();

        // Empty slots
        for (let i = 0; i < firstDayIndex; i++) {
            const empty = document.createElement('div');
            empty.className = 'day empty';
            this.gridEl.appendChild(empty);
        }

        // Days
        for (let i = 1; i <= daysInMonth; i++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'day';
            dayEl.textContent = i;

            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayEl.classList.add('today');
            }

            this.gridEl.appendChild(dayEl);
        }
    }
}

class Settings {
    constructor(clockInstance) {
        this.clock = clockInstance;
        this.hInput = document.getElementById('offset-hours');
        this.mInput = document.getElementById('offset-minutes');
        this.hVal = document.getElementById('offset-hours-val');
        this.mVal = document.getElementById('offset-minutes-val');

        const updateOffset = () => {
            const h = parseInt(this.hInput.value);
            const m = parseInt(this.mInput.value);

            this.hVal.textContent = h > 0 ? `+${h}` : h;
            this.mVal.textContent = m > 0 ? `+${m}` : m;

            // Calculate total offset in ms
            // 1 hour = 3600000 ms, 1 minute = 60000 ms
            this.clock.timeOffset = (h * 3600000) + (m * 60000);
        };

        this.hInput.addEventListener('input', updateOffset);
        this.mInput.addEventListener('input', updateOffset);
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
});
