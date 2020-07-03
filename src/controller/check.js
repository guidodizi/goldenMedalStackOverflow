import moment from 'moment';
import Log from '../models/log.model';

export default async function check(req, res) {
  const log = await Log.findOne({
    createdAt: moment().format('YYYY-MM-DD'),
  });

  return res.send({ done: !!log });
}
