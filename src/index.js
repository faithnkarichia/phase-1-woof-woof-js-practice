document.addEventListener("DOMContentLoaded", function () {
    const filterDiv = document.getElementById("filter-div");
    const btnGoodDogFilter = document.getElementById("good-dog-filter");
    const dogBar = document.getElementById("dog-bar");
    const dogSummaryContainer = document.getElementById("dog-summary-container");
    const dogInfo = document.getElementById("dog-info");
  
    let isFilterOn = false;
    let allDogs = [];
    let currentSelectedDogId = null; // Keep track of which dog is selected
  
    
    fetch("http://localhost:3000/pups")
      .then((res) => res.json())
      .then((pups) => {
        
        pups.sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
        allDogs = pups;
        displayDogs(allDogs);
        
        if (allDogs.length > 0 && !currentSelectedDogId) {
          currentSelectedDogId = allDogs[0].id;
          dogInformation(allDogs[0]);
        }
      })
      .catch((error) => console.error("Error fetching pups:", error));
  
    
    btnGoodDogFilter.addEventListener("click", function () {
      isFilterOn = !isFilterOn;
      btnGoodDogFilter.innerText = isFilterOn
        ? "Filter good dogs: ON"
        : "Filter good dogs: OFF";
      const dogsToDisplay = isFilterOn
        ? allDogs.filter((dog) => dog.isGoodDog)
        : allDogs;
      displayDogs(dogsToDisplay);
     
      const selectedDog = dogsToDisplay.find((dog) => dog.id === currentSelectedDogId);
      if (selectedDog) {
        dogInformation(selectedDog);
      } else if (dogsToDisplay.length > 0) {
        currentSelectedDogId = dogsToDisplay[0].id;
        dogInformation(dogsToDisplay[0]);
      } else {
        dogInfo.innerHTML = "<p>No dogs to display</p>";
      }
    });
  
    
    function displayDogs(dogs) {
      dogBar.innerHTML = "";
      dogs.forEach((pup) => {
        const span = document.createElement("span");
        span.innerText = pup.name;
        
        if (pup.id === currentSelectedDogId) {
          span.classList.add("selected");
        }
        span.addEventListener("click", () => {
          currentSelectedDogId = pup.id;
          dogInformation(pup);
          
          const spans = dogBar.querySelectorAll("span");
          spans.forEach((s) => s.classList.remove("selected"));
          span.classList.add("selected");
        });
        dogBar.appendChild(span);
      });
    }
  
    
    function dogInformation(pup) {
      currentSelectedDogId = pup.id;
      dogInfo.innerHTML = "";
  
      const img = document.createElement("img");
      img.src = pup.image;
      dogInfo.appendChild(img);
  
      const name = document.createElement("h2");
      name.textContent = pup.name;
      dogInfo.appendChild(name);
  
      const buttonElement = document.createElement("button");
      buttonElement.innerText = pup.isGoodDog ? "Good Dog" : "Bad Dog";
      dogInfo.appendChild(buttonElement);
  
     
      buttonElement.addEventListener("click", () => {
        const newIsGoodDog = !pup.isGoodDog;
       
        buttonElement.innerText = newIsGoodDog ? "Good Dog" : "Bad Dog";
        
        pup.isGoodDog = newIsGoodDog;
        updateDog(pup.id, newIsGoodDog);
      });
    }
  
  
    function updateDog(id, isGoodDog) {
      fetch(`http://localhost:3000/pups/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        
        body: JSON.stringify({
          isGoodDog: isGoodDog,
          updated_at: new Date().toISOString(),
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((updatedDog) => {
          console.log("Dog updated successfully:", updatedDog);
         
          const index = allDogs.findIndex((d) => d.id === updatedDog.id);
          if (index !== -1) {
            allDogs[index] = updatedDog;
          }
         
          allDogs.sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
         
          const dogsToDisplay = isFilterOn
            ? allDogs.filter((dog) => dog.isGoodDog)
            : allDogs;
          displayDogs(dogsToDisplay);
          
          dogInformation(updatedDog);
        })
        .catch((error) => {
          console.error("Error updating dog:", error);
        });
    }
  });
  