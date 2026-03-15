import { db, doc, onSnapshot, updateDoc, setDoc, TIMER_DOC_ID } from '../firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const modeRadios = document.getElementsByName('mode');
    const endTimeField = document.getElementById('end-time-field');
    const fixedTimeField = document.getElementById('fixed-time-field');
    const saveBtn = document.getElementById('save-btn');
    const resetBtn = document.getElementById('reset-btn');

    let currentSettings = {};

    // Load existing settings globally instead of just from localStorage
    const timerRef = doc(db, "timers", TIMER_DOC_ID);
    onSnapshot(timerRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.data();
            const settings = data.settings || {};
            currentSettings = settings;

            if (settings.title) document.getElementById('title').value = settings.title;
            if (settings.subtitle) document.getElementById('subtitle').value = settings.subtitle;
            if (settings.alertMessage !== undefined) document.getElementById('alert-message').value = settings.alertMessage;
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
        } else {
            // Need to initialize document first time
            setDoc(timerRef, { settings: {}, state: { started: false } }).catch(console.error);
        }
    });

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
        const alertMessage = document.getElementById('alert-message').value;
        const mode = document.querySelector('input[name="mode"]:checked').value;
        const endTime = document.getElementById('end-time').value;
        
        const hrs = parseInt(document.getElementById('hours').value) || 0;
        const min = parseInt(document.getElementById('minutes').value) || 0;
        const sec = parseInt(document.getElementById('seconds').value) || 0;
        const duration = (hrs * 3600) + (min * 60) + sec;

        const newSettings = { title, subtitle, mode, endTime, duration, alertMessage };

        // Save straight to Firebase
        updateDoc(doc(db, "timers", TIMER_DOC_ID), {
            settings: newSettings
        }).then(() => {
            console.log('Settings saved to Firebase:', newSettings);
            alert('Settings saved! Distributed globally.');
        }).catch(err => {
            console.error("Error saving to Firebase:", err);
            alert('Error updating. See console.');
        });
    });

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            updateDoc(doc(db, "timers", TIMER_DOC_ID), {
                "state.started": false,
                "state.updatedAt": Date.now()
            }).then(() => {
                alert('Timer reset! The global timer will wait for the Spacebar to start again.');
            }).catch(console.error);
        });
    }
});
