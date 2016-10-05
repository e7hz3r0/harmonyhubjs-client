var HarmonyHubClient = require('../index')

HarmonyHubClient('192.168.1.146', 5222, 'ethan.urie@gmail.com', 'sees:punt')
  .then(function (harmonyClient) {
    return harmonyClient.isOff()
      .then(function (off) {
        if (off) {
          console.log('Currently off. Turning TV on.')

          return harmonyClient.getActivities()
            .then(function (activities) {
              // Get an activity with the name "Fernsehen" and trigger it:
              var watchTvActivity = activities
                .filter(function (activity) { return activity.label.toLowerCase() === 'watch appletv' })
                .pop()

              if (watchTvActivity) {
                return harmonyClient.startActivity(watchTvActivity.id)
              } else {
                throw new Error('Could not find an activity that sounds like Fernsehen :(')
              }
            })
        } else {
          console.log('Currently on. Turning TV off')

          return harmonyClient.turnOff()
        }
      })
      .finally(function () {
        harmonyClient.end()
      })
  })
  .catch(function (e) {
    console.log(e)
  })
