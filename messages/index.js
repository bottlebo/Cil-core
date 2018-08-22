const MsgCommonWrapper = require('./msgCommon');

const MsgAddrWrapper = require('./node/msgAddr');
const MsgVersionWrapper = require('./node/msgVersion');
const MsgRejectWrapper = require('./node/msgReject');
const MsgBlockWrapper = require('./node/msgBlock');

const PeerInfoWrapper = require('./includes/peerInfo');

const MsgWitnessCommonWrapper = require('./witness/msgWitnessCommon.js');
const MsgWitnessNextRoundWrapper = require('./witness/msgWitnessNextRound.js');
const MsgWitnessWitnessExposeWrapper = require('./witness/msgWitnessExpose.js');

module.exports = (Constants, Crypto, Block, Transaction, objPrototypes) => {

    const {messageProto, versionPayloadProto, addrPayloadProto, rejectPayloadProto} = objPrototypes;
    const {witnessMessageProto, witnessNextRoundProto} = objPrototypes;
    const {peerInfoProto} = objPrototypes;

    const MsgCommon = MsgCommonWrapper(Constants, Crypto, messageProto);
    const MsgWitnessCommon = MsgWitnessCommonWrapper(Constants, Crypto, MsgCommon, witnessMessageProto);

    return {
        MsgCommon,
        MsgVersion: MsgVersionWrapper(Constants, MsgCommon, versionPayloadProto),
        MsgAddr: MsgAddrWrapper(Constants, MsgCommon, addrPayloadProto),
        MsgReject: MsgRejectWrapper(Constants, MsgCommon, rejectPayloadProto),
        MsgBlock: MsgBlockWrapper(Constants, Crypto, MsgCommon, Block),

        PeerInfo: PeerInfoWrapper(Constants, peerInfoProto),

        MsgWitnessCommon,
        MsgWitnessNextRound: MsgWitnessNextRoundWrapper(Constants, Crypto, MsgWitnessCommon, witnessNextRoundProto),
        MsgWitnessWitnessExpose: MsgWitnessWitnessExposeWrapper(Constants, Crypto, MsgWitnessCommon)
    };
};