export default function dateTimeForCalander(startDateTime) {
    const TIMEOFFSET = '+05:30'

    let date =  new Date(Date.parse(startDateTime));;

    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    if (month < 10) {
        month = `0${month}`;
    }
    let day = date.getDate();
    if (day < 10) {
        day = `0${day}`;
    }
    let hour = date.getHours();
    if (hour < 10) {
        hour = `0${hour}`;
    }
    let minute = date.getMinutes();
    if (minute < 10) {
        minute = `0${minute}`;
    }

    let newDateTime = `${year}-${month}-${day}T${hour}:${minute}:00.000${TIMEOFFSET}`;

    let event = new Date(Date.parse(newDateTime));

    let start = event;
    // Delay in end time is 1
    let end = new Date(new Date(start).setMinutes(start.getMinutes() + 30));

    return {
        'start': start,
        'end': end
    }
};
