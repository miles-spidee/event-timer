import { db, doc, onSnapshot, updateDoc, setDoc, TIMER_DOC_ID } from './firebase-config.js';

let settings = {};
let timerState = {};
let lastSettingsJson = '';
let timerInterval = null;
let isRunning = false;
let endTime = null;
let remainingTime = 0;

let timerDisplay, eventTitle, eventSubtitle, quoteContainer;
// Quote rotation logic
let quoteTimeout = null;
let quoteHideTimeout = null;

const techQuotes = [
    "\"Talk is cheap. Show me the code.\" – Linus Torvalds",
    "\"Programs must be written for people to read, and only incidentally for machines to execute.\" – Hal Abelson",
    "\"Any fool can write code that a computer can understand. Good programmers write code that humans can understand.\" – Martin Fowler",
    "\"First, solve the problem. Then, write the code.\" – John Johnson",
    "\"Experience is the name everyone gives to their mistakes.\" – Oscar Wilde",
    "\"In order to be irreplaceable, one must always be different.\" – Coco Chanel",
    "\"Java is to JavaScript what car is to Carpet.\" – Chris Heilmann",
    "\"Code is like humor. When you have to explain it, it’s bad.\" – Cory House",
    "\"Fix the cause, not the symptom.\" – Steve Maguire",
    "\"Make it work, make it right, make it fast.\" – Kent Beck",
    "\"Software is a great combination between artistry and engineering.\" – Bill Gates",
    "\"The best error message is the one that never shows up.\" – Thomas Fuchs",

    "\"Before software can be reusable it first has to be usable.\" – Ralph Johnson",
    "\"Simplicity is the soul of efficiency.\" – Austin Freeman",
    "\"Deleted code is debugged code.\" – Jeff Sickel",
    "\"If debugging is the process of removing bugs, then programming must be the process of putting them in.\" – Edsger Dijkstra",
    "\"Controlling complexity is the essence of computer programming.\" – Brian Kernighan",
    "\"The function of good software is to make the complex appear simple.\" – Grady Booch",
    "\"Programming isn't about what you know; it's about what you can figure out.\" – Chris Pine",
    "\"Clean code always looks like it was written by someone who cares.\" – Robert C. Martin",
    "\"Truth can only be found in one place: the code.\" – Robert C. Martin",
    "\"The most disastrous thing that you can ever learn is your first programming language.\" – Alan Kay",
    "\"Sometimes it pays to stay in bed on Monday, rather than spending the rest of the week debugging Monday’s code.\" – Dan Salomon",
    "\"Testing leads to failure, and failure leads to understanding.\" – Burt Rutan",
    "\"The sooner you start to code, the longer the program will take.\" – Roy Carlson",
    "\"The best way to predict the future is to implement it.\" – David Heinemeier Hansson",
    "\"Walking on water and developing software from a specification are easy if both are frozen.\" – Edward V. Berard",
    "\"Programming is thinking, not typing.\" – Casey Patton",
    "\"Simplicity is prerequisite for reliability.\" – Edsger Dijkstra",
    "\"One man’s crappy software is another man’s full-time job.\" – Jessica Gaston",
    "\"Programming can be fun, and so can cryptography; however, they should not be combined.\" – Kreitzberg and Shneiderman",
    "\"Software undergoes beta testing shortly before it’s released. Beta is Latin for 'still doesn’t work.'\" – Anonymous",
    "\"The best method for accelerating a computer is the one that boosts it by 9.8 m/s².\" – Anonymous",
    "\"Programming today is a race between software engineers striving to build bigger and better idiot-proof programs, and the Universe trying to produce bigger and better idiots.\" – Rick Cook",
    "\"Good code is its own best documentation.\" – Steve McConnell",
    "\"Software and cathedrals are much the same — first we build them, then we pray.\" – Sam Redwine",
    "\"The computer was born to solve problems that did not exist before.\" – Bill Gates",
    "\"Programming is the art of algorithm design and the craft of debugging errant code.\" – Ellen Ullman",
    "\"A good programmer is someone who always looks both ways before crossing a one-way street.\" – Doug Linder",
    "\"The trouble with programmers is that you can never tell what a programmer is doing until it’s too late.\" – Seymour Cray",
    "\"There are only two kinds of programming languages: those people always complain about and those nobody uses.\" – Bjarne Stroustrup",
    "\"The best performance improvement is the transition from the nonworking state to the working state.\" – J. Osterhout",
    "\"Computers are good at following instructions, but not at reading your mind.\" – Donald Knuth",
    "\"Premature optimization is the root of all evil.\" – Donald Knuth",
    "\"The most important property of a program is whether it accomplishes the intention of its user.\" – C.A.R. Hoare",
    "\"Code never lies, comments sometimes do.\" – Ron Jeffries",
    "\"A language that doesn’t affect the way you think about programming is not worth knowing.\" – Alan Perlis",
    "\"Programs are meant to be read by humans and only incidentally for computers to execute.\" – Harold Abelson",
    "\"Debugging becomes significantly easier if you first admit that you are the problem.\" – William Laeder",
    "\"Software is like entropy: It is difficult to grasp, weighs nothing, and obeys the Second Law of Thermodynamics.\" – Norman Augustine",

    "\"Programs must be written for people to read.\" – Harold Abelson",
    "\"Programming is the art of telling another human what one wants the computer to do.\" – Donald Knuth",
    "\"The best code is no code at all.\" – Jeff Atwood",
    "\"It works on my machine.\" – Every Developer Ever",
    "\"Code never lies, comments sometimes do.\" – Ron Jeffries",
    "\"A good programmer is someone who looks both ways before crossing a one-way street.\" – Doug Linder",
    "\"Programming is the art of algorithm design and debugging.\" – Ellen Ullman",
    "\"Simplicity is the ultimate sophistication.\" – Leonardo da Vinci",
    "\"Knowledge is power.\" – Francis Bacon",
    "\"Any sufficiently advanced technology is indistinguishable from magic.\" – Arthur C. Clarke",

    "\"Software development is a team sport.\" – Jim McCarthy",
    "\"The computer was born to solve problems that did not exist before.\" – Bill Gates",
    "\"Debugging is twice as hard as writing the code.\" – Brian Kernighan",
    "\"If builders built buildings the way programmers wrote programs, the first woodpecker would destroy civilization.\" – Gerald Weinberg",
    "\"There are two ways to write error-free programs; only the third one works.\" – Alan Perlis",
    "\"The best way to get a project done faster is to start sooner.\" – Jim Highsmith",
    "\"Programming isn't about typing, it's about thinking.\" – Rich Hickey",
    "\"The best programs are written so that computing machines can perform them quickly and humans can understand them clearly.\" – Donald Knuth",
    "\"Software is eating the world.\" – Marc Andreessen",
    "\"The goal of software architecture is to minimize the human resources required to build and maintain the system.\" – Robert C. Martin",

    "\"A good programmer is someone who is always learning.\" – Anonymous",
    "\"Programming is like solving puzzles.\" – Anonymous",
    "\"The best developers are those who never stop being curious.\" – Anonymous",
    "\"Code simplicity is the ultimate sophistication.\" – Anonymous",
    "\"First make it correct, then make it fast.\" – Anonymous",
    "\"Great software is built by great teams.\" – Anonymous",
    "\"A good developer writes code. A great developer solves problems.\" – Anonymous",
    "\"Learning to code is learning to create.\" – Anonymous",
    "\"Coding is today's literacy.\" – Anonymous",
    "\"The best way to learn programming is by writing programs.\" – Dennis Ritchie",

    "\"Programming is the closest thing we have to superpowers.\" – Drew Houston",
    "\"The best code is written with empathy for the next developer.\" – Anonymous",
    "\"Every great developer you know got there by solving problems.\" – Patrick McKenzie",
    "\"Programming is not about tools, it's about mindset.\" – Anonymous",
    "\"The only way to learn a new programming language is by writing programs in it.\" – Dennis Ritchie",
    "\"A program is never less than 90% complete.\" – Terry Baker",
    "\"The hardest part of programming is naming things.\" – Phil Karlton",
    "\"Sometimes the best debugging tool is a good night's sleep.\" – Anonymous",
    "\"Code is poetry.\" – WordPress Motto",
    "\"Good software takes ten years. Get used to it.\" – Jeh Johnson",

    "\"Programming is like writing a book... except if you miss a comma the whole thing crashes.\" – Anonymous",
    "\"Computers are incredibly fast, accurate, and stupid.\" – Albert Einstein (often attributed)",
    "\"A good programmer doesn't just write code — they design solutions.\" – Anonymous",
    "\"Software development is about managing complexity.\" – Anonymous",
    "\"Programming is about building ideas.\" – Anonymous",
    "\"The best way to learn programming is to build things.\" – Anonymous",
    "\"Programming teaches you how to think.\" – Steve Jobs",
    "\"Stay hungry, stay foolish.\" – Steve Jobs",
    "\"Innovation distinguishes between a leader and a follower.\" – Steve Jobs",
    "\"The people who are crazy enough to think they can change the world are the ones who do.\" – Steve Jobs",

     "\"Programming is the art of creating something from nothing.\" – Anonymous",
    "\"Every line of code should have a purpose.\" – Anonymous",
    "\"Code is like art; everyone has their own style.\" – Anonymous",
    "\"Great developers think in systems, not just code.\" – Anonymous",
    "\"The best code is simple, readable, and maintainable.\" – Anonymous",
    "\"Programming is problem-solving.\" – Anonymous",
    "\"Write code as if the person who ends up maintaining it is a violent psychopath who knows where you live.\" – John Woods",
    "\"Code should be written to minimize the time it would take for someone else to understand it.\" – Anonymous",
    "\"A bug is never just a mistake; it represents something you didn’t understand.\" – Anonymous",
    "\"Programming is the closest thing to magic in the modern world.\" – Anonymous",

    "\"The best developers are always learning.\" – Anonymous",
    "\"Software development is about turning ideas into reality.\" – Anonymous",
    "\"Programs grow, and so does their complexity.\" – Anonymous",
    "\"Clean code is a sign of respect for your teammates.\" – Anonymous",
    "\"Programming is a craft learned through practice.\" – Anonymous",
    "\"Think twice, code once.\" – Anonymous",
    "\"Short code is better than clever code.\" – Anonymous",
    "\"Readable code beats clever code.\" – Anonymous",
    "\"A good programmer writes code a human can understand.\" – Anonymous",
    "\"Good software is built with patience.\" – Anonymous",

    "\"Programming is like building with Lego blocks.\" – Anonymous",
    "\"A great developer turns complexity into simplicity.\" – Anonymous",
    "\"Debugging is detective work.\" – Anonymous",
    "\"Programming requires patience and persistence.\" – Anonymous",
    "\"Code should be elegant, not complicated.\" – Anonymous",
    "\"Software is built line by line.\" – Anonymous",
    "\"Behind every great app is a lot of debugging.\" – Anonymous",
    "\"Good developers write code; great developers rewrite it.\" – Anonymous",
    "\"The best programs are easy to change.\" – Anonymous",
    "\"Programming is continuous learning.\" – Anonymous",

    "\"Great software comes from clear thinking.\" – Anonymous",
    "\"The best programmers solve problems others avoid.\" – Anonymous",
    "\"Programming turns logic into reality.\" – Anonymous",
    "\"Coding is the language of innovation.\" – Anonymous",
    "\"Every bug teaches something new.\" – Anonymous",
    "\"Programming is the art of automation.\" – Anonymous",
    "\"Simple solutions scale better.\" – Anonymous",
    "\"Code quality matters more than code quantity.\" – Anonymous",
    "\"A good developer leaves the codebase better than they found it.\" – Anonymous",
    "\"Programming is creativity combined with logic.\" – Anonymous",

    "\"Software is built by people, not machines.\" – Anonymous",
    "\"Code clarity saves hours of debugging.\" – Anonymous",
    "\"Programming is engineering for ideas.\" – Anonymous",
    "\"Every project is a chance to improve.\" – Anonymous",
    "\"Consistency makes code better.\" – Anonymous",
    "\"Programming rewards curiosity.\" – Anonymous",
    "\"Learning to code is learning to think differently.\" – Anonymous",
    "\"The best developers never stop experimenting.\" – Anonymous",
    "\"Programming is building tools for the future.\" – Anonymous",
    "\"Code is the blueprint of modern technology.\" – Anonymous"
];


// --- Background Snake Game Setup ---
const snakeGridSize = 25;
let snakeCols, snakeRows;
let snake = [];
let snakeApple = { x: 0, y: 0 };
let snakeInterval = null;
let snakeCanvas, snakeCtx;

function initSnake() {
    snakeCanvas = document.getElementById('bg-snake');
    if (!snakeCanvas) return;
    snakeCtx = snakeCanvas.getContext('2d');
    
    window.addEventListener('resize', resizeSnakeCanvas);
    resizeSnakeCanvas();
    
    resetSnake();
    if (snakeInterval) clearInterval(snakeInterval);
    snakeInterval = setInterval(updateSnake, 120);
}

function resizeSnakeCanvas() {
    snakeCanvas.width = window.innerWidth;
    snakeCanvas.height = window.innerHeight;
    snakeCols = Math.floor(snakeCanvas.width / snakeGridSize);
    snakeRows = Math.floor(snakeCanvas.height / snakeGridSize);
}

function spawnApple() {
    snakeApple = {
        x: Math.floor(Math.random() * snakeCols),
        y: Math.floor(Math.random() * Math.max(1, snakeRows))
    };
    // Re-spawn if it spawned on the snake
    if (snake.some(segment => segment.x === snakeApple.x && segment.y === snakeApple.y)) {
        spawnApple();
    }
}

function resetSnake() {
    snake = [{ 
        x: Math.floor(snakeCols / 2), 
        y: Math.floor(snakeRows / 2) 
    }];
    spawnApple();
}

function getValidMoves(head) {
    const directions = [
        { dx: 0, dy: -1 }, // Up
        { dx: 0, dy: 1 },  // Down
        { dx: -1, dy: 0 }, // Left
        { dx: 1, dy: 0 }   // Right
    ];
    
    return directions.map(dir => ({
        x: head.x + dir.dx,
        y: head.y + dir.dy
    })).filter(pos => {
        // Must stay in bounds
        if (pos.x < 0 || pos.x >= snakeCols || pos.y < 0 || pos.y >= snakeRows) return false;
        // Don't hit self (ignoring tail tip since it moves)
        for (let i = 0; i < snake.length - 1; i++) {
            if (snake[i].x === pos.x && snake[i].y === pos.y) return false;
        }
        return true;
    });
}

function updateSnake() {
    if (!snakeCanvas || snakeCols === 0 || snakeRows === 0) return;
    
    // Only move and draw the snake if the timer has started
    if (!timerState.started) {
        if (snakeCtx) snakeCtx.clearRect(0, 0, snakeCanvas.width, snakeCanvas.height);
        return;
    }
    
    const head = snake[0];
    const validMoves = getValidMoves(head);
    
    if (validMoves.length === 0) {
        // Nowhere to go, trapped. Reset snake.
        resetSnake();
        return;
    }
    
    // Choose move that gets closest to apple using Manhattan distance
    let bestMove = validMoves[0];
    let minDistance = Infinity;
    
    validMoves.forEach(move => {
        const dist = Math.abs(move.x - snakeApple.x) + Math.abs(move.y - snakeApple.y);
        // Add tiny randomness to occasionally prevent infinite loops if trapped behind itself
        const jiggle = Math.random() < 0.1 ? Math.random() : 0; 
        if (dist + jiggle < minDistance) {
            minDistance = dist + jiggle;
            bestMove = move;
        }
    });

    // Move snake
    snake.unshift(bestMove);
    
    // Check apple collision
    if (bestMove.x === snakeApple.x && bestMove.y === snakeApple.y) {
        spawnApple(); // Grew (don't pop tail)
    } else {
        snake.pop(); // Remove tail
    }
    
    drawSnake();
}

function drawSnake() {
    snakeCtx.clearRect(0, 0, snakeCanvas.width, snakeCanvas.height);
    
    // Draw Apple
    snakeCtx.fillStyle = '#ff3366'; // Red dot apple
    snakeCtx.beginPath();
    snakeCtx.arc(
        snakeApple.x * snakeGridSize + snakeGridSize / 2, 
        snakeApple.y * snakeGridSize + snakeGridSize / 2, 
        (snakeGridSize / 2) - 3, 
        0, 
        Math.PI * 2
    );
    snakeCtx.fill();
    
    // Draw Snake
    snakeCtx.fillStyle = '#c56ad6'; // Theming color
    snake.forEach((segment, index) => {
        snakeCtx.beginPath();
        if (index === 0) {
            // Head slightly bigger
            snakeCtx.roundRect(segment.x * snakeGridSize, segment.y * snakeGridSize, snakeGridSize, snakeGridSize, 6);
        } else {
            // Body slightly smaller
            snakeCtx.roundRect(segment.x * snakeGridSize + 2, segment.y * snakeGridSize + 2, snakeGridSize - 4, snakeGridSize - 4, 4);
        }
        snakeCtx.fill();
    });
}
// --- End Background Snake Game Setup ---

function formatTime(seconds) {
    if (seconds < 0) return "00:00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    const hDisplay = h < 10 ? "0" + h : h;
    const mDisplay = m < 10 ? "0" + m : m;
    const sDisplay = s < 10 ? "0" + s : s;
    
    return hDisplay + ":" + mDisplay + ":" + sDisplay;
}

function updateDisplay(seconds) {
    timerDisplay.textContent = formatTime(seconds);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    isRunning = false;
    remainingTime = 0;
}

function startEndTimeTimer() {
    stopTimer();
    isRunning = true;
    
    timerInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = Math.floor((endTime - now) / 1000);
        if (distance < 0) {
            stopTimer();
            updateDisplay(0);
            return;
        }
        updateDisplay(distance);
    }, 1000);
}

function startFixedTimer() {
    if (isRunning) return;
    isRunning = true;
    
    timerInterval = setInterval(() => {
        remainingTime--;
        if (remainingTime <= 0) {
            stopTimer();
            updateDisplay(0);
            return;
        }
        updateDisplay(remainingTime);
    }, 1000);
}

function loadSettings() {
    // Left empty for compatibility where initially called. 
    // Replaced by real-time listener.
}

// Setup real-time listener for Firestore
function setupFirestoreListener() {
    const timerRef = doc(db, "timers", TIMER_DOC_ID);
    onSnapshot(timerRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.data();
            settings = data.settings || {};
            timerState = data.state || {};
            applySettings();
        } else {
            // First time setup if the document doesn't exist
            setDoc(timerRef, {
                settings: {},
                state: { started: false }
            }).catch(console.error);
        }
    });
}

function applySettings() {
    if (!eventTitle || !eventSubtitle) return;
    // Update titles
    eventTitle.textContent = settings.title || "Event Title";
    eventSubtitle.textContent = settings.subtitle || "Event Subtitle";
    
    // Stop any running timer
    stopTimer();
    
    // Apply new settings
    if (settings.mode === 'end-time' && settings.endTime) {
        endTime = new Date(settings.endTime).getTime();
        if (!isNaN(endTime)) {
            if (timerState.started) {
                startEndTimeTimer();
            } else {
                // Show initially without starting
                const dist = Math.floor((endTime - new Date().getTime()) / 1000);
                updateDisplay(dist);
            }
        } else {
            updateDisplay(0);
        }
    } else {
        // Fixed-time or default mode
        if (timerState.started && timerState.fixedEndTime) {
            remainingTime = Math.floor((timerState.fixedEndTime - new Date().getTime()) / 1000);
            if (remainingTime < 0) remainingTime = 0;
            startFixedTimer();
        } else {
            remainingTime = parseInt(settings.duration) || 0;
            updateDisplay(remainingTime);
        }
    }

    // Hide start instruction if timer is already started from persistence
    const instruction = document.getElementById('start-instruction');
    if (instruction && timerState.started) {
        instruction.style.display = 'none';
    } else if (instruction && !timerState.started) {
        instruction.style.display = 'block';
    }

    // Call rotation once initially
    handleQuoteRotation();
}

function handleQuoteRotation() {
    clearTimeout(quoteTimeout);
    
    // Only show quotes if the timer has started
    if (!timerState.started) {
        quoteTimeout = setTimeout(handleQuoteRotation, 2000);
        return;
    }

    // Checking roughly every 15-30 seconds
    const nextCheckMs = Math.floor(Math.random() * 15000) + 15000;
    quoteTimeout = setTimeout(handleQuoteRotation, nextCheckMs);

    // If currently showing a quote, don't show another or overlap
    if (quoteContainer.style.opacity == 1) {
        return;
    }

    // Check if we should show a quote (2 out of 10 chance -> 20%)
    if (Math.random() <= 0.2) {
        // Fallback for empty techQuotes
        if (!techQuotes || techQuotes.length === 0) return;
        
        const randomQuote = techQuotes[Math.floor(Math.random() * techQuotes.length)];
        quoteContainer.textContent = randomQuote;
        quoteContainer.style.opacity = 1;
        
        // Hide the quote after 1 minute (60,000ms)
        clearTimeout(quoteHideTimeout);
        quoteHideTimeout = setTimeout(() => {
            quoteContainer.style.opacity = 0;
        }, 60000);
    }
}

function init() {
    timerDisplay = document.getElementById('timer-display');
    eventTitle = document.getElementById('event-title');
    eventSubtitle = document.getElementById('event-subtitle');
    quoteContainer = document.getElementById('quote-container');
    
    // Force a load by resetting the tracker when elements are first available
    lastSettingsJson = 'UNINITIALIZED'; 
    loadSettings();

    // Start background background pieces
    initSnake();

    // Start the random quote background loop
    handleQuoteRotation();
}

// Load and apply settings when page loads
document.addEventListener('DOMContentLoaded', init);

// Spacebar to start timer
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        
        if (!timerState.started) {
            timerState.started = true;
            
            if (settings.mode === 'end-time') {
                // startEndTimeTimer will be called triggered by Firestore state sync
                updateDoc(doc(db, "timers", TIMER_DOC_ID), {
                    "state.started": true,
                    "state.updatedAt": Date.now()
                }).catch(console.error);
            } else {
                remainingTime = parseInt(settings.duration) || 0;
                const newFixedEndTime = new Date().getTime() + (remainingTime * 1000);
                timerState.fixedEndTime = newFixedEndTime;
                
                updateDoc(doc(db, "timers", TIMER_DOC_ID), {
                    "state.started": true,
                    "state.fixedEndTime": newFixedEndTime,
                    "state.updatedAt": Date.now()
                }).catch(console.error);
            }

            // Confetti Celebration
            const duration = 2 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            function randomInRange(min, max) {
              return Math.random() * (max - min) + min;
            }

            const interval = setInterval(function() {
              const timeLeft = animationEnd - Date.now();

              if (timeLeft <= 0) {
                return clearInterval(interval);
              }

              const particleCount = 50 * (timeLeft / duration);
              confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
              confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
            }, 250);
        }
    }
});

setupFirestoreListener();
