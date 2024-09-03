module.exports = function (RED) {
  function Reader(config) {
    const SolixE1600 = require('./SolixE1600.js');
    RED.nodes.createNode(this, config);

    const node = this;
    const mysolix = new SolixE1600(config);

    mysolix._init().then(async function () {
      const solixconfig = mysolix.getSessionConfiguration();
      node.setItem("sessionconfig", solixconfig);
      node.status({fill: "green", shape: "dot", text: ""});
    }).catch(function (e) {
      node.status({fill: "red", shape: "dot", text: "Login failed:" + e});
    })

    const setSchedule = async (schedule) => {
      if (typeof schedule == 'object') {
        await mysolix.setSchedule(schedule);
      }
    }

    node.on('input', async function (msg) {
      try {
        node.status({fill: "green", shape: "dot", text: ""});
        const [sitemap, schedule] = await Promise.all([
          mysolix.getSitehomepage(),
          mysolix.getSchedule(),
          setSchedule(msg.payload),
        ]);
        node.send([{payload: sitemap}, {payload: schedule}]);
      } catch (e) {
        console.log(e);
        node.status({fill: "red", shape: "dot", text: "Failed:" + e});
      }
    });
  }

  RED.nodes.registerType("E1600", Reader);
}
