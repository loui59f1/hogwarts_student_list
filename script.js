"use strict";

document.addEventListener("DOMContentLoaded", init);

let allStudents = []; //Creating empty array
let allExpelled = [];
let allInSquad = [];
let bloodStatusList = [];

const Student = {
  //Creating the prototype template
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
  console.log("Initialize program");

  // Tilføjer eventlisteners til filtrering og sorteringsknapper
  addEventListenersToButtons();

  // Loader json dokument
  loadJSON("https://petlatkea.dk/2021/hogwarts/students.json", prepareObjects);

  // Loader blood status families
  loadJSON("https://petlatkea.dk/2021/hogwarts/families.json", defineBloodStatus);
}

function addEventListenersToButtons() {
  document.querySelectorAll("[data-action='filter']").forEach((button) => button.addEventListener("click", selectFilter));

  document.querySelectorAll("[data-action='sort']").forEach((button) => button.addEventListener("click", selectSort));

  // Eventlistener på søgefelt
  document.querySelector("#search_by_name").addEventListener("input", searchStudent);

  // eventlistener på udviste filter
  document.querySelector("[data-filter='expelled']").addEventListener("click", showExpelledStudent);

  // eventlistener på squad filter
  document.querySelector("[data-filter='squad']").addEventListener("click", showSquadMembers);

  document.querySelector("header h1").addEventListener("click", hackTheSystem);
}

async function loadJSON(url, event) {
  //Fetching json data
  const respons = await fetch(url);
  const jsonData = await respons.json();
  event(jsonData);

  console.log("JSON data loaded");
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

function prepareObjects(jsonData) {
  jsonData.forEach((jsonObject) => {
    // TODO: Create new object with cleaned data - and store that in the allAnimals array

    //Creating the singleStudent object
    const singleStudent = Object.create(Student);

    //Find names by defining the spaces
    const firstSpace = jsonObject.fullname.trim().indexOf(" ");
    const lastSpace = jsonObject.fullname.trim().lastIndexOf(" ");

    //Split string at spaces
    //Seperate fullName in "fornavn, mellemnavn og efternavn"
    // adskil det fulde navn til for, mellem, efternavn
    singleStudent.firstName = jsonObject.fullname.trim().substring(0, firstSpace);
    singleStudent.middleName = jsonObject.fullname.substring(firstSpace, lastSpace);

    //If middleName includes "", it becomes a nickName
    if (singleStudent.middleName.includes('"')) {
      singleStudent.nickName = singleStudent.middleName;
      singleStudent.middleName = "";
    }

    singleStudent.lastName = jsonObject.fullname.trim().substring(lastSpace).trim();

    //Make first letter upperCase and the rest of them lowerCase
    //firstname
    singleStudent.firstNameCapitalized = singleStudent.firstName.substring(0, 1).toUpperCase() + singleStudent.firstName.substring(1, firstSpace).toLowerCase();

    //Middlename
    singleStudent.middleNameCapitalized = singleStudent.middleName.substring(1, 2).toUpperCase() + singleStudent.middleName.substring(2, lastSpace).toLowerCase();

    //Lastname
    singleStudent.lastNameCapitalized = singleStudent.lastName.substring(0, 1).toUpperCase() + singleStudent.lastName.substring(1).toLowerCase(singleStudent.lastName.length);

    //Names with a hyphen, must have the first letter after the hyphen capitalized as well -> one of the student's lastname includes a hyphen
    const ifHyphens = singleStudent.lastName.indexOf("-");

    if (ifHyphens == -1) {
      singleStudent.lastNameCapitalized = singleStudent.lastNameCapitalized.substring(0, 1).toUpperCase() + singleStudent.lastNameCapitalized.substring(1).toLowerCase();
    } else {
      singleStudent.lastNameCapitalized =
        singleStudent.lastName.substring(0, 1).toUpperCase() +
        singleStudent.lastName.substring(1, ifHyphens + 1).toLowerCase() +
        singleStudent.lastName.substring(ifHyphens + 1, ifHyphens + 2).toUpperCase() +
        singleStudent.lastName.substring(ifHyphens + 2).toLowerCase();
    }

    //Gender
    singleStudent.gender = jsonObject.gender.substring(0).trim();
    singleStudent.genderCapitalized = singleStudent.gender.substring(0, 1).toUpperCase() + singleStudent.gender.substring(1).toLowerCase();

    //House
    singleStudent.house = jsonObject.house.substring(0).trim();
    singleStudent.houseCapitalized = singleStudent.house.substring(0, 1).toUpperCase() + singleStudent.house.substring(1).toLowerCase();

    //Insert in prototype -> the array
    singleStudent.firstName = singleStudent.firstNameCapitalized;
    singleStudent.middleName = singleStudent.middleNameCapitalized;
    singleStudent.lastName = singleStudent.lastNameCapitalized;

    //SingleStudent.nickName = singleStudent.nickNameCapitalized;
    singleStudent.gender = singleStudent.genderCapitalized;
    singleStudent.house = singleStudent.houseCapitalized;

    //insert correct photo filename
    singleStudent.image = (
      singleStudent.lastName +
      "_" +
      singleStudent.firstName.substring(0, 1) +
      ".png"
    ).toLowerCase();

    if (singleStudent.firstName === "Justin") {
      singleStudent.image = (
        singleStudent.lastName.substring(singleStudent.lastName.indexOf("-") + 1) +
        "_" +
        singleStudent.firstName.substring(0, 1) +
        ".png"
      ).toLowerCase();
    }

    if (singleStudent.firstName === "Leanne") {
      singleStudent.image = "";
    }

    // Patil søstrene skal begge have anderledes billede
    if (singleStudent.lastName === "Patil") {
      singleStudent.image = (
        singleStudent.lastName +
        "_" +
        singleStudent.firstName +
        ".png"
      ).toLowerCase();
    }


    //Adding all the objects into the array
    allStudents.push(singleStudent);
  });
  //Calling the function displayList
  buildList();
  //displayList(allStudents);
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
  //let filteredList = allStudents;
  if (settings.filterBy === "gryffindor") {
    //create a filter of only gryff
    filteredList = allStudents.filter(isGryf);
  } else if (settings.filterBy === "hufflepuff") {
    filteredList = allStudents.filter(isHuff);
  } else if (settings.filterBy === "ravenclaw") {
    filteredList = allStudents.filter(isRave);
  } else if (settings.filterBy === "slytherin") {
    filteredList = allStudents.filter(isSlyt);
  } else if (settings.filterBy === "enrolled") {
    filteredList = allStudents.filter(isEnrolled);
  }
  return filteredList;
}

function isEnrolled(status) {
  return status.house === "Enrolled";
}

function isExpelled(status) {
  return status.house === "Expelled";
}

function isGryf(house) {
  return house.house === "Gryffindor";
}

function isHuff(house) {
  return house.house === "Hufflepuff";
}

function isRave(house) {
  return house.house === "Ravenclaw";
}

function isSlyt(house) {
  return house.house === "Slytherin";
}

function selectSort(event) {
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;

  //TO DO: FÅ SORTING PILE TIL AT VIRKE

  //  //find "old" sortby element, and remove .sortBy
  //  const oldElement = document.querySelector(`[data-sort='${settings.sortBy}']`);
  //  oldElement.classList.remove("sortby");

  //  //indicate active sort
  //  event.target.classList.add("sortby");

  // toggle the direction!
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

  displayList(sortedList);
  let sortedLength = sortedList.length;
  document.querySelector(".total_viewed").textContent = "Currently displayed: " + sortedLength;
}

function displayList(studentList) {
  //Clear the list
  document.querySelector("#list").innerHTML = "";

  //Build a new list
  studentList.forEach(displayStudent);
  displayNumbers();
}

function displayStudent(student) {
  //Create clone
  const clone = document.querySelector("template#hogwarts_student").content.cloneNode(true);
  let house_crest = clone.querySelector(".house_crest");

  house_crest.classList.add(student.house.toLowerCase() + "_crest");

  //Set clone data
  clone.querySelector("[data-field=firstname]").textContent = student.firstName + " " + student.lastName;
  clone.querySelector("[data-field=gender]").textContent = `Gender: ${student.gender}`;
  clone.querySelector("[data-field=house]").textContent = `House: ${student.house}`;


  if (student.enrollement === true) {
    clone.querySelector("[data-field=enrollment]").textContent = "Status: Expelled";
  } else {
    clone.querySelector("[data-field=enrollment]").textContent = "Status: Enrolled";
  }

  //buildList(); //updating the list view

  //tilføj klik til popop modal
  clone.querySelector("article").addEventListener("click", () => displayModal(student));

  //Append clone to list
  document.querySelector("#list").appendChild(clone);
}

function displayModal(student) {
  const modal = document.querySelector("#modal");
  const crest = document.querySelector(".crest");
  const icon_expelled = document.querySelector("#icon_expelled");

  modal.style.display = "block";
  modal.classList = "";

  modal.classList.add(student.house.toLowerCase());
  crest.classList.add(student.house.toLowerCase() + "_crest");
  modal.querySelector(".expelBtn").style.display = "block";
  modal.querySelector("[data-field=prefect]").style.display = "block";
  modal.querySelector(".squad_btn").style.display = "block";

  console.log("open popup");

  //Når vi klikker udviser vi den studerende
  document.querySelector(".expelBtn").onclick = () => {
    expelStudent(student);
  };

  modal.querySelector("#modal h2").textContent = `${student.firstName} ${student.lastName}`;
  modal.querySelector("[data-field=gender]").textContent = `Gender: ${student.gender}`;
  modal.querySelector("[data-field=house]").textContent = `House: ${student.house}`;
  modal.querySelector("[data-field=bloodstatus]").textContent = `Bloodstatus: ${student.bloodstatus}`;
  modal.querySelector("[data-field=image]").src = `images/` + student.image;

  // EXPELL KNAP OG TEXT
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

  if (student.prefect === true) {
    modal.querySelector("[data-field=prefected]").textContent = "Is a prefect";
    modal.querySelector("[data-field=prefect]").textContent = "Remove prefect";
  } else {
    modal.querySelector("[data-field=prefected]").textContent = "Not a prefect";
    modal.querySelector("[data-field=prefect]").textContent = "Promote to prefect";
  }

  if (student.inquisitorial === true) {
    modal.querySelector("[data-field=squad]").textContent = "Is a prefect";
    modal.querySelector(".squad_btn").textContent = "Remove as member";
  }
  if (student.inquisitorial === false) {
    modal.querySelector("[data-field=squad]").textContent = "Not a prefect";
    modal.querySelector(".squad_btn").textContent = "Make a member of squad";
  }

  // Only slytherin students --> make squad member
  if (student.house.toLowerCase() === "slytherin") {
    console.log("in slytherin");
    modal.querySelector(".squad_btn").classList.remove("hide2");
    modal.querySelector(".squad_btn").dataset.squad = student.inquisitorial;
    modal.querySelector(".squad_btn").addEventListener("click", () => {
      makeSquadMember(student);
    });
  } else {
    modal.querySelector(".squad_btn").classList.add("hide2");
  }

  // Hvis der bliver klikket på knappen ændres student enrollment
  //Expel student
  function expelStudent(student) {
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

    displayModal(student);
    buildList();

  }

  //prefects
  modal.querySelector("[data-field=prefect]").dataset.prefect = student.prefect;

  modal.querySelector("[data-field=prefect]").addEventListener("click", clickPrefect);

  function clickPrefect() {
    if (student.prefect === true) {
      student.prefect = false;
      console.log("Student prefect false", student);
      console.log(student.prefect);
      modal.querySelector("[data-field=prefected]").textContent = "Not a prefect";
      modal.querySelector("[data-field=prefect]").textContent = "Promote to prefect";
    } else {
      console.log("try to make");
      tryToMakeAPrefect(student);
      console.log(student.prefect);
      modal.querySelector("[data-field=prefected]").textContent = "Is a prefect";
      modal.querySelector("[data-field=prefect]").textContent = "Remove prefect";
    }
    buildList();
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
    displayList(allExpelled);
  }

  let expelledLength = allExpelled.length;
  document.querySelector(".total_viewed").textContent = "Currently displayed: " + expelledLength;
}

function showSquadMembers() {
  console.log("Show all squad members")

  if (allInSquad.length === 0) {
    document.querySelector("#list").textContent = "There are no members of the Inquisitorial Squad";
  } else {
    displayList(allInSquad);
  }

  let squadLength = allInSquad.length;
  document.querySelector(".total_viewed").textContent = "Currently displayed: " + squadLength;
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
    displayList(allStudents);
  }
  //update surrently showing students to search result
  displayList(searchResult);
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

function makeSquadMember(student) {
  if (student.inquisitorial === true) {
    student.inquisitorial = false;
    console.log("Student false", student);
    console.log(student.inquisitorial);
    modal.querySelector("[data-field=squad]").textContent = "Not a member";
    modal.querySelector(".squad_btn").textContent = "Make a member of squad";

    allInSquad.splice(allInSquad.indexOf(student), 1);
    buildList(allInSquad);

  } else {
    student.inquisitorial = true;
    console.log("Student true", student);
    console.log(student.inquisitorial);
    modal.querySelector("[data-field=squad]").textContent = "Member of squad";
    modal.querySelector(".squad_btn").textContent = "Remove as member";

    // Tilføjer elev til squad list
    allInSquad.push(student);
    buildList();
  }



}

function hackTheSystem() {
  console.log("HACK THE SYSTEM")
  // tilføjer mig til allstudents liste
  let myself = Object.create(Student);
  myself.firstName = "Louise";
  myself.lastName = "Nielsen";
  myself.house = "Gryffindor";
  myself.bloodstatus = "Pure blooded";
  myself.enrollment = true;
  myself.prefect = false;
  myself.gender = "Girl";

  allStudents.push(myself);
  buildList(allStudents);
}