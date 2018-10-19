var token;
var username;
$(document).ready(function(){
    $('.signin-submit').click(function(){
        username = $('[name=username]').val();
        $.ajax({
            url: '/users/signin',
            method: 'POST',
            data: {username: $('[name=username]').val(), password: $('[name=password]').val()},
            success: function(data){
                token = data.token;
                console.log(token);
                location.href = "http://localhost:3040/chats/show_chat_window";
                // getChatWindow();
            }
        });
    });
});

function getChatWindow(){
    $.get("http://localhost:3040/chats/show_chat_window");
}