module.exports = function (RED) {

  function SetScheduleNode(config) {
    const retry = require("../../lib/retry");
    RED.nodes.createNode(this, config);

    this.api = RED.nodes.getNode(config.api);

    if (!this.api) {
      this.status({fill: "grey", shape: "ring", text: `No API node configured`})
      return;
    }

    const mysolix = this.api.mysolix;

    this.api.init()
      .then(() => this.status({fill: "blue", shape: "ring", text: "intialized"}))
      .catch((e) => this.status({fill: "red", shape: "dot", text: `Login failed: ${e}`}));


    const r = retry()

    this.on('input', async (msg) => {
      try {
        this.status({fill: "yellow", shape: "dot", text: "setting schedule"});
        await r(() => mysolix.setSchedule(msg.payload), e => {
          this.status({fill: "yellow", shape: "dot", text: "Retrying to set schedule:" + e});
        });

        this.status({fill: "yellow", shape: "dot", text: "retrieving schedule"});

        const payload = await r(() => mysolix.getSchedule(), e => {
          this.status({fill: "yellow", shape: "dot", text: "Retrying to retrieve schedule:" + e});
        });

        this.status({fill: "green", shape: "dot", text: `last written at ${new Date().toLocaleTimeString()}`});
        this.send([{payload}]);
      } catch (e) {
        this.status({fill: "red", shape: "dot", text: "Failed:" + e});
      }
    });
  }

  RED.nodes.registerType("Solix | Set Schedule", SetScheduleNode);
}
