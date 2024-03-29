//import {toUKTime} from "uk-time";
export default function dateTimeForCalendar(startDateTime) {
    // const TIMEOFFSET = '+05:30'
    let date = new Date(Date.parse(startDateTime));
    
    //const ukTime = toUKTime(utcTime);
    const ukTime = date.toLocaleString('en-US', {timeZone: 'Europe/London'});
    const date1 = new Date(ukTime)
    //console.log(date1);
    
    const year = date1.getFullYear();
    const month = String(date1.getMonth() + 1).padStart(2, '0');
    const day = String(date1.getDate()).padStart(2, '0');
    const hour = String(date1.getHours()).padStart(2, '0');
    const minute = String(date1.getMinutes()).padStart(2, '0');

    const start = `${year}-${month}-${day}T${hour}:${minute}:00`;

    const endDate = new Date(date1.getTime() + 30 * 60000);
    const endYear = endDate.getFullYear();
    const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
    const endDay = String(endDate.getDate()).padStart(2, '0');
    const endHour = String(endDate.getHours()).padStart(2, '0');
    const endMinute = String(endDate.getMinutes()).padStart(2, '0');

    const end = `${endYear}-${endMonth}-${endDay}T${endHour}:${endMinute}:00`;

    //console.log("start", start);
    //console.log("end", end);

    

    return {
        start: start,
        end: end
    };
}
