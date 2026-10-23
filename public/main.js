// when 
let moveItem = document.getElementsByClassName("moveItem");

Array.from(moveItem).forEach(function (element) {
  element.addEventListener('click', function () {
    const MongoDBid = this.parentNode.parentNode.childNodes[1].dataset.msgId
    console.log(MongoDBid)
    fetch('/moveItems', {
      method: 'put',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'lookUpThisIDinMongoDB': MongoDBid
      })
    }).then(function (response) {
      window.location.reload()
    })
  });
});

// // when delete button is clicked:
let trash = document.getElementsByClassName("trash");

Array.from(trash).forEach(function (element) {
  element.addEventListener('click', function () {
    const MongoDBid = this.parentNode.parentNode.childNodes[1].dataset.msgId
    console.log(MongoDBid)
    fetch('/deleteAdocument', {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'lookUpThisIDinMongoDB': MongoDBid
      })
    }).then(function (response) {
      window.location.reload()
    })
  });
});