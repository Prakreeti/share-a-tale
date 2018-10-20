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
        location.href = "http://localhost:3040/chats/show_chat_window";
      }
    });
  });
  $('.user-profile-link').click(function(){
    console.log(username);
    $.ajax({
      url: '/users/profile/:' + username,
      method: 'GET',
      data: {username: username}
    });
  });
});
