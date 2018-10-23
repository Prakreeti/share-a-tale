var nameSpaceProcessor = (function () {
	function setNameSpace(username) {
		namespace = io.of('/' + username);
		namespaceArray[username] = namespace;
		onlineUserArray.push(username);
		namespace.on('connection', function(socket){
			namespace.emit('onlineUsers', onlineUserArray);
			onlineUserArray.forEach(function(user){
				namespaceArray[user].emit('newOnlineUser', username);
			})
			socket.on('disconnect', function(socket){
				onlineUserArray.splice(onlineUserArray.indexOf(username),1);
				delete namespaceArray[username];
				onlineUserArray.forEach(function(user){
					namespaceArray[user].emit('newOfflineUser', username);
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