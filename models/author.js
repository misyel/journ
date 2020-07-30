var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var AuthorSchema = new Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true}
});

/*
//virtual for author name
AuthorSchema
.virtual('name')
.get( () => {
    console.log(this.firstName);
    var fullname = this.firstName + " " + this.lastName;
    return fullname;
})
*/

//virtual for url
AuthorSchema
.virtual('url')
.get(function(){
    return ('/journal/author/' + this._id);
});

//export model
module.exports = mongoose.model('Author', AuthorSchema);