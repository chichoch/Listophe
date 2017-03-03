module.exports = function () {
    var mongoose = require('mongoose');
    var url = 'mongodb://localhost:27017/listophe';
    mongoose.connect(url);

    var List = mongoose.model('List', {
        name: String,
        url: String,
        rows: [{
            text: String,
            checked: Boolean
        }]
    });

    var databaseController = {
        createList: (name, callback) => {
            var newList = new List({
                name: name,
                url: '',
                rows: []
            });
            newList.save(function (err, listObj) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('saved successfully:', listObj);
                    callback(listObj);
                }
            });
        },
        deleteList: (listId) => {

        },
        getList: (listId) => {
            List.findById(listId, function (err, found) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Found list:', found);
                }
                return found;
            });
        },
        addRow: (listId, text, callback) => {
            List.findById(listId, function (err, found) {
                if (err) {
                    console.log(err);
                }
                var row = {
                    text: text,
                    checked: false
                };
                found.rows.push(row);
                found.save(function (err, rows) {
                    if (err) {
                        console.log("Couldn't save new row:", err);
                    } else {
                        console.log("Updated rows:",rows);
                        console.log('Updated row:', row);
                        row.id = 
                        callback(row);    
                    }
                });
            })
        },
        checkRow: (listId, rowId) => {

        },
        deleteRow: (listId, rowId) => {

        },
        getRow: (listId, rowId) => {

        }
    };
    return databaseController;
}