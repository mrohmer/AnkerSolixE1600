module.exports = function (RED) {
  function Reader(config) {
    const SolixE1600 = require('./SolixE1600.js');
    RED.nodes.createNode(this, config);

    const mysolix = new SolixE1600(config);

    const storeSessionConfig = () => {
      const solixconfig = mysolix.getSessionConfiguration();
      this.con("sessionconfig", solixconfig);
    }
    mysolix.init()
      .then(() => storeSessionConfig())
      .then(() => this.status({fill: "green", shape: "dot", text: ""}))
      .catch((e) => this.status({fill: "red", shape: "dot", text: `Login failed: ${e}`}));

    const setSchedule = async (schedule) => {
      if (typeof schedule == 'object') {
        await mysolix.setSchedule(schedule);
      }
    }

    this.on('input', async (msg) => {
      try {
        this.status({fill: "green", shape: "dot", text: ""});
        const [scenInfo, schedule] = await Promise.all([
          mysolix.getScenInfo(),
          mysolix.getSchedule(),
          setSchedule(msg.payload),
        ]);
        this.send([{payload: scenInfo}, {payload: schedule}]);
      } catch (e) {
        console.log(e);
        this.status({fill: "red", shape: "dot", text: "Failed:" + e});
      } finally {
        try {
          storeSessionConfig();
        } catch (e) {
          console.log(e);
        }
      }
    });
  }

  RED.nodes.registerType("E1600", Reader);
}
