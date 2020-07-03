import { Schema, model } from 'mongoose';
import moment from 'moment';

const LogSchema = new Schema({
  progress: String,
  createdAt: Date,
});

LogSchema.pre('save', function(next) {
  if (!this.createdAt) {
    this.createdAt = moment().format('YYYY-MM-DD');
  }
  next();
});

export default model('Log', LogSchema);
