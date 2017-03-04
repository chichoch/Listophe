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
        console.log("ROW CHECKED");
        updateRow(listId, id, row, checked);
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
};

function updateRow(listId, rowId, text, checked) {
    databaseController.updateRow(listId, rowId, text, checked, (row) => (io.to(listId).emit('updateRow', rowId, text, checked)));
};

/*
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
*/

