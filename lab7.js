document.addEventListener('DOMContentLoaded', () => {
    
    const playBtn = document.getElementById('playBtn');
    const closeBtn = document.getElementById('closeBtn');
    const workLayer = document.getElementById('workLayer');
    const startBtn = document.getElementById('startBtn');
    const messageArea = document.getElementById('messageArea');
    const canvas = document.getElementById('animCanvas');
    const ctx = canvas.getContext('2d');
    const startReloadContainer = document.getElementById('startReloadContainer');
    
    let eventCounter = 0;
    let animationRunning = false;
    let animationFrameId = null;
    let stepCounter = 0;
    
    const RADIUS = 10;
    const SPEED = 2;
    const STEP_INTERVAL = 16;
    
    let circles = [];
    
    class Circle {
        constructor(x, y, angle, color) {
            this.x = x;
            this.y = y;
            this.vx = Math.cos(angle) * SPEED;
            this.vy = Math.sin(angle) * SPEED;
            this.color = color;
            this.radius = RADIUS;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
        }
        
        update(width, height) {
            this.x += this.vx;
            this.y += this.vy;
            
            let hitWall = false;
            
            if (this.x - this.radius <= 0) {
                this.x = this.radius;
                this.vx = Math.abs(this.vx);
                hitWall = 'ліву';
            } else if (this.x + this.radius >= width) {
                this.x = width - this.radius;
                this.vx = -Math.abs(this.vx);
                hitWall = 'праву';
            }
            
            if (this.y - this.radius <= 0) {
                this.y = this.radius;
                this.vy = Math.abs(this.vy);
                hitWall = hitWall ? hitWall + ' та верхню' : 'верхню';
            } else if (this.y + this.radius >= height) {
                this.y = height - this.radius;
                this.vy = -Math.abs(this.vy);
                hitWall = hitWall ? hitWall + ' та нижню' : 'нижню';
            }
            
            return hitWall;
        }
        
        isInTopHalf(height) {
            return this.y < height / 2;
        }
        
        isInBottomHalf(height) {
            return this.y > height / 2;
        }
    }
    
    playBtn.addEventListener('click', () => {
        workLayer.style.display = 'block';
        logEvent('Play - відкрито робочу область');
        
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        
        initCircles();
    });

    closeBtn.addEventListener('click', () => {
        workLayer.style.display = 'none';
        animationRunning = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        logEvent('Close - закрито робочу область');
        
        sendLocalLog();
    });

    startBtn.addEventListener('click', () => {
        logEvent('Start - запуск');
        startBtn.disabled = true;
        startAnimation();
    });
    
    function initCircles() {
        circles = [];
        const w = canvas.width;
        const h = canvas.height;
        
        const x1 = RADIUS + Math.random() * (w - 2 * RADIUS);
        const angle1 = Math.PI / 4 + Math.random() * (Math.PI / 2);
        circles.push(new Circle(x1, RADIUS, angle1, 'blue'));
        logEvent(`синє коло: x=${Math.round(x1)}, y=${RADIUS}`);
        
        const x2 = RADIUS + Math.random() * (w - 2 * RADIUS);
        const angle2 = -Math.PI / 4 - Math.random() * (Math.PI / 2);
        circles.push(new Circle(x2, h - RADIUS, angle2, 'orange'));
        logEvent(`оранжеве коло: x=${Math.round(x2)}, y=${h - RADIUS}`);
        
        drawCircles();
    }
    
    function drawCircles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        circles.forEach(c => c.draw());
    }
    
    function checkCircleCollision() {
        if (circles.length < 2) return false;
        
        const c1 = circles[0];
        const c2 = circles[1];
        const dx = c2.x - c1.x;
        const dy = c2.y - c1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < c1.radius + c2.radius) {
            c1.vx = -c1.vx;
            c1.vy = -c1.vy;
            c2.vx = -c2.vx;
            c2.vy = -c2.vy;
            
            const overlap = (c1.radius + c2.radius - dist) / 2;
            const angle = Math.atan2(dy, dx);
            c1.x -= Math.cos(angle) * overlap;
            c1.y -= Math.sin(angle) * overlap;
            c2.x += Math.cos(angle) * overlap;
            c2.y += Math.sin(angle) * overlap;
            
            return true;
        }
        return false;
    }
    
    function checkAnimationEnd() {
        const h = canvas.height;
        const bothTop = circles.every(c => c.isInTopHalf(h));
        const bothBottom = circles.every(c => c.isInBottomHalf(h));
        
        if (bothTop) {
            logEvent('обидва круги зверху - кінець');
            return true;
        }
        if (bothBottom) {
            logEvent('обидва круги знизу - кінець');
            return true;
        }
        return false;
    }
    
    function animate() {
        if (!animationRunning) return;
        
        stepCounter++;
        const w = canvas.width;
        const h = canvas.height;
        
        circles.forEach((c, i) => {
            const hit = c.update(w, h);
            if (hit) {
                const col = c.color === 'blue' ? 'синє' : 'оранжеве';
                logEvent(`${col} -> ${hit} стінка`);
            }
        });
        
        if (checkCircleCollision()) {
            logEvent('круги зіткнулись');
        }
        
        if (stepCounter % 30 === 0) {
            logEvent(`крок ${stepCounter}`);
        }
        
        drawCircles();
        
        if (checkAnimationEnd()) {
            stopAnimation();
            showReloadButton();
            return;
        }
        
        setTimeout(() => {
            animationFrameId = requestAnimationFrame(animate);
        }, STEP_INTERVAL);
    }
    
    function startAnimation() {
        animationRunning = true;
        stepCounter = 0;
        logEvent('анімація почалась');
        animate();
    }
    
    function stopAnimation() {
        animationRunning = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        logEvent('анімація зупинилась');
    }
    
    function showReloadButton() {
        startReloadContainer.innerHTML = '<button id="reloadBtn">Reload</button>';
        const reloadBtn = document.getElementById('reloadBtn');
        reloadBtn.addEventListener('click', () => {
            logEvent('Reload - перезапуск');
            initCircles();
            startReloadContainer.innerHTML = '<button id="startBtn">Start</button>';
            const newStartBtn = document.getElementById('startBtn');
            newStartBtn.addEventListener('click', () => {
                logEvent('Start знову');
                newStartBtn.disabled = true;
                startAnimation();
            });
        });
    }
    
    function logEvent(msg) {
        eventCounter++;
        const t = new Date().toISOString();
        const data = {
            num: eventCounter,
            time: t,
            msg: msg
        };

        messageArea.textContent = `[${eventCounter}] ${msg}`;

        try {
            let log = JSON.parse(localStorage.getItem('logbook_ls')) || [];
            log.push(data);
            localStorage.setItem('logbook_ls', JSON.stringify(log));
        } catch (e) {
            console.error('ls err:', e);
        }

        fetch('log_server.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).catch(e => console.error('server err:', e));
    }
    
    async function sendLocalLog() {
        const lb = localStorage.getItem('logbook_ls') || '[]';
        const ev = JSON.parse(lb);
        logEvent(`відправка ${ev.length} подій`);
        
        try {
            const r = await fetch('log_local.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: lb
            });
            
            if (r.ok) {
                localStorage.removeItem('logbook_ls');
            }
            
            await displayLogs();
        } catch (e) {
            console.error('відправка не вдалась:', e);
        }
    }
    
    async function displayLogs() {
        const res = document.getElementById('resultsContainer');
        res.innerHTML = '<h3>Логи:</h3><p>завантаження...</p>';
        
        try {
            const [sr, lr] = await Promise.all([
                fetch('server_log.txt?' + Date.now()),
                fetch('local_log.json?' + Date.now())
            ]);
            
            const st = await sr.text();
            const lt = await lr.text();
            
            const sLogs = st.trim().split('\n')
                .filter(l => l.trim())
                .map(l => JSON.parse(l));
            
            const lLogs = JSON.parse(lt || '[]');
            
            let h = '<table border="1" cellpadding="5" style="width:100%; margin-top:10px;">';
            h += '<tr><th>№</th><th>спосіб 1 (сервер)</th><th>спосіб 2 (localStorage)</th></tr>';
            
            const max = Math.max(sLogs.length, lLogs.length);
            
            for (let i = 0; i < max; i++) {
                const s = sLogs[i];
                const l = lLogs[i];
                
                h += '<tr><td>' + (i + 1) + '</td>';
                
                if (s) {
                    const st = new Date(s.server_time).toLocaleTimeString('uk-UA');
                    h += `<td><b>${s.num}</b> - ${s.msg}<br><small>${st}</small></td>`;
                } else {
                    h += '<td>-</td>';
                }
                
                if (l) {
                    const lt = new Date(l.time).toLocaleTimeString('uk-UA');
                    h += `<td><b>${l.num}</b> - ${l.msg}<br><small>${lt}</small></td>`;
                } else {
                    h += '<td>-</td>';
                }
                
                h += '</tr>';
            }
            
            h += '</table>';
            h += `<p style="margin-top:10px;">всього: ${sLogs.length} vs ${lLogs.length}</p>`;
            
            res.innerHTML = '<h3>Логи:</h3>' + h;
            
        } catch (e) {
            console.error('помилка логів:', e);
            res.innerHTML = '<h3>Логи:</h3><p style="color:red;">не вдалось завантажити</p>';
        }
    }
});