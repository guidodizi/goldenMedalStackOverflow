const mongoose = require('mongoose');
const moment = require('moment');

const WhatsappSchema = new mongoose.Schema({
  localStorage: Object,
  cookies: Object,
  createdAt: Date,
});

WhatsappSchema.pre('save', function (next) {
  if (!this.createdAt) {
    this.createdAt = moment().format('YYYY-MM-DD');
  }
  next();
})

module.exports = mongoose.model('Whatsapp', WhatsappSchema);
