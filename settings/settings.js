document.addEventListener('DOMContentLoaded', () => {
    const modeRadios = document.getElementsByName('mode');
    const endTimeField = document.getElementById('end-time-field');
    const fixedTimeField = document.getElementById('fixed-time-field');
    const saveBtn = document.getElementById('save-btn');

    // Load existing settings
    const settings = JSON.parse(localStorage.getItem('timerSettings') || '{}');
    if (settings.title) document.getElementById('title').value = settings.title;
    if (settings.subtitle) document.getElementById('subtitle').value = settings.subtitle;
    if (settings.mode) {
        document.querySelector(`input[name="mode"][value="${settings.mode}"]`).checked = true;
        toggleFields(settings.mode);
    }
    if (settings.endTime) document.getElementById('end-time').value = settings.endTime;
    if (settings.duration) {
        const totalSec = parseInt(settings.duration);
        document.getElementById('hours').value = Math.floor(totalSec / 3600);
        document.getElementById('minutes').value = Math.floor((totalSec % 3600) / 60);
        document.getElementById('seconds').value = totalSec % 60;
    }

    modeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => toggleFields(e.target.value));
    });

    function toggleFields(mode) {
        if (mode === 'end-time') {
            endTimeField.style.display = 'block';
            fixedTimeField.style.display = 'none';
        } else {
            endTimeField.style.display = 'none';
            fixedTimeField.style.display = 'block';
        }
    }

    saveBtn.addEventListener('click', () => {
        const title = document.getElementById('title').value;
        const subtitle = document.getElementById('subtitle').value;
        const mode = document.querySelector('input[name="mode"]:checked').value;
        const endTime = document.getElementById('end-time').value;
        
        const hrs = parseInt(document.getElementById('hours').value) || 0;
        const min = parseInt(document.getElementById('minutes').value) || 0;
        const sec = parseInt(document.getElementById('seconds').value) || 0;
        const duration = (hrs * 3600) + (min * 60) + sec;

        const newSettings = { title, subtitle, mode, endTime, duration };
        
        localStorage.setItem('timerSettings', JSON.stringify(newSettings));
        
        console.log('Settings saved:', newSettings);
        alert('Settings saved! The timer will update automatically.');
    });
});
