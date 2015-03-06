/**
 * While Statement Processor for the CellScript Parser
 */

var parserUtils = require("js-parser-utils"),
    validators = parserUtils.validators,
    constants = parserUtils.constants,
    utils = parserUtils.utils;

/// methods ///
utils = utils.extend({

    abort_: function(state) {
        state.next(); //Skip cancel keyword.
    },

    name: function(state, optional) {
        state.item.name = "";
        if(validators.isIdentifier(state)) {
            state.item.name = state.token.data;
            state.next();
            return true;
        }
        else if(state.scope !== "value") {
            if(optional) return false;
            else return state.error(constants.unexpectedToken);
        }
    }

});

validators = validators.extend({

    isAbort: function(state) {
        return state.token && state.token.type == "identifier" && state.token.data == "abort"
    },

    isLookaheadIdentifier: function(state) {
        var lookahead = state.lookahead();
        return lookahead && lookahead.type == "identifier"
    }

});

/// public interface ///
module.exports = {

    name: "inq/abort.js",

    canProcess: function(state) {
        return validators.isAbort(state) && validators.isLookaheadIdentifier(state);
    },

    process: function(state) {
        state.leaf();
        state.item.type = "abort";

        utils.abort_(state);
        utils.name(state);
        utils.semicolonNonTerminal(state);
    }

};