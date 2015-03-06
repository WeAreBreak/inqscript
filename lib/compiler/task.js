/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "unary" && leaf.subtype == "task";
    },

    process: function(leaf, state) {
        //console.log("LEAF T", leaf);

        //Find identifier and arguments
        var original = leaf;
        while(leaf.items.length < 2) {
            leaf = leaf.items[0];
        }

        var argumentsExpression = leaf.items.pop();
        if(argumentsExpression) var functionName = leaf.items.pop();
        var memberExpressions = leaf.items;
        leaf = original;

        state.processor.level(memberExpressions, state);
        if(functionName) state.processor.leaf(functionName, state);
        if(memberExpressions.length && leaf.bound) {
            state.print(".bind(");
            state.processor.level(memberExpressions, state);
            state.print(")");
        }
        state.print(".inq");
        state.processor.leaf(argumentsExpression, state);

        while(leaf.awaitExpressions && leaf.awaitExpressions.length) {
            var expr = leaf.awaitExpressions.shift();
            state.print("." + expr.awaitModifier + "(");
            state.processor.leaf(expr, state);
            if(expr.awaitModifier == "retry") {
                if(leaf.awaitExpressions.length && leaf.awaitExpressions[0].awaitModifier == "backoff") {
                    expr = leaf.awaitExpressions.shift();
                    state.print(", ");
                    state.processor.leaf(expr, state);
                }
            }
            state.print(")");
        }
    }

};