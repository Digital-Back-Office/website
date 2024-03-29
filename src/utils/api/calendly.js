//import {toUKTime} from "uk-time";

export default async function getBusyTimes() {
    const dateInput = document.getElementById(
      "date-time-picker"
    );
    
    const selectedDate = dateInput?.value.substring(0, 10);
    const start1 = new Date(dateInput?.value);
    const end1 = new Date(start1.getTime()+30*60000);
    const calendly_auth = import.meta.env.PUBLIC_CALENDLY_AUTH;
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer "+calendly_auth, 
      },
    };
    
    //const userUrl = "https://api.calendly.com/users/me";
    const startTime = selectedDate + "T00%3A00%3A00" + ".000000Z";
    const endTime = selectedDate + "T23%3A59%3A59" + ".000000Z";
    const busyUrl =
      "https://api.calendly.com/user_busy_times?user=https%3A%2F%2Fapi.calendly.com%2Fusers%2Fd77417f9-a0c7-4181-aad6-8622656ffca7&start_time=" +
      startTime +
      "&end_time=" +
      endTime;

    
    
    const data = await fetch(busyUrl, options)
      .then((response) => response.json())
      .catch((err) => console.error(err));

    const result = {...data};
    //console.log(result);
    let flag = true;
    result.collection.map((date)=>{
      const start2 = new Date(date.start_time);
      const end2 = new Date(date.end_time);

      //console.log(start2);

      if ((start1<end2 && end1>start2) || (start2<end1 && end2>start1)){
        flag = false;
      }
        
    })

    const flag2 = await getScheduledTime(start1);

    if (!flag || !flag2){
      const error = document.getElementById("schedule-error");
      error.innerHTML = "Slot already booked, select another time"
      error.classList.add("error");
      const dateSet = document.getElementById("date-set");
      dateSet.innerHTML = "false";
    }else{
      const error = document.getElementById("schedule-error");
      const dateSet = document.getElementById("date-set");
      dateSet.innerHTML = "true";
      error.innerHTML = ""
      error.classList.remove("error");
    }


    return data;
  }

async function getScheduledTime(startTime){
  const calendly_auth = import.meta.env.PUBLIC_CALENDLY_AUTH;
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer '+calendly_auth,
    }
  };
  
  const data = await fetch('https://api.calendly.com/user_availability_schedules/cbb4c99f-fd37-418d-88ac-011e9dc839cf', options)
    .then(response => response.json())
    .catch(err => console.error(err));

  const result = {...data};

  let flag = false;
  const day = startTime.getDay();

  const intervals = result.resource.rules[day].intervals || [];
  //console.log(intervals);
  
  const ukTime = startTime.toLocaleString('en-US', {timeZone: 'Europe/London'});
  //console.log(ukTime);
  const date1 = new Date(ukTime);
  //console.log(date1);
  
  
  const hr = parseInt(date1.getHours());
  const min = parseInt(date1.getMinutes());

  //console.log(hr, min);

  intervals.map((interval)=>{
    const start = interval.from;
    const end = interval.to;
    //console.log(start, end);
    const hr1 = parseInt(start.substring(0, 3));
    const min1 = parseInt(start.substring(3, 5));
    const hr2 = parseInt(end.substring(0, 3));
    const min2 = parseInt(end.substring(3, 5));
    
    if ( ((hr>hr1)||(hr==hr1&&min>=min1)) && 
         ((hr<hr2)||(hr==hr2 && min<=min2))
    ){
      flag = true;
    }
  })

  return flag;

}


export async function getBusyDays(){

  const calendly_auth = import.meta.env.PUBLIC_CALENDLY_AUTH;
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer '+calendly_auth,
    }
  };
  
  const data = await fetch('https://api.calendly.com/user_availability_schedules/cbb4c99f-fd37-418d-88ac-011e9dc839cf', options)
    .then(response => response.json())
    .catch(err => console.error(err));

  const result = {...data};
  //console.log(result.resource.rules);

  let arr = [];

  result.resource.rules.map((obj, index)=>{
    if (obj.intervals.length===0){
      arr.push(index);
    }
  })
  
  //console.log(arr);
  return arr;
}