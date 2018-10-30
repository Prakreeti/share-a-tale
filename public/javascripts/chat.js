var username;
$(document).ready(function(){
  username = $('.user-name').text();
  firstContact = $('.contact').first();
  $(firstContact).addClass('active active-chat-contact');
  from = $(firstContact).attr('id').split('-')[1];
  imgSrc = $(firstContact).find('img').attr('src');
  $('.contact-profile').append('<img src="" alt="" /><p>'+ from +'</p>');
  $('.contact-profile').find('img').attr('src', imgSrc);

  if(username != null){
    var socket = io('/' + username);
    socket.on("chatMessage", addChat);
    socket.on("onlineUsers", makeUsersOnline);
    socket.on("newOnlineUser", makeUserOnline);
    socket.on("newOfflineUser", makeUserOffline);
    getChats(from, username);
  }
  scrollMessagesToBottom(from);
  
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
    username = $('.user-name').text();
    fullName = $(this).find('.name').text();
    imgSrc = $(this).find('img').attr('src');
    $('.contact-profile').empty();
    $('.contact-profile').append('<img src="" alt="" /><p>'+ fullName +'</p>');
    $('.contact-profile').find('img').attr('src', imgSrc);
    $('.messages-box').hide();
    $(this).addClass('active active-chat-contact');
    $('#messages-box-' + friendName).empty();
    getChats(friendName, username);
    scrollMessagesToBottom(friendName);
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

  $('#search-text').on('keyup', function(){
    if($(this).val() != null && $(this).val() != ''){
      var searchVal = $(this).val();
      console.log(searchVal);
      $('.name').each(function(){
        if($(this).text().trim().toLowerCase().includes(searchVal.toLowerCase())){
          $(this).closest('.contact').removeClass('hidden');
        }
        else{
          $(this).closest('.contact').addClass('hidden');
        }
      });  
    }
    else{
      $('.name').each(function(){ 
        $(this).closest('.contact').removeClass('hidden');
      });
    }
    if($('#contacts ul').children(".contact:visible").length == 0){
      $('.no-contacts-found').removeClass('hidden');
    }
    else{
      $('.no-contacts-found').addClass('hidden');
    }
  });
  
});//document.ready ends here

var  postChat = function(chat, username){
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

var addChat = function(chatObj){
  // var activeFriend = $('.active-chat-contact').attr('id').split('-')[1];
  username = $('.user-name').text();
  if(chatObj.from.toLowerCase() == username){
    imgSrc = $('#profile-img').attr('src');
    $("#messages-box-" + chatObj.to).append(`<li class="replies"><img src="" alt="" /><p class="wrap-word-in-p">${chatObj.chat}</p></li>`);
    $('.replies').find('img').attr('src', imgSrc);
  }
  else{
    imgSrc = $('#contact-' + chatObj.from).find('img').attr('src');
    $("#messages-box-" + chatObj.from).append(`<li class="sent"><img src="" alt="" /><p class="wrap-word-in-p">${chatObj.chat}</p></li>`);
    $('.sent').find('img').attr('src', imgSrc);
  }
  $("#txtName").val('');
  $("#txtMessage").val('');
}

var makeUsersOnline = function(onlineUsersArray){
  onlineUsersArray.forEach(function(username){
    makeUserOnline(username);
  }) 
}

var makeUserOnline = function(username){
  $('#contact-' + username).find('.contact-status').addClass('online');
}

var makeUserOffline = function(username){
  contactStatus = $('#contact-' + username).find('.contact-status');
  $(contactStatus).removeClass('online');
  $(contactStatus).addClass('offline');
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

var scrollMessagesToBottom = function(friendName){
  // alert('here');
  messageDiv = $('#messages-box-' + friendName);
  $('.messages').animate({
    scrollTop: $(messageDiv).offset().top
  }, 2000);
  // $(messageDiv).scrollTop($(messageDiv).scrollHeight);
}
