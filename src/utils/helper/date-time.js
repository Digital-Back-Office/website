export default function dateTimeForCalendar(startDateTime) {
    // const TIMEOFFSET = '+05:30'
    let date = new Date(Date.parse(startDateTime));
    //console.log("parsed value:", date);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hour = String(date.getUTCHours()).padStart(2, '0');
    const minute = String(date.getUTCMinutes()).padStart(2, '0');

    const start = `${year}-${month}-${day}T${hour}:${minute}:00`;

    const endDate = new Date(date.getTime() + 30 * 60000);
    const endYear = endDate.getUTCFullYear();
    const endMonth = String(endDate.getUTCMonth() + 1).padStart(2, '0');
    const endDay = String(endDate.getUTCDate()).padStart(2, '0');
    const endHour = String(endDate.getUTCHours()).padStart(2, '0');
    const endMinute = String(endDate.getUTCMinutes()).padStart(2, '0');

    //console.log("start", start);
    //console.log("end", end);

    const end = `${endYear}-${endMonth}-${endDay}T${endHour}:${endMinute}:00`;

    return {
        start: start,
        end: end
    };
}
