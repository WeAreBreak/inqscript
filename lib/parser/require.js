/**
 * While Statement Processor for the CellScript Parser
 */

var parserUtils = require("js-parser-utils"),
    validators = parserUtils.validators,
    utils = parserUtils.utils;

var constants = {
    startCharacters: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$ÀÈÌÒÙàèìòùÁÉÍÓÚÝáéíóúýÂÊÎÔÛâêîôûÃÑÕãñõÄËÏÖÜäëïöüçÇßØøÅåÆæÞþÐð",
    partCharacters: "\u005F\u203F\u2040\u2054\uFE33\uFE34\uFE4D\uFE4E\uFE4F\uFF3F\u200C\u200D",
    digits: "0123456789"
};

constants.partCharacters = constants.startCharacters + constants.digits + constants.partCharacters;

/// methods ///
utils = utils.extend({

    colon: function(state) {
        if(state.token && state.token.type == ",") {
            state.next();
            return true;
        }
    },

    require_: function(state) {
        state.next(); //Skip cancel keyword.
    },

    as_: function(state) {
        if(state.token && state.token.type == "identifier" && state.token.data == "as") {
            state.next(); //Skip cancel keyword.
            return true;
        }
    },

    name: function(state) {
        state.item.name = "";
        if(validators.isIdentifier(state)) {
            state.item.name = state.token.data;
            state.next();
            return true;
        }
        else return false;
    },

    expression: function(state) {
        state.item.kindExpression = {};
        var item = state.item;

        state.prepareLeaf(state.item.kindExpression);
        if(!state.expressionProcessor.token(state, ["expression"])) {
            state.error("Unexpected token after require.");
            return false;
        }
        state.clearLeaf();

        state.item = item;
        return true;
    },

    kind: function(state) {
        state.item.kind = state.token.data;
        state.item.name = validators.getAsIdentifier(state.item.kind);
        state.next();
    }

});

validators = validators.extend({

    isRequire: function(state) {
        return state.token && state.token.type == "identifier" && state.token.data == "require"
    },

    isLookaheadStringLiteralOrIdentifier: function(state) {
        var lookahead = state.lookahead();
        return lookahead && (
            (lookahead.type == "literal" && lookahead.subtype == "string") ||
            (lookahead.type == "identifier"));
    },

    getAsIdentifier: function(token) {
        var lastSeparator = token.lastIndexOf('/');
        token = token.substring(lastSeparator != -1 ? (lastSeparator + 1) : 0).replace('.js', '');

        if(!token || constants.startCharacters.indexOf(token[0]) == -1) return false;

        for(var i = 0; i < token.length; ++i)
            if(constants.partCharacters.indexOf(token[i]) == -1)
                return false;

        return token;
    }

});

/// public interface ///
module.exports = {

    name: "inq/require.js",

    canProcess: function(state) {
        return validators.isRequire(state) && validators.isLookaheadStringLiteralOrIdentifier(state);
    },

    process: function(state) {
        var first = true;

        do {
            state.leaf();
            state.item.type = "require";

            if(first) utils.require_(state);
            utils.kind(state);

            if (utils.as_(state)) {
                if (!utils.name(state)) {
                    state.error("Unexpected token after as.");
                    return false;
                }
            }
            else if (!state.item.name) {
                state.error("You must provide a name in the require statement, when the library name cannot be used as an identifier.");
                return false;
            }

            first = false;
        }
        while(utils.colon(state));

        //utils.semicolonNonTerminal(state);
    }

};