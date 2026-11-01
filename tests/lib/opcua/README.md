# lib/opcua — OPC UA plant tags (0.8 IND.12 / CH.27)
DOM-free, no imports, Apache-2.0. `protocol.js` (messages, bounds, address policy, read only), `tags.js` (TagStore, trends, model-vs-plant Problems).
Connector: `tools/opcua/connector-core.mjs` + stdio `connector.mjs` (node-opcua 2.187.17, MIT; `cd tools/opcua && npm install`). Test server: `tools/opcua/test-server.mjs`.
Test: `node tools/opcua-test/test.mjs` (run from anywhere; 54 checks, a real server on loopback ports 48420-48422).
