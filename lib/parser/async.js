/**
 * While Statement Processor for the CellScript Parser
 */

var parserUtils = require("js-parser-utils"),
    validators = parserUtils.validators,
    constants = parserUtils.constants,
    utils = parserUtils.utils;

/// methods ///
utils = utils.extend({

    async_: function(state) {
        var inq_ = validators.isInq(state);
        if(!validators.isAsync(state) && !validators.isGeneratorSign(state) && !inq_) return state.error(constants.unexpectedToken);
        if(inq_) state.item.subtype = "inq";
        state.next(); //Skip async keyword.
    },

    statement: function(state) {
        state.item.statement = {};
        state.levelDown("async");
        state.prepareLeaf(state.item.statement);
        state.processor.token(state);
        state.clearLeaf();
        state.levelUp();
    },

    catchBlock: function (state) {
        if(!validators.isBlockStart(state)) return state.error("Missing block start.");
        state.next(); //Skip block start.

        var item = state.item;

        state.levelDown();
        state.leaf();
        state.item.type = "catch";
        utils.statementsInBlock(state);
        state.levelUp();

        state.item = item;

        state.next(); //Skip block end.
    },

    finallyBlock: function (state) {
        if(!validators.isBlockStart(state)) return state.error("Missing block start.");
        state.next(); //Skip block start.

        var item = state.item;

        state.levelDown();
        state.leaf();
        state.item.type = "finally";
        utils.statementsInBlock(state);
        state.levelUp();

        state.item = item;

        state.next(); //Skip block end.
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
    },

    blockName: function(state, optional) {
        state.item.asyncName = "";
        if(validators.isIdentifier(state)) {
            state.item.asyncName = state.token.data;
            state.next();
            return true;
        }
        else if(state.scope !== "value") {
            if(optional) return false;
            else return state.error(constants.unexpectedToken);
        }
    },

    segmentStart: function(state) {
        if(validators.isSegmentStart(state)) {
            state.next();
            return true;
        }

        state.error(constants.unexpectedToken);
        return false;
    },

    segmentEnd: function(state) {
        if(validators.isSegmentEnd(state)) {
            state.next();
            return true;
        }

        state.error(constants.unexpectedToken);
        return false;
    },

    catch_: function(state) {
        if(validators.isCatch(state)) {
            state.next();
            return true;
        }

        return false;
    },

    finally_: function(state) {
        if(validators.isFinally(state)) {
            state.next();
            return true;
        }

        return false;
    }

});

validators = validators.extend({

    isLookaheadBlockStart: function(state) {
        var lookahead = state.lookahead();
        return lookahead && lookahead.type == "{";
    }

});

/// public interface ///
module.exports = {

    name: "inq/async.js",
    tokenType: "keyword/"+constants.asyncKeyword,

    canProcess: function(state) {
        return validators.isAsync(state) || validators.isGeneratorSign(state);
    },

    process: function(state) {
        state.leaf();
        state.item.type = "async";

        utils.async_(state);

        if(validators.isLookaheadBlockStart(state)) {
            utils.blockName(state, true);
        }

        if(state.item.subtype == "inq") {
            if(!utils.name(state, true)) {
                if(state.token.data != ";") return state.error(constants.unexpectedToken);
                state.item.definition = true;
            }
        }
        else {
            state.levelDown("function");
            state.levelDown("generator");
            utils.statement(state);
            state.levelUp();
            state.levelUp();
        }

        if (utils.catch_(state)) {
            utils.segmentStart(state);
            utils.name(state);
            utils.segmentEnd(state);
            utils.catchBlock(state);
        }

        if (utils.finally_(state)) {
            utils.finallyBlock(state);
        }
    }

};