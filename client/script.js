import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;


function loader(element) {
    element.textContent = '';

    loadInterval = setInterval(() => {
        element.textContent += '.';
        if (element.textContent === '....') {
            element.textContent = '';
        }
    },300);

}


function typeText(element, text) {
    let i = 0;

    const interval = setInterval(() => {
        if(i<text.length) {
        element.innerHTML += text.charAt(i);
        i++;}else {
            clearInterval(interval);
        }
    }, 20);
}

function generateUniqueID() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimal = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimal}`;
}

function chatStripe (isAi, value, uniqueID) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img src="${isAi ? bot : user}" alt="${isAi ? bot : user}" />
                </div>
                <div class="message" id=${uniqueID}>${value}</div>
            </div>
        </div>
        `
    )
}

const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData(form);
    
    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

    form.reset();

    // bot's chatstripe
    const uniqueID = generateUniqueID();
    chatContainer.innerHTML += chatStripe(true, '', uniqueID);

    chatContainer.scrollTop = chatContainer.scrollHeight;

    const messageDiv = document.getElementById(uniqueID);

    loader(messageDiv);

    // fetch response from the server   -> bot's response

    const response = await fetch('http://localhost:5500/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: data.get('prompt')  
        })
    });

    clearInterval(loadInterval);
    messageDiv.innerHTML = '';

    if(response.ok) {
        const data = await response.json();
        const parsedDate = data.bot.trim();
        console.log()
        typeText(messageDiv, parsedDate);
    } else {
        const err = await response.text();
        messageDiv.innerHTML = "Something went wrong";
        alert(err);
    }

}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
    if(e.keyCode === 13) {
        handleSubmit(e);
    }
});