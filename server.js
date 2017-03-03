var express = require('express'),
    app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var databaseController = require('./backend/Database.js')();

databaseController.createList("TEST", (list) => (console.log('Callback:', list)));

app.use(express.static(__dirname + '/'));

app.get('/:id', function (req, res) {
    var listId = req.params.id;
    if (listId !== 'favicon.ico') {
        console.log('GET REQ: ' + listId);
        databaseController.getList(listId, (data) => (res.json(data)));
    }
});

//Delete a list
app.delete('/:listId', function (req, res) {
    var listId = req.params.listId;
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
    var listId = req.params.listId;
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
        /*console.log('Added row with id: ' + rowId);
        if (rowId !== -1) {
            //TEST 
            io.to(listId).emit('newRow', rowId, row);
        }
        */
    });
    socket.on('createNewList', function (listName) {
        createNewList(listName, socket);
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

function createNewList(listName, socket) {
    databaseController.createList(listName, (list) => (io.to(socket.id).emit('createdNewList', list.id)));
}

function addRow(listId, r) {
    databaseController.addRow(listId, r, (row) => (io.to(listId).emit('newRow', row)));
    /*var rowId = -1;
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
    return rowId;*/
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
    /*id = parseInt(i);
    data = {
        id: i,
        row: r,
        checked: c
    };

    lists[listId].list[i] = data;
    */
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
                    break;    
                }
            }
        }
    } 
    return data;
};
