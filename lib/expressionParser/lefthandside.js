/**
 * LeftHandSide Processor Extension for InqScript
 */

/// constants ///
var constants = {
    callbackPlaceholderSignCharacter: "%",
    errorPlaceholderSignCharacter: "#",
    argumentSeparatorCharacter: ",",
    argumentsEndCharacter: ")",
    boundIdentifier: "bound"
};

/// methods ///
var overrides = {

    argumentItem: function(state, args, index) {
        if(validators.isCallbackPlaceholderSign(state)) {
            if(!state.hasScope("await", true)) return false;
            if(args.callbackPosition != -1) return false;
            args.callbackPosition = index;
            state.next();
        }
        else if(validators.isErrorPlaceholderSign(state)) {
            if(!state.hasScope("await", true)) return false;
            if(args.errorPosition != -1) return false;
            args.errorPosition = index;
            state.next();
        }
        else {
            return original.argumentItem(state);
        }

        if(validators.isArgumentSeparator(state)) {
            state.next();
            return true;
        }

        return validators.isArgumentsEnd(state);
    },

    arguments: function(state) {
        state.next(); //Skip arguments start.

        state.leaf();
        state.item.type = "arguments";

        var args = state.item;
        state.levelDown();
            var index = 0;
            state.item.callbackPosition = state.item.errorPosition = -1;
            while(!validators.isArgumentsEnd(state)) {
                if(!overrides.argumentItem(state, args, index++)) return false;
            }
        state.levelUp();

        if(args.callbackPosition != -1 || args.errorPosition != -1) {
            args.type = "taskArguments";
        }

        state.next(); //Skip arguments end.
        return true;
    },

    new_: function(state) {
        var item = state.item;

        state.leaf();
        state.item.type = "new";
        state.next();

        if(validators.isBound(state)) {
            item.bound = true;
            state.next();
        }
    }

};

var validators = {

    isArgumentsEnd: function(state) {
        return state.token && state.token.type === constants.argumentsEndCharacter;
    },

    isArgumentSeparator: function(state) {
        return state.token && state.token.data === constants.argumentSeparatorCharacter;
    },

    isCallbackPlaceholderSign: function(state) {
        return state.token && state.token.type === constants.callbackPlaceholderSignCharacter;
    },

    isErrorPlaceholderSign: function(state) {
        return state.token && state.token.type === constants.errorPlaceholderSignCharacter;
    },

    isBound: function(state) {
        return state.token && state.token.type === "keyword" && state.token.data === constants.boundIdentifier;
    }

};

var original;
var utils;

/// public interface ///
module.exports = {

    methods: {
        process: function(state, _utils) {
            if(!original) {
                original = {
                    argumentItem: _utils.argumentItem,
                    arguments: _utils.arguments,
                    new_: _utils.new_
                };

                _utils.argumentItem = overrides.argumentItem;
                _utils.arguments = overrides.arguments;
                _utils.new_ = overrides.new_;
                utils = _utils;
            }
        }
    }

};