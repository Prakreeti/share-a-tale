$(document).ready(function(){
    var socket = io();
    socket.on("chat", addChat);
    getChats();
    $("#send").click(() => {
        name = $("#txtName").val();
        chat = $("#txtMessage").val();
        if(name == ''){
            $("#txtName").css('border-color', 'red');
        }else{
            $("#txtName").css('border-color', '');
            var chatMessage = {
                name: $("#txtName").val(), chat: $("#txtMessage").val()
            }
            postChat(chatMessage);
        }
    })
});
   
function postChat(chat){
    $.post("http://localhost:3040/chats/save_chat", chat);
}
function getChats() {
    $.get("/chats/fetch_chats", (chats) => {
        chats.forEach(addChat)
    })
}
function addChat(chatObj){
   $("#messages").append(`<h3 class='text-primary mark'>${chatObj.name} </h3><p class='chat-received'>${chatObj.chat}</p>`);
   $("#txtName").val('');
   $("#txtMessage").val('');
}