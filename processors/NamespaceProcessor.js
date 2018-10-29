var nameSpaceProcessor = (function () {
	function setNameSpace(username) {
		namespace = io.of('/' + username);
		onlineUserArray.push(username);
		namespace.on('connection', function(socket){
			io.nsps["/"+username].emit('onlineUsers', onlineUserArray);
			onlineUserArray.forEach(function(user){
				io.nsps["/"+user].emit('newOnlineUser', username);
			})
			socket.on('disconnect', function(){
				onlineUserArray.splice(onlineUserArray.indexOf(username),1);
				delete io.nsps["/"+username];
				onlineUserArray.forEach(function(user){
					io.nsps["/"+user].emit('newOfflineUser', username);
				})
			});
		});
	}
	function getNameSpace(){
		return namespaceArray;
	}
	return{
		createNameSpace : function(username){
			setNameSpace(username);
		},
		getNameSpaceforUser : function(username){
			return getNameSpace()[username];
		},
		getAllNameSpace : function(){
			return getNameSpace();
		}
}
})();
module.exports = nameSpaceProcessor;