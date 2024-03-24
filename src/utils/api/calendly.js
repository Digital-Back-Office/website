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

      if ((start1<end2 && end1>start2) || (start2<end1 && end2>start1)){
        flag = false;
      }
        
    })

    if (!flag){
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