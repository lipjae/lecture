// https://dev.to/brayanarrieta/new-javascript-features-ecmascript-2022-with-examples-4nhg

function syncTask (arg, callback) {
  setTimeout(() => {
    console.log(arg)
    callback()
  }, 1000)
}
syncTask('task1', function() {
  syncTask('task2', function() {
    syncTask('task3', function () {
    })
  })
})



function asyncTask (arg) {
  const promise = new Promise(function(resolve, reject) {
    setTimeout(function () {
      console.log(arg)
      resolve()
    }, 1000)
  })
  return promise
}


asyncTask('task1')
  .then(function(){
    return asyncTask('task2')
  }).then(function(){
    return asyncTask('task3')
  })


await asyncTask('task1')
await asyncTask('task2')
await asyncTask('task3')





















