/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// private methods ///
var utils = {

    arguments: function(leaf, state) {
        if(leaf.contextWrapped) {
            if(leaf.errorPosition < leaf.callbackPosition) {
                leaf.items.splice(leaf.errorPosition, 0, { type: "literal", subtype: "code", value: "arguments[1]" });

                if(leaf.callbackPosition != -1) leaf.items.splice(leaf.callbackPosition, 0, { type: "literal", subtype: "code", value: "arguments[0]" });
                else leaf.items.push({ type: "literal", subtype: "code", value: "arguments[0]" });
            }
            else {
                if(leaf.callbackPosition != -1) leaf.items.splice(leaf.callbackPosition, 0, { type: "literal", subtype: "code", value: "arguments[0]" });
                else leaf.items.push({ type: "literal", subtype: "code", value: "arguments[0]" });

                if(leaf.errorPosition != -1) leaf.items.splice(leaf.errorPosition, 0, { type: "literal", subtype: "code", value: "arguments[1]" });
            }
            state.print("(");
        }
        else {
            if (leaf.callbackPosition != -1) {
                if (leaf.errorPosition != -1) {
                    state.print(".wrap(" + leaf.callbackPosition + ", ");
                    state.print(leaf.errorPosition + (leaf.items.length > 0 ? ", " : ''));
                }
                else if (leaf.callbackPosition != 0 || leaf.items.length > 0) {
                    state.print(".task(" + leaf.callbackPosition + ", ");
                }
                else state.print("(");
            }
            else if (leaf.errorPosition != -1) {
                state.print(".wrap(" + (leaf.items.length + 1) + ", ");
                state.print(leaf.errorPosition + (leaf.errorPosition !== 0 ? ", " : ""));
            }
            else state.print("(");
        }

        for(var i = 0; i < leaf.items.length; ++i) {
            state.processor.leaf(leaf.items[i], state);
            if(i != leaf.items.length - 1) state.print(', ');
        }

        state.print(")");
    }

};

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "taskArguments";
    },

    process: function(leaf, state) {
        utils.arguments(leaf, state);
    }

};