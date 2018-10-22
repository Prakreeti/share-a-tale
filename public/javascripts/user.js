var token;
var username;
var tokenHash = {};
$(document).ready(function(){
  $('.signin-submit').click(function(){
    username = $('[name=username]').val();
    signInUser(username, function(){
      getChatWindow(username);
    });
  });

  $('.user-logout-link').click(function(){
    username = $('.user-name').text();
    $.cookie(username, '', {expires: 1, path: '/'});
    location.href = 'http://localhost:3040/#section-signin';
  });

  $('.user-profile-link').click(function(){
    $.ajax({
      url: '/users/profile/:' + username,
      method: 'GET',
      data: {username: username}
    });
  });
});

var signInUser = function(username, callback){
  $.ajax({
    url: '/users/signin',
    method: 'POST',
    data: {username: username, password: $('[name=password]').val()},
    success: function(data){
      token = data.token;
      $.cookie(username, token, {expires: 1, path: '/'});
      if(callback){
        callback();
      } 
    }
  });
}

var getChatWindow = function(username){
  $.ajax({
    url: '/chats/show_chat_window',
    method: 'POST',
    data: {
      'user': username 
    },
    beforeSend: function(xhr) {
      if ($.cookie(username)) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + $.cookie(username));
      }
    },
    error: function(){
      location.href = 'http://localhost:3040/#section-signin';
    },
    success: function(data){
      location.href = 'http://localhost:3040/chats/display_chat_window?user=' + username;
    }
  })
}
