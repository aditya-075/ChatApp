const socket = io();

const clientsTotal = document.getElementById('clients-total');

const messageContainer = document.getElementById('message-container');
const nameInput = document.getElementById('name-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

const msgTone = new Audio('/chatNotif.mp3')

messageForm.addEventListener('submit',(e) => {
    e.preventDefault();
    sendMessage();
})

socket.on('clients-total',(data)=>{
    clientsTotal.innerText = `Active Clients : ${data}`
})

function sendMessage(){
    if(messageInput.value=== '') return;
    //console.log(messageInput.value);
    const data = {
        name: nameInput.value,
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
    if(data.name===''){
        alert("enter name");
    }
    else{
        const element = `
            <li class="${isOwnMessage ? "message-right" : "message-left"}">
                <p class="message">
                    ${data.message}
                    <span>${data.name} • ${moment(data.dataTime).format('LT')} ✓</span>
                </p>
            </li>`

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
            <li class="message feedback">
                <p class="feedback" id="feedback">
                    ${data.feedback}
                </p>
            </li>
    `
    messageContainer.innerHTML += element;
})

function clearFeedback(){
    document.querySelectorAll('li.feedback').forEach(ele =>{
        ele.parentNode.removeChild(ele);
        //console.log("hi");
    })
}