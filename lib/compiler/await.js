/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "unary" && leaf.subtype == "await";
    },

    process: function(leaf, state) {
        //console.log("LEAF A", leaf);

        //Find identifier and arguments
        var haveToWrap = true;
        if(leaf.items.length && leaf.items[0].subtype != "task") {
            var contextWrapped = leaf.items[0].type == "unary" && leaf.items[0].subtype == "=>";

            var original = leaf;
            while (leaf && leaf.items.length < 2) {
                leaf = leaf.items[0];
            }

            if (leaf && leaf.type != "literal") {
                if(leaf.items[leaf.items.length - 1].type == "arguments" || leaf.items[leaf.items.length - 1].type == "taskArguments") {
                    var argumentsExpression = leaf.items.pop();
                    if(argumentsExpression) var functionName = leaf.items.pop();
                }
                var memberExpressions = leaf.items;

                if(argumentsExpression) haveToWrap = false;
            }
            else {
                memberExpressions = original.items;
            }

            leaf = original;
        }
        else {
            memberExpressions = leaf.items;
            haveToWrap = false;
        }

        if(leaf.parallel) {
            haveToWrap = false;
        }

        if(contextWrapped) {
            if(!argumentsExpression) return state.error("Context Wrapped Await Expression used without a Function Call Operator. Did you mean a Lambda Expression? Then please group it...");
            argumentsExpression.contextWrapped = true;
            argumentsExpression.type = "taskArguments";
            haveToWrap = false;
        }

        //Compile the expression
        state.print("yield");
        switch(leaf.awaitTarget) {
            case "function":
                //state.print("* ");
                if(haveToWrap) {
                    state.print("* ");
                    state.print("inq.series(");
                }
                else {
                    state.meaningfulSpace();
                    //state.print("inq.delegated(");
                }

                //Context wrapped (using => operator)
                if(contextWrapped) {
                    state.print("(function() ");
                    state.println("{ ");
                    state.levelDown();

                    state.processor.level(memberExpressions, state);
                    if(functionName) state.processor.leaf(functionName, state);
                    if(memberExpressions.length && leaf.bound) {
                        state.print(".bind(");
                        state.processor.level(memberExpressions, state);
                        state.print(")");
                    }
                    state.processor.leaf(argumentsExpression, state);

                    state.levelUp();
                    state.line_break();
                    state.print(" }).inq()");

                    if(argumentsExpression.errorPosition != -1) {
                        state.print(".wrap(0, ");
                        state.print("1)");
                    }
                }
                else {
                    state.processor.level(memberExpressions, state);

                    //Inline Task Clause
                    if (argumentsExpression) {
                        if (functionName) state.processor.leaf(functionName, state);
                        if (memberExpressions.length && leaf.bound) {
                            state.print(".bind(");
                            state.processor.level(memberExpressions, state);
                            state.print(")");
                        }
                        if (!leaf.parallel) state.print(".inq");
                        state.processor.leaf(argumentsExpression, state);
                    }
                }

                leaf.awaitExpressions.forEach(function(expr) {
                    state.print("." + expr.awaitModifier + "(");
                    state.processor.leaf(expr, state);
                    state.print(")");
                });

                //state.print(")");
                if(haveToWrap) state.print(")");
                break;

            case "generator":
                state.print("* ");

                state.processor.level(memberExpressions, state);

                //Inline Task Clause
                if(functionName) state.processor.leaf(functionName, state);
                if(argumentsExpression) state.processor.leaf(argumentsExpression, state);

                leaf.awaitExpressions.forEach(function(expr) {
                    console.warn("[WARNING] In this version of the compiler " + expr.awaitModifier + " modifier is not supported on awaited generators.");
                });
                break;

            default:
                state.error("Unsupported await target: " + leaf.awaitTarget);
                break;
        }
    }

};