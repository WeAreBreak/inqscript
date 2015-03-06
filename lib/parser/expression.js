/**
 * Expression Statement Processor for the InqScript Parser
 */

var parserUtils = require("js-parser-utils"),
    validators = parserUtils.validators;

validators = validators.extend({

    isAbort: function(state) {
        return state.token && state.token.type == "identifier" && state.token.data == "abort"
    },

    isRequire: function(state) {
        return state.token && state.token.type == "identifier" && state.token.data == "require"
    },

    isLookaheadStringLiteralOrIdentifier: function(state) {
        var lookahead = state.lookahead();
        return lookahead && (
            (lookahead.type == "literal" && lookahead.subtype == "string") ||
            (lookahead.type == "identifier"));
    },

    isLookaheadIdentifier: function(state) {
        var lookahead = state.lookahead();
        return lookahead && lookahead.type == "identifier"
    }

});

/// public interface ///
module.exports = {

    methods: {
        canProcess: function (state) {
            if (validators.isGeneratorSign(state)) return false;
            if (validators.isAbort(state) && validators.isLookaheadIdentifier(state)) return false;
            if (validators.isRequire(state) && validators.isLookaheadStringLiteralOrIdentifier(state)) return false;
        }
    }

};