var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MoodSchema = new Schema(
    {
        feeling: {type: String, required: true},
        description: {type: String, required: true},
        author: {type: Schema.Types.ObjectId, ref: 'Author', required: true}
    }
);

//virtual for mood url
MoodSchema
.virtual('url')
.get(function(){
    return ('/journal/mood/' + this._id);
})

//export model
module.exports = mongoose.model('Mood', MoodSchema);

