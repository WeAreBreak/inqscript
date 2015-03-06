/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type == "unary" && leaf.subtype === "bound";
    },

    process: function(leaf, state) {
        state.print("inq.bound(");
        state.processor.level(leaf.items, state);
        state.print(")")
    }

};