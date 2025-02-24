document.addEventListener("DOMContentLoaded", () => {
    const meetingForm = document.getElementById("meeting-form");
    const meetingList = document.getElementById("meeting-list");
    const countrySelect = document.getElementById("country");
    const employeeCountrySelect = document.getElementById("employee-country");
    const timeInput = document.getElementById("time");
    
    
    if (!document.getElementById("employee-country-label")) {
        const employeeCountryLabel = document.createElement("p");
        employeeCountryLabel.textContent = "Choose your city";
        employeeCountryLabel.id = "employee-country-label";
        employeeCountrySelect.parentElement.insertBefore(employeeCountryLabel, employeeCountrySelect);
    }

    if (!document.getElementById("time-input-label")) {
        const timeInputLabel = document.createElement("p");
        timeInputLabel.textContent = "Add employer's date and time";
        timeInputLabel.id = "time-input-label";
        timeInput.parentElement.insertBefore(timeInputLabel, timeInput);
    }

    
    const linkInput = document.createElement("input");
    linkInput.type = "url";
    linkInput.id = "meeting-link";
    linkInput.placeholder = "Enter online meeting link";
    meetingForm.insertBefore(linkInput, meetingForm.lastElementChild);
    
    
    const locations = {
        "New York": "America/New_York",
        "London": "Europe/London",
        "Mumbai": "Asia/Kolkata",
        "Berlin": "Europe/Berlin",
        "Sydney": "Australia/Sydney"
    };
    
    function populateDropdown(dropdown, selectedValue) {
        dropdown.innerHTML = "";
        Object.keys(locations).forEach(city => {
            const option = document.createElement("option");
            option.value = city;
            option.textContent = city;
            if (city === selectedValue) {
                option.selected = true;
            }
            dropdown.appendChild(option);
        });
    }


    populateDropdown(countrySelect, "");
    
    
    let employeeCountry = localStorage.getItem("employeeCountry");
    if (!employeeCountry) {
        employeeCountry = Object.keys(locations)[0]; 
        localStorage.setItem("employeeCountry", employeeCountry);
    }
    populateDropdown(employeeCountrySelect, employeeCountry);

    employeeCountrySelect.addEventListener("change", () => {
        employeeCountry = employeeCountrySelect.value;
        localStorage.setItem("employeeCountry", employeeCountry);
        renderMeetings();
    });

    
    const meetings = JSON.parse(localStorage.getItem("meetings")) || [];
    function saveMeetings() {
        localStorage.setItem("meetings", JSON.stringify(meetings));
    }

    function convertTimeToEmployeeTZ(meetingTime, employerCity) {
        const employerTZ = locations[employerCity] || "UTC";
        const employeeTZ = locations[employeeCountry] || "UTC";

    
        const employerTime = new Date(meetingTime);
        
        
        const utcTime = new Date(employerTime.toLocaleString("en-US", { timeZone: employerTZ }));

        
        return new Intl.DateTimeFormat("en-US", {
            timeZone: employeeTZ,
            dateStyle: "full",
            timeStyle: "short"
        }).format(utcTime);
    }

    function renderMeetings() {
        meetingList.innerHTML = "";
        meetings.sort((a, b) => new Date(a.time) - new Date(b.time)); 
        meetings.forEach((meeting, index) => {
            const convertedTime = convertTimeToEmployeeTZ(meeting.time, meeting.city);
            const li = document.createElement("li");
            
            const meetingText = document.createElement("span");
            meetingText.textContent = `${meeting.title} - ${convertedTime} (${meeting.city} → ${employeeCountry})`;
            
            const link = document.createElement("a");
            link.href = meeting.link;
            link.textContent = "Join Meeting";
            link.target = "_blank";
            link.style.marginLeft = "10px";
            
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "❌";
            deleteBtn.addEventListener("click", () => {
                meetings.splice(index, 1);
                saveMeetings();
                renderMeetings();
            });
            
            li.appendChild(meetingText);
            if (meeting.link) {
                li.appendChild(link);
            }
            li.appendChild(deleteBtn);
            meetingList.appendChild(li);
        });
    }
    renderMeetings();

    meetingForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = document.getElementById("title").value;
        const time = document.getElementById("time").value;
        const city = countrySelect.value;
        const link = document.getElementById("meeting-link").value;

        if (title && time && city) {
            meetings.push({ title, time, city, link });
            saveMeetings();
            renderMeetings();
            meetingForm.reset();
        }
    });
});
