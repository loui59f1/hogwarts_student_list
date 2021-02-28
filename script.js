"use strict";

document.addEventListener("DOMContentLoaded", init);

// Creating arrays
let allStudents = [];
let allExpelled = [];
let allInSquad = [];

let systemHacked = false;

const studentPrototype = {
  firstname: "",
  lastname: "",
  middlename: "null",
  nickname: "null",
  gender: "",
  house: "",
  enrollment: true,
  prefect: false,
  inquisitorial: false,
  bloodstatus: undefined,
  imageSrc: "null",
};

const settings = {
  filter: "all",
  sortBy: "name",
  sortDir: "asc",
};

function init() {
  console.log("Initialize Hogwarts program");

  addEventListenersToButtons();

  // Loader JSON dokument med elever
  loadJSON("https://petlatkea.dk/2021/hogwarts/students.json", cleanData);

  // Loader JSON dokument med elevers blodstatus
  loadJSON("https://petlatkea.dk/2021/hogwarts/families.json", defineBloodStatus);
}

function addEventListenersToButtons() {
  // Tilføjer eventlisteners på filter og sort knapper
  document.querySelectorAll("[data-action='filter']").forEach((button) => button.addEventListener("click", selectFilter));
  document.querySelectorAll("[data-action='sort']").forEach((button) => button.addEventListener("click", selectSort));
  document.querySelector("[data-filter='expelled']").addEventListener("click", showExpelledStudent);
  document.querySelector("[data-filter='squad']").addEventListener("click", showSquadMembers);

  // Tilføjer eventlisteners på søgefelt
  document.querySelector("#search_by_name").addEventListener("input", searchStudent);

  // Tilføjer eventlistener på H1 til hacking
  document.querySelector("header h1").addEventListener("click", hackTheSystem);
}

async function loadJSON(url, event) {
  //Fetching json data
  const respons = await fetch(url);
  const jsonData = await respons.json();
  event(jsonData);

  console.log("JSON data loaded");
}

function cleanData(jsonData) {
  jsonData.forEach((jsonObject) => {
    const student = Object.create(studentPrototype);

    //Find names by defining the spaces
    const firstSpace = jsonObject.fullname.trim().indexOf(" ");
    const lastSpace = jsonObject.fullname.trim().lastIndexOf(" ");

    //Split string at spaces
    //Seperate fullName in "fornavn, mellemnavn og efternavn"
    // adskil det fulde navn til for, mellem, efternavn
    student.firstName = jsonObject.fullname.trim().substring(0, firstSpace);
    student.middleName = jsonObject.fullname.substring(firstSpace, lastSpace);

    //If middleName includes "", it becomes a nickName
    if (student.middleName.includes('"')) {
      student.nickName = student.middleName;
      student.middleName = "";
    }

    student.lastName = jsonObject.fullname.trim().substring(lastSpace).trim();

    //Make first letter upperCase and the rest of them lowerCase
    //firstname
    student.firstNameCapitalized = student.firstName.substring(0, 1).toUpperCase() + student.firstName.substring(1, firstSpace).toLowerCase();

    //Middlename
    student.middleNameCapitalized = student.middleName.substring(1, 2).toUpperCase() + student.middleName.substring(2, lastSpace).toLowerCase();

    //Lastname
    student.lastNameCapitalized = student.lastName.substring(0, 1).toUpperCase() + student.lastName.substring(1).toLowerCase(student.lastName.length);

    //Names with a hyphen, must have the first letter after the hyphen capitalized as well -> one of the student's lastname includes a hyphen
    const ifHyphens = student.lastName.indexOf("-");

    if (ifHyphens == -1) {
      student.lastNameCapitalized = student.lastNameCapitalized.substring(0, 1).toUpperCase() + student.lastNameCapitalized.substring(1).toLowerCase();
    } else {
      student.lastNameCapitalized =
        student.lastName.substring(0, 1).toUpperCase() +
        student.lastName.substring(1, ifHyphens + 1).toLowerCase() +
        student.lastName.substring(ifHyphens + 1, ifHyphens + 2).toUpperCase() +
        student.lastName.substring(ifHyphens + 2).toLowerCase();
    }

    //Gender
    student.gender = jsonObject.gender.substring(0).trim();
    student.genderCapitalized = student.gender.substring(0, 1).toUpperCase() + student.gender.substring(1).toLowerCase();

    //House
    student.house = jsonObject.house.substring(0).trim();
    student.houseCapitalized = student.house.substring(0, 1).toUpperCase() + student.house.substring(1).toLowerCase();

    //Insert in prototype -> the array
    student.firstName = student.firstNameCapitalized;
    student.middleName = student.middleNameCapitalized;
    student.lastName = student.lastNameCapitalized;

    //SingleStudent.nickName = singleStudent.nickNameCapitalized;
    student.gender = student.genderCapitalized;
    student.house = student.houseCapitalized;

    //insert correct photo filename
    student.image = (
      student.lastName +
      "_" +
      student.firstName.substring(0, 1) +
      ".png"
    ).toLowerCase();

    if (student.firstName === "Justin") {
      student.image = (
        student.lastName.substring(student.lastName.indexOf("-") + 1) +
        "_" +
        student.firstName.substring(0, 1) +
        ".png"
      ).toLowerCase();
    }

    if (student.lastName === "Leanne") {
      student.image = "#";
    }

    // Patil søstrene skal begge have anderledes billede
    if (student.lastName === "Patil") {
      student.image = (
        student.lastName +
        "_" +
        student.firstName +
        ".png"
      ).toLowerCase();
    }


    //Adding all the objects into the array
    allStudents.push(student);
  });

  buildList();
}

function defineBloodStatus(jsonData) {
  allStudents.forEach((student) => {
    if (jsonData.half.includes(student.lastName)) {
      student.bloodstatus = "Half blooded";
      console.log(student.bloodstatus);
    } else if (jsonData.pure.includes(student.lastName)) {
      student.bloodstatus = "Pure blooded";
      console.log(student.bloodstatus);
    } else {
      student.bloodstatus = "Muggleborn"
      console.log(student.bloodstatus);
    }
  })
}

function selectFilter(event) {
  const filter = event.target.dataset.filter;
  console.log(`User selected ${filter}`);
  setFilter(filter);
}

function setFilter(filter) {
  settings.filterBy = filter;
  buildList();
}

function filterList(filteredList) {
  if (settings.filterBy === "gryffindor") {
    filteredList = allStudents.filter(isGryffindor);
  } else if (settings.filterBy === "hufflepuff") {
    filteredList = allStudents.filter(isHufflepuff);
  } else if (settings.filterBy === "ravenclaw") {
    filteredList = allStudents.filter(isRavenclaw);
  } else if (settings.filterBy === "slytherin") {
    filteredList = allStudents.filter(isSlytherin);
  }
  return filteredList;
}

function isGryffindor(house) {
  return house.house === "Gryffindor";
}

function isHufflepuff(house) {
  return house.house === "Hufflepuff";
}

function isRavenclaw(house) {
  return house.house === "Ravenclaw";
}

function isSlytherin(house) {
  return house.house === "Slytherin";
}

function selectSort(event) {
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;

  if (sortDir === "asc") {
    event.target.dataset.sortDirection = "desc";
  } else {
    event.target.dataset.sortDirection = "asc";
  }
  console.log(`User selected ${sortBy} - ${sortDir}`);
  setSort(sortBy, sortDir);
}

function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;
  buildList();
}

function sortList(sortedList) {
  //let sortedList = allStudents;
  let direction = 1; // 1 is normal direction.
  if (settings.sortDir === "desc") {
    direction = -1;
  } else {
    direction = 1;
  }

  sortedList = sortedList.sort(sortByProperty);

  function sortByProperty(studentA, studentB) {
    if (studentA[settings.sortBy] < studentB[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }
  return sortedList;
}

function buildList() {
  const currentList = filterList(allStudents);
  const sortedList = sortList(currentList);

  showList(sortedList);
  let sortedLength = sortedList.length;
  document.querySelector(".total_viewed").textContent = "Currently displayed: " + sortedLength;
}

function showList(studentList) {
  //Clear the list
  document.querySelector("#list").innerHTML = "";

  //Build a new list
  studentList.forEach(showStudent);
  displayNumbers();
}

function showStudent(student) {
  const clone = document.querySelector("template#hogwarts_student").content.cloneNode(true);
  const house_crest = clone.querySelector(".house_crest");

  // Tilføjer hus logoet for eleven
  house_crest.classList.add(student.house.toLowerCase() + "_crest");

  // Indsætter data for eleven i boksene
  clone.querySelector("[data-field=firstname]").textContent = student.firstName + " " + student.lastName;
  clone.querySelector("[data-field=gender]").textContent = `Gender: ${student.gender}`;
  clone.querySelector("[data-field=house]").textContent = `House: ${student.house}`;

  // Viser status for udvisning på eleven
  if (student.enrollment === false) {
    clone.querySelector("[data-field=enrollment]").textContent = "Status: Expelled";
  } else {
    clone.querySelector("[data-field=enrollment]").textContent = "Status: Enrolled";
  }

  // Viser stjerne for squad medlemmer
  if (student.inquisitorial === true) {
    clone.querySelector(".squad_star").classList.remove("hide2");
  } else {
    clone.querySelector(".squad_star").classList.add("hide2");
  }

  // Tilføjer eventlistener på studerende, der åbner modal
  clone.querySelector("article").addEventListener("click", () => showStudentModal(student));

  document.querySelector("#list").appendChild(clone);
}

function showStudentModal(student) {
  const modal = document.querySelector("#modal");
  const crest = document.querySelector(".crest");
  const icon_expelled = document.querySelector("#icon_expelled");

  // Gør modal synlig når funktionen kaldes
  modal.style.display = "block";
  modal.classList = "";

  // Styling af modal ift. elevens hus
  modal.classList.add(student.house.toLowerCase());
  modal.querySelector(".expelBtn").style.display = "block";
  modal.querySelector("[data-field=prefect]").style.display = "block";
  modal.querySelector(".squad_btn").style.display = "block";
  crest.classList.add(student.house.toLowerCase() + "_crest");

  // Tilføjer eventlistener for udvisning af eleven
  document.querySelector(".expelBtn").onclick = () => {
    expelStudent(student);
  };

  // Tilføjer eventlistener for prefect af eleven
  document.querySelector("[data-field=prefect]").onclick = () => {
    clickPrefect(student);
  };

  // Indsætter data på eleven i modal
  modal.querySelector("#modal h2").textContent = `${student.firstName} ${student.lastName}`;
  modal.querySelector("[data-field=gender]").textContent = `Gender: ${student.gender}`;
  modal.querySelector("[data-field=house]").textContent = `House: ${student.house}`;
  modal.querySelector("[data-field=bloodstatus]").textContent = `Bloodstatus: ${student.bloodstatus}`;
  modal.querySelector("[data-field=image]").src = `images/` + student.image;

  // Er eleven udvist/er eleven ikke udvist - tekst og knap status
  if (student.enrollment === true) {
    modal.querySelector("[data-field=enrollment]").textContent = "Status: Enrolled";
    modal.querySelector(".expelBtn").textContent = "Expel student";
    icon_expelled.classList.add("hide2");

  } else {
    modal.querySelector("[data-field=enrollment]").textContent = "Status: Expelled";
    modal.querySelector(".expelBtn").style.display = "none";
    modal.querySelector("[data-field=prefect]").style.display = "none";
    modal.querySelector(".squad_btn").style.display = "none";
    icon_expelled.classList.remove("hide2");
  }

  // Er eleven prefect/er eleven ikke prefect - tekst og knap status
  if (student.prefect === true) {
    modal.querySelector("[data-field=prefected]").textContent = "Prefect status: Is a prefect";
    modal.querySelector("[data-field=prefect]").textContent = "Remove prefect";
  } else {
    modal.querySelector("[data-field=prefected]").textContent = "Prefect status: Not a prefect";
    modal.querySelector("[data-field=prefect]").textContent = "Promote to prefect";
  }

  // Udvisning
  function expelStudent(student) {
    if (student.firstName.toLowerCase() === "louise") {
      alert("CANNOT BE EXPELLED");
    } else {
      console.log(student);
      if (student.enrollment === true) {
        console.log(student.enrollment);
        student.enrollment = false;
      } else {
        console.log(student.enrollment);
        student.enrollment = true;
      }

      // Fjerner fra allstudents liste
      allStudents.splice(allStudents.indexOf(student), 1);

      // tilføjer til allexpelled liste
      allExpelled.push(student);

      showStudentModal(student);
      buildList();

    }

  }

  //prefects
  // modal.querySelector("[data-field=prefect]").dataset.prefect = student.prefect;

  // modal.querySelector("[data-field=prefect]").addEventListener("click", clickPrefect);

  function clickPrefect() {
    modal.querySelector("[data-field=prefect]").removeEventListener("click", clickPrefect);
    if (student.prefect === true) {
      student.prefect = false;
      console.log("Student prefect false", student);
      console.log(student.prefect);
    } else {
      console.log("try to make");
      tryToMakeAPrefect(student);
      console.log(student.prefect);
    }
    buildList(allStudents);
    showStudentModal(student);
  }

  // Only slytherin students + pure blooded --> make squad member
  if (student.house.toLowerCase() === "slytherin") {
    console.log("in slytherin or pure blooded");
    modal.querySelector(".squad_btn").classList.remove("hide2");
    modal.querySelector(".squad_btn").dataset.squad = student.inquisitorial;
    modal.querySelector(".squad_btn").addEventListener("click", () => {
      makeSquadMember(student);
    });
  } else if (student.bloodstatus === "Pure blooded") {
    modal.querySelector(".squad_btn").classList.remove("hide2");
    modal.querySelector(".squad_btn").dataset.squad = student.inquisitorial;
    modal.querySelector(".squad_btn").addEventListener("click", () => {
      makeSquadMember(student);
    });
  } else {
    modal.querySelector(".squad_btn").classList.add("hide2");
  }

  if (student.inquisitorial === true) {
    modal.querySelector("[data-field=squad]").textContent = "Member status: Is a member";
    modal.querySelector(".squad_btn").textContent = "Remove as member";
  } else {
    modal.querySelector("[data-field=squad]").textContent = "Member status: Not a member";
    modal.querySelector(".squad_btn").textContent = "Make a member of squad";
  }

  //luk modal
  modal.querySelector("#close").addEventListener("click", closeModal);

  function closeModal() {
    modal.style.display = "none";
    crest.classList.remove(student.house.toLowerCase() + "_crest");
    displayNumbers();
  }

  // Ved klik udenfor modal lukkes den
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
      crest.classList.remove(student.house.toLowerCase() + "_crest");
      displayNumbers();
    }
  };
}

function showExpelledStudent() {
  console.log("Show all expelled students");

  if (allExpelled.length === 0) {
    document.querySelector("#list").textContent = "There are no students expelled from Hogwarts";
  } else {
    showList(allExpelled);
  }

}

function makeSquadMember(student) {
  // UNDERSØG OM SYSTEMET ER HACKET = LAV TIMEOUT
  //document.querySelector(".squad_btn").removeEventListener("click", makeSquadMember);

  if (student.inquisitorial === true) {
    student.inquisitorial = false;
    console.log(student.inquisitorial);
    console.log(allInSquad);

    modal.querySelector("[data-field=squad]").textContent = "Member status: Not a member";
    modal.querySelector(".squad_btn").textContent = "Make a member of squad";

    // Fjerner fra squad list
    allInSquad.splice(allInSquad.indexOf(student), 1);

  } else if (student.inquisitorial === false) {
    student.inquisitorial = true;
    console.log(student.inquisitorial);
    console.log(allInSquad);

    modal.querySelector("[data-field=squad]").textContent = "Member status: Is a member";
    modal.querySelector(".squad_btn").textContent = "Remove as member";

    // Tilføjer elev til squad list
    allInSquad.push(student);
  }
  buildList(allStudents);
}


function showSquadMembers() {
  console.log("Show all squad members")

  if (allInSquad.length === 0) {
    document.querySelector("#list").textContent = "There are no members of the Inquisitorial Squad";
  } else {
    showList(allInSquad);
  }

}

function tryToMakeAPrefect(selectedStudent) {
  console.log("we are in the tryToMake function");

  const allPrefects = allStudents.filter((student) => student.prefect); //should give a list of alle the prefects
  const prefects = allPrefects.filter((prefect) => prefect.house === selectedStudent.house);
  console.log(prefects);

  const numbersOfPrefects = prefects.length;
  const other = prefects.filter((prefect) => prefect.house === selectedStudent.house && prefect.gender === selectedStudent.gender).shift();
  console.log(other);

  // if there is another of the same type
  if (other !== undefined) {
    console.log("there can be only one prefect of each type");
    removeOther(other);
  } else if (numbersOfPrefects >= 2) {
    console.log("there can only be two prefects");
    removeAorB(prefects[0], prefects[1]);
  } else {
    makePrefect(selectedStudent);
  }

  function removeOther(other) {
    // ask the user to ignore or remove "other"
    document.querySelector("#remove_other").classList.remove("hide2");
    document.querySelector("#remove_other #close").addEventListener("click", closeDialog);
    document.querySelector("#remove_other #removeother").addEventListener("click", clickRemoveOther);

    //document.querySelector("#remove_other [data-field=otherwinner]").textContent = other.firstName;

    //if ignore - do nothing
    function closeDialog() {
      document.querySelector("#remove_other").classList.add("hide2");
      document.querySelector("#remove_other #close").removeEventListener("click", closeDialog);
      document.querySelector("#remove_other #removeother").removeEventListener("click", clickRemoveOther);
    }

    //if remover other:
    function clickRemoveOther() {
      removePrefect(other);
      makePrefect(selectedStudent);
      buildList();
      //displayModal(student);
      closeDialog();
    }
  }

  function removeAorB(winnerA, winnerB) {
    // ask the user to ignore or remove a or b

    document.querySelector("#remove_aorb").classList.remove("hide2");
    document.querySelector("#remove_aorb .closebutton").addEventListener("click", closeDialog);
    document.querySelector("#remove_aorb #removea").addEventListener("click", clickRemoveA);
    document.querySelector("#remove_aorb #removeb").addEventListener("click", clickRemoveB);

    //show names on buttons
    document.querySelector("#remove_aorb [data-field=prefectA]").textContent = prefectA.firstName;
    document.querySelector("#remove_aorb [data-field=prefectB]").textContent = prefectB.firstName;

    //if ignore - do nothing
    function closeDialog() {
      document.querySelector("#remove_aorb").classList.add("hide2");
      document.querySelector("#remove_aorb .closebutton").removeEventListener("click", closeDialog);
      document.querySelector("#remove_aorb #removea").removeEventListener("click", clickRemoveA);
      document.querySelector("#remove_aorb #removeb").removeEventListener("click", clickRemoveB);
    }

    function clickRemoveA() {
      //if removeA:
      removePrefect(prefectA);
      makePrefect(selectedStudent);
      buildList();
      //displayModal(student);
      closeDialog();
    }

    function clickRemoveB() {
      //else - if removeB
      removePrefect(winnerB);
      makePrefect(selectedStudent);
      buildList();
      //displayModal(student);
      closeDialog();
    }
  }

  function removePrefect(prefectStudent) {
    console.log("remove prefect");
    prefectStudent.prefect = false;
    console.log("Student prefect false", prefectStudent);
  }

  function makePrefect(student) {
    console.log("make prefect");
    student.prefect = true;
    console.log("Student prefect true", student);
  }
}

function searchStudent() {
  // finder værdien af det indtastede i søgefelt
  let searchstring = document.querySelector("#search_by_name").value.toLowerCase();

  // Søg igennem studerende og opdater displayList
  let searchResult = allStudents.filter(filterSearch);

  // Closure in searchStudent
  function filterSearch(student) {
    // Søger på fornavn og efternavn
    if (student.firstName.toString().toLowerCase().includes(searchstring) || student.lastName.toString().toLowerCase().includes(searchstring)) {
      return true;
    } else {
      return false;
    }
  }

  // Hvis søgefeltet er tomt viser det igen de studerende
  if (searchstring == " ") {
    showList(allStudents);
  }
  //update surrently showing students to search result
  showList(searchResult);
}

function displayNumbers() {
  let house;
  console.log("Update counters in top");

  document.querySelector(".total_viewed").textContent = "Displayed students: ";
  document.querySelector(".total_viewed").textContent += allStudents.length;

  document.querySelector(".total_expelled").textContent = "Expelled students: ";
  document.querySelector(".total_expelled").textContent += allExpelled.length;

  document.querySelector(".total_squad").textContent = "Members of squad: ";
  document.querySelector(".total_squad").textContent += allInSquad.length;

  document.querySelector(".total_students").textContent = "Total students: ";
  document.querySelector(".total_students").textContent += allStudents.length;

  document.querySelector(".total_slytherin").textContent = "Slytherin students: ";
  document.querySelector(".total_slytherin").textContent += filterStudentsbyHouse("slytherin");

  document.querySelector(".total_hufflepuff").textContent =
    "Hufflepuff students: ";
  document.querySelector(
    ".total_hufflepuff"
  ).textContent += filterStudentsbyHouse("hufflepuff");

  document.querySelector(".total_gryffindor").textContent =
    "Gryffindor students: ";
  document.querySelector(
    ".total_gryffindor"
  ).textContent += filterStudentsbyHouse("gryffindor");

  document.querySelector(".total_ravenclaw").textContent =
    "Ravenclaw students: ";
  document.querySelector(
    ".total_ravenclaw"
  ).textContent += filterStudentsbyHouse("ravenclaw");

  // Undersøg om hvor mange i hvert hus
  function filterStudentsbyHouse(thehouse) {
    house = thehouse;
    let studentsInHouse = allStudents.filter(isInHouseFilter);
    return studentsInHouse.length;
  }

  function isInHouseFilter(student) {
    if (student.house.toLowerCase() === house) {
      return true;
    } else {
      return false;
    }
  }
}


function hackTheSystem() {
  if (systemHacked === false) {
    systemHacked = true;
    console.log(systemHacked);
    alert("OH NO! YOU HAVE BEEN HACKED");
    console.log("HACK THE SYSTEM");

    // tilføjer mig til allstudents liste
    let myself = Object.create(studentPrototype);
    myself.firstName = "Louise";
    myself.lastName = "Nielsen";
    myself.house = "Gryffindor";
    myself.bloodstatus = "Half blooded";
    myself.enrollment = true;
    myself.prefect = false;
    myself.gender = "Girl";
    myself.image = "#";

    allStudents.push(myself);
    messUpTheBloodStatus();
    buildList();

  } else {
    alert("Already hacked");
  }

}

function messUpTheBloodStatus() {
  allStudents.forEach((student) => {
    if (student.bloodstatus === "Pure blooded") {
      student.bloodstatus = "Half blooded";
    } else if (student.bloodstatus === "Half blooded") {
      student.bloodstatus = "Muggleborn"
    } else {
      student.bloodstatus = "Pure blooded"
    }
  })
}

// NEED TO CHECK IF SYSTEM WAS HACKED