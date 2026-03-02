const retry = require("../../lib/retry");
module.exports = function (RED) {

  function GetEnergyAnalysisNode(config) {
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


      const r = retry({
          onRetry: (e) => {
              this.status({fill: "yellow", shape: "dot", text: "Retrying:" + e});
          }
      })

    this.on('input', async (msg) => {
        try {
            this.status({fill: "yellow", shape: "dot", text: "reading"});

            const siteId = msg.payload?.siteId ?? msg.payload?.site_id ?? await mysolix.getSiteId();
            const payload = await r(() => mysolix.raw('powerServices', 'energyAnalysis', [siteId, msg.payload]));

            this.status({fill: "green", shape: "dot", text: `last read at ${new Date().toLocaleTimeString()}`});
            this.send([{payload}]);
        } catch (e) {
            this.status({fill: "red", shape: "dot", text: "Failed:" + e});
        }
    });
  }

  RED.nodes.registerType("Solix | Read Energy Analysis", GetEnergyAnalysisNode);
}
