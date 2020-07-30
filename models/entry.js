var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var EntrySchema = new Schema(
    {
        title: {type: String, required: true},
        note: {type: String, required: true},
        date: {type: String, required: true},
        author: {type: Schema.Types.ObjectId, ref: 'Author', required: true}
    }
);

//virtual for entry url
EntrySchema
.virtual('url')
.get(function(){
    console.log(this._id)
    return '/journal/entry/'+this._id;
});

//export model
module.exports = mongoose.model('Entry', EntrySchema);
