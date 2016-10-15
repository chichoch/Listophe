var express = require('express'),
    app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/'));

app.get('/:id', function (req, res) {
    var listId = parseInt(req.params.id);
    console.log('GET REQ: ' + listId);
    var data = {};
    for (var i = 0, len = lists.length; i < len; i++) {
        if (lists[i].listId === listId) {
            data = lists[i];
            console.log('GET list :' + i);
            break;
        }
    }
    res.json(data);
});

//Delete a list
app.delete('/:listId', function (req, res) {
    var listId = parseInt(req.params.listId);
    var data = {
        status: false
    };
    for (var i = 0, len = lists.length; i < len; i++) {
        console.log('Going through the list');
        if (lists[i].listId === listId) {
            lists.splice(i, 1);
            data = {
                status: true,
                data: lists[i]
            };
            console.log('Deleted List with id: ' + listId);
            break;
        }
    }
    res.json(data);
});

//Delete a row from list:
app.delete('/:listId/:id', function (req, res) {
    var listId = parseInt(req.params.listId);
    var id = parseInt(req.params.id);
    var data = {
        status: false
    };

    //Double for-loop, as we don't really know if we'll be counting up the number of lists.
    for (var i = 0, len = lists.length; i < len; i++) {
        if (lists[i].listId === listId) {
            for (var j = 0, len2 = lists[i].list.length; j < len2; j++) {
                if (lists[i].list[j].id === id) {
                    console.log('Deleted row: "' + lists[i].list[j].row + ' " From list with ID: ' + listId);
                    lists[i].list.splice(j, 1);
                    data = {
                        status: true
                    };
                    break;
                }
            }
        }
    }
    res.json(data);
});


/*           SOCKET.IO               */


//TODO Should only send list-specific information to the users that uses that list.
io.on('connection', function (socket) {
    console.log('a user connected: ' + socket.id);
    socket.on('OpenList', function (lId) {
        console.log('User; ' + socket.id + ' opened list: ' + lId);
        //lists[lId].participants.push({socket: socket.id});
        socket.join(lId);
    });
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
    socket.on('addRow', function (listId, row) {
        var rowId = addRow(listId, row);
        console.log('Added row with id: ' + rowId);
        if (rowId !== -1) {
            //TEST 
            io.to(listId).emit('newRow', rowId, row);
            /*
            for (var i = 0, len = lists[listId].participants.length; i < len; i++) {
                //io.emit('newRow', rowId, row);
                var socketId= lists[listId].participants[i].socket;
                io.sockets.socket(socketId).emit('newRow', rowId, row);
            }*/
        }
    });
    socket.on('createNewList', function (listName) {
        var data = createNewList(listName);
        io.to(socket.id).emit('createdNewList', data);
    });
    socket.on('rowChecked', function (listId, id, row, checked) {
        console.log('RowChecked: ID: ' + id + ' content:  ' + row + ' Checked:  ' + checked);
        var data = updateRow(listId, id, row, checked = !checked);
        console.log('RowUPDATED: ID: ' + data.id + ' content:  ' + data.row + ' Checked:  ' + data.checked);
        io.to(listId).emit('updateRow', data.id, data.row, data.checked);
    });
});


http.listen(8080, function () {
    console.log('Running on port 8080');
});


/*================ Helper functions ====================== */

function emitToUsers(listId, funcName, params) {

};

function createNewList(listName) {
    var lId = lists.length;
    console.log('Creating new list with id: ' + lId);
    lists.push({
        listId: lId,
        url: 'default2',
        name: listName,
        list: []
    });
    return lId;
}

function addRow(listId, r) {
    var rowId = -1;
    listId = parseInt(listId);
    for (var i = 0, len = lists.length; i < len; i++) {
        if (lists[i].listId === listId) {
            rowId = parseInt(lists[i].list.length);
            lists[i].list.push({
                id: rowId,
                row: r,
                checked: false
            });
        }
    }
    return rowId;
};


function deleteRow(listId, id) {
    var data = {
        status: false
    };
    for (var i = 0, len = lists.length; i < len; i++) {
        if (lists[i].listId === listId) {
            for (var j = 0, len2 = lists[i].list.length; j < len2; j++) {
                if (lists[i].list[j].id === id) {
                    console.log('Deleted row: "' + lists[i].list[j].row + ' " From list with ID: ' + listId);
                    lists[i].list.splice(j, 1);
                    data = {
                        status: true
                    };
                    break;
                }
            }
        }
    }
    return data;
};

function updateRow(listId, i, r, c) {
    listId = parseInt(listId);
    id = parseInt(i);
    data = {
        id: i,
        row: r,
        checked: c
    };

    lists[listId].list[i] = data;
    /*
    for (var x=0 , len=lists.length; x < len; x++) {
        if (lists[x].listId === listId){
            for (var j=0, len2 = lists[x].list.length; j<len2; j++){
                if (lists[x].list[j].id === i) {
                    console.log('updated Row: "' + lists[x].list[j].row + ' " From list with ID: ' + listId);
                    data = {
                        id: i,
                        row: r,
                        checked: c
                    };
                    lists[x].list[j] = data;
                    data = { status: true};
                    break;    
                }
            }
        }
    } */
    return data;
};

//TODO Refactor this to a Database.
var lists = [
    {
        listId: 0,
        url: 'none',
        name: 'empty',
        list: []
    },
    {
        listId: 1,
        url: 'default',
        name: 'Default List!',
        list: [
            {
                id: 0,
                row: 'Create this list',
                checked: true
			},
            {
                id: 1,
                row: 'Create another list',
                checked: false
			}
		]
	},
    {
        listId: 2,
        url: 'default2',
        name: '2222',
        list: [
            {
                id: 0,
                row: 'Create this list',
                checked: true
			},
            {
                id: 1,
                row: 'Create another list',
                checked: false
			}
		]
	}];
