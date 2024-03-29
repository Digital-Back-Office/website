import {toUKTime} from "uk-time";
export default function dateTimeForCalendar(startDateTime) {
    // const TIMEOFFSET = '+05:30'
    let date = new Date(Date.parse(startDateTime));
    const utcTime = date.toUTCString();
    
    const ukTime = toUKTime(utcTime);
    //console.log(ukTime);
    
    const date1 = new Date(ukTime)
    
    const year = date1.getUTCFullYear();
    const month = String(date1.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date1.getUTCDate()).padStart(2, '0');
    const hour = String(date1.getUTCHours()).padStart(2, '0');
    const minute = String(date1.getUTCMinutes()).padStart(2, '0');

    const start = `${year}-${month}-${day}T${hour}:${minute}:00`;

    const endDate = new Date(date1.getTime() + 30 * 60000);
    const endYear = endDate.getUTCFullYear();
    const endMonth = String(endDate.getUTCMonth() + 1).padStart(2, '0');
    const endDay = String(endDate.getUTCDate()).padStart(2, '0');
    const endHour = String(endDate.getUTCHours()).padStart(2, '0');
    const endMinute = String(endDate.getUTCMinutes()).padStart(2, '0');

    const end = `${endYear}-${endMonth}-${endDay}T${endHour}:${endMinute}:00`;

    //console.log("start", start);
    //console.log("end", end);

    

    return {
        start: start,
        end: end
    };
}
