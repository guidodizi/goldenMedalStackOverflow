const mongoose = require('mongoose');
const moment = require('moment');

const LogSchema = new mongoose.Schema({
  progress: String,
  createdAt: Date,
});

LogSchema.pre('save', function(next) {
  if (!this.createdAt) {
    this.createdAt = moment().format('YYYY-MM-DD');
  }
  next();
})

module.exports =  mongoose.model('Log', LogSchema);
