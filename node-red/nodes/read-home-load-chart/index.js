module.exports = function (RED) {
  function ReadHomeLoadChartNode(config) {
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

    this.on('input', async () => {
      try {
        this.status({fill: "yellow", shape: "dot", text: "reading"});
        const payload = await mysolix.getHomeLoadChart();

        this.status({fill: "green", shape: "dot", text: `last read at ${new Date().toLocaleTimeString()}`});
        this.send([{payload}]);
      } catch (e) {
        this.status({fill: "red", shape: "dot", text: "Failed:" + e});
      }
    });
  }

  RED.nodes.registerType("Solix | Read Home Load Chart", ReadHomeLoadChartNode);
}
