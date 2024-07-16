const socket = io();

const clientsTotal = document.getElementById('clients-total');

const messageContainer = document.getElementById('message-container');
const nameInput = document.getElementById('name-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const viewParticipants = document.getElementById('view-participants')
const Pdiv = document.getElementById('participantsList');
const popupOverlay = document.getElementById('popup-overlay');
const blurOverlay = document.getElementById('blur-overlay')
const inputJoin = document.getElementById('input-join');
const joinBtn = document.getElementById('join-btn');

showOverlay();

joinBtn.addEventListener('click',()=>{
    if(inputJoin.value!==""){
        hideOverlay();
        popupOverlay.style.display="none";
        nameInput.value = inputJoin.value;
    }

    socket.emit('user-joined',{name : inputJoin.value})

    viewParticipants.style,display = "block";
    updateList([]);
})

socket.on('clients-total',(data)=>{
    clientsTotal.innerText = `Active Clients : ${data}`
})

viewParticipants.addEventListener('click',toggleParticipantsList);

let isParticipantsListVisible = false;

function toggleParticipantsList(){
    isParticipantsListVisible = !isParticipantsListVisible;
    Pdiv.style.display = isParticipantsListVisible ? 'block' : 'none';
    viewParticipants.textContent = isParticipantsListVisible ? 'Hide Participants' : 'View Participants';
}

socket.on('update-participants',(participants)=>{
    updateList(participants);
    // clientsTotal.innerText = `Active Clients: ${participants.length}`;
})

function updateList(participantsArray) {
    Pdiv.innerHTML = '';
    participantsArray.forEach(([socketId, name]) => {
        const li = document.createElement('li');
        li.textContent = name;     // or `${name} (${socketId})` if you want to show the socket ID
        li.style.listStyleType = "none";
        Pdiv.appendChild(li);
    });
}


function showOverlay() {
    blurOverlay.style.display = 'block';
    popupOverlay.style.display = 'block';
}

function hideOverlay() {
    blurOverlay.style.display = 'none';
    popupOverlay.style.display = 'none';
}


const msgTone = new Audio('/chatNotif.mp3')

messageForm.addEventListener('submit',(e) => {
    e.preventDefault();
    sendMessage();
})


function sendMessage(){
    if(messageInput.value=== '') return;
    //console.log(messageInput.value);
    const data = {
        name: inputJoin.value,
        message: messageInput.value,
        dataTime : new Date()
    }
    socket.emit('message',data);
    addMessageToUI(true,data)
    messageInput.value = '';
}

socket.on('chat-message',(data)=>{
    //console.log(data);
    msgTone.play();
    addMessageToUI(false,data);
})

function addMessageToUI(isOwnMessage,data){
    clearFeedback();
    if(data.name!==''){
        const element = 
            `<li class="${isOwnMessage ? "message-right" : "message-left"}">
                <h6>${isOwnMessage ? "" : data.name}</h6>
                <p class="message">
                    ${data.message}
                    <span> ${moment(data.dataTime).format('LT')} ✓</span>
                </p>
            </li>`
            // `<p class="${isOwnMessage ? "username-right" : "username-left"}">${data.name}</p>
            // <li class="${isOwnMessage ? "message-right" : "message-left"}">
            //     <p class="message">
            //         ${data.message}
            //         <span>• ${moment(data.dataTime).format('LT')} ✓</span>
            //     </p>
            // </li>
            // `

    messageContainer.innerHTML += element    
    }
    scrollToBottom();
}

function scrollToBottom(){
    messageContainer.scrollTo(0,messageContainer.scrollHeight)
}

messageInput.addEventListener('focus',(e)=>{
    socket.emit('feedback',{
        feedback: `${nameInput.value} is typing..`
    })

})

messageInput.addEventListener('keypress',(e)=>{
    socket.emit('feedback',{
        feedback: `${nameInput.value} is typing..`
    })
})
messageInput.addEventListener('blur',(e)=>{
    socket.emit('feedback',{
        feedback: ``
    })
})

socket.on('feedback',(data)=>{
    clearFeedback();
    const element = `
            <li class="message-feedback">
                <p class="feedback" id="feedback">
                    ${data.feedback}
                </p>
            </li>
    `
    messageContainer.innerHTML += element;
})

function clearFeedback(){
    document.querySelectorAll('li.message-feedback').forEach(ele =>{
        ele.parentNode.removeChild(ele);
        //console.log("hi");
    })
}



 

