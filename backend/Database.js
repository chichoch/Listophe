module.exports = function () {
    var mongoose = require('mongoose');
    var url = 'mongodb://localhost:27017/listophe';
    
    mongoose.connect(url);
    //Use this code to clean the database:
    /*mongoose.connect(url, function(){
        mongoose.connection.db.dropDatabase();
    });*/
    
    var listSchema = mongoose.Schema({
        name: String,
        url: String,
        rows: [{
            text: String,
            checked: Boolean,
        }]
    });
    listSchema.methods.addRow = function (text, callback) {
        var row = {
            text: text,
            checked: false,
        };
        this.rows.push(row);
        this.save(function (err, rows) {
            if (err) {
                console.log("Couldn't save new row:", err);
            } else {
                console.log("Updated rows:", rows);
                row = rows.rows.slice(-1)[0];
                console.log('Updated row:', row);
                callback(row);
            }
        });
    }
    
    var List = mongoose.model('List', listSchema);

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
        getList: (listId, callback) => {
            List.findById(listId, function (err, found) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Found list:', found);
                    callback(found);
                }
            });
        },
        addRow: (listId, text, callback) => {
            List.findById(listId, function (err, found) {
                if (err) {
                    console.log(err);
                } else {
                    found.addRow(text, callback);
                }
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