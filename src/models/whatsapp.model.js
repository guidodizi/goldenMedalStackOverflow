import { Schema, model } from 'mongoose';
import moment from 'moment';

const WhatsappSchema = new Schema({
  localStorage: Object,
  cookies: Object,
  createdAt: Date,
});

WhatsappSchema.pre('save', function(next) {
  if (!this.createdAt) {
    this.createdAt = moment().format('YYYY-MM-DD');
  }
  next();
});

export default model('Whatsapp', WhatsappSchema);
