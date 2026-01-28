const eventTimeRaw = "11:00-14:00";
const times = eventTimeRaw.split(/[-\s]+/);
console.log('Raw:', eventTimeRaw);
console.log('Split:', times);
console.log('Start:', times[0]);
console.log('End:', times[1]);

const eventTimeRaw2 = "11:00 - 14:00";
const times2 = eventTimeRaw2.split(/[-\s]+/);
console.log('Raw2:', eventTimeRaw2);
console.log('Split2:', times2);
