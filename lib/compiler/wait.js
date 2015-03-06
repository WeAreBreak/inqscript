/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "unary" && leaf.subtype == "wait";
    },

    process: function(leaf, state) {
        state.print("yield inq.wait(");
        state.processor.level(leaf.items, state);
        state.print(")");
    }

};