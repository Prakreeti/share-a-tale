var username;
$(document).ready(function(){
  username = $('.user-name').text();
  firstContact = $('.contact').first();
  $(firstContact).addClass('active active-chat-contact');
  from = $(firstContact).attr('id').split('-')[1];
  $('.contact-profile').append('<img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" /><p>'+ from +'</p>');
  if(username != null){
    var socket = io('/' + username);
    socket.on("chatMessage", addChat);
    socket.on("onlineUsers", makeUsersOnline);
    socket.on("newOnlineUser", makeUserOnline);
    getChats(from, username);
  }

  $("#send").click(() => {
    sendChatMessage();
  })

  function getChats(from, to) {
    $.ajax({
      url: '/chats/fetch_chats',
      method: 'POST',
      data: {
        user: username,
        from: from,
        to: to
      },
      beforeSend: function(xhr) {
        if ($.cookie(username)) {
          xhr.setRequestHeader('Authorization', 'Bearer ' + $.cookie(username));
        }
      },
      error: function(){
        location.href = 'http://localhost:3040/#section-signin';
      },
      success: function(results){
        results.forEach(addChat);
      }
    });
  }

  $('.contact').on('click', function() {
    $('.contact').removeClass('active active-chat-contact');
    friendName = $(this).attr('id').split('-')[1];
    username = username = $('.user-name').text();
    $('.contact-profile').empty();
    $('.contact-profile').append('<img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" /><p>'+ friendName +'</p>');
    $('.messages-box').hide();
    $(this).addClass('active active-chat-contact');
    $('#messages-box-' + friendName).empty();
    getChats(friendName, username);
    $('#messages-box-' + friendName).show(); 
  });

  $(".messages").animate({ scrollTop: $(document).height() }, "fast");

  $("#profile-img").click(function() {
    $("#status-options").toggleClass("active");
  });

  $(".expand-button").click(function() {
    $("#profile").toggleClass("expanded");
    $("#contacts").toggleClass("expanded");
  });

  $("#status-options ul li").click(function() {
    $("#profile-img").removeClass();
    $("#status-online").removeClass("active");
    $("#status-away").removeClass("active");
    $("#status-busy").removeClass("active");
    $("#status-offline").removeClass("active");
    $(this).addClass("active");
    
    if($("#status-online").hasClass("active")) {
      $("#profile-img").addClass("online");
    } else if ($("#status-away").hasClass("active")) {
      $("#profile-img").addClass("away");
    } else if ($("#status-busy").hasClass("active")) {
      $("#profile-img").addClass("busy");
    } else if ($("#status-offline").hasClass("active")) {
      $("#profile-img").addClass("offline");
    } else {
      $("#profile-img").removeClass();
    };
    
    $("#status-options").removeClass("active");
  });

  function newMessage() {
    message = $(".message-input input").val();
    if($.trim(message) == '') {
      return false;
    }
    $('<li class="sent"><img src="http://emilcarlsson.se/assets/mikeross.png" alt="" /><p>' + message + '</p></li>').appendTo($('.messages ul'));
    $('.message-input input').val(null);
    $('.contact.active .preview').html('<span>You: </span>' + message);
    $(".messages").animate({ scrollTop: $(document).height() }, "fast");
  };

  $(window).on('keydown', function(e) {
    if (e.which == 13) {
      sendChatMessage();
      return false;
    }
  });
});
   
function postChat(chat, username){
  console.log(chat);
  $.ajax({
    url: '/chats/save_chat',
    method: 'POST',
    data: {
      user: username,
      chat: JSON.stringify(chat)
    },
    beforeSend: function(xhr) {
      if ($.cookie(username)) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + $.cookie(username));
      }
    },
    error: function(){
      // location.href = 'http://localhost:3040/#section-signin';
    },
    success: function(){
      addChat(chat);
    }
  });
}

function addChat(chatObj){
  // var activeFriend = $('.active-chat-contact').attr('id').split('-')[1];
  username = $('.user-name').text();
  if(chatObj.from.toLowerCase() == username){
    $("#messages-box-" + chatObj.to).append(`<li class="replies"><img src="http://emilcarlsson.se/assets/mikeross.png" alt="" /><p class="wrap-word-in-p">${chatObj.chat}</p></li>`);
  }
  else{
    $("#messages-box-" + chatObj.from).append(`<li class="sent"><img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" /><p class="wrap-word-in-p">${chatObj.chat}</p></li>`);
  }
  $("#txtName").val('');
  $("#txtMessage").val('');
}

function makeUsersOnline(onlineUsersArray){
  onlineUsersArray.forEach(function(username){
    makeUserOnline(username);
  }) 
}

function makeUserOnline(username){
  $('#contact-' + username).find('.contact-status').addClass('online');
}

var sendChatMessage = function(){
  toName = $('.active-chat-contact').attr('id').split('-')[1];
  chat = $("#txtMessage").val();
  if(chat == ''){
    $("#txtMessage").css('border-color', 'red');
  }else{
    $("#txtMessage").css('border-color', '');
    var chatMessage = {
      to: toName, chat: $("#txtMessage").val(), from: username
    }
    postChat(chatMessage, username);
  }
}
