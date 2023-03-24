var currentEntreprise = null;
window.onload = function () {
  //   new QRCode(document.querySelector("#qrcode"), "www.rds.ca");
  getActivities();
};

function updateItem(e) {
  let id = e.parentElement.parentElement.getAttribute("data-id");
  let name = e.parentElement.querySelector(".name").value;
  let link = e.parentElement.querySelector(".link").value;
  axios
    .post(`/entreprises`, [{ name: name, link: link, id: id }])
    .then((res) => {})
    .catch((err) => {
      console.log(err);
    });
}
function removeItem(e) {
  var id = e.parentElement.getAttribute("data-id");
  axios
    .post(`/entreprises/${id}/remove`)
    .then((res) => {
      getEntreprises();
    })
    .catch((err) => {
      console.log(err);
    });
}
function addItem() {
  //   var id = e.parentElement.getAttribute("data-id");
  axios
    .post(`/activities/${currentEntreprise}/add`)
    .then((res) => {
      getEntreprises();
    })
    .catch((err) => {
      console.log(err);
    });
}
function getActivities() {
  axios
    .get(`/activities`)
    .then((res) => {
      const activities = res.data.data;
      displayActivities(activities);
    })
    .catch((err) => {
      console.log(err);
    });
}
function displayActivities(arr) {
  arr.forEach((item) => {
    var li = document.createElement("li");
    li.addEventListener("click", function () {
      getEntreprises(item);
    });
    li.innerText = item.name;
    document.querySelector(".activities ul").append(li);
  });
}

function getEntreprises(item) {
  if (item) {
    document.querySelector(".entreprises h2").innerHTML = item.name;
    currentEntreprise = item.id;
  }

  axios
    .get(`/${currentEntreprise}/entreprises`)
    .then((res) => {
      const entreprises = res.data.data;
      displayEntreprises(entreprises);
    })
    .catch((err) => {
      console.log(err);
    });
}
function displayEntreprises(arr) {
  document.querySelector(".entreprises .container").innerHTML = "";
  arr.forEach((item) => {
    let e = document.querySelector(".hidden .entreprise");
    let newItem = e.cloneNode(true);
    newItem.querySelector(".name").value = item.name;
    newItem.querySelector(".link").value = item.link;
    newItem.setAttribute("data-id", item.id);
    new QRCode(newItem.querySelector(".qrcode"), {
      text: item.link,
      width: 100,
      height: 100,
      colorDark: "#000000",
      colorLight: "#ffffff",
    });
    document.querySelector(".entreprises .container").append(newItem);
  });
}
