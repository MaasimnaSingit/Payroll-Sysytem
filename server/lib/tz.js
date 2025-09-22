const { utcToZonedTime, format } = require('date-fns-tz');
const ZONE = 'Asia/Manila';
const nowPH = () => utcToZonedTime(new Date(), ZONE);
const ymd = (d) => format(d, 'yyyy-MM-dd', { timeZone: ZONE });
module.exports = { ZONE, nowPH, ymd };


