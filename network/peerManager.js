const EventEmitter = require('events');

/**
 *
 * @param Storage
 * @param Constants
 * @param PeerInfo
 * @param Peer
 * @return {{new(*=): PeerManager}}
 *
 * @emits 'message' {peer, message}
 */
module.exports = (Storage, Constants, {PeerInfo}, Peer) =>
    class PeerManager extends EventEmitter {
        constructor(options = {}) {
            super();
            const {transport} = options;

            this._transport = transport;

            // TODO: add load all peers from persistent store
            // keys - addesses, values - {timestamp of last peer action, PeerInfo}
            this._allPeers = new Map();
        }

        get connectedCount() {
            return this._allPeers.reduce((total, peer) => total + peer.disconnected ? 0 : 1, 0);
        }

        /**
         *
         * @param {Object | PeerInfo | Peer} peer
         * @return {Peer}
         */
        addPeer(peer) {
            if (!(peer instanceof Peer)) peer = new Peer({peerInfo: peer, transport: this._transport});
            const key = this._createKey(peer.address);

//            if (this._allPeers.has(key)) {
//                const existingPeer=this._allPeers.get(key);
//                if(existingPeer.disconnected){
//                    existingPeer.connection=peer.connection;
//                }
//                return existingPeer;
//            }

            peer.on('message', this._incomingMessage.bind(this));
            if (peer.isWitness) {
                peer.on('witnessMessage', this._incomingMessage.bind(this));
            }
            this._allPeers.set(key, peer);
            return peer;
        }

        /**
         *
         * @param {Peer} thisPeer
         * @param {MessageCommon} msg
         * @private
         */
        _incomingMessage(thisPeer, msg) {
            if (msg.signature) {

                // if message signed: check signature
                if (thisPeer.isWitness && msg.verifySignature(thisPeer.publicKey)) {
                    this.emit('witnessMessage', thisPeer, msg);
                } else {
                    this.emit('witnessMessage', thisPeer, undefined);
                }
            } else {

                // just bubble message to Node
                this.emit('message', thisPeer, msg);
            }
        }

        /**
         *
         * @param {Number} service - @see Constants
         * @return {Array} of Peers
         */
        filterPeers({service} = {}) {
            const arrResult = [];
            const tsAlive = Date.now() - Constants.PEER_DEAD_TIME;

            // TODO: подумать над тем как хранить в Map для более быстрой фильтрации
            for (let [, peer] of this._allPeers.entries()) {
                if (!service ||
                    ~peer.capabilities.findIndex(nodeCapability => nodeCapability.service === service)) {
                    if (peer.lastActionTimestamp > tsAlive) {
                        arrResult.push(peer);
                    }
                }
            }

            return arrResult;
        }

        broadcastToConnected() {

        }

        /**
         *
         * @param {Buffer} address
         * @return {string}
         * @private
         */
        _createKey(address) {

            // TODO: implement own key/value store to use binary keys. Maps doesn't work since it's use === operator for keys, now we convert to String. it's memory consuming!
            return address.toString('hex');
        }
    };
