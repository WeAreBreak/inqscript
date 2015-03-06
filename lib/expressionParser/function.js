/**
 * Function Declaration Processor for the InqScript Parser
 */

/// constants ///
var constants = {
    asyncKeyword: "async"
};

/// methods ///
var utils = {

    async_: function(state) {
        if(validators.isAsyncKeyword(state)) {
            if(state.item.generator) {
                state.error("Unexpected token ILLEGAL.");
                return false;
            }
            state.item.generator = true;
            state.next();
        }
    }

};

var validators = {

    isAsyncKeyword: function(state) {
        return state.token && (state.token.type === "keyword" && state.token.data === constants.asyncKeyword);
    }

};

/// public interface ///
module.exports = {

    methods: {
        process: function(state) {
            return utils.async_(state);
        }
    }

};