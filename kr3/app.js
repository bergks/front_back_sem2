// app.js - навигация и логика заметок

const contentDiv = document.getElementById('app-content');
const homeBtn = document.getElementById('home-btn');
const aboutBtn = document.getElementById('about-btn');

// ===== НАВИГАЦИЯ =====
function setActiveButton(activeId) {
    [homeBtn, aboutBtn].forEach(btn => btn.classList.remove('active'));
    document.getElementById(activeId).classList.add('active');
}

async function loadContent(page) {
    try {
        const response = await fetch(`/content/${page}.html`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const html = await response.text();
        contentDiv.innerHTML = html;

        // Если загружена главная страница — инициализируем заметки
        if (page === 'home') {
            initNotes();
        }
    } catch (err) {
        console.error('Ошибка загрузки:', err);
        contentDiv.innerHTML = '<p class="error">⚠️ Ошибка загрузки страницы. Проверьте соединение.</p>';
    }
}

// ===== ЗАМЕТКИ =====
function initNotes() {
    const form = document.getElementById('note-form');
    const input = document.getElementById('note-input');
    const list = document.getElementById('notes-list');

    if (!form || !input || !list) return;

    // Загрузка заметок
    function loadNotes() {
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');

        if (notes.length === 0) {
            list.innerHTML = '<li class="empty">📭 Нет заметок. Добавьте первую!</li>';
            return;
        }

        list.innerHTML = notes.map((note, index) => `
            <li>
                <span>${escapeHtml(note)}</span>
                <button class="delete-btn" data-index="${index}">✖ Удалить</button>
            </li>
        `).join('');

        // Обработчики удаления
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                deleteNote(index);
            });
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function addNote(text) {
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        notes.push(text);
        localStorage.setItem('notes', JSON.stringify(notes));
        loadNotes();
    }

    function deleteNote(index) {
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        loadNotes();
    }

    // Обработка формы
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (text) {
            addNote(text);
            input.value = '';
        }
    });

    // Первоначальная загрузка
    loadNotes();
}

// ===== РЕГИСТРАЦИЯ SERVICE WORKER =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker зарегистрирован:', registration.scope);
        } catch (err) {
            console.error('❌ Ошибка регистрации Service Worker:', err);
        }
    });
} else {
    console.warn('⚠️ Service Worker не поддерживается');
}

// ===== КНОПКИ НАВИГАЦИИ =====
homeBtn.addEventListener('click', () => {
    setActiveButton('home-btn');
    loadContent('home');
});

aboutBtn.addEventListener('click', () => {
    setActiveButton('about-btn');
    loadContent('about');
});

// Загружаем главную страницу при старте
loadContent('home');