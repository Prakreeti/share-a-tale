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
			// namespace.on('disconnect', function(socket){
			//   namespace.emit('onlineUsers', onlineUserArray);
			//   onlineUserArray.forEach(function(user){
			//     namespaceArray[user].emit('newOnlineUser', username);
			//   })
			// });
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