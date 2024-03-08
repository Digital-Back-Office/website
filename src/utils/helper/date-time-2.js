export default function dateTimeForCalendar(startDateTime) {
    // const TIMEOFFSET = '+05:30'
    let date = new Date(Date.parse(startDateTime));

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');

    const start = `${year}-${month}-${day}T${hour}:${minute}:00`;

    const endDate = new Date(date.getTime() + 30 * 60000);
    const endYear = endDate.getFullYear();
    const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
    const endDay = String(endDate.getDate()).padStart(2, '0');
    const endHour = String(endDate.getHours()).padStart(2, '0');
    const endMinute = String(endDate.getMinutes()).padStart(2, '0');

    const end = `${endYear}-${endMonth}-${endDay}T${endHour}:${endMinute}:00`;

    console.log('start' + start);
    console.log('end' + end);

    return {
        start: start,
        end: end
    };
}
