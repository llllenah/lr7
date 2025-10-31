document.addEventListener('DOMContentLoaded', () => {
    
    // Елементи керування
    const playBtn = document.getElementById('playBtn');
    const closeBtn = document.getElementById('closeBtn');
    const workLayer = document.getElementById('workLayer');
    
    // Елементи анімації
    const startBtn = document.getElementById('startBtn');
    const messageArea = document.getElementById('messageArea');
    const canvas = document.getElementById('animCanvas');
    const ctx = canvas.getContext('2d');
    
    // Логіка логування (поки що заглушки)
    let eventCounter = 0;
    let animationRunning = false;
    
    // (Вимога 1.d) Показати "work" при натисканні "play"
    playBtn.addEventListener('click', () => {
        workLayer.style.display = 'block';
        logEvent('Натиснуто Play, шар work відкрито');
        
        // Встановлюємо розміри canvas відповідно до CSS
        // Це потрібно зробити ОДИН раз при показі
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    });

    // (Вимога 1.d) Сховати "work" при натисканні "close"
    closeBtn.addEventListener('click', () => {
        workLayer.style.display = 'none';
        animationRunning = false; // Зупиняємо анімацію
        logEvent('Натиснуто Close, шар work закрито');
        
        // (Вимога 1.h) Відправляємо лог з LocalStorage на сервер
        sendLocalLog();
        
        // (Вимога 1.h) Зчитуємо обидва логи та показуємо таблицю
        displayLogs();
    });

    // (Вимога 1.g) Кнопка "Start"
    startBtn.addEventListener('click', () => {
        logEvent('Натиснуто Start');
        startBtn.disabled = true;
        
        // Тут ми запустимо анімацію (Етап 2)
        // resetAndRunAnimation(); 
    });
    
    
    // --- ОСНОВНА ФУНКЦІЯ ЛОГУВАННЯ ---
    // (Вимога 1.h)
    function logEvent(message) {
        eventCounter++;
        const localTime = new Date().toISOString();
        const eventData = {
            num: eventCounter,
            time: localTime,
            msg: message
        };

        // Оновлюємо повідомлення на екрані
        messageArea.textContent = `[${eventCounter}] ${message}`;

        // --- (Вимога 2.c) Спосіб 2: Збереження в LocalStorage ---
        try {
            let logbook = JSON.parse(localStorage.getItem('logbook_ls')) || [];
            logbook.push(eventData);
            localStorage.setItem('logbook_ls', JSON.stringify(logbook));
        } catch (e) {
            console.error('Помилка запису в LocalStorage:', e);
        }

        // --- (Вимога 2.b) Спосіб 1: Негайна відправка на сервер ---
        fetch('log_server.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        }).catch(console.error);
    }
    
    // Відправка LocalStorage логу на сервер
    async function sendLocalLog() {
        const logbook = localStorage.getItem('logbook_ls') || '[]';
        logEvent(`Відправка ${JSON.parse(logbook).length} подій з LS...`);
        
        try {
            await fetch('log_local.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: logbook
            });
            // Очищуємо LocalStorage після успішної відправки
            localStorage.removeItem('logbook_ls');
            eventCounter = 0; // Скидаємо лічильник
        } catch (e) {
            console.error('Не вдалося відправити LS лог:', e);
        }
    }
    
    // Показ логів у таблиці
    async function displayLogs() {
        const resultsContainer = document.getElementById('resultsContainer');
        resultsContainer.innerHTML = '<h3>Результати логування:</h3>Завантаження...';
        
        // Тут ми завантажимо файли логів з сервера і згенеруємо HTML-таблицю
        // (Це буде Етап 5)
        resultsContainer.innerHTML = '<i>(Тут буде таблиця порівняння логів)</i>';
    }
});