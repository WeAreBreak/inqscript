/**
 * Function Declaration Processor for the CellScript Parser
 */

/// constants ///
var constants = {
    prefixKeywords: [ "await", "wait", "task", "bound" ],
    generatorSignCharacter: "*",
    taskKeyword: "task",
    asyncKeyword: "async",
    parallelIdentifier: "parallel",
    retryIdentifier: "retry",
    fallbackIdentifier: "fallback",
    concurrentIdentifier: "concurrent",
    boundIdentifier: "bound",
    unboundIdentifier: "unbound"
};

/// methods ///
var utils = {

    await_: function(state) {
        state.item.awaitTarget = "function";

        if(validators.isGeneratorSign(state) || validators.isAsync(state)) {
            state.item.awaitTarget = "generator";
            state.next();
        }
        else if(validators.isParallel(state)) {
            state.item.parallel = true;
            state.next();
        }

        state.item.bound = true;
        if(validators.isBound(state)) {
            state.next();
        }
        else if(validators.isUnbound(state)) {
            state.item.bound = false;
            state.next();
        }
    },

    unaryLambda: function(state, unary) {
        var awaited = state.hasScope("await", true);
        state.levelDown("function");
        state.levelDown("lambda");
        if(awaited) state.levelDown("await");
        if(!unary(state)) return false;
        if(awaited) state.levelUp();
        state.levelUp();
        state.levelUp();

        return true;
    },

    unaryAwaitOrTask: function(state, unary) {
        var await_ = state.item,
            subtype = await_.subtype;

        var awaitExpressions = await_.awaitExpressions = [];
        utils.await_(state);
        state.levelDown("await"); //TODO

        state.levelDown();
            if(!unary(state)) {
                if(await_.parallel) {
                    state.levelUp();
                    state.item.items = [];
                    state.levelUp();
                    state.previous(1);
                    state.previous(0);
                    state.next();
                    if(!state.expressionProcessor.token(state, ["lefthandside"])) return false;
                    state.levelUp();
                }
                else return false;
            }
        state.levelUp();

        state.levelUp();

        //Verify whether the provided expression is valid:
        // - task: FunctionCallExpression
        // - await: Expression
        if(subtype == "task") {
            var lastItem = await_.items[await_.items.length-1];
            while(lastItem && lastItem.type != "arguments" && lastItem.type != "taskArguments" ) {
                lastItem = lastItem.items[lastItem.items.length-1];
                if(!lastItem) {
                    state.error("Task Clause used without a Function Call Expression. Did you mean 'await ...'?");
                    return false;
                }
            }
        }

        var lastAppliedModifier = "";
        function modifier(kind) { //console.log(kind);
            if(!state.token || !state.token.type == "identifier" || state.token.data != kind) return true;

            var expr = {};
            lastAppliedModifier = expr.awaitModifier = state.token.data;

            state.next(); //Skip identifier

            state.prepareLeaf(expr);
            if (!state.expressionProcessor.token(state, ["assignment"])) return false;
            state.clearLeaf();

            awaitExpressions.push(expr);

            return true;
        }

        if(await_.parallel) {
            if(!modifier("timeout")) return false;
            if(!modifier("concurrent")) return false;
            if(!modifier("timeout")) return false;
        }
        else {
            if(!modifier("timeout")) return false;
            if(!modifier("retry")) return false;
            if(lastAppliedModifier == "retry") if(!modifier("backoff")) return false;
            if(!modifier("timeout")) return false;
            if(!modifier("fallback")) return false;
            if(!modifier("repeat")) return false;
        }

        if(state.token && state.token.data !== ";" && state.token.data !== "," && state.token.data !== "}" && state.token.data !== "]" && state.token.data !== ")") {
            state.warnLookback("Missing semicolon after await clause. This could cause incorrect behaviour if you use any of the following identifiers as variable names: retry, fallback or concurrent.");
        }

        return true;
    }

};

var validators = {

    isAsync: function(state) {
        return state.token && state.token.type === "keyword" && state.token.data === constants.asyncKeyword;
    },

    isRetry: function(state) {
        return state.token && state.token.type === "identifier" && state.token.data === constants.retryIdentifier;
    },

    isConcurrent: function(state) {
        return state.token && state.token.type === "identifier" && state.token.data === constants.concurrentIdentifier;
    },

    isFallback: function(state) {
        return state.token && state.token.type === "identifier" && state.token.data === constants.fallbackIdentifier;
    },

    isParallel: function(state) {
        return state.token && state.token.type === "identifier" && state.token.data === constants.parallelIdentifier;
    },

    isRetryOrFallback: function(state) {
        return validators.isRetry(state) || validators.isFallback(state);
    },

    isRetryOrFallbackOrConcurrent: function(state) {
        return validators.isRetry(state) || validators.isFallback(state) || validators.isConcurrent(state);
    },

    isGeneratorSign: function(state) {
        return state.token && state.token.type === constants.generatorSignCharacter;
    },

    isBound: function(state) {
        return state.token && state.token.type === "keyword" && state.token.data === constants.boundIdentifier;
    },

    isUnbound: function(state) {
        return state.token && state.token.type === "identifier" && state.token.data === constants.unboundIdentifier;
    }

};

/// public interface ///
module.exports = {

    constants: {
        prefixKeywords: constants.prefixKeywords
    },

    methods: {
        'await': utils.unaryAwaitOrTask,
        'task': utils.unaryAwaitOrTask,
        'lambda': utils.unaryLambda
    }

};