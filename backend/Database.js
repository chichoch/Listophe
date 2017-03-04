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
                console.log("Rows:", rows);
                row = rows.rows.slice(-1)[0];
                console.log('Added row:', row);
                callback(row);
            }
        });
    }
    
    listSchema.methods.updateRow = function (rowId, text, checked, callback) {
        console.log("TESSST: ", this.rows);
        for (var i = 0, len = this.rows.length; i < len; i++) {
            console.log("List ids:", this.rows[i]._id, "RowId:", rowId);
            console.log("Equality:", this.rows[i]._id == rowId);
            if (this.rows[i]._id == rowId){
                console.log('FOUND ROW!', this.rows[i]);
                this.rows[i].checked = !checked;
                this.rows[i].text = text;
                var data = this.rows[i];
                this.save(function (err, rows) {
                   if (err) {
                       console.log("Couldn't update Row", err);
                   } else {
                       console.log('Successfully saved (updateRow)', data);
                       callback(data);
                   }
                });
                break;
            }
        }
        /*this.rows.findById(rowId, function(err, row) {
            if (err) {
                console.log(err);
            } else {
                console.log('Found row:', row);
                row.checked = checked;
                row.text = text;
                this.save(function (err, rows) {
                   if (err) {
                       console.log("Couldn't update Row", err);
                   } else {
                       console.log('Successfully saved (updateRow)');
                       callback(row);
                   }
                });
            }
        });
        */
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
        updateRow: (listId, rowId, text, checked, callback) => {
            List.findById(listId, function (err, list) {
                if (err) {
                    console.log(err);
                } else {
                    //TODO 
                    list.updateRow(rowId, text, checked, callback);
                }
            });

        },
        deleteRow: (listId, rowId) => {

        },
        getRow: (listId, rowId) => {

        }
    };
    return databaseController;
}